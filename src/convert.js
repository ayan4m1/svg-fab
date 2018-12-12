#!/usr/bin/env node
import { readFile } from 'fs';
import slugify from 'slugify';
import commander from 'commander';
import { DOMParser } from 'xmldom';
import { useNamespaces } from 'xpath';

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

// get our arguments
const svgPath = commander.args.shift();
const svgName = slugify(commander.name);

readFile(svgPath, 'utf-8', (error, data) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  // need to use the SVG namespace when querying the source
  const doc = new DOMParser().parseFromString(data);
  const select = useNamespaces({ svg: 'http://www.w3.org/2000/svg' });
  const rootElement = select('/svg:svg', doc).shift();
  const pathElement = select('//svg:path', doc).shift();

  if (!rootElement) {
    console.error(`There is no <svg> element in ${svgPath}`);
    process.exit(1);
  }

  if (!pathElement) {
    console.error(`There is no <path> element in ${svgPath}`);
    process.exit(1);
  }

  // pull the data we need from the source SVG
  const [ width, height, viewBox, points ] = [
    rootElement.getAttribute('width'),
    rootElement.getAttribute('height'),
    rootElement.getAttribute('viewBox'),
    pathElement.getAttribute('d')
  ];

  // yes, the indentation is screwy here. leave it be.
  console.log(`
<symbol
  id="icon-${svgName}"
  className="symbol-${svgName}"
  width="${width}"
  height="${height}"
  viewBox="${viewBox}"
    <path d="${points}" />
</symbol>`
  );
});
