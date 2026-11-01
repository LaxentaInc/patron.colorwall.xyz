async function testToys() {
  const folders = ["models/", "models/toys/", "models/ascii/", "models/house/"];
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/assets/";

  for (const f of folders) {
    const res = await fetch(base + f + "cube-blue.json");
    console.log(f + "cube-blue.json:", res.status);
    const res2 = await fetch(base + f + "bunny.json");
    console.log(f + "bunny.json:", res2.status);
  }
}
testToys();
