/**
 * Diagnostic endpoint to test YandexGPT API connectivity
 * Now uses the same proven implementation as the webhook
 */

import { callYandexGPT } from "../src/services/yandex-gpt.service.js";

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
    // Test 1: YandexGPT API call using shared service
    console.log("🔍 Test 1: Testing YandexGPT API using shared service...");
    const test1Start = Date.now();

    if (!process.env.YANDEX_API_KEY || !process.env.YANDEX_FOLDER_ID) {
      diagnostics.tests.push({
        name: "YandexGPT API Connection",
        status: "FAILED",
        error: "Missing YANDEX_API_KEY or YANDEX_FOLDER_ID",
      });
    } else {
      try {
        const response = await callYandexGPT({
          folderId: process.env.YANDEX_FOLDER_ID,
          apiKey: process.env.YANDEX_API_KEY,
          prompt: "Привет!",
          maxTokens: 50,
          temperature: 0.1,
          timeout: 10000,
        });

        const test1Duration = Date.now() - test1Start;

        console.log(`✅ YandexGPT responded in ${test1Duration}ms`);
        console.log(`📦 Response: ${response.substring(0, 100)}...`);

        diagnostics.tests.push({
          name: "YandexGPT API Connection",
          status: "SUCCESS",
          duration: test1Duration,
          responsePreview: response.substring(0, 200),
        });
      } catch (error) {
        const test1Duration = Date.now() - test1Start;

        console.error("❌ YandexGPT error:", error);

        diagnostics.tests.push({
          name: "YandexGPT API Connection",
          status: "FAILED",
          duration: test1Duration,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : "Unknown error",
        });
      }
    }

    // Test 2: DNS Resolution
    console.log("🔍 Test 2: Testing DNS resolution...");
    const dnsStart = Date.now();
    try {
      const dnsResponse = await fetch("https://llm.api.cloud.yandex.net/", {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });
      const dnsDuration = Date.now() - dnsStart;

      console.log(`✅ DNS resolved in ${dnsDuration}ms`);

      diagnostics.tests.push({
        name: "DNS Resolution",
        status: "SUCCESS",
        duration: dnsDuration,
        statusCode: dnsResponse.status,
      });
    } catch (dnsError) {
      const dnsDuration = Date.now() - dnsStart;

      console.error("❌ DNS error:", dnsError);

      diagnostics.tests.push({
        name: "DNS Resolution",
        status: "FAILED",
        duration: dnsDuration,
        error:
          dnsError instanceof Error
            ? {
                name: dnsError.name,
                message: dnsError.message,
              }
            : "Unknown error",
      });
    }
  } catch (globalError) {
    console.error("❌ Global error:", globalError);
    diagnostics.globalError =
      globalError instanceof Error
        ? {
            name: globalError.name,
            message: globalError.message,
          }
        : "Unknown error";
  }

  const totalDuration = Date.now() - startTime;
  const passedTests = diagnostics.tests.filter(
    (t: any) => t.status === "SUCCESS"
  ).length;
  const allTestsPassed = passedTests === diagnostics.tests.length;

  diagnostics.totalDuration = totalDuration;
  diagnostics.summary = {
    allTestsPassed,
    passedTests,
    totalTests: diagnostics.tests.length,
  };

  console.log(
    `\n📊 Summary: ${passedTests}/${diagnostics.tests.length} tests passed`
  );
  console.log(`⏱️ Total duration: ${totalDuration}ms`);

  res.status(allTestsPassed ? 200 : 500).json(diagnostics);
}
