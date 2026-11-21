// Worked examples, symbol keys and common mistakes for the (UNIT-9) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "3d-geometry": {
    "example": {
      "question": "Find the shortest distance between the lines $\\vec r = (1, 2, 3) + \\lambda(2, 3, 4)$ and $\\vec r = (2, 4, 5) + \\mu(3, 4, 5)$.",
      "steps": [
        {
          "title": "Read off a point and a direction on each line",
          "math": [
            "P_1 = (1, 2, 3),\\ \\ \\vec d_1 = (2, 3, 4) \\qquad P_2 = (2, 4, 5),\\ \\ \\vec d_2 = (3, 4, 5)"
          ]
        },
        {
          "title": "Cross product of the directions",
          "text": "This vector is at right angles to both lines.",
          "math": [
            "\\vec d_1 \\times \\vec d_2 = \\begin{vmatrix} \\hat i & \\hat j & \\hat k \\\\ 2 & 3 & 4 \\\\ 3 & 4 & 5 \\end{vmatrix}",
            "= \\hat i(15 - 16) - \\hat j(10 - 12) + \\hat k(8 - 9) = (-1, 2, -1)",
            "|\\vec d_1 \\times \\vec d_2| = \\sqrt{1 + 4 + 1} = \\sqrt 6"
          ]
        },
        {
          "title": "Join the two points",
          "math": [
            "\\vec P_2 - \\vec P_1 = (2 - 1,\\ 4 - 2,\\ 5 - 3) = (1, 2, 2)"
          ]
        },
        {
          "title": "Project onto the common perpendicular",
          "math": [
            "D = \\frac{|(\\vec P_2 - \\vec P_1) \\cdot (\\vec d_1 \\times \\vec d_2)|}{|\\vec d_1 \\times \\vec d_2|}",
            "= \\frac{|1(-1) + 2(2) + 2(-1)|}{\\sqrt 6} = \\frac{|-1 + 4 - 2|}{\\sqrt 6} = \\frac{1}{\\sqrt 6}"
          ]
        }
      ],
      "answer": "$$D = \\frac{1}{\\sqrt 6} = \\frac{\\sqrt 6}{6} \\approx 0.4082$$"
    },
    "symbols": [
      {
        "s": "P_1,\\ P_2",
        "t": "A known point on each line.",
        "e": "(1,2,3),\\ (2,4,5)"
      },
      {
        "s": "\\vec d_1,\\ \\vec d_2",
        "t": "The direction vectors of the lines.",
        "e": ""
      },
      {
        "s": "\\vec d_1 \\times \\vec d_2",
        "t": "The cross product: perpendicular to both lines.",
        "e": "(-1, 2, -1)"
      },
      {
        "s": "D",
        "t": "The shortest (perpendicular) distance between the lines.",
        "e": "\\tfrac{1}{\\sqrt 6}"
      },
      {
        "s": "l, m, n",
        "t": "Direction cosines: a unit direction, $l^2 + m^2 + n^2 = 1$.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Sign of the middle term in the cross product.",
        "f": "The $\\hat j$ term has a minus in front: $-\\hat j(a_1b_3 - a_3b_1)$."
      },
      {
        "m": "Forgetting the modulus.",
        "f": "Take the absolute value of the dot product: a distance is never negative."
      },
      {
        "m": "Using the formula on parallel lines.",
        "f": "If $\\vec d_1 \\times \\vec d_2 = 0$ the lines are parallel; use the point-to-line distance instead."
      },
      {
        "m": "D = 0 means a mistake.",
        "f": "No: D = 0 means the lines meet."
      }
    ]
  },
  "area-and-perimeter": {
    "example": null,
    "symbols": [
      {
        "s": "P",
        "t": "The perimeter: the distance all the way round.",
        "e": "42 \\text{ m}"
      },
      {
        "s": "A",
        "t": "The area: the space inside, in square units.",
        "e": "84 \\text{ m}^2"
      },
      {
        "s": "a, b, c",
        "t": "The side lengths of the triangle.",
        "e": "13, 14, 15"
      },
      {
        "s": "s = \\frac{a + b + c}{2}",
        "t": "The half-perimeter (semi-perimeter).",
        "e": "21"
      },
      {
        "s": "A = \\sqrt{s(s-a)(s-b)(s-c)}",
        "t": "Heron’s formula: area from three sides.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using the full perimeter in Heron’s formula.",
        "f": "Heron uses s, half of the perimeter."
      },
      {
        "m": "Mixing units.",
        "f": "Change every length to the same unit first; area is in square units."
      },
      {
        "m": "Using a slant side as the height.",
        "f": "$\\tfrac12 bh$ needs the perpendicular height."
      },
      {
        "m": "Radius and diameter.",
        "f": "Circle area is $\\pi r^2$ with the radius, half the diameter."
      }
    ]
  },
  "circle-equation-calculator": {
    "example": {
      "question": "Find the centre and radius of $x^2 + y^2 - 4x + 6y - 12 = 0$, show that $P(5, 1)$ lies on it, and find the tangent at P.",
      "steps": [
        {
          "title": "Compare with x² + y² + 2gx + 2fy + c = 0",
          "math": [
            "2g = -4, \\ 2f = 6 \\Rightarrow g = -2, \\ f = 3, \\ c = -12"
          ]
        },
        {
          "title": "Centre and radius",
          "math": [
            "\\text{centre } (-g, -f), \\quad r = \\sqrt{g^2 + f^2 - c}",
            "\\text{Centre } (2, -3), \\quad r = \\sqrt{4 + 9 - (-12)} = \\sqrt{25} = 5"
          ]
        },
        {
          "title": "Where is the point?",
          "math": [
            "S_1 = 5^2 + 1^2 - 4(5) + 6(1) - 12 = 0",
            "S_1 = 0: \\text{ P is on the circle}",
            "\\text{Tangent at P: } xx_1 + yy_1 + g(x + x_1) + f(y + y_1) + c = 0",
            "3x + 4y - 19 = 0"
          ]
        }
      ],
      "answer": "$$\\text{Centre } (2, -3),\\quad r = 5,\\quad \\text{tangent at } P:\\ 3x + 4y - 19 = 0$$"
    },
    "symbols": [
      {
        "s": "(x - h)^2 + (y - k)^2 = r^2",
        "t": "The standard form: centre (h, k), radius r.",
        "e": ""
      },
      {
        "s": "x^2 + y^2 + 2gx + 2fy + c = 0",
        "t": "The general form.",
        "e": "g = -2,\\ f = 3,\\ c = -12"
      },
      {
        "s": "(-g, -f)",
        "t": "The centre from the general form.",
        "e": "(2, -3)"
      },
      {
        "s": "r = \\sqrt{g^2 + f^2 - c}",
        "t": "The radius from the general form.",
        "e": "5"
      },
      {
        "s": "S_1",
        "t": "The left side with the point put in: 0 on, < 0 inside, > 0 outside.",
        "e": "0"
      }
    ],
    "mistakes": [
      {
        "m": "Taking −4 as g.",
        "f": "$2g = -4$, so $g = -2$: halve the coefficients first."
      },
      {
        "m": "Centre signs.",
        "f": "The centre is $(-g, -f)$; from $(x - 2)^2$ the x-value is +2."
      },
      {
        "m": "Forgetting x² and y² must have coefficient 1.",
        "f": "Divide the whole equation first, e.g. by 2 for $2x^2 + 2y^2 + \\dots$"
      },
      {
        "m": "Calling $g^2 + f^2 - c < 0$ a circle.",
        "f": "Then there is no real circle."
      }
    ]
  },
  "conic-sections-calculator": {
    "example": {
      "question": "Find the eccentricity, foci and latus rectum of the conic $4x^2 + 9y^2 = 36$.",
      "steps": [
        {
          "title": "Divide to get the standard form",
          "text": "Divide both sides by 36 so the right side is 1.",
          "math": [
            "\\frac{4x^2}{36} + \\frac{9y^2}{36} = \\frac{36}{36} \\ \\Rightarrow\\ \\frac{x^2}{9} + \\frac{y^2}{4} = 1"
          ]
        },
        {
          "title": "Name the conic and read a, b",
          "text": "Both squares are added with different denominators: an ellipse. The larger denominator is under $x^2$, so the major axis lies along x.",
          "math": [
            "a^2 = 9,\\ b^2 = 4 \\ \\Rightarrow\\ a = 3,\\ b = 2"
          ]
        },
        {
          "title": "Focal distance and eccentricity",
          "math": [
            "c^2 = a^2 - b^2 = 9 - 4 = 5 \\ \\Rightarrow\\ c = \\sqrt 5",
            "e = \\frac{c}{a} = \\frac{\\sqrt 5}{3} \\approx 0.745 \\quad (< 1 \\ \\checkmark)"
          ]
        },
        {
          "title": "Foci, vertices, latus rectum",
          "math": [
            "\\text{Foci } (\\pm c, 0) = (\\pm\\sqrt 5, 0), \\qquad \\text{vertices } (\\pm 3, 0)",
            "\\text{Latus rectum} = \\frac{2b^2}{a} = \\frac{2(4)}{3} = \\frac{8}{3}"
          ]
        }
      ],
      "answer": "$$\\text{Ellipse: } e = \\frac{\\sqrt5}{3},\\ \\text{foci } (\\pm\\sqrt5, 0),\\ \\text{latus rectum } \\frac83$$"
    },
    "symbols": [
      {
        "s": "a",
        "t": "The semi-major axis (half the longer axis).",
        "e": "3"
      },
      {
        "s": "b",
        "t": "The semi-minor axis.",
        "e": "2"
      },
      {
        "s": "c",
        "t": "The centre-to-focus distance.",
        "e": "\\sqrt 5"
      },
      {
        "s": "e",
        "t": "The eccentricity: 0 < e < 1 ellipse, e = 1 parabola, e > 1 hyperbola.",
        "e": "\\tfrac{\\sqrt5}{3}"
      },
      {
        "s": "c^2 = a^2 - b^2",
        "t": "For an ellipse; for a hyperbola $c^2 = a^2 + b^2$.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Ellipse and hyperbola formulas mixed.",
        "f": "Ellipse: $c^2 = a^2 - b^2$; hyperbola: $c^2 = a^2 + b^2$."
      },
      {
        "m": "Not dividing to get 1 on the right.",
        "f": "Read a² and b² only from the form $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$."
      },
      {
        "m": "Using a² as a.",
        "f": "$a^2 = 9$ gives $a = 3$; take the square root before $e = c/a$."
      },
      {
        "m": "Wrong axis.",
        "f": "The larger denominator decides the major axis (x here, so foci on the x-axis)."
      }
    ]
  },
  "coordinate-geometry": {
    "example": null,
    "symbols": [
      {
        "s": "(x_1, y_1),\\ (x_2, y_2)",
        "t": "The two given points.",
        "e": "(1, 2),\\ (3, 8)"
      },
      {
        "s": "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
        "t": "The distance formula.",
        "e": "2\\sqrt{10}"
      },
      {
        "s": "M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)",
        "t": "The midpoint.",
        "e": "(2, 5)"
      },
      {
        "s": "m = \\frac{y_2 - y_1}{x_2 - x_1}",
        "t": "The slope (gradient).",
        "e": "3"
      },
      {
        "s": "y - y_1 = m(x - x_1)",
        "t": "The point–slope form of a line.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Mixing the order in the slope.",
        "f": "Subtract in the same order on top and bottom: $(y_2 - y_1)/(x_2 - x_1)$."
      },
      {
        "m": "Forgetting to square the differences.",
        "f": "Distance needs $(\\Delta x)^2 + (\\Delta y)^2$ under the root."
      },
      {
        "m": "Vertical line slope.",
        "f": "If $x_1 = x_2$ the slope is undefined; the line is $x = x_1$."
      },
      {
        "m": "Perpendicular slopes.",
        "f": "Perpendicular lines have $m_1 m_2 = -1$, not equal slopes."
      }
    ]
  },
  "heights-and-distances": {
    "example": {
      "question": "The angle of elevation of the top of a tower changes from 30° to 60° as you walk 20 m towards it. Find the height of the tower.",
      "steps": [
        {
          "title": "Draw the two right triangles",
          "text": "Let the height be h and the distance from the nearer point be x. The farther point is x + 20 from the foot.",
          "math": [
            "\\tan 60^\\circ = \\frac{h}{x}, \\qquad \\tan 30^\\circ = \\frac{h}{x + 20}"
          ]
        },
        {
          "title": "Write x from the nearer point",
          "math": [
            "\\sqrt 3 = \\frac{h}{x} \\ \\Rightarrow\\ x = \\frac{h}{\\sqrt 3}"
          ]
        },
        {
          "title": "Put it in the farther triangle",
          "math": [
            "\\frac{1}{\\sqrt 3} = \\frac{h}{\\frac{h}{\\sqrt 3} + 20}",
            "\\frac{h}{\\sqrt 3} + 20 = \\sqrt 3\\,h",
            "20 = \\sqrt 3\\,h - \\frac{h}{\\sqrt 3} = \\frac{3h - h}{\\sqrt 3} = \\frac{2h}{\\sqrt 3}"
          ]
        },
        {
          "title": "Solve for h",
          "math": [
            "h = \\frac{20\\sqrt 3}{2} = 10\\sqrt 3 \\approx 17.32 \\text{ m}",
            "x = \\frac{10\\sqrt 3}{\\sqrt 3} = 10 \\text{ m}"
          ]
        }
      ],
      "answer": "$$h = 10\\sqrt 3 \\approx 17.32 \\text{ m}$$"
    },
    "symbols": [
      {
        "s": "h",
        "t": "The height of the object.",
        "e": "10\\sqrt 3 \\text{ m}"
      },
      {
        "s": "x",
        "t": "The horizontal distance from the nearer point to the foot.",
        "e": "10 \\text{ m}"
      },
      {
        "s": "\\alpha,\\ \\beta",
        "t": "The angles of elevation from the two points.",
        "e": "60^\\circ,\\ 30^\\circ"
      },
      {
        "s": "\\tan\\theta = \\frac{\\text{opposite}}{\\text{adjacent}}",
        "t": "The ratio that links height and ground distance.",
        "e": ""
      },
      {
        "s": "\\text{depression}",
        "t": "Angle below the horizontal; it equals the elevation from the other end.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Measuring the angle from the vertical.",
        "f": "Elevation and depression are measured from the horizontal."
      },
      {
        "m": "Using sin when only the ground distance is known.",
        "f": "Height and ground distance are opposite and adjacent: use tan."
      },
      {
        "m": "Adding 20 to the wrong triangle.",
        "f": "The smaller angle (30°) is from the farther point, so it gets x + 20."
      },
      {
        "m": "Forgetting eye level.",
        "f": "If the observer’s eye is above the ground, add that height at the end."
      }
    ]
  },
  "inverse-trig-functions": {
    "example": {
      "question": "Find the principal value of $\\cos^{-1}\\left(-\\tfrac12\\right)$.",
      "steps": [
        {
          "title": "What it means",
          "text": "Find the angle θ in the principal range $[0, \\pi]$ whose cosine is $-\\tfrac12$.",
          "math": [
            "\\cos^{-1}\\left(-\\tfrac12\\right) = \\theta \\iff \\cos\\theta = -\\tfrac12,\\ \\ \\theta \\in [0, \\pi]"
          ]
        },
        {
          "title": "Use the rule for a negative value",
          "math": [
            "\\cos^{-1}(-x) = \\pi - \\cos^{-1}(x)"
          ]
        },
        {
          "title": "The positive value first",
          "math": [
            "\\cos\\frac{\\pi}{3} = \\frac12 \\ \\Rightarrow\\ \\cos^{-1}\\left(\\tfrac12\\right) = \\frac{\\pi}{3}"
          ]
        },
        {
          "title": "Put it in",
          "math": [
            "\\cos^{-1}\\left(-\\tfrac12\\right) = \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}",
            "\\text{Check: } \\cos 120^\\circ = -\\cos 60^\\circ = -\\tfrac12 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\cos^{-1}\\left(-\\tfrac12\\right) = \\frac{2\\pi}{3} = 120^\\circ$$"
    },
    "symbols": [
      {
        "s": "\\sin^{-1}x",
        "t": "The angle whose sine is x; range $[-\\frac\\pi2, \\frac\\pi2]$.",
        "e": ""
      },
      {
        "s": "\\cos^{-1}x",
        "t": "The angle whose cosine is x; range $[0, \\pi]$.",
        "e": "\\tfrac{2\\pi}{3}"
      },
      {
        "s": "\\tan^{-1}x",
        "t": "The angle whose tangent is x; range $(-\\frac\\pi2, \\frac\\pi2)$.",
        "e": ""
      },
      {
        "s": "\\text{principal value}",
        "t": "The one answer inside the stated range.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Reading $\\cos^{-1}x$ as $\\frac{1}{\\cos x}$.",
        "f": "That is sec x. $\\cos^{-1}$ means the inverse function."
      },
      {
        "m": "Answer outside the range.",
        "f": "$\\cos^{-1}(-\\frac12)$ is not $-\\frac\\pi3$: cos⁻¹ gives angles from 0 to π."
      },
      {
        "m": "Wrong negative rule.",
        "f": "$\\sin^{-1}(-x) = -\\sin^{-1}x$ but $\\cos^{-1}(-x) = \\pi - \\cos^{-1}x$."
      },
      {
        "m": "Values outside [−1, 1].",
        "f": "$\\sin^{-1}x$ and $\\cos^{-1}x$ are defined only for $-1 \\le x \\le 1$."
      }
    ]
  },
  "polar-coordinates": {
    "example": {
      "question": "Write the point $(-1, \\sqrt3)$ in polar coordinates $(r, \\theta)$.",
      "steps": [
        {
          "title": "Distance from the pole",
          "math": [
            "r = \\sqrt{x^2 + y^2} = \\sqrt{(-1)^2 + (\\sqrt3)^2} = \\sqrt{1 + 3} = 2"
          ]
        },
        {
          "title": "Find the quadrant",
          "text": "x < 0 and y > 0, so the point is in quadrant II."
        },
        {
          "title": "Reference angle, then θ",
          "math": [
            "\\tan\\alpha = \\left|\\frac{y}{x}\\right| = \\frac{\\sqrt3}{1} \\ \\Rightarrow\\ \\alpha = \\frac{\\pi}{3}",
            "\\theta = \\pi - \\alpha = \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}"
          ]
        },
        {
          "title": "Check by converting back",
          "math": [
            "x = r\\cos\\theta = 2\\cos\\frac{2\\pi}{3} = 2\\left(-\\tfrac12\\right) = -1 \\ \\checkmark",
            "y = r\\sin\\theta = 2\\sin\\frac{2\\pi}{3} = 2\\left(\\tfrac{\\sqrt3}{2}\\right) = \\sqrt3 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$(r, \\theta) = \\left(2, \\frac{2\\pi}{3}\\right)$$"
    },
    "symbols": [
      {
        "s": "r",
        "t": "The distance from the pole (origin).",
        "e": "2"
      },
      {
        "s": "\\theta",
        "t": "The angle from the positive x-axis, anticlockwise.",
        "e": "\\tfrac{2\\pi}{3}"
      },
      {
        "s": "x = r\\cos\\theta,\\ y = r\\sin\\theta",
        "t": "Polar to Cartesian.",
        "e": ""
      },
      {
        "s": "r = \\sqrt{x^2 + y^2}",
        "t": "Cartesian to polar (distance).",
        "e": ""
      },
      {
        "s": "\\alpha",
        "t": "The reference angle in the first quadrant.",
        "e": "\\tfrac{\\pi}{3}"
      }
    ],
    "mistakes": [
      {
        "m": "Taking $\\tan^{-1}(y/x)$ as θ directly.",
        "f": "That gives $-\\frac\\pi3$ here. Find the quadrant first, then adjust."
      },
      {
        "m": "Forgetting to square the negative.",
        "f": "$(-1)^2 = 1$, so r is always positive."
      },
      {
        "m": "Degrees and radians mixed.",
        "f": "Give θ in one unit and say which."
      },
      {
        "m": "Thinking the pair is unique.",
        "f": "$(2, \\frac{2\\pi}{3} + 2\\pi)$ is the same point; give θ in $[0, 2\\pi)$ unless told otherwise."
      }
    ]
  },
  "pythagoras-theorem": {
    "example": null,
    "symbols": [
      {
        "s": "a, b",
        "t": "The two shorter sides (legs), meeting at the right angle.",
        "e": "5,\\ 12"
      },
      {
        "s": "c",
        "t": "The hypotenuse: the longest side, opposite the right angle.",
        "e": "13"
      },
      {
        "s": "a^2 + b^2 = c^2",
        "t": "Pythagoras’ theorem (right triangles only).",
        "e": "25 + 144 = 169"
      },
      {
        "s": "a = \\sqrt{c^2 - b^2}",
        "t": "Finding a leg: subtract the squares.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Adding when finding a leg.",
        "f": "For a leg, subtract: $a^2 = c^2 - b^2$."
      },
      {
        "m": "Wrong side as the hypotenuse.",
        "f": "The hypotenuse is opposite the right angle and is always the longest."
      },
      {
        "m": "Using it on a non-right triangle.",
        "f": "Without a 90° angle use the cosine rule."
      },
      {
        "m": "Forgetting the square root.",
        "f": "$a^2 = 25$ gives $a = 5$, not 25."
      }
    ]
  },
  "triangle-solver": {
    "example": null,
    "symbols": [
      {
        "s": "a, b, c",
        "t": "The sides, each opposite the angle with the same capital letter.",
        "e": "7, 8, 9"
      },
      {
        "s": "A, B, C",
        "t": "The angles; they add to 180°.",
        "e": ""
      },
      {
        "s": "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}",
        "t": "The sine rule.",
        "e": ""
      },
      {
        "s": "a^2 = b^2 + c^2 - 2bc\\cos A",
        "t": "The cosine rule.",
        "e": ""
      },
      {
        "s": "\\tfrac12 bc\\sin A",
        "t": "The area from two sides and the angle between them.",
        "e": "12\\sqrt5"
      }
    ],
    "mistakes": [
      {
        "m": "Pairing a side with the wrong angle.",
        "f": "Side a is opposite angle A; keep each pair together."
      },
      {
        "m": "Missing the second triangle (SSA).",
        "f": "With two sides and a non-included angle, check whether 180° − B also works."
      },
      {
        "m": "Calculator in radians.",
        "f": "Set degrees before taking cos⁻¹ or sin⁻¹."
      },
      {
        "m": "Using the sine rule for SSS.",
        "f": "With three sides, start with the cosine rule."
      }
    ]
  },
  "trigonometric-equations": {
    "example": {
      "question": "Solve $2\\cos^2 x + 3\\cos x + 1 = 0$ for $0 \\le x < 2\\pi$, and give the general solution.",
      "steps": [
        {
          "title": "Treat it as a quadratic in cos x",
          "text": "Put $c = \\cos x$.",
          "math": [
            "2c^2 + 3c + 1 = 0"
          ]
        },
        {
          "title": "Factorise",
          "math": [
            "2c^2 + 2c + c + 1 = 2c(c + 1) + 1(c + 1) = (2c + 1)(c + 1) = 0",
            "\\cos x = -\\tfrac12 \\quad \\text{or} \\quad \\cos x = -1"
          ]
        },
        {
          "title": "General solution of each",
          "math": [
            "\\cos x = -\\tfrac12 = \\cos\\frac{2\\pi}{3} \\ \\Rightarrow\\ x = 2n\\pi \\pm \\frac{2\\pi}{3}",
            "\\cos x = -1 = \\cos\\pi \\ \\Rightarrow\\ x = 2n\\pi \\pm \\pi = (2n + 1)\\pi"
          ]
        },
        {
          "title": "Solutions in [0, 2π)",
          "math": [
            "x = \\frac{2\\pi}{3},\\ \\ \\pi,\\ \\ \\frac{4\\pi}{3} \\qquad (120^\\circ,\\ 180^\\circ,\\ 240^\\circ)"
          ]
        }
      ],
      "answer": "$$x = \\frac{2\\pi}{3},\\ \\pi,\\ \\frac{4\\pi}{3}; \\qquad x = 2n\\pi \\pm \\frac{2\\pi}{3} \\text{ or } x = (2n + 1)\\pi$$"
    },
    "symbols": [
      {
        "s": "n",
        "t": "Any integer: … −1, 0, 1, 2 …",
        "e": ""
      },
      {
        "s": "\\sin x = \\sin\\alpha \\Rightarrow x = n\\pi + (-1)^n\\alpha",
        "t": "General solution for sine.",
        "e": ""
      },
      {
        "s": "\\cos x = \\cos\\alpha \\Rightarrow x = 2n\\pi \\pm \\alpha",
        "t": "General solution for cosine.",
        "e": ""
      },
      {
        "s": "\\tan x = \\tan\\alpha \\Rightarrow x = n\\pi + \\alpha",
        "t": "General solution for tangent.",
        "e": ""
      },
      {
        "s": "\\alpha",
        "t": "One known angle with the right value (the principal value).",
        "e": "\\tfrac{2\\pi}{3}"
      }
    ],
    "mistakes": [
      {
        "m": "Dividing by cos x.",
        "f": "That loses the solutions with cos x = 0. Factorise instead."
      },
      {
        "m": "Keeping impossible roots.",
        "f": "Reject any root with |cos x| > 1 or |sin x| > 1."
      },
      {
        "m": "Only one angle per value.",
        "f": "Each value gives two angles in [0, 2π) (except ±1)."
      },
      {
        "m": "Mixing the general forms.",
        "f": "Cos uses $2n\\pi \\pm \\alpha$; sin uses $n\\pi + (-1)^n\\alpha$."
      }
    ]
  },
  "trigonometric-identities": {
    "example": {
      "question": "Prove that $\\tan x + \\cot x = \\sec x \\csc x$.",
      "steps": [
        {
          "title": "Write the left side in sin and cos",
          "math": [
            "\\text{LHS} = \\tan x + \\cot x = \\frac{\\sin x}{\\cos x} + \\frac{\\cos x}{\\sin x}"
          ]
        },
        {
          "title": "Put it over one denominator",
          "math": [
            "= \\frac{\\sin x \\cdot \\sin x + \\cos x \\cdot \\cos x}{\\cos x \\sin x} = \\frac{\\sin^2 x + \\cos^2 x}{\\sin x \\cos x}"
          ]
        },
        {
          "title": "Use sin² x + cos² x = 1",
          "math": [
            "= \\frac{1}{\\sin x \\cos x}"
          ]
        },
        {
          "title": "Match the right side",
          "math": [
            "= \\frac{1}{\\cos x} \\cdot \\frac{1}{\\sin x} = \\sec x \\csc x = \\text{RHS} \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\tan x + \\cot x = \\frac{1}{\\sin x\\cos x} = \\sec x\\csc x$$"
    },
    "symbols": [
      {
        "s": "\\tan x = \\frac{\\sin x}{\\cos x}",
        "t": "Tangent in sin and cos.",
        "e": ""
      },
      {
        "s": "\\cot x = \\frac{\\cos x}{\\sin x}",
        "t": "Cotangent: the reciprocal of tan.",
        "e": ""
      },
      {
        "s": "\\sec x = \\frac{1}{\\cos x},\\ \\csc x = \\frac{1}{\\sin x}",
        "t": "Secant and cosecant.",
        "e": ""
      },
      {
        "s": "\\sin^2 x + \\cos^2 x = 1",
        "t": "The Pythagorean identity.",
        "e": ""
      },
      {
        "s": "\\text{LHS},\\ \\text{RHS}",
        "t": "Left-hand side and right-hand side.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Working on both sides at once like an equation.",
        "f": "Start from one side (usually the harder one) and turn it into the other."
      },
      {
        "m": "Adding fractions without a common denominator.",
        "f": "$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$."
      },
      {
        "m": "Writing $\\sin^2 x$ as $\\sin x^2$.",
        "f": "$\\sin^2 x = (\\sin x)^2$; $\\sin(x^2)$ is something else."
      },
      {
        "m": "Checking one angle and calling it proved.",
        "f": "A numeric check is a test, not a proof."
      }
    ]
  },
  "unit-circle": {
    "example": null,
    "symbols": [
      {
        "s": "(\\cos\\theta, \\sin\\theta)",
        "t": "The point on the unit circle at angle θ.",
        "e": "\\left(-\\tfrac{\\sqrt3}{2}, \\tfrac12\\right)"
      },
      {
        "s": "\\text{reference angle}",
        "t": "The acute angle to the x-axis.",
        "e": "30^\\circ"
      },
      {
        "s": "ASTC",
        "t": "Which ratios are positive: All, Sin, Tan, Cos in quadrants I–IV.",
        "e": ""
      },
      {
        "s": "\\text{rad} = \\deg \\times \\frac{\\pi}{180}",
        "t": "Degrees to radians.",
        "e": "\\tfrac{5\\pi}{6}"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the sign.",
        "f": "Find the quadrant first; use ASTC for the sign."
      },
      {
        "m": "Swapping sin and cos.",
        "f": "x-coordinate is cos θ, y-coordinate is sin θ."
      },
      {
        "m": "Reference angle measured to the y-axis.",
        "f": "Always measure to the nearest part of the x-axis."
      },
      {
        "m": "tan at 90°.",
        "f": "cos 90° = 0, so tan 90° is undefined."
      }
    ]
  },
  "volume-and-surface-area": {
    "example": null,
    "symbols": [
      {
        "s": "V",
        "t": "The volume: space inside, in cubic units.",
        "e": "1540 \\text{ cm}^3"
      },
      {
        "s": "CSA",
        "t": "The curved (lateral) surface area.",
        "e": "440 \\text{ cm}^2"
      },
      {
        "s": "TSA",
        "t": "The total surface area: curved part plus the flat ends.",
        "e": "748 \\text{ cm}^2"
      },
      {
        "s": "r,\\ h",
        "t": "The radius and the height.",
        "e": "7,\\ 10"
      },
      {
        "s": "l = \\sqrt{r^2 + h^2}",
        "t": "The slant height of a cone.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "CSA and TSA mixed up.",
        "f": "TSA adds the flat ends: for a closed cylinder $2\\pi rh + 2\\pi r^2$."
      },
      {
        "m": "Using h instead of l for a cone.",
        "f": "Cone CSA is $\\pi r l$ with the slant height l."
      },
      {
        "m": "Using the diameter as r.",
        "f": "Halve the diameter first."
      },
      {
        "m": "Unit slips.",
        "f": "1 litre = 1000 cm³; areas are squared, volumes cubed."
      }
    ]
  }
};

export default DATA;
