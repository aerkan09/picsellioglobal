const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "../public/data/turkiye-il-ilce.json");
const dest = path.join(__dirname, "../public/data/turkeyLocations.json");
const data = JSON.parse(fs.readFileSync(src, "utf8"));
const out = data.map(({ il, ilceler }) => ({ city: il, districts: ilceler }));
fs.writeFileSync(dest, JSON.stringify(out, null, 2), "utf8");
console.log("Wrote public/data/turkeyLocations.json");
