// Gemini API helper for chatbot
// Usage: await askGemini(question)

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function askGemini(question) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    console.error("Gemini API key not set. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
    throw new Error("Gemini API key not configured");
  }

  try {
    const body = {
      contents: [{ parts: [{ text: question }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    };

    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Gemini API response:", data);

    // Gemini returns answer in data.candidates[0].content.parts[0].text
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!answer) {
      console.error("No answer in Gemini response:", data);
      throw new Error("No answer returned from Gemini");
    }

    return answer;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
