// Worked examples, symbol keys and common mistakes for method pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. Every number was worked out by machine and checked.
const DATA = {
  "rk2": {
    "example": {
      "question": "$\\frac{dy}{dx} = x + y$, $y(0) = 1$: $y(0.2)$ by Heun. Use $h = 0.1$.",
      "steps": [
        {
          "title": "Step 1 in full",
          "math": [
            "k_1 = f(0, 1) = 1, \\qquad k_2 = f(0.1,\\ 1 + 0.1(1)) = 0.1 + 1.1 = 1.2",
            "y_1 = 1 + \\frac{0.1}{2}(1 + 1.2) = 1.11"
          ]
        },
        {
          "title": "Step 2 in full",
          "math": [
            "k_1 = 0.1 + 1.11 = 1.21, \\qquad k_2 = f(0.2,\\ 1.11 + 0.121) = 0.2 + 1.231 = 1.431",
            "y_2 = 1.11 + 0.05(1.21 + 1.431) = 1.24205"
          ]
        },
        {
          "title": "Table",
          "table": {
            "columns": [
              "$n$",
              "$x_n$",
              "$y_n$",
              "$k_1$",
              "$k_2$",
              "$y_{n+1}$"
            ],
            "rows": [
              [
                "0",
                "0",
                "1",
                "1",
                "1.2",
                "1.11"
              ],
              [
                "1",
                "0.1",
                "1.11",
                "1.21",
                "1.431",
                "**1.24205**"
              ]
            ]
          }
        },
        {
          "title": "Check",
          "math": [
            "\\text{exact } 2e^{0.2} - 1.2 = 1.242806, \\qquad \\text{error} = 0.000756"
          ]
        }
      ],
      "answer": "$$y(0.2) \\approx 1.24205$$"
    },
    "symbols": [
      {
        "s": "k_1",
        "t": "Slope at the start of the step.",
        "e": "f(0, 1) = 1"
      },
      {
        "s": "k_2",
        "t": "Slope at the predicted end (Heun) or the middle (midpoint).",
        "e": "1.2 \\text{ or } 1.1"
      },
      {
        "s": "h",
        "t": "Step size.",
        "e": "0.1"
      },
      {
        "s": "y_{n+1}",
        "t": "The new value.",
        "e": "1.11"
      }
    ],
    "mistakes": [
      {
        "m": "Midpoint: using x + h for k₂.",
        "f": "The midpoint is x + h/2 with y + (h/2)k₁."
      },
      {
        "m": "Heun: forgetting to halve h in the update.",
        "f": "y₍ₙ₊₁₎ = yₙ + (h/2)(k₁ + k₂)."
      },
      {
        "m": "Mixing the two versions in one solution.",
        "f": "Pick one and keep it for every step."
      }
    ]
  },
  "milne": {
    "example": {
      "question": "$\\frac{dy}{dx} = x + y$, $y(0) = 1$: find $y(0.4)$. $h = 0.1$; starting values by RK4.",
      "steps": [
        {
          "title": "Starting values (RK4)",
          "table": {
            "columns": [
              "$i$",
              "$x_i$",
              "$y_i$",
              "$f_i = x_i + y_i$"
            ],
            "rows": [
              [
                "0",
                "0",
                "1",
                "1"
              ],
              [
                "1",
                "0.1",
                "1.110342",
                "1.210342"
              ],
              [
                "2",
                "0.2",
                "1.242805",
                "1.442805"
              ],
              [
                "3",
                "0.3",
                "1.399717",
                "1.699717"
              ]
            ]
          }
        },
        {
          "title": "Predict",
          "math": [
            "y_4 = 1 + \\frac{4(0.1)}{3}\\big(2(1.210342) - 1.442805 + 2(1.699717)\\big) = 1 + 0.133333(4.377313) = 1.583642"
          ]
        },
        {
          "title": "Slope at the prediction",
          "math": [
            "f_4 = 0.4 + 1.583642 = 1.983642"
          ]
        },
        {
          "title": "Correct",
          "math": [
            "y_4 = 1.242805 + \\frac{0.1}{3}\\big(1.442805 + 4(1.699717) + 1.983642\\big) = 1.242805 + 0.340844 = 1.583649"
          ],
          "after": "A second pass gives the same 1.583649, so it has settled."
        },
        {
          "title": "Check",
          "math": [
            "\\text{exact } 2e^{0.4} - 1.4 = 1.583649"
          ]
        }
      ],
      "answer": "$$y(0.4) \\approx 1.583649$$"
    },
    "symbols": [
      {
        "s": "y_0 \\dots y_3",
        "t": "Four known values (y₁–y₃ from RK4).",
        "e": "1, 1.110342, 1.242805, 1.399717"
      },
      {
        "s": "f_i",
        "t": "The slope f(xᵢ, yᵢ) at each point.",
        "e": "f_1 = 1.210342"
      },
      {
        "s": "P",
        "t": "The predictor: a first estimate of y₄.",
        "e": "1.583642"
      },
      {
        "s": "C",
        "t": "The corrector, using f₄ from the predicted y₄.",
        "e": "1.583649"
      },
      {
        "s": "h",
        "t": "Step size.",
        "e": "0.1"
      }
    ],
    "mistakes": [
      {
        "m": "Using f₀ in the predictor.",
        "f": "Milne’s predictor uses f₁, f₂, f₃ (weights 2, −1, 2)."
      },
      {
        "m": "Not updating f₄ after correcting.",
        "f": "Each corrector pass needs f₄ from the latest y₄."
      },
      {
        "m": "Starting values by Euler.",
        "f": "They must be as accurate as the method: use RK4 or Taylor."
      }
    ]
  },
  "adams": {
    "example": {
      "question": "$\\frac{dy}{dx} = x + y$, $y(0) = 1$: $y(0.4)$. $h = 0.1$, starting values by RK4.",
      "steps": [
        {
          "title": "Starting values",
          "table": {
            "columns": [
              "$i$",
              "$x_i$",
              "$y_i$",
              "$f_i$"
            ],
            "rows": [
              [
                "0",
                "0",
                "1",
                "1"
              ],
              [
                "1",
                "0.1",
                "1.110342",
                "1.210342"
              ],
              [
                "2",
                "0.2",
                "1.242805",
                "1.442805"
              ],
              [
                "3",
                "0.3",
                "1.399717",
                "1.699717"
              ]
            ]
          }
        },
        {
          "title": "Predict",
          "math": [
            "y_4 = 1.399717 + \\frac{0.1}{24}\\big(55(1.699717) - 59(1.442805) + 37(1.210342) - 9(1)\\big)",
            "= 1.399717 + 0.0041667(44.141594) = 1.583640"
          ]
        },
        {
          "title": "Slope at the prediction",
          "math": [
            "f_4 = 0.4 + 1.583640 = 1.983640"
          ]
        },
        {
          "title": "Correct",
          "math": [
            "y_4 = 1.399717 + \\frac{0.1}{24}\\big(9(1.983640) + 19(1.699717) - 5(1.442805) + 1.210342\\big) = 1.583649"
          ]
        },
        {
          "title": "Check",
          "math": [
            "\\text{exact } 2e^{0.4} - 1.4 = 1.583649"
          ]
        }
      ],
      "answer": "$$y(0.4) \\approx 1.583649$$"
    },
    "symbols": [
      {
        "s": "f_0 \\dots f_3",
        "t": "Slopes at the four known points.",
        "e": "1, 1.210342, 1.442805, 1.699717"
      },
      {
        "s": "55, -59, 37, -9",
        "t": "Predictor weights (they add to 24).",
        "e": ""
      },
      {
        "s": "9, 19, -5, 1",
        "t": "Corrector weights (they add to 24).",
        "e": ""
      },
      {
        "s": "f_4",
        "t": "Slope at the predicted y₄.",
        "e": "1.98364"
      },
      {
        "s": "h",
        "t": "Step size.",
        "e": "0.1"
      }
    ],
    "mistakes": [
      {
        "m": "Signs of the weights.",
        "f": "P: +55, −59, +37, −9. C: +9, +19, −5, +1."
      },
      {
        "m": "Starting from y₀ as in Milne.",
        "f": "Adams starts from y₃."
      },
      {
        "m": "Forgetting h/24.",
        "f": "Both formulas carry the factor h/24."
      }
    ]
  },
  "cholesky": {
    "example": {
      "question": "$A = \\begin{bmatrix} 4 & 2 & 14 \\\\ 2 & 17 & -5 \\\\ 14 & -5 & 83 \\end{bmatrix}$, $b = (14, -101, 155)$. Factorise A = LLᵀ and solve Ax = b.",
      "steps": [
        {
          "title": "Column 1",
          "math": [
            "l_{11} = \\sqrt{4} = 2, \\qquad l_{21} = \\frac{2}{2} = 1, \\qquad l_{31} = \\frac{14}{2} = 7"
          ]
        },
        {
          "title": "Column 2",
          "math": [
            "l_{22} = \\sqrt{17 - 1^2} = 4, \\qquad l_{32} = \\frac{-5 - (7)(1)}{4} = -3"
          ]
        },
        {
          "title": "Column 3",
          "math": [
            "l_{33} = \\sqrt{83 - 7^2 - (-3)^2} = \\sqrt{25} = 5"
          ]
        },
        {
          "title": "The factor",
          "math": [
            "L = \\begin{bmatrix} 2 & 0 & 0 \\\\ 1 & 4 & 0 \\\\ 7 & -3 & 5 \\end{bmatrix}"
          ]
        },
        {
          "title": "Forward: Ly = b",
          "math": [
            "y_1 = \\frac{14}{2} = 7, \\quad y_2 = \\frac{-101 - 7}{4} = -27, \\quad y_3 = \\frac{155 - 49 - 81}{5} = 5"
          ]
        },
        {
          "title": "Backward: Lᵀx = y",
          "math": [
            "x_3 = \\frac{5}{5} = 1, \\quad x_2 = \\frac{-27 + 3}{4} = -6, \\quad x_1 = \\frac{7 + 6 - 7}{2} = 3"
          ]
        }
      ],
      "answer": "$$x = (3, -6, 1)$$",
      "check": "$4(3) + 2(-6) + 14(1) = 14$ ✓"
    },
    "symbols": [
      {
        "s": "L",
        "t": "Lower triangular factor.",
        "e": "l_{11} = 2"
      },
      {
        "s": "L^T",
        "t": "Its transpose (upper triangular).",
        "e": ""
      },
      {
        "s": "l_{jj}",
        "t": "Diagonal entry: a square root.",
        "e": "\\sqrt{17 - 1^2} = 4"
      },
      {
        "s": "l_{ij}",
        "t": "Below-diagonal entry: a division.",
        "e": "\\frac{-5 - 7(1)}{4} = -3"
      },
      {
        "s": "y",
        "t": "Intermediate vector from Ly = b.",
        "e": "(7, -27, 5)"
      }
    ],
    "mistakes": [
      {
        "m": "Using Cholesky on a non-symmetric matrix.",
        "f": "Use LU instead."
      },
      {
        "m": "Forgetting to subtract the earlier squares under the root.",
        "f": "l₂₂ = √(a₂₂ − l₂₁²)."
      },
      {
        "m": "Solving Lᵀx = b directly.",
        "f": "Forward with L first, then backward with Lᵀ."
      }
    ]
  },
  "qr": {
    "example": {
      "question": "$A = \\begin{bmatrix} 12 & -51 & 4 \\\\ 6 & 167 & -68 \\\\ -4 & 24 & -41 \\end{bmatrix}$. Find the QR decomposition by Gram–Schmidt.",
      "steps": [
        {
          "title": "Column 1",
          "math": [
            "|a_1| = \\sqrt{144 + 36 + 16} = 14, \\qquad q_1 = \\left(\\tfrac67, \\tfrac37, -\\tfrac27\\right)"
          ]
        },
        {
          "title": "Column 2",
          "math": [
            "r_{12} = q_1 \\cdot a_2 = \\tfrac{6(-51) + 3(167) - 2(24)}{7} = 21",
            "u_2 = a_2 - 21q_1 = (-69, 158, 30), \\qquad |u_2| = 175"
          ]
        },
        {
          "title": "Column 3",
          "math": [
            "r_{13} = -14, \\quad r_{23} = -70, \\quad u_3 = a_3 + 14q_1 + 70q_2 = \\left(-\\tfrac{58}{5}, \\tfrac65, -33\\right), \\quad |u_3| = 35"
          ]
        },
        {
          "title": "Q and R",
          "math": [
            "Q = \\begin{bmatrix} \\frac67 & -\\frac{69}{175} & -\\frac{58}{175} \\\\ \\frac37 & \\frac{158}{175} & \\frac{6}{175} \\\\ -\\frac27 & \\frac{6}{35} & -\\frac{33}{35} \\end{bmatrix}, \\qquad R = \\begin{bmatrix} 14 & 21 & -14 \\\\ 0 & 175 & -70 \\\\ 0 & 0 & 35 \\end{bmatrix}"
          ]
        }
      ],
      "answer": "$$A = QR \\text{ with } R = \\begin{bmatrix} 14 & 21 & -14 \\\\ 0 & 175 & -70 \\\\ 0 & 0 & 35 \\end{bmatrix}$$"
    },
    "symbols": [
      {
        "s": "a_k",
        "t": "Column k of A.",
        "e": "(12, 6, -4)"
      },
      {
        "s": "u_k",
        "t": "What is left of aₖ after removing the earlier directions.",
        "e": "(-69, 158, 30)"
      },
      {
        "s": "q_k",
        "t": "Unit vector: column k of Q.",
        "e": "(\\frac67, \\frac37, -\\frac27)"
      },
      {
        "s": "r_{jk}",
        "t": "Entry of R: a dot product (or a length on the diagonal).",
        "e": "r_{12} = 21"
      },
      {
        "s": "A_{k+1} = R_kQ_k",
        "t": "One round of the QR algorithm.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Subtracting the projection on the wrong vector.",
        "f": "Project onto the q’s (unit vectors), not the original a’s."
      },
      {
        "m": "Forgetting to normalise.",
        "f": "Divide each u by its length to get q."
      },
      {
        "m": "Multiplying QR again in the algorithm.",
        "f": "The algorithm multiplies the other way round: RQ."
      }
    ]
  },
  "jacobi-eigen": {
    "example": {
      "question": "$A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$. Find the eigenvalues and eigenvectors by one Jacobi rotation.",
      "steps": [
        {
          "title": "Angle",
          "math": [
            "a_{11} = a_{22} = 2 \\Rightarrow \\theta = 45^\\circ"
          ]
        },
        {
          "title": "Rotation",
          "math": [
            "P = \\begin{bmatrix} \\frac{1}{\\sqrt2} & -\\frac{1}{\\sqrt2} \\\\ \\frac{1}{\\sqrt2} & \\frac{1}{\\sqrt2} \\end{bmatrix}, \\qquad P^TAP = \\begin{bmatrix} 3 & 0 \\\\ 0 & 1 \\end{bmatrix}"
          ]
        },
        {
          "title": "Read off",
          "math": [
            "\\lambda_1 = 3,\\ v_1 = (0.707107, 0.707107); \\qquad \\lambda_2 = 1,\\ v_2 = (-0.707107, 0.707107)"
          ]
        }
      ],
      "answer": "$$\\lambda = 3, \\ 1$$",
      "check": "$A v_1 = (2.12132, 2.12132) = 3v_1$ ✓"
    },
    "symbols": [
      {
        "s": "a_{pq}",
        "t": "The largest off-diagonal entry (in size).",
        "e": "a_{12} = -2"
      },
      {
        "s": "\\theta",
        "t": "The rotation angle that zeros it.",
        "e": "-26.57^\\circ"
      },
      {
        "s": "P_k",
        "t": "Identity matrix with cos θ, ±sin θ in rows and columns p, q.",
        "e": ""
      },
      {
        "s": "A_{k+1}",
        "t": "The rotated matrix (same eigenvalues).",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using it on a non-symmetric matrix.",
        "f": "Jacobi rotations need A symmetric; use QR otherwise."
      },
      {
        "m": "Dividing by zero when a_pp = a_qq.",
        "f": "Then θ = 45° (π/4)."
      },
      {
        "m": "Taking eigenvectors from the last P only.",
        "f": "Multiply all the rotations: P₁P₂⋯Pₖ."
      }
    ]
  },
  "conjugate-gradient": {
    "example": {
      "question": "$\\begin{bmatrix} 4 & 1 \\\\ 1 & 3 \\end{bmatrix}x = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}$. Solve by conjugate gradients from $x_0 = (0, 0)$.",
      "steps": [
        {
          "title": "Start",
          "math": [
            "r_0 = b - A(0) = (1, 2), \\qquad p_0 = (1, 2)"
          ]
        },
        {
          "title": "Step 1 in full",
          "math": [
            "Ap_0 = (4 + 2,\\ 1 + 6) = (6, 7), \\qquad r_0^Tr_0 = 1 + 4 = 5, \\qquad p_0^TAp_0 = 6 + 14 = 20",
            "\\alpha_0 = \\frac{5}{20} = 0.25, \\qquad x_1 = (0.25, 0.5), \\qquad r_1 = (1, 2) - 0.25(6, 7) = (-0.5, 0.25)",
            "\\beta_0 = \\frac{0.25 + 0.0625}{5} = 0.0625, \\qquad p_1 = (-0.5, 0.25) + 0.0625(1, 2) = (-0.4375, 0.375)"
          ]
        },
        {
          "title": "Step 2",
          "math": [
            "\\alpha_1 = 0.363636, \\qquad x_2 = (0.0909091, 0.636364), \\qquad r_2 = (0, 0)"
          ]
        },
        {
          "title": "Table",
          "table": {
            "columns": [
              "$k$",
              "$x_k$",
              "$|r_k|$",
              "$\\alpha_{k-1}$"
            ],
            "rows": [
              [
                "0",
                "(0, 0)",
                "2.23607",
                ""
              ],
              [
                "1",
                "(0.25, 0.5)",
                "0.559017",
                "0.25"
              ],
              [
                "2",
                "**(1/11, 7/11)**",
                "0",
                "0.363636"
              ]
            ]
          }
        }
      ],
      "answer": "$$x = \\left(\\tfrac{1}{11}, \\tfrac{7}{11}\\right) \\text{ in 2 steps}$$",
      "check": "$4(\\frac1{11}) + \\frac7{11} = 1$ ✓"
    },
    "symbols": [
      {
        "s": "r_k",
        "t": "Residual b − Axₖ.",
        "e": "r_0 = (1, 2)"
      },
      {
        "s": "p_k",
        "t": "Search direction.",
        "e": "p_0 = (1, 2)"
      },
      {
        "s": "\\alpha_k",
        "t": "Step length along pₖ.",
        "e": "\\frac{5}{20} = 0.25"
      },
      {
        "s": "\\beta_k",
        "t": "How much of the old direction to keep.",
        "e": "0.0625"
      },
      {
        "s": "x_k",
        "t": "Current approximation.",
        "e": "x_1 = (0.25, 0.5)"
      }
    ],
    "mistakes": [
      {
        "m": "Using a non-symmetric A.",
        "f": "CG needs A symmetric positive definite (else use GMRES or Gauss elimination)."
      },
      {
        "m": "β from the old residual only.",
        "f": "β = (new rᵀr)/(old rᵀr)."
      },
      {
        "m": "Setting the new direction to r only.",
        "f": "p₍ₖ₊₁₎ = r₍ₖ₊₁₎ + βₖpₖ (that would be steepest descent)."
      }
    ]
  },
  "power-method": {
    "example": {
      "question": "$A = \\begin{bmatrix} 1 & 6 & 1 \\\\ 1 & 2 & 0 \\\\ 0 & 0 & 3 \\end{bmatrix}$, $x^{(0)} = (1, 0, 0)$. Find the largest eigenvalue.",
      "steps": [
        {
          "title": "Iteration 1 in full",
          "math": [
            "y = Ax^{(0)} = (1, 1, 0), \\qquad \\lambda = 1, \\qquad x^{(1)} = (1, 1, 0)"
          ]
        },
        {
          "title": "Iteration 2 in full",
          "math": [
            "y = Ax^{(1)} = (1 + 6,\\ 1 + 2,\\ 0) = (7, 3, 0), \\qquad \\lambda = 7, \\qquad x^{(2)} = (1, 0.428571, 0)"
          ]
        },
        {
          "title": "All iterations",
          "table": {
            "columns": [
              "$k$",
              "$y = Ax$",
              "$\\lambda$",
              "$x^{(k)}$"
            ],
            "rows": [
              [
                "1",
                "(1, 1, 0)",
                "1",
                "(1, 1, 0)"
              ],
              [
                "2",
                "(7, 3, 0)",
                "7",
                "(1, 0.428571, 0)"
              ],
              [
                "3",
                "(3.571429, 1.857143, 0)",
                "3.571429",
                "(1, 0.52, 0)"
              ],
              [
                "4",
                "(4.12, 2.04, 0)",
                "4.12",
                "(1, 0.495146, 0)"
              ],
              [
                "5",
                "(3.970874, 1.990291, 0)",
                "3.970874",
                "(1, 0.501223, 0)"
              ],
              [
                "…",
                "",
                "**4.0000**",
                "**(1, 0.5, 0)**"
              ]
            ]
          }
        },
        {
          "title": "Check",
          "math": [
            "A(1, 0.5, 0) = (4, 2, 0) = 4(1, 0.5, 0)\\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\lambda = 4, \\qquad v = (1, 0.5, 0)$$"
    },
    "symbols": [
      {
        "s": "x^{(0)}",
        "t": "Starting vector.",
        "e": "(1, 0, 0)"
      },
      {
        "s": "y^{(k)}",
        "t": "A times the current vector.",
        "e": "(1, 1, 0)"
      },
      {
        "s": "\\lambda^{(k)}",
        "t": "Largest entry: the eigenvalue estimate.",
        "e": "7"
      },
      {
        "s": "x^{(k)}",
        "t": "Normalised vector (largest entry 1).",
        "e": "(1, 0.428571, 0)"
      }
    ],
    "mistakes": [
      {
        "m": "Dividing by the first entry instead of the largest.",
        "f": "Normalise by the entry with the largest absolute value."
      },
      {
        "m": "Stopping too early.",
        "f": "Continue until λ agrees to the decimals asked."
      },
      {
        "m": "Expecting the smallest eigenvalue.",
        "f": "The power method gives the largest; use the inverse method for the smallest."
      }
    ]
  },
  "finite-difference-bvp": {
    "example": {
      "question": "$y'' = y$, $y(0) = 0$, $y(1) = 1$ with $h = 0.25$. Find y at 0.25, 0.5, 0.75.",
      "steps": [
        {
          "title": "Difference equation",
          "math": [
            "\\frac{y_{i-1} - 2y_i + y_{i+1}}{0.0625} = y_i \\ \\Rightarrow\\ y_{i-1} - 2.0625\\,y_i + y_{i+1} = 0"
          ]
        },
        {
          "title": "At the three inner points",
          "math": [
            "i = 1: \\ 0 - 2.0625y_1 + y_2 = 0",
            "i = 2: \\ y_1 - 2.0625y_2 + y_3 = 0",
            "i = 3: \\ y_2 - 2.0625y_3 + 1 = 0"
          ]
        },
        {
          "title": "Solve",
          "math": [
            "y_1 = 0.215115, \\quad y_2 = 0.443674, \\quad y_3 = 0.699963"
          ]
        },
        {
          "title": "Compare",
          "table": {
            "columns": [
              "$x$",
              "finite difference",
              "exact $\\frac{\\sinh x}{\\sinh 1}$",
              "error"
            ],
            "rows": [
              [
                "0.25",
                "0.215115",
                "0.214952",
                "0.000162"
              ],
              [
                "0.5",
                "**0.443674**",
                "0.443409",
                "0.000265"
              ],
              [
                "0.75",
                "0.699963",
                "0.699724",
                "0.000239"
              ]
            ]
          }
        }
      ],
      "answer": "$$y(0.5) \\approx 0.443674$$"
    },
    "symbols": [
      {
        "s": "h",
        "t": "Step: (b − a)/n.",
        "e": "0.25"
      },
      {
        "s": "y_i",
        "t": "Unknown value at xᵢ = a + ih.",
        "e": "y_1 \\approx 0.2151"
      },
      {
        "s": "p, q, r",
        "t": "The coefficients of the equation.",
        "e": "y'' - y = 0:\\ p = 0,\\ q = -1,\\ r = 0"
      },
      {
        "s": "y_0, y_n",
        "t": "The boundary values.",
        "e": "0,\\ 1"
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting h² on the right-hand side.",
        "f": "Multiply the whole equation by h²."
      },
      {
        "m": "Treating y₀ and yₙ as unknowns.",
        "f": "They are the given boundary values; move them to the right side."
      },
      {
        "m": "Using forward differences.",
        "f": "Central differences keep the error of order h²."
      }
    ]
  },
  "shooting-method": {
    "example": {
      "question": "$y'' = y$, $y(0) = 0$, $y(1) = 1$. Shoot with guesses s = 0 and s = 1 (RK4, h = 0.1).",
      "steps": [
        {
          "title": "First shot, s₀ = 0",
          "math": [
            "y \\equiv 0 \\Rightarrow y(1) = 0, \\qquad g = 0 - 1 = -1"
          ]
        },
        {
          "title": "Second shot, s₁ = 1",
          "math": [
            "y(1) = 1.1752 \\ (= \\sinh 1), \\qquad g = 0.1752"
          ]
        },
        {
          "title": "Secant step",
          "math": [
            "s_2 = 1 - 0.1752\\,\\frac{1 - 0}{0.1752 - (-1)} = 1 - \\frac{0.1752}{1.1752} = 0.850919"
          ]
        },
        {
          "title": "Third shot",
          "math": [
            "y(1) = 1.000000 \\ \\checkmark"
          ],
          "after": "Exact slope 1/sinh 1 = 0.850918: one secant step is enough for a linear equation."
        },
        {
          "title": "Some values",
          "table": {
            "columns": [
              "$x$",
              "0.2",
              "0.4",
              "0.5",
              "0.8"
            ],
            "rows": [
              [
                "$y$",
                "0.171321",
                "0.349517",
                "**0.443410**",
                "0.755705"
              ]
            ]
          }
        }
      ],
      "answer": "$$y'(0) = 0.850919, \\qquad y(0.5) \\approx 0.443410$$"
    },
    "symbols": [
      {
        "s": "s",
        "t": "Guessed slope y′(a).",
        "e": "s_0 = 0,\\ s_1 = 1"
      },
      {
        "s": "y(b; s)",
        "t": "Where the solution with slope s lands at x = b.",
        "e": "1.1752"
      },
      {
        "s": "\\beta",
        "t": "The required value at b.",
        "e": "1"
      },
      {
        "s": "g(s)",
        "t": "The miss.",
        "e": "0.1752"
      }
    ],
    "mistakes": [
      {
        "m": "Adjusting y(a) instead of the slope.",
        "f": "y(a) is fixed by the boundary condition; only the slope is guessed."
      },
      {
        "m": "Using Euler for the shots.",
        "f": "Use RK4: the shots must be accurate."
      },
      {
        "m": "Sign of the miss.",
        "f": "g = y(b; s) − β, consistently."
      }
    ]
  },
  "heat-equation": {
    "example": {
      "question": "$u_t = u_{xx}$, $u(x, 0) = 4x - x^2$, $u(0, t) = u(4, t) = 0$. Bender–Schmidt with h = 1 for four time steps.",
      "steps": [
        {
          "title": "Steps",
          "math": [
            "\\lambda = \\tfrac12 \\Rightarrow k = \\frac{h^2}{2} = 0.5"
          ]
        },
        {
          "title": "Row 0 (starting temperature)",
          "math": [
            "u(1, 0) = 3, \\quad u(2, 0) = 4, \\quad u(3, 0) = 3"
          ]
        },
        {
          "title": "Row 1 in full",
          "math": [
            "u_{1,1} = \\tfrac12(0 + 4) = 2, \\quad u_{2,1} = \\tfrac12(3 + 3) = 3, \\quad u_{3,1} = \\tfrac12(4 + 0) = 2"
          ]
        },
        {
          "title": "Row 2",
          "math": [
            "u_{1,2} = \\tfrac12(0 + 3) = 1.5, \\quad u_{2,2} = \\tfrac12(2 + 2) = 2, \\quad u_{3,2} = 1.5"
          ]
        },
        {
          "title": "The grid",
          "table": {
            "columns": [
              "$t$",
              "$x = 0$",
              "1",
              "2",
              "3",
              "4"
            ],
            "rows": [
              [
                "0",
                "0",
                "3",
                "4",
                "3",
                "0"
              ],
              [
                "0.5",
                "0",
                "2",
                "3",
                "2",
                "0"
              ],
              [
                "1",
                "0",
                "1.5",
                "2",
                "1.5",
                "0"
              ],
              [
                "1.5",
                "0",
                "1",
                "1.5",
                "1",
                "0"
              ],
              [
                "2",
                "0",
                "0.75",
                "**1**",
                "0.75",
                "0"
              ]
            ]
          }
        }
      ],
      "answer": "$$u(2, 2) \\approx 1$$"
    },
    "symbols": [
      {
        "s": "u_{i,j}",
        "t": "Temperature at xᵢ, time tⱼ.",
        "e": "u_{1,0} = 3"
      },
      {
        "s": "h, k",
        "t": "Steps in x and t.",
        "e": "1,\\ 0.5"
      },
      {
        "s": "\\lambda",
        "t": "c²k/h²: ½ for Bender–Schmidt.",
        "e": "0.5"
      },
      {
        "s": "c^2",
        "t": "Diffusivity in uₜ = c²uₓₓ.",
        "e": "1"
      }
    ],
    "mistakes": [
      {
        "m": "Choosing k freely with the explicit scheme.",
        "f": "λ must be ≤ ½; Bender–Schmidt uses exactly ½."
      },
      {
        "m": "Averaging the point itself.",
        "f": "With λ = ½ only the two neighbours count."
      },
      {
        "m": "Forgetting the end values in Crank–Nicolson.",
        "f": "They appear on both sides of the first and last equations."
      }
    ]
  },
  "wave-equation": {
    "example": {
      "question": "$u(x, 0) = x(4 - x)$, $u_t(x, 0) = 0$, $L = 4$, $c = 1$. Use h = k = 1 for four time steps.",
      "steps": [
        {
          "title": "Row 0",
          "math": [
            "u_{1,0} = 3, \\quad u_{2,0} = 4, \\quad u_{3,0} = 3"
          ]
        },
        {
          "title": "Row 1 in full (g = 0)",
          "math": [
            "u_{1,1} = \\tfrac12(0 + 4) = 2, \\quad u_{2,1} = \\tfrac12(3 + 3) = 3, \\quad u_{3,1} = \\tfrac12(4 + 0) = 2"
          ]
        },
        {
          "title": "Row 2",
          "math": [
            "u_{1,2} = 0 + 3 - 3 = 0, \\quad u_{2,2} = 2 + 2 - 4 = 0, \\quad u_{3,2} = 3 + 0 - 3 = 0"
          ]
        },
        {
          "title": "The grid",
          "table": {
            "columns": [
              "$t$",
              "$x = 0$",
              "1",
              "2",
              "3",
              "4"
            ],
            "rows": [
              [
                "0",
                "0",
                "3",
                "4",
                "3",
                "0"
              ],
              [
                "1",
                "0",
                "2",
                "3",
                "2",
                "0"
              ],
              [
                "2",
                "0",
                "0",
                "0",
                "0",
                "0"
              ],
              [
                "3",
                "0",
                "−2",
                "−3",
                "−2",
                "0"
              ],
              [
                "4",
                "0",
                "−3",
                "**−4**",
                "−3",
                "0"
              ]
            ]
          }
        }
      ],
      "answer": "$$\\text{At } t = 4 \\text{ the string is upside down: } u(2, 4) = -4$$"
    },
    "symbols": [
      {
        "s": "r",
        "t": "ck/h; must be ≤ 1 (1 is usual).",
        "e": "1"
      },
      {
        "s": "f(x)",
        "t": "Starting shape.",
        "e": "x(4 - x)"
      },
      {
        "s": "g(x)",
        "t": "Starting velocity.",
        "e": "0"
      },
      {
        "s": "u_{i,j}",
        "t": "Displacement at xᵢ, tⱼ.",
        "e": "u_{1,0} = 3"
      }
    ],
    "mistakes": [
      {
        "m": "Using the general recurrence for the first step.",
        "f": "Row 1 uses the special formula (there is no row −1)."
      },
      {
        "m": "Taking r > 1.",
        "f": "The scheme then blows up; choose k ≤ h/c."
      },
      {
        "m": "Forgetting to subtract the value two rows back.",
        "f": "u₍ᵢ,ⱼ₊₁₎ = left + right − u₍ᵢ,ⱼ₋₁₎."
      }
    ]
  },
  "laplace-liebmann": {
    "example": {
      "question": "A 3 × 3 plate: top and left at 100, bottom and right at 0. Find the four inner values.",
      "steps": [
        {
          "title": "Start",
          "math": [
            "u_{11} = u_{12} = u_{21} = u_{22} = 50 \\ (\\text{the boundary average})"
          ]
        },
        {
          "title": "Sweep 1 in full",
          "math": [
            "u_{11} = \\tfrac14(100 + 50 + 100 + 50) = 75",
            "u_{12} = \\tfrac14(100 + 50 + 75 + 0) = 56.25",
            "u_{21} = \\tfrac14(75 + 0 + 100 + 50) = 56.25",
            "u_{22} = \\tfrac14(56.25 + 0 + 56.25 + 0) = 28.125"
          ]
        },
        {
          "title": "Later sweeps",
          "text": "Repeat until the changes are below 0.001 (9 sweeps)."
        },
        {
          "title": "Result",
          "table": {
            "columns": [
              "",
              "left 100",
              "",
              "",
              "right 0"
            ],
            "rows": [
              [
                "top 100",
                "100",
                "100",
                "100",
                "0"
              ],
              [
                "",
                "100",
                "**75**",
                "**50**",
                "0"
              ],
              [
                "",
                "100",
                "**50**",
                "**25**",
                "0"
              ],
              [
                "bottom 0",
                "100",
                "0",
                "0",
                "0"
              ]
            ]
          }
        }
      ],
      "answer": "$$u_{11} = 75, \\quad u_{12} = u_{21} = 50, \\quad u_{22} = 25$$",
      "check": "$u_{11} = \\frac14(100 + 50 + 100 + 50) = 75$ ✓"
    },
    "symbols": [
      {
        "s": "u_{i,j}",
        "t": "Value at an inner grid point.",
        "e": "u_{11}"
      },
      {
        "s": "four neighbours",
        "t": "Up, down, left, right.",
        "e": "100, 50, 100, 50"
      },
      {
        "s": "start value",
        "t": "The average of the boundary values.",
        "e": "50"
      },
      {
        "s": "tolerance",
        "t": "Stop when every change is smaller.",
        "e": "0.001"
      }
    ],
    "mistakes": [
      {
        "m": "Using old values throughout a sweep.",
        "f": "Liebmann (Gauss–Seidel) uses each new value at once."
      },
      {
        "m": "Averaging only three neighbours at an edge point.",
        "f": "Always four: boundary values count as neighbours."
      },
      {
        "m": "Stopping after one sweep.",
        "f": "Continue until two sweeps agree."
      }
    ]
  }
};

export default DATA;
