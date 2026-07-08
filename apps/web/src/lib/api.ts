const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";
const AI_ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_AI_ORCHESTRATOR_URL || "http://127.0.0.1:8001";

export interface Person {
  id: string;
  name: string;
  date_of_birth: string | null;
  place_of_birth: string | null;
  gender: string | null;
  created_at: string;
}

export interface ChatResponse {
  response: string;
}

export async function getPerson(personId: string): Promise<Person> {
  const res = await fetch(`${BACKEND_API_URL}/persons/${personId}`);
  if (!res.ok) throw new Error("Failed to fetch person");
  return res.json();
}

export async function sendChatMessage(personId: string, message: string): Promise<ChatResponse> {
  const res = await fetch(`${AI_ORCHESTRATOR_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ person_id: personId, message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}