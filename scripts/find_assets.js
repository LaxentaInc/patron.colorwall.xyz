// helper script to inspect and download 3d environment assets from under-neon-lights
async function main() {
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/assets/models/forest/";
  const modelNames = [
    "mdl_env_1_forest_flower_a_v01.json",
    "flower03.json",
    "huge-flower.json",
    "mdl_env_1_forest_mushroom_a_v01.json",
    "mdl_env_1_forest_mushroom_b_v01.json",
    "mdl_env_1_forest_mushroom_c_v01.json",
    "mdl_env_1_forest_tree_e_v01.json",
    "mdl_env_1_forest_tree_f_v01.json",
    "mdl_env_1_forest_tree_g_v01.json",
    "mdl_env_1_forest_rock_a_v01.json",
    "mdl_env_1_forest_rock_a_v02.json",
    "mdl_env_1_forest_grass_d_v01.json",
    "mdl_env_1_forest_grass_e_v01.json",
    "mdl_env_1_forest_grass_f_v01.json",
    "mdl_env_1_forest_grass_g_v01.json"
  ];

  const fs = require("fs");
  const path = require("path");
  const targetDir = path.resolve(__dirname, "../public/assets/neon_forest");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const name of modelNames) {
    const url = base + name;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        fs.writeFileSync(path.join(targetDir, name), text);
        console.log(`downloaded: ${name} (${(text.length / 1024).toFixed(1)} kb)`);
      } else {
        console.warn(`failed ${name}: ${res.status}`);
      }
    } catch (err) {
      console.error(`error ${name}:`, err.message);
    }
  }
}

main();

