async function inspectIntro() {
  const url = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/assets/models/forest/forest-intro-update.json";
  const res = await fetch(url);
  const json = await res.json();
  console.log("Keys:", Object.keys(json));
  if (json.project) console.log("project:", json.project);
  if (json.scene) {
    console.log("scene object count:", json.scene.object ? json.scene.object.children ? json.scene.object.children.length : 0 : 0);
    if (json.scene.geometries) console.log("geometries count:", json.scene.geometries.length);
  }
  if (json.scripts) console.log("scripts count:", Object.keys(json.scripts).length);
  const str = JSON.stringify(json);
  const urls = str.match(/[a-zA-Z0-9_\-\/]+\.(?:json|txt|obj|png|jpg|webp)/g) || [];
  const uniqueUrls = [...new Set(urls)];
  console.log("Total unique file references in intro:", uniqueUrls.length);
  console.log("Sample references:", uniqueUrls.slice(0, 40));
}
inspectIntro();

