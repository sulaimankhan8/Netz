/**
 * The equation ribbon, as in the Equation Tools of WPS Office and Word: structure galleries
 * (Fraction, Script, Radical, Integral, Large Operator, Bracket, Function, Accent, Limit and
 * Log, Operator, Matrix) and symbol palettes.
 *
 * A template is LaTeX with #? where a box to fill in goes (the visual editor's placeholders).
 * Its picture in the ribbon shows each box as a small square.
 */

export const STRUCTURES = [
  {
    id: 'fraction',
    label: 'Fraction',
    icon: '\\frac{x}{y}',
    groups: [
      { label: 'Fraction', items: [
        { name: 'Stacked Fraction', latex: '\\frac{#?}{#?}' },
        { name: 'Skewed Fraction', latex: '{^{#?}}/{_{#?}}' },
        { name: 'Linear Fraction', latex: '#?/#?' },
        { name: 'Small Fraction', latex: '\\tfrac{#?}{#?}' },
      ] },
      { label: 'Common Fractions', items: [
        { name: 'Differential', latex: '\\frac{dy}{dx}' },
        { name: 'Delta', latex: '\\frac{\\Delta y}{\\Delta x}' },
        { name: 'Partial Differential', latex: '\\frac{\\partial y}{\\partial x}' },
        { name: 'Small Delta', latex: '\\frac{\\delta y}{\\delta x}' },
        { name: 'Pi Over 2', latex: '\\frac{\\pi}{2}' },
        { name: 'One Half', latex: '\\frac{1}{2}' },
        { name: 'Second Derivative', latex: '\\frac{d^2y}{dx^2}' },
        { name: 'Second Partial Derivative', latex: '\\frac{\\partial^2f}{\\partial x^2}' },
        { name: 'Adding Fractions', latex: '\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+bc}{bd}' },
        { name: 'Fraction of Fractions', latex: '\\frac{\\frac{a}{b}}{\\frac{c}{d}}=\\frac{ad}{bc}' },
      ] },
    ],
  },
  {
    id: 'script',
    label: 'Script',
    icon: 'e^x',
    groups: [
      { label: 'Subscripts and Superscripts', items: [
        { name: 'Superscript', latex: '#?^{#?}' },
        { name: 'Subscript', latex: '#?_{#?}' },
        { name: 'Subscript-Superscript', latex: '#?_{#?}^{#?}' },
        { name: 'Left Subscript-Superscript', latex: '{}_{#?}^{#?}#?' },
      ] },
      { label: 'Common Subscripts and Superscripts', items: [
        { name: 'Subscript with Superscript', latex: 'x_{y^2}' },
        { name: 'Exponential', latex: 'e^{-i\\omega t}' },
        { name: 'Square', latex: 'x^2' },
        { name: 'Left Scripts', latex: '{}_{1}^{n}Y' },
        { name: 'Cube', latex: 'x^3' },
        { name: 'Nth Power', latex: 'x^n' },
        { name: 'Indexed Term', latex: 'a_n' },
        { name: 'Squared Term with Index', latex: 'x_1^2' },
        { name: 'Exponential e to the x', latex: 'e^x' },
        { name: 'Power of Ten', latex: '10^{-3}' },
        { name: 'Isotope', latex: '{}_{6}^{14}\\mathrm{C}' },
      ] },
    ],
  },
  {
    id: 'radical',
    label: 'Radical',
    icon: '\\sqrt[n]{x}',
    groups: [
      { label: 'Radicals', items: [
        { name: 'Square Root', latex: '\\sqrt{#?}' },
        { name: 'Radical with Degree', latex: '\\sqrt[#?]{#?}' },
        { name: 'Cube Root', latex: '\\sqrt[3]{#?}' },
        { name: 'Fourth Root', latex: '\\sqrt[4]{#?}' },
      ] },
      { label: 'Common Radicals', items: [
        { name: 'Quadratic Formula', latex: '\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}' },
        { name: 'Distance', latex: '\\sqrt{a^2+b^2}' },
        { name: 'Square Root of 2', latex: '\\sqrt{2}' },
        { name: 'Cube Root of x', latex: '\\sqrt[3]{x}' },
        { name: 'Distance in Space', latex: '\\sqrt{x^2+y^2+z^2}' },
        { name: 'Root of a Fraction', latex: '\\sqrt{\\frac{a}{b}}=\\frac{\\sqrt{a}}{\\sqrt{b}}' },
        { name: 'Distance Between Points', latex: '\\sqrt{\\left(x_2-x_1\\right)^2+\\left(y_2-y_1\\right)^2}' },
      ] },
    ],
  },
  {
    id: 'integral',
    label: 'Integral',
    icon: '\\int_{-x}^{x}',
    groups: [
      { label: 'Integrals', items: [
        { name: 'Integral', latex: '\\int #?' },
        { name: 'Integral with Limits', latex: '\\int_{#?}^{#?} #?' },
        { name: 'Double Integral', latex: '\\iint #?' },
        { name: 'Double Integral with Limits', latex: '\\iint_{#?}^{#?} #?' },
        { name: 'Triple Integral', latex: '\\iiint #?' },
        { name: 'Triple Integral with Limits', latex: '\\iiint_{#?}^{#?} #?' },
      ] },
      { label: 'Contour Integrals', items: [
        { name: 'Contour Integral', latex: '\\oint #?' },
        { name: 'Contour Integral with Limits', latex: '\\oint_{#?}^{#?} #?' },
      ] },
      { label: 'Differentials', items: [
        { name: 'Differential x', latex: '\\,dx' },
        { name: 'Differential y', latex: '\\,dy' },
        { name: 'Differential theta', latex: '\\,d\\theta' },
      ] },
      { label: 'Common Integrals', items: [
        { name: 'Power Rule', latex: '\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C' },
        { name: 'Integral of 1/x', latex: '\\int\\frac{1}{x}\\,dx=\\ln\\left|x\\right|+C' },
        { name: 'Integral of e to the x', latex: '\\int e^x\\,dx=e^x+C' },
        { name: 'Integral of sin x', latex: '\\int\\sin x\\,dx=-\\cos x+C' },
        { name: 'Definite Integral', latex: '\\int_a^bf\\left(x\\right)dx=F\\left(b\\right)-F\\left(a\\right)' },
        { name: 'Area Under x Squared', latex: '\\int_0^1x^2\\,dx=\\frac{1}{3}' },
        { name: 'Gaussian Integral', latex: '\\int_{-\\infty}^{\\infty}e^{-x^2}dx=\\sqrt{\\pi}' },
        { name: 'Double Integral over a Region', latex: '\\iint_Df\\left(x,y\\right)dA' },
        { name: 'Line Integral', latex: '\\oint_C\\vec{F}\\cdot d\\vec{r}' },
      ] },
    ],
  },
  {
    id: 'largeOperator',
    label: 'Large Operator',
    icon: '\\sum_{i=0}^{n}',
    groups: [
      { label: 'Summations', items: [
        { name: 'Summation', latex: '\\sum #?' },
        { name: 'Summation with Limits', latex: '\\sum_{#?}^{#?} #?' },
        { name: 'Summation with Lower Limit', latex: '\\sum_{#?} #?' },
      ] },
      { label: 'Products and Coproducts', items: [
        { name: 'Product', latex: '\\prod #?' },
        { name: 'Product with Limits', latex: '\\prod_{#?}^{#?} #?' },
        { name: 'Coproduct with Limits', latex: '\\coprod_{#?}^{#?} #?' },
      ] },
      { label: 'Unions and Intersections', items: [
        { name: 'Union with Limits', latex: '\\bigcup_{#?}^{#?} #?' },
        { name: 'Intersection with Limits', latex: '\\bigcap_{#?}^{#?} #?' },
        { name: 'Logical Or', latex: '\\bigvee_{#?}^{#?} #?' },
        { name: 'Logical And', latex: '\\bigwedge_{#?}^{#?} #?' },
      ] },
      { label: 'Common Large Operators', items: [
        { name: 'Binomial Sum', latex: '\\sum_{k=0}^{n}\\binom{n}{k}' },
        { name: 'Sum of i', latex: '\\sum_{i=0}^{n} i' },
        { name: 'Product of A', latex: '\\prod_{k=1}^{n} A_k' },
        { name: 'Union of Intersections', latex: '\\bigcup_{n=1}^{m}\\left(X_n\\cap Y_n\\right)' },
        { name: 'Sum of x i', latex: '\\sum_{i=1}^{n}x_i' },
        { name: 'Sum of Squares', latex: '\\sum_{k=1}^{n}k^2=\\frac{n\\left(n+1\\right)\\left(2n+1\\right)}{6}' },
        { name: 'Basel Problem', latex: '\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}' },
        { name: 'Geometric Series', latex: '\\sum_{n=0}^{\\infty}ar^n=\\frac{a}{1-r}' },
        { name: 'Factorial as a Product', latex: '\\prod_{i=1}^{n}i=n!' },
      ] },
    ],
  },
  {
    id: 'bracket',
    label: 'Bracket',
    icon: '\\{()\\}',
    groups: [
      { label: 'Brackets', items: [
        { name: 'Parentheses', latex: '\\left(#?\\right)' },
        { name: 'Brackets', latex: '\\left[#?\\right]' },
        { name: 'Braces', latex: '\\left\\{#?\\right\\}' },
        { name: 'Angle Brackets', latex: '\\left\\langle #?\\right\\rangle' },
        { name: 'Single Bars', latex: '\\left|#?\\right|' },
        { name: 'Double Bars', latex: '\\left\\|#?\\right\\|' },
        { name: 'Floor', latex: '\\left\\lfloor #?\\right\\rfloor' },
        { name: 'Ceiling', latex: '\\left\\lceil #?\\right\\rceil' },
      ] },
      { label: 'Brackets with Separators', items: [
        { name: 'Parentheses with Separator', latex: '\\left(#?\\middle|#?\\right)' },
        { name: 'Angle Brackets with Separator', latex: '\\left\\langle #?\\middle|#?\\right\\rangle' },
      ] },
      { label: 'Cases and Stacks', items: [
        { name: 'Cases (Two Conditions)', latex: '\\begin{cases}#? & #?\\\\#? & #?\\end{cases}' },
        { name: 'Binomial Coefficient', latex: '\\binom{#?}{#?}' },
      ] },
      { label: 'Common Brackets', items: [
        { name: 'Absolute Value Function', latex: 'f(x)=\\begin{cases}-x, & x<0\\\\x, & x\\ge 0\\end{cases}' },
        { name: 'n Choose k', latex: '\\binom{n}{k}' },
        { name: 'Sign Function', latex: '\\operatorname{sgn}x=\\begin{cases}1, & x>0\\\\0, & x=0\\\\-1, & x<0\\end{cases}' },
        { name: 'Closed Interval', latex: '\\left[a,b\\right]' },
        { name: 'Open Interval', latex: '\\left(a,b\\right)' },
        { name: 'Set Builder', latex: '\\left\\{x\\mid x>0\\right\\}' },
        { name: 'Absolute Value Inequality', latex: '\\left|x-a\\right|<\\delta' },
        { name: 'Inner Product', latex: '\\left\\langle u,v\\right\\rangle' },
        { name: 'Power of a Bracket', latex: '\\left(\\frac{a}{b}\\right)^2' },
      ] },
    ],
  },
  {
    id: 'function',
    label: 'Function',
    icon: '\\sin\\theta',
    groups: [
      { label: 'Trigonometric Functions', items: [
        { name: 'Sine', latex: '\\sin #?' },
        { name: 'Cosine', latex: '\\cos #?' },
        { name: 'Tangent', latex: '\\tan #?' },
        { name: 'Cosecant', latex: '\\csc #?' },
        { name: 'Secant', latex: '\\sec #?' },
        { name: 'Cotangent', latex: '\\cot #?' },
      ] },
      { label: 'Inverse Functions', items: [
        { name: 'Inverse Sine', latex: '\\sin^{-1} #?' },
        { name: 'Inverse Cosine', latex: '\\cos^{-1} #?' },
        { name: 'Inverse Tangent', latex: '\\tan^{-1} #?' },
      ] },
      { label: 'Hyperbolic Functions', items: [
        { name: 'Hyperbolic Sine', latex: '\\sinh #?' },
        { name: 'Hyperbolic Cosine', latex: '\\cosh #?' },
        { name: 'Hyperbolic Tangent', latex: '\\tanh #?' },
      ] },
      { label: 'Common Functions', items: [
        { name: 'Sine Theta', latex: '\\sin\\theta' },
        { name: 'Cosine 2x', latex: '\\cos 2x' },
        { name: 'Tangent Formula', latex: '\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}' },
        { name: 'Pythagorean Identity', latex: '\\sin^2\\theta+\\cos^2\\theta=1' },
        { name: 'Sine of a Sum', latex: '\\sin\\left(\\alpha+\\beta\\right)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta' },
        { name: 'Double Angle', latex: '\\sin2\\theta=2\\sin\\theta\\cos\\theta' },
        { name: 'Angle from Inverse Tangent', latex: '\\theta=\\tan^{-1}\\frac{y}{x}' },
        { name: 'Hyperbolic Cosine Formula', latex: '\\cosh x=\\frac{e^x+e^{-x}}{2}' },
      ] },
    ],
  },
  {
    id: 'accent',
    label: 'Accent',
    icon: '\\ddot{a}',
    groups: [
      { label: 'Accents', items: [
        { name: 'Dot', latex: '\\dot{#?}' },
        { name: 'Double Dot', latex: '\\ddot{#?}' },
        // KaTeX has no \dddot: three dots set over the box
        { name: 'Triple Dot', latex: '\\overset{\\scriptscriptstyle\\cdots}{#?}' },
        { name: 'Hat', latex: '\\hat{#?}' },
        { name: 'Check', latex: '\\check{#?}' },
        { name: 'Acute', latex: '\\acute{#?}' },
        { name: 'Grave', latex: '\\grave{#?}' },
        { name: 'Breve', latex: '\\breve{#?}' },
        { name: 'Tilde', latex: '\\tilde{#?}' },
        { name: 'Bar', latex: '\\bar{#?}' },
      ] },
      { label: 'Overbars, Underbars and Braces', items: [
        { name: 'Overbar', latex: '\\overline{#?}' },
        { name: 'Underbar', latex: '\\underline{#?}' },
        { name: 'Overbrace', latex: '\\overbrace{#?}^{#?}' },
        { name: 'Underbrace', latex: '\\underbrace{#?}_{#?}' },
      ] },
      { label: 'Arrows Above', items: [
        { name: 'Vector', latex: '\\vec{#?}' },
        { name: 'Rightwards Arrow Above', latex: '\\overrightarrow{#?}' },
        { name: 'Leftwards Arrow Above', latex: '\\overleftarrow{#?}' },
        { name: 'Double-Headed Arrow Above', latex: '\\overleftrightarrow{#?}' },
      ] },
      { label: 'Boxed Formulas', items: [
        { name: 'Boxed Formula', latex: '\\boxed{#?}' },
        { name: 'Boxed Formula (Example)', latex: '\\boxed{a^2=b^2+c^2}' },
      ] },
      { label: 'Common Overbars', items: [
        { name: 'Complex Conjugate', latex: '\\overline{A}' },
        { name: 'Segment', latex: '\\overline{ABC}' },
        { name: 'Overbar of Exclusive Or', latex: '\\overline{x\\oplus y}' },
        { name: 'Vector F', latex: '\\vec{F}' },
        { name: 'Vector AB', latex: '\\overrightarrow{AB}' },
        { name: 'Unit Vector', latex: '\\hat{i}' },
        { name: 'Velocity (Dot)', latex: '\\dot{x}' },
        { name: 'Acceleration (Double Dot)', latex: '\\ddot{x}' },
        { name: 'Mean', latex: '\\bar{x}' },
        { name: 'Estimate', latex: '\\hat{\\theta}' },
      ] },
    ],
  },
  {
    id: 'limitLog',
    label: 'Limit and Log',
    icon: '\\lim_{n\\to\\infty}',
    groups: [
      { label: 'Functions', items: [
        { name: 'Logarithm with Base', latex: '\\log_{#?} #?' },
        { name: 'Logarithm', latex: '\\log #?' },
        { name: 'Limit', latex: '\\lim_{#?} #?' },
        { name: 'Minimum', latex: '\\min_{#?} #?' },
        { name: 'Maximum', latex: '\\max_{#?} #?' },
        { name: 'Natural Logarithm', latex: '\\ln #?' },
      ] },
      { label: 'Common Functions', items: [
        { name: 'Limit Example', latex: '\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n' },
        { name: 'Maximum Example', latex: '\\max_{0\\le x\\le 1} xe^{-x^2}' },
        { name: 'Limit of sin x / x', latex: '\\lim_{x\\to0}\\frac{\\sin x}{x}=1' },
        { name: 'Limit at Infinity', latex: '\\lim_{x\\to\\infty}\\frac{1}{x}=0' },
        { name: 'One-Sided Limit', latex: '\\lim_{x\\to0^+}\\ln x=-\\infty' },
        { name: 'Logarithm Example', latex: '\\log_28=3' },
        { name: 'Natural Log of e', latex: '\\ln e=1' },
        { name: 'Change of Base', latex: '\\log_ab=\\frac{\\ln b}{\\ln a}' },
        { name: 'Minimum Example', latex: '\\min_{x\\in\\mathbb{R}}\\left(x-1\\right)^2=0' },
      ] },
    ],
  },
  {
    id: 'operator',
    label: 'Operator',
    icon: '\\triangleq',
    groups: [
      { label: 'Basic Operators', items: [
        { name: 'Colon Equal', latex: '\\coloneqq' },
        { name: 'Equal Equal', latex: '==' },
        { name: 'Plus Equal', latex: '+=' },
        { name: 'Minus Equal', latex: '-=' },
        { name: 'Equal by Definition', latex: '\\stackrel{\\text{def}}{=}' },
        { name: 'Delta Equal To', latex: '\\triangleq' },
        { name: 'Measured By', latex: '\\stackrel{\\text{m}}{=}' },
      ] },
      { label: 'Operator Structures', items: [
        { name: 'Right Arrow with Text Above and Below', latex: '\\xrightarrow[#?]{#?}' },
        { name: 'Left Arrow with Text Above and Below', latex: '\\xleftarrow[#?]{#?}' },
        { name: 'Right Arrow with Text Above', latex: '\\xrightarrow{#?}' },
        { name: 'Long Double Arrow with Text Above', latex: '\\xLeftrightarrow{#?}' },
      ] },
      { label: 'Common Operator Structures', items: [
        { name: 'Yields with Delta', latex: '\\xrightarrow{\\Delta}' },
        { name: 'Yields with Catalyst', latex: '\\xrightarrow{\\text{catalyst}}' },
        { name: 'Maps To', latex: 'f:A\\to B' },
        { name: 'Function Arrow', latex: 'x\\mapsto x^2' },
        { name: 'Defined As', latex: 'f\\left(x\\right)\\stackrel{\\text{def}}{=}x^2+1' },
        { name: 'Implies', latex: 'a>b\\Rightarrow a+c>b+c' },
        { name: 'If and Only If', latex: 'x^2=1\\Leftrightarrow x=\\pm1' },
        { name: 'Approximately Equal', latex: '\\pi\\approx3.14' },
      ] },
    ],
  },
  {
    id: 'matrix',
    label: 'Matrix',
    icon: '\\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}',
    groups: [
      { label: 'Empty Matrices', items: [
        { name: '1x2 Empty Matrix', latex: '\\begin{matrix}#? & #?\\end{matrix}' },
        { name: '2x1 Empty Matrix', latex: '\\begin{matrix}#?\\\\#?\\end{matrix}' },
        { name: '1x3 Empty Matrix', latex: '\\begin{matrix}#? & #? & #?\\end{matrix}' },
        { name: '3x1 Empty Matrix', latex: '\\begin{matrix}#?\\\\#?\\\\#?\\end{matrix}' },
        { name: '2x2 Empty Matrix', latex: '\\begin{matrix}#? & #?\\\\#? & #?\\end{matrix}' },
        { name: '2x3 Empty Matrix', latex: '\\begin{matrix}#? & #? & #?\\\\#? & #? & #?\\end{matrix}' },
        { name: '3x2 Empty Matrix', latex: '\\begin{matrix}#? & #?\\\\#? & #?\\\\#? & #?\\end{matrix}' },
        { name: '3x3 Empty Matrix', latex: '\\begin{matrix}#? & #? & #?\\\\#? & #? & #?\\\\#? & #? & #?\\end{matrix}' },
      ] },
      { label: 'Dots', items: [
        { name: 'Midline Dots', latex: '\\cdots' },
        { name: 'Vertical Dots', latex: '\\vdots' },
        { name: 'Diagonal Dots', latex: '\\ddots' },
      ] },
      { label: 'Identity Matrices', items: [
        { name: '2x2 Identity Matrix', latex: '\\begin{matrix}1 & 0\\\\0 & 1\\end{matrix}' },
        { name: '3x3 Identity Matrix', latex: '\\begin{matrix}1 & 0 & 0\\\\0 & 1 & 0\\\\0 & 0 & 1\\end{matrix}' },
        { name: '2x2 Identity Matrix with Brackets', latex: '\\begin{bmatrix}1 & 0\\\\0 & 1\\end{bmatrix}' },
        { name: '3x3 Identity Matrix with Brackets', latex: '\\begin{bmatrix}1 & 0 & 0\\\\0 & 1 & 0\\\\0 & 0 & 1\\end{bmatrix}' },
        { name: 'n x n Identity Matrix', latex: 'I_n=\\begin{bmatrix}1 & 0 & \\cdots & 0\\\\0 & 1 & \\cdots & 0\\\\\\vdots & \\vdots & \\ddots & \\vdots\\\\0 & 0 & \\cdots & 1\\end{bmatrix}' },
      ] },
      { label: 'Matrices with Brackets', items: [
        { name: 'Matrix with Parentheses', latex: '\\begin{pmatrix}#? & #?\\\\#? & #?\\end{pmatrix}' },
        { name: 'Matrix with Brackets', latex: '\\begin{bmatrix}#? & #?\\\\#? & #?\\end{bmatrix}' },
        { name: 'Determinant', latex: '\\begin{vmatrix}#? & #?\\\\#? & #?\\end{vmatrix}' },
      ] },
      { label: 'Common Matrices', items: [
        { name: '2x2 Matrix', latex: 'A=\\begin{bmatrix}a & b\\\\c & d\\end{bmatrix}' },
        { name: 'Determinant of a 2x2 Matrix', latex: '\\begin{vmatrix}a & b\\\\c & d\\end{vmatrix}=ad-bc' },
        { name: 'Inverse of a 2x2 Matrix', latex: 'A^{-1}=\\frac{1}{ad-bc}\\begin{bmatrix}d & -b\\\\-c & a\\end{bmatrix}' },
        { name: 'Rotation Matrix', latex: 'R=\\begin{bmatrix}\\cos\\theta & -\\sin\\theta\\\\\\sin\\theta & \\cos\\theta\\end{bmatrix}' },
        { name: 'Column Vector', latex: '\\vec{v}=\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}' },
        { name: 'System of Equations', latex: '\\begin{cases}a_1x+b_1y=c_1\\\\a_2x+b_2y=c_2\\end{cases}' },
      ] },
    ],
  },
];

/** The symbol palettes of the equation ribbon (Word's categories). */
export const SYMBOL_PALETTES = [
  { id: 'basic', label: 'Basic Math', symbols: '±∞=≠~×÷!∝<≪>≫≤≥∓≅≈≡∀∁∂√∛∜∪∩∅%°℉℃∆∇∃∄∈∋←↑→↓↔∴+−¬αβγδεϵθϑμπρστφω∙⋮⋯⋰⋱ℵℶ∎' },
  { id: 'greek', label: 'Greek Letters', symbols: 'αβγδεϵζηθϑικλμνξοπϖρϱσςτυφϕχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' },
  { id: 'letterLike', label: 'Letter-Like Symbols', symbols: '∀∁ℂ∂ðℇϝℱℊℋℌℍℎℏıℑℐℒℓℕ℘ℙℚℛℜℝℤ℧ℨÅℬℭℯℰℳℴℵℶℷℸ' },
  { id: 'operators', label: 'Operators', symbols: '+−±∓∙×÷∗∘∖⋅∩∪⊎⊓⊔∧∨⊕⊖⊗⊘⊙∔∸∤∥∦≔≕≝≞≟≗≜∷∴∵∶∹∺∻∼∽∾≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓' },
  { id: 'arrows', label: 'Arrows', symbols: '←→↑↓↔↕⇐⇒⇑⇓⇔⇕⟵⟶⟷⟸⟹⟺↖↗↘↙↚↛↮⇍⇏⇎↤↦⟻⟼↩↪↼↽⇀⇁↿↾⇃⇂⇋⇌' },
  { id: 'negated', label: 'Negated Relations', symbols: '≠≮≯≰≱≢≁≄≉≇≭∉∌⊄⊅⊈⊉⊀⊁⋠⋡⋢⋣⋦⋧⋨⋩⋪⋫⋬⋭∤∦' },
  { id: 'scripts', label: 'Scripts', symbols: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ' },
  { id: 'geometry', label: 'Geometry', symbols: '∟∠∡∢⊾⊿⋕⊥∤∥∦∶∷∹∺∻∼∽∾⊗⊙⊚⊛△▽◊○□' },
];

/** The template as shown in the ribbon: each box to fill in as a small square. */
export function templatePreview(latex) {
  return latex.replace(/#\?/g, '\\square');
}

/** All structure templates, flat. */
export function allTemplates() {
  return STRUCTURES.flatMap((s) => s.groups.flatMap((g) => g.items.map((item) => ({ ...item, structure: s.id, group: g.label }))));
}
