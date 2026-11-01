async function printWithin() {
  const res = await fetch("https://within-unlimited.github.io/");
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Length:", text.length);
  console.log("Preview:", text.slice(0, 1000));
}
printWithin();
