import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { profession } = await request.json();

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a scenario generator for HiveField. Generate a scenario for a ${profession}. Return ONLY raw JSON, no markdown, no code blocks. Use this exact structure: {"title":"...","situation":"...","clues":[{"id":1,"text":"...","isHinge":false,"isDistractor":false},{"id":2,"text":"...","isHinge":false,"isDistractor":false},{"id":3,"text":"...","isHinge":true,"isDistractor":false},{"id":4,"text":"...","isHinge":false,"isDistractor":true},{"id":5,"text":"...","isHinge":false,"isDistractor":false}],"question":"What is happening and what do you do?","correctDiagnosis":"...","systematicMethod":"...","keyPrinciple":"..."}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Invalid response" }, { status: 500 });
  }

  const cleaned = content.text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const scenario = JSON.parse(cleaned);
    if (!scenario.clues || !Array.isArray(scenario.clues)) {
      return NextResponse.json({ error: "Missing clues" }, { status: 500 });
    }
    return NextResponse.json(scenario);
  } catch (e) {
    console.error("Raw response:", content.text);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
