/**
 * The Shapes gallery: categories, order and names as in the Insert > Shapes menu of
 * WPS Office and Microsoft Word. Each entry is an Office preset (presetShapes.generated.js),
 * sometimes with a starting style (a line with an arrowhead is a connector with an arrow end).
 *
 * size: the shape's size when it is inserted with a tap instead of a drag (canvas px).
 */

const SQUARE = { w: 120, h: 120 };
const WIDE = { w: 160, h: 100 };
const FLAT = { w: 160, h: 80 };
const TALL = { w: 80, h: 160 };
const LINE = { w: 160, h: 0 };

const ARROW_END = { type: 'triangle', w: 'med', len: 'med' };

export const SHAPE_CATEGORIES = [
  {
    id: 'lines',
    label: 'Lines',
    shapes: [
      { id: 'line', preset: 'line', name: 'Line', size: LINE },
      { id: 'line-arrow', preset: 'straightConnector1', name: 'Line Arrow', size: LINE, line: { tail: ARROW_END } },
      { id: 'line-double-arrow', preset: 'straightConnector1', name: 'Line Arrow: Double', size: LINE, line: { head: ARROW_END, tail: ARROW_END } },
      { id: 'elbow', preset: 'bentConnector3', name: 'Connector: Elbow', size: { w: 160, h: 100 } },
      { id: 'elbow-arrow', preset: 'bentConnector3', name: 'Connector: Elbow Arrow', size: { w: 160, h: 100 }, line: { tail: ARROW_END } },
      { id: 'elbow-double-arrow', preset: 'bentConnector3', name: 'Connector: Elbow Double-Arrow', size: { w: 160, h: 100 }, line: { head: ARROW_END, tail: ARROW_END } },
      { id: 'curved', preset: 'curvedConnector3', name: 'Connector: Curved', size: { w: 160, h: 100 } },
      { id: 'curved-arrow', preset: 'curvedConnector3', name: 'Connector: Curved Arrow', size: { w: 160, h: 100 }, line: { tail: ARROW_END } },
      { id: 'curved-double-arrow', preset: 'curvedConnector3', name: 'Connector: Curved Double-Arrow', size: { w: 160, h: 100 }, line: { head: ARROW_END, tail: ARROW_END } },
    ],
  },
  {
    id: 'rectangles',
    label: 'Rectangles',
    shapes: [
      { preset: 'rect', name: 'Rectangle', size: WIDE },
      { preset: 'roundRect', name: 'Rectangle: Rounded Corners', size: WIDE },
      { preset: 'snip1Rect', name: 'Rectangle: Single Corner Snipped', size: WIDE },
      { preset: 'snip2SameRect', name: 'Rectangle: Top Corners Snipped', size: WIDE },
      { preset: 'snip2DiagRect', name: 'Rectangle: Diagonal Corners Snipped', size: WIDE },
      { preset: 'snipRoundRect', name: 'Rectangle: Top Corners One Rounded and One Snipped', size: WIDE },
      { preset: 'round1Rect', name: 'Rectangle: Single Corner Rounded', size: WIDE },
      { preset: 'round2SameRect', name: 'Rectangle: Top Corners Rounded', size: WIDE },
      { preset: 'round2DiagRect', name: 'Rectangle: Diagonal Corners Rounded', size: WIDE },
    ],
  },
  {
    id: 'basic',
    label: 'Basic Shapes',
    shapes: [
      { id: 'textbox', preset: 'rect', name: 'Text Box', size: { w: 200, h: 60 }, textBox: true },
      { preset: 'ellipse', name: 'Oval', size: SQUARE },
      { preset: 'triangle', name: 'Isosceles Triangle', size: SQUARE },
      { preset: 'rtTriangle', name: 'Right Triangle', size: SQUARE },
      { preset: 'parallelogram', name: 'Parallelogram', size: WIDE },
      { preset: 'trapezoid', name: 'Trapezoid', size: WIDE },
      { preset: 'diamond', name: 'Diamond', size: SQUARE },
      { preset: 'pentagon', name: 'Regular Pentagon', size: SQUARE },
      { preset: 'hexagon', name: 'Hexagon', size: { w: 140, h: 120 } },
      { preset: 'heptagon', name: 'Heptagon', size: SQUARE },
      { preset: 'octagon', name: 'Octagon', size: SQUARE },
      { preset: 'decagon', name: 'Decagon', size: SQUARE },
      { preset: 'dodecagon', name: 'Dodecagon', size: SQUARE },
      { preset: 'pie', name: 'Partial Circle', size: SQUARE },
      { preset: 'chord', name: 'Chord', size: SQUARE },
      { preset: 'teardrop', name: 'Teardrop', size: SQUARE },
      { preset: 'frame', name: 'Frame', size: SQUARE },
      { preset: 'halfFrame', name: 'Half Frame', size: SQUARE },
      { preset: 'corner', name: 'L-Shape', size: SQUARE },
      { preset: 'diagStripe', name: 'Diagonal Stripe', size: SQUARE },
      { preset: 'plus', name: 'Cross', size: SQUARE },
      { preset: 'plaque', name: 'Plaque', size: WIDE },
      { preset: 'can', name: 'Cylinder', size: { w: 100, h: 140 } },
      { preset: 'cube', name: 'Cube', size: SQUARE },
      { preset: 'bevel', name: 'Rectangle: Beveled', size: WIDE },
      { preset: 'donut', name: 'Circle: Hollow', size: SQUARE },
      { preset: 'noSmoking', name: '"Not Allowed" Symbol', size: SQUARE },
      { preset: 'blockArc', name: 'Arc: Block', size: SQUARE },
      { preset: 'foldedCorner', name: 'Rectangle: Folded Corner', size: WIDE },
      { preset: 'smileyFace', name: 'Smiley Face', size: SQUARE },
      { preset: 'heart', name: 'Heart', size: SQUARE },
      { preset: 'lightningBolt', name: 'Lightning Bolt', size: SQUARE },
      { preset: 'sun', name: 'Sun', size: SQUARE },
      { preset: 'moon', name: 'Moon', size: { w: 70, h: 140 } },
      { preset: 'cloud', name: 'Cloud', size: WIDE },
      { preset: 'arc', name: 'Arc', size: SQUARE },
      { preset: 'bracketPair', name: 'Double Bracket', size: WIDE },
      { preset: 'bracePair', name: 'Double Brace', size: WIDE },
      { preset: 'leftBracket', name: 'Left Bracket', size: { w: 30, h: 140 } },
      { preset: 'rightBracket', name: 'Right Bracket', size: { w: 30, h: 140 } },
      { preset: 'leftBrace', name: 'Left Brace', size: { w: 40, h: 140 } },
      { preset: 'rightBrace', name: 'Right Brace', size: { w: 40, h: 140 } },
    ],
  },
  {
    id: 'arrows',
    label: 'Block Arrows',
    shapes: [
      { preset: 'rightArrow', name: 'Arrow: Right', size: FLAT },
      { preset: 'leftArrow', name: 'Arrow: Left', size: FLAT },
      { preset: 'upArrow', name: 'Arrow: Up', size: TALL },
      { preset: 'downArrow', name: 'Arrow: Down', size: TALL },
      { preset: 'leftRightArrow', name: 'Arrow: Left-Right', size: FLAT },
      { preset: 'upDownArrow', name: 'Arrow: Up-Down', size: TALL },
      { preset: 'quadArrow', name: 'Arrow: Quad', size: SQUARE },
      { preset: 'leftRightUpArrow', name: 'Arrow: Left-Right-Up', size: WIDE },
      { preset: 'bentArrow', name: 'Arrow: Bent', size: SQUARE },
      { preset: 'uturnArrow', name: 'Arrow: U-Turn', size: SQUARE },
      { preset: 'leftUpArrow', name: 'Arrow: Left-Up', size: SQUARE },
      { preset: 'bentUpArrow', name: 'Arrow: Bent-Up', size: SQUARE },
      { preset: 'curvedRightArrow', name: 'Arrow: Curved Right', size: { w: 80, h: 140 } },
      { preset: 'curvedLeftArrow', name: 'Arrow: Curved Left', size: { w: 80, h: 140 } },
      { preset: 'curvedUpArrow', name: 'Arrow: Curved Up', size: { w: 140, h: 80 } },
      { preset: 'curvedDownArrow', name: 'Arrow: Curved Down', size: { w: 140, h: 80 } },
      { preset: 'stripedRightArrow', name: 'Arrow: Striped Right', size: FLAT },
      { preset: 'notchedRightArrow', name: 'Arrow: Notched Right', size: FLAT },
      { preset: 'homePlate', name: 'Arrow: Pentagon', size: FLAT },
      { preset: 'chevron', name: 'Arrow: Chevron', size: FLAT },
      { preset: 'rightArrowCallout', name: 'Callout: Right Arrow', size: WIDE },
      { preset: 'downArrowCallout', name: 'Callout: Down Arrow', size: { w: 100, h: 160 } },
      { preset: 'leftArrowCallout', name: 'Callout: Left Arrow', size: WIDE },
      { preset: 'upArrowCallout', name: 'Callout: Up Arrow', size: { w: 100, h: 160 } },
      { preset: 'leftRightArrowCallout', name: 'Callout: Left-Right Arrow', size: { w: 180, h: 100 } },
      { preset: 'quadArrowCallout', name: 'Callout: Quad Arrow', size: { w: 160, h: 160 } },
      { preset: 'circularArrow', name: 'Arrow: Circular', size: SQUARE },
    ],
  },
  {
    id: 'equation',
    label: 'Equation Shapes',
    shapes: [
      { preset: 'mathPlus', name: 'Plus Sign', size: SQUARE },
      { preset: 'mathMinus', name: 'Minus Sign', size: { w: 120, h: 60 } },
      { preset: 'mathMultiply', name: 'Multiplication Sign', size: SQUARE },
      { preset: 'mathDivide', name: 'Division Sign', size: SQUARE },
      { preset: 'mathEqual', name: 'Equals', size: { w: 120, h: 90 } },
      { preset: 'mathNotEqual', name: 'Not Equal', size: SQUARE },
    ],
  },
  {
    id: 'flowchart',
    label: 'Flowchart',
    shapes: [
      { preset: 'flowChartProcess', name: 'Flowchart: Process', size: WIDE },
      { preset: 'flowChartAlternateProcess', name: 'Flowchart: Alternate Process', size: WIDE },
      { preset: 'flowChartDecision', name: 'Flowchart: Decision', size: WIDE },
      { preset: 'flowChartInputOutput', name: 'Flowchart: Data', size: WIDE },
      { preset: 'flowChartPredefinedProcess', name: 'Flowchart: Predefined Process', size: WIDE },
      { preset: 'flowChartInternalStorage', name: 'Flowchart: Internal Storage', size: SQUARE },
      { preset: 'flowChartDocument', name: 'Flowchart: Document', size: WIDE },
      { preset: 'flowChartMultidocument', name: 'Flowchart: Multidocument', size: WIDE },
      { preset: 'flowChartTerminator', name: 'Flowchart: Terminator', size: { w: 160, h: 60 } },
      { preset: 'flowChartPreparation', name: 'Flowchart: Preparation', size: WIDE },
      { preset: 'flowChartManualInput', name: 'Flowchart: Manual Input', size: WIDE },
      { preset: 'flowChartManualOperation', name: 'Flowchart: Manual Operation', size: WIDE },
      { preset: 'flowChartConnector', name: 'Flowchart: Connector', size: { w: 80, h: 80 } },
      { preset: 'flowChartOffpageConnector', name: 'Flowchart: Off-page Connector', size: { w: 80, h: 80 } },
      { preset: 'flowChartPunchedCard', name: 'Flowchart: Card', size: WIDE },
      { preset: 'flowChartPunchedTape', name: 'Flowchart: Punched Tape', size: WIDE },
      { preset: 'flowChartSummingJunction', name: 'Flowchart: Summing Junction', size: { w: 80, h: 80 } },
      { preset: 'flowChartOr', name: 'Flowchart: Or', size: { w: 80, h: 80 } },
      { preset: 'flowChartCollate', name: 'Flowchart: Collate', size: { w: 80, h: 100 } },
      { preset: 'flowChartSort', name: 'Flowchart: Sort', size: { w: 80, h: 100 } },
      { preset: 'flowChartExtract', name: 'Flowchart: Extract', size: { w: 100, h: 80 } },
      { preset: 'flowChartMerge', name: 'Flowchart: Merge', size: { w: 100, h: 80 } },
      { preset: 'flowChartOnlineStorage', name: 'Flowchart: Stored Data', size: WIDE },
      { preset: 'flowChartDelay', name: 'Flowchart: Delay', size: WIDE },
      { preset: 'flowChartMagneticTape', name: 'Flowchart: Sequential Access Storage', size: SQUARE },
      { preset: 'flowChartMagneticDisk', name: 'Flowchart: Magnetic Disk', size: { w: 100, h: 120 } },
      { preset: 'flowChartMagneticDrum', name: 'Flowchart: Direct Access Storage', size: WIDE },
      { preset: 'flowChartDisplay', name: 'Flowchart: Display', size: WIDE },
    ],
  },
  {
    id: 'stars',
    label: 'Stars and Banners',
    shapes: [
      { preset: 'irregularSeal1', name: 'Explosion: 8 Points', size: SQUARE },
      { preset: 'irregularSeal2', name: 'Explosion: 14 Points', size: SQUARE },
      { preset: 'star4', name: 'Star: 4 Points', size: SQUARE },
      { preset: 'star5', name: 'Star: 5 Points', size: SQUARE },
      { preset: 'star6', name: 'Star: 6 Points', size: SQUARE },
      { preset: 'star7', name: 'Star: 7 Points', size: SQUARE },
      { preset: 'star8', name: 'Star: 8 Points', size: SQUARE },
      { preset: 'star10', name: 'Star: 10 Points', size: SQUARE },
      { preset: 'star12', name: 'Star: 12 Points', size: SQUARE },
      { preset: 'star16', name: 'Star: 16 Points', size: SQUARE },
      { preset: 'star24', name: 'Star: 24 Points', size: SQUARE },
      { preset: 'star32', name: 'Star: 32 Points', size: SQUARE },
      { preset: 'ribbon2', name: 'Ribbon: Tilted Up', size: { w: 200, h: 80 } },
      { preset: 'ribbon', name: 'Ribbon: Tilted Down', size: { w: 200, h: 80 } },
      { preset: 'ellipseRibbon2', name: 'Ribbon: Curved and Tilted Up', size: { w: 200, h: 90 } },
      { preset: 'ellipseRibbon', name: 'Ribbon: Curved and Tilted Down', size: { w: 200, h: 90 } },
      { preset: 'verticalScroll', name: 'Scroll: Vertical', size: { w: 120, h: 160 } },
      { preset: 'horizontalScroll', name: 'Scroll: Horizontal', size: { w: 160, h: 120 } },
      { preset: 'wave', name: 'Wave', size: FLAT },
      { preset: 'doubleWave', name: 'Double Wave', size: FLAT },
    ],
  },
  {
    id: 'callouts',
    label: 'Callouts',
    shapes: [
      { preset: 'wedgeRectCallout', name: 'Speech Bubble: Rectangle', size: WIDE },
      { preset: 'wedgeRoundRectCallout', name: 'Speech Bubble: Rectangle with Corners Rounded', size: WIDE },
      { preset: 'wedgeEllipseCallout', name: 'Speech Bubble: Oval', size: WIDE },
      { preset: 'cloudCallout', name: 'Thought Bubble: Cloud', size: WIDE },
      { preset: 'borderCallout1', name: 'Callout: Line', size: WIDE },
      { preset: 'borderCallout2', name: 'Callout: Bent Line', size: WIDE },
      { preset: 'borderCallout3', name: 'Callout: Double Bent Line', size: WIDE },
      { preset: 'accentCallout1', name: 'Callout: Line with Accent Bar', size: WIDE },
      { preset: 'accentCallout2', name: 'Callout: Bent Line with Accent Bar', size: WIDE },
      { preset: 'accentCallout3', name: 'Callout: Double Bent Line with Accent Bar', size: WIDE },
      { preset: 'callout1', name: 'Callout: Line with No Border', size: WIDE },
      { preset: 'callout2', name: 'Callout: Bent Line with No Border', size: WIDE },
      { preset: 'callout3', name: 'Callout: Double Bent Line with No Border', size: WIDE },
      { preset: 'accentBorderCallout1', name: 'Callout: Line with Border and Accent Bar', size: WIDE },
      { preset: 'accentBorderCallout2', name: 'Callout: Bent Line with Border and Accent Bar', size: WIDE },
      { preset: 'accentBorderCallout3', name: 'Callout: Double Bent Line with Border and Accent Bar', size: WIDE },
    ],
  },
];

// Every entry gets an id (the preset name unless it has its own) and its category
for (const category of SHAPE_CATEGORIES) {
  for (const item of category.shapes) {
    if (!item.id) item.id = item.preset;
    item.category = category.id;
  }
}

const BY_ID = new Map(SHAPE_CATEGORIES.flatMap((c) => c.shapes.map((s) => [s.id, s])));

export function getGalleryItem(id) {
  return BY_ID.get(id) || null;
}

export function allGalleryItems() {
  return [...BY_ID.values()];
}
