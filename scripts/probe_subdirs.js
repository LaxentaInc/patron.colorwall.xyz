async function probeSubdirs() {
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/assets/";
  const subdirs = [
    "models/forest/",
    "models/room/",
    "models/house/",
    "models/intro/",
    "models/chrs/",
    "models/props/",
    "models/characters/",
    "animations/forest/",
    "animations/",
    "shapes/"
  ];
  const testFiles = [
    "forest-intro-update.json",
    "house-with-hallway_v02.json",
    "bunny.json",
    "ani_chr_1-forest_flyString_v02.txt",
    "shape_helix_03_v03.txt",
    "mdl_env_1-forst_UNL_title.json"
  ];

  for (const s of subdirs) {
    for (const f of testFiles) {
      const url = base + s + f;
      try {
        const res = await fetch(url);
        if (res.ok) {
          console.log("FOUND:", url);
        }
      } catch(e) {}
    }
  }
  console.log("Probe complete.");
}
probeSubdirs();

