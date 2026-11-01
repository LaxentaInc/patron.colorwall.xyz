async function findRelease() {
  const base = "https://within-unlimited.github.io/under-neon-lights/";
  const files = [
    "release/app.js",
    "release/main.js",
    "release/index.html",
    "release/project.json",
    "js/Sidebar.Project.js"
  ];

  for (const f of files) {
    const res = await fetch(base + f);
    console.log(f, res.status);
    if (res.ok) {
      const text = await res.text();
      const jsons = text.match(/[a-zA-Z0-9_\-\/]+\.json/g) || [];
      console.log(f, "has json matches:", jsons.slice(0, 20));
    }
  }
}
findRelease();

