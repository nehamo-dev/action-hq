// Granola meeting notes integration

export interface GranolaMeeting {
  id: string;
  title: string;
  date: string;
  transcript: string;
  participants?: string[];
}

export function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

export function buildMeetingContext(meeting: GranolaMeeting): string {
  return `Meeting: ${meeting.title}
Date: ${meeting.date}
${meeting.participants?.length ? `Participants: ${meeting.participants.join(", ")}` : ""}

Notes/Transcript:
${meeting.transcript.slice(0, 5000)}`;
}
