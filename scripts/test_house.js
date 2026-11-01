async function testHouse() {
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/assets/models/house/";
  const files = [
    "kitchen.json",
    "living-room.json",
    "bathroom.json",
    "bedroom.json",
    "teddy.json",
    "bunny.json",
    "elephant.json",
    "giraffe.json",
    "tricycle.json",
    "ball-blue.json",
    "cube-blue.json",
    "pyramid-green.json"
  ];

  for (const f of files) {
    const res = await fetch(base + f);
    console.log(f, res.status);
  }
}
testHouse();

