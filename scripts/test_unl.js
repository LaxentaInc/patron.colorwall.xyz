async function testUnl() {
  const url = "https://within-unlimited.github.io/under-neon-lights/";
  const res = await fetch(url);
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Length:", text.length);
  const m = text.match(/src="([^"]+)"/g) || [];
  console.log("Scripts:", m);
  const jsMatch = text.match(/https?:\/\/[^\s"'<>]+\.js/g) || [];
  console.log("JS URLs:", jsMatch);
}
testUnl();

