#!/usr/bin/env node
import { optimize } from 'svgo';
import { readFile } from 'fs';
import slugify from 'slugify';
import { basename } from 'path';
import { Command } from 'commander';

import { getDocument, getDimensions, getPathData } from './xml';

const program = new Command();

program
  .version('0.2.1')
  .argument('<files...>')
  .option('--icon-name, --name, -n', 'icon name for generated XML')
  .parse(process.argv);

const { args } = program;

for (const svgPath of args) {
  const { iconName } = args;
  const svgName = slugify(iconName ? iconName : basename(svgPath, '.svg'));

  readFile(svgPath, 'utf-8', (error, data) => {
    if (error) {
      throw error;
    }

    // extract the SVG file into a string
    const doc = getDocument(data);
    // apply optimizations
    const optimized = optimize(doc, {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              convertPathData: {
                floatPrecision: 2,
                leadingZero: false,
                forceAbsolutePath: true
              },
              removeViewBox: false
            }
          }
        }
      ]
    });
    // extract the SVG from the optimized SVG
    const optimizedDoc = getDocument(optimized.data);
    // extract dimension metadata from SVG
    const [width, height, viewBox] = getDimensions(optimizedDoc);
    // extract the actual path data from SVG
    const points = getPathData(optimizedDoc);

    // spit out a blob of HTML for a sprite sheet
    // eslint-disable-next-line no-console
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
