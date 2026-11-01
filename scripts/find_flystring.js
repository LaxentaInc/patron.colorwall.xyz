async function findFlyString() {
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/";
  const candidates = [
    "assets/models/forest/",
    "assets/models/",
    "assets/anims/",
    "assets/anim/",
    "assets/animations/",
    "assets/txt/",
    "assets/text/",
    "assets/curves/",
    "assets/paths/",
    "assets/tracks/",
    "assets/shapes/",
    "assets/characters/",
    "assets/chr/",
    "assets/chrs/",
    "assets/forest/",
    "assets/scene1/",
    "assets/scene2/",
    "models/",
    "models/forest/",
    "anims/",
    "animations/",
    "characters/",
    "chrs/",
    "shapes/",
    "tracks/",
    "paths/"
  ];

  for (const c of candidates) {
    const url = base + c + "ani_chr_1-forest_flyString_v02.txt";
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log("FOUND AT:", url);
        return;
      }
    } catch(e) {}
  }
  console.log("Not found in candidates");
}
findFlyString();

