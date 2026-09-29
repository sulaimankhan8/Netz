'use client';

import { useState } from 'react';
import KaTeXRenderer from './KaTeXRenderer';
import { 
  FaQuestionCircle, 
  FaCheck, 
  FaTimes, 
  FaEdit, 
  FaEye, 
  FaChevronDown, 
  FaChevronUp, 
  FaRedo,
  FaLightbulb,
  FaPlus,
  FaTrash
} from 'react-icons/fa';

export default function QuizBlock({ block, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [numericInput, setNumericInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const config = block?.quizConfig || {
    question: 'What is the order of convergence for the Newton-Raphson method?',
    mode: 'mcq',
    options: [
      'Linear (Order 1)',
      'Quadratic (Order 2)',
      'Superlinear (Order 1.618)',
      'Cubic (Order 3)'
    ],
    correctOptionIndex: 1,
    correctNumericValue: 2.7065,
    tolerance: 0.001,
    explanation: 'The Newton-Raphson method exhibits quadratic convergence (order 2) near a simple root because the error term satisfies: |e_{n+1}| \\approx \\frac{|f\'\'(\\alpha)|}{2|f\'(\\alpha)|} |e_n|^2'
  };

  const handleConfigChange = (updates) => {
    onUpdate({
      ...block,
      quizConfig: {
        ...config,
        ...updates
      }
    });
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...(config.options || [])];
    updated[idx] = val;
    handleConfigChange({ options: updated });
  };

  const handleAddOption = () => {
    const current = config.options || [];
    if (current.length >= 6) return;
    handleConfigChange({ options: [...current, `Option ${current.length + 1}`] });
  };

  const handleRemoveOption = (idx) => {
    const current = config.options || [];
    if (current.length <= 2) return;
    const filtered = current.filter((_, i) => i !== idx);
    let newCorrect = config.correctOptionIndex;
    if (newCorrect >= filtered.length) newCorrect = filtered.length - 1;
    handleConfigChange({ options: filtered, correctOptionIndex: newCorrect });
  };

  const handleSubmitMcq = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === config.correctOptionIndex;
    setIsCorrect(correct);
    setHasSubmitted(true);
    if (correct) setShowExplanation(true);
  };

  const handleSubmitNumeric = () => {
    const val = parseFloat(numericInput);
    if (isNaN(val)) return;
    const tol = config.tolerance !== undefined ? config.tolerance : 0.001;
    const target = config.correctNumericValue;
    const correct = Math.abs(val - target) <= tol;
    setIsCorrect(correct);
    setHasSubmitted(true);
    if (correct) setShowExplanation(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setNumericInput('');
    setHasSubmitted(false);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  return (
    <div className="my-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden text-neutral-900 dark:text-slate-100 font-sans transition-all hover:border-indigo-400 dark:hover:border-indigo-500/40">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-slate-950/80 border-b border-neutral-200 dark:border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FaQuestionCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center space-x-1.5">
              <span>Interactive Knowledge Check</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono">
                {config.mode === 'mcq' ? 'Multiple Choice' : 'Numeric Calculation'}
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasSubmitted && (
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
              isCorrect 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' 
                : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
            }`}>
              {isCorrect ? <FaCheck className="w-2.5 h-2.5" /> : <FaTimes className="w-2.5 h-2.5" />}
              <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </span>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title={isEditing ? 'Save and preview test' : 'Edit question & answers'}
          >
            {isEditing ? <FaEye className="w-3 h-3" /> : <FaEdit className="w-3 h-3" />}
            <span className="text-[11px]">{isEditing ? 'Preview Mode' : 'Edit Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* AUTHOR / EDIT MODE */}
        {isEditing ? (
          <div className="space-y-4 bg-neutral-50 dark:bg-slate-950/50 p-4 rounded-xl border border-neutral-200 dark:border-slate-800">
            {/* Mode Switcher */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-neutral-600 dark:text-slate-400 text-[11px] uppercase">Quiz Type:</span>
              <button
                type="button"
                onClick={() => handleConfigChange({ mode: 'mcq' })}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  config.mode === 'mcq'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-neutral-200 dark:bg-slate-800 text-neutral-700 dark:text-slate-300'
                }`}
              >
                Multiple Choice (MCQ)
              </button>
              <button
                type="button"
                onClick={() => handleConfigChange({ mode: 'numeric' })}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  config.mode === 'numeric'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-neutral-200 dark:bg-slate-800 text-neutral-700 dark:text-slate-300'
                }`}
              >
                Numeric Calculation
              </button>
            </div>

            {/* Question Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-1">
                Question Text (LaTeX formula codes supported):
              </label>
              <textarea
                value={config.question}
                onChange={(e) => handleConfigChange({ question: e.target.value })}
                rows={2}
                className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 font-sans"
                placeholder="e.g. Find root of x^3 - 4x - 9 = 0 using Bisection Method..."
              />
            </div>

            {/* MCQ Options Authoring */}
            {config.mode === 'mcq' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-slate-300">
                    Answer Options (Select the radio of correct choice):
                  </label>
                  <button
                    onClick={handleAddOption}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <FaPlus className="w-2.5 h-2.5" />
                    <span>Add Option</span>
                  </button>
                </div>
                {(config.options || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={config.correctOptionIndex === idx}
                      onChange={() => handleConfigChange({ correctOptionIndex: idx })}
                      className="text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-neutral-500 dark:text-slate-400 w-5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    {(config.options || []).length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(idx)}
                        className="text-neutral-400 hover:text-red-500 p-1"
                        title="Delete option"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Numeric Answer Authoring */}
            {config.mode === 'numeric' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-1">
                    Correct Target Value:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={config.correctNumericValue}
                    onChange={(e) => handleConfigChange({ correctNumericValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-1">
                    Acceptable Tolerance (±):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={config.tolerance}
                    onChange={(e) => handleConfigChange({ tolerance: parseFloat(e.target.value) || 0.001 })}
                    className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Explanation Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-1">
                Step-by-Step Derivation / Solution (LaTeX math supported):
              </label>
              <textarea
                value={config.explanation}
                onChange={(e) => handleConfigChange({ explanation: e.target.value })}
                rows={2}
                className="w-full bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 font-sans"
                placeholder="Explain how the answer is derived..."
              />
            </div>
          </div>
        ) : (
          /* STUDENT / TEST MODE */
          <div className="space-y-4">
            {/* Question Display */}
            <div className="text-sm font-medium text-neutral-900 dark:text-slate-100 leading-relaxed">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">Q:</span>
              <span>{config.question}</span>
            </div>

            {/* MCQ Options Interactive Selection */}
            {config.mode === 'mcq' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(config.options || []).map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isThisCorrect = idx === config.correctOptionIndex;

                  let borderClass = 'border-neutral-200 dark:border-slate-800 bg-neutral-50/70 dark:bg-slate-950/60 hover:bg-neutral-100 dark:hover:bg-slate-800/50';
                  if (isSelected) {
                    borderClass = 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm';
                  }

                  if (hasSubmitted) {
                    if (isThisCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500';
                    } else if (isSelected && !isThisCorrect) {
                      borderClass = 'border-red-500 bg-red-50/90 dark:bg-red-950/50 text-red-900 dark:text-red-200 ring-1 ring-red-500';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !hasSubmitted && setSelectedOption(idx)}
                      className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${borderClass}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-neutral-200 dark:bg-slate-800 text-neutral-600 dark:text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-xs leading-normal">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Numeric Input Field */}
            {config.mode === 'numeric' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      placeholder="Enter your calculated answer..."
                      value={numericInput}
                      disabled={hasSubmitted}
                      onChange={(e) => setNumericInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-slate-400 font-mono self-center">
                    Tolerance: ±{config.tolerance}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                {!hasSubmitted ? (
                  <button
                    onClick={config.mode === 'mcq' ? handleSubmitMcq : handleSubmitNumeric}
                    disabled={config.mode === 'mcq' ? selectedOption === null : !numericInput}
                    className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <FaCheck className="w-3 h-3" />
                    <span>Check Answer</span>
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-neutral-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                  >
                    <FaRedo className="w-3 h-3" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>

              {/* Reveal Solution Button */}
              {config.explanation && (
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <FaLightbulb className="w-3 h-3 text-amber-500" />
                  <span>{showExplanation ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
                  {showExplanation ? <FaChevronUp className="w-2.5 h-2.5" /> : <FaChevronDown className="w-2.5 h-2.5" />}
                </button>
              )}
            </div>

            {/* Collapsible Step-by-Step KaTeX Explanation */}
            {showExplanation && config.explanation && (
              <div className="mt-3 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-2 animate-fadeIn">
                <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
                  <FaLightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Step-by-Step Derivation & Explanation:</span>
                </div>
                <div className="text-xs text-neutral-800 dark:text-slate-200 leading-relaxed font-sans">
                  {config.explanation}
                </div>
                {/* Live KaTeX render if explanation has math syntax */}
                {config.explanation.includes('\\') && (
                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-indigo-100 dark:border-indigo-900/40 mt-2">
                    <KaTeXRenderer math={config.explanation} blockMode={true} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
