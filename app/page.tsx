"use client";

import { useState } from "react";

interface Clue {
  id: number;
  text: string;
  isHinge: boolean;
  isDistractor: boolean;
}

interface Scenario {
  title: string;
  situation: string;
  clues: Clue[];
  question: string;
  correctDiagnosis: string;
  systematicMethod: string;
  keyPrinciple: string;
}

export default function HiveField() {
  const [profession, setProfession] = useState("Emergency Physician");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [hinting, setHinting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const generateScenario = async () => {
    setLoading(true);
    setScenario(null);
    setAnswer("");
    setFeedback("");
    setHint("");
    setSubmitted(false);
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession }),
      });
      const data = await res.json();
      setScenario(data);
    } catch {
      alert("Error generating scenario. Check your API key.");
    }
    setLoading(false);
  };

  const getHint = async () => {
    if (!scenario) return;
    setHinting(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          scenario,
          userAnswer: "",
          requestType: "hint",
        }),
      });
      const data = await res.json();
      setHint(data.feedback);
    } catch {
      alert("Error getting hint.");
    }
    setHinting(false);
  };

  const submitAnswer = async () => {
    if (!scenario || !answer.trim()) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession,
          scenario,
          userAnswer: answer,
          requestType: "evaluate",
        }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setSubmitted(true);
    } catch {
      alert("Error evaluating answer.");
    }
    setEvaluating(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">HiveField</h1>
        <p className="text-gray-400 text-sm">
          Reasoning training. Every scenario sharpens the pattern.
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          placeholder="Your profession"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-amber-400"
        />
        <button
          onClick={generateScenario}
          disabled={loading}
          className="bg-amber-400 text-gray-950 font-semibold px-6 py-2 rounded hover:bg-amber-300 disabled:opacity-50 transition"
        >
          {loading ? "Generating..." : "New Scenario"}
        </button>
      </div>

      {scenario && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
            <h2 className="text-amber-400 font-semibold text-lg mb-2">
              {scenario.title}
            </h2>
            <p className="text-gray-200 leading-relaxed">{scenario.situation}</p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide mb-3">
              Findings
            </h3>
            <ul className="space-y-2">
              {scenario.clues.map((clue) => (
                <li key={clue.id} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">›</span>
                  <span className="text-gray-200">{clue.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
            <p className="text-white font-medium mb-4">{scenario.question}</p>

            {!submitted && (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your assessment and plan..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-amber-400 resize-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={submitAnswer}
                    disabled={evaluating || !answer.trim()}
                    className="bg-amber-400 text-gray-950 font-semibold px-6 py-2 rounded hover:bg-amber-300 disabled:opacity-50 transition"
                  >
                    {evaluating ? "Evaluating..." : "Submit"}
                  </button>
                  <button
                    onClick={getHint}
                    disabled={hinting}
                    className="border border-gray-600 text-gray-300 px-6 py-2 rounded hover:border-amber-400 hover:text-amber-400 disabled:opacity-50 transition"
                  >
                    {hinting ? "Thinking..." : "Hint"}
                  </button>
                </div>
              </>
            )}

            {hint && !submitted && (
              <div className="mt-4 bg-gray-800 border border-amber-400/30 rounded p-4">
                <p className="text-amber-300 text-sm font-semibold mb-1">
                  Yoda says:
                </p>
                <p className="text-gray-200 text-sm leading-relaxed">{hint}</p>
              </div>
            )}
          </div>

          {feedback && (
            <div className="bg-gray-900 border border-amber-400/50 rounded-lg p-5">
              <h3 className="text-amber-400 font-semibold mb-3">Assessment</h3>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {feedback}
              </p>
              <button
                onClick={generateScenario}
                className="mt-4 bg-amber-400 text-gray-950 font-semibold px-6 py-2 rounded hover:bg-amber-300 transition"
              >
                Next Scenario
              </button>
            </div>
          )}
        </div>
      )}

      {!scenario && !loading && (
        <div className="text-center text-gray-600 mt-20">
          <p>Enter your profession and generate a scenario.</p>
          <p className="text-sm mt-1">
            Emergency physician by default. Any profession works.
          </p>
        </div>
      )}
    </main>
  );
}
