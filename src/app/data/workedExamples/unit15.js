// Worked examples, symbol keys and common mistakes for the (UNIT-15) pages, drawn by components/method/DataExample.js
// and TheoryExtras.js in the original page style. The steps are each page engine's own working for the same input.
const DATA = {
  "assignment-problem": {
    "example": {
      "question": "Assign five jobs to five workers at the least total cost. Cost table (rows = workers, columns = jobs): 9 11 14 11 7 / 6 15 13 13 10 / 12 13 6 8 8 / 11 9 10 12 9 / 7 12 14 10 14.",
      "steps": [
        {
          "title": "Subtract each row's smallest",
          "math": [
            "\\begin{bmatrix} 2 & 4 & 7 & 4 & 0 \\\\ 0 & 9 & 7 & 7 & 4 \\\\ 6 & 7 & 0 & 2 & 2 \\\\ 2 & 0 & 1 & 3 & 0 \\\\ 0 & 5 & 7 & 3 & 7 \\end{bmatrix}"
          ]
        },
        {
          "title": "Subtract each column's smallest",
          "math": [
            "\\begin{bmatrix} 2 & 4 & 7 & 2 & 0 \\\\ 0 & 9 & 7 & 5 & 4 \\\\ 6 & 7 & 0 & 0 & 2 \\\\ 2 & 0 & 1 & 1 & 0 \\\\ 0 & 5 & 7 & 1 & 7 \\end{bmatrix}"
          ]
        },
        {
          "title": "Cover the zeros: 4 lines < 5",
          "math": [
            "\\text{lines through rows } 1, 3, 4, \\text{ columns } 1",
            "\\text{smallest uncovered} = 1: \\text{ subtract it from uncovered cells, add where lines cross}",
            "\\begin{bmatrix} 3 & 4 & 7 & 2 & 0 \\\\ 0 & 8 & 6 & 4 & 3 \\\\ 7 & 7 & 0 & 0 & 2 \\\\ 3 & 0 & 1 & 1 & 0 \\\\ 0 & 4 & 6 & 0 & 6 \\end{bmatrix}"
          ]
        },
        {
          "title": "5 lines: assign",
          "math": [
            "\\text{one } 0 \\text{ in each row and column}",
            "\\begin{bmatrix} 3 & 4 & 7 & 2 & \\boxed{0} \\\\ \\boxed{0} & 8 & 6 & 4 & 3 \\\\ 7 & 7 & \\boxed{0} & 0 & 2 \\\\ 3 & \\boxed{0} & 1 & 1 & 0 \\\\ 0 & 4 & 6 & \\boxed{0} & 6 \\end{bmatrix}"
          ]
        },
        {
          "title": "The assignment",
          "math": [
            "\\text{row } 1 \\to \\text{column } 5: \\ 7",
            "\\text{row } 2 \\to \\text{column } 1: \\ 6",
            "\\text{row } 3 \\to \\text{column } 3: \\ 6",
            "\\text{row } 4 \\to \\text{column } 2: \\ 9",
            "\\text{row } 5 \\to \\text{column } 4: \\ 10",
            "\\text{total} = 38"
          ]
        }
      ],
      "answer": "$$1 \\to 5,\\ 2 \\to 1,\\ 3 \\to 3,\\ 4 \\to 2,\\ 5 \\to 4: \\quad 7 + 6 + 6 + 9 + 10 = 38$$"
    },
    "symbols": [
      {
        "s": "c_{ij}",
        "t": "The cost of giving job j to worker i.",
        "e": ""
      },
      {
        "s": "\\text{row/column reduction}",
        "t": "Subtract the smallest number in each row, then each column.",
        "e": ""
      },
      {
        "s": "\\text{covering lines}",
        "t": "The fewest lines through all the zeros; n lines means an assignment exists.",
        "e": ""
      },
      {
        "s": "\\boxed{0}",
        "t": "A chosen zero: one in each row and column.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Adding the reduced numbers.",
        "f": "Read the total from the original cost table."
      },
      {
        "m": "Adjusting wrongly.",
        "f": "Subtract the smallest uncovered number from uncovered cells and add it at line crossings."
      },
      {
        "m": "Not square.",
        "f": "Add a dummy row or column of zeros first."
      },
      {
        "m": "Maximisation.",
        "f": "Subtract every entry from the largest one, then minimise."
      }
    ]
  },
  "bfs-dfs": {
    "example": {
      "question": "Search the graph with edges A–B, A–C, B–D, B–E, C–F, E–F, D–G from A, by breadth-first and by depth-first search (neighbours in alphabetical order).",
      "steps": [
        {
          "title": "Breadth-first search: a queue",
          "text": "Visit the front of the queue, then add its unvisited neighbours to the back.",
          "table": {
            "columns": [
              "Step",
              "Visit",
              "Added to queue",
              "Queue (front first)"
            ],
            "rows": [
              [
                "1",
                "A",
                "B, C",
                "B, C"
              ],
              [
                "2",
                "B",
                "D, E",
                "C, D, E"
              ],
              [
                "3",
                "C",
                "F",
                "D, E, F"
              ],
              [
                "4",
                "D",
                "G",
                "E, F, G"
              ],
              [
                "5",
                "E",
                "—",
                "F, G"
              ],
              [
                "6",
                "F",
                "—",
                "G"
              ],
              [
                "7",
                "G",
                "—",
                "—"
              ]
            ]
          }
        },
        {
          "title": "Depth-first search: a stack",
          "text": "Go as deep as possible along the first unvisited neighbour; back up when stuck.",
          "table": {
            "columns": [
              "Step",
              "Visit",
              "Still to explore",
              "Stack (top first)"
            ],
            "rows": [
              [
                "1",
                "A",
                "B, C",
                "A"
              ],
              [
                "2",
                "B",
                "D, E",
                "B, A"
              ],
              [
                "3",
                "D",
                "G",
                "D, B, A"
              ],
              [
                "4",
                "G",
                "— (back up)",
                "G, D, B, A"
              ],
              [
                "5",
                "E",
                "F",
                "E, B, A"
              ],
              [
                "6",
                "F",
                "C",
                "F, E, B, A"
              ],
              [
                "7",
                "C",
                "— (back up)",
                "C, F, E, B, A"
              ]
            ]
          }
        }
      ],
      "answer": "$$\\text{BFS: } A, B, C, D, E, F, G \\qquad \\text{DFS: } A, B, D, G, E, F, C$$"
    },
    "symbols": [
      {
        "s": "\\text{BFS}",
        "t": "Breadth-first: level by level, using a queue (first in, first out).",
        "e": ""
      },
      {
        "s": "\\text{DFS}",
        "t": "Depth-first: as deep as possible, using a stack (last in, first out).",
        "e": ""
      },
      {
        "s": "\\text{visited}",
        "t": "A node is visited once only.",
        "e": ""
      },
      {
        "s": "O(V + E)",
        "t": "The work for both: each node and edge looked at once.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Visiting a node twice.",
        "f": "Mark it visited when it is first added (BFS) or entered (DFS)."
      },
      {
        "m": "Using a stack for BFS.",
        "f": "BFS needs a queue; a stack gives DFS."
      },
      {
        "m": "Ignoring the neighbour order.",
        "f": "Different orders give different (but valid) answers; state the rule used."
      },
      {
        "m": "Shortest paths with weights.",
        "f": "BFS gives fewest edges only; use Dijkstra for weighted graphs."
      }
    ]
  },
  "dijkstra-algorithm": {
    "example": {
      "question": "Edges: A–B 4, A–C 2, B–C 1, B–D 5, C–D 8, C–E 10, D–E 2, D–F 6, E–F 2 (undirected). Find the shortest path from A to F.",
      "steps": [
        {
          "title": "The update rule",
          "math": [
            "d(v) \\leftarrow \\min\\big(d(v),\\ d(u) + w(u, v)\\big)"
          ],
          "text": "Start with d(A) = 0 and ∞ elsewhere. Each step visits the unvisited node with the smallest d and updates its neighbours. Each cell shows d and the node it came from."
        },
        {
          "title": "The table, one row per visit",
          "table": {
            "columns": [
              "Step",
              "Visit",
              "A",
              "B",
              "C",
              "D",
              "E",
              "F"
            ],
            "rows": [
              [
                "1",
                "A",
                "0",
                "4 (A)",
                "2 (A)",
                "∞",
                "∞",
                "∞"
              ],
              [
                "2",
                "C",
                "✓",
                "3 (C)",
                "2 (A)",
                "10 (C)",
                "12 (C)",
                "∞"
              ],
              [
                "3",
                "B",
                "✓",
                "3 (C)",
                "✓",
                "8 (B)",
                "12 (C)",
                "∞"
              ],
              [
                "4",
                "D",
                "✓",
                "✓",
                "✓",
                "8 (B)",
                "10 (D)",
                "14 (D)"
              ],
              [
                "5",
                "E",
                "✓",
                "✓",
                "✓",
                "✓",
                "10 (D)",
                "12 (E)"
              ],
              [
                "6",
                "F",
                "✓",
                "✓",
                "✓",
                "✓",
                "✓",
                "12 (E)"
              ]
            ]
          }
        },
        {
          "title": "Two of the updates in full",
          "math": [
            "\\text{Visit C: } d(B) = \\min(4,\\ 2 + 1) = 3, \\quad d(D) = 2 + 8 = 10, \\quad d(E) = 2 + 10 = 12",
            "\\text{Visit E: } d(F) = \\min(14,\\ 10 + 2) = 12"
          ]
        },
        {
          "title": "Trace the path back",
          "math": [
            "F \\leftarrow E \\leftarrow D \\leftarrow B \\leftarrow C \\leftarrow A",
            "A \\to C \\to B \\to D \\to E \\to F: \\ 2 + 1 + 5 + 2 + 2 = 12"
          ]
        }
      ],
      "answer": "$$A \\to C \\to B \\to D \\to E \\to F, \\quad d(F) = 12$$"
    },
    "symbols": [
      {
        "s": "d(v)",
        "t": "The shortest distance found so far from the source to v.",
        "e": ""
      },
      {
        "s": "w(u, v)",
        "t": "The weight (length) of edge u–v.",
        "e": ""
      },
      {
        "s": "\\text{visited}",
        "t": "A node whose distance is final.",
        "e": ""
      },
      {
        "s": "\\text{(X)}",
        "t": "The previous node on the best path, used to trace it back.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Visiting in alphabetical order.",
        "f": "Always visit the unvisited node with the smallest d."
      },
      {
        "m": "Not updating a shorter route.",
        "f": "B drops from 4 to 3 via C: keep checking."
      },
      {
        "m": "Negative weights.",
        "f": "Dijkstra fails with negative edges; use Bellman–Ford."
      },
      {
        "m": "Giving only the distance.",
        "f": "Trace the previous nodes back to give the path too."
      }
    ]
  },
  "k-map-simplifier": {
    "example": {
      "question": "Simplify $f(A, B, C, D) = \\Sigma m(0, 2, 5, 7, 8, 10, 13, 15)$ with a Karnaugh map.",
      "steps": [
        {
          "title": "The function",
          "math": [
            "f(A, B, C, D) = \\sum m(0, 2, 5, 7, 8, 10, 13, 15)"
          ]
        },
        {
          "title": "Prime implicants (the largest groups)",
          "math": [
            "\\text{combine terms that differ in one variable, repeatedly}",
            "\\overline{B}\\overline{D}: \\ m(0, 2, 8, 10)",
            "BD: \\ m(5, 7, 13, 15)"
          ]
        },
        {
          "title": "Essential prime implicants",
          "math": [
            "\\text{the only group covering some 1}",
            "\\overline{B}\\overline{D}, \\ BD"
          ]
        },
        {
          "title": "Product of sums (group the 0s)",
          "math": [
            "f = (B + \\overline{D})(\\overline{B} + D)"
          ]
        },
        {
          "title": "Minimal sum of products",
          "math": [
            "f = \\overline{B}\\overline{D} + BD"
          ]
        }
      ],
      "answer": "$$f = \\overline{B}\\,\\overline{D} + BD$$"
    },
    "symbols": [
      {
        "s": "m_i",
        "t": "A minterm: a row of the truth table where f = 1.",
        "e": ""
      },
      {
        "s": "\\text{group}",
        "t": "A block of 1, 2, 4, 8 … adjacent 1s (wrapping round the edges).",
        "e": ""
      },
      {
        "s": "\\text{prime implicant}",
        "t": "A group that cannot be made larger.",
        "e": ""
      },
      {
        "s": "\\text{essential}",
        "t": "A prime implicant that covers a 1 no other group covers.",
        "e": ""
      },
      {
        "s": "\\overline{B}",
        "t": "NOT B.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Binary order on the map.",
        "f": "Label rows and columns in Gray code: 00, 01, 11, 10."
      },
      {
        "m": "Missing the wrap-around.",
        "f": "The four corners (0, 2, 8, 10) are adjacent."
      },
      {
        "m": "Groups of 3 or 6.",
        "f": "Group sizes must be powers of 2."
      },
      {
        "m": "Too many groups.",
        "f": "Use the essential prime implicants first, then the fewest extra."
      }
    ]
  },
  "kuhn-tucker": {
    "example": {
      "question": "Maximise $Z = 10x + 4y - 2x^2 - y^2$ subject to $2x + y \\le 5,\\ x, y \\ge 0$.",
      "steps": [
        {
          "title": "Try without the constraint",
          "math": [
            "Z_x = 10 - 4x = 0,\\ Z_y = 4 - 2y = 0 \\ \\Rightarrow\\ (2.5,\\ 2)",
            "2(2.5) + 2 = 7 > 5: \\text{ not allowed, so the constraint is active}"
          ]
        },
        {
          "title": "Kuhn–Tucker conditions with 2x + y = 5",
          "math": [
            "L = 10x + 4y - 2x^2 - y^2 - \\lambda(2x + y - 5)",
            "L_x = 10 - 4x - 2\\lambda = 0, \\qquad L_y = 4 - 2y - \\lambda = 0"
          ]
        },
        {
          "title": "Solve",
          "math": [
            "x = \\frac{10 - 2\\lambda}{4}, \\qquad y = \\frac{4 - \\lambda}{2}",
            "2x + y = \\frac{10 - 2\\lambda}{2} + \\frac{4 - \\lambda}{2} = \\frac{14 - 3\\lambda}{2} = 5 \\ \\Rightarrow\\ \\lambda = \\frac43",
            "x = \\frac{10 - 8/3}{4} = \\frac{11}{6}, \\qquad y = \\frac{4 - 4/3}{2} = \\frac43"
          ]
        },
        {
          "title": "Check the conditions and find Z",
          "math": [
            "\\lambda = \\tfrac43 \\ge 0,\\ x, y \\ge 0 \\ \\checkmark",
            "Z = 10\\cdot\\tfrac{11}{6} + 4\\cdot\\tfrac43 - 2\\left(\\tfrac{11}{6}\\right)^2 - \\left(\\tfrac43\\right)^2 = \\frac{330 + 96 - 121 - 32}{18} = \\frac{273}{18} = \\frac{91}{6}"
          ]
        }
      ],
      "answer": "$$x = \\tfrac{11}{6},\\ y = \\tfrac43, \\quad Z_{\\max} = \\tfrac{91}{6} \\approx 15.17$$"
    },
    "symbols": [
      {
        "s": "L = f - \\lambda g",
        "t": "The Lagrangian for the constraint g ≤ 0.",
        "e": ""
      },
      {
        "s": "\\lambda",
        "t": "The Kuhn–Tucker multiplier.",
        "e": "\\tfrac43"
      },
      {
        "s": "\\lambda g = 0",
        "t": "Complementary slackness: λ = 0 or the constraint is tight.",
        "e": ""
      },
      {
        "s": "\\lambda \\ge 0",
        "t": "Needed at a maximum with a ≤ constraint.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Skipping the unconstrained check.",
        "f": "If the free optimum already satisfies the constraint, λ = 0 and you are done."
      },
      {
        "m": "Accepting λ < 0.",
        "f": "For a maximum with ≤, a negative λ means that guess is wrong."
      },
      {
        "m": "Sign of the λ term.",
        "f": "Write the constraint as $g = 2x + y - 5 \\le 0$ and subtract $\\lambda g$."
      },
      {
        "m": "Not checking concavity.",
        "f": "For a guaranteed global maximum, f should be concave (here it is)."
      }
    ]
  },
  "minimum-spanning-tree": {
    "example": {
      "question": "Edges: A–B 4, A–C 2, B–C 1, B–D 5, C–D 8, C–E 10, D–E 2, D–F 6, E–F 2. Find a minimum spanning tree by Kruskal’s algorithm.",
      "steps": [
        {
          "title": "Kruskal's rule",
          "text": "Sort the edges by weight. Take each edge in turn unless it makes a cycle. Stop at n − 1 = 5 edges."
        },
        {
          "title": "Edges in order",
          "table": {
            "columns": [
              "Edge",
              "Weight",
              "Take or skip"
            ],
            "rows": [
              [
                "B–C",
                "1",
                "take"
              ],
              [
                "A–C",
                "2",
                "take"
              ],
              [
                "D–E",
                "2",
                "take"
              ],
              [
                "E–F",
                "2",
                "take"
              ],
              [
                "A–B",
                "4",
                "skip (makes a cycle)"
              ],
              [
                "B–D",
                "5",
                "take"
              ]
            ]
          }
        },
        {
          "title": "Total weight",
          "math": [
            "BC + AC + DE + EF + BD = 1 + 2 + 2 + 2 + 5 = 12"
          ]
        }
      ],
      "answer": "$$\\text{MST: } BC, AC, DE, EF, BD; \\quad \\text{weight } 12$$"
    },
    "symbols": [
      {
        "s": "n",
        "t": "The number of nodes.",
        "e": "6"
      },
      {
        "s": "n - 1",
        "t": "The number of edges in any spanning tree.",
        "e": "5"
      },
      {
        "s": "\\text{cycle}",
        "t": "A closed loop; a tree has none.",
        "e": ""
      },
      {
        "s": "\\text{Prim}",
        "t": "Another method: grow one tree from a start node.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Taking an edge that closes a loop.",
        "f": "A–B (4) is skipped: A and B are already joined through C."
      },
      {
        "m": "Stopping too early or late.",
        "f": "A spanning tree of 6 nodes has exactly 5 edges."
      },
      {
        "m": "Unsorted edges.",
        "f": "Kruskal must look at edges from lightest to heaviest."
      },
      {
        "m": "Thinking the MST gives shortest paths.",
        "f": "It minimises total weight, not the distance between two nodes."
      }
    ]
  },
  "modular-arithmetic": {
    "example": {
      "question": "Find $\\gcd(252, 198)$ by Euclid’s algorithm.",
      "steps": [
        {
          "title": "The rule",
          "math": [
            "a = qb + r, \\quad \\gcd(a, b) = \\gcd(b, r)"
          ]
        },
        {
          "title": "Divide until the remainder is 0",
          "table": {
            "columns": [
              "a",
              "b",
              "q",
              "r"
            ],
            "rows": [
              [
                "252",
                "198",
                "1",
                "54"
              ],
              [
                "198",
                "54",
                "3",
                "36"
              ],
              [
                "54",
                "36",
                "1",
                "18"
              ],
              [
                "36",
                "18",
                "2",
                "0"
              ]
            ]
          }
        },
        {
          "title": "Each line in full",
          "math": [
            "252 = 1 \\times 198 + 54",
            "198 = 3 \\times 54 + 36",
            "54 = 1 \\times 36 + 18",
            "36 = 2 \\times 18 + 0"
          ]
        },
        {
          "title": "Read off and check",
          "math": [
            "\\gcd(252, 198) = 18",
            "252 = 18 \\times 14, \\quad 198 = 18 \\times 11, \\quad \\gcd(14, 11) = 1 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$\\gcd(252, 198) = 18$$"
    },
    "symbols": [
      {
        "s": "q",
        "t": "The quotient.",
        "e": ""
      },
      {
        "s": "r",
        "t": "The remainder, 0 ≤ r < b.",
        "e": ""
      },
      {
        "s": "\\gcd(a, b)",
        "t": "The greatest common divisor.",
        "e": "18"
      },
      {
        "s": "a \\equiv b \\pmod n",
        "t": "a and b leave the same remainder on division by n.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Taking the last quotient.",
        "f": "The gcd is the last non-zero remainder."
      },
      {
        "m": "Not shifting the numbers.",
        "f": "Each line divides the old divisor by the old remainder."
      },
      {
        "m": "Negative remainders.",
        "f": "Keep $0 \\le r < b$."
      },
      {
        "m": "Not checking.",
        "f": "Divide both numbers by the gcd; the results must have gcd 1."
      }
    ]
  },
  "recurrence-relations": {
    "example": {
      "question": "Solve $a_n = 5a_{n-1} - 6a_{n-2}$ with $a_0 = 1,\\ a_1 = 0$.",
      "steps": [
        {
          "title": "Characteristic equation",
          "math": [
            "a_n = r^n",
            "r^{2} - 5r + 6 = 0",
            "r = 2, \\ 3"
          ]
        },
        {
          "title": "Homogeneous solution",
          "math": [
            "\\text{root } r \\text{ repeated } m \\text{ times} \\Rightarrow (A + Bn + \\cdots + Cn^{m-1})r^n",
            "a_n^{(h)} = A_{1}\\,2^{n} + A_{2}\\,3^{n}"
          ]
        },
        {
          "title": "Use the starting values",
          "math": [
            "a_{0} = 1, \\ a_{1} = 0",
            "A_{1} = 3, \\ A_{2} = -2"
          ]
        },
        {
          "title": "Solution",
          "math": [
            "a_n = 3 \\cdot 2^{n} - 2 \\cdot 3^{n}"
          ]
        }
      ],
      "answer": "$$a_n = 3\\cdot 2^n - 2\\cdot 3^n$$"
    },
    "symbols": [
      {
        "s": "a_n",
        "t": "The n-th term.",
        "e": ""
      },
      {
        "s": "r^2 - 5r + 6 = 0",
        "t": "The characteristic equation (put $a_n = r^n$).",
        "e": ""
      },
      {
        "s": "A,\\ B",
        "t": "Constants fixed by the starting values.",
        "e": "3,\\ -2"
      },
      {
        "s": "(A + Bn)r^n",
        "t": "The form for a repeated root.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Signs in the characteristic equation.",
        "f": "Move everything to one side: $r^2 - 5r + 6 = 0$."
      },
      {
        "m": "Repeated root as $A r^n + B r^n$.",
        "f": "Use $(A + Bn)r^n$."
      },
      {
        "m": "Using a₁, a₂ instead of a₀, a₁.",
        "f": "Use the values given; here n = 0 and n = 1."
      },
      {
        "m": "Not checking.",
        "f": "$a_2 = 5(0) - 6(1) = -6$ and $3\\cdot4 - 2\\cdot9 = -6$ ✓."
      }
    ]
  },
  "simplex-method": {
    "example": {
      "question": "Maximise $z = 3x + 5y$ subject to $x \\le 4,\\ 2y \\le 12,\\ 3x + 2y \\le 18,\\ x, y \\ge 0$.",
      "steps": [
        {
          "title": "Standard form with slack variables",
          "math": [
            "x + s_1 = 4, \\quad 2y + s_2 = 12, \\quad 3x + 2y + s_3 = 18",
            "z - 3x - 5y = 0"
          ]
        },
        {
          "title": "Tableau 1: y enters (most negative −5), s₂ leaves (smallest ratio 12/2 = 6)",
          "table": {
            "columns": [
              "Basis",
              "x",
              "y",
              "s1",
              "s2",
              "s3",
              "b",
              "Ratio"
            ],
            "rows": [
              [
                "s1",
                "1",
                "0",
                "1",
                "0",
                "0",
                "4",
                "—"
              ],
              [
                "s2",
                "0",
                "2",
                "0",
                "1",
                "0",
                "12",
                "6 ←"
              ],
              [
                "s3",
                "3",
                "2",
                "0",
                "0",
                "1",
                "18",
                "9"
              ],
              [
                "zⱼ − cⱼ",
                "-3",
                "-5",
                "0",
                "0",
                "0",
                "0",
                ""
              ]
            ]
          }
        },
        {
          "title": "Tableau 2: x enters (−3), s₃ leaves (ratio 6/3 = 2)",
          "table": {
            "columns": [
              "Basis",
              "x",
              "y",
              "s1",
              "s2",
              "s3",
              "b",
              "Ratio"
            ],
            "rows": [
              [
                "s1",
                "1",
                "0",
                "1",
                "0",
                "0",
                "4",
                "4"
              ],
              [
                "y",
                "0",
                "1",
                "0",
                "1/2",
                "0",
                "6",
                "—"
              ],
              [
                "s3",
                "3",
                "0",
                "0",
                "-1",
                "1",
                "6",
                "2 ←"
              ],
              [
                "zⱼ − cⱼ",
                "-3",
                "0",
                "0",
                "5/2",
                "0",
                "30",
                ""
              ]
            ]
          }
        },
        {
          "title": "Tableau 3: no negative zⱼ − cⱼ, so optimal",
          "table": {
            "columns": [
              "Basis",
              "x",
              "y",
              "s1",
              "s2",
              "s3",
              "b",
              "Ratio"
            ],
            "rows": [
              [
                "s1",
                "0",
                "0",
                "1",
                "1/3",
                "-1/3",
                "2",
                "—"
              ],
              [
                "y",
                "0",
                "1",
                "0",
                "1/2",
                "0",
                "6",
                "—"
              ],
              [
                "x",
                "1",
                "0",
                "0",
                "-1/3",
                "1/3",
                "2",
                "—"
              ],
              [
                "zⱼ − cⱼ",
                "0",
                "0",
                "0",
                "3/2",
                "1",
                "36",
                ""
              ]
            ]
          }
        },
        {
          "title": "Read off and check",
          "math": [
            "x = 2,\\ y = 6,\\ z = 3(2) + 5(6) = 36",
            "\\text{Constraints: } 2 \\le 4,\\ 12 \\le 12,\\ 6 + 12 = 18 \\le 18 \\ \\checkmark"
          ]
        }
      ],
      "answer": "$$x = 2,\\ y = 6, \\quad z_{\\max} = 36$$"
    },
    "symbols": [
      {
        "s": "s_i",
        "t": "Slack variables: the unused amount of each constraint.",
        "e": ""
      },
      {
        "s": "z_j - c_j",
        "t": "The bottom row; a negative value means z can still increase.",
        "e": ""
      },
      {
        "s": "\\text{ratio } b_i/a_{ij}",
        "t": "Picks the leaving row (smallest positive ratio).",
        "e": ""
      },
      {
        "s": "\\text{pivot}",
        "t": "The entry where the entering column meets the leaving row.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Choosing the leaving row by the largest ratio.",
        "f": "Take the smallest non-negative ratio."
      },
      {
        "m": "Including negative or zero entries in the ratio test.",
        "f": "Use only rows with a positive entry in the pivot column."
      },
      {
        "m": "Stopping too early.",
        "f": "Continue until no $z_j - c_j$ is negative."
      },
      {
        "m": "Forgetting to divide the pivot row first.",
        "f": "Make the pivot 1, then clear the rest of its column."
      }
    ]
  },
  "transportation-problem": {
    "example": {
      "question": "Costs (rows = sources, columns = destinations): 19 30 50 10 / 70 30 40 60 / 40 8 70 20. Supplies 7, 9, 18; demands 5, 8, 7, 14. Find the cheapest plan (Vogel, then MODI).",
      "steps": [
        {
          "title": "Vogel's approximation method",
          "math": [
            "\\text{penalties: rows } (9, 10, 12), \\text{ columns } (21, 22, 10, 10) \\Rightarrow \\text{cell } (3, 2)",
            "x_{32} = 8",
            "\\text{penalties: rows } (9, 20, 20), \\text{ columns } (21, -, 10, 10) \\Rightarrow \\text{cell } (1, 1)",
            "x_{11} = 5",
            "\\text{penalties: rows } (40, 20, 50), \\text{ columns } (-, -, 10, 10) \\Rightarrow \\text{cell } (3, 4)",
            "x_{34} = 10",
            "\\text{penalties: rows } (40, 20, -), \\text{ columns } (-, -, 10, 50) \\Rightarrow \\text{cell } (1, 4)",
            "x_{14} = 2",
            "\\text{penalties: rows } (-, 20, -), \\text{ columns } (-, -, 40, 60) \\Rightarrow \\text{cell } (2, 4)",
            "x_{24} = 2",
            "\\text{penalties: rows } (-, 40, -), \\text{ columns } (-, -, 40, -) \\Rightarrow \\text{cell } (2, 3)",
            "x_{23} = 7",
            "\\text{starting cost} = 779"
          ]
        },
        {
          "title": "MODI, round 1",
          "math": [
            "u_i + v_j = c_{ij} \\text{ (basic)}, \\quad d_{ij} = c_{ij} - (u_i + v_j)",
            "u = (0, 50, 10), \\quad v = (19, -2, -10, 10)",
            "\\text{most negative } d_{22} = -18 \\Rightarrow \\text{improve}"
          ]
        },
        {
          "title": "Move round the loop",
          "math": [
            "\\text{loop } (2,2) \\to (2,4) \\to (3,4) \\to (3,2), \\ \\theta = 2",
            "\\text{cost} = 743"
          ]
        },
        {
          "title": "MODI, round 2",
          "math": [
            "u_i + v_j = c_{ij} \\text{ (basic)}, \\quad d_{ij} = c_{ij} - (u_i + v_j)",
            "u = (0, 32, 10), \\quad v = (19, -2, 8, 10)",
            "\\text{every } d_{ij} \\ge 0: \\text{ optimal}"
          ]
        }
      ],
      "answer": "$$\\text{total cost} = 743$$"
    },
    "symbols": [
      {
        "s": "x_{ij}",
        "t": "The amount sent from source i to destination j.",
        "e": ""
      },
      {
        "s": "\\text{penalty}",
        "t": "Vogel: the gap between the two smallest costs in a row or column.",
        "e": ""
      },
      {
        "s": "u_i + v_j = c_{ij}",
        "t": "MODI: found from the occupied cells.",
        "e": ""
      },
      {
        "s": "d_{ij} = c_{ij} - (u_i + v_j)",
        "t": "Opportunity cost of an empty cell; all ≥ 0 means optimal.",
        "e": ""
      },
      {
        "s": "m + n - 1",
        "t": "The number of occupied cells needed.",
        "e": "6"
      }
    ],
    "mistakes": [
      {
        "m": "Unbalanced problem.",
        "f": "If total supply ≠ total demand, add a dummy row or column with cost 0."
      },
      {
        "m": "Fewer than m + n − 1 occupied cells.",
        "f": "Degenerate: put a tiny ε in an empty cell to keep going."
      },
      {
        "m": "Wrong loop signs.",
        "f": "Alternate + and − round the loop, starting with + at the new cell."
      },
      {
        "m": "Stopping at the Vogel answer.",
        "f": "Vogel is a starting plan; check optimality with MODI."
      }
    ]
  },
  "truth-table-generator": {
    "example": {
      "question": "Show that $p \\to q$ and $\\lnot p \\lor q$ are logically equivalent.",
      "steps": [
        {
          "title": "Number of rows",
          "math": [
            "2 \\text{ letters} \\Rightarrow 2^2 = 4 \\text{ rows}"
          ]
        },
        {
          "title": "Build the table, innermost parts first",
          "table": {
            "columns": [
              "$p$",
              "$q$",
              "$\\lnot p$",
              "$p \\to q$",
              "$\\lnot p \\lor q$"
            ],
            "rows": [
              [
                "T",
                "T",
                "F",
                "T",
                "T"
              ],
              [
                "T",
                "F",
                "F",
                "F",
                "F"
              ],
              [
                "F",
                "T",
                "T",
                "T",
                "T"
              ],
              [
                "F",
                "F",
                "T",
                "T",
                "T"
              ]
            ]
          }
        },
        {
          "title": "Compare the last two columns",
          "text": "They agree on every row, so the two statements are equivalent. The only false row is p = T, q = F: a promise broken."
        }
      ],
      "answer": "$$p \\to q \\equiv \\lnot p \\lor q$$"
    },
    "symbols": [
      {
        "s": "\\lnot p",
        "t": "NOT p.",
        "e": ""
      },
      {
        "s": "p \\land q,\\ p \\lor q",
        "t": "AND, OR.",
        "e": ""
      },
      {
        "s": "p \\to q",
        "t": "If p then q: false only when p is true and q is false.",
        "e": ""
      },
      {
        "s": "\\equiv",
        "t": "Logically equivalent: same truth value on every row.",
        "e": ""
      },
      {
        "s": "\\text{tautology}",
        "t": "True on every row.",
        "e": ""
      }
    ],
    "mistakes": [
      {
        "m": "Wrong implication row.",
        "f": "F → anything is T; only T → F is F."
      },
      {
        "m": "Missing rows.",
        "f": "n letters need $2^n$ rows."
      },
      {
        "m": "Skipping inner columns.",
        "f": "Work out each sub-formula in its own column first."
      },
      {
        "m": "Confusing $p \\to q$ with $q \\to p$.",
        "f": "The converse is not equivalent."
      }
    ]
  }
};

export default DATA;
