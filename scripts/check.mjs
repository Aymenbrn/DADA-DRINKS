import { access } from "node:fs/promises";
for (const file of ["index.html", "styles.css", "app.js", "catalog.js"]) {
  await access(new URL(`../public/${file}`, import.meta.url));
}
console.log("Static storefront files ready in public/.");
