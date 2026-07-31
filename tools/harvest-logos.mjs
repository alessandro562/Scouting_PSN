// ===========================================================================
// harvest-logos.mjs — acquisizione OFFLINE dei loghi startup (non spedito a
// runtime). Per ogni {slug, url} scarica il miglior candidato icona dal sito
// (apple-touch-icon → rel=icon HD → og:image), fallback Google favicon.
// Salva in assets/logos/<slug>.png. Eseguire: node tools/harvest-logos.mjs
// I candidati vengono ispezionati a mano prima del commit.
// ===========================================================================
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const CA = "/root/.ccr/ca-bundle.crt";
const OUT = "assets/logos";

// slug → homepage (solo quelle note; le altre useranno il monogramma a runtime)
const SITES = {
  focoos: "https://www.focoos.ai",
  beelzebub: "https://beelzebub.ai/",
  nextgcloud: "https://www.nextgcloud.com",
  loki: "https://www.lokisrl.eu",
  tiledesk: "https://www.tiledesk.com",
  iotilize: "https://iotilize.me",
};

mkdirSync(OUT, { recursive: true });
const sh = (cmd) => execSync(cmd, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
const html = (url) => { try { return sh(`curl -sSL --max-time 30 --cacert ${CA} ${JSON.stringify(url)}`); } catch { return ""; } };
const abs = (base, href) => { try { return new URL(href, base).href; } catch { return href; } };

function candidates(url) {
  const h = html(url);
  const out = [];
  const push = (re) => { let m; const rx = new RegExp(re, "ig"); while ((m = rx.exec(h))) out.push(m[1]); };
  push(`<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']`);
  push(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon`);
  push(`<link[^>]+rel=["'][^"']*icon["'][^>]+href=["']([^"']+)["']`);
  push(`<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']`);
  push(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image`);
  return [...new Set(out.map((u) => abs(url, u)))];
}

function download(url, dest) {
  try {
    const info = sh(`curl -sSL --max-time 30 --cacert ${CA} -o ${JSON.stringify(dest)} -w "%{http_code} %{content_type} %{size_download}" ${JSON.stringify(url)}`);
    const [code, type, size] = info.trim().split(/\s+/);
    return { ok: code === "200" && /image\//.test(type || "") && Number(size) > 1500, code, type, size };
  } catch (e) { return { ok: false, err: e.message }; }
}

for (const [slug, url] of Object.entries(SITES)) {
  const cands = candidates(url);
  let done = false;
  for (const c of cands) {
    const r = download(c, `${OUT}/${slug}.png`);
    if (r.ok) { console.log(`${slug}: ${c}\n   -> OK ${r.type} ${r.size}b`); done = true; break; }
  }
  if (!done) {
    const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();
    const r = download(`https://www.google.com/s2/favicons?domain=${host}&sz=128`, `${OUT}/${slug}.png`);
    console.log(`${slug}: fallback google favicon -> ${r.ok ? "OK" : "FAIL " + JSON.stringify(r)}`);
  }
}
