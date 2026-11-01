async function testConfig() {
  const url = "https://within-unlimited.github.io/under-neon-lights/js/Config.js";
  const res = await fetch(url);
  const text = await res.text();
  console.log(text.slice(0, 1500));
}
testConfig();

