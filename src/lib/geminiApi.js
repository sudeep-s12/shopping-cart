// Gemini API helper for chatbot
// Usage: await askGemini(question)

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function askGemini(question) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    throw new Error("Gemini API key not set. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
  }
  const body = {
    contents: [{ parts: [{ text: question }] }],
  };
  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Gemini API error");
  const data = await res.json();
  // Gemini returns answer in data.candidates[0].content.parts[0].text
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't find an answer."
  );
}
