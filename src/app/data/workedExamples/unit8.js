// Worked examples, symbol keys and common mistakes for the (UNIT-8) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "cayley-hamilton-theorem": {
    "example": {
      "question": "Verify the Cayley–Hamilton theorem for $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ and use it to find $A^{-1}$.",
      "steps": [
        {
          "title": "Characteristic equation",
          "math": [
            "|A - \\lambda I| = 0",
            "\\left|A - \\lambda I\\right| =\\left|\\begin{array}{cc} 1 - \\lambda & 2 \\\\ 3 & 4 - \\lambda \\end{array}\\right| = 0",
            "\\lambda^2 - (\\text{tr}\\,A)\\lambda + |A| = 0, \\quad \\text{tr}\\,A = 5, \\ |A| = -2",
            "\\lambda^{2} - 5\\lambda - 2 = 0"
          ]
        },
        {
          "title": "Powers of A",
          "math": [
            "A^{2} = \\left[\\begin{array}{cc} 7 & 10 \\\\ 15 & 22 \\end{array}\\right]"
          ]
        },
        {
          "title": "Replace λ by A (and the constant by a multiple of I)",
          "math": [
            "p(A) = O",
            "A^{2} - 5A - 2I = \\left[\\begin{array}{cc} 0 & 0 \\\\ 0 & 0 \\end{array}\\right] = O \\ \\checkmark"
          ]
        },
        {
          "title": "Multiply by A⁻¹ to get the inverse",
          "math": [
            "A - 5I - 2A^{-1} = O",
            "A^{-1} = \\frac{1}{2}\\left(A - 5I\\right)",
            "= \\frac{1}{2}\\left[\\begin{array}{cc} -4 & 2 \\\\ 3 & -1 \\end{array}\\right] = \\left[\\begin{array}{cc} -2 & 1 \\\\ \\frac{3}{2} & -\\frac{1}{2} \\end{array}\\right]"
          ]
        }
      ],
      "answer": "$$A^2 - 5A - 2I = O, \\qquad A^{-1} = \\frac12(A - 5I) = \\begin{bmatrix} -2 & 1 \\\\ \\frac32 & -\\frac12 \\end{bmatrix}$$"
    },
    "symbols": [
      {
        "s": "p(\\lambda) = |A - \\lambda I|",
        "t": "The characteristic polynomial of A.",
        "e": "\\lambda^2 - 5\\lambda - 2"
      },
      {
        "s": "\\operatorname{tr} A",
        "t": "The trace: the sum of the main-diagonal entries.",
        "e": "1 + 4 = 5"
      },
      {
        "s": "|A|",
        "t": "The determinant of A.",
        "e": "4 - 6 = -2"
      },
      {
        "s": "I",
        "t": "The identity matrix of the same size as A.",
        "e": ""
      },
      {
        "s": "O",
        "t": "The zero matrix: every entry 0.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Writing the constant as a number, not a matrix.",
        "f": "In p(A) the constant term becomes $c_0 I$: $-2$ becomes $-2I$."
      },
      {
        "m": "Sign slip in $|A - \\lambda I|$.",
        "f": "For a 2×2 matrix use $\\lambda^2 - (\\operatorname{tr}A)\\lambda + |A|$."
      },
      {
        "m": "Using the theorem when $|A| = 0$.",
        "f": "Then $c_0 = 0$ and A has no inverse: the inverse step fails."
      },
      {
        "m": "Dividing by the wrong constant.",
        "f": "Move $c_0 A^{-1}$ to one side and divide by $-c_0$; here $2A^{-1} = A - 5I$."
      }
    ]
  },
  "consistency-of-linear-equations": {
    "example": {
      "question": "Test the system $x + y + z = 6,\\ x + 2y + 3z = 14,\\ 2x + 3y + 4z = 20$ for consistency and solve it.",
      "steps": [
        {
          "title": "Write the augmented matrix [A | B]",
          "math": [
            "[A\\,|\\,B] = \\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ 1 & 2 & 3 & 14 \\\\ 2 & 3 & 4 & 20 \\end{array}\\right]"
          ]
        },
        {
          "title": "Clear column 1",
          "text": "Use row 1 to make the first entry of rows 2 and 3 zero.",
          "math": [
            "R_2 \\to R_2 - R_1, \\quad R_3 \\to R_3 - 2R_1",
            "\\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ 0 & 1 & 2 & 8 \\\\ 0 & 1 & 2 & 8 \\end{array}\\right]"
          ]
        },
        {
          "title": "Clear column 2",
          "math": [
            "R_3 \\to R_3 - R_2",
            "\\left[\\begin{array}{ccc|c} 1 & 1 & 1 & 6 \\\\ 0 & 1 & 2 & 8 \\\\ 0 & 0 & 0 & 0 \\end{array}\\right]"
          ]
        },
        {
          "title": "Compare the ranks",
          "text": "Count the non-zero rows of A and of [A | B]. Both have 2, and there are n = 3 unknowns.",
          "math": [
            "\\rho(A) = \\rho([A|B]) = 2 < 3 = n",
            "\\text{Consistent, with } n - \\rho = 1 \\text{ free unknown}"
          ]
        },
        {
          "title": "Back-substitute with z = t",
          "math": [
            "y + 2z = 8 \\ \\Rightarrow\\ y = 8 - 2t",
            "x + y + z = 6 \\ \\Rightarrow\\ x = 6 - (8 - 2t) - t = t - 2"
          ]
        }
      ],
      "answer": "$$\\text{Consistent, infinitely many solutions: } x = t - 2,\\ y = 8 - 2t,\\ z = t$$"
    },
    "symbols": [
      {
        "s": "AX = B",
        "t": "The system in matrix form: coefficients A, unknowns X, right-hand sides B.",
        "e": ""
      },
      {
        "s": "[A\\,|\\,B]",
        "t": "The augmented matrix: A with the column B added.",
        "e": ""
      },
      {
        "s": "\\rho(A)",
        "t": "The rank of A: the number of non-zero rows after row reduction.",
        "e": "2"
      },
      {
        "s": "n",
        "t": "The number of unknowns.",
        "e": "3"
      },
      {
        "s": "t",
        "t": "A free parameter: any real number.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Reducing A but not the B column.",
        "f": "Apply every row operation to the whole augmented row, B included."
      },
      {
        "m": "Mixing up the three cases.",
        "f": "$\\rho(A) \\ne \\rho([A|B])$: no solution; equal and $= n$: one; equal and $< n$: infinitely many."
      },
      {
        "m": "Calling a row 0 0 0 | 5 harmless.",
        "f": "It says 0 = 5, so the system is inconsistent."
      },
      {
        "m": "Leaving out the parameter.",
        "f": "Give the general solution in terms of t, not one particular solution."
      }
    ]
  },
  "determinant": {
    "example": null,
    "symbols": [
      {
        "s": "|A|,\\ \\det A",
        "t": "The determinant: one number from a square matrix.",
        "e": "49"
      },
      {
        "s": "a_{ij}",
        "t": "The entry in row i, column j.",
        "e": ""
      },
      {
        "s": "M_{ij}",
        "t": "The minor: the determinant left after deleting row i and column j.",
        "e": ""
      },
      {
        "s": "C_{ij} = (-1)^{i+j}M_{ij}",
        "t": "The cofactor: the minor with its place sign.",
        "e": ""
      },
      {
        "s": "+\\ -\\ +",
        "t": "The checkerboard of place signs, starting with + at the top left.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting the minus on the middle term.",
        "f": "Along row 1 the signs are + − +: $a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}$."
      },
      {
        "m": "Using the 3×3 diagonal trick on 4×4.",
        "f": "Sarrus’ rule works only for 3×3. Expand by cofactors or row-reduce."
      },
      {
        "m": "Row swaps without a sign change.",
        "f": "Each swap of two rows multiplies the determinant by −1."
      },
      {
        "m": "Scaling a row and keeping the value.",
        "f": "Multiplying a row by k multiplies |A| by k. Adding a multiple of a row changes nothing."
      }
    ]
  },
  "diagonalization": {
    "example": {
      "question": "Diagonalise the symmetric matrix $A = \\begin{bmatrix} 2 & 0 & 0 \\\\ 0 & 3 & 4 \\\\ 0 & 4 & 9 \\end{bmatrix}$ by an orthogonal transformation.",
      "steps": [
        {
          "title": "Characteristic equation",
          "math": [
            "|A - \\lambda I| = 0",
            "\\left|A - \\lambda I\\right| =\\left|\\begin{array}{ccc} 2 - \\lambda & 0 & 0 \\\\ 0 & 3 - \\lambda & 4 \\\\ 0 & 4 & 9 - \\lambda \\end{array}\\right| = 0",
            "\\lambda^3 - S_1\\lambda^2 + S_2\\lambda - |A| = 0",
            "S_1 = \\text{tr}\\,A = 14, \\quad S_2 = \\text{sum of the } 2 \\times 2 \\text{ principal minors} = 35, \\quad |A| = 22",
            "\\lambda^{3} - 14\\lambda^{2} + 35\\lambda - 22 = 0"
          ]
        },
        {
          "title": "Solve for the eigenvalues",
          "math": [
            "\\left(\\lambda - 1\\right)\\left(\\lambda - 2\\right)\\left(\\lambda - 11\\right) = 0",
            "\\lambda = 1, \\quad 2, \\quad 11"
          ]
        },
        {
          "title": "Eigenvector for λ = 1",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (1)I = \\left[\\begin{array}{ccc} 1 & 0 & 0 \\\\ 0 & 2 & 4 \\\\ 0 & 4 & 8 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{ccc} 1 & 0 & 0 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 0 \\\\ 2 \\\\ -1 \\end{bmatrix}"
          ]
        },
        {
          "title": "Eigenvector for λ = 2",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (2)I = \\left[\\begin{array}{ccc} 0 & 0 & 0 \\\\ 0 & 1 & 4 \\\\ 0 & 4 & 7 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{ccc} 0 & 1 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 1 \\\\ 0 \\\\ 0 \\end{bmatrix}"
          ]
        },
        {
          "title": "Eigenvector for λ = 11",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (11)I = \\left[\\begin{array}{ccc} -9 & 0 & 0 \\\\ 0 & -8 & 4 \\\\ 0 & 4 & -2 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{ccc} 1 & 0 & 0 \\\\ 0 & 1 & -\\frac{1}{2} \\\\ 0 & 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 0 \\\\ 1 \\\\ 2 \\end{bmatrix}"
          ]
        },
        {
          "title": "Modal matrix P and spectral matrix D",
          "math": [
            "P^{-1}AP = D",
            "P = \\begin{bmatrix} 0 & 1 & 0 \\\\ 2 & 0 & 1 \\\\ -1 & 0 & 2 \\end{bmatrix}, \\quad D = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 11 \\end{bmatrix}",
            "P^{-1} = \\begin{bmatrix} 0 & \\frac{2}{5} & -\\frac{1}{5} \\\\ 1 & 0 & 0 \\\\ 0 & \\frac{1}{5} & \\frac{2}{5} \\end{bmatrix}",
            "P^{-1}AP = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 11 \\end{bmatrix} = D \\ \\checkmark"
          ]
        },
        {
          "title": "Orthogonal reduction (A is symmetric)",
          "math": [
            "N^{T}AN = D, \\quad N^{-1} = N^{T}",
            "\\lambda = 1: \\ \\frac{X}{\\lVert X \\rVert} = \\begin{bmatrix} 0 \\\\ \\frac{2\\sqrt{5}}{5} \\\\ -\\frac{\\sqrt{5}}{5} \\end{bmatrix}",
            "\\lambda = 2: \\ \\frac{X}{\\lVert X \\rVert} = \\begin{bmatrix} 1 \\\\ 0 \\\\ 0 \\end{bmatrix}",
            "\\lambda = 11: \\ \\frac{X}{\\lVert X \\rVert} = \\begin{bmatrix} 0 \\\\ \\frac{\\sqrt{5}}{5} \\\\ \\frac{2\\sqrt{5}}{5} \\end{bmatrix}",
            "N = \\begin{bmatrix} 0 & 1 & 0 \\\\ \\frac{2\\sqrt{5}}{5} & 0 & \\frac{\\sqrt{5}}{5} \\\\ -\\frac{\\sqrt{5}}{5} & 0 & \\frac{2\\sqrt{5}}{5} \\end{bmatrix}",
            "N^{T}AN = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 11 \\end{bmatrix} = D \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$N^TAN = D = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 11 \\end{bmatrix}$$"
    },
    "symbols": [
      {
        "s": "\\lambda_i",
        "t": "The eigenvalues: roots of $|A - \\lambda I| = 0$.",
        "e": "1,\\ 2,\\ 11"
      },
      {
        "s": "P",
        "t": "The modal matrix: the eigenvectors as its columns.",
        "e": ""
      },
      {
        "s": "D",
        "t": "The spectral matrix: the eigenvalues on the diagonal, in the same order.",
        "e": ""
      },
      {
        "s": "N",
        "t": "The normalised modal matrix: each eigenvector divided by its length.",
        "e": ""
      },
      {
        "s": "N^T = N^{-1}",
        "t": "For a symmetric A, N is orthogonal, so its transpose is its inverse.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Ordering D and P differently.",
        "f": "The k-th column of P must belong to the k-th eigenvalue in D."
      },
      {
        "m": "Not normalising for the orthogonal form.",
        "f": "Divide each eigenvector by its length before using $N^T$."
      },
      {
        "m": "Assuming every matrix diagonalises.",
        "f": "You need n independent eigenvectors. A repeated eigenvalue may give too few."
      },
      {
        "m": "Computing $P^{-1}$ the long way.",
        "f": "For symmetric A use $N^T$; no inverse is needed."
      }
    ]
  },
  "eigenvalues-eigenvectors": {
    "example": {
      "question": "Find the eigenvalues and eigenvectors of $A = \\begin{bmatrix} 4 & 1 \\\\ 2 & 3 \\end{bmatrix}$.",
      "steps": [
        {
          "title": "Characteristic equation",
          "math": [
            "|A - \\lambda I| = 0",
            "\\left|A - \\lambda I\\right| =\\left|\\begin{array}{cc} 4 - \\lambda & 1 \\\\ 2 & 3 - \\lambda \\end{array}\\right| = 0",
            "\\lambda^2 - (\\text{tr}\\,A)\\lambda + |A| = 0, \\quad \\text{tr}\\,A = 7, \\ |A| = 10",
            "\\lambda^{2} - 7\\lambda + 10 = 0"
          ]
        },
        {
          "title": "Solve for the eigenvalues",
          "math": [
            "\\left(\\lambda - 2\\right)\\left(\\lambda - 5\\right) = 0",
            "\\lambda = 2, \\quad 5"
          ]
        },
        {
          "title": "Eigenvector for λ = 2",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (2)I = \\left[\\begin{array}{cc} 2 & 1 \\\\ 2 & 1 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{cc} 1 & \\frac{1}{2} \\\\ 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 1 \\\\ -2 \\end{bmatrix}"
          ]
        },
        {
          "title": "Eigenvector for λ = 5",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (5)I = \\left[\\begin{array}{cc} -1 & 1 \\\\ 2 & -2 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{cc} 1 & -1 \\\\ 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}"
          ]
        },
        {
          "title": "Check",
          "math": [
            "\\text{Sum of eigenvalues} = 7 = \\text{tr}\\,A = 7",
            "\\text{and } A X = \\lambda X \\text{ for every pair above}"
          ]
        }
      ],
      "answer": "$$\\lambda = 2:\\ X = t\\begin{bmatrix} 1 \\\\ -2 \\end{bmatrix}, \\qquad \\lambda = 5:\\ X = t\\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}$$"
    },
    "symbols": [
      {
        "s": "AX = \\lambda X",
        "t": "X is an eigenvector: A only stretches it, by the factor λ.",
        "e": ""
      },
      {
        "s": "\\lambda",
        "t": "An eigenvalue: a root of the characteristic equation.",
        "e": "2,\\ 5"
      },
      {
        "s": "|A - \\lambda I| = 0",
        "t": "The characteristic equation.",
        "e": "\\lambda^2 - 7\\lambda + 10 = 0"
      },
      {
        "s": "X \\ne 0",
        "t": "An eigenvector can never be the zero vector.",
        "e": ""
      },
      {
        "s": "t",
        "t": "Any non-zero number: every multiple of an eigenvector is one too.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Subtracting λ from every entry.",
        "f": "λI has λ on the diagonal only: subtract it from $a_{11}, a_{22}, \\dots$"
      },
      {
        "m": "Giving X = 0 as the eigenvector.",
        "f": "Solve $(A - \\lambda I)X = 0$ for a non-zero X; the rows are dependent, so one is enough."
      },
      {
        "m": "Not checking the answer.",
        "f": "Check: the eigenvalues add to tr A (7) and multiply to |A| (10)."
      },
      {
        "m": "Thinking the eigenvector is unique.",
        "f": "Any non-zero multiple works; give it as $t\\,X$."
      }
    ]
  },
  "linear-dependence-calculator": {
    "example": {
      "question": "Are the vectors $v_1 = (1, 2, 3),\\ v_2 = (4, 5, 6),\\ v_3 = (7, 8, 9)$ linearly independent? If not, find the relation.",
      "steps": [
        {
          "title": "Put the vectors as the columns of a matrix",
          "text": "Look for numbers $c_1, c_2, c_3$, not all zero, with $c_1v_1 + c_2v_2 + c_3v_3 = 0$.",
          "math": [
            "\\begin{bmatrix} 1 & 4 & 7 \\\\ 2 & 5 & 8 \\\\ 3 & 6 & 9 \\end{bmatrix}\\begin{bmatrix} c_1 \\\\ c_2 \\\\ c_3 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\\\ 0 \\end{bmatrix}"
          ]
        },
        {
          "title": "Row-reduce",
          "math": [
            "R_2 \\to R_2 - 2R_1, \\quad R_3 \\to R_3 - 3R_1",
            "\\begin{bmatrix} 1 & 4 & 7 \\\\ 0 & -3 & -6 \\\\ 0 & -6 & -12 \\end{bmatrix}",
            "R_3 \\to R_3 - 2R_2",
            "\\begin{bmatrix} 1 & 4 & 7 \\\\ 0 & -3 & -6 \\\\ 0 & 0 & 0 \\end{bmatrix}"
          ]
        },
        {
          "title": "Compare the rank with the number of vectors",
          "math": [
            "\\text{rank} = 2, \\quad k = 3",
            "\\text{rank} < k: \\text{ linearly dependent}"
          ]
        },
        {
          "title": "Find the relation (put c₃ = 1)",
          "math": [
            "-3c_2 - 6(1) = 0 \\ \\Rightarrow\\ c_2 = -2",
            "c_1 + 4(-2) + 7(1) = 0 \\ \\Rightarrow\\ c_1 = 1",
            "v_1 - 2v_2 + v_3 = 0"
          ]
        }
      ],
      "answer": "$$\\text{Dependent: } v_1 - 2v_2 + v_3 = 0, \\text{ so } v_3 = 2v_2 - v_1$$"
    },
    "symbols": [
      {
        "s": "c_1v_1 + \\dots + c_kv_k = 0",
        "t": "A linear combination equal to the zero vector.",
        "e": ""
      },
      {
        "s": "k",
        "t": "The number of vectors.",
        "e": "3"
      },
      {
        "s": "\\text{rank}",
        "t": "The number of non-zero rows after row reduction.",
        "e": "2"
      },
      {
        "s": "\\text{independent}",
        "t": "Only $c_1 = \\dots = c_k = 0$ works: rank = k.",
        "e": ""
      },
      {
        "s": "\\text{dependent}",
        "t": "Some non-zero set of c’s works: rank < k.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Saying \"dependent\" without the relation.",
        "f": "Give the actual combination, e.g. $v_1 - 2v_2 + v_3 = 0$, and check it."
      },
      {
        "m": "Forgetting the shortcut.",
        "f": "More vectors than entries (k > n) are always dependent; for k = n check whether the determinant is 0."
      },
      {
        "m": "Mixing rows and columns.",
        "f": "If the vectors are columns, the relation’s c’s come from the reduced rows; keep one layout throughout."
      },
      {
        "m": "Treating the zero vector as harmless.",
        "f": "Any set containing 0 is dependent."
      }
    ]
  },
  "linear-transformations": {
    "example": {
      "question": "Find the matrix, kernel, image, rank and nullity of $T(x, y, z) = (x + 2y - z,\\ y + z,\\ x + y - 2z)$.",
      "steps": [
        {
          "title": "Matrix of T",
          "math": [
            "A = [\\,T(e_1)\\ \\cdots\\ T(e_n)\\,]",
            "A = \\begin{bmatrix} 1 & 2 & -1 \\\\ 0 & 1 & 1 \\\\ 1 & 1 & -2 \\end{bmatrix}"
          ]
        },
        {
          "title": "Reduced row echelon form",
          "math": [
            "\\begin{bmatrix} 1 & 0 & -3 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 0 \\end{bmatrix}",
            "\\text{pivot columns: } 1, 2"
          ]
        },
        {
          "title": "Kernel",
          "math": [
            "\\ker T = \\{\\mathbf{x} : A\\mathbf{x} = \\mathbf{0}\\}",
            "\\ker T = \\operatorname{span}\\left\\{\\begin{pmatrix} 3 \\\\ -1 \\\\ 1 \\end{pmatrix}\\right\\}",
            "\\text{nullity} = 1"
          ]
        },
        {
          "title": "Image (column space)",
          "math": [
            "\\text{the pivot columns of } A",
            "\\operatorname{Im} T = \\operatorname{span}\\left\\{\\begin{pmatrix} 1 \\\\ 0 \\\\ 1 \\end{pmatrix},\\ \\begin{pmatrix} 2 \\\\ 1 \\\\ 1 \\end{pmatrix}\\right\\}",
            "\\text{rank} = 2"
          ]
        },
        {
          "title": "Rank–nullity",
          "math": [
            "\\text{rank} + \\text{nullity} = n",
            "2 + 1 = 3"
          ]
        }
      ],
      "answer": "$$\\text{rank } T = 2,\\quad \\text{nullity } T = 1,\\quad 2 + 1 = 3 \\ \\checkmark$$"
    },
    "symbols": [
      {
        "s": "T: V \\to W",
        "t": "A linear map: $T(au + bv) = aT(u) + bT(v)$.",
        "e": ""
      },
      {
        "s": "[T]",
        "t": "The matrix of T: the images of the basis vectors as its columns.",
        "e": ""
      },
      {
        "s": "\\ker T",
        "t": "The kernel: every vector T sends to 0.",
        "e": ""
      },
      {
        "s": "\\operatorname{Im} T",
        "t": "The image: every output of T (the column space).",
        "e": ""
      },
      {
        "s": "\\text{rank} + \\text{nullity} = \\dim V",
        "t": "The rank–nullity theorem.",
        "e": "2 + 1 = 3"
      }
    ],
    "mistakes": [
      {
        "m": "Putting the images in rows.",
        "f": "T(e₁), T(e₂), T(e₃) go in as columns of [T]."
      },
      {
        "m": "Taking image vectors from the reduced matrix.",
        "f": "Use the pivot columns of the original [T], not of the RREF."
      },
      {
        "m": "Giving the kernel as one point.",
        "f": "The kernel is a subspace; give a basis, e.g. all multiples of one vector."
      },
      {
        "m": "Not checking rank–nullity.",
        "f": "rank + nullity must equal the number of input variables."
      }
    ]
  },
  "matrix-calculator": {
    "example": null,
    "symbols": [
      {
        "s": "A_{m \\times n}",
        "t": "A matrix with m rows and n columns.",
        "e": ""
      },
      {
        "s": "(AB)_{ij} = \\sum_k a_{ik}b_{kj}",
        "t": "Row i of A times column j of B, entry by entry, added.",
        "e": "1(5) + 2(7) = 19"
      },
      {
        "s": "A^T",
        "t": "The transpose: rows become columns.",
        "e": ""
      },
      {
        "s": "A + B",
        "t": "Add entry by entry (same size only).",
        "e": ""
      },
      {
        "s": "kA",
        "t": "Multiply every entry by k.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Multiplying entry by entry.",
        "f": "AB uses row × column sums, not $a_{ij}b_{ij}$."
      },
      {
        "m": "Ignoring the sizes.",
        "f": "AB needs the columns of A to equal the rows of B; the answer is (rows of A) × (columns of B)."
      },
      {
        "m": "Assuming AB = BA.",
        "f": "Matrix multiplication is usually not commutative; keep the order."
      },
      {
        "m": "Transposing a product in the same order.",
        "f": "$(AB)^T = B^TA^T$: the order reverses."
      }
    ]
  },
  "matrix-inverse": {
    "example": null,
    "symbols": [
      {
        "s": "A^{-1}",
        "t": "The inverse: $AA^{-1} = A^{-1}A = I$.",
        "e": ""
      },
      {
        "s": "|A|",
        "t": "The determinant; the inverse exists only if it is not 0.",
        "e": "1"
      },
      {
        "s": "C_{ij}",
        "t": "The cofactor of $a_{ij}$: its minor with the place sign.",
        "e": ""
      },
      {
        "s": "\\operatorname{adj} A",
        "t": "The adjoint: the transpose of the cofactor matrix.",
        "e": ""
      },
      {
        "s": "A^{-1} = \\frac{\\operatorname{adj} A}{|A|}",
        "t": "The adjoint formula for the inverse.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Forgetting to transpose the cofactors.",
        "f": "adj A is the cofactor matrix turned so rows become columns."
      },
      {
        "m": "Dropping the place signs.",
        "f": "Cofactor = $(-1)^{i+j}\\times$ minor; the signs follow + − + / − + − / + − +."
      },
      {
        "m": "Inverting a singular matrix.",
        "f": "Work out |A| first. If it is 0 there is no inverse."
      },
      {
        "m": "Not checking.",
        "f": "Multiply: $AA^{-1}$ must give I."
      }
    ]
  },
  "quadratic-form": {
    "example": {
      "question": "Reduce $Q = 3x^2 + 5y^2 + 3z^2 - 2xy + 2xz - 2yz$ to canonical form by an orthogonal transformation, and find its nature.",
      "steps": [
        {
          "title": "Matrix of the form",
          "math": [
            "Q = X^{T}AX, \\quad a_{ij} = a_{ji} = \\tfrac12(\\text{coefficient of } x_i x_j)",
            "A = \\begin{bmatrix} 3 & -1 & 1 \\\\ -1 & 5 & -1 \\\\ 1 & -1 & 3 \\end{bmatrix}, \\quad X = \\begin{bmatrix} x \\\\ y \\\\ z \\end{bmatrix}"
          ]
        },
        {
          "title": "Characteristic equation",
          "math": [
            "|A - \\lambda I| = 0",
            "\\left|A - \\lambda I\\right| =\\left|\\begin{array}{ccc} 3 - \\lambda & -1 & 1 \\\\ -1 & 5 - \\lambda & -1 \\\\ 1 & -1 & 3 - \\lambda \\end{array}\\right| = 0",
            "\\lambda^3 - S_1\\lambda^2 + S_2\\lambda - |A| = 0",
            "S_1 = \\text{tr}\\,A = 11, \\quad S_2 = \\text{sum of the } 2 \\times 2 \\text{ principal minors} = 36, \\quad |A| = 36",
            "\\lambda^{3} - 11\\lambda^{2} + 36\\lambda - 36 = 0"
          ]
        },
        {
          "title": "Solve for the eigenvalues",
          "math": [
            "\\left(\\lambda - 2\\right)\\left(\\lambda - 3\\right)\\left(\\lambda - 6\\right) = 0",
            "\\lambda = 2, \\quad 3, \\quad 6"
          ]
        },
        {
          "title": "Eigenvector for λ = 2",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (2)I = \\left[\\begin{array}{ccc} 1 & -1 & 1 \\\\ -1 & 3 & -1 \\\\ 1 & -1 & 1 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{ccc} 1 & 0 & 1 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 1 \\\\ 0 \\\\ -1 \\end{bmatrix}"
          ]
        },
        {
          "title": "Eigenvector for λ = 3",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (3)I = \\left[\\begin{array}{ccc} 0 & -1 & 1 \\\\ -1 & 2 & -1 \\\\ 1 & -1 & 0 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{ccc} 1 & 0 & -1 \\\\ 0 & 1 & -1 \\\\ 0 & 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 1 \\\\ 1 \\\\ 1 \\end{bmatrix}"
          ]
        },
        {
          "title": "Eigenvector for λ = 6",
          "math": [
            "(A - \\lambda I)X = 0",
            "A - (6)I = \\left[\\begin{array}{ccc} -3 & -1 & 1 \\\\ -1 & -1 & -1 \\\\ 1 & -1 & -3 \\end{array}\\right] \\ \\to \\ \\left[\\begin{array}{ccc} 1 & 0 & -1 \\\\ 0 & 1 & 2 \\\\ 0 & 0 & 0 \\end{array}\\right]",
            "X = t\\begin{bmatrix} 1 \\\\ -2 \\\\ 1 \\end{bmatrix}"
          ]
        },
        {
          "title": "Modal matrix P and spectral matrix D",
          "math": [
            "P^{-1}AP = D",
            "P = \\begin{bmatrix} 1 & 1 & 1 \\\\ 0 & 1 & -2 \\\\ -1 & 1 & 1 \\end{bmatrix}, \\quad D = \\begin{bmatrix} 2 & 0 & 0 \\\\ 0 & 3 & 0 \\\\ 0 & 0 & 6 \\end{bmatrix}",
            "P^{-1} = \\begin{bmatrix} \\frac{1}{2} & 0 & -\\frac{1}{2} \\\\ \\frac{1}{3} & \\frac{1}{3} & \\frac{1}{3} \\\\ \\frac{1}{6} & -\\frac{1}{3} & \\frac{1}{6} \\end{bmatrix}",
            "P^{-1}AP = \\begin{bmatrix} 2 & 0 & 0 \\\\ 0 & 3 & 0 \\\\ 0 & 0 & 6 \\end{bmatrix} = D \\ \\checkmark"
          ]
        },
        {
          "title": "Orthogonal reduction (A is symmetric)",
          "math": [
            "N^{T}AN = D, \\quad N^{-1} = N^{T}",
            "\\lambda = 2: \\ \\frac{X}{\\lVert X \\rVert} = \\begin{bmatrix} \\frac{\\sqrt{2}}{2} \\\\ 0 \\\\ -\\frac{\\sqrt{2}}{2} \\end{bmatrix}",
            "\\lambda = 3: \\ \\frac{X}{\\lVert X \\rVert} = \\begin{bmatrix} \\frac{\\sqrt{3}}{3} \\\\ \\frac{\\sqrt{3}}{3} \\\\ \\frac{\\sqrt{3}}{3} \\end{bmatrix}",
            "\\lambda = 6: \\ \\frac{X}{\\lVert X \\rVert} = \\begin{bmatrix} \\frac{\\sqrt{6}}{6} \\\\ -\\frac{\\sqrt{6}}{3} \\\\ \\frac{\\sqrt{6}}{6} \\end{bmatrix}",
            "N = \\begin{bmatrix} \\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{3}}{3} & \\frac{\\sqrt{6}}{6} \\\\ 0 & \\frac{\\sqrt{3}}{3} & -\\frac{\\sqrt{6}}{3} \\\\ -\\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{3}}{3} & \\frac{\\sqrt{6}}{6} \\end{bmatrix}",
            "N^{T}AN = \\begin{bmatrix} 2 & 0 & 0 \\\\ 0 & 3 & 0 \\\\ 0 & 0 & 6 \\end{bmatrix} = D \\ \\checkmark"
          ]
        },
        {
          "title": "Canonical form",
          "math": [
            "X = NY \\ \\Rightarrow \\ Q = \\lambda_1 y_1^2 + \\cdots + \\lambda_n y_n^2",
            "N = \\begin{bmatrix} \\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{3}}{3} & \\frac{\\sqrt{6}}{6} \\\\ 0 & \\frac{\\sqrt{3}}{3} & -\\frac{\\sqrt{6}}{3} \\\\ -\\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{3}}{3} & \\frac{\\sqrt{6}}{6} \\end{bmatrix}",
            "Q = 2y_{1}^2 + 3y_{2}^2 + 6y_{3}^2"
          ]
        },
        {
          "title": "Rank, index, signature and nature",
          "math": [
            "\\text{rank } r = 3, \\quad \\text{index } p = 3, \\quad \\text{signature } s = p - (r - p) = 3",
            "\\text{Nature: positive definite}"
          ]
        },
        {
          "title": "Check by principal minors",
          "math": [
            "D_1, D_2, \\ldots, D_n",
            "D_{1} = 3, \\quad D_{2} = 14, \\quad D_{3} = 36",
            "\\text{All positive: positive definite } \\checkmark"
          ]
        }
      ],
      "answer": "$$Q = 2y_1^2 + 3y_2^2 + 6y_3^2: \\text{ rank } 3,\\ \\text{index } 3,\\ \\text{positive definite}$$"
    },
    "symbols": [
      {
        "s": "Q = X^TAX",
        "t": "The quadratic form written with a symmetric matrix A.",
        "e": ""
      },
      {
        "s": "a_{ij} = \\tfrac12(\\text{coefficient of } x_ix_j)",
        "t": "Off-diagonal entries take half of each cross-term.",
        "e": "-2xy \\to -1"
      },
      {
        "s": "X = NY",
        "t": "The orthogonal change of variables.",
        "e": ""
      },
      {
        "s": "\\text{rank}",
        "t": "The number of non-zero eigenvalues.",
        "e": "3"
      },
      {
        "s": "\\text{index}",
        "t": "The number of positive terms in the canonical form.",
        "e": "3"
      },
      {
        "s": "\\text{signature}",
        "t": "(Positive terms) − (negative terms).",
        "e": "3"
      }
    ],
    "mistakes": [
      {
        "m": "Putting the full cross-term in the matrix.",
        "f": "$-2xy$ gives $a_{12} = a_{21} = -1$, not −2."
      },
      {
        "m": "Calling it definite with a zero eigenvalue.",
        "f": "All > 0: positive definite; all ≥ 0 with a 0: positive semi-definite."
      },
      {
        "m": "Using un-normalised eigenvectors.",
        "f": "For X = NY the columns of N must be unit vectors."
      },
      {
        "m": "Mixing up index and signature.",
        "f": "Index counts positive terms; signature is positive minus negative."
      }
    ]
  },
  "rank-of-matrix": {
    "example": null,
    "symbols": [
      {
        "s": "\\rho(A)",
        "t": "The rank: the number of non-zero rows in echelon form.",
        "e": "2"
      },
      {
        "s": "R_i \\to R_i - kR_j",
        "t": "An elementary row operation; it does not change the rank.",
        "e": ""
      },
      {
        "s": "\\text{pivot}",
        "t": "The first non-zero entry of a row in echelon form.",
        "e": ""
      },
      {
        "s": "\\text{echelon form}",
        "t": "Each pivot sits to the right of the one above; zero rows at the bottom.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Counting all rows.",
        "f": "Count only the non-zero rows after reduction."
      },
      {
        "m": "Mixing row and column operations mid-way.",
        "f": "Either is allowed for rank, but write each one down so the working can be checked."
      },
      {
        "m": "Stopping before echelon form.",
        "f": "Keep going until each pivot is right of the one above; hidden dependent rows show up only then."
      },
      {
        "m": "Expecting rank > the smaller size.",
        "f": "ρ(A) ≤ min(rows, columns)."
      }
    ]
  },
  "svd-calculator": {
    "example": {
      "question": "Find the singular value decomposition of $A = \\begin{bmatrix} 3 & 2 & 2 \\\\ 2 & 3 & -2 \\end{bmatrix}$.",
      "steps": [
        {
          "title": "AᵀA and its eigenvalues",
          "math": [
            "A^TA = V\\Lambda V^T",
            "A^TA = \\begin{bmatrix} 13 & 12 & 2 \\\\ 12 & 13 & -2 \\\\ 2 & -2 & 8 \\end{bmatrix}",
            "\\lambda = 25, 9, 0"
          ]
        },
        {
          "title": "Singular values",
          "math": [
            "\\sigma_i = \\sqrt{\\lambda_i}",
            "\\sigma = 5, 3, 0 \\quad (\\text{rank } 2)"
          ]
        },
        {
          "title": "Right singular vectors (columns of V)",
          "math": [
            "V = \\begin{bmatrix} \\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{2}}{6} & \\frac{2}{3} \\\\ \\frac{\\sqrt{2}}{2} & -\\frac{\\sqrt{2}}{6} & -\\frac{2}{3} \\\\ 0 & \\frac{2\\sqrt{2}}{3} & -\\frac{1}{3} \\end{bmatrix}"
          ]
        },
        {
          "title": "Left singular vectors",
          "math": [
            "u_i = \\frac{Av_i}{\\sigma_i}",
            "U = \\begin{bmatrix} \\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{2}}{2} \\\\ \\frac{\\sqrt{2}}{2} & -\\frac{\\sqrt{2}}{2} \\end{bmatrix}"
          ]
        },
        {
          "title": "Check",
          "math": [
            "U\\Sigma V^T = \\begin{bmatrix} 3 & 2 & 2 \\\\ 2 & 3 & -2 \\end{bmatrix}"
          ]
        }
      ],
      "answer": "$$A = U\\Sigma V^T, \\qquad \\sigma_1 = 5,\\ \\sigma_2 = 3$$"
    },
    "symbols": [
      {
        "s": "A = U\\Sigma V^T",
        "t": "The singular value decomposition.",
        "e": ""
      },
      {
        "s": "\\sigma_i = \\sqrt{\\lambda_i(A^TA)}",
        "t": "The singular values: square roots of the eigenvalues of $A^TA$.",
        "e": "5,\\ 3"
      },
      {
        "s": "V",
        "t": "Right singular vectors: unit eigenvectors of $A^TA$, as columns.",
        "e": ""
      },
      {
        "s": "u_i = \\frac{1}{\\sigma_i}Av_i",
        "t": "The left singular vectors, the columns of U.",
        "e": ""
      },
      {
        "s": "\\Sigma",
        "t": "The singular values on the diagonal, largest first, padded with zeros.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Using the eigenvalues as singular values.",
        "f": "Take square roots: $\\lambda = 25, 9$ give $\\sigma = 5, 3$."
      },
      {
        "m": "Finding U separately with free signs.",
        "f": "Get each $u_i$ from $Av_i/\\sigma_i$ so the signs match V."
      },
      {
        "m": "Wrong size of Σ.",
        "f": "Σ has the same size as A (here 2×3)."
      },
      {
        "m": "Not normalising V.",
        "f": "Each column of V must be a unit vector."
      }
    ]
  },
  "vector-calculator": {
    "example": {
      "question": "Find the angle between $\\vec a = \\hat i + \\hat j$ and $\\vec b = \\hat j + \\hat k$.",
      "steps": [
        {
          "title": "Dot product",
          "math": [
            "\\vec a \\cdot \\vec b = a_1b_1 + a_2b_2 + a_3b_3",
            "\\vec a \\cdot \\vec b = 10 + 11 + 01 = 1"
          ]
        },
        {
          "title": "Angle between them",
          "math": [
            "\\cos\\theta = \\frac{\\vec a \\cdot \\vec b}{|\\vec a|\\,|\\vec b|}",
            "|\\vec a| = \\sqrt{2}, \\quad |\\vec b| = \\sqrt{2}",
            "\\cos\\theta = \\frac{1}{2} = \\frac{1}{2}",
            "\\theta = \\frac{\\pi}{3} = 60^{\\circ}"
          ]
        }
      ],
      "answer": "$$\\vec a \\cdot \\vec b = 1, \\qquad \\theta = \\frac{\\pi}{3} = 60^\\circ$$"
    },
    "symbols": [
      {
        "s": "\\vec a \\cdot \\vec b = a_1b_1 + a_2b_2 + a_3b_3",
        "t": "The dot product: multiply matching parts and add.",
        "e": "0 + 1 + 0 = 1"
      },
      {
        "s": "|\\vec a| = \\sqrt{a_1^2 + a_2^2 + a_3^2}",
        "t": "The length (magnitude) of a vector.",
        "e": "\\sqrt 2"
      },
      {
        "s": "\\cos\\theta = \\frac{\\vec a \\cdot \\vec b}{|\\vec a||\\vec b|}",
        "t": "The angle between two vectors.",
        "e": "\\frac12"
      },
      {
        "s": "\\vec a \\times \\vec b",
        "t": "The cross product: a vector at right angles to both.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Missing a component.",
        "f": "Write each vector in full, with 0 for a missing part: $\\hat i + \\hat j = (1, 1, 0)$."
      },
      {
        "m": "Forgetting to divide by the lengths.",
        "f": "cos θ needs $|\\vec a||\\vec b|$ underneath."
      },
      {
        "m": "Cross product order.",
        "f": "$\\vec b \\times \\vec a = -\\vec a \\times \\vec b$."
      },
      {
        "m": "Calculator in degrees vs radians.",
        "f": "Say which: θ = π/3 = 60°."
      }
    ]
  }
};

export default DATA;
