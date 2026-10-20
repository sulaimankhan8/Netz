'use client';

import { useState } from 'react';
import KaTeXRenderer from './KaTeXRenderer';
import { LuCheck, LuChevronDown, LuEye, LuHelpCircle, LuPencil, LuPlus, LuRotateCcw, LuTrash2, LuX } from 'react-icons/lu';
import { BTN_MAIN, BTN_QUIET, BTN_SECONDARY, FIELD, FIELD_INPUT, ICON_BTN, LABEL, Segmented } from './ui';
import { recordActivity } from '@/app/utils/activity';

export default function QuizBlock({ block, onUpdate, menuButton = null, canEdit = true }) {
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
    if (correct) {
      setShowExplanation(true);
      recordActivity('quiz.correct', { blockId: block?.id });
    }
  };

  const handleSubmitNumeric = () => {
    const val = parseFloat(numericInput);
    if (isNaN(val)) return;
    const tol = config.tolerance !== undefined ? config.tolerance : 0.001;
    const target = config.correctNumericValue;
    const correct = Math.abs(val - target) <= tol;
    setIsCorrect(correct);
    setHasSubmitted(true);
    if (correct) {
      setShowExplanation(true);
      recordActivity('quiz.correct', { blockId: block?.id });
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setNumericInput('');
    setHasSubmitted(false);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  // How an answer card looks: right and wrong carry a tick or cross and words, not colour alone
  const optionCard = (idx) => {
    const isSelected = selectedOption === idx;
    const isThisCorrect = idx === config.correctOptionIndex;
    if (hasSubmitted && isThisCorrect) {
      return { card: 'border-nt-ok ring-1 ring-inset ring-nt-ok bg-nt-ok-tint', badge: 'bg-nt-ok text-nt-surface', note: isSelected ? 'Your answer · correct' : 'Correct answer', noteClass: 'text-nt-ok', mark: 'right' };
    }
    if (hasSubmitted && isSelected) {
      return { card: 'border-nt-danger ring-1 ring-inset ring-nt-danger bg-nt-danger-tint', badge: 'bg-nt-danger text-nt-surface', note: 'Your answer', noteClass: 'text-nt-danger', mark: 'wrong' };
    }
    if (isSelected) {
      return { card: 'border-nt-accent ring-1 ring-inset ring-nt-accent bg-nt-accent-tint', badge: 'bg-nt-accent-fill text-white', note: null };
    }
    return { card: 'border-nt-line bg-nt-surface hover:bg-nt-tray/60', badge: 'bg-nt-tray text-nt-text2', note: null };
  };

  const textareaClass = 'w-full rounded-xl border border-nt-line bg-nt-surface px-3 py-2.5 text-sm text-nt-ink outline-none focus:border-nt-accent focus:ring-2 focus:ring-nt-accent/20';

  return (
    <div className={`my-2 rounded-2xl border bg-nt-surface text-nt-ink ${isEditing ? 'border-nt-quiz ring-[3px] ring-nt-quiz-tint' : 'border-nt-line'}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 pl-3.5 pr-1.5 py-1.5 min-h-[56px]">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-nt-quiz-tint text-nt-quiz" aria-hidden="true">
          <LuHelpCircle className="w-4 h-4" />
        </span>
        <span className="text-[13px] font-semibold text-nt-quiz shrink-0">Quiz</span>
        <span className="flex-1 min-w-0 text-[13px] text-nt-text2 truncate">{config.mode === 'mcq' ? 'Multiple choice' : 'Number answer'}</span>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`${isEditing ? BTN_SECONDARY : BTN_QUIET} !h-9 !px-3`}
            title={isEditing ? 'See it as a student does' : 'Edit the question and answers'}
          >
            {isEditing ? <LuEye className="w-4 h-4" aria-hidden="true" /> : <LuPencil className="w-4 h-4" aria-hidden="true" />}
            {isEditing ? 'Preview' : 'Edit'}
          </button>
        )}
        {menuButton}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-4">
        {isEditing ? (
          /* AUTHOR / EDIT MODE */
          <>
            <Segmented
              label="Quiz type"
              value={config.mode}
              onChange={(mode) => handleConfigChange({ mode })}
              options={[
                { value: 'mcq', label: 'Multiple choice' },
                { value: 'numeric', label: 'Number' }
              ]}
            />

            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>Question (LaTeX allowed)</span>
              <textarea
                value={config.question}
                onChange={(e) => handleConfigChange({ question: e.target.value })}
                rows={2}
                className={textareaClass}
                placeholder="e.g. Find the root of x^3 - 4x - 9 = 0 with the bisection method"
              />
            </label>

            {config.mode === 'mcq' && (
              <fieldset className="flex flex-col gap-2">
                <legend className={`${LABEL} mb-1.5`}>Answers · choose the correct one</legend>
                {(config.options || []).map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${block.id}`}
                        checked={config.correctOptionIndex === idx}
                        onChange={() => handleConfigChange({ correctOptionIndex: idx })}
                        aria-label={`Answer ${letter} is correct`}
                        className="w-5 h-5 shrink-0 cursor-pointer accent-[rgb(79_70_229)]"
                      />
                      <span className="w-5 text-sm font-semibold text-nt-text2" aria-hidden="true">
                        {letter}
                      </span>
                      <span className={`${FIELD} flex-1 ${config.correctOptionIndex === idx ? '!border-nt-ok' : ''}`}>
                        <input type="text" value={opt} aria-label={`Answer ${letter}`} onChange={(e) => handleOptionChange(idx, e.target.value)} className={FIELD_INPUT} />
                      </span>
                      {(config.options || []).length > 2 && (
                        <button type="button" onClick={() => handleRemoveOption(idx)} className={ICON_BTN} aria-label={`Remove answer ${letter}`} title="Remove answer">
                          <LuTrash2 className="w-[18px] h-[18px]" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {(config.options || []).length < 6 && (
                  <div>
                    <button type="button" onClick={handleAddOption} className={`${BTN_QUIET} !text-nt-accent !px-2`}>
                      <LuPlus className="w-4 h-4" aria-hidden="true" />
                      Add answer
                    </button>
                  </div>
                )}
              </fieldset>
            )}

            {config.mode === 'numeric' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>Correct answer</span>
                  <span className={FIELD}>
                    <input
                      type="number"
                      step="any"
                      value={config.correctNumericValue}
                      onChange={(e) => handleConfigChange({ correctNumericValue: parseFloat(e.target.value) || 0 })}
                      className={`${FIELD_INPUT} font-nt-mono`}
                    />
                  </span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className={LABEL}>Allowed difference (±)</span>
                  <span className={FIELD}>
                    <input
                      type="number"
                      step="any"
                      value={config.tolerance}
                      onChange={(e) => handleConfigChange({ tolerance: parseFloat(e.target.value) || 0.001 })}
                      className={`${FIELD_INPUT} font-nt-mono`}
                    />
                  </span>
                </label>
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className={LABEL}>Worked solution (LaTeX allowed)</span>
              <textarea
                value={config.explanation}
                onChange={(e) => handleConfigChange({ explanation: e.target.value })}
                rows={2}
                className={textareaClass}
                placeholder="Explain how the answer is found"
              />
            </label>
          </>
        ) : (
          /* STUDENT / TEST MODE */
          <>
            <p className="m-0 text-base leading-[25px] font-semibold">{config.question}</p>

            {config.mode === 'mcq' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="group" aria-label="Answers">
                {(config.options || []).map((opt, idx) => {
                  const look = optionCard(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      data-print="keep"
                      aria-pressed={selectedOption === idx}
                      disabled={hasSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`flex items-center gap-3 min-h-[56px] px-3.5 py-2.5 rounded-xl border text-left text-[15px] leading-[21px] text-nt-ink transition-colors disabled:cursor-default ${look.card}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold ${look.badge}`} aria-hidden="true">
                        {look.mark === 'right' ? <LuCheck className="w-4 h-4" /> : look.mark === 'wrong' ? <LuX className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span>{opt}</span>
                        {look.note && <span className={`text-[13px] font-semibold ${look.noteClass}`}>{look.note}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {config.mode === 'numeric' && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className={`${FIELD} flex-1 ${hasSubmitted ? (isCorrect ? '!border-nt-ok' : '!border-nt-danger') : ''}`}>
                  <input
                    type="number"
                    step="any"
                    aria-label="Your answer"
                    placeholder="Your answer"
                    value={numericInput}
                    disabled={hasSubmitted}
                    onChange={(e) => setNumericInput(e.target.value)}
                    className={`${FIELD_INPUT} font-nt-mono`}
                  />
                </span>
                <span className="text-[13px] text-nt-text2 tabular-nums">Allowed difference ±{config.tolerance}</span>
              </div>
            )}

            {hasSubmitted && (
              <p className={`m-0 flex items-center gap-2 text-[15px] font-semibold ${isCorrect ? 'text-nt-ok' : 'text-nt-danger'}`} role="status">
                {isCorrect ? <LuCheck className="w-[18px] h-[18px]" aria-hidden="true" /> : <LuX className="w-[18px] h-[18px]" aria-hidden="true" />}
                {isCorrect ? 'Correct' : 'Not quite'}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              {!hasSubmitted ? (
                <button
                  type="button"
                  onClick={config.mode === 'mcq' ? handleSubmitMcq : handleSubmitNumeric}
                  disabled={config.mode === 'mcq' ? selectedOption === null : !numericInput}
                  className={BTN_MAIN}
                >
                  Check answer
                </button>
              ) : (
                <button type="button" onClick={handleReset} className={BTN_SECONDARY}>
                  <LuRotateCcw className="w-4 h-4" aria-hidden="true" />
                  Try again
                </button>
              )}

              {config.explanation && (
                <button type="button" onClick={() => setShowExplanation(!showExplanation)} aria-expanded={showExplanation} className={`${BTN_QUIET} !text-nt-accent !px-2`}>
                  {showExplanation ? 'Hide solution' : 'Show solution'}
                  <LuChevronDown className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              )}
            </div>

            {showExplanation && config.explanation && (
              <div className="px-4 py-3.5 rounded-xl bg-nt-paper flex flex-col gap-2">
                <p className="m-0 text-[15px] leading-6">{config.explanation}</p>
                {/* Live KaTeX render if explanation has math syntax */}
                {config.explanation.includes('\\') && (
                  <div className="px-3 py-2 rounded-lg bg-nt-surface overflow-x-auto">
                    <KaTeXRenderer math={config.explanation} blockMode={true} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
