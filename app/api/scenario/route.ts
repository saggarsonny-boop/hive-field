import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { profession } = await req.json();

  const prompt = `You are generating a multi-step branching reasoning scenario for a ${profession}.

Generate a scenario with exactly 4 steps. Each step presents a situation that evolves. The scenario should feel like a real unfolding case.

Return ONLY valid JSON. No markdown, no explanation, no backticks. Exactly this structure:

{
  "id": "unique-id-string",
  "profession": "${profession}",
  "title": "Brief case title",
  "steps": [
    {
      "id": "step-1",
      "stepNumber": 1,
      "situation": "What is happening right now. Specific and concrete.",
      "clues": ["clue 1", "clue 2", "clue 3"],
      "hingeClue": "The single most important clue that changes everything",
      "distractor": "A plausible-sounding but misleading piece of information",
      "branches": [
        {
          "id": "1a",
          "text": "Option A",
          "consequence": "What happens immediately after this choice. 1-2 sentences.",
          "nextStepId": "step-2"
        },
        {
          "id": "1b",
          "text": "Option B",
          "consequence": "What happens immediately after this choice. 1-2 sentences.",
          "nextStepId": "step-2"
        },
        {
          "id": "1c",
          "text": "Option C",
          "consequence": "What happens immediately after this choice. 1-2 sentences.",
          "nextStepId": "step-2"
        }
      ]
    },
    {
      "id": "step-2",
      "stepNumber": 2,
      "situation": "Situation has evolved. Things have changed.",
      "clues": ["clue 1", "clue 2", "clue 3"],
      "hingeClue": "The single most important clue",
      "distractor": "A plausible but misleading detail",
      "branches": [
        {
          "id": "2a",
          "text": "Option A",
          "consequence": "Immediate consequence.",
          "nextStepId": "step-3"
        },
        {
          "id": "2b",
          "text": "Option B",
          "consequence": "Immediate consequence.",
          "nextStepId": "step-3"
        },
        {
          "id": "2c",
          "text": "Option C",
          "consequence": "Immediate consequence.",
          "nextStepId": "step-3"
        }
      ]
    },
    {
      "id": "step-3",
      "stepNumber": 3,
      "situation": "A complication or new development. Stakes are clearer now.",
      "clues": ["clue 1", "clue 2", "clue 3"],
      "hingeClue": "The single most important clue",
      "distractor": "A plausible but misleading detail",
      "branches": [
        {
          "id": "3a",
          "text": "Option A",
          "consequence": "Immediate consequence.",
          "nextStepId": "step-4"
        },
        {
          "id": "3b",
          "text": "Option B",
          "consequence": "Immediate consequence.",
          "nextStepId": "step-4"
        },
        {
          "id": "3c",
          "text": "Option C",
          "consequence": "Immediate consequence.",
          "nextStepId": "step-4"
        }
      ]
    },
    {
      "id": "step-4",
      "stepNumber": 4,
      "situation": "The resolution moment. Final decision that determines the outcome.",
      "clues": ["clue 1", "clue 2", "clue 3"],
      "hingeClue": "The single most important clue",
      "distractor": "A plausible but misleading detail",
      "branches": [
        {
          "id": "4a",
          "text": "Option A",
          "consequence": "Final outcome A.",
          "nextStepId": null
        },
        {
          "id": "4b",
          "text": "Option B",
          "consequence": "Final outcome B.",
          "nextStepId": null
        },
        {
          "id": "4c",
          "text": "Option C",
          "consequence": "Final outcome C.",
          "nextStepId": null
        }
      ]
    }
  ]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    const text = content.text.replace(/```json|```/g, "").trim();
    const scenario = JSON.parse(text);
    return NextResponse.json(scenario);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate scenario" }, { status: 500 });
  }
}
