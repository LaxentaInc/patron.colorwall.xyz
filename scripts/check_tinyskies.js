// script to inspect tinyskies.vercel.app and download 3d models
async function scrapeTinySkies() {
  const fs = require("fs");
  const path = require("path");
  const outDir = path.resolve(__dirname, "../public/assets/tinyskies");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const base = "https://tinyskies.vercel.app";
  try {
    const res = await fetch(base);
    const html = await res.text();
    console.log("index.html fetched, size:", html.length);

    // match script tags
    const scriptMatches = [...html.matchAll(/src=["']([^"']+)["']/g)].map(m => m[1]);
    console.log("Found scripts:", scriptMatches);

    const assetUrls = new Set();
    // also check eternal_flame.glb which we saw in the user's devtools screenshot
    assetUrls.add(`${base}/eternal_flame.glb`);

    for (const s of scriptMatches) {
      const sUrl = s.startsWith("http") ? s : `${base}/${s.replace(/^\//, "")}`;
      try {
        const jsRes = await fetch(sUrl);
        if (jsRes.ok) {
          const js = await jsRes.text();
          const matches = js.match(/[a-zA-Z0-9_\-\/]+\.(?:glb|gltf|bin|buf|webp|png|jpg|mp3)/gi) || [];
          for (const m of matches) {
            assetUrls.add(m.startsWith("http") ? m : `${base}/${m.replace(/^\//, "")}`);
          }
        }
      } catch (e) {
        console.warn("script fetch failed:", sUrl);
      }
    }

    console.log(`Discovered ${assetUrls.size} asset candidates:`, Array.from(assetUrls).slice(0, 30));

    // download any matching 3d models
    for (const url of assetUrls) {
      if (/\.(glb|gltf|buf|bin)$/i.test(url)) {
        try {
          const dRes = await fetch(url);
          if (dRes.ok) {
            const buf = await dRes.arrayBuffer();
            const filename = url.split("/").pop().split("?")[0];
            fs.writeFileSync(path.join(outDir, filename), Buffer.from(buf));
            console.log(`✓ Downloaded 3D model: ${filename} (${(buf.byteLength / 1024).toFixed(1)} kb)`);
          }
        } catch (e) {
          console.warn(`failed ${url}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error("Scraper error:", err);
  }
}

scrapeTinySkies();
