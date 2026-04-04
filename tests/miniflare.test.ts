import { Miniflare, Response } from "miniflare";

/**
 * 這是我們的一個本地模擬測試 (Miniflare 模擬)
 * 跳過 Cloudflare 伺服器，直接在你的電腦模擬 Worker 的環境與金鑰
 */
async function runTest() {
  const mf = new Miniflare({
    modules: true,
    scriptPath: "./dist/index.js", // 我們會先編譯代碼
    // ✅ 這裡就是「Miniflare 強制注入」金鑰的地方！
    bindings: {
      API_KEY: "miniflare_secret_test_key",
      CHANNEL_DISCORD_DEVSECOPS_WEBHOOK: "https://discord.com/api/webhooks/mock"
    },
    compatibilityFlags: ["nodejs_compat"]
  });

  console.log("🚀 Miniflare 正在啟動，準備測試金鑰綁定...");

  // 對模擬環境發送請求
  const res = await mf.dispatchFetch("http://localhost:8787/v1/notify", {
    method: "POST",
    headers: {
      "X-Api-Key": "miniflare_secret_test_key",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      source: "devsecops",
      type: "info",
      event: "LOCAL_SIMULATION",
      message: "Hello from Miniflare Simulator!"
    })
  });

  const body = await res.json() as any;
  console.log("--- [模擬測試結果] ---");
  console.log("HTTP Status:", res.status);
  console.log("Success:", body.success);
  
  if (res.status === 200 && body.success) {
    console.log("✅ 恭喜！金鑰綁定 (Env Binding) 在 Miniflare 模擬環境下運作完美！");
  } else {
    console.error("❌ 警告：金鑰比對失敗或代碼報錯。");
  }

  await mf.dispose();
}

runTest().catch(console.error);
