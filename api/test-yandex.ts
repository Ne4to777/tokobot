/**
 * Diagnostic endpoint to test YandexGPT API connectivity
 * This will help us understand if the issue is IP-based blocking
 */

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    hasApiKey: !!process.env.YANDEX_API_KEY,
    hasFolderId: !!process.env.YANDEX_FOLDER_ID,
    tests: [],
  };

  try {
    // Test 1: Simple fetch to YandexGPT API
    console.log("🔍 Test 1: Checking YandexGPT API connectivity...");
    const test1Start = Date.now();

    const apiKey = process.env.YANDEX_API_KEY;
    const folderId = process.env.YANDEX_FOLDER_ID;

    if (!apiKey || !folderId) {
      diagnostics.tests.push({
        name: "Environment Variables",
        status: "FAILED",
        error: "YANDEX_API_KEY or YANDEX_FOLDER_ID not set",
      });
      return res.status(500).json(diagnostics);
    }

    // Simple prompt for testing
    const testPrompt = "Привет!";

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.log("⏰ Request timeout after 9 seconds");
      controller.abort();
    }, 9000); // 9 seconds (before Vercel's 10s limit)

    try {
      console.log("📤 Sending test request to YandexGPT...");
      const response = await fetch(
        "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
        {
          method: "POST",
          headers: {
            Authorization: `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
            "x-folder-id": folderId,
          },
          body: JSON.stringify({
            modelUri: `gpt://${folderId}/yandexgpt-lite`,
            completionOptions: {
              stream: false,
              temperature: 0.6,
              maxTokens: "50",
            },
            messages: [
              {
                role: "user",
                text: testPrompt,
              },
            ],
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);
      const test1Duration = Date.now() - test1Start;

      console.log(`✅ Response received in ${test1Duration}ms`);
      console.log(`📊 Status: ${response.status}`);

      const responseBody = await response.text();
      console.log(`📦 Response body: ${responseBody.substring(0, 200)}...`);

      diagnostics.tests.push({
        name: "YandexGPT API Connection",
        status: response.ok ? "SUCCESS" : "FAILED",
        statusCode: response.status,
        duration: test1Duration,
        responsePreview: responseBody.substring(0, 200),
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.ok) {
        try {
          const data = JSON.parse(responseBody);
          diagnostics.tests.push({
            name: "Response Parsing",
            status: "SUCCESS",
            hasResult: !!data.result,
            hasAlternatives: !!data.result?.alternatives,
            hasMessage: !!data.result?.alternatives?.[0]?.message,
            messageText:
              data.result?.alternatives?.[0]?.message?.text?.substring(0, 100),
          });
        } catch (parseError) {
          diagnostics.tests.push({
            name: "Response Parsing",
            status: "FAILED",
            error:
              parseError instanceof Error
                ? parseError.message
                : "Unknown error",
          });
        }
      }
    } catch (fetchError) {
      clearTimeout(timeout);
      const test1Duration = Date.now() - test1Start;

      console.error("❌ Fetch error:", fetchError);

      diagnostics.tests.push({
        name: "YandexGPT API Connection",
        status: "FAILED",
        duration: test1Duration,
        error:
          fetchError instanceof Error
            ? {
                name: fetchError.name,
                message: fetchError.message,
                isAbortError: fetchError.name === "AbortError",
              }
            : "Unknown error",
      });
    }

    // Test 2: DNS Resolution
    console.log("🔍 Test 2: Checking DNS resolution...");
    const dnsStart = Date.now();
    try {
      const dnsResponse = await fetch("https://llm.api.cloud.yandex.net/", {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });
      const dnsDuration = Date.now() - dnsStart;

      diagnostics.tests.push({
        name: "DNS Resolution",
        status: "SUCCESS",
        duration: dnsDuration,
        statusCode: dnsResponse.status,
      });
    } catch (dnsError) {
      const dnsDuration = Date.now() - dnsStart;
      diagnostics.tests.push({
        name: "DNS Resolution",
        status: "FAILED",
        duration: dnsDuration,
        error:
          dnsError instanceof Error ? dnsError.message : "Unknown DNS error",
      });
    }

    // Summary
    diagnostics.totalDuration = Date.now() - startTime;
    diagnostics.summary = {
      allTestsPassed: diagnostics.tests.every(
        (t: any) => t.status === "SUCCESS"
      ),
      passedTests: diagnostics.tests.filter((t: any) => t.status === "SUCCESS")
        .length,
      totalTests: diagnostics.tests.length,
    };

    console.log("✅ Diagnostics complete");
    console.log(JSON.stringify(diagnostics, null, 2));

    return res.status(200).json(diagnostics);
  } catch (error) {
    diagnostics.totalDuration = Date.now() - startTime;
    diagnostics.error =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : "Unknown error";

    console.error("❌ Diagnostic failed:", error);

    return res.status(500).json(diagnostics);
  }
}
