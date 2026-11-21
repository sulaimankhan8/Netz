// Worked examples, symbol keys and common mistakes for the (UNIT-12) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "bernoulli-equation": {
    "example": {
      "question": "Solve $\\dfrac{dy}{dx} + y = xy^3$.",
      "steps": [
        {
          "title": "Bernoulli form",
          "math": [
            "\\frac{dy}{dx} + Py = Qy^n \\quad \\text{with } P = 1,\\ Q = x,\\ n = 3"
          ]
        },
        {
          "title": "Substitute z = y¹⁻ⁿ",
          "math": [
            "z = y^{1-3} = y^{-2}, \\qquad \\frac{dz}{dx} = -2y^{-3}\\frac{dy}{dx}",
            "\\text{Multiply the equation by } -2y^{-3}: \\quad -2y^{-3}\\frac{dy}{dx} - 2y^{-2} = -2x",
            "\\frac{dz}{dx} - 2z = -2x \\quad \\text{(linear in } z)"
          ]
        },
        {
          "title": "Integrating factor",
          "math": [
            "\\text{IF} = e^{\\int -2\\,dx} = e^{-2x}"
          ]
        },
        {
          "title": "Multiply by the IF and integrate",
          "math": [
            "z\\,e^{-2x} = \\int -2x\\,e^{-2x}\\,dx",
            "\\text{By parts: } \\int -2x\\,e^{-2x}\\,dx = x\\,e^{-2x} - \\int e^{-2x}\\,dx = x\\,e^{-2x} + \\tfrac12 e^{-2x} + C"
          ]
        },
        {
          "title": "Divide by the IF and put back z",
          "math": [
            "z = x + \\tfrac12 + Ce^{2x}",
            "\\frac{1}{y^2} = x + \\frac12 + Ce^{2x}"
          ]
        }
      ],
      "answer": "$$\\frac{1}{y^2} = x + \\frac12 + Ce^{2x}$$"
    },
    "symbols": [
      {
        "s": "\\frac{dy}{dx} + Py = Qy^n",
        "t": "Bernoulli’s equation (n ≠ 0, 1).",
        "e": "n = 3"
      },
      {
        "s": "z = y^{1-n}",
        "t": "The substitution that makes it linear.",
        "e": "y^{-2}"
      },
      {
        "s": "\\text{IF} = e^{\\int P\\,dx}",
        "t": "The integrating factor of the linear equation in z.",
        "e": "e^{-2x}"
      },
      {
        "s": "C",
        "t": "The arbitrary constant of integration.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to change P and Q.",
        "f": "After the substitution the equation is $\\frac{dz}{dx} + (1-n)Pz = (1-n)Q$."
      },
      {
        "m": "Wrong power for z.",
        "f": "z = y^{1−n}: for n = 3 that is $y^{-2}$, not $y^{2}$."
      },
      {
        "m": "Leaving the answer in z.",
        "f": "Put back $z = y^{-2}$ at the end."
      },
      {
        "m": "Dropping C before dividing.",
        "f": "Add C straight after integrating, then divide by the IF."
      }
    ]
  },
  "cauchy-euler-equation": {
    "example": {
      "question": "Solve $x^2y'' - xy' + y = \\ln x$.",
      "steps": [
        {
          "title": "Cauchy–Euler form: put x = eᵗ",
          "math": [
            "xD = \\theta, \\ x^2D^2 = \\theta(\\theta - 1), \\ \\theta = \\frac{d}{dt}",
            "x = e^{t}, \\quad t = \\ln x",
            "\\left(\\theta^{2} - 2\\theta + 1\\right)y = R"
          ]
        },
        {
          "title": "Auxiliary equation",
          "math": [
            "f(m) = 0",
            "m^{2} - 2m + 1 = 0 \\;\\Rightarrow\\; m = 1\\ (\\text{2 times})"
          ]
        },
        {
          "title": "Complementary function",
          "math": [
            "\\text{repeated } m \\Rightarrow (C_1 + C_2t)e^{mx}",
            "\\text{CF} =  C_{1} e^{t}+ C_{2} t\\, e^{t}"
          ]
        },
        {
          "title": "Particular integral",
          "math": [
            "\\text{PI} = \\frac{1}{f(D)}R",
            "\\text{PI} = [f(D)]^{-1}t: \\text{ expand } [f(D)]^{-1} \\text{ in powers of } D",
            "\\text{PI} = t+2"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "y = \\text{CF} + \\text{PI}",
            "y =  C_{1} e^{t}+ C_{2} t\\, e^{t}+t+2"
          ]
        },
        {
          "title": "Put back t = ln x",
          "math": [
            "y = \\ln\\left(x\\right)\\, \\left(C_{2} x+1\\right)+ C_{1} x+2"
          ]
        }
      ],
      "answer": "$$y = (C_1 + C_2\\ln x)\\,x + \\ln x + 2$$"
    },
    "symbols": [
      {
        "s": "x = e^t,\\ t = \\ln x",
        "t": "The substitution that gives constant coefficients.",
        "e": ""
      },
      {
        "s": "\\theta = \\frac{d}{dt}",
        "t": "The new operator.",
        "e": ""
      },
      {
        "s": "xD = \\theta,\\ x^2D^2 = \\theta(\\theta - 1)",
        "t": "How each term changes.",
        "e": ""
      },
      {
        "s": "\\text{CF},\\ \\text{PI}",
        "t": "Complementary function and particular integral.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Writing $x^2D^2 = \\theta^2$.",
        "f": "It is $\\theta(\\theta - 1)$."
      },
      {
        "m": "Forgetting to change the right side.",
        "f": "$\\ln x$ becomes t."
      },
      {
        "m": "Repeated root as two separate terms.",
        "f": "m = 1 twice gives $(C_1 + C_2t)e^t$."
      },
      {
        "m": "Leaving the answer in t.",
        "f": "Put back $t = \\ln x$, $e^t = x$."
      }
    ]
  },
  "charpit-method": {
    "example": {
      "question": "Find a complete integral of $p^2 + q^2 = x + y$.",
      "steps": [
        {
          "title": "Charpit's auxiliary equations",
          "math": [
            "\\frac{dp}{f_x + pf_z} = \\frac{dq}{f_y + qf_z} = \\frac{dz}{-pf_p - qf_q} = \\frac{dx}{-f_p} = \\frac{dy}{-f_q}",
            "f = {p}^{2}+{q}^{2}-\\left(x+ y\\right)",
            "f_x = -1, \\ f_y = -1, \\ f_z = 0, \\ f_p = 2 p, \\ f_q = 2 q"
          ]
        },
        {
          "title": "Standard form III: f₁(x, p) = f₂(y, q)",
          "math": [
            "f_1(x, p) = a = f_2(y, q)",
            "{p}^{2}- x = a \\Rightarrow p = \\sqrt{a+ x}",
            " y-{q}^{2} = a \\Rightarrow q = \\sqrt{y- a}",
            "z = \\int p\\,dx + \\int q\\,dy = \\frac{2 \\sqrt{a+ x}\\, \\left(a+ x\\right)}{3}+\\frac{2 \\sqrt{y- a}\\, \\left(y- a\\right)}{3}+b"
          ]
        },
        {
          "title": "Complete integral",
          "math": [
            "z = \\frac{2 \\sqrt{a+ x}\\, \\left(a+ x\\right)}{3}+\\frac{2 \\sqrt{y- a}\\, \\left(y- a\\right)}{3}+b",
            "\\text{(}a, b \\text{ arbitrary constants)}"
          ]
        }
      ],
      "answer": "$$z = \\tfrac23(a + x)^{3/2} + \\tfrac23(y - a)^{3/2} + b$$"
    },
    "symbols": [
      {
        "s": "p = \\frac{\\partial z}{\\partial x},\\ q = \\frac{\\partial z}{\\partial y}",
        "t": "The two first partial derivatives.",
        "e": ""
      },
      {
        "s": "f(x, y, z, p, q) = 0",
        "t": "The PDE written with everything on one side.",
        "e": ""
      },
      {
        "s": "dz = p\\,dx + q\\,dy",
        "t": "Integrate this once p and q are known.",
        "e": ""
      },
      {
        "s": "a,\\ b",
        "t": "The two arbitrary constants of the complete integral.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to separate.",
        "f": "Here put $p^2 - x = a = y - q^2$, one side in x and p, the other in y and q."
      },
      {
        "m": "Sign of a on the y side.",
        "f": "$q^2 = y - a$, so $q = \\sqrt{y - a}$."
      },
      {
        "m": "Only one constant.",
        "f": "A complete integral has two: a from the separation, b from integrating dz."
      },
      {
        "m": "Not checking the standard forms first.",
        "f": "Try the four standard forms before writing out the full Charpit equations."
      }
    ]
  },
  "clairaut-equation": {
    "example": {
      "question": "Solve $y = px + p^2$, where $p = \\dfrac{dy}{dx}$.",
      "steps": [
        {
          "title": "Clairaut's form",
          "math": [
            "y = px + f(p)",
            "y = px + {p}^{2}",
            "f(p) = {p}^{2}"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "\\text{replace } p \\text{ by a constant } c",
            "\\text{Differentiate: } p = p + (x + f'(p))\\frac{dp}{dx} \\Rightarrow \\frac{dp}{dx} = 0 \\ \\text{or} \\ x + f'(p) = 0",
            "y =  c\\, x+{c}^{2}"
          ]
        },
        {
          "title": "Singular solution",
          "math": [
            "x + f'(p) = 0",
            "x + 2 p = 0 \\Rightarrow p = -\\frac{x}{2}",
            "y = px + f(p) = -\\frac{{x}^{2}}{4}"
          ]
        }
      ],
      "answer": "$$y = cx + c^2 \\ \\ (\\text{general}), \\qquad y = -\\frac{x^2}{4} \\ \\ (\\text{singular})$$"
    },
    "symbols": [
      {
        "s": "p = \\frac{dy}{dx}",
        "t": "The slope.",
        "e": ""
      },
      {
        "s": "y = px + f(p)",
        "t": "Clairaut’s form.",
        "e": "f(p) = p^2"
      },
      {
        "s": "y = cx + f(c)",
        "t": "The general solution: replace p by c.",
        "e": ""
      },
      {
        "s": "\\text{singular solution}",
        "t": "The envelope: eliminate p from y = px + f(p) and x + f′(p) = 0.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Missing the singular solution.",
        "f": "Differentiate with respect to p: $x + 2p = 0$, then eliminate p."
      },
      {
        "m": "Not in Clairaut’s form.",
        "f": "Rearrange (or substitute) until it reads y = px + f(p)."
      },
      {
        "m": "Adding a constant to the general solution.",
        "f": "Just replace p by c: no extra integration."
      },
      {
        "m": "Sign slip when eliminating.",
        "f": "$p = -x/2$ gives $y = -\\frac{x^2}{2} + \\frac{x^2}{4} = -\\frac{x^2}{4}$."
      }
    ]
  },
  "differential-equation-solver": {
    "example": {
      "question": "Solve $\\dfrac{dy}{dx} + \\dfrac{y}{x} = x^2$.",
      "steps": [
        {
          "title": "Standard form",
          "math": [
            "\\frac{dy}{dx} + P(x)\\,y = Q(x)",
            "\\frac{dy}{dx} + \\left(\\frac{1}{x}\\right)y = {x}^{2}",
            "P = \\frac{1}{x}, \\qquad Q = {x}^{2}"
          ]
        },
        {
          "title": "Integrating factor",
          "math": [
            "\\text{IF} = e^{\\int P\\,dx}",
            "\\int P\\,dx = \\ln\\left(\\left| x\\right|\\right) \\;\\Rightarrow\\; \\text{IF} =  x"
          ]
        },
        {
          "title": "Multiply by the IF and integrate",
          "math": [
            "y\\cdot\\text{IF} = \\int Q\\cdot\\text{IF}\\,dx + C",
            "y\\left( x\\right) = \\int {x}^{3}\\,dx = \\frac{{x}^{4}}{4} + C"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} \\ (n \\neq -1)",
            "\\int {x}^{3}\\,dx = \\frac{1}{4}\\, {x}^{4}"
          ]
        },
        {
          "title": "Divide by the IF",
          "math": [
            "y = \\frac{C+\\frac{{x}^{4}}{4}}{x}"
          ]
        }
      ],
      "answer": "$$xy = \\frac{x^4}{4} + C$$"
    },
    "symbols": [
      {
        "s": "\\frac{dy}{dx} + P(x)y = Q(x)",
        "t": "The linear first-order form.",
        "e": "P = \\tfrac1x,\\ Q = x^2"
      },
      {
        "s": "\\text{IF} = e^{\\int P\\,dx}",
        "t": "The integrating factor.",
        "e": "x"
      },
      {
        "s": "y\\cdot\\text{IF} = \\int Q\\cdot\\text{IF}\\,dx + C",
        "t": "The solution formula.",
        "e": ""
      },
      {
        "s": "C",
        "t": "The constant of integration.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Not in standard form.",
        "f": "Make the coefficient of dy/dx equal to 1 before reading P."
      },
      {
        "m": "$e^{\\ln x}$ left unsimplified.",
        "f": "$e^{\\ln x} = x$."
      },
      {
        "m": "Forgetting C.",
        "f": "Add C before dividing by the IF."
      },
      {
        "m": "Wrong type.",
        "f": "Check separable, homogeneous, exact or linear before choosing a method."
      }
    ]
  },
  "exact-differential-equation": {
    "example": {
      "question": "Solve $(2xy + 3)\\,dx + (x^2 - 1)\\,dy = 0$.",
      "steps": [
        {
          "title": "Write it as M dx + N dy = 0",
          "math": [
            "M = 2 x\\, y+3, \\qquad N = {x}^{2}-1"
          ]
        },
        {
          "title": "Test for exactness",
          "math": [
            "\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}",
            "\\frac{\\partial M}{\\partial y} = 2 x, \\qquad \\frac{\\partial N}{\\partial x} = 2 x \\quad \\text{(equal: exact)}"
          ]
        },
        {
          "title": "Integrate",
          "math": [
            "\\int M\\,dx\\ (y\\text{ constant}) + \\int (\\text{terms of } N \\text{ without } x)\\,dy = C",
            "\\int M\\,dx = {x}^{2}\\, y+3 x, \\qquad \\text{terms of N without x: } -1 \\Rightarrow \\int = - y"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "{x}^{2}\\, y+3 x- y = C"
          ]
        }
      ],
      "answer": "$$x^2y + 3x - y = C$$"
    },
    "symbols": [
      {
        "s": "M\\,dx + N\\,dy = 0",
        "t": "The standard form.",
        "e": "M = 2xy + 3,\\ N = x^2 - 1"
      },
      {
        "s": "\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}",
        "t": "The test for exactness.",
        "e": "2x = 2x"
      },
      {
        "s": "\\int M\\,dx",
        "t": "Integrate M with y held constant.",
        "e": "x^2y + 3x"
      },
      {
        "s": "C",
        "t": "The constant: the solution is a family of curves.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Counting a term twice.",
        "f": "From N take only the terms with no x in them."
      },
      {
        "m": "Differentiating the wrong way.",
        "f": "M by y, N by x."
      },
      {
        "m": "Giving up when not exact.",
        "f": "Look for an integrating factor (e.g. depending on x alone)."
      },
      {
        "m": "Treating y as a function inside $\\int M\\,dx$.",
        "f": "Hold y constant there."
      }
    ]
  },
  "formation-of-pde": {
    "example": {
      "question": "Form the PDE by eliminating a and b from $z = (x - a)^2 + (y - b)^2$.",
      "steps": [
        {
          "title": "Differentiate",
          "math": [
            "p = \\frac{\\partial z}{\\partial x}, \\quad q = \\frac{\\partial z}{\\partial y}",
            "z = {\\left(x- a\\right)}^{2}+{\\left(y-b\\right)}^{2}",
            "p = 2 \\left(x- a\\right)",
            "q = 2 \\left(y-b\\right)"
          ]
        },
        {
          "title": "Solve for a and b",
          "math": [
            "a = \\frac{2 x- p}{2}",
            "b = \\frac{2 y- q}{2}"
          ]
        },
        {
          "title": "Put them back into z",
          "math": [
            "4\\,z = {p}^{2}+{q}^{2}"
          ]
        }
      ],
      "answer": "$$p^2 + q^2 = 4z$$"
    },
    "symbols": [
      {
        "s": "p = z_x,\\ q = z_y",
        "t": "The partial derivatives.",
        "e": "p = 2(x - a)"
      },
      {
        "s": "a,\\ b",
        "t": "The arbitrary constants to eliminate.",
        "e": ""
      },
      {
        "s": "\\phi(u, v) = 0",
        "t": "Arbitrary-function form: eliminate φ instead.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Differentiating a and b.",
        "f": "They are constants: their derivatives are 0."
      },
      {
        "m": "Not enough equations.",
        "f": "Two constants need two derivatives (p and q)."
      },
      {
        "m": "Leaving a or b in the answer.",
        "f": "The final PDE must contain only x, y, z, p, q."
      },
      {
        "m": "Wrong order.",
        "f": "Constants give a first-order PDE; arbitrary functions may need second order."
      }
    ]
  },
  "homogeneous-differential-equation": {
    "example": {
      "question": "Solve $\\dfrac{dy}{dx} = \\dfrac{x + y}{x}$.",
      "steps": [
        {
          "title": "Check: F(tx, ty) = F(x, y)",
          "math": [
            "\\text{So the equation is homogeneous: put } y = vx, \\ \\frac{dy}{dx} = v + x\\frac{dv}{dx}"
          ]
        },
        {
          "title": "Substitute y = vx",
          "math": [
            "v + x\\frac{dv}{dx} =  v+1",
            "x\\frac{dv}{dx} = 1"
          ]
        },
        {
          "title": "Separate and integrate",
          "math": [
            "\\int \\frac{dv}{f(v) - v} = \\int \\frac{dx}{x}",
            "\\int \\frac{dv}{1} = \\ln|x| + C \\;\\Rightarrow\\;  v = \\ln|x| + C"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dv = kv",
            "\\int 1\\,dv =  v"
          ]
        },
        {
          "title": "Put back v = y/x",
          "math": [
            "\\frac{y}{x} = \\ln|x| + C"
          ]
        }
      ],
      "answer": "$$y = x(\\ln|x| + C)$$"
    },
    "symbols": [
      {
        "s": "F(tx, ty) = F(x, y)",
        "t": "The test: the right side is homogeneous of degree 0.",
        "e": ""
      },
      {
        "s": "y = vx",
        "t": "The substitution.",
        "e": ""
      },
      {
        "s": "\\frac{dy}{dx} = v + x\\frac{dv}{dx}",
        "t": "Its derivative (product rule).",
        "e": ""
      },
      {
        "s": "C",
        "t": "The constant of integration.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the product rule.",
        "f": "$\\frac{d}{dx}(vx) = v + x\\frac{dv}{dx}$, not just $\\frac{dv}{dx}$."
      },
      {
        "m": "Leaving the answer in v.",
        "f": "Put back v = y/x."
      },
      {
        "m": "Dividing out v wrongly.",
        "f": "Here the v’s cancel to leave $x\\,dv/dx = 1$."
      },
      {
        "m": "Missing the modulus.",
        "f": "$\\int dx/x = \\ln|x|$."
      }
    ]
  },
  "lagrange-linear-pde": {
    "example": {
      "question": "Solve $x^2p + y^2q = z^2$.",
      "steps": [
        {
          "title": "Lagrange's form",
          "math": [
            "Pp + Qq = R",
            "P = {x}^{2}, \\quad Q = {y}^{2}, \\quad R = {z}^{2}"
          ]
        },
        {
          "title": "Auxiliary equations",
          "math": [
            "\\frac{dx}{P} = \\frac{dy}{Q} = \\frac{dz}{R}",
            "\\frac{dx}{{x}^{2}} = \\frac{dy}{{y}^{2}} = \\frac{dz}{{z}^{2}}"
          ]
        },
        {
          "title": "Integral 1",
          "math": [
            "\\frac{dx}{{x}^{2}} = \\frac{dy}{{y}^{2}} \\Rightarrow \\int \\frac{1}{{y}^{2}}\\,dy = \\int \\frac{1}{{x}^{2}}\\,dx",
            "u_{1} = \\frac{1}{x}-\\frac{1}{y} = c_{1}"
          ]
        },
        {
          "title": "Integral 2",
          "math": [
            "\\frac{dx}{{x}^{2}} = \\frac{dz}{{z}^{2}} \\Rightarrow \\int \\frac{1}{{z}^{2}}\\,dz = \\int \\frac{1}{{x}^{2}}\\,dx",
            "u_{2} = \\frac{1}{x}-\\frac{1}{z} = c_{2}"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "\\phi(u, v) = 0",
            "\\phi\\left(\\frac{1}{x}-\\frac{1}{y},\\ \\frac{1}{x}-\\frac{1}{z}\\right) = 0",
            "\\text{(}\\phi \\text{ any function; } u, v \\text{ checked: } Pu_x + Qu_y + Ru_z = 0)"
          ]
        }
      ],
      "answer": "$$\\phi\\left(\\frac1x - \\frac1y,\\ \\frac1x - \\frac1z\\right) = 0$$"
    },
    "symbols": [
      {
        "s": "Pp + Qq = R",
        "t": "Lagrange’s linear PDE.",
        "e": "P = x^2,\\ Q = y^2,\\ R = z^2"
      },
      {
        "s": "\\frac{dx}{P} = \\frac{dy}{Q} = \\frac{dz}{R}",
        "t": "The auxiliary (subsidiary) equations.",
        "e": ""
      },
      {
        "s": "u = c_1,\\ v = c_2",
        "t": "Two independent integrals of them.",
        "e": ""
      },
      {
        "s": "\\phi(u, v) = 0",
        "t": "The general solution, φ any function.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Only one integral.",
        "f": "You need two independent integrals u and v."
      },
      {
        "m": "Integrating a mixed pair.",
        "f": "Pick two fractions that each involve one variable, or use multipliers."
      },
      {
        "m": "Sign slip in $\\int dx/x^2$.",
        "f": "$\\int x^{-2}\\,dx = -1/x$."
      },
      {
        "m": "Writing the answer as u = v.",
        "f": "The general solution is φ(u, v) = 0."
      }
    ]
  },
  "linear-differential-equation": {
    "example": {
      "question": "Solve $\\dfrac{dy}{dx} + y\\tan x = \\sec x$.",
      "steps": [
        {
          "title": "Standard form",
          "math": [
            "\\frac{dy}{dx} + P(x)\\,y = Q(x) \\quad \\text{with } P = \\tan x,\\ Q = \\sec x"
          ]
        },
        {
          "title": "Integrating factor",
          "math": [
            "\\int \\tan x\\,dx = -\\ln|\\cos x| = \\ln|\\sec x|",
            "\\text{IF} = e^{\\ln|\\sec x|} = \\sec x"
          ]
        },
        {
          "title": "Multiply by the IF and integrate",
          "math": [
            "y\\sec x = \\int \\sec x \\cdot \\sec x\\,dx = \\int \\sec^2 x\\,dx",
            "y\\sec x = \\tan x + C"
          ]
        },
        {
          "title": "Divide by the IF",
          "math": [
            "y = \\frac{\\tan x + C}{\\sec x} = \\sin x + C\\cos x"
          ]
        }
      ],
      "answer": "$$y = \\sin x + C\\cos x$$"
    },
    "symbols": [
      {
        "s": "P(x),\\ Q(x)",
        "t": "The coefficient of y and the right side.",
        "e": "\\tan x,\\ \\sec x"
      },
      {
        "s": "\\text{IF} = e^{\\int P\\,dx}",
        "t": "The integrating factor.",
        "e": "\\sec x"
      },
      {
        "s": "y\\cdot\\text{IF} = \\int Q\\cdot\\text{IF}\\,dx + C",
        "t": "The solution formula.",
        "e": ""
      },
      {
        "s": "C",
        "t": "The constant of integration.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Sign of $\\int\\tan x$.",
        "f": "$\\int \\tan x\\,dx = -\\ln|\\cos x| = \\ln|\\sec x|$."
      },
      {
        "m": "Multiplying only one side by the IF.",
        "f": "The left side becomes $\\frac{d}{dx}(y\\cdot\\text{IF})$; multiply Q too."
      },
      {
        "m": "Forgetting C.",
        "f": "Add it straight after integrating."
      },
      {
        "m": "Not simplifying.",
        "f": "$\\tan x / \\sec x = \\sin x$ and $1/\\sec x = \\cos x$."
      }
    ]
  },
  "ode-applications": {
    "example": {
      "question": "A body cools from 100° to 60° in 20 minutes in air at 20°. Find its temperature after 40 minutes, and when it reaches 30°.",
      "steps": [
        {
          "title": "Newton's law of cooling",
          "math": [
            "\\frac{dT}{dt} = -k(T - T_s)",
            "\\int \\frac{dT}{T - T_s} = -\\int k\\,dt \\Rightarrow T = T_s + (T_0 - T_s)e^{-kt}",
            "T = 20 + 80e^{-kt}"
          ]
        },
        {
          "title": "Find k from the reading",
          "math": [
            "60 = 20 + 80e^{-20k}",
            "k = \\frac{1}{20}\\ln\\frac{80}{40} = 0.0346574"
          ]
        },
        {
          "title": "Temperature at t = 40",
          "math": [
            "T(40) = 20 + 80e^{-0.0346574 \\times 40} = 40"
          ]
        },
        {
          "title": "When does it reach 30?",
          "math": [
            "t = \\frac{1}{k}\\ln\\frac{80}{10} = 60"
          ]
        }
      ],
      "answer": "$$T(t) = 20 + 80e^{-kt},\\ k = \\frac{\\ln 2}{20};\\quad T(40) = 40^\\circ,\\quad T = 30^\\circ \\text{ at } t = 60 \\text{ min}$$"
    },
    "symbols": [
      {
        "s": "T(t)",
        "t": "The body’s temperature at time t.",
        "e": ""
      },
      {
        "s": "T_s",
        "t": "The surrounding temperature.",
        "e": "20^\\circ"
      },
      {
        "s": "\\frac{dT}{dt} = -k(T - T_s)",
        "t": "Newton’s law of cooling.",
        "e": ""
      },
      {
        "s": "k",
        "t": "The cooling constant, found from one reading.",
        "e": "\\tfrac{\\ln 2}{20}"
      },
      {
        "s": "T_0",
        "t": "The starting temperature.",
        "e": "100^\\circ"
      }
    ],
    "mistakes": [
      {
        "m": "Using T instead of T − Tₛ.",
        "f": "The rate depends on the difference from the surroundings."
      },
      {
        "m": "Sign of k.",
        "f": "Cooling: $T - T_s$ shrinks, so the exponent is $-kt$ with k > 0."
      },
      {
        "m": "Assuming equal drops each interval.",
        "f": "The difference halves each 20 min: 80 → 40 → 20, not 40 → 20 → 0."
      },
      {
        "m": "Mixed time units.",
        "f": "Keep k and t in the same unit (minutes here)."
      }
    ]
  },
  "ode-constant-coefficients": {
    "example": {
      "question": "Solve $y'' - 3y' + 2y = e^{3x}$.",
      "steps": [
        {
          "title": "Operator form",
          "math": [
            "f(D)\\,y = R",
            "\\left(D^{2} - 3D + 2\\right)y = {e}^{3 x}"
          ]
        },
        {
          "title": "Auxiliary equation",
          "math": [
            "f(m) = 0",
            "m^{2} - 3m + 2 = 0 \\;\\Rightarrow\\; m = 1, \\ 2"
          ]
        },
        {
          "title": "Complementary function",
          "math": [
            "C_1e^{m_1x} + C_2e^{m_2x} + \\cdots",
            "\\text{CF} =  C_{1} e^{x}+ C_{2} e^{2 x}"
          ]
        },
        {
          "title": "Particular integral",
          "math": [
            "\\text{PI} = \\frac{1}{f(D)}R",
            "\\text{PI} = \\frac{1}{f(D)}{e}^{3 x} = \\frac{{e}^{3 x}}{f(3)} = \\frac{{e}^{3 x}}{2}",
            "\\text{PI} = \\frac{e^{3 x}}{2}"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "y = \\text{CF} + \\text{PI}",
            "y =  C_{1} e^{x}+ C_{2} e^{2 x}+\\frac{e^{3 x}}{2}"
          ]
        }
      ],
      "answer": "$$y = C_1e^{x} + C_2e^{2x} + \\frac{e^{3x}}{2}$$"
    },
    "symbols": [
      {
        "s": "D = \\frac{d}{dx}",
        "t": "The differential operator.",
        "e": ""
      },
      {
        "s": "f(m) = 0",
        "t": "The auxiliary equation.",
        "e": "m^2 - 3m + 2 = 0"
      },
      {
        "s": "\\text{CF}",
        "t": "The complementary function (from the roots).",
        "e": "C_1e^x + C_2e^{2x}"
      },
      {
        "s": "\\text{PI} = \\frac{1}{f(D)}R",
        "t": "The particular integral.",
        "e": "\\tfrac{e^{3x}}{2}"
      }
    ],
    "mistakes": [
      {
        "m": "Using $\\frac{e^{ax}}{f(a)}$ when f(a) = 0.",
        "f": "Then multiply by x: $\\frac{x\\,e^{ax}}{f′(a)}$."
      },
      {
        "m": "Repeated roots as two plain terms.",
        "f": "m twice gives $(C_1 + C_2x)e^{mx}$."
      },
      {
        "m": "Complex roots.",
        "f": "$\\alpha \\pm i\\beta$ gives $e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x)$."
      },
      {
        "m": "Forgetting the CF.",
        "f": "The general solution is CF + PI."
      }
    ]
  },
  "pde-constant-coefficients": {
    "example": {
      "question": "Solve $(D^2 - 5DD' + 6D'^2)z = e^{x + y}$.",
      "steps": [
        {
          "title": "Operator form",
          "math": [
            "f(D, D')\\,z = F(x, y)",
            "\\left(D^{2} - 5DD' + 6D'^{2}\\right)z = {e}^{x+ y}"
          ]
        },
        {
          "title": "Auxiliary equation",
          "math": [
            "D = m, \\ D' = 1",
            "m^{2} - 5m + 6 = 0 \\Rightarrow m = 2, \\ 3"
          ]
        },
        {
          "title": "Complementary function",
          "math": [
            "m \\Rightarrow \\phi(y + mx); \\ \\text{repeated } m \\Rightarrow \\phi_1(y + mx) + x\\,\\phi_2(y + mx)",
            "\\text{CF} = \\phi_{1}(y + 2x) + \\phi_{2}(y + 3x)"
          ]
        },
        {
          "title": "PI of e^x+ y",
          "math": [
            "\\frac{1}{f(D, D')}{e}^{x+ y} = \\frac{{e}^{x+ y}}{f(1, 1)} = \\frac{{e}^{x+ y}}{2}"
          ]
        },
        {
          "title": "Particular integral",
          "math": [
            "\\text{PI} = \\frac{1}{f(D, D')}F",
            "\\text{PI} = \\frac{{e}^{x+ y}}{2}"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "z = \\text{CF} + \\text{PI}",
            "z = \\phi_{1}(y + 2x) + \\phi_{2}(y + 3x) + \\frac{{e}^{x+ y}}{2}"
          ]
        }
      ],
      "answer": "$$z = \\phi_1(y + 2x) + \\phi_2(y + 3x) + \\frac{e^{x+y}}{2}$$"
    },
    "symbols": [
      {
        "s": "D = \\frac{\\partial}{\\partial x},\\ D' = \\frac{\\partial}{\\partial y}",
        "t": "The two operators.",
        "e": ""
      },
      {
        "s": "m",
        "t": "Root of the auxiliary equation (D = m, D′ = 1).",
        "e": "2,\\ 3"
      },
      {
        "s": "\\phi(y + mx)",
        "t": "The CF term for each root.",
        "e": ""
      },
      {
        "s": "\\frac{e^{ax+by}}{f(a, b)}",
        "t": "The PI for an exponential right side.",
        "e": "\\tfrac{e^{x+y}}{2}"
      }
    ],
    "mistakes": [
      {
        "m": "Writing φ(x + my).",
        "f": "For D = mD′ the CF is φ(y + mx)."
      },
      {
        "m": "f(a, b) = 0.",
        "f": "Then the simple rule fails: multiply by x and differentiate f by D."
      },
      {
        "m": "Repeated root.",
        "f": "m twice gives $\\phi_1(y + mx) + x\\,\\phi_2(y + mx)$."
      },
      {
        "m": "Putting a = b = 1 in the wrong places.",
        "f": "Replace D by a and D′ by b: here $1 - 5 + 6 = 2$."
      }
    ]
  },
  "separation-of-variables": {
    "example": {
      "question": "Solve $u_t = u_{xx}$ on $0 < x < \\pi$, with $u(0, t) = u(\\pi, t) = 0$ and $u(x, 0) = x(\\pi - x)$.",
      "steps": [
        {
          "title": "Separate the variables",
          "math": [
            "u = X(x)\\,T(t): \\quad XT' = X''T \\ \\Rightarrow\\ \\frac{T'}{T} = \\frac{X''}{X} = -\\lambda"
          ]
        },
        {
          "title": "Use the end conditions",
          "math": [
            "X'' + \\lambda X = 0,\\ X(0) = X(\\pi) = 0 \\ \\Rightarrow\\ \\lambda = n^2,\\ X = \\sin nx",
            "T' = -n^2T \\ \\Rightarrow\\ T = e^{-n^2t}",
            "u(x, t) = \\sum_{n=1}^{\\infty} b_n \\sin nx\\; e^{-n^2t}"
          ]
        },
        {
          "title": "The coefficient formula",
          "math": [
            "b_n = \\frac{2}{\\pi}\\int_0^{\\pi} x(\\pi - x)\\sin nx\\,dx"
          ]
        },
        {
          "title": "The two integrals (by parts)",
          "math": [
            "\\int_0^{\\pi} x\\sin nx\\,dx = \\left[-\\frac{x\\cos nx}{n} + \\frac{\\sin nx}{n^2}\\right]_0^{\\pi} = \\frac{\\pi(-1)^{n+1}}{n}",
            "\\int_0^{\\pi} x^2\\sin nx\\,dx = \\left[-\\frac{x^2\\cos nx}{n} + \\frac{2x\\sin nx}{n^2} + \\frac{2\\cos nx}{n^3}\\right]_0^{\\pi} = \\frac{\\pi^2(-1)^{n+1}}{n} + \\frac{2((-1)^n - 1)}{n^3}"
          ]
        },
        {
          "title": "Combine",
          "math": [
            "\\int_0^{\\pi} x(\\pi - x)\\sin nx\\,dx = \\pi\\cdot\\frac{\\pi(-1)^{n+1}}{n} - \\frac{\\pi^2(-1)^{n+1}}{n} - \\frac{2((-1)^n - 1)}{n^3} = \\frac{2(1 - (-1)^n)}{n^3}",
            "b_n = \\frac{2}{\\pi}\\cdot\\frac{2(1 - (-1)^n)}{n^3} = \\begin{cases} \\dfrac{8}{\\pi n^3} & n \\text{ odd} \\\\ 0 & n \\text{ even} \\end{cases}",
            "b_1 = \\frac{8}{\\pi} = 2.5465, \\quad b_3 = \\frac{8}{27\\pi} = 0.0943"
          ]
        }
      ],
      "answer": "$$u(x, t) = \\frac{8}{\\pi}\\sum_{n \\text{ odd}} \\frac{\\sin nx}{n^3}\\,e^{-n^2t}$$"
    },
    "symbols": [
      {
        "s": "u(x, t)",
        "t": "The temperature at position x and time t.",
        "e": ""
      },
      {
        "s": "c^2",
        "t": "The diffusivity in $u_t = c^2u_{xx}$.",
        "e": "1"
      },
      {
        "s": "X(x),\\ T(t)",
        "t": "The two one-variable factors.",
        "e": ""
      },
      {
        "s": "\\lambda = n^2",
        "t": "The separation constants allowed by the end conditions.",
        "e": ""
      },
      {
        "s": "b_n",
        "t": "Fourier sine coefficients of the starting shape.",
        "e": "\\tfrac{8}{\\pi n^3}"
      }
    ],
    "mistakes": [
      {
        "m": "Choosing λ ≤ 0.",
        "f": "With zero ends only λ = n² > 0 gives a non-zero X."
      },
      {
        "m": "Using a cosine series.",
        "f": "u = 0 at both ends needs sines."
      },
      {
        "m": "Wrong (−1)ⁿ signs.",
        "f": "$\\cos n\\pi = (-1)^n$ and $\\sin n\\pi = 0$."
      },
      {
        "m": "Forgetting the factor 2/L.",
        "f": "$b_n = \\frac{2}{L}\\int_0^L f\\sin\\frac{n\\pi x}{L}\\,dx$; here L = π."
      }
    ]
  },
  "series-solution-ode": {
    "example": {
      "question": "Solve Legendre’s equation $(1 - x^2)y'' - 2xy' + 6y = 0$ in series about $x = 0$.",
      "steps": [
        {
          "title": "x = 0 is an ordinary point",
          "math": [
            "y = \\sum_{n=0}^{\\infty} c_n x^n",
            "\\left(-x^{2} + 1\\right)y'' + \\left(-2x\\right)y' + \\left(6\\right)y = 0",
            "P(0) = 1 \\neq 0"
          ]
        },
        {
          "title": "Recurrence relation",
          "math": [
            "\\text{coefficient of } x^n = 0",
            "\\left((n + 1)(n + 2)\\right)c_{n + 2} + \\left(-(n - 2)(n + 3)\\right)c_{n} = 0",
            "c_{n + 2} = -\\frac{(-\\left(n - 2\\right)\\left(n + 3\\right))c_{n}}{\\left(n + 1\\right)\\left(n + 2\\right)}"
          ]
        },
        {
          "title": "First coefficients",
          "math": [
            "c_{2} = -3c_0",
            "c_{3} = -\\frac{2}{3}c_1",
            "c_{4} = 0",
            "c_{5} = -\\frac{1}{5}c_1",
            "c_{6} = 0"
          ]
        },
        {
          "title": "Solution",
          "math": [
            "y = c_0\\left(1 - 3x^{2}\\right) + c_1\\left(x - \\frac{2}{3}x^{3} - \\frac{1}{5}x^{5} + \\cdots\\right)"
          ]
        }
      ],
      "answer": "$$y = c_0(1 - 3x^2) + c_1\\left(x - \\tfrac23x^3 - \\tfrac15x^5 - \\cdots\\right)$$"
    },
    "symbols": [
      {
        "s": "y = \\sum c_nx^n",
        "t": "The power series being looked for.",
        "e": ""
      },
      {
        "s": "c_0,\\ c_1",
        "t": "The two free coefficients (the arbitrary constants).",
        "e": ""
      },
      {
        "s": "\\text{recurrence relation}",
        "t": "The formula giving $c_{n+2}$ from $c_n$.",
        "e": ""
      },
      {
        "s": "\\text{ordinary point}",
        "t": "A point where the coefficient of y″ is not 0.",
        "e": "x = 0"
      }
    ],
    "mistakes": [
      {
        "m": "Shifting indices inconsistently.",
        "f": "Rewrite every sum so it has the same power $x^n$ before comparing."
      },
      {
        "m": "Missing that the series stops.",
        "f": "Here $c_4 = 0$, so the even part is the polynomial $1 - 3x^2$ ($P_2$)."
      },
      {
        "m": "Mixing the two series.",
        "f": "Even c’s come from c₀, odd c’s from c₁."
      },
      {
        "m": "Expanding about a singular point.",
        "f": "At x = ±1 the coefficient of y″ is 0; use Frobenius there."
      }
    ]
  },
  "simultaneous-differential-equations": {
    "example": {
      "question": "Solve $\\dfrac{dx}{dt} + y = \\sin t,\\ \\dfrac{dy}{dt} + x = \\cos t$, with $x(0) = 2,\\ y(0) = 0$.",
      "steps": [
        {
          "title": "Differentiate the first equation",
          "math": [
            "x'' + y' = \\cos t"
          ]
        },
        {
          "title": "Eliminate y′ with the second equation",
          "math": [
            "y' = \\cos t - x \\ \\Rightarrow\\ x'' + \\cos t - x = \\cos t",
            "x'' - x = 0"
          ]
        },
        {
          "title": "Solve for x",
          "math": [
            "m^2 - 1 = 0 \\ \\Rightarrow\\ m = \\pm 1",
            "x = C_1e^{-t} + C_2e^{t}"
          ]
        },
        {
          "title": "Then y from the first equation",
          "math": [
            "y = \\sin t - x' = \\sin t + C_1e^{-t} - C_2e^{t}"
          ]
        },
        {
          "title": "Use x(0) = 2 and y(0) = 0",
          "math": [
            "C_1 + C_2 = 2, \\qquad C_1 - C_2 = 0 \\ \\Rightarrow\\ C_1 = C_2 = 1"
          ]
        }
      ],
      "answer": "$$x = e^{t} + e^{-t}, \\qquad y = \\sin t + e^{-t} - e^{t}$$"
    },
    "symbols": [
      {
        "s": "x(t),\\ y(t)",
        "t": "The two unknown functions.",
        "e": ""
      },
      {
        "s": "D = \\frac{d}{dt}",
        "t": "The operator; elimination works like algebra in D.",
        "e": ""
      },
      {
        "s": "C_1,\\ C_2",
        "t": "The constants, fixed by x(0) and y(0).",
        "e": "1,\\ 1"
      }
    ],
    "mistakes": [
      {
        "m": "New constants for y.",
        "f": "Get y from x and the first equation, so it uses the same C₁, C₂."
      },
      {
        "m": "Differentiating the wrong equation.",
        "f": "Differentiate the one that lets you swap y′ for x."
      },
      {
        "m": "Too many constants.",
        "f": "Two first-order equations give two constants in total."
      },
      {
        "m": "Not checking.",
        "f": "Put x and y back into both equations."
      }
    ]
  },
  "variable-separable": {
    "example": {
      "question": "Solve $\\dfrac{dy}{dx} = xy$.",
      "steps": [
        {
          "title": "Separate the variables",
          "math": [
            "\\frac{dy}{h(y)} = g(x)\\,dx",
            "\\frac{dy}{dx} =  x\\, y = \\left( x\\right)\\left( y\\right)",
            "\\frac{dy}{ y} =  x\\,dx"
          ]
        },
        {
          "title": "Integrate both sides",
          "math": [
            "\\int \\frac{dy}{ y} = \\ln\\left(\\left| y\\right|\\right), \\qquad \\int  x\\,dx = \\frac{{x}^{2}}{2}"
          ]
        },
        {
          "title": "Standard integral: 1/x",
          "math": [
            "\\int \\frac{dx}{x} = \\ln|x|",
            "\\int \\frac{1}{y}\\,dy = \\ln\\left(\\left| y\\right|\\right)"
          ]
        },
        {
          "title": "Power rule",
          "math": [
            "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}",
            "\\int  x\\,dx = \\frac{{x}^{2}}{2}"
          ]
        },
        {
          "title": "Solve for y",
          "math": [
            "\\ln|y| = \\frac{{x}^{2}}{2} + c \\;\\Rightarrow\\; y = C\\, e^{\\frac{{x}^{2}}{2}}"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "y = C\\, e^{\\frac{{x}^{2}}{2}}"
          ]
        }
      ],
      "answer": "$$y = Ce^{x^2/2}$$"
    },
    "symbols": [
      {
        "s": "\\frac{dy}{dx} = g(x)h(y)",
        "t": "A separable equation.",
        "e": "g = x,\\ h = y"
      },
      {
        "s": "\\frac{dy}{h(y)} = g(x)\\,dx",
        "t": "After separating.",
        "e": ""
      },
      {
        "s": "C = e^c",
        "t": "The constant after taking exponentials.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "One constant on each side.",
        "f": "Write a single constant on one side."
      },
      {
        "m": "Losing y = 0.",
        "f": "Dividing by y can lose y = 0; here it is included as C = 0."
      },
      {
        "m": "Writing $e^{x^2/2 + c} = e^{x^2/2} + C$.",
        "f": "It is $e^c\\,e^{x^2/2} = Ce^{x^2/2}$."
      },
      {
        "m": "Missing the modulus.",
        "f": "$\\int dy/y = \\ln|y|$."
      }
    ]
  },
  "variation-of-parameters": {
    "example": {
      "question": "Solve $y'' + y = \\sec x$.",
      "steps": [
        {
          "title": "Auxiliary equation",
          "math": [
            "f(m) = 0",
            "m^{2} + 1 = 0 \\;\\Rightarrow\\; m = \\pm i"
          ]
        },
        {
          "title": "Complementary function",
          "math": [
            "m = \\alpha \\pm i\\beta \\Rightarrow e^{\\alpha x}(C_1\\cos\\beta x + C_2\\sin\\beta x)",
            "\\text{CF} =  C_{1} \\cos\\left(x\\right)+ C_{2} \\sin\\left(x\\right)"
          ]
        },
        {
          "title": "Wronskian",
          "math": [
            "W = y_1y_2' - y_2y_1'",
            "y_1 = \\cos\\left(x\\right), \\quad y_2 = \\sin\\left(x\\right), \\qquad W = 1"
          ]
        },
        {
          "title": "The two integrals",
          "math": [
            "\\text{PI} = -y_1\\int \\frac{y_2R}{W}dx + y_2\\int \\frac{y_1R}{W}dx",
            "\\int \\frac{y_2R}{W}dx = -\\ln\\left(\\left|\\cos\\left(x\\right)\\right|\\right), \\qquad \\int \\frac{y_1R}{W}dx =  x"
          ]
        },
        {
          "title": "Rewrite the integrand",
          "math": [
            "\\sin\\left(x\\right)\\, \\sec\\left(x\\right) = \\frac{\\sin\\left(x\\right)}{\\cos\\left(x\\right)}",
            "\\int \\sin\\left(x\\right)\\, \\sec\\left(x\\right)\\,dx = -\\ln\\left(\\left|\\cos\\left(x\\right)\\right|\\right)"
          ]
        },
        {
          "title": "The top is the derivative of the bottom",
          "math": [
            "\\int \\frac{f'(x)}{f(x)}\\,dx = \\ln|f(x)|",
            "\\frac{d}{dx}\\left(\\cos\\left(x\\right)\\right) = -\\sin\\left(x\\right), \\ \\text{and the top is } -1 \\times \\text{that}",
            "\\int \\frac{\\sin\\left(x\\right)}{\\cos\\left(x\\right)}\\,dx = -\\ln\\left(\\left|\\cos\\left(x\\right)\\right|\\right)"
          ]
        },
        {
          "title": "Rewrite the integrand",
          "math": [
            "\\cos\\left(x\\right)\\, \\sec\\left(x\\right) = 1",
            "\\int \\cos\\left(x\\right)\\, \\sec\\left(x\\right)\\,dx =  x"
          ]
        },
        {
          "title": "Constant rule",
          "math": [
            "\\int k\\,dx = kx",
            "\\int 1\\,dx =  x"
          ]
        },
        {
          "title": "Particular integral",
          "math": [
            "\\text{PI} = \\cos\\left(x\\right)\\, \\ln\\left(\\left|\\cos\\left(x\\right)\\right|\\right)+ x\\, \\sin\\left(x\\right)"
          ]
        },
        {
          "title": "General solution",
          "math": [
            "y = \\text{CF} + \\text{PI}",
            "y =  C_{1} \\cos\\left(x\\right)+ C_{2} \\sin\\left(x\\right)+\\cos\\left(x\\right)\\, \\ln\\left(\\left|\\cos\\left(x\\right)\\right|\\right)+ x\\, \\sin\\left(x\\right)"
          ]
        }
      ],
      "answer": "$$y = C_1\\cos x + C_2\\sin x + \\cos x\\ln|\\cos x| + x\\sin x$$"
    },
    "symbols": [
      {
        "s": "y_1,\\ y_2",
        "t": "The two CF solutions.",
        "e": "\\cos x,\\ \\sin x"
      },
      {
        "s": "W = y_1y_2' - y_2y_1'",
        "t": "The Wronskian.",
        "e": "1"
      },
      {
        "s": "R",
        "t": "The right side.",
        "e": "\\sec x"
      },
      {
        "s": "\\text{PI} = -y_1\\int\\frac{y_2R}{W}dx + y_2\\int\\frac{y_1R}{W}dx",
        "t": "The variation-of-parameters formula.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Swapping y₁ and y₂ in the integrals.",
        "f": "y₁ is multiplied by the integral of y₂R/W, with a minus sign."
      },
      {
        "m": "Wronskian sign.",
        "f": "$W = \\cos x\\cdot\\cos x - \\sin x\\cdot(-\\sin x) = 1$."
      },
      {
        "m": "Using undetermined coefficients for sec x.",
        "f": "sec x has no finite family of derivatives: use variation of parameters."
      },
      {
        "m": "Adding constants inside the PI.",
        "f": "Leave them out; the CF already has C₁, C₂."
      }
    ]
  }
};

export default DATA;
