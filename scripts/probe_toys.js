async function probeToys() {
  const folders = [
    "models/forest/",
    "models/bedroom/",
    "models/living-room/",
    "models/house/",
    "models/toys/",
    "models/city/",
    "models/kids/",
    "models/items/",
    "models/env/"
  ];
  const files = ["bunny.json", "elephant.json", "ball-blue.json", "cube-blue.json"];

  for (const f of folders) {
    for (const name of files) {
      const url = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/assets/" + f + name;
      try {
        const res = await fetch(url);
        if (res.ok) console.log("FOUND:", url);
      } catch(e) {}
    }
  }
  console.log("Toy probe complete");
}
probeToys();

