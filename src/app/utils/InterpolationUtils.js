// src/utils/interpolationUtils.js
export const calculateXRange = (xValues, buffer = 5, steps = 100) => {
    const minX = Math.min(...xValues) - buffer;
    const maxX = Math.max(...xValues) + buffer;
    return Array.from({ length: steps }, (_, i) => minX + (i * (maxX - minX)) / (steps - 1));
  };
  