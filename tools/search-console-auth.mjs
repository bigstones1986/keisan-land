import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const CLIENT_FILE = "gsc-oauth-client.json";
const TOKEN_FILE = "gsc-token.json";
const PORT = Number(process.env.GSC_AUTH_PORT || 53682);
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly"
];

function getClientConfig(raw) {
  const config = JSON.parse(raw);
  const client = config.installed || config.web || config;
  if (!client.client_id || !client.client_secret) {
    throw new Error(`${CLIENT_FILE} に client_id / client_secret が見つかりません。`);
  }
  return client;
}

async function exchangeCode(client, code) {
  const body = new URLSearchParams({
    code,
    client_id: client.client_id,
    client_secret: client.client_secret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`トークン取得に失敗しました: ${JSON.stringify(data, null, 2)}`);
  }
  data.saved_at = Date.now();
  return data;
}

async function main() {
  const client = getClientConfig(await readFile(CLIENT_FILE, "utf8"));
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", client.client_id);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES.join(" "));
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  await mkdir("search-console-private", { recursive: true });

  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url, REDIRECT_URI);
      if (requestUrl.pathname !== "/oauth2callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const code = requestUrl.searchParams.get("code");
      if (!code) throw new Error("認証コードがありません。");
      const token = await exchangeCode(client, code);
      await writeFile(TOKEN_FILE, JSON.stringify(token, null, 2), "utf8");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end("<h1>Search Console 認証が完了しました</h1><p>このタブは閉じて大丈夫です。</p>");
      server.close();
      console.log(`認証完了: ${TOKEN_FILE} を保存しました。`);
    } catch (error) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(String(error.stack || error));
      server.close();
      process.exitCode = 1;
    }
  });

  server.listen(PORT, () => {
    console.log("次のURLをブラウザで開いて、Search Consoleを使っているGoogleアカウントで承認してください。\n");
    console.log(authUrl.toString());
    console.log("\n承認後、このスクリプトが自動でトークンを保存します。");
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
