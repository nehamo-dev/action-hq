import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function extractTasksFromText(
  text: string,
  sourceType: "email" | "meeting",
  sourceName: string,
  existingPatterns: string[] = []
): Promise<
  Array<{
    title: string;
    description: string;
    priority: "urgent" | "high" | "medium" | "low";
    confidence: number;
    dueDate?: string;
  }>
> {
  const patternContext =
    existingPatterns.length > 0
      ? `\n\nPreviously marked as NOT action items (avoid similar patterns):\n${existingPatterns.slice(0, 10).join("\n")}`
      : "";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Extract action items from this ${sourceType} content. Return ONLY a JSON array.

Source: ${sourceName}
Content:
${text}
${patternContext}

Rules:
- Only include genuine action items that require a response, decision, or task completion
- Skip FYIs, newsletters, automated notifications, and pure information
- Assign priority: urgent (deadline today/ASAP), high (this week), medium (soon), low (whenever)
- Confidence: 0.0-1.0 based on how clearly it's an action item
- dueDate: ISO date string if explicitly mentioned, otherwise omit

Return JSON array (or empty array [] if no action items):
[{"title":"...","description":"...","priority":"medium","confidence":0.85,"dueDate":"2024-01-15"}]`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") return [];

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

export async function generateDailyBriefing(
  tasks: Array<{ title: string; priority: string; status: string; createdAt: string }>,
  userName: string = "Neha"
): Promise<{ summary: string; themes: string[] }> {
  const pending = tasks.filter((t) => t.status === "pending");
  const urgent = pending.filter((t) => t.priority === "urgent");
  const weekOld = pending.filter(
    (t) => Date.now() - new Date(t.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Generate a warm, friendly daily briefing for ${userName}.

Tasks pending: ${pending.length}
Urgent tasks: ${urgent.length}
Tasks older than 7 days: ${weekOld.length}

Task titles: ${pending
          .slice(0, 20)
          .map((t) => t.title)
          .join(", ")}

Write 2-3 sentences. Be encouraging, warm, and specific. Identify the main theme/pattern in the tasks.
Also return top 3 themes as short labels.

Return JSON: {"summary": "Good morning, ${userName}! ...", "themes": ["Recruiting", "Partnerships", "Product"]}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") return { summary: `Good morning, ${userName}! You have ${pending.length} action items waiting.`, themes: [] };

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { summary: `Good morning, ${userName}!`, themes: [] };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { summary: `Good morning, ${userName}! You have ${pending.length} action items waiting.`, themes: [] };
  }
}

export async function searchTasksNaturalLanguage(
  query: string,
  tasks: Array<{ id: string; title: string; description?: string | null; sender?: string | null; sourceName?: string | null; createdAt: string }>
): Promise<string[]> {
  if (tasks.length === 0) return [];

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Find tasks matching this query: "${query}"

Tasks:
${tasks.map((t) => `ID:${t.id} | ${t.title} | from:${t.sender || t.sourceName || "unknown"} | ${t.createdAt.split("T")[0]}`).join("\n")}

Return only a JSON array of matching task IDs: ["id1","id2"]
If no matches, return []`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") return [];
  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}
