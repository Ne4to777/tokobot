/**
 * Diagnostic endpoint to test Groq API connectivity
 * Similar to test-yandex.ts but for Groq
 */

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export default async (req: any, res: any) => {
  const startTime = Date.now();
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // Check if API key is configured
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY not configured",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  }

  try {
    console.log("[TestGroq] Starting Groq API test...");
    const apiStartTime = Date.now();

    // Simple test prompt
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "user",
              content: "Say 'Hello from Groq!' in one sentence.",
            },
          ],
          max_tokens: 50,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(8000), // 8 second timeout
      }
    );

    const apiDuration = Date.now() - apiStartTime;
    console.log(`[TestGroq] Groq API responded in ${apiDuration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TestGroq] Groq API error: ${response.status}`, errorText);
      return res.status(response.status).json({
        error: "Groq API request failed",
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        duration: apiDuration,
        timestamp: new Date().toISOString(),
      });
    }

    const data = (await response.json()) as GroqResponse;
    const generatedText = data.choices?.[0]?.message?.content || "No response";

    const totalDuration = Date.now() - startTime;
    console.log(`[TestGroq] Total duration: ${totalDuration}ms`);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      hasApiKey: true,
      tests: [
        {
          name: "Groq API Connection",
          status: "SUCCESS",
          duration: apiDuration,
          model: "llama-3.1-70b-versatile",
          responsePreview: generatedText.substring(0, 100),
        },
      ],
      totalDuration,
      summary: {
        allTestsPassed: true,
        passedTests: 1,
        totalTests: 1,
      },
    });
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error("[TestGroq] Error:", error);

    return res.status(500).json({
      error: error.message || "Unknown error",
      errorName: error.name,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      stack: error.stack,
    });
  }
};
