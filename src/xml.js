import { DOMParser, XMLSerializer } from 'xmldom';
import { useNamespaces } from 'xpath';

const parser = new DOMParser();
const serializer = new XMLSerializer();

// All XPath queries need to be under the "svg" XML namespace
const svgSelector = useNamespaces({ svg: 'http://www.w3.org/2000/svg' });

/**
 * Parse an XML document into a Document object.
 * @param {String} text XML string to parse
 */
export const getDocument = text => parser.parseFromString(text);

/**
 * Extract the SVG width, height, and viewBox attributes from an XML document.
 * @param {Document} doc XML document
 */
export const getDimensions = doc => {
  const element = svgSelector('/svg:svg', doc).shift();

  if (!element) {
    throw new Error('The document does not contain an <svg> element!');
  }

  return [
    element.getAttribute('width'),
    element.getAttribute('height'),
    element.getAttribute('viewBox')
  ];
}

export const getPathData = doc => {
  const element = svgSelector('//svg:path', doc).shift();

  if (!element) {
    throw new Error('The document does not contain a <path> element!');
  }

  return element.getAttribute('d');
}

export const rescaleDocument = (doc, scale) => {
  const element = svgSelector('/svg:svg', doc).shift();

  if (!element) {
    throw new Error('The document does not contain an <svg> element!');
  }

  const [ width, height ] = getDimensions(doc);
  const newWidth = parseInt(width.replace('px', ''), 10) * scale;
  const newHeight = parseInt(height.replace('px', ''), 10) * scale;
  const newViewBox = `0 0 ${newWidth} ${newHeight}`;
  element.setAttribute('width', `${newWidth}px`);
  element.setAttribute('height', `${newHeight}px`);
  element.setAttribute('viewBox', newViewBox);

  const transformGroup = doc.createElement('g');
  transformGroup.setAttribute('transform', `scale(${scale})`);
  for (const child of Array.from(element.childNodes)) {
    transformGroup.appendChild(child);
  }
  element.appendChild(transformGroup);

  return serializer.serializeToString(element);
}
