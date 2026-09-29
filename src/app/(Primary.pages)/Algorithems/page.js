'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALGORITHMS_CATALOG } from '../Notes/utils/algorithmRegistry';
import { 
  FaSearch, 
  FaCalculator, 
  FaBookOpen, 
  FaPlay, 
  FaExternalLinkAlt,
  FaCheckCircle
} from 'react-icons/fa';

export default function AlgorithmsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUnit, setActiveUnit] = useState('All');
  const [activeAlgorithm, setActiveAlgorithm] = useState(null);
  const [inputs, setInputs] = useState({});
  const [output, setOutput] = useState(null);

  const units = ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

  const filteredAlgorithms = ALGORITHMS_CATALOG.filter((alg) => {
    const matchesSearch =
      alg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alg.unit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUnit =
      activeUnit === 'All' || alg.unit.toLowerCase().includes(activeUnit.toLowerCase());

    return matchesSearch && matchesUnit;
  });

  const handleSelectAlgorithm = (alg) => {
    setActiveAlgorithm(alg);
    setInputs(alg.defaultParams || {});
    setOutput(null);
  };

  const handleOpenDedicatedPage = (e, route) => {
    e.stopPropagation();
    if (route) {
      router.push(route);
    }
  };

  const handleRunSolve = () => {
    if (!activeAlgorithm || !activeAlgorithm.solve) return;
    try {
      const res = activeAlgorithm.solve(inputs);
      setOutput(res);
    } catch (err) {
      setOutput({ result: 'Error evaluating inputs: ' + err.message, steps: [] });
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-slate-100 font-sans p-4 sm:p-6 md:p-10 pl-0 md:pl-[78px] custom-notion-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Title Section */}
        <div className="space-y-3 border-b border-[#2e2e2e] pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <FaCalculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                NETZ Algorithms Explorer
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Click any algorithm card to open its dedicated unit page or try live solvers
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#202020] p-4 rounded-2xl border border-[#2e2e2e]">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search algorithms, formulas, units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#2e2e2e] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Unit Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto custom-notion-scrollbar pb-1 md:pb-0">
            {units.map((unit) => {
              const count = unit === 'All'
                ? ALGORITHMS_CATALOG.length
                : ALGORITHMS_CATALOG.filter((a) => a.unit.toLowerCase().includes(unit.toLowerCase())).length;

              return (
                <button
                  key={unit}
                  onClick={() => setActiveUnit(unit)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1.5 ${
                    activeUnit === unit
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-[#181818] text-slate-400 hover:text-slate-200 border border-[#2e2e2e]'
                  }`}
                >
                  <span>{unit === 'All' ? 'All Units' : unit}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeUnit === unit ? 'bg-indigo-700/80 text-white' : 'bg-[#2a2a2a] text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredAlgorithms.length}</strong> of{' '}
            <strong className="text-white">{ALGORITHMS_CATALOG.length}</strong> algorithms across all units
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-400 hover:text-indigo-300 underline text-[11px]"
            >
              Clear search filter
            </button>
          )}
        </div>

        {/* Algorithms Grid & Active Solver Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Algorithm Cards Grid */}
          <div className={`space-y-4 ${activeAlgorithm ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlgorithms.map((alg) => {
                const isSelected = activeAlgorithm?.id === alg.id;
                return (
                  <div
                    key={alg.id}
                    onClick={() => handleSelectAlgorithm(alg)}
                    className={`group p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#252330] border-indigo-500 shadow-xl ring-1 ring-indigo-500/50'
                        : 'bg-[#202020] hover:bg-[#262626] border-[#2e2e2e] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {alg.unit}
                        </span>
                        {isSelected && (
                          <FaCheckCircle className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {alg.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {alg.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between text-xs">
                      <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                        <FaPlay className="w-2.5 h-2.5" />
                        <span>Quick Solver</span>
                      </span>

                      <button
                        onClick={(e) => handleOpenDedicatedPage(e, alg.route)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white bg-[#181818] hover:bg-[#2e2e2e] px-2.5 py-1 rounded-lg border border-[#333333] transition-colors"
                        title="Open full dedicated unit algorithm page"
                      >
                        <span className="text-[11px]">Open Page</span>
                        <FaExternalLinkAlt className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Interactive Solver Drawer */}
          {activeAlgorithm && (
            <div className="lg:col-span-6 bg-[#202020] border border-[#2e2e2e] rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-purple-400">{activeAlgorithm.unit}</span>
                    <h2 className="text-xl font-extrabold text-white">{activeAlgorithm.name}</h2>
                  </div>
                  <button
                    onClick={() => setActiveAlgorithm(null)}
                    className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded bg-[#181818]"
                  >
                    Close
                  </button>
                </div>

                <p className="text-xs text-slate-300">{activeAlgorithm.description}</p>

                {/* Open Full Page Button */}
                {activeAlgorithm.route && (
                  <button
                    onClick={(e) => handleOpenDedicatedPage(e, activeAlgorithm.route)}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold py-2 px-4 rounded-xl transition-all"
                  >
                    <FaExternalLinkAlt className="w-3 h-3" />
                    <span>Go to Full {activeAlgorithm.name} Page</span>
                  </button>
                )}

                {/* Dynamic Parameter Inputs */}
                <div className="space-y-3 bg-[#181818] p-4 rounded-xl border border-[#2e2e2e]">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Algorithm Inputs</h4>
                  {Object.keys(activeAlgorithm.defaultParams || {}).map((key) => {
                    const getLabel = (k) => {
                      if (k === 'row1') return 'Matrix Row 1: [a11, a12, a13, b1]';
                      if (k === 'row2') return 'Matrix Row 2: [a21, a22, a23, b2]';
                      if (k === 'row3') return 'Matrix Row 3: [a31, a32, a33, b3]';
                      if (k === 'xValues') return 'X Values (comma-separated)';
                      if (k === 'yValues') return 'Y Values (comma-separated)';
                      if (k === 'sample1') return 'Sample 1 Data (comma-separated)';
                      if (k === 'sample2') return 'Sample 2 Data (comma-separated)';
                      if (k === 'observed') return 'Observed Frequencies O_i';
                      if (k === 'expected') return 'Expected Frequencies E_i';
                      return k.replace(/([A-Z])/g, ' $1');
                    };

                    return (
                      <div key={key} className="flex flex-col space-y-1">
                        <label className="text-[11px] font-mono text-indigo-300 uppercase">{getLabel(key)}</label>
                        <input
                          type="text"
                          value={inputs[key] !== undefined ? inputs[key] : activeAlgorithm.defaultParams[key]}
                          onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                          className="bg-[#141414] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    );
                  })}

                  <button
                    onClick={handleRunSolve}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-lg transition-all active:scale-95 mt-2"
                  >
                    <FaPlay className="w-3 h-3" />
                    <span>Compute Output & Steps</span>
                  </button>
                </div>

                {/* Computation Output & Steps Table */}
                {output && (
                  <div className="space-y-3 bg-[#141414] p-4 rounded-xl border border-[#2e2e2e]">
                    <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 font-mono text-xs font-semibold">
                      {output.result}
                    </div>

                    {output.steps && output.steps.length > 0 && (
                      <div className="overflow-x-auto max-h-56 custom-notion-scrollbar">
                        <table className="w-full text-left text-[11px] text-slate-300">
                          <thead className="bg-[#1e1e1e] text-slate-400 font-mono">
                            <tr>
                              {output.headers?.map((h, i) => (
                                <th key={i} className="p-2 border-b border-[#2e2e2e]">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {output.steps.map((step, idx) => (
                              <tr key={idx} className="border-b border-[#222222] hover:bg-[#1a1a1a]">
                                {Object.values(step).map((val, i) => (
                                  <td key={i} className="p-2 font-mono">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: Embed in Notes */}
              <div className="pt-4 border-t border-[#2e2e2e] flex items-center justify-between">
                <button
                  onClick={() => router.push('/Notes')}
                  className="w-full flex items-center justify-center space-x-2 bg-[#282828] hover:bg-[#333333] border border-[#383838] text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all"
                >
                  <FaBookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Open & Embed in Math Notes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}