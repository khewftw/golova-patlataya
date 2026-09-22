import { applyContentFolder } from "../src/lib/content-store";

async function main() {
  const applied = await applyContentFolder();
  if (applied.length === 0) {
    console.log("No Markdown files in content/movements (except _template.md).");
    return;
  }
  console.log(`Applied ${applied.length} files: ${applied.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
