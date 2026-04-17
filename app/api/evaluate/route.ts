import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { scenario, choices, profession } = await req.json();

  const choiceSummary = choices
    .map(
      (c: { stepNumber: number; situation: string; chosenBranch: { text: string; consequence: string } }) =>
        `Step ${c.stepNumber}: "${c.situation.slice(0, 100)}..." — Chose: "${c.chosenBranch.text}" — Result: "${c.chosenBranch.consequence}"`
    )
    .join("\n");

  const prompt = `You are Yoda. You have just watched a ${profession} work through a 4-step scenario. Evaluate their reasoning across the full arc.

The scenario: ${scenario.title}

Their choices:
${choiceSummary}

Speak as Yoda. Be specific. Reference their actual choices. Evaluate the pattern of reasoning across all four steps. Where they read the situation well. Where they missed what mattered. What this reveals about how they think under pressure.

Do not be vague. Do not give generic feedback. 4-6 sentences. Dense. No padding.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ evaluation: content.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
