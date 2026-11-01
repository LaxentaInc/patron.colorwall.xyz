async function testForst() {
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/assets/";
  const names = [
    "models/forest/mdl_env_1-forst_UNL_title.json",
    "models/forest/mdl_env_1-forest_TCB_title.json",
    "models/forest/mdl_env_1-forst_STVincnt_title.json",
    "models/forest/shape_helix_03_v03.txt",
    "models/forest/ani_chr_1-forest_flyString_v02.txt",
    "models/forest/ani_chr_1-forest_bindposeHugBear_v02.txt",
    "models/forest/ani_chr_1-forest_hugBear_v06.txt"
  ];

  for (const n of names) {
    const res = await fetch(base + n);
    console.log(n, res.status);
  }
}
testForst();

