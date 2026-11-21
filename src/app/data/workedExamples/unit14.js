// Worked examples, symbol keys and common mistakes for the (UNIT-14) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "bilinear-transformation": {
    "example": {
      "question": "Find the bilinear transformation that maps $z = -1, 0, 1$ to $w = 0, i, 3i$.",
      "steps": [
        {
          "title": "The cross-ratio is unchanged",
          "math": [
            "\\frac{(w - w_1)(w_2 - w_3)}{(w - w_3)(w_2 - w_1)} = \\frac{(z - z_1)(z_2 - z_3)}{(z - z_3)(z_2 - z_1)}",
            "z: -1, 0, 1 \\ \\mapsto \\ w: 0, i, 3i",
            "\\text{(a factor with } \\infty \\text{ is left out)}"
          ]
        },
        {
          "title": "Solve for w",
          "math": [
            "w = \\frac{-3iz - 3i}{z - 3}"
          ]
        },
        {
          "title": "Fixed points",
          "math": [
            "z = \\frac{az + b}{cz + d} \\iff cz^2 + (d - a)z - b = 0",
            "z = 3.43649 - 3.43649i, \\ -0.436492 + 0.436492i"
          ]
        },
        {
          "title": "Check",
          "math": [
            "-1 \\mapsto 0 \\checkmark",
            "0 \\mapsto i \\checkmark",
            "1 \\mapsto 3i \\checkmark"
          ]
        }
      ],
      "answer": "$$w = \\frac{-3i(z + 1)}{z - 3}$$"
    },
    "symbols": [
      {
        "s": "w = \\frac{az + b}{cz + d}",
        "t": "A bilinear (Möbius) map, with $ad - bc \\ne 0$.",
        "e": ""
      },
      {
        "s": "z_1, z_2, z_3 \\mapsto w_1, w_2, w_3",
        "t": "Three points and their images fix the map.",
        "e": ""
      },
      {
        "s": "\\text{cross-ratio}",
        "t": "The quantity the map leaves unchanged.",
        "e": ""
      },
      {
        "s": "\\text{fixed point}",
        "t": "A point with w = z.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Mixing the order in the cross-ratio.",
        "f": "Use the same pattern on both sides: $(w - w_1)(w_2 - w_3)$ over $(w - w_3)(w_2 - w_1)$."
      },
      {
        "m": "Not checking.",
        "f": "Put each $z_k$ back in; it must give $w_k$."
      },
      {
        "m": "A point at ∞.",
        "f": "Leave out the factors that contain ∞."
      },
      {
        "m": "Forgetting $ad - bc \\ne 0$.",
        "f": "If it is 0 the map is constant, not bilinear."
      }
    ]
  },
  "cauchy-integral-formula": {
    "example": {
      "question": "Evaluate $\\displaystyle\\oint_C \\frac{e^{2z}}{(z + 1)^4}\\,dz$ where C is the circle $|z| = 3$.",
      "steps": [
        {
          "title": "Singular points",
          "math": [
            "\\text{zeros of the denominator}",
            "z = -1 \\ (\\text{power } 4)"
          ]
        },
        {
          "title": "Which lie inside C?",
          "math": [
            "C: |z - 0| = 3",
            "\\text{inside: } -1"
          ]
        },
        {
          "title": "At z = -1",
          "math": [
            "\\oint \\frac{g(z)}{(z - a)^{4}}dz = \\frac{2\\pi i}{3!}g^{(3)}(a)",
            "g(z) = {e}^{2 z}",
            "g^{(3)}(z) = 8 {e}^{2 z}",
            "\\text{contribution} = \\frac{2\\pi i}{3!} \\cdot \\frac{8}{e^{2}} = \\frac{8\\pi}{3e^{2}}\\,i"
          ]
        }
      ],
      "answer": "$$\\oint_C \\frac{e^{2z}}{(z + 1)^4}\\,dz = \\frac{8\\pi i}{3e^2}$$"
    },
    "symbols": [
      {
        "s": "\\oint_C \\frac{g(z)}{(z - a)^{n+1}}dz = \\frac{2\\pi i}{n!}g^{(n)}(a)",
        "t": "Cauchy’s integral formula for derivatives.",
        "e": ""
      },
      {
        "s": "a",
        "t": "The singular point inside C.",
        "e": "-1"
      },
      {
        "s": "g(z)",
        "t": "The analytic part on top.",
        "e": "e^{2z}"
      },
      {
        "s": "n",
        "t": "One less than the power below.",
        "e": "3"
      }
    ],
    "mistakes": [
      {
        "m": "Using n + 1 in the factorial.",
        "f": "Power 4 below means n = 3: divide by 3!."
      },
      {
        "m": "Point outside C.",
        "f": "If a is outside, the integral is 0."
      },
      {
        "m": "Wrong derivative.",
        "f": "$\\frac{d^3}{dz^3}e^{2z} = 8e^{2z}$."
      },
      {
        "m": "Dropping 2πi.",
        "f": "The formula always carries $2\\pi i$."
      }
    ]
  },
  "cauchy-riemann-equations": {
    "example": {
      "question": "Show that $f(z) = z^2 + 2z$ is analytic and find $f'(z)$.",
      "steps": [
        {
          "title": "Put z = x + iy",
          "math": [
            "f(z) = u(x, y) + i\\,v(x, y)",
            "f = {(x + iy)}^{2}+2 (x + iy)",
            "u = {x}^{2}-{y}^{2}+2 x, \\qquad v = 2 x\\, y+2 y"
          ]
        },
        {
          "title": "Partial derivatives",
          "math": [
            "u_x = 2 x+2, \\quad u_y = -2 y",
            "v_x = 2 y, \\quad v_y = 2 x+2"
          ]
        },
        {
          "title": "Cauchy–Riemann equations",
          "math": [
            "u_x = v_y, \\qquad u_y = -v_x",
            "u_x = v_y: \\quad 2 x+2 = 2 x+2",
            "u_y = -v_x: \\quad -2 y = -2 y"
          ]
        },
        {
          "title": "f′(z)",
          "math": [
            "f'(z) = u_x + i\\,v_x \\ (\\text{put } x = z,\\ y = 0)",
            "f'(z) = 2 x+2 + i\\left(2 y\\right)",
            "f'(z) = 2 z+2"
          ]
        }
      ],
      "answer": "$$u_x = v_y,\\ u_y = -v_x \\text{ everywhere}: \\ f \\text{ is analytic}, \\quad f'(z) = 2z + 2$$"
    },
    "symbols": [
      {
        "s": "f = u + iv",
        "t": "Real and imaginary parts.",
        "e": "u = x^2 - y^2 + 2x"
      },
      {
        "s": "u_x = v_y,\\ u_y = -v_x",
        "t": "The Cauchy–Riemann equations.",
        "e": ""
      },
      {
        "s": "f'(z) = u_x + iv_x",
        "t": "The derivative once CR holds.",
        "e": ""
      },
      {
        "s": "\\text{analytic}",
        "t": "Differentiable at every point of a region.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Sign in the second equation.",
        "f": "It is $u_y = -v_x$."
      },
      {
        "m": "Checking CR at one point only.",
        "f": "For analytic in a region, CR must hold throughout (with continuous partials)."
      },
      {
        "m": "Expanding $(x + iy)^2$ wrongly.",
        "f": "$x^2 - y^2 + 2ixy$: $i^2 = -1$."
      },
      {
        "m": "Leaving f′ in x and y.",
        "f": "Put x = z, y = 0 to write it in z."
      }
    ]
  },
  "contour-integration": {
    "example": {
      "question": "Evaluate $\\displaystyle\\int_0^{2\\pi} \\frac{d\\theta}{5 + 4\\cos\\theta}$.",
      "steps": [
        {
          "title": "Put z = e^{iθ}",
          "math": [
            "\\cos\\theta = \\frac{z + z^{-1}}{2}, \\qquad d\\theta = \\frac{dz}{iz}, \\qquad \\theta: 0 \\to 2\\pi \\text{ is the circle } |z| = 1"
          ]
        },
        {
          "title": "Rewrite the integrand",
          "math": [
            "5 + 4\\cos\\theta = 5 + 2\\left(z + \\frac1z\\right) = \\frac{2z^2 + 5z + 2}{z}",
            "I = \\oint_{|z|=1} \\frac{z}{2z^2 + 5z + 2}\\cdot\\frac{dz}{iz} = \\oint \\frac{dz}{i(2z + 1)(z + 2)}"
          ]
        },
        {
          "title": "Poles inside |z| = 1",
          "math": [
            "z = -\\tfrac12 \\ (\\text{inside}), \\qquad z = -2 \\ (\\text{outside})"
          ]
        },
        {
          "title": "Residue at z = −½",
          "math": [
            "\\operatorname{Res} = \\lim_{z \\to -1/2}\\left(z + \\tfrac12\\right)\\frac{1}{i\\cdot 2\\left(z + \\tfrac12\\right)(z + 2)} = \\frac{1}{2i\\cdot\\tfrac32} = \\frac{1}{3i}"
          ]
        },
        {
          "title": "Residue theorem",
          "math": [
            "I = 2\\pi i\\cdot\\frac{1}{3i} = \\frac{2\\pi}{3}"
          ]
        }
      ],
      "answer": "$$\\int_0^{2\\pi} \\frac{d\\theta}{5 + 4\\cos\\theta} = \\frac{2\\pi}{3}$$"
    },
    "symbols": [
      {
        "s": "z = e^{i\\theta}",
        "t": "Turns a 0–2π integral into one round the unit circle.",
        "e": ""
      },
      {
        "s": "d\\theta = \\frac{dz}{iz}",
        "t": "The change of variable.",
        "e": ""
      },
      {
        "s": "\\operatorname{Res}",
        "t": "The residue: the coefficient of $\\frac{1}{z - a}$.",
        "e": "\\tfrac{1}{3i}"
      },
      {
        "s": "\\oint = 2\\pi i\\sum\\operatorname{Res}",
        "t": "The residue theorem (poles inside C only).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the 2 when factoring.",
        "f": "$2z^2 + 5z + 2 = (2z + 1)(z + 2)$: the residue at −½ picks up the factor 2."
      },
      {
        "m": "Including the outside pole.",
        "f": "Only poles with |z| < 1 count."
      },
      {
        "m": "Dropping 1/(iz).",
        "f": "Every term must be converted, including dθ."
      },
      {
        "m": "Complex answer for a real integral.",
        "f": "The i’s must cancel; if not, recheck."
      }
    ]
  },
  "harmonic-conjugate": {
    "example": {
      "question": "Show that $u = x^3 - 3xy^2$ is harmonic and find its harmonic conjugate v.",
      "steps": [
        {
          "title": "Check Laplace’s equation",
          "math": [
            "u_x = 3x^2 - 3y^2, \\qquad u_y = -6xy",
            "u_{xx} = 6x, \\qquad u_{yy} = -6x",
            "u_{xx} + u_{yy} = 6x - 6x = 0 \\ \\Rightarrow\\ u \\text{ is harmonic}"
          ]
        },
        {
          "title": "Milne-Thomson: put x = z, y = 0",
          "math": [
            "f'(z) = u_x(z, 0) - i\\,u_y(z, 0) = 3z^2 - i(0) = 3z^2"
          ]
        },
        {
          "title": "Integrate",
          "math": [
            "f(z) = \\int 3z^2\\,dz = z^3 + C"
          ]
        },
        {
          "title": "Take the imaginary part",
          "math": [
            "z^3 = (x + iy)^3 = (x^3 - 3xy^2) + i(3x^2y - y^3)",
            "v = 3x^2y - y^3 + C",
            "\\text{Check: } u_x = 3x^2 - 3y^2 = v_y, \\quad u_y = -6xy = -v_x \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$v = 3x^2y - y^3 + C, \\qquad f(z) = z^3$$"
    },
    "symbols": [
      {
        "s": "u_{xx} + u_{yy} = 0",
        "t": "Laplace’s equation: u is harmonic.",
        "e": ""
      },
      {
        "s": "v",
        "t": "The harmonic conjugate: u + iv is analytic.",
        "e": ""
      },
      {
        "s": "f'(z) = u_x(z,0) - iu_y(z,0)",
        "t": "Milne-Thomson’s method.",
        "e": ""
      },
      {
        "s": "C",
        "t": "A real constant.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Sign in Milne-Thomson.",
        "f": "It is $u_x - iu_y$ (minus)."
      },
      {
        "m": "Taking the real part.",
        "f": "v is the imaginary part of f."
      },
      {
        "m": "Skipping the harmonic check.",
        "f": "A conjugate exists only if u is harmonic."
      },
      {
        "m": "Forgetting C.",
        "f": "v is fixed only up to a constant."
      }
    ]
  },
  "laurent-series": {
    "example": {
      "question": "Expand $f(z) = \\dfrac{1}{(z - 1)(z - 2)}$ as a Laurent series in $1 < |z| < 2$.",
      "steps": [
        {
          "title": "Partial fractions",
          "math": [
            "f(z) = \\frac{1}{z - 2} - \\frac{1}{z - 1}"
          ]
        },
        {
          "title": "The fraction with |z| < 2: powers of z/2",
          "math": [
            "\\frac{1}{z - 2} = -\\frac12\\cdot\\frac{1}{1 - z/2} = -\\frac12\\sum_{n=0}^{\\infty}\\left(\\frac z2\\right)^n = -\\frac12 - \\frac z4 - \\frac{z^2}{8} - \\cdots"
          ]
        },
        {
          "title": "The fraction with |z| > 1: powers of 1/z",
          "math": [
            "\\frac{1}{z - 1} = \\frac1z\\cdot\\frac{1}{1 - 1/z} = \\frac1z\\sum_{n=0}^{\\infty}\\frac{1}{z^n} = \\frac1z + \\frac{1}{z^2} + \\frac{1}{z^3} + \\cdots"
          ]
        },
        {
          "title": "Combine",
          "math": [
            "f(z) = -\\sum_{n=1}^{\\infty}\\frac{1}{z^n} - \\sum_{n=0}^{\\infty}\\frac{z^n}{2^{n+1}}",
            "= \\cdots - \\frac{1}{z^2} - \\frac1z - \\frac12 - \\frac z4 - \\frac{z^2}{8} - \\cdots"
          ]
        }
      ],
      "answer": "$$f(z) = -\\sum_{n=1}^{\\infty} z^{-n} - \\sum_{n=0}^{\\infty} \\frac{z^n}{2^{n+1}}, \\quad 1 < |z| < 2$$"
    },
    "symbols": [
      {
        "s": "\\sum_{n=-\\infty}^{\\infty} a_n(z - z_0)^n",
        "t": "A Laurent series: positive and negative powers.",
        "e": ""
      },
      {
        "s": "\\frac{1}{1 - u} = \\sum u^n,\\ |u| < 1",
        "t": "The geometric series used for each piece.",
        "e": ""
      },
      {
        "s": "\\text{principal part}",
        "t": "The terms with negative powers.",
        "e": ""
      },
      {
        "s": "1 < |z| < 2",
        "t": "The annulus between the two poles.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Same expansion in every region.",
        "f": "The region decides: |u| < 1 must hold for each geometric series."
      },
      {
        "m": "Expanding $\\frac{1}{z - 1}$ in powers of z here.",
        "f": "That needs |z| < 1; in this annulus use powers of 1/z."
      },
      {
        "m": "Sign slip in $\\frac{1}{z - 2}$.",
        "f": "$\\frac{1}{z - 2} = -\\frac{1}{2(1 - z/2)}$."
      },
      {
        "m": "Calling it a Taylor series.",
        "f": "With negative powers it is a Laurent series."
      }
    ]
  },
  "residue-calculator": {
    "example": {
      "question": "Evaluate $\\displaystyle\\oint_C \\frac{z - 3}{z^2 + 2z + 5}\\,dz$ where C is $|z| = 3$.",
      "steps": [
        {
          "title": "Find the poles",
          "math": [
            "z^2 + 2z + 5 = 0 \\ \\Rightarrow\\ z = \\frac{-2 \\pm \\sqrt{4 - 20}}{2} = -1 \\pm 2i",
            "|-1 \\pm 2i| = \\sqrt{1 + 4} = \\sqrt5 \\approx 2.24 < 3: \\text{ both inside}"
          ]
        },
        {
          "title": "Residue at a simple pole",
          "math": [
            "\\operatorname{Res}_{z=a} \\frac{p(z)}{q(z)} = \\frac{p(a)}{q'(a)}, \\qquad q'(z) = 2z + 2"
          ]
        },
        {
          "title": "At z = −1 + 2i",
          "math": [
            "\\operatorname{Res} = \\frac{-1 + 2i - 3}{2(-1 + 2i) + 2} = \\frac{-4 + 2i}{4i} = \\frac{-4}{4i} + \\frac{2i}{4i} = i + \\frac12"
          ]
        },
        {
          "title": "At z = −1 − 2i",
          "math": [
            "\\operatorname{Res} = \\frac{-4 - 2i}{-4i} = \\frac{-4}{-4i} + \\frac{-2i}{-4i} = -i + \\frac12"
          ]
        },
        {
          "title": "Residue theorem",
          "math": [
            "\\oint_C = 2\\pi i\\left[\\left(\\tfrac12 + i\\right) + \\left(\\tfrac12 - i\\right)\\right] = 2\\pi i\\,(1) = 2\\pi i"
          ]
        }
      ],
      "answer": "$$\\oint_{|z|=3} \\frac{z - 3}{z^2 + 2z + 5}\\,dz = 2\\pi i$$"
    },
    "symbols": [
      {
        "s": "\\operatorname{Res}_{z=a} f",
        "t": "The residue at a: coefficient of $\\frac{1}{z - a}$.",
        "e": ""
      },
      {
        "s": "\\frac{p(a)}{q'(a)}",
        "t": "Quick residue at a simple pole.",
        "e": ""
      },
      {
        "s": "\\oint_C f\\,dz = 2\\pi i\\sum\\operatorname{Res}",
        "t": "The residue theorem.",
        "e": ""
      },
      {
        "s": "\\frac{1}{i} = -i",
        "t": "Useful when simplifying.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Counting poles outside C.",
        "f": "Check |a| against the radius for each pole."
      },
      {
        "m": "Using p/q′ at a double pole.",
        "f": "For order m use $\\frac{1}{(m-1)!}\\lim \\frac{d^{m-1}}{dz^{m-1}}[(z - a)^mf]$."
      },
      {
        "m": "Arithmetic with 1/i.",
        "f": "$\\frac{1}{i} = -i$, so $\\frac{-4}{4i} = i$."
      },
      {
        "m": "Forgetting 2πi.",
        "f": "Multiply the sum of residues by $2\\pi i$."
      }
    ]
  }
};

export default DATA;
