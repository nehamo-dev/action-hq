// Gmail integration via the Gmail MCP server
// Reads threads from yesterday and extracts action items

export interface GmailThread {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
  link: string;
  body: string;
}

export function getYesterdayDateRange(): { start: string; end: string } {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const end = new Date(yesterday);
  end.setHours(23, 59, 59, 999);
  return {
    start: yesterday.toISOString(),
    end: end.toISOString(),
  };
}

export function buildGmailQuery(): string {
  const { start } = getYesterdayDateRange();
  const d = new Date(start);
  // Gmail search format: after:YYYY/MM/DD before:YYYY/MM/DD
  const fmt = (date: Date) =>
    `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  const tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `after:${fmt(d)} before:${fmt(tomorrow)} -category:promotions -category:social -unsubscribe`;
}

export function parseThreadForExtraction(thread: {
  id?: string;
  subject?: string;
  messages?: Array<{ from?: string; date?: string; body?: string; snippet?: string }>;
}): GmailThread | null {
  if (!thread.messages?.length) return null;
  const latest = thread.messages[thread.messages.length - 1];
  const first = thread.messages[0];

  return {
    id: thread.id || String(Date.now()),
    subject: thread.subject || "(no subject)",
    sender: first?.from || "unknown",
    snippet: latest?.snippet || latest?.body?.slice(0, 200) || "",
    date: latest?.date || new Date().toISOString(),
    link: `https://mail.google.com/mail/u/0/#inbox/${thread.id}`,
    body: thread.messages
      .map((m) => `From: ${m.from}\n${m.body || m.snippet || ""}`)
      .join("\n\n---\n\n")
      .slice(0, 4000),
  };
}
