// Guide mode words for the Unit 9 calculators (see src/app/components/method/calcGuide.js).
// id: { howTo: [steps], help: { boxKey: text }, maths: [boxKeys that take a formula] }
// In the text, `code` marks what to type and **bold** the words to look for. {button} becomes the card's button.
const GUIDES = {
  'area-perimeter': {
    howTo: [
      "Choose the shape from the menu; its picture shows what each letter means.",
      "Type the lengths you know, all in the same unit.",
      "Press {button} for the area and perimeter, with the formula used.",
    ],
  },
  'volume-surface-area': {
    howTo: [
      "Choose the solid from the menu; its picture shows what each letter means.",
      "Type the lengths you know, all in the same unit.",
      "Press {button} for the volume and surface area, with the formula used.",
    ],
  },
  pythagoras: {
    howTo: [
      "Type the two sides you know and leave the missing one **empty**.",
      "a and b are the two shorter sides; c is the hypotenuse, the longest side opposite the right angle.",
      "Press {button}. Fill all three to check whether a triangle is right-angled.",
    ],
  },
  'triangle-solver': {
    howTo: [
      "Type the three things you know (sides or angles), leaving the others empty. You need at least one side.",
      "Angles are in degrees.",
      "Press {button}. NETZ picks the sine rule or the cosine rule and finds the rest, including the area.",
    ],
  },
  'unit-circle': {
    howTo: [
      "Drag the point round the circle, or type an angle in degrees or radians (`pi/6`).",
      "Read sin, cos and tan for that angle; x is cos θ and y is sin θ.",
    ],
    help: { unit: "Degrees: 30, 45, 60. Radians: `pi/6`, `pi/4`." },
  },
  'coordinate-geometry': {
    howTo: [
      "Choose what to find: distance, midpoint, slope, line equation, section formula, angle between lines …",
      "Type the points as numbers in the boxes (x₁, y₁, x₂, y₂ …).",
      "Press {button}.",
    ],
    help: {
      mode: "What you want to find.",
      m: "The first part of the ratio m : n.",
      n: "The second part of the ratio.",
      external: "Internally: the point lies between A and B. Externally: outside.",
      m1: "Slope of the first line.",
      m2: "Slope of the second line.",
      a: "The a in ax + by + c = 0.",
      b: "The b in ax + by + c = 0.",
      c: "The c in ax + by + c = 0.",
    },
  },
  circles: {
    howTo: [
      "Choose what you have: centre and radius, the general equation, or three points on the circle.",
      "Type the numbers (or the equation).",
      "Optionally add a point P to see whether it is inside, on or outside. Press {button}.",
    ],
    help: {
      from: "What the question gives you.",
      h: "x of the centre.", k: "y of the centre.", r: "The radius.",
      eq: "The circle's equation, e.g. `x^2 + y^2 - 4x + 6y - 12 = 0`.",
      x1: "x of the first point.", y1: "y of the first point.",
      x2: "x of the second point.", y2: "y of the second point.",
      x3: "x of the third point.", y3: "y of the third point.",
      px: "Optional: x of a point P.", py: "Optional: y of P.",
    },
    maths: ['eq'],
  },
  conics: {
    howTo: ["Type the equation in x and y, e.g. `x^2/16 - y^2/9 = 1`.", "Press {button}. NETZ says which conic it is and gives its centre, foci, vertices, eccentricity and directrices."],
    help: { eq: "Any parabola, ellipse or hyperbola with no xy term." },
    maths: ['eq'],
  },
  'geometry-3d': {
    howTo: ["Choose what to find: distance, angle, plane through points, line–plane meeting point …", "Type points and directions as three numbers: `1, -2, 3`. Planes as equations: `2x + y - 2z = 5`.", "Press {button}."],
    help: {
      mode: "What to find.",
      p: "A point, as `x, y, z`.", q: "A second point.", s: "A third point.",
      d1: "Direction of the first line, as three numbers.", d2: "Direction of the second line.",
      plane: "A plane: `2x + y - 2z = 5`.", plane2: "A second plane.",
    },
  },
  'heights-distances': {
    howTo: [
      "Choose the kind of problem: one angle, two angles from two points, or angles of elevation and depression.",
      "Type what you know: distances, heights and angles (in degrees).",
      "Press {button}. With 30°, 45° and 60° the answer is exact, like 10√3 m.",
    ],
    help: {
      type: "Which picture matches your question.",
      d: "The distance along the ground.",
      h: "A known height.",
      theta: "The angle of elevation (or depression), in degrees.",
      alpha: "The bigger angle, from the nearer point.",
      beta: "The smaller angle, from the farther point.",
      side: "Whether both points are on the same side of the object or on opposite sides.",
      eye: "Optional: the observer's eye height, added to the answer.",
      unit: "The unit to show, e.g. `m`.",
    },
  },
  'inverse-trig': {
    howTo: ["Choose what to find: a principal value, simplify, or an identity like tan⁻¹a + tan⁻¹b.", "Type the value (`-1/2`, `sqrt(3)/2`) or the angle (`5pi/6`).", "Press {button}."],
    help: {
      mode: "What to work out.",
      fn: "Which inverse function: sin⁻¹, cos⁻¹, tan⁻¹ …",
      value: "The number inside, e.g. `-1/2`.",
      angle: "An angle in radians, written with pi: `5pi/6`.",
      a: "The first number.", b: "The second number.", op: "Add or subtract.",
    },
  },
  'polar-coordinates': {
    howTo: ["Choose the conversion: Cartesian to polar, polar to Cartesian, shifting the origin, or a curve.", "Type the numbers (or the curve `r = 4cos(θ)`).", "Press {button}."],
    help: {
      mode: "Which conversion.",
      x: "The x-coordinate.", y: "The y-coordinate.", r: "The distance from the origin.",
      theta: "The angle θ.", unit: "Degrees or radians.",
      h: "x of the new origin.", k: "y of the new origin.", curve: "A polar curve like `r = 4cos(θ)`.",
    },
    maths: ['curve'],
  },
  'trig-equations': {
    howTo: ["Type the equation in x: `2sin(x) - 1 = 0`.", "Press {button} for the principal solution and the general solution (in radians, with degrees too)."],
    help: { equation: "Write powers as `sin(x)^2`." },
    maths: ['equation'],
  },
  'trig-identities': {
    howTo: ["Type the identity, using x for the angle: `tan(x) + cot(x) = sec(x) csc(x)`.", "Press {button}. NETZ checks it at many angles first, then proves it step by step."],
    help: { identity: "Both sides with an = sign. Powers as `sin(x)^2`." },
    maths: ['identity'],
  },
};

export default GUIDES;
