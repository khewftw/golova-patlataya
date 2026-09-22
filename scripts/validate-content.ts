import { access } from "node:fs/promises";
import path from "node:path";
import { getAllMovements } from "../src/lib/movements";
import featureIndex from "../src/data/map-feature-index.json";

const ROOT = process.cwd();
const knownFeatureIds = new Set(featureIndex.features.map((feature) => feature.id));

type Issue = string;

async function fileExists(publicPath: string) {
  try {
    await access(path.join(ROOT, "public", publicPath.replace(/^\//, "")));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const issues: Issue[] = [];
  const slugs = new Set<string>();

  const movements = getAllMovements();
  if (movements.length < 30) {
    issues.push(`Expected at least 30 movements, found ${movements.length}`);
  }

  for (const movement of movements) {
    const prefix = movement.slug;

    if (slugs.has(movement.slug)) issues.push(`${prefix}: duplicate slug`);
    slugs.add(movement.slug);

    if (!movement.title.trim()) issues.push(`${prefix}: missing title`);
    if (!Number.isFinite(movement.fromYear) || !Number.isFinite(movement.toYear)) {
      issues.push(`${prefix}: missing years`);
    }
    if (movement.fromYear > movement.toYear) {
      issues.push(`${prefix}: fromYear > toYear`);
    }
    if (!movement.contentStatus) issues.push(`${prefix}: missing contentStatus`);
    if (movement.sources.length < 2) {
      issues.push(`${prefix}: need at least two sources (found ${movement.sources.length})`);
    }

    const sourceKeys = new Set<string>();
    for (const source of movement.sources) {
      const key = `${source.title}::${source.url}`;
      if (sourceKeys.has(key)) issues.push(`${prefix}: duplicate source ${source.title}`);
      sourceKeys.add(key);
    }

    if (movement.mapFeatureIds.length === 0) {
      issues.push(`${prefix}: movement without mapFeatureIds`);
    }
    for (const id of movement.mapFeatureIds) {
      if (!knownFeatureIds.has(id)) {
        issues.push(`${prefix}: mapFeatureId ${id} is not in the 1950 snapshot`);
      }
    }

    if (movement.gallery.length === 0) {
      console.warn(`${prefix}: no local images yet`);
    }
    for (const image of movement.gallery) {
      if (!image.src) {
        issues.push(`${prefix}: image without src`);
        continue;
      }
      if (!(await fileExists(image.src))) {
        issues.push(`${prefix}: nonexistent local image ${image.src}`);
      }
    }
  }

  const claimed = new Set(movements.flatMap((movement) => movement.mapFeatureIds));
  for (const movement of movements) {
    for (const id of movement.mapFeatureIds) {
      const owners = movements.filter((item) => item.mapFeatureIds.includes(id));
      if (owners.length > 1) {
        issues.push(
          `feature ${id} claimed by ${owners.map((item) => item.slug).join(", ")}`,
        );
      }
    }
  }

  if (issues.length > 0) {
    const unique = [...new Set(issues)];
    console.error(`Validation failed (${unique.length} issues):`);
    for (const issue of unique) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log(`OK: ${movements.length} movements, ${claimed.size} map features resolved.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
