async function findStorageUrls() {
  const base = "https://within-unlimited.github.io/under-neon-lights/";
  const jsFiles = [
    "js/Editor.js",
    "js/Sidebar.js",
    "js/Sidebar.Project.js",
    "js/Sidebar.Animation.js",
    "js/Sidebar.Settings.js",
    "js/Viewport.js",
    "js/Controls.js",
    "js/Timeline.js",
    "js/Timeline.Animations.js",
    "js/Timeline.Curves.js"
  ];

  for (const f of jsFiles) {
    const res = await fetch(base + f);
    if (res.ok) {
      const text = await res.text();
      const urls = text.match(/https:\/\/storage\.googleapis\.com[^\s"'\)]+/g) || [];
      if (urls.length > 0) {
        console.log(f, "has storage URLs:", urls);
      }
      const jsonMatches = text.match(/[a-zA-Z0-9_\-\/]+\.json/g) || [];
      if (jsonMatches.length > 0) {
        console.log(f, "has json matches:", jsonMatches);
      }
    }
  }
}
findStorageUrls();

