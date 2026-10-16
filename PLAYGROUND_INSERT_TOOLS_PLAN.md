# NETZ Playground: Insert tools plan (Shapes, Screenshot, Symbol, Equation)

Written 2026-10-15. **Status: approved 2026-10-15** ("proceed"): the recommended answer to every decision in section 9 is accepted. Decision 5 (WPS's Physics and Chemistry lists) is still open. Progress is recorded in section 11.

Read `PLAYGROUND_HANDOFF.md` sections 1 to 4 first. Its rules (section 2) and definition of done (section 4) apply to every step here. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` (the project's `AGENTS.md` asks for this: this Next.js version differs from older ones).

---

## 1. Goal

The owner wants four tools from the Insert tab of WPS Office (and MS Word) in the Playground, all reachable from the toolbar:

1. **Shapes** that behave like Office shapes: fill, outline, rotate, resize from any side, yellow adjustment handles, text inside, layering and alignment.
2. **Screenshot** with the WPS menu: Rectangle, Oval, Rounded rectangle and Polygon screenshot, Screenshot, Hide Current Window During Screenshot, Screen Grab Main Window.
3. **Symbol** with the WPS menu: Recently Used Symbols, Custom Symbols, More Symbols…, Number.
4. **Equation** with the WPS menu: Insert New Equation, Insert LaTeX, and Common Equations › Math / Physics / Chemistry.

"Exactly like WPS" means the same menu items, in the same order and with the same names, doing the same thing wherever a browser allows it. Where a browser cannot do what a desktop program does (mainly screen capture on phones), this plan says what replaces it, so nothing pretends to work.

Every tool must work on a 390 px wide phone with a finger, as well as with a mouse and keyboard (handoff section 1).

---

## 2. Where shapes stand today

There is uncommitted work: `utils/shapeLibrary.js` (new) and changes to `PlaygroundDock.js`, `WhiteboardCanvas.js` and `PlaygroundCanvasContainer.js`. It adds a Shape Library panel with 36 shapes in 8 categories. You pick a shape, then drag on the page to draw it with a live preview. A tap inserts it at its default size, and Shift keeps it square.

**Why it cannot behave like Word:** each inserted shape is turned into an ink stroke, a list of outline points. After that it is just a line drawing, so:

- it has no fill (a stroke is only a line)
- it cannot be rotated, and resizing it with the lasso also thickens its outline (`scaleStroke` scales the width)
- it has no text, no adjustment handles, no choice of arrowheads or dashes
- its kind, colour or style cannot be changed later
- "Rounded Rectangle" is drawn with cut corners: eight straight edges, no arcs

**Decision in this plan:** keep the gallery panel and the drag-to-draw preview, and change what gets created: a **shape object** that keeps its kind, size, rotation and style (section 4). Freehand shape snapping (`shapeRecognizer.js`) stays as it is, producing ink, for people who prefer to draw shapes by hand.

---

## 3. The toolbar

The four tools sit together in an **Insert** group, with the existing Picture button, in WPS order: **Picture · Screenshot ▾ · Shapes ▾ · Symbol ▾ · Equation ▾**.

| Screen | Where the Insert group goes |
|---|---|
| Laptop (1100 px and wider) | On the dock. The existing Image button becomes Picture. The Shape tool button moves into the group. The "Eq" button becomes Equation ▾. Net new buttons: Screenshot ▾ and Symbol ▾. |
| Tablet (640 to 1100 px) | One **Insert ▾** button on the dock, opening a panel with the five items. |
| Phone (under 640 px) | The five-tool main bar does not change. The "More Tools" sheet gets an **Insert** row at the top with five 44 px tiles. Galleries open as bottom sheets (at most 85 % of the screen height). |

**Split buttons, as in WPS.** On a laptop, clicking the icon runs the default action and clicking the ▾ opens the menu:

- Screenshot: takes a screenshot in the ticked mode (WPS ticks "Screenshot" by default)
- Shapes: opens the gallery
- Symbol: opens the menu
- Equation: Insert New Equation

On a touch screen two targets side by side are too small, so the whole button opens the menu.

**Contextual format bar.** When a shape is selected, a format bar appears. This is our version of WPS's "Drawing Tools" tab; there is no ribbon here.

- Laptop: a floating bar just above the selection (below it if there is no room): Fill ▾ · Outline ▾ · Shape Effects ▾ · Styles ▾ | text size, **B**, *I*, text colour, alignment | Arrange ▾ · Rotate ▾ | Format Pane.
- Phone and tablet: a compact bar above the dock with five icons: Fill, Outline, Text, Arrange, More. Each opens a bottom sheet. When a sheet opens, the page moves so the selected shape stays visible above it.

**Risk:** the laptop dock already fills most of a 1366 px screen. `screens.mjs` must still report 0 controls off screen at 1100 px and 1366 px. If it does not, Graph and Theory fold into one "Add block ▾" button.

---

## 4. Shapes

### 4.1 The shape object

Shapes are a new kind of page content, stored next to strokes and blocks: `pages[i].shapes`. Order in the array is drawing order (z-order).

```js
{
  id: 'shape_<time>_<random>',
  preset: 'roundRect',              // Office preset name (section 4.2)
  x, y, w, h,                       // world units: the box before rotation
  rot: 0,                           // degrees clockwise about the centre
  flipH: false, flipV: false,
  adj: { adj: 25000 },              // only adjustment values that differ from the preset's defaults
  fill: { type: 'solid', color: '#4472C4', alpha: 1 },     // or { type: 'none' } or a linear gradient
  line: { color: '#2F528F', width: 1.33, alpha: 1, dash: 'solid',
          head: { type: 'none' }, tail: { type: 'none' } }, // or { type: 'none' }
  shadow: null,                     // or { preset, color, alpha, blur, dist, angle }
  text: null,                       // or { value, font, size, color, bold, italic, underline,
                                    //      align, valign, autofit: 'none' | 'shrink' | 'resize' }
  lockRatio: false,
  groupId: null,
  conn: null,                       // lines only: { start: { shapeId, site }, end: { shapeId, site } }
}
```

Like strokes (handoff rule 4), shape objects are never changed in place. Every edit builds a new object, so undo history can share them by reference.

The default look copies Word: blue fill, darker blue outline, white text. "Set as Default Shape" in the context menu changes it for new shapes on this device.

### 4.2 Geometry: Office's own shape definitions

Word, PowerPoint, WPS and LibreOffice all draw their shapes from one published file: the **preset shape definitions** in the Office Open XML standard (ECMA-376 Part 1, `presetShapeDefinitions.xml`). It defines 187 shapes. For each one it gives:

- the outline, as formulas of width, height and adjustment values
- the yellow adjustment handles and their limits (for example the corner radius of a rounded rectangle, the head of an arrow, or the inner radius of a star)
- the connection points that connectors attach to
- the rectangle where text goes
- shading for 3D-looking parts (the darker side of a cube or cylinder)

Using this file instead of drawing shapes by hand gives the same shapes, the same handles and the same text areas as Word and WPS. It also makes a later export to `.docx` or `.pptx` straightforward.

- **Developer script** `scripts/build-preset-shapes.mjs`: reads the XML once and writes `utils/shapes/presetShapes.generated.js` (compact data, committed to the repo). The app never parses XML.
- **Evaluator** `utils/shapes/presetEvaluator.js`, about 300 lines of pure functions. Given a preset, `w`, `h` and adjustment values, it computes the formulas (`*/`, `+-`, `?:`, `pin`, `sin`, `cos`, `at2`, `sat2`, `cat2`, `mod`, `sqrt`, `min`, `max`, `abs`, `val`, plus built-ins such as `wd2`, `hc`, `ss`, `cd4`). It returns SVG path data for each sub-path (with its fill and shading mode), handle positions, connection points and the text rectangle.
- **Gallery**: the WPS categories and order. Lines, Rectangles, Basic Shapes, Block Arrows, Equation Shapes, Flowchart, Stars and Banners, Callouts. The gallery icons are drawn by the same evaluator, so they match the result.
- **Licence:** the file is part of a free Ecma standard and ships inside Apache POI and LibreOffice. Confirm the terms once before release.

### 4.3 Where shapes sit on the page

A new `components/shapes/ShapeLayer.js` draws every shape in one `<svg>` element, **between the grid and the ink canvases**:

```
grid  →  shapes  →  ink (canvas.z-10)  →  stroke being drawn (canvas.z-20)  →  shape handles  →  blocks (z-40)  →  dock
```

- **You can write on a shape** with the pen or highlighter. This is the main thing a whiteboard needs (filling in a flowchart, labelling a diagram), and it also settles open decision C2 in the handoff for shapes. (Blocks stay above ink.)
- Panning and zooming change only one transform on the `<svg>`, so they cost nothing per shape. Shapes outside the view are skipped, as off-screen ink already is.
- The layer takes no pointer input itself. Input still goes through `WhiteboardCanvas`, which decides by tool (section 4.5).

### 4.4 Inserting

| Action | Result |
|---|---|
| Pick a shape, drag on the page | Draws it from corner to corner, with the live preview and size badge from today's code |
| Pick a shape, tap the page | Inserts it at its default size, centred on the tap |
| Shift while dragging | Keeps proportions (square, circle) |
| Ctrl while dragging | Draws from the centre outwards |
| "Lock proportions" button in the preview badge | The touch version of Shift |
| Lines and arrows | Drag from the start point to the end point. Shift snaps to 15° steps. |
| Text Box (first item in Basic Shapes, as in Word) | A shape with no fill and no outline that opens ready to type |

After inserting, the tool returns to Select with the new shape selected, as in Word (the current code already does this with the lasso).

### 4.5 Selecting and handles

**Which tool selects shapes.** The Select tool (today's "Lasso Select") and the Shapes tool select shapes. With the Pen, Highlighter or Eraser, a shape is ignored and the pen draws on top of it. That keeps handoff rule 2 ("every pointer draws").

With the Select tool:

- Tap a shape to select it. Tap empty page to clear the selection.
- Drag from a shape to move it. Drag from empty page to lasso, as today.
- Double-tap or double-click a shape to type in it.
- Long-press (touch) or right-click (mouse) opens the context menu: Cut, Copy, Paste, Duplicate, Delete, Edit Text, Bring to Front, Send to Back, Change Shape, Set as Default Shape, Format Shape.

**What a selected shape shows (Word / WPS look):**

- a frame that rotates with the shape
- 8 white resize handles: 4 corners and 4 edges
- a rotate handle above the top edge
- yellow adjustment handles from the preset (4.2)
- a line or arrow shows only its two end handles, plus any yellow handle (for example the bend of an elbow connector)

Handles are drawn about 12 px across but take touches over 44 px, on coarse pointers.

**Behaviour:**

- **Resize** keeps the opposite corner or edge fixed, also on a rotated shape. Shift (or the shape's "Lock aspect ratio") keeps proportions. Ctrl resizes from the centre. Dragging past the opposite edge flips the shape, as Word does. Outline width does **not** change with size (unlike today's lasso scaling).
- **Rotate**: free rotation. Shift snaps to 15° steps; touch snaps to 0°, 45° and 90° when within 3°. An angle badge shows while turning.
- **Adjustment handles** change the preset's values, clamped to the preset's own limits.
- **Two fingers** still pan and zoom while a shape is selected.

**Hit testing**, in the browser: `Path2D` with `isPointInPath` (shapes with a fill) or `isPointInStroke` with a tolerance of 8 screen px (shapes without a fill, lines). Text inside a shape also counts as a hit. The topmost shape wins. The point is first converted into the shape's own unrotated, unflipped coordinates. That conversion and the resize, rotate and flip maths go in `utils/shapes/shapeTransform.js` as pure functions with Node tests.

### 4.6 Format: fill, outline, effects, styles, size

The contextual bar (section 3) opens these menus. **Format Pane…** opens a side pane (laptop) or a full sheet (phone) with everything below, in WPS's tab order.

| Menu | Contents |
|---|---|
| **Fill** | No Fill; Theme Colors (10 columns: white, black and 8 accents, each with 5 lighter and darker shades); Standard Colors (10); Recent Colors; More Colors… (colour picker plus hex field); Eyedropper (only where the browser has it: Chrome and Edge on laptops); Transparency slider; Gradient (two colours and an angle) |
| **Outline** | No Outline; the same colour palette; Weight (¼, ½, ¾, 1, 1½, 2¼, 3, 4½, 6 pt, as Word labels them); Dashes (solid, round dot, square dot, dash, dash dot, long dash, long dash dot, long dash dot dot); for lines: Begin and End arrow (none, arrow, open arrow, stealth, diamond, oval) and arrow size |
| **Shape Effects** | Shadow only: no shadow, the outer-shadow presets, plus colour, transparency, blur, distance and angle |
| **Styles** | A gallery of 42 ready-made looks (7 colours × 6 styles, from "coloured outline" to "intense fill"), like WPS's shape styles |
| **Size & Properties** (pane only) | Height, width, rotation, Lock aspect ratio, position X and Y; text box options: vertical alignment, inner margins, Do not Autofit / Shrink text on overflow / Resize shape to fit text, wrap text in shape |

**Not included:** glow, soft edges, reflection, 3D bevel and rotation, picture or texture fill, WordArt. They are rarely needed on a study whiteboard and cost a lot. This list is here so their absence is a decision, not an oversight.

### 4.7 Arrange

| Command | Notes |
|---|---|
| Bring to Front, Bring Forward, Send Backward, Send to Back | Changes order in the array. Shapes always stay under ink (4.3). |
| Align Left, Center, Right, Top, Middle, Bottom | Relative to the selection (a whiteboard has no page edge to align to) |
| Distribute Horizontally / Vertically | Three or more shapes |
| Group (Ctrl+G), Ungroup (Ctrl+Shift+G) | A group moves, resizes and rotates as one |
| Rotate Right 90°, Rotate Left 90°, Flip Vertical, Flip Horizontal | |
| Change Shape | Swaps the preset and keeps size, rotation, style and text |
| Smart guides | While moving, snap to other shapes' edges and centres and show the guide line. Alt turns snapping off. |
| Multi-select | Shift+tap, a drag around shapes on empty page with the Select tool, or a lasso that encloses shapes |
| Copy and paste | Inside the Playground, also between pages |
| Convert to Shape | For freehand ink that was snapped to a line, triangle, rectangle or circle: turns it into an editable shape |

### 4.8 Text in shapes and text boxes

- Double-tap or double-click a shape, or press Enter or F2 with it selected, to type. A text field is laid over the text rectangle from 4.2, rotated with the shape.
- Display and export use the same line-wrapping function (`measureText`), so text breaks at the same place on screen, in SVG and in PNG/PDF.
- Font choices are a short list (sans, serif, monospace, handwriting-style). A web page cannot list the fonts installed on a device in every browser.
- While text is being typed, the single-key tool shortcuts (P H E L S M) and Delete must not act on the page.
- On phones this depends on handoff task B6 (keeping a field above the on-screen keyboard). Until B6 is done, the page pans so the shape sits in the top half of the screen when typing starts.

### 4.9 Lines, arrows and connectors

- Line-type presets (`line`, `straightConnector1`, `bentConnector3`, `curvedConnector3` and their arrow versions) are stored like other shapes, as a box plus flips, which is how Office stores them. The interface shows them as two end points.
- Arrowheads are computed as paths, not SVG markers, so export matches the screen.
- **Connectors that stay attached** (needed for flowcharts): while a line end is dragged, the connection points of nearby shapes appear. Releasing within 12 px attaches the end (`conn.start` or `conn.end`). Moving or resizing the shape then moves the attached end, and elbow connectors re-route.

### 4.10 Keyboard (laptops)

Delete or Backspace deletes. Arrow keys nudge 1 px (Shift: 10 px). Ctrl+D duplicates. Ctrl+C, Ctrl+X and Ctrl+V copy, cut and paste. Ctrl+G and Ctrl+Shift+G group and ungroup. Ctrl+Shift+> and Ctrl+Shift+< grow and shrink text. Tab moves to the next shape. Esc clears the selection. Shift and Ctrl while dragging behave as in 4.4 and 4.5.

### 4.11 Undo, saving, export, recognition

- **Undo:** history snapshots become `{ strokes, blocks, links, shapes }`, and `isSameSnapshot` compares `shapes` too. One drag, resize or rotate is one undo step, recorded on release. Slider changes settle with the existing 350 ms pause.
- **Saving:** `pages[i].shapes` is saved with the page. Older sessions without it load with `[]`. `estimateSessionChars` counts shapes (about 400 characters each, plus their text). Saving keeps its current rules: delayed, newer copy wins.
- **Export:** `pageSvg.js` writes shapes as real vector SVG under the ink. `exportEngine.js` draws them into PNG and PDF with `Path2D`. `getPageBounds` includes rotated corners, outline width and shadows. Painting order: shapes, then highlighter, then ink, then blocks, matching the screen.
- **Recognition:** shapes are not strokes, so they are never sent to the handwriting models. Ink written on top of a shape is read as usual. The maths model is not touched (handoff rule 1).
- **Eraser:** does not delete shapes (select and Delete instead), so a big shape cannot vanish by accident while erasing ink on it. See decision 4 in section 9.
- **Sync to Notes:** shapes are left out of the conversion for now.
- **Existing shape strokes:** library shapes already inserted by the uncommitted code stay on the page as ink. Nothing is lost.

---

## 5. Screenshot

### 5.1 The menu (WPS items, in WPS order)

| WPS item | What it does here |
|---|---|
| Rectangle Screenshot | Capture, then select a rectangle |
| Oval Screenshot | Capture, then select an ellipse. The result is a PNG that is transparent outside the oval. |
| Rounded rectangle screenshot | As above, with rounded corners |
| Polygon screenshot | Capture, then tap points. Tap the first point (or double-tap) to close the shape. |
| ✓ Screenshot (Ctrl+Alt+X) | The default mode used by the main button: a rectangle that can be adjusted before finishing, as in WPS |
| Hide Current Window During Screenshot (Ctrl+Alt+C) | A web page cannot hide or minimise its own browser window. Instead, after you choose what to share, a 3-second countdown runs so you can switch to the window you want. Then the frame is taken. (Choosing a single window in the browser's picker also works, and needs no hiding.) |
| Screen Grab Main Window | Captures the **Playground view itself**: ink, shapes and blocks as currently shown, without the toolbars. No browser permission prompt. Works on every device. |

The shortcuts work only while the Playground has focus; a web page cannot register system-wide shortcuts. They do nothing while typing in a field, because on some keyboard layouts Ctrl+Alt is the AltGr key, which types letters.

### 5.2 How a capture works (laptops)

1. The browser asks what to share (screen, window or tab) through `navigator.mediaDevices.getDisplayMedia`. The prompt is the browser's own and cannot be skipped. It needs a secure page (HTTPS or localhost).
2. One frame is taken and sharing stops at once, so the browser's "sharing" bar disappears.
3. The frame is shown full screen, frozen, with everything outside the selection dimmed.
4. You draw the region in the chosen shape. It can then be moved and resized with 8 handles. Its size in pixels is shown. On touch, a magnifier appears beside the finger.
5. A small bar under the region offers: Rectangle, Ellipse, Arrow, Pen, Text and Mosaic (blur) for marking up, Undo, **Copy** (to the clipboard), **Save** (download PNG), **Cancel** and **Finish ✓**.
6. Finish inserts the result as a picture block, using the existing `prepareImage` and `fitImageBox` (pictures are scaled to 1600 px).

### 5.3 Phones and tablets

Mobile Safari (iPhone, iPad) and Chrome on Android do not offer screen capture to web pages. On those devices the menu shows what does work, and the crop shapes (rectangle, oval, rounded, polygon) apply to all of it:

- **Screen Grab Main Window**: capture the Playground view
- **From Photos**: pick a screenshot taken with the device's own buttons
- **Paste**: paste a copied image. Ctrl+V already inserts pasted pictures (`PlaygroundCanvasContainer.js`, the paste handler); this adds the crop step and a menu item for touch.

The choice is made by checking whether the browser has `getDisplayMedia`, not by guessing the device from its name.

### 5.4 Files

`utils/screenCapture.js` (grab one frame, Playground view capture, crop and mask: pure geometry with Node tests), `components/screenshot/ScreenshotOverlay.js` (region editor and markup bar), `components/screenshot/ScreenshotMenu.js`.

---

## 6. Symbol

### 6.1 The menu (as in WPS)

- **Recently Used Symbols**: the last 20 inserted, saved on this device.
- **Custom Symbols**: starts with the WPS set from the reference screenshot:
  `＋ — × ÷ ㎏ ㎜ ㎝ ㎡ ɑ ɡ α β θ ℃ 〖 ｛ © ® @ & ＊ # ％ ‰ ＄ ￥ § ¦ ※ ◎ ≈ … ≤ ≥ ≦ ≧ □ ☑ ☒`.
  (kg, mm, cm and m² in WPS are single characters: ㎏ ㎜ ㎝ ㎡.) You can add and remove symbols from More Symbols.
- **More Symbols…**: the dialog in 6.2.
- **Number**: the dialog in 6.3.

Each cell is 44 px on touch screens and shows the symbol's name as a tooltip on a laptop.

### 6.2 More Symbols dialog

- **Symbols tab**: font (short list, see 4.8); subset (Unicode blocks: Basic Latin, Latin-1 Supplement, Greek and Coptic, Cyrillic, General Punctuation, Superscripts and Subscripts, Currency Symbols, Letterlike Symbols, Number Forms, Arrows, Mathematical Operators, Miscellaneous Technical, Enclosed Alphanumerics, Box Drawing, Geometric Shapes, Miscellaneous Symbols, Dingbats, Supplemental Arrows, CJK Symbols and Punctuation, CJK Compatibility, and others); a scrolling grid; a recently-used row; the selected character's name and code; a **Character code** field that accepts `2211`, `U+2211` or a decimal number; a **search box** that finds symbols by name ("integral", "arrow", "degree"); **Insert**; **Add to Custom Symbols**.
- **Special Characters tab**: em dash, en dash, non-breaking space, non-breaking hyphen, soft hyphen, ©, ®, ™, §, ¶, …, single and double quotation marks, em space, en space, ¼ em space, zero-width space and the rest of WPS's list, each with its name.
- **Data**: a developer script builds `utils/symbols/symbolData.generated.js` from the Unicode Character Database (its licence allows this): about 2,000 characters with names, loaded only when the dialog opens.
- **Phone**: a full-screen sheet. Search sits at the top, since scrolling a grid is slow with a finger.

### 6.3 Number dialog

Type a number and pick a format, as in WPS. The preview shows the result before inserting:

`1, 2, 3…` · `①, ②, ③…` (1 to 50) · `⑴, ⑵, ⑶…` (1 to 20) · `⒈, ⒉, ⒊…` (1 to 20) · `Ⅰ, Ⅱ, Ⅲ…` · `ⅰ, ⅱ, ⅲ…` · `A, B, C…` · `a, b, c…` · `一, 二, 三…` · `壹, 贰, 叁…` · `甲, 乙, 丙…` · `子, 丑, 寅…`

Numbers outside a format's range show a short message instead of a wrong character. The conversion goes in `utils/symbols/numberFormats.js`, with Node tests.

### 6.4 Where a symbol goes

1. **Into the text field you were last typing in**, at the cursor: an equation block, a theory block, a picture caption or text in a shape. The Playground remembers the last focused field and its cursor position, so tapping the toolbar does not lose them. React-controlled fields need the native value setter plus an `input` event so React sees the change (`utils/symbols/insertAtCaret.js`).
2. **Into an equation being edited**, a symbol goes in as its LaTeX command where one exists (α becomes `\alpha`, ≤ becomes `\le`).
3. **If no field was in use**, a new Text Box (4.4) is created in the middle of the view, holding the symbol, with the cursor after it, so typing can continue.

---

## 7. Equation

### 7.1 The menu (as in WPS)

- **Insert New Equation**: a new equation block, open in the visual editor (7.2).
- **Insert LaTeX**: a dialog (7.3).
- **Common Equations ›** **Math**, **Physics**, **Chemistry**: each opens a scrolling gallery of named, rendered equations, as in the reference screenshot. Tapping one inserts it as an equation block.
- WPS's greyed-out "Equation Editor (Legacy)" is left out: it needs an old desktop add-on and cannot work here.

### 7.2 The visual equation editor

Typing LaTeX by hand is the current editor (`EquationBlock.js`). WPS and Word use a visual editor: you pick a fraction or an integral and type into its boxes. Handoff task C9 asks for the same, because LaTeX is especially hard on a phone.

**Proposal: use MathLive** (`mathlive`, MIT licence, pin `0.111.0`). It is a web component, `<math-field>`, that edits maths visually, reads and writes LaTeX, supports fill-in boxes, and has its own on-screen maths keyboard for touch screens. It is loaded only when an equation editor opens (dynamic `import()`, browser only), so the Playground does not get slower to open. Its fonts are copied into `public/` so the editor works offline, and its sounds are switched off.

On top of it, an **equation ribbon** like WPS's Equation Tools tab. It is a bar above the block on a laptop, and a sheet above MathLive's keyboard on a phone.

| Group | Contents |
|---|---|
| Tools | Professional / Linear (shows the LaTeX source), Normal Text |
| Symbols | Basic Math, Greek Letters, Letter-Like Symbols, Operators, Arrows, Negated Relations, Scripts, Geometry |
| Fraction | Stacked, skewed, linear, small; common fractions (dy/dx, ∂y/∂x, π/2…) |
| Script | Superscript, subscript, both, left scripts; common (x², e^−iωt…) |
| Radical | Square root, nth root, cube root; common (√(b²−4ac)…) |
| Integral | ∫ ∬ ∭ ∮ with and without limits; differentials (dx, dy, dθ) |
| Large Operator | ∑ ∏ ∐ ⋃ ⋂ ⋁ ⋀, limit positions; common examples |
| Bracket | ( ) [ ] { } ⟨ ⟩ \| \| ‖ ‖ ⌊ ⌋ ⌈ ⌉, cases, binomial, separators |
| Function | sin, cos, tan, csc, sec, cot, inverse and hyperbolic forms; common examples |
| Accent | Dot, double dot, hat, check, acute, grave, breve, tilde, bar, double bar, over and under braces, vector arrow, boxed formula |
| Limit and Log | log with base, log, lim, min, max, ln; common (lim n→∞ (1 + 1/n)ⁿ…) |
| Operator | :=, ==, +=, −=, ≝, ≜, arrows with text above or below |
| Matrix | 1×2, 2×1, 1×3, 3×1, 2×2, 2×3, 3×2, 3×3, dots (⋯ ⋮ ⋱), identity matrices, with round or square brackets |

Each template is LaTeX with fill-in boxes (`\frac{#?}{#?}`), inserted at the cursor with `mathfield.insert()`. The list goes in `utils/equations/equationTemplates.js`.

### 7.3 Insert LaTeX

A dialog with a LaTeX text area, a live KaTeX preview, a clear message when the LaTeX is invalid, and a few examples. **Insert** creates an equation block. The current typed editor stays available as the "Linear" view (7.2), so nothing that works today goes away.

### 7.4 Common Equations

`utils/equations/commonEquations.js`, one list per category: name plus LaTeX.

- **Math**, in WPS's order from the reference screenshot: Quadratic Formula, Binomial Theorem, Pythagorean Theorem, Law of Sines, Law of Cosines, Circumference of a Circle, Trig Identity 1, Trig Identity 2, then the rest of WPS's list (Word adds Area of a Circle, Expansion of a Sum, Fourier Series, Taylor Expansion).
- **Physics** and **Chemistry**: copied from WPS's own lists (decision 5 in section 9).
- Chemistry equations use KaTeX's `mhchem` extension (`\ce{…}`, already installed with KaTeX). MathLive cannot edit `\ce{}`, so a chemistry equation opens in the LaTeX view when edited.

### 7.5 Changes to the equation block

- View mode stays KaTeX, with display style for new equations, so fractions are full size, as in WPS.
- Edit mode uses MathLive in place of the text input, with the ribbon.
- "Plot Graph", the AI actions and variables (`scopeManager`) all read the block's `latex` string. MathLive writes its own LaTeX style (`\left(`, `\cdot`, `\frac{}{}` and so on), so `latexEvaluator.js` and `equationToGraph.js` must accept it. Add MathLive-style cases to `test_latex_evaluator.mjs` and the graph tests before switching the editor.
- Handwriting recognition and the maths model are not touched (handoff rule 1).

---

## 8. Build order

Each step ends with the handoff's definition of done: lint clean, all logic tests pass, `node run-all.mjs` passes, new browser checks pass including at 390 × 844 with touch, `npm run build` succeeds, and handoff sections 5 and 6 are updated. Sizes are relative: S is small, M is medium, L is large.

| Step | Size | What | Done when |
|---|---|---|---|
| **0. Toolbar** | S | Insert group with the four WPS menus, at all three screen sizes (section 3). Items not built yet are left out, not shown disabled. | `screens.mjs`: 0 off screen and 0 under 44 px at 390, 844, 820 and 1366 px wide, and at 1100 px. New `insert-menus.mjs` opens every menu with touch and with the mouse. |
| **1. Shapes: core** | L | Generator script, evaluator, shape object, shape layer, insert (drag, tap, Shift, Ctrl), select, move, 8-handle resize, rotate, yellow handles, delete, duplicate, undo, saving, SVG/PNG/PDF export, basic fill and outline colour. The stroke-based insert code is replaced. | `test_shape_geometry.mjs`: all 187 presets give valid paths (no NaN) at 1×1, 100×100 and 400×50, and each handle stays inside its limits. `test_shape_transform.mjs`: rotated resize keeps the opposite corner fixed; hit tests. `shapes.mjs` in the browser: insert, move, resize, rotate, adjust, undo and redo, reload keeps shapes, with mouse, touch and pen, at phone size. `test_page_export.mjs` covers shapes. Pen still draws over a shape. |
| **2. Shapes: format and text** | L | Contextual bar, Fill, Outline (weights, dashes, arrowheads), Shadow, Styles gallery, Format Pane (size, rotation, lock ratio, position, text options), text in shapes, Text Box, context menu, Set as Default Shape. | Browser checks for each menu at laptop and phone size. Text wraps the same on screen and in exported SVG and PNG. Typing in a shape never triggers tool shortcuts. |
| **3. Symbol** | M | Menu, recent and custom symbols, More Symbols (tabs, subsets, search, character code), Number dialog, insert at cursor or into a new text box. | `test_symbols.mjs` (number formats, character-code parsing, LaTeX mapping). `symbols.mjs`: a symbol lands at the cursor in an equation block, a theory block and shape text, and a new text box appears when no field was in use; with touch at phone size. |
| **4. Equation** | L | MathLive editor (lazy-loaded), equation ribbon, Insert LaTeX dialog, Common Equations (Math, Physics, Chemistry). | `equations.mjs`: build a fraction and an integral from the ribbon by touch at phone size; Common Equations insert correctly rendered blocks; Plot Graph works on a MathLive-made equation. The first Playground visit downloads no MathLive code (network log). The editor opens offline after one online visit. |
| **5. Screenshot** | M | Menu, capture (laptop), Playground-view capture (all devices), From Photos, Paste, region editor in four shapes, markup bar, Copy, Save, Finish. | `test_screenshot_crop.mjs` (oval, rounded and polygon masks; screen-pixel mapping). `screenshot.mjs`: the crop step on an injected image in all four shapes with touch; Playground-view capture at phone size. A real screen capture is tried with Chrome's auto-accept flags; if headless Chrome cannot capture a screen, that one item is checked by hand and the result written down. |
| **6. Shapes: arrange** | L | Z-order, align, distribute, group, rotate and flip commands, Change Shape, multi-select, smart guides, keyboard commands, copy and paste, Convert to Shape, connectors that stay attached. | Browser checks for each command. A connected flowchart (3 shapes, 2 connectors) keeps its connectors attached while shapes are moved, at phone and laptop size. |

**Order:** steps 1 and 2 come first because they are what the owner noticed. Symbol (step 3) needs the Text Box from step 2. Equation (4) and Screenshot (5) do not depend on shapes, so they can be swapped or done in parallel. Step 6 is last because it is the largest and least urgent.

**New files** (all under `src/app/(Primary.pages)/Playground/` unless stated):

- `scripts/build-preset-shapes.mjs` and `scripts/build-symbol-data.mjs` (project root)
- `utils/shapes/`: `presetShapes.generated.js`, `presetEvaluator.js`, `shapeModel.js`, `shapeTransform.js`, `shapeSvg.js`
- `components/shapes/`: `ShapeLayer.js`, `ShapeSelectionOverlay.js`, `ShapeGallery.js` (moved out of the dock), `ShapeFormatBar.js`, `FormatShapePane.js`, `ColorPicker.js`
- `components/screenshot/`, `components/symbols/`, `components/equation/`, and `utils/screenCapture.js`, `utils/symbols/`, `utils/equations/`
- tests: `test_shape_geometry.mjs`, `test_shape_transform.mjs`, `test_symbols.mjs`, `test_screenshot_crop.mjs` (project root); `tests/browser/insert-menus.mjs`, `shapes.mjs`, `symbols.mjs`, `equations.mjs`, `screenshot.mjs`

**Changed files:** `PlaygroundDock.js`, `PlaygroundCanvasContainer.js` (shapes state, history, saving, keyboard), `WhiteboardCanvas.js` (input routing by tool), `EquationBlock.js`, `pageSvg.js`, `exportEngine.js`, `historyStack.js`, `smartBlockStore.js` (size estimate). `utils/shapeLibrary.js` is replaced by `utils/shapes/`.

---

## 9. Decisions for the owner

The plan assumes the **recommended** answer to each of these. Say if any should change.

1. **Shapes under the ink, so you can write on them?** Recommended: yes (4.3). The alternative puts shapes above ink, like blocks, so ink cannot cover them.
2. **Add MathLive** (MIT licence, loaded only when the equation editor opens) for the WPS-style visual equation editor? Recommended: yes. Without it, the visual editor has to be written from scratch, which is several times the work of step 4.
3. **Screenshots on phones and tablets:** mobile browsers do not let web pages capture the screen. Is it acceptable to offer Playground-view capture, From Photos and Paste there (5.3)? Recommended: yes. There is no browser workaround.
4. **Should the eraser delete shapes?** Recommended: no; select and Delete instead (4.11).
5. **Physics and Chemistry lists:** please send screenshots of WPS's Common Equations › Physics and › Chemistry fly-outs (scrolled to the end), so they can be copied exactly. The Math list is already in your screenshot.
6. **"Hide Current Window During Screenshot"** as a 3-second countdown after choosing what to share (5.1): acceptable?
7. **The uncommitted shape code:** replace its stroke-based insert with shape objects, keeping the gallery and preview (section 2)? Recommended: yes.

---

## 10. Risks

- **Toolbar width on laptops** between 1100 and 1366 px (section 3). Measured in step 0, with a fallback ready.
- **MathLive size and offline use.** It must stay out of the first page load, and its fonts must be cached for offline use. Checked in step 4.
- **LaTeX from MathLive** differs from hand-typed LaTeX. The evaluator and graph code must accept it before the editor switches (7.5).
- **Typing in shapes on phones** depends on handoff task B6 (the on-screen keyboard), which needs a real device.
- **Real devices.** As with Phase B, emulated touch in desktop Chrome cannot show Safari's behaviour, a real on-screen keyboard or real speed. The handoff's B10 device list applies to these tools too.
- **Many shapes on one page.** The shape layer skips off-screen shapes. `perf.mjs` gets a shapes case (1,000 shapes) in step 1.
- **Licence check** for the Office shape definitions file (4.2), once, before release.

---

## 11. Progress

Updated 2026-10-16. Steps 0 to 3 are built and checked in a real browser (headless Chrome, mouse, emulated touch and pen, development build). Steps 4 to 6 are next.

### Done

| Step | What was built | Checked by |
|---|---|---|
| 0. Toolbar | Insert group in WPS order: **Picture · Shapes · Symbol** on laptops; one **Insert** button on tablets; an **Insert** row in the phone's More Tools sheet. The dock now keeps clear of the app's left sidebar (collapsed or open) and folds itself when its buttons do not fit: first the text labels go, then the three zoom buttons become one, then less-used tools move to More. Measured: 0 buttons off screen and none under the sidebar at every width from 640 to 1920 px. | `insert-shapes.mjs`, `insert-symbols.mjs`, `screens.mjs` |
| 1. Shapes: core | All **187 Office preset shapes** from `presetShapeDefinitions.xml` (generator `scripts/build-preset-shapes.mjs`, evaluator `utils/shapes/presetEvaluator.js`), the gallery in WPS categories with Recently Used Shapes, drawing by drag (Shift: equal sides or 15° lines; Ctrl: from the centre) or by tap, the shape layer under the ink, Word-style handles (8 resize, rotate with 15° Shift steps and a 45° pull on touch, yellow adjustment handles, line ends), move, delete, duplicate, one undo step per drag, saving per page, vector SVG and PNG/PDF export. | `test_shape_geometry.mjs` (43), `test_shape_transform.mjs` (72), `insert-shapes.mjs` (54) |
| 2. Shapes: format and text | Floating format bar (WPS Drawing Tools): Shape Styles (42), Fill (Office palette, transparency), Outline (colour, 9 weights, 8 dashes, 6 arrowheads at each end), Shape Effects (9 outer shadows), Text (size, bold, italic, underline, colour, alignment), Arrange (layer order, rotate 90°, flip), Duplicate, Delete, Format Shape pane (Fill & Line with gradient, Effects, Size & Properties, Text with autofit and margins). Typing in shapes (double click or double tap, Enter, F2), Text Box (grows with its text; an empty one is removed), the shape menu (right-click, long press), cut, copy, paste, Set as Default Shape. On phones the bar has five buttons (Styles, Fill, Outline, Text, More), menus are bottom sheets of at most 60% of the screen and the page moves the shape into view above them. | `test_shape_text.mjs` (49), `insert-shapes-format.mjs` (41) |
| 3. Symbol | The WPS menu (Recently Used Symbols, Custom Symbols with WPS's set, More Symbols..., Number); More Symbols with 4,296 characters in 31 Unicode subsets (generator `scripts/build-symbol-data.mjs`, Unicode 18.0, loaded only when the dialog opens), search by name or code, character code (hex or decimal), Add to Custom Symbols, Special Characters (Word's 20); Number with 12 styles. A symbol goes where the cursor was: shape text, a block's field, an equation as LaTeX (α as `\alpha`), or a new text box when there is no cursor. | `test_symbols.mjs` (73), `insert-symbols.mjs` (35) |

### Decided while building

- **Font choice in More Symbols left out.** A web page cannot list the fonts on a device, and an inserted symbol takes the font of the text it goes into.
- **Shapes are selected with the Select (lasso) tool**; the pen, highlighter and eraser always write or rub out over them (handoff rule 2). The eraser never deletes shapes (decision 4).
- **Copy and paste, Shift+click to add to a selection, and layer order** were built in step 2 rather than step 6, because the format bar and shape menu needed them.
- **Toolbar labels** show from about 1,440 px; below that the Insert buttons are icons with tooltips.

### Problems found and fixed on the way (existing code)

- The uncommitted shape work had removed the `zoomAtPoint` import: zoom buttons and Ctrl+wheel would have crashed.
- Phone bottom sheets in the dock were placed against the dock, not the screen (the dock was centred with a CSS transform), and the floating music player covered them.
- Menus opened from the dock or the format bar showed under a block being edited, so a click went to the block.
- The dock ran under the left sidebar at 1366 px and below, and buttons were off screen at 1100 to 1280 px.

### Still to do

- **Step 4, Equation**: MathLive editor with the equation ribbon, Insert LaTeX, Common Equations. The data (`utils/equations/equationTemplates.js`, `commonEquations.js`) and its test (`test_equations.mjs`, 14) are written. Physics and Chemistry lists are provisional until WPS's lists arrive (decision 5).
- **Step 5, Screenshot.**
- **Step 6, Arrange**: align, distribute, group, smart guides, Change Shape, Convert to Shape, connectors that stay attached, lasso around shapes.
- Nothing has been tried on a real phone, tablet or stylus.
