import { getAllMovements } from "../src/lib/movements";
import { exportMovementMarkdown } from "../src/lib/content-store";

async function main() {
  const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7);
  const movements = getAllMovements().filter((movement) => !only || movement.slug === only);
  for (const movement of movements) {
    await exportMovementMarkdown(movement);
    console.log(`wrote content/movements/${movement.slug}.md`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
