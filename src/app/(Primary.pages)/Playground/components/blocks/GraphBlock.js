'use client';

import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import {
  generateGraphDatasetFromLatex,
  CURVE_COLORS,
} from '../../utils/equationToGraph';
import {
  FiPlus,
  FiTrash2,
  FiRefreshCw,
  FiEdit2,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiX,
  FiCheck
} from 'react-icons/fi';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const DOMAIN_PRESETS = [
  { label: '[-10, 10]', domain: [-10, 10] },
  { label: '[-5, 5]', domain: [-5, 5] },
  { label: '[-2, 2]', domain: [-2, 2] },
  { label: '[-20, 20]', domain: [-20, 20] },
];

const EQUATION_PRESETS = [
  { label: 'sin(x)', expr: 'y = sin(x)' },
  { label: 'cos(x)', expr: 'y = cos(x)' },
  { label: 'x² - 4', expr: 'y = x^2 - 4' },
  { label: 'x³ - 3x', expr: 'y = x^3 - 3*x' },
  { label: 'eˣ', expr: 'y = exp(x)' },
  { label: '1/x', expr: 'y = 1/x' },
  { label: '|x|', expr: 'y = abs(x)' },
  { label: '√x', expr: 'y = sqrt(x)' },
];

export default function GraphBlock({
  block,
  onUpdateContent,
  isEditing: propIsEditing,
  setIsEditing: propSetIsEditing,
}) {
  const [domain, setDomain] = useState([-10, 10]);
  const [newEquationInput, setNewEquationInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [localIsEditing, setLocalIsEditing] = useState(false);

  const isEditing = propIsEditing !== undefined ? propIsEditing : localIsEditing;
  const setIsEditing = propSetIsEditing || setLocalIsEditing;

  // Raw curves/datasets stored in block content or default polynomial
  const rawDatasets = useMemo(() => {
    if (block.content?.graphData?.datasets !== undefined) {
      return block.content.graphData.datasets;
    }
    const defaultCurve = generateGraphDatasetFromLatex('y = x^2 - 4x + 3', 'f(x) = x² - 4x + 3', domain, 0);
    return defaultCurve ? [defaultCurve] : [];
  }, [block.content?.graphData?.datasets, domain]);

  // Re-generate curve dataset points dynamically whenever domain changes
  const activeDatasets = useMemo(() => {
    return rawDatasets.map((ds, idx) => {
      const latexStr = ds.latex || ds.label || 'y = x^2 - 4';
      const freshDs = generateGraphDatasetFromLatex(latexStr, ds.label || latexStr, domain, idx);
      if (!freshDs) return ds;
      return {
        ...freshDs,
        borderColor: ds.borderColor || freshDs.borderColor,
        backgroundColor: ds.backgroundColor || freshDs.backgroundColor,
        hidden: !!ds.hidden,
      };
    }).filter(Boolean);
  }, [rawDatasets, domain]);

  // Chart.js Data Payload
  const chartData = useMemo(() => {
    return {
      datasets: activeDatasets.map((ds, idx) => ({
        label: ds.label || `Function ${idx + 1}`,
        data: ds.data || [],
        borderColor: ds.borderColor || CURVE_COLORS[idx % CURVE_COLORS.length],
        backgroundColor: ds.backgroundColor || 'rgba(59, 130, 246, 0.08)',
        borderWidth: 2.5,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: ds.borderColor || '#3B82F6',
        hidden: !!ds.hidden,
      })),
    };
  }, [activeDatasets]);

  // Chart.js Options with Linear Scales for X & Y (Proper Cartesian Coordinate Graph)
  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#71717A',
            font: { size: 10, weight: '600' },
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(18, 18, 23, 0.92)',
          titleColor: '#3B82F6',
          bodyColor: '#F4F4F5',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 8,
          callbacks: {
            title: (items) => (items[0] ? `x = ${items[0].parsed.x}` : ''),
            label: (item) => {
              const yVal = item.parsed.y;
              return `${item.dataset.label}: ${yVal !== null && yVal !== undefined ? yVal : 'Undefined'}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          min: domain[0],
          max: domain[1],
          grid: {
            color: (context) => (context.tick.value === 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(161, 161, 170, 0.15)'),
            lineWidth: (context) => (context.tick.value === 0 ? 2 : 1),
          },
          ticks: {
            color: '#71717A',
            font: { size: 9, family: 'monospace' },
            stepSize: (domain[1] - domain[0]) / 10,
          },
        },
        y: {
          type: 'linear',
          grid: {
            color: (context) => (context.tick.value === 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(161, 161, 170, 0.15)'),
            lineWidth: (context) => (context.tick.value === 0 ? 2 : 1),
          },
          ticks: {
            color: '#71717A',
            font: { size: 9, family: 'monospace' },
          },
        },
      },
    };
  }, [domain]);

  // Handle adding a new equation curve to this graph block
  const handleAddCurve = (e, customExpr) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError(null);
    const exprToUse = (typeof customExpr === 'string' ? customExpr : newEquationInput).trim();
    if (!exprToUse) return;

    const colorIdx = activeDatasets.length;
    const chosenColor = selectedColor || CURVE_COLORS[colorIdx % CURVE_COLORS.length];
    const newDs = generateGraphDatasetFromLatex(exprToUse, exprToUse, domain, colorIdx);

    if (newDs) {
      newDs.borderColor = chosenColor;
      newDs.backgroundColor = chosenColor.startsWith('#')
        ? `${chosenColor}15`
        : 'rgba(59, 130, 246, 0.08)';
      const updatedDatasets = [...activeDatasets, newDs];
      if (onUpdateContent) {
        onUpdateContent(block.blockId, {
          graphData: { datasets: updatedDatasets },
        });
      }
      setNewEquationInput('');
      setSelectedColor(null);
      setShowAddForm(false);
    } else {
      setFormError('Could not evaluate equation. Try e.g. y = sin(x), x^2 - 4, or 2x + 1.');
    }
  };

  // Toggle equation visibility (hide/show on graph)
  const handleToggleVisibility = (targetIdx) => {
    const updated = activeDatasets.map((ds, idx) => {
      if (idx === targetIdx) {
        return { ...ds, hidden: !ds.hidden };
      }
      return ds;
    });
    if (onUpdateContent) {
      onUpdateContent(block.blockId, {
        graphData: { datasets: updated },
      });
    }
  };

  // Handle removing an equation by index
  const handleRemoveCurve = (removeIdx) => {
    const updated = activeDatasets.filter((_, idx) => idx !== removeIdx);
    if (onUpdateContent) {
      onUpdateContent(block.blockId, {
        graphData: { datasets: updated },
      });
    }
  };

  return (
    <div className="group/graph relative w-full h-full flex flex-col gap-2 p-1 select-none overflow-hidden font-sans">
      {/* Semi-transparent hover edit icon in top-right */}
      <button
        onClick={() => setIsEditing(!isEditing)}
        title={isEditing ? 'Close Controls' : 'Edit Graph Controls'}
        className="opacity-0 group-hover/graph:opacity-100 absolute top-2 right-2 z-30 p-1.5 rounded-lg bg-zinc-900/80 text-zinc-400 hover:text-blue-400 backdrop-blur-sm border border-zinc-700/50 transition-all cursor-pointer"
      >
        <FiEdit2 className="w-3.5 h-3.5" />
      </button>

      {/* Controls Bar (Visible in Edit Mode) */}
      {isEditing && (
        <div className="flex-shrink-0 flex flex-col gap-2 p-2 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pb-1 border-b border-zinc-200 dark:border-zinc-800/60">
            {/* Domain Presets */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500 font-mono">Range:</span>
              {DOMAIN_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setDomain(p.domain)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    domain[0] === p.domain[0] && domain[1] === p.domain[1]
                      ? 'bg-blue-500 text-white font-semibold'
                      : 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setFormError(null);
                }}
                title="Add Equation to Plot"
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold transition-all shadow-sm ${
                  showAddForm 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                }`}
              >
                <FiPlus className="w-3 h-3" />
                <span>Add Equation</span>
              </button>
              <button
                onClick={() => setDomain([-10, 10])}
                title="Reset Domain to [-10, 10]"
                className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded"
              >
                <FiRefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Add New Equation Input & Presets Bar */}
          {showAddForm && (
            <div className="space-y-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <form onSubmit={handleAddCurve} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                <div className="relative flex-1 flex items-center">
                  <span className="absolute left-2.5 text-[11px] font-mono text-zinc-400 font-semibold select-none">
                    f(x) =
                  </span>
                  <input
                    type="text"
                    value={newEquationInput}
                    onChange={(e) => {
                      setNewEquationInput(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="sin(x), x^2 - 4, 2x + 1..."
                    className="w-full pl-12 pr-7 py-1 text-xs font-mono rounded-lg bg-white dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 shadow-sm"
                    autoFocus
                  />
                  {newEquationInput && (
                    <button
                      type="button"
                      onClick={() => setNewEquationInput('')}
                      className="absolute right-2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Color Swatch Picker */}
                <div className="flex items-center gap-1 px-1 justify-center shrink-0">
                  {CURVE_COLORS.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(isSelected ? null : color)}
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          isSelected ? 'scale-125 ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-900' : 'hover:scale-110 opacity-75 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Select curve color: ${color}`}
                      />
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1 shrink-0"
                >
                  <FiCheck className="w-3 h-3" />
                  <span>Plot</span>
                </button>
              </form>

              {/* Quick Equation Template Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                <span className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider shrink-0 mr-0.5">Quick:</span>
                {EQUATION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setNewEquationInput(preset.expr);
                      setFormError(null);
                    }}
                    className="px-2 py-0.5 rounded-md bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono transition-colors shrink-0"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {formError && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-1 rounded-lg">
                  <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Chart Canvas Container - Flex 1 & Dynamic Responsive Height */}
      <div className="relative w-full flex-1 min-h-[160px] rounded-xl bg-zinc-50/80 dark:bg-zinc-950/80 p-2 border border-zinc-200/60 dark:border-zinc-800/40 overflow-hidden">
        {activeDatasets.length > 0 ? (
          <div className="w-full h-full min-h-[140px]">
            <Line id={`graph_${block.blockId}`} data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs">
            <span>No active equations plotted.</span>
            <button
              onClick={() => {
                setIsEditing(true);
                setShowAddForm(true);
              }}
              className="mt-2 text-blue-500 hover:underline font-medium flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" />
              <span>Add an equation to plot</span>
            </button>
          </div>
        )}
      </div>

      {/* Equations Legend List with Visibility & Remove Buttons */}
      {activeDatasets.length > 0 && (
        <div className="flex-shrink-0 flex flex-wrap items-center gap-1.5 pt-0.5">
          {activeDatasets.map((ds, idx) => {
            const isHidden = !!ds.hidden;
            const curveColor = ds.borderColor || CURVE_COLORS[idx % CURVE_COLORS.length];
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-mono transition-all ${
                  isHidden
                    ? 'bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800 text-zinc-400 line-through opacity-60'
                    : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity"
                  style={{
                    backgroundColor: curveColor,
                    opacity: isHidden ? 0.3 : 1
                  }}
                />
                <span className="truncate max-w-[160px] font-medium">
                  {ds.label || ds.latex || `Equation ${idx + 1}`}
                </span>

                {/* Eye toggle button */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(idx)}
                  className="p-0.5 text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  title={isHidden ? 'Show Equation on Graph' : 'Hide Equation from Graph'}
                >
                  {isHidden ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                </button>

                {/* Remove button */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCurve(idx)}
                    className="p-0.5 text-zinc-400 hover:text-rose-500 transition-colors"
                    title="Remove Equation"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
