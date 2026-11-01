async function printHtml() {
  const base = "https://storage.googleapis.com/archive.jono.fyi/projects/within/under-neon-lights/index.html";
  const res = await fetch(base);
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Text preview:", text.slice(0, 500));
}
printHtml();

