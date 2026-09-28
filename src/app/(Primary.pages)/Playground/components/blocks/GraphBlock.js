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
import { FiPlus, FiTrash2, FiRefreshCw, FiEdit2, FiAlertCircle } from 'react-icons/fi';

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

export default function GraphBlock({
  block,
  onUpdateContent,
  isEditing: propIsEditing,
  setIsEditing: propSetIsEditing,
}) {
  const [domain, setDomain] = useState([-10, 10]);
  const [newEquationInput, setNewEquationInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [localIsEditing, setLocalIsEditing] = useState(false);

  const isEditing = propIsEditing !== undefined ? propIsEditing : localIsEditing;
  const setIsEditing = propSetIsEditing || setLocalIsEditing;

  // Raw curves/datasets stored in block content or default polynomial
  const rawDatasets = useMemo(() => {
    if (block.content?.graphData?.datasets && block.content.graphData.datasets.length > 0) {
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
      return freshDs || ds;
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
  const handleAddCurve = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!newEquationInput.trim()) return;

    const colorIdx = activeDatasets.length;
    const newDs = generateGraphDatasetFromLatex(newEquationInput, newEquationInput, domain, colorIdx);

    if (newDs) {
      const updatedDatasets = [...activeDatasets, newDs];
      if (onUpdateContent) {
        onUpdateContent(block.blockId, {
          graphData: { datasets: updatedDatasets },
        });
      }
      setNewEquationInput('');
      setShowAddForm(false);
    } else {
      setFormError('Could not evaluate function. Check equation syntax (e.g. y = x^2, sin(x)).');
    }
  };

  // Handle removing a curve by index
  const handleRemoveCurve = (removeIdx) => {
    const updated = activeDatasets.filter((_, idx) => idx !== removeIdx);
    if (onUpdateContent) {
      onUpdateContent(block.blockId, {
        graphData: { datasets: updated },
      });
    }
  };

  return (
    <div className="group/graph relative w-full h-full flex flex-col gap-2 p-1 select-none overflow-hidden">
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
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setFormError(null);
                }}
                title="Add Equation Curve"
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500 dark:text-blue-400 hover:bg-blue-500/20 transition-all"
              >
                <FiPlus className="w-3 h-3" />
                <span>Add Curve</span>
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

          {/* Add New Curve Input Bar */}
          {showAddForm && (
            <div className="space-y-1 pt-1">
              <form onSubmit={handleAddCurve} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newEquationInput}
                  onChange={(e) => {
                    setNewEquationInput(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Type equation (e.g. y = sin(x), y = 2x + 1)..."
                  className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-white dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Plot
                </button>
              </form>
              {formError && (
                <div className="flex items-center gap-1 text-[10px] text-rose-500">
                  <FiAlertCircle className="w-3 h-3" />
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
            <span>No active curves plotted.</span>
            <button
              onClick={() => {
                setIsEditing(true);
                setShowAddForm(true);
              }}
              className="mt-2 text-blue-500 hover:underline font-medium"
            >
              Add an equation to plot
            </button>
          </div>
        )}
      </div>

      {/* Curves Legend List with Remove Buttons */}
      {activeDatasets.length > 0 && (
        <div className="flex-shrink-0 flex flex-wrap items-center gap-1.5 pt-0.5">
          {activeDatasets.map((ds, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-[11px] text-zinc-700 dark:text-zinc-300 font-mono"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ds.borderColor || CURVE_COLORS[idx % CURVE_COLORS.length] }}
              />
              <span className="truncate max-w-[160px]">{ds.label || ds.latex || `Curve ${idx + 1}`}</span>
              {isEditing && activeDatasets.length > 1 && (
                <button
                  onClick={() => handleRemoveCurve(idx)}
                  className="text-zinc-400 hover:text-rose-500 p-0.5 transition-colors"
                  title="Remove curve"
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
