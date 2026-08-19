#!/usr/bin/env node
// Converts an image into the jpg/webp pairs used under img/post_images/,
// following the naming pattern: <name>.<ext> (full size), <name>_800.<ext>
// (800px-wide thumbnail) and <name>_small.<ext> (200px-wide thumbnail).
// Thumbnails are never upscaled beyond the source image.
//
// Usage:
//   node scripts/process-post-image.js <input-image> [output-name]
//
// If output-name is omitted, the input file's basename (without extension)
// is used.

const path = require("path");
const sharp = require("sharp");

const OUTPUT_DIR = path.join(__dirname, "..", "img", "post_images");
const THUMBNAIL_WIDTH = 800;
const SMALL_WIDTH = 200;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;

async function processImage(inputPath, outputName) {
  const name = outputName || path.parse(inputPath).name;

  const fullJpg = path.join(OUTPUT_DIR, `${name}.jpg`);
  const fullWebp = path.join(OUTPUT_DIR, `${name}.webp`);
  const thumbJpg = path.join(OUTPUT_DIR, `${name}_800.jpg`);
  const thumbWebp = path.join(OUTPUT_DIR, `${name}_800.webp`);
  const smallJpg = path.join(OUTPUT_DIR, `${name}_small.jpg`);
  const smallWebp = path.join(OUTPUT_DIR, `${name}_small.webp`);

  const source = sharp(inputPath);

  await Promise.all([
    source
      .clone()
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(fullJpg),
    source.clone().webp({ quality: WEBP_QUALITY }).toFile(fullWebp),
    source
      .clone()
      .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(thumbJpg),
    source
      .clone()
      .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(thumbWebp),
    source
      .clone()
      .resize({ width: SMALL_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: JPEG_QUALITY })
      .toFile(smallJpg),
    source
      .clone()
      .resize({ width: SMALL_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(smallWebp),
  ]);

  for (const file of [
    fullJpg,
    fullWebp,
    thumbJpg,
    thumbWebp,
    smallJpg,
    smallWebp,
  ]) {
    console.log(`wrote ${path.relative(process.cwd(), file)}`);
  }
}

function main() {
  const [inputPath, outputName] = process.argv.slice(2);

  if (!inputPath) {
    console.error(
      "Usage: node scripts/process-post-image.js <input-image> [output-name]",
    );
    process.exit(1);
  }

  processImage(inputPath, outputName).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

main();
