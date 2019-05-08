#!/usr/bin/env node
import SVGO from 'svgo';
import { readFile } from 'fs';
import slugify from 'slugify';
import { basename } from 'path';
import commander from 'commander';

import { getDocument, getDimensions, getPathData } from './xml';

commander
  .version('0.1.1', '-v, --version')
  .usage('-n [iconName] <file ...>')
  .option('-n, --name [iconName]', 'descriptor of the icon')
  .parse(process.argv);

const { args } = commander;

// show help if required argument is not present
if (args.length < 1) {
  commander.outputHelp();
  process.exit(1);
}

// prepare SVGO and get our parsed arguments
const optimizer = new SVGO({
  plugins: [
    {
      convertPathData: {
        floatPrecision: 2,
        leadingZero: false,
        forceAbsolutePath: true
      }
    },
    {
      removeViewBox: false
    }
  ]
});

for (const svgPath of args) {
  const { iconName } = args;
  const svgName = slugify(iconName ? iconName : basename(svgPath, '.svg'));

  readFile(svgPath, 'utf-8', async (error, data) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    // extract the SVG file into a string
    const doc = getDocument(data);
    // apply optimizations
    const optimized = await optimizer.optimize(doc);
    // extract the SVG from the optimized SVG
    const optimizedDoc = getDocument(optimized.data);
    // extract dimension metadata from SVG
    const [width, height, viewBox] = getDimensions(optimizedDoc);
    // extract the actual path data from SVG
    const points = getPathData(optimizedDoc);

    // spit out a blob of HTML for a sprite sheet
    console.log(`
<symbol
  id="icon-${svgName}"
  className="symbol-${svgName}"
  width="${width}"
  height="${height}"
  viewBox="${viewBox}"
>
    <path d="${points}" fillRule="evenodd" />
</symbol>`);
  });
}
