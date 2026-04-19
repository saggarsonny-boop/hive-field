"use client";

import { useState } from "react";
import AutoDemo from "@/components/AutoDemo";
import FirstVisitCard from "@/components/FirstVisitCard";
import LanguageSelector, { getLang, withLang } from "@/components/LanguageSelector";

type Branch = {
  id: string;
  text: string;
  consequence: string;
  nextStepId: string | null;
};

type Step = {
  id: string;
  stepNumber: number;
  situation: string;
  clues: string[];
  hingeClue: string;
  distractor: string;
  branches: Branch[];
};

type Scenario = {
  id: string;
  profession: string;
  title: string;
  steps: Step[];
};

type UserChoice = {
  stepId: string;
  stepNumber: number;
  situation: string;
  chosenBranch: Branch;
};

type AppState =
  | { phase: "select" }
  | { phase: "loading" }
  | { phase: "playing"; scenario: Scenario; currentStep: Step; choices: UserChoice[] }
  | { phase: "consequence"; scenario: Scenario; consequence: string; nextStepId: string | null; choices: UserChoice[] }
  | { phase: "evaluating" }
  | { phase: "done"; evaluation: string; scenario: Scenario; choices: UserChoice[] }
  | { phase: "error"; message: string };

export default function HiveField() {
  const [profession, setProfession] = useState("");
  const [state, setState] = useState<AppState>({ phase: "select" });

  async function startScenario() {
    const trimmed = profession.trim();
    if (!trimmed) return;
    setState({ phase: "loading" });
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession: withLang(trimmed, getLang()) }),
      });
      if (!res.ok) {
        const text = await res.text();
        setState({ phase: "error", message: `API error ${res.status}: ${text}` });
        return;
      }
      const scenario: Scenario = await res.json();
      setState({ phase: "playing", scenario, currentStep: scenario.steps[0], choices: [] });
    } catch (err) {
      setState({ phase: "error", message: String(err) });
    }
  }

  function handleChoice(step: Step, branchId: string, scenario: Scenario, existingChoices: UserChoice[]) {
    const branch = step.branches.find((b) => b.id === branchId);
    if (!branch) return;
    const newChoice: UserChoice = {
      stepId: step.id,
      stepNumber: step.stepNumber,
      situation: step.situation,
      chosenBranch: branch,
    };
    setState({
      phase: "consequence",
      scenario,
      consequence: branch.consequence,
      nextStepId: branch.nextStepId,
      choices: [...existingChoices, newChoice],
    });
  }

  function advance(scenario: Scenario, nextStepId: string | null, choices: UserChoice[]) {
    if (!nextStepId) { evaluate(scenario, choices); return; }
    const nextStep = scenario.steps.find((s) => s.id === nextStepId);
    if (!nextStep) { evaluate(scenario, choices); return; }
    setState({ phase: "playing", scenario, currentStep: nextStep, choices });
  }

  async function evaluate(scenario: Scenario, choices: UserChoice[]) {
    setState({ phase: "evaluating" });
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, choices, profession, lang: getLang() }),
      });
      const data = await res.json();
      setState({ phase: "done", evaluation: data.evaluation, scenario, choices });
    } catch (err) {
      setState({ phase: "error", message: String(err) });
    }
  }

  function reset() {
    setState({ phase: "select" });
    setProfession("");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start px-4 py-12">
      <AutoDemo />
      <FirstVisitCard />
      <LanguageSelector />
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">HiveField</h1>
        <p className="text-gray-500 text-sm mb-10">Reasoning under pressure. Multi-step. No hand-holding.</p>

        {state.phase === "select" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your role or situation</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") startScenario(); }}
                placeholder="snake handler, anxious spouse, ICU nurse, hostage negotiator..."
                autoFocus
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-400"
              />
            </div>
            <button
              onClick={startScenario}
              disabled={!profession.trim()}
              className="w-full bg-amber-400 text-gray-950 font-semibold py-3 rounded-lg disabled:opacity-30 hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Start scenario
            </button>
          </div>
        )}

        {state.phase === "loading" && (
          <div className="text-gray-500 text-center py-20">Building your scenario...</div>
        )}

        {state.phase === "error" && (
          <div className="space-y-4">
            <p className="text-red-400 text-sm font-mono bg-gray-900 rounded p-4">{state.message}</p>
            <button
              onClick={reset}
              className="w-full bg-amber-400 text-gray-950 font-semibold py-3 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {state.phase === "playing" && (
          <div className="space-y-6">
            <div className="text-xs text-gray-600 uppercase tracking-widest">
              Step {state.currentStep.stepNumber} of {state.scenario.steps.length}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100 mb-3">{state.scenario.title}</h2>
              <p className="text-gray-300 leading-relaxed">{state.currentStep.situation}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 space-y-2">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Clues</p>
              {state.currentStep.clues.map((clue, i) => (
                <p key={i} className="text-sm text-gray-300">{clue}</p>
              ))}
              <p className="text-sm text-amber-400 mt-3">Hinge: {state.currentStep.hingeClue}</p>
              <p className="text-sm text-red-400 opacity-50 line-through mt-1">{state.currentStep.distractor}</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-600 uppercase tracking-widest">What do you do?</p>
              {state.currentStep.branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleChoice(state.currentStep, branch.id, state.scenario, state.choices)}
                  className="w-full text-left bg-gray-900 border border-gray-800 hover:border-gray-500 active:bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-200 transition-colors cursor-pointer"
                >
                  {branch.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.phase === "consequence" && (
          <div className="space-y-6">
            <p className="text-xs text-gray-600 uppercase tracking-widest">What happened</p>
            <p className="text-gray-200 leading-relaxed text-lg">{state.consequence}</p>
            <button
              onClick={() => advance(state.scenario, state.nextStepId, state.choices)}
              className="w-full bg-amber-400 text-gray-950 font-semibold py-3 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
            >
              {state.nextStepId ? "Continue" : "Get Coach's evaluation"}
            </button>
          </div>
        )}

        {state.phase === "evaluating" && (
          <div className="text-gray-500 text-center py-20">Coach is thinking...</div>
        )}

        {state.phase === "done" && (
          <div className="space-y-8">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Coach speaks</p>
              <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{state.evaluation}</p>
            </div>
            <div className="border-t border-gray-800 pt-6 space-y-2">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Your path</p>
              {state.choices.map((c) => (
                <div key={c.stepId} className="text-sm">
                  <span className="text-gray-600">Step {c.stepNumber}:</span>{" "}
                  <span className="text-gray-300">{c.chosenBranch.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={reset}
              className="w-full bg-amber-400 text-gray-950 font-semibold py-3 rounded-lg hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Run another scenario
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
