async function findBundle() {
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/";
  try {
    const res = await fetch(base + "index.html");
    const html = await res.text();
    const scripts = html.match(/src="([^"]+)"/g) || [];
    console.log("scripts:", scripts);
    for (const s of scripts) {
      const src = s.replace(/src="|"/g, "");
      const jsUrl = src.startsWith("http") ? src : base + src;
      const jsRes = await fetch(jsUrl);
      if (jsRes.ok) {
        const js = await jsRes.text();
        const matches = js.match(/[a-zA-Z0-9_\-\/]+\.json/g) || [];
        console.log("Found json files in", src, ":", matches.slice(0, 30));
      }
    }
  } catch(e) {
    console.error(e);
  }
}
findBundle();

