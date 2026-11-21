// Worked examples, symbol keys and common mistakes for the (UNIT-13) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "complex-fourier-series": {
    "example": {
      "question": "Find the complex Fourier series of $f(x) = x$ on $(-\\pi, \\pi)$, and use Parseval’s identity to find $\\sum \\frac{1}{n^2}$.",
      "steps": [
        {
          "title": "The coefficient formula",
          "math": [
            "f(x) = \\sum_{n=-\\infty}^{\\infty} c_n e^{inx}, \\qquad c_n = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f(x)\\,e^{-inx}\\,dx"
          ]
        },
        {
          "title": "c₀",
          "math": [
            "c_0 = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} x\\,dx = \\frac{1}{2\\pi}\\left[\\frac{x^2}{2}\\right]_{-\\pi}^{\\pi} = 0"
          ]
        },
        {
          "title": "cₙ for n ≠ 0 (by parts)",
          "math": [
            "\\int x\\,e^{-inx}\\,dx = \\frac{ix\\,e^{-inx}}{n} + \\frac{e^{-inx}}{n^2}",
            "\\text{With } e^{\\pm in\\pi} = (-1)^n: \\quad \\int_{-\\pi}^{\\pi} x\\,e^{-inx}\\,dx = \\frac{i}{n}\\left[\\pi(-1)^n + \\pi(-1)^n\\right] + 0 = \\frac{2\\pi i(-1)^n}{n}",
            "c_n = \\frac{1}{2\\pi}\\cdot\\frac{2\\pi i(-1)^n}{n} = \\frac{i(-1)^n}{n}"
          ]
        },
        {
          "title": "The first coefficients",
          "math": [
            "c_{\\pm1} = \\mp i, \\quad c_{\\pm2} = \\pm\\frac{i}{2}, \\quad c_{\\pm3} = \\mp\\frac{i}{3}",
            "x = \\sum_{n \\ne 0} \\frac{i(-1)^n}{n}e^{inx}"
          ]
        },
        {
          "title": "Parseval's identity",
          "math": [
            "\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} x^2\\,dx = \\sum |c_n|^2",
            "\\frac{1}{2\\pi}\\cdot\\frac{2\\pi^3}{3} = 2\\sum_{n=1}^{\\infty}\\frac{1}{n^2} \\ \\Rightarrow\\ \\frac{\\pi^2}{3} = 2\\sum\\frac{1}{n^2}",
            "\\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}"
          ]
        }
      ],
      "answer": "$$x = \\sum_{n \\ne 0}\\frac{i(-1)^n}{n}e^{inx}, \\qquad \\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}$$"
    },
    "symbols": [
      {
        "s": "c_n",
        "t": "The complex Fourier coefficient.",
        "e": "\\tfrac{i(-1)^n}{n}"
      },
      {
        "s": "e^{inx} = \\cos nx + i\\sin nx",
        "t": "Euler’s formula.",
        "e": ""
      },
      {
        "s": "c_n = \\frac{a_n - ib_n}{2}",
        "t": "Link to the real coefficients.",
        "e": ""
      },
      {
        "s": "\\sum |c_n|^2",
        "t": "Parseval: equals the mean of $|f|^2$ over a period.",
        "e": "\\tfrac{\\pi^2}{3}"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the minus in $e^{-inx}$.",
        "f": "The coefficient formula uses $e^{-inx}$."
      },
      {
        "m": "Dividing by π instead of 2π.",
        "f": "Complex coefficients use $\\frac{1}{2\\pi}$ (or $\\frac{1}{2L}$)."
      },
      {
        "m": "Counting only n > 0 in Parseval.",
        "f": "Sum over all n: each $|c_n|^2$ appears for n and −n."
      },
      {
        "m": "Using the formula for n = 0.",
        "f": "$c_0$ must be worked out separately (no division by n)."
      }
    ]
  },
  "dft-fft-calculator": {
    "example": {
      "question": "Find the 4-point DFT of $x = (1, 2, 3, 4)$.",
      "steps": [
        {
          "title": "The DFT formula",
          "math": [
            "X_k = \\sum_{n=0}^{N-1} x_n W^{kn}, \\qquad W = e^{-2\\pi i/N}"
          ]
        },
        {
          "title": "Powers of W for N = 4",
          "math": [
            "W = e^{-i\\pi/2} = -i: \\quad W^0 = 1,\\ W^1 = -i,\\ W^2 = -1,\\ W^3 = i"
          ]
        },
        {
          "title": "Each X_k with the numbers put in",
          "math": [
            "X_0 = 1 + 2 + 3 + 4 = 10",
            "X_1 = 1 + 2(-i) + 3(-1) + 4(i) = -2 + 2i",
            "X_2 = 1 + 2(-1) + 3(1) + 4(-1) = -2",
            "X_3 = 1 + 2(i) + 3(-1) + 4(-i) = -2 - 2i"
          ]
        },
        {
          "title": "Check with the FFT butterflies",
          "text": "Bit-reversed order (1, 3, 2, 4). Stage 1: $1 \\pm 3 = 4, -2$ and $2 \\pm 4 = 6, -2$. Stage 2: $4 \\pm 6 = 10, -2$ and $-2 \\pm (-i)(-2) = -2 + 2i, -2 - 2i$ ✓"
        }
      ],
      "answer": "$$X = (10,\\ -2 + 2i,\\ -2,\\ -2 - 2i)$$"
    },
    "symbols": [
      {
        "s": "x_n",
        "t": "The input samples.",
        "e": "1, 2, 3, 4"
      },
      {
        "s": "N",
        "t": "The number of samples.",
        "e": "4"
      },
      {
        "s": "W = e^{-2\\pi i/N}",
        "t": "The twiddle factor.",
        "e": "-i"
      },
      {
        "s": "X_k",
        "t": "The k-th frequency component.",
        "e": ""
      },
      {
        "s": "\\text{FFT}",
        "t": "A fast way to the same answer: $N\\log_2 N$ work instead of $N^2$.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Wrong sign in W.",
        "f": "The forward DFT uses $e^{-2\\pi i/N}$; the inverse uses $+$ and divides by N."
      },
      {
        "m": "Reducing kn wrongly.",
        "f": "Powers of W repeat every N: $W^6 = W^2$ for N = 4."
      },
      {
        "m": "Skipping bit reversal in the FFT.",
        "f": "Radix-2 decimation in time starts from the bit-reversed order."
      },
      {
        "m": "Expecting a real answer.",
        "f": "X is complex in general; $X_{N-k}$ is the conjugate of $X_k$ for real x."
      }
    ]
  },
  "difference-equation-z-transform": {
    "example": {
      "question": "Solve $y(n+2) - 3y(n+1) + 2y(n) = 0$ with $y(0) = 0,\\ y(1) = 1$, using the Z-transform.",
      "steps": [
        {
          "title": "The shift rules",
          "math": [
            "\\mathcal Z\\{y(n+1)\\} = zY - zy(0), \\qquad \\mathcal Z\\{y(n+2)\\} = z^2Y - z^2y(0) - zy(1)"
          ]
        },
        {
          "title": "Transform the equation",
          "math": [
            "\\left(z^2Y - 0 - z\\right) - 3\\left(zY - 0\\right) + 2Y = 0",
            "(z^2 - 3z + 2)\\,Y = z \\ \\Rightarrow\\ Y(z) = \\frac{z}{(z - 1)(z - 2)}"
          ]
        },
        {
          "title": "Partial fractions of Y/z",
          "math": [
            "\\frac{Y}{z} = \\frac{1}{(z - 1)(z - 2)} = \\frac{A}{z - 1} + \\frac{B}{z - 2}",
            "A = \\frac{1}{1 - 2} = -1, \\qquad B = \\frac{1}{2 - 1} = 1",
            "Y = -\\frac{z}{z - 1} + \\frac{z}{z - 2}"
          ]
        },
        {
          "title": "Invert and check",
          "math": [
            "y(n) = -1^n + 2^n = 2^n - 1",
            "\\text{Check: } y(2) = 3 = 3y(1) - 2y(0) = 3 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$y(n) = 2^n - 1$$"
    },
    "symbols": [
      {
        "s": "Y(z) = \\mathcal Z\\{y(n)\\}",
        "t": "The Z-transform of the sequence.",
        "e": ""
      },
      {
        "s": "\\frac{z}{z - a} \\leftrightarrow a^n",
        "t": "The basic pair used to invert.",
        "e": ""
      },
      {
        "s": "y(0),\\ y(1)",
        "t": "The starting values, used in the shift rule.",
        "e": "0,\\ 1"
      }
    ],
    "mistakes": [
      {
        "m": "Dropping the initial values.",
        "f": "The shift rule subtracts $z^2y(0) + zy(1)$."
      },
      {
        "m": "Partial fractions of Y instead of Y/z.",
        "f": "Split Y/z, then multiply back by z to get $\\frac{z}{z - a}$ terms."
      },
      {
        "m": "Wrong sign in the shift.",
        "f": "For y(n + k) it is $z^kY$ minus terms (forward shift)."
      },
      {
        "m": "Not checking.",
        "f": "Work out y(2) from the recurrence and compare."
      }
    ]
  },
  "fourier-transform": {
    "example": {
      "question": "Find the Fourier transform of $f(x) = 1$ for $|x| < 1$, and $0$ otherwise. Hence find $\\int_0^\\infty \\frac{\\sin\\omega}{\\omega}\\,d\\omega$.",
      "steps": [
        {
          "title": "The definition",
          "math": [
            "F(\\omega) = \\int_{-\\infty}^{\\infty} f(x)\\,e^{-i\\omega x}\\,dx"
          ]
        },
        {
          "title": "Only −1 < x < 1 counts",
          "math": [
            "F(\\omega) = \\int_{-1}^{1} e^{-i\\omega x}\\,dx = \\left[\\frac{e^{-i\\omega x}}{-i\\omega}\\right]_{-1}^{1} = \\frac{e^{i\\omega} - e^{-i\\omega}}{i\\omega}"
          ]
        },
        {
          "title": "Use $e^{iomega} - e^{-iomega} = 2isinomega$",
          "math": [
            "F(\\omega) = \\frac{2i\\sin\\omega}{i\\omega} = \\frac{2\\sin\\omega}{\\omega}, \\qquad F(0) = 2"
          ]
        },
        {
          "title": "Inverse at x = 0",
          "math": [
            "f(0) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} \\frac{2\\sin\\omega}{\\omega}\\,d\\omega = 1",
            "\\int_{-\\infty}^{\\infty}\\frac{\\sin\\omega}{\\omega}\\,d\\omega = \\pi \\ \\Rightarrow\\ \\int_0^{\\infty}\\frac{\\sin\\omega}{\\omega}\\,d\\omega = \\frac{\\pi}{2}"
          ]
        }
      ],
      "answer": "$$F(\\omega) = \\frac{2\\sin\\omega}{\\omega}, \\qquad \\int_0^\\infty \\frac{\\sin\\omega}{\\omega}\\,d\\omega = \\frac{\\pi}{2}$$"
    },
    "symbols": [
      {
        "s": "F(\\omega)",
        "t": "The Fourier transform of f.",
        "e": "\\tfrac{2\\sin\\omega}{\\omega}"
      },
      {
        "s": "\\omega",
        "t": "The frequency variable.",
        "e": ""
      },
      {
        "s": "f(x) = \\frac{1}{2\\pi}\\int F(\\omega)e^{i\\omega x}\\,d\\omega",
        "t": "The inverse transform.",
        "e": ""
      },
      {
        "s": "\\text{even } f",
        "t": "Then only the cosine part survives and F is real.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Integrating over all x.",
        "f": "f is 0 outside (−1, 1): integrate only there."
      },
      {
        "m": "Dividing by 0 at ω = 0.",
        "f": "Take the limit: $F(0) = 2$, the area under f."
      },
      {
        "m": "Mixing conventions.",
        "f": "Some books put $\\frac{1}{\\sqrt{2\\pi}}$ in front; keep one convention throughout."
      },
      {
        "m": "Value at a jump.",
        "f": "At x = ±1 the inverse gives the average, ½."
      }
    ]
  },
  "inverse-laplace-transform": {
    "example": {
      "question": "Find $\\mathcal{L}^{-1}\\left\\{\\dfrac{1}{s^2 - 3s + 2}\\right\\}$.",
      "steps": [
        {
          "title": "Factor the denominator",
          "math": [
            "s^2 - 3s + 2 = (s - 1)(s - 2)"
          ]
        },
        {
          "title": "Partial fractions (cover-up)",
          "math": [
            "\\frac{1}{(s - 1)(s - 2)} = \\frac{A}{s - 1} + \\frac{B}{s - 2}",
            "A = \\frac{1}{1 - 2} = -1, \\qquad B = \\frac{1}{2 - 1} = 1"
          ]
        },
        {
          "title": "Use the table",
          "math": [
            "\\mathcal L^{-1}\\left\\{\\frac{1}{s - a}\\right\\} = e^{at}",
            "f(t) = -e^{t} + e^{2t}"
          ]
        },
        {
          "title": "Check",
          "math": [
            "\\mathcal L\\{e^{2t} - e^{t}\\} = \\frac{1}{s - 2} - \\frac{1}{s - 1} = \\frac{(s - 1) - (s - 2)}{(s - 1)(s - 2)} = \\frac{1}{s^2 - 3s + 2} \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\mathcal L^{-1}\\left\\{\\frac{1}{s^2 - 3s + 2}\\right\\} = e^{2t} - e^{t}$$"
    },
    "symbols": [
      {
        "s": "F(s)",
        "t": "The function of s to invert.",
        "e": ""
      },
      {
        "s": "f(t) = \\mathcal L^{-1}\\{F(s)\\}",
        "t": "The time function it comes from.",
        "e": ""
      },
      {
        "s": "\\frac{1}{s - a} \\leftrightarrow e^{at}",
        "t": "The key table pair.",
        "e": ""
      },
      {
        "s": "A,\\ B",
        "t": "Partial-fraction constants.",
        "e": "-1,\\ 1"
      }
    ],
    "mistakes": [
      {
        "m": "Not factoring first.",
        "f": "Factor the denominator, then split into partial fractions."
      },
      {
        "m": "Sign of a.",
        "f": "$\\frac{1}{s + 2} \\leftrightarrow e^{-2t}$."
      },
      {
        "m": "Complete the square when the quadratic does not factor.",
        "f": "$\\frac{1}{(s - a)^2 + b^2} \\leftrightarrow \\frac1b e^{at}\\sin bt$."
      },
      {
        "m": "Repeated factors.",
        "f": "$\\frac{1}{(s - a)^2} \\leftrightarrow te^{at}$; include each power in the split."
      }
    ]
  },
  "inverse-z-transform": {
    "example": {
      "question": "Find $\\mathcal Z^{-1}\\left\\{\\dfrac{z}{(z - 1)(z - 2)}\\right\\}$.",
      "steps": [
        {
          "title": "Partial fractions of F(z)/z",
          "math": [
            "\\frac{F(z)}{z} = \\frac{1}{(z - 1)(z - 2)} = \\frac{-1}{z - 1} + \\frac{1}{z - 2}"
          ]
        },
        {
          "title": "Multiply back by z",
          "math": [
            "F(z) = -\\frac{z}{z - 1} + \\frac{z}{z - 2}"
          ]
        },
        {
          "title": "Use the table",
          "math": [
            "\\frac{z}{z - a} \\leftrightarrow a^n: \\quad x(n) = -1 + 2^n"
          ]
        },
        {
          "title": "Check by long division",
          "math": [
            "F(z) = \\frac{z}{z^2 - 3z + 2} = z^{-1} + 3z^{-2} + 7z^{-3} + 15z^{-4} + \\cdots",
            "x(0), x(1), x(2), \\dots = 0, 1, 3, 7, 15 = 2^n - 1 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$x(n) = 2^n - 1, \\quad n \\ge 0$$"
    },
    "symbols": [
      {
        "s": "F(z)",
        "t": "The Z-transform to invert.",
        "e": ""
      },
      {
        "s": "x(n)",
        "t": "The sequence it comes from.",
        "e": ""
      },
      {
        "s": "\\frac{z}{z - a} \\leftrightarrow a^n",
        "t": "The key pair.",
        "e": ""
      },
      {
        "s": "\\frac{z}{(z - a)^2} \\leftrightarrow na^{n-1}",
        "t": "For a repeated factor.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Splitting F instead of F/z.",
        "f": "Split F/z so each piece becomes $\\frac{z}{z - a}$."
      },
      {
        "m": "Forgetting the region of convergence.",
        "f": "For a right-sided sequence take |z| > the largest pole (2 here)."
      },
      {
        "m": "Wrong long-division direction.",
        "f": "Divide in descending powers of z to get $x(n)$ for n ≥ 0."
      },
      {
        "m": "Writing $1^n$ as n.",
        "f": "$1^n = 1$."
      }
    ]
  },
  "laplace-transform-ode": {
    "example": {
      "question": "Solve $y'' + 3y' + 2y = e^{-3t}$ with $y(0) = 1,\\ y'(0) = 0$ by the Laplace transform.",
      "steps": [
        {
          "title": "Transform each term",
          "math": [
            "\\mathcal L\\{y''\\} = s^2Y - sy(0) - y'(0) = s^2Y - s",
            "\\mathcal L\\{y'\\} = sY - y(0) = sY - 1, \\qquad \\mathcal L\\{e^{-3t}\\} = \\frac{1}{s + 3}"
          ]
        },
        {
          "title": "Transform the whole equation",
          "math": [
            "(s^2Y - s) + 3(sY - 1) + 2Y = \\frac{1}{s + 3}",
            "(s^2 + 3s + 2)\\,Y = s + 3 + \\frac{1}{s + 3} = \\frac{(s + 3)^2 + 1}{s + 3}"
          ]
        },
        {
          "title": "Solve for Y(s)",
          "math": [
            "Y = \\frac{s^2 + 6s + 10}{(s + 1)(s + 2)(s + 3)}"
          ]
        },
        {
          "title": "Partial fractions (cover-up)",
          "math": [
            "s = -1: \\ A = \\frac{1 - 6 + 10}{(1)(2)} = \\frac52",
            "s = -2: \\ B = \\frac{4 - 12 + 10}{(-1)(1)} = -2",
            "s = -3: \\ C = \\frac{9 - 18 + 10}{(-2)(-1)} = \\frac12"
          ]
        },
        {
          "title": "Invert and check",
          "math": [
            "y(t) = \\frac52e^{-t} - 2e^{-2t} + \\frac12e^{-3t}",
            "y(0) = \\tfrac52 - 2 + \\tfrac12 = 1 \\ \\checkmark, \\qquad y'(0) = -\\tfrac52 + 4 - \\tfrac32 = 0 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$y(t) = \\frac52e^{-t} - 2e^{-2t} + \\frac12e^{-3t}$$"
    },
    "symbols": [
      {
        "s": "Y(s) = \\mathcal L\\{y(t)\\}",
        "t": "The transform of the unknown.",
        "e": ""
      },
      {
        "s": "\\mathcal L\\{y'\\} = sY - y(0)",
        "t": "The derivative rule.",
        "e": ""
      },
      {
        "s": "\\mathcal L\\{y''\\} = s^2Y - sy(0) - y'(0)",
        "t": "The second-derivative rule.",
        "e": ""
      },
      {
        "s": "y(0),\\ y'(0)",
        "t": "The initial conditions, built in from the start.",
        "e": "1,\\ 0"
      }
    ],
    "mistakes": [
      {
        "m": "Dropping the initial values.",
        "f": "They enter through $sy(0)$ and $y′(0)$; no constants are found later."
      },
      {
        "m": "Sign of the cover-up.",
        "f": "Put s = −1 into everything except the (s + 1) factor."
      },
      {
        "m": "Forgetting to transform the right side.",
        "f": "$e^{-3t} \\to \\frac{1}{s + 3}$."
      },
      {
        "m": "Not checking.",
        "f": "Check y(0) and y′(0) from the answer."
      }
    ]
  },
  "laplace-transform": {
    "example": {
      "question": "Find $\\mathcal{L}\\{e^{2t}\\sin 3t\\}$.",
      "steps": [
        {
          "title": "The table entry",
          "math": [
            "\\mathcal L\\{\\sin bt\\} = \\frac{b}{s^2 + b^2} \\ \\Rightarrow\\ \\mathcal L\\{\\sin 3t\\} = \\frac{3}{s^2 + 9}"
          ]
        },
        {
          "title": "First shifting theorem",
          "math": [
            "\\mathcal L\\{e^{at}f(t)\\} = F(s - a) \\quad \\text{with } a = 2"
          ]
        },
        {
          "title": "Replace s by s − 2",
          "math": [
            "\\mathcal L\\{e^{2t}\\sin 3t\\} = \\frac{3}{(s - 2)^2 + 9} = \\frac{3}{s^2 - 4s + 13}, \\quad s > 2"
          ]
        }
      ],
      "answer": "$$\\mathcal L\\{e^{2t}\\sin 3t\\} = \\frac{3}{(s - 2)^2 + 9}$$"
    },
    "symbols": [
      {
        "s": "\\mathcal L\\{f(t)\\} = \\int_0^\\infty e^{-st}f(t)\\,dt",
        "t": "The Laplace transform.",
        "e": ""
      },
      {
        "s": "F(s)",
        "t": "The transform of f.",
        "e": "\\tfrac{3}{s^2 + 9}"
      },
      {
        "s": "F(s - a)",
        "t": "First shift: multiplying by $e^{at}$ shifts s.",
        "e": "a = 2"
      },
      {
        "s": "s > a",
        "t": "Where the integral converges.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Shifting the wrong way.",
        "f": "$e^{2t}$ gives $s - 2$, not $s + 2$."
      },
      {
        "m": "Mixing sin and cos entries.",
        "f": "$\\sin bt \\to \\frac{b}{s^2 + b^2}$, $\\cos bt \\to \\frac{s}{s^2 + b^2}$."
      },
      {
        "m": "Multiplying transforms of a product.",
        "f": "$\\mathcal L\\{fg\\} \\ne F\\cdot G$; use the shift rule."
      },
      {
        "m": "Forgetting b on top.",
        "f": "For sin 3t the top is 3."
      }
    ]
  },
  "unit-step-function": {
    "example": {
      "question": "Find the Laplace transform of $f(t) = t$ for $0 < t < 1$ and $f(t) = 1$ for $t > 1$.",
      "steps": [
        {
          "title": "Write f with a unit step",
          "text": "Start with t, then at t = 1 switch it to 1 by adding $(1 - t)$ from there on.",
          "math": [
            "f(t) = t + (1 - t)\\,u(t - 1)"
          ]
        },
        {
          "title": "Second shifting theorem",
          "math": [
            "\\mathcal L\\{g(t)\\,u(t - a)\\} = e^{-as}\\,\\mathcal L\\{g(t + a)\\}"
          ]
        },
        {
          "title": "Shift the bracket",
          "math": [
            "g(t) = 1 - t \\ \\Rightarrow\\ g(t + 1) = 1 - (t + 1) = -t",
            "\\mathcal L\\{(1 - t)u(t - 1)\\} = e^{-s}\\,\\mathcal L\\{-t\\} = -\\frac{e^{-s}}{s^2}"
          ]
        },
        {
          "title": "Add the pieces",
          "math": [
            "F(s) = \\frac{1}{s^2} - \\frac{e^{-s}}{s^2} = \\frac{1 - e^{-s}}{s^2}"
          ]
        }
      ],
      "answer": "$$F(s) = \\frac{1 - e^{-s}}{s^2}$$"
    },
    "symbols": [
      {
        "s": "u(t - a)",
        "t": "The unit step: 0 before t = a, 1 after.",
        "e": ""
      },
      {
        "s": "a",
        "t": "The switching time.",
        "e": "1"
      },
      {
        "s": "e^{-as}",
        "t": "The delay factor from the second shift.",
        "e": "e^{-s}"
      },
      {
        "s": "g(t + a)",
        "t": "The function shifted back before transforming.",
        "e": "-t"
      }
    ],
    "mistakes": [
      {
        "m": "Transforming g(t), not g(t + a).",
        "f": "The rule needs $\\mathcal L\\{g(t + a)\\}$."
      },
      {
        "m": "Wrong switch term.",
        "f": "To change from A to B at t = a, add $(B - A)u(t - a)$."
      },
      {
        "m": "Writing $e^{as}$.",
        "f": "A delay gives $e^{-as}$."
      },
      {
        "m": "Dropping the first piece.",
        "f": "The term before the first switch still needs its own transform."
      }
    ]
  },
  "z-transform": {
    "example": {
      "question": "Find $\\mathcal Z\\{n\\,2^n\\}$.",
      "steps": [
        {
          "title": "Start from a known pair",
          "math": [
            "\\mathcal Z\\{2^n\\} = \\frac{z}{z - 2}, \\quad |z| > 2"
          ]
        },
        {
          "title": "Multiplication by n",
          "math": [
            "\\mathcal Z\\{n\\,f(n)\\} = -z\\frac{d}{dz}F(z)"
          ]
        },
        {
          "title": "Differentiate",
          "math": [
            "\\frac{d}{dz}\\left(\\frac{z}{z - 2}\\right) = \\frac{(z - 2) - z}{(z - 2)^2} = \\frac{-2}{(z - 2)^2}",
            "\\mathcal Z\\{n\\,2^n\\} = -z\\cdot\\frac{-2}{(z - 2)^2} = \\frac{2z}{(z - 2)^2}"
          ]
        },
        {
          "title": "Check with the first terms",
          "math": [
            "\\sum n2^nz^{-n} = 2z^{-1} + 8z^{-2} + 24z^{-3} + \\cdots, \\quad \\frac{2z}{(z - 2)^2} = 2z^{-1} + 8z^{-2} + 24z^{-3} + \\cdots \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\mathcal Z\\{n\\,2^n\\} = \\frac{2z}{(z - 2)^2}, \\quad |z| > 2$$"
    },
    "symbols": [
      {
        "s": "X(z) = \\sum_{n=0}^\\infty x(n)z^{-n}",
        "t": "The Z-transform.",
        "e": ""
      },
      {
        "s": "\\frac{z}{z - a} \\leftrightarrow a^n",
        "t": "Basic pair.",
        "e": "a = 2"
      },
      {
        "s": "-z\\frac{d}{dz}",
        "t": "Multiplication by n.",
        "e": ""
      },
      {
        "s": "|z| > 2",
        "t": "The region of convergence.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the factor −z.",
        "f": "Multiplying by n gives $-z F′(z)$, not $F′(z)$."
      },
      {
        "m": "Quotient-rule slip.",
        "f": "$\\frac{d}{dz}\\frac{z}{z - 2} = \\frac{(z - 2) - z}{(z - 2)^2}$."
      },
      {
        "m": "No region of convergence.",
        "f": "State |z| > 2."
      },
      {
        "m": "Mixing with Laplace pairs.",
        "f": "Z-transforms are in powers of $z^{-1}$, not $\\frac{1}{s}$."
      }
    ]
  }
};

export default DATA;
