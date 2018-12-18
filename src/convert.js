#!/usr/bin/env node
import SVGO from 'svgo';
import { readFile } from 'fs';
import slugify from 'slugify';
import commander from 'commander';

import { getDocument, getDimensions, getPathData } from './xml';

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
const svgPath = commander.args.shift();
const svgName = slugify(commander.name);

readFile(svgPath, 'utf-8', async (error, data) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  const doc = getDocument(data);
  console.dir(data);
  const optimized = await optimizer.optimize(doc);
  console.dir(optimized.data);
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
