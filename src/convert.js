#!/usr/bin/env node
import SVGO from 'svgo';
import { readFile } from 'fs';
import slugify from 'slugify';
import commander from 'commander';
import outlineStroke from 'svg-outline-stroke';

import { getDocument, getDimensions, getPathData, rescaleDocument } from './xml';

commander
  .usage('-n <name> <svg>')
  .option('-n, --name <value>', 'descriptor of the icon')
  .version('0.1.0', '-v, --version')
  .parse(process.argv);

if (commander.args.length < 1) {
  // silly that we have to pass an identity transform here
  commander.outputHelp(text => text);
  process.exit(1);
}

// prepare SVGO and get our parsed arguments
const optimizer = new SVGO({
  plugins: [
    {
      convertPathData: {
        makeArcs: {
          threshold: 100,
          tolerance: 0.01
        },
        floatPrecision: 2,
        leadingZero: false,
        forceAbsolutePath: true
      }
    }
  ]
});
const svgPath = commander.args.shift();
const svgName = slugify(commander.name);

readFile(svgPath, 'utf-8', async (error, data) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  // OK... here we go. First, we convert the SVG to raster and supersample it.
  // Then we take the enlarged raster and run svg-outline-stroke on it.
  // Then we revert the viewBox back to what it was before supersampling.
  // Then we optimize the SVG and extract its path data.
  const superSampleFactor = 5.0;
  const originalDoc = getDocument(data);
  const enlarged = rescaleDocument(originalDoc, superSampleFactor);
  const stroked = await outlineStroke(enlarged);
  const strokedDoc = getDocument(stroked);
  const shrunk = rescaleDocument(strokedDoc, 1 / superSampleFactor);
  const optimized = await optimizer.optimize(shrunk);
  const optimizedDoc = getDocument(optimized.data);
  const [ width, height, viewBox ] = getDimensions(optimizedDoc);
  const points = getPathData(optimizedDoc);

  // yes, the indentation is screwy here. leave it be.
  console.log(`
<symbol
  id="icon-${svgName}"
  className="symbol-${svgName}"
  width="${width}"
  height="${height}"
  viewBox="${viewBox}"
>
    <path d="${points}" fill-rule="evenodd" />
</symbol>`
  );
});
