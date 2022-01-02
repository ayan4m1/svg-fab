import { DOMParser } from 'xmldom';
import { useNamespaces } from 'xpath';

const parser = new DOMParser();

// All XPath queries need to be under the "svg" XML namespace
const svgSelector = useNamespaces({ svg: 'http://www.w3.org/2000/svg' });

/**
 * Parse an XML document into a Document object.
 * @param {String} text XML string to parse
 */
export const getDocument = (text) => parser.parseFromString(text);

/**
 * Extract the SVG width, height, and viewBox attributes from an XML document.
 * @param {Document} doc XML document
 */
export const getDimensions = (doc) => {
  const element = svgSelector('/svg:svg', doc).shift();

  if (!element) {
    throw new Error('The document does not contain an <svg> element!');
  }

  // try to infer width and height from viewBox if not present
  let width, height;

  if (!element.getAttribute('width') || !element.getAttribute('height')) {
    const viewBox = element.getAttribute('viewBox').split(' ');

    if (!Array.isArray(viewBox) || viewBox.length < 4) {
      throw new Error(
        'Sorry, this icon is has an invalid viewBox, height, and/or width - giving up!'
      );
    }

    width = viewBox[2];
    height = viewBox[3];
  } else {
    width = element.getAttribute('width');
    height = element.getAttribute('height');
  }

  return [width, height, element.getAttribute('viewBox')];
};

/**
 * Extract the "d" attribute of the first <path> element of an XML document.
 * @param {Document} doc XML document
 */
export const getPathData = (doc) => {
  const element = svgSelector('//svg:path', doc).shift();

  if (!element) {
    throw new Error('The document does not contain a <path> element!');
  }

  return element.getAttribute('d');
};
