import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { profession, scenario, userAnswer, requestType } = await request.json();

  const isHint = requestType === "hint";

  const prompt = isHint
    ? `You are Yoda training a ${profession}. 
    
The scenario: ${scenario.situation}
The clues presented: ${scenario.clues.map((c: {text: string}) => c.text).join(", ")}
The systematic method for this profession: ${scenario.systematicMethod}

The student has not answered yet and wants a hint.

Give guidance WITHOUT giving the answer. Like Yoda would:
- Reference the systematic method by name
- Ask a question that directs their thinking
- Point to the field, not the answer
- Maximum 3 sentences
- Do not reveal what the correct diagnosis is`
    : `You are Yoda evaluating a ${profession}'s reasoning.

The scenario: ${scenario.situation}
The clues: ${scenario.clues.map((c: {text: string}) => c.text).join(", ")}
The correct answer: ${scenario.correctDiagnosis}
The systematic method: ${scenario.systematicMethod}
The key principle: ${scenario.keyPrinciple}

The student answered: "${userAnswer}"

Evaluate their reasoning. Be direct but not crushing. 
- Was their answer correct, partially correct, or incorrect?
- What did they see well?
- What did they miss?
- Which clue was the hinge and why?
- Which was the distractor and why?
- Reinforce the systematic method
- End with one principle they should carry forward

Do not just give the answer next time. Teach the pattern of thinking.
Maximum 200 words.`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Invalid response" }, { status: 500 });
  }

  return NextResponse.json({ feedback: content.text });
}
