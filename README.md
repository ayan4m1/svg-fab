# svg-fab

This utility will convert a Sketch-exported SVG into a `<symbol>` element suitable for use as an icon.

## Usage

The source SVG must be composed of a single path - use the "Layer > Convert to Outlines" command in Sketch.

Once you have your SVG, install the utility:

```sh
npm install -g svg-fab
```

Then, specify a name for the symbol and the path to the SVG like so:

```sh
svg-fab -n expand my-expand-icon.svg
```

The utility prints its output to stdout. You can copy and paste the `<symbol>` element it generates into your sprite sheet.

The name argument is automatically [slugified](https://github.com/simov/slugify) - wrap it in double quotes if it contains spaces. For example:

```sh
svg-fab -n "my extremely long, convoluted, and entirely unfriendly icon name" my-icon.svg
```

In this example the exported `<symbol>` will have an `id` attribute of `icon-my-extremely-long-convoluted-and-entirely-unfriendly-icon-name`.

