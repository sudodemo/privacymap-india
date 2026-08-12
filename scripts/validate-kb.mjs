import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "knowledge_base/RELEASE_MANIFEST.json",
  "knowledge_base/CHANGELOG.json",
  "knowledge_base/legal/dpdp_controls_v1.json",
  "knowledge_base/legal/rules_commencement_v1.json",
  "knowledge_base/core/industries.json",
  "knowledge_base/core/business_types.json",
  "knowledge_base/core/risk_rules.json",
  "knowledge_base/sectors/education/school/data_entry_points.json",
  "knowledge_base/sectors/education/school/data_fields.json",
  "schemas/assessment.schema.json"
];

for (const rel of required) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing KB file: ${rel}`);
  JSON.parse(fs.readFileSync(file, "utf8"));
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "knowledge_base/RELEASE_MANIFEST.json"), "utf8"));
if (manifest.release !== "1.6") throw new Error("Unexpected V1.6 release manifest");
if (manifest.kb_version !== "1.1.0") throw new Error("Unexpected KB version");

const controls = JSON.parse(fs.readFileSync(path.join(root, "knowledge_base/legal/dpdp_controls_v1.json"), "utf8"));
for (const control of controls.controls) {
  for (const key of ["id", "title", "act_reference", "requirement", "source_url", "last_verified", "effective_date"]) {
    if (!control[key]) throw new Error(`Missing ${key} in control ${control.id}`);
  }
}

console.log(`PrivacyMap V1.6 KB validation passed: ${controls.controls.length} legal controls checked.`);
