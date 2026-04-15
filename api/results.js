const UPSTASH_URL = process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "katalon_quiz_results";

async function upstash(cmd) {
  const res = await fetch(`${UPSTASH_URL}/${cmd.join("/")}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — fetch all results
  if (req.method === "GET") {
    const raw = await upstash(["GET", KEY]);
    const results = raw ? JSON.parse(raw) : [];
    return res.status(200).json(results);
  }

  // POST — append a new result
  if (req.method === "POST") {
    const raw = await upstash(["GET", KEY]);
    const results = raw ? JSON.parse(raw) : [];
    results.push(req.body);
    await upstash(["SET", KEY, JSON.stringify(results)]);
    return res.status(200).json({ ok: true });
  }

  // DELETE — clear all results
  if (req.method === "DELETE") {
    await upstash(["DEL", KEY]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
