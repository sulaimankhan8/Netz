# NETZ — Polyglot Code Export & WebWorker Watchdog Implementation Plan

> **Document Status**: Production Architecture & Technical Specification  
> **Target Features**: Polyglot Code Export (Python / MATLAB / C++ / JavaScript) & WebWorker Watchdog Engine (Background Math Execution + Non-Convergence Guard)

---

## 1. Executive Summary & Objectives

This implementation plan details two high-impact upgrades to the **NETZ Numerical Engine**:

1. **Polyglot Code Export Engine (`codeExportEngine.js` + `CodeExportPanel.js`)**:
   - Automatically generates idiomatic, copy-pasteable, verified source code in **Python (NumPy)**, **MATLAB (.m)**, **C++17**, and **JavaScript (ES6)**.
   - Pre-populates the generated code with the user's active mathematical expression, interval/initial guesses, tolerance, and maximum iterations.
   - Provides 1-click **"Copy Code"** and **"Download Script"** buttons for direct assignment and lab report submission.

2. **WebWorker Watchdog Engine (`algorithmWorker.js` + `useAlgorithmWorker.js`)**:
   - Offloads CPU-intensive numerical iteration loops from the main UI thread to a dedicated background Web Worker thread.
   - Enforces a **$4000\text{ ms}$ Watchdog Timer**: Automatically terminates worker execution (`worker.terminate()`) if non-converging, oscillating, or asymptotic functions trigger an infinite loop.
   - Prevents the browser from freezing ("Page Unresponsive") and surfaces clean diagnostic guidance.

---

## 2. Technical Architecture & Data Flow

```
                      [User Interface: Algorithm Pages / Notes Widget]
                                    │               │
                 Run Calculation    │               │  Click "Export Code"
                                    ▼               ▼
                 [useAlgorithmWorker Hook]    [CodeExportPanel Modal]
                        │                           │
         ┌──────────────┴──────────────┐            │ Requests Code
         ▼                             ▼            ▼
  [4s Watchdog Timer]          [algorithmWorker.js] [codeExportEngine.js]
         │ (if timeout)                │            (Python/MATLAB/C++/JS)
         ▼                             ▼                    │
  worker.terminate()          solveAlgorithm(params)        │
         │                             │                    ▼
         ▼                             ▼            Pre-filled Script Display
  Graceful Timeout UI        Results / Steps Table   & 1-Click Download (.py, .m, .cpp)
```

---

## 3. Detailed Component Specifications

### 3.1 Code Export Engine (`src/app/utils/codeExportEngine.js`)

A universal generator library that accepts `(algorithmId, params)` and returns formatted code strings for all 4 target languages.

#### Supported Algorithms & Categories:
* **Unit 1 (Roots of Equations)**: Bisection, False Position, Newton-Raphson, Fixed-Point Iteration, Secant Method.
* **Unit 2 (Interpolation & Curve Fitting)**: Newton Forward/Backward/Divided, Lagrange, Least Squares, Line & Parabola Fitting.
* **Unit 3 (Numerical Calculus)**: Numerical Differentiation, Trapezoidal Rule, Simpson's 1/3, Simpson's 3/8, Boole's Rule, Weddle's Rule, Gauss Quadrature.
* **Unit 4 (Linear Systems & Matrices)**: Gauss Elimination (with partial pivoting), Gauss-Jordan, LU Decomposition (Doolittle), Jacobi Method, Gauss-Seidel Method.
* **Unit 5 (ODEs & Statistics)**: Taylor's Series, Euler's Method, Modified Euler, Runge-Kutta 4th Order, Chi-Square, t-Test, F-Test.

#### Language Template Characteristics:
1. **Python (`.py`)**:
   - Uses `math` and `numpy`.
   - Function definitions with descriptive docstrings.
   - Iteration loop with tabular formatting: `print(f"{k:3d} | {x:10.6f} | {f(x):10.6f}")`.
2. **MATLAB (`.m`)**:
   - Clean anonymous function syntax: `f = @(x) ...`.
   - Loop with `fprintf('%3d | %10.6f | %10.6f\n', k, x, fx)`.
   - Plots convergence curve using `semilogy(errors)`.
3. **C++ (`.cpp`)**:
   - Modern C++17 with `#include <iostream>`, `#include <cmath>`, `#include <iomanip>`.
   - Clean typed functions (`double f(double x)`, `void solve()`).
   - Formatted stream output using `std::setprecision` and `std::fixed`.
4. **JavaScript (`.js`)**:
   - Standard ES6 exportable function.
   - Standalone console test script runnable via `node script.js`.

---

### 3.2 Code Export Modal / Panel (`src/app/components/CodeExportPanel.js`)

A modal component matching the NETZ Notion and Editorial design systems:
* **Props**:
  - `isOpen`: boolean
  - `onClose`: function
  - `algorithmId`: string (e.g. `'bisection-method'`)
  - `algorithmName`: string (e.g. `'Bisection Method'`)
  - `params`: object with current inputs (expression, bounds, tolerance, maxIter)
* **Features**:
  - **Language Selector Bar**: Tabs for `Python`, `MATLAB`, `C++`, and `JavaScript` with corresponding file extensions.
  - **Code Viewer**: Monospace font with line numbers, dark code theme, and proper indentation.
  - **Copy to Clipboard**: Instant copy with visual feedback ("Copied to Clipboard!").
  - **Download File**: Direct file download with appropriate mime type and extension (`.py`, `.m`, `.cpp`, `.js`).

---

### 3.3 Dedicated Web Worker (`src/app/utils/workers/algorithmWorker.js`)

A standalone worker script:
```javascript
import { solveAlgorithm } from '../algorithmSolvers';

self.onmessage = function (e) {
  const { id, algorithmId, params } = e.data;
  
  try {
    const startTime = performance.now();
    const result = solveAlgorithm(algorithmId, params);
    const executionTimeMs = performance.now() - startTime;

    self.postMessage({
      id,
      status: 'success',
      result,
      executionTimeMs
    });
  } catch (err) {
    self.postMessage({
      id,
      status: 'error',
      error: err.message || 'Numerical execution failed.'
    });
  }
};
```

---

### 3.4 Worker Watchdog Hook (`src/app/hooks/useAlgorithmWorker.js`)

A custom React hook managing the background worker pool and watchdog timer:
```javascript
export function useAlgorithmWorker() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Initialize or re-create worker on demand
  const getWorker = () => {
    if (!workerRef.current && typeof Worker !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../utils/workers/algorithmWorker.js', import.meta.url)
      );
    }
    return workerRef.current;
  };

  const execute = useCallback((algorithmId, params, options = { timeoutMs: 4000 }) => {
    return new Promise((resolve, reject) => {
      setIsRunning(true);
      setError(null);

      const worker = getWorker();
      if (!worker) {
        // Fallback to synchronous execution if Web Workers are not available
        try {
          const syncResult = runSyncSolver(algorithmId, params);
          setIsRunning(false);
          return resolve(syncResult);
        } catch (e) {
          setIsRunning(false);
          setError(e.message);
          return reject(e);
        }
      }

      const requestId = 'req_' + Date.now();

      // Arm the 4-second Watchdog Timer
      timeoutRef.current = setTimeout(() => {
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null; // Forces re-instantiation on next run
        }
        setIsRunning(false);
        const timeoutMsg = 'Calculation timed out: The function did not converge within 4 seconds. Check your interval, initial guesses, or function continuity.';
        setError(timeoutMsg);
        reject(new Error(timeoutMsg));
      }, options.timeoutMs);

      // Handle worker response
      const handleMessage = (e) => {
        if (e.data.id === requestId) {
          clearTimeout(timeoutRef.current);
          worker.removeEventListener('message', handleMessage);
          setIsRunning(false);

          if (e.data.status === 'success') {
            resolve(e.data.result);
          } else {
            setError(e.data.error);
            reject(new Error(e.data.error));
          }
        }
      };

      worker.addEventListener('message', handleMessage);
      worker.postMessage({ id: requestId, algorithmId, params });
    });
  }, []);

  return { execute, isRunning, error };
}
```

---

## 4. File-by-File Implementation Steps

### Phase 1: Polyglot Code Export Engine
1. **`src/app/utils/codeExportEngine.js`**:
   - Implement root-finding code generators (Bisection, False Position, Newton-Raphson, Secant, Iteration).
   - Implement interpolation & regression generators (Newton, Lagrange, Least Squares).
   - Implement numerical integration generators (Trapezoidal, Simpson 1/3 & 3/8, Gauss Quadrature).
   - Implement matrix & ODE generators (Gauss Elimination, LU, Runge-Kutta 4th, Euler).
2. **`src/app/components/CodeExportPanel.js`**:
   - Create tabbed interface with language-specific syntax formatting.
   - Implement copy and download handlers.
3. **Integration into Algorithm Pages**:
   - Add `<EditorialButton onClick={() => setIsExportOpen(true)}>Export Code</EditorialButton>` to each algorithm page's action bar.
   - Mount `<CodeExportPanel />` passing active inputs and algorithm metadata.
4. **Integration into Notes Math Widget**:
   - Add a `<CodeExportPanel />` trigger inside [`EmbeddedMathWidget.js`](file:///c:/Users/Sulaiman/Desktop/netznew/Netz/src/app/(Primary.pages)/Notes/components/EmbeddedMathWidget.js).

---

### Phase 2: WebWorker Watchdog Engine
1. **`src/app/utils/workers/algorithmWorker.js`**:
   - Wrap solvers from `algorithmRegistry.js` or `evaluateMath.js` inside worker message listener.
2. **`src/app/hooks/useAlgorithmWorker.js`**:
   - Implement worker lifecycle, request ID tracking, message listener, and $4\text{s}$ timeout guard.
   - Add synchronous fallback for non-worker environments.
3. **Refactor Algorithm Solvers to use Hook**:
   - In `algorithems.bisection-method.js` (and other solvers), replace direct synchronous solver call with `execute('bisection', params)`.
   - Display a responsive spinner while `isRunning` is true.
   - Catch and render watchdog timeout errors gracefully in the alert banner.

---

## 5. Verification & Testing Protocol

| Test Case | Procedure | Expected Outcome |
| :--- | :--- | :--- |
| **Normal Convergence** | Run Bisection with $f(x) = x^3 - 4x - 9$ on $[2, 3]$ | Completes in $< 50\text{ ms}$, renders iteration table with root $\approx 2.7065$. |
| **Watchdog Timeout** | Run Fixed-Point Iteration with diverging $g(x) = 2x^2 + 1, x_0 = 5$ | Watchdog triggers at exactly $4000\text{ ms}$, UI never freezes, shows clear timeout alert. |
| **Asymptotic Division** | Run Bisection with $f(x) = \frac{1}{x - 2}$ on $[1, 3]$ | Terminates cleanly without hanging browser tab. |
| **Python Export Accuracy** | Export Bisection code $\rightarrow$ execute in Python 3 | Runs without syntax error, prints correct root and iteration count. |
| **MATLAB Export Accuracy** | Export Simpson 1/3 code $\rightarrow$ run in MATLAB / Octave | Executes and prints correct integral approximation. |
| **C++ Export Accuracy** | Export Runge-Kutta 4th code $\rightarrow$ compile with `g++ -std=c++17` | Compiles clean with 0 warnings, outputs identical values to web UI. |
| **Script Download** | Click "Download .py" and "Download .m" | Browser downloads correctly named files (`bisection_method.py`, `bisection_method.m`). |

---

## 6. Milestone Schedule

* **Milestone 1**: `codeExportEngine.js` with all 4 language templates for Units 1–5 algorithms.
* **Milestone 2**: `CodeExportPanel.js` UI modal with copy, syntax view, and script download.
* **Milestone 3**: `algorithmWorker.js` and `useAlgorithmWorker.js` hook with $4\text{s}$ watchdog.
* **Milestone 4**: Connect to Algorithm Pages and Notes Embedded Math Widget.
