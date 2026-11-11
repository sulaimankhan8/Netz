'use client';

import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { sliceCanvasForPages } from './pdfPages';

/**
 * Universal Export Engine for Netz
 * Provides Free Tier (Raster PNG, JPEG, Clipboard) and Premium Tier (Scalable Vector SVG, PDF, CSV/JSON Data).
 */

// Helper to trigger browser file download
export function triggerDownload(dataUrl, fileName) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Get appropriate background color based on options
function getBackgroundColor(bgMode, isDark) {
  switch (bgMode) {
    case 'transparent':
      return 'transparent';
    case 'light':
      return '#FAF9F6';
    case 'dark':
      return '#121212';
    case 'auto':
    default:
      return isDark ? '#121212' : '#FAF9F6';
  }
}

/**
 * Helper to safely capture elements even if they are in a hidden tab
 */
async function executeWithTargetElement(elementId, captureCallback) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id "${elementId}" not found. Please ensure the calculator is populated.`);

  // Find all hidden ancestors or self and temporarily reveal them for capture
  const hiddenNodes = [];
  let curr = element;
  while (curr && curr !== document.body) {
    const style = window.getComputedStyle(curr);
    const hasHiddenClass = curr.classList && curr.classList.contains('hidden');
    if (style.display === 'none' || hasHiddenClass) {
      hiddenNodes.push({
        node: curr,
        originalDisplay: curr.style.display,
        hadHiddenClass: hasHiddenClass
      });
      if (hasHiddenClass) curr.classList.remove('hidden');
      curr.style.display = 'block';
    }
    curr = curr.parentElement;
  }

  try {
    // Wait a tiny frame for reflow if unhidden
    if (hiddenNodes.length > 0) {
      await new Promise((r) => setTimeout(r, 60));
    }
    return await captureCallback(element);
  } finally {
    // Restore original visibility state
    hiddenNodes.forEach(({ node, originalDisplay, hadHiddenClass }) => {
      if (hadHiddenClass) node.classList.add('hidden');
      node.style.display = originalDisplay;
    });
  }
}

/**
 * FREE TIER: Export element as High-Resolution PNG
 */
export async function exportAsPNG(elementId, options = {}) {
  const {
    fileName = 'export.png',
    pixelRatio = 2,
    bgMode = 'auto',
  } = options;

  return executeWithTargetElement(elementId, async (element) => {
    const isDark = document.documentElement.classList.contains('dark');
    const backgroundColor = getBackgroundColor(bgMode, isDark);

    if (element.tagName === 'CANVAS') {
      const dataUrl = element.toDataURL('image/png');
      triggerDownload(dataUrl, fileName);
      return { success: true, format: 'png' };
    }

    const dataUrl = await htmlToImage.toPng(element, {
      pixelRatio,
      backgroundColor: backgroundColor === 'transparent' ? null : backgroundColor,
      cacheBust: true,
      filter: (node) => !node.classList || !node.classList.contains('no-export'),
    });

    triggerDownload(dataUrl, fileName);
    return { success: true, format: 'png' };
  });
}

/**
 * FREE TIER: Export element as JPEG
 */
export async function exportAsJPEG(elementId, options = {}) {
  const {
    fileName = 'export.jpg',
    quality = 0.95,
    pixelRatio = 2,
    bgMode = 'auto',
  } = options;

  return executeWithTargetElement(elementId, async (element) => {
    const isDark = document.documentElement.classList.contains('dark');
    const backgroundColor = getBackgroundColor(bgMode === 'transparent' ? 'light' : bgMode, isDark);

    const dataUrl = await htmlToImage.toJpeg(element, {
      quality,
      pixelRatio,
      backgroundColor,
      cacheBust: true,
      filter: (node) => !node.classList || !node.classList.contains('no-export'),
    });

    triggerDownload(dataUrl, fileName);
    return { success: true, format: 'jpg' };
  });
}

/**
 * FREE TIER: Copy Image to System Clipboard
 */
export async function copyImageToClipboard(elementId, options = {}) {
  const { pixelRatio = 2, bgMode = 'auto' } = options;

  return executeWithTargetElement(elementId, async (element) => {
    const isDark = document.documentElement.classList.contains('dark');
    const backgroundColor = getBackgroundColor(bgMode, isDark);

    const blob = await htmlToImage.toBlob(element, {
      pixelRatio,
      backgroundColor: backgroundColor === 'transparent' ? null : backgroundColor,
      cacheBust: true,
      filter: (node) => !node.classList || !node.classList.contains('no-export'),
    });

    if (!blob) throw new Error('Failed to create image blob for clipboard.');

    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return { success: true, message: 'Image copied to clipboard!' };
    } else {
      throw new Error('Clipboard API not supported in this browser.');
    }
  });
}

/**
 * PREMIUM TIER: Export element as Scalable Vector Graphics (SVG)
 * Infinite zoomable vector format with embedded CSS & KaTeX fonts
 */
export async function exportAsSVG(elementId, options = {}) {
  const {
    fileName = 'vector-export.svg',
    bgMode = 'auto',
  } = options;

  return executeWithTargetElement(elementId, async (element) => {
    const isDark = document.documentElement.classList.contains('dark');
    const backgroundColor = getBackgroundColor(bgMode, isDark);

    const dataUrl = await htmlToImage.toSvg(element, {
      backgroundColor: backgroundColor === 'transparent' ? null : backgroundColor,
      cacheBust: true,
      filter: (node) => !node.classList || !node.classList.contains('no-export'),
    });

    triggerDownload(dataUrl, fileName);
    return { success: true, format: 'svg', isVector: true };
  });
}

/**
 * PREMIUM TIER: Export element as Multi-Page / Printable PDF Document
 */
export async function exportAsPDF(elementId, options = {}) {
  const {
    fileName = 'calculation-report.pdf',
    title = 'Netz Algorithm Report',
    bgMode = 'light',
  } = options;

  return executeWithTargetElement(elementId, async (element) => {
    const isDark = bgMode === 'dark';
    const backgroundColor = isDark ? '#121212' : '#FFFFFF';

    const canvas = await htmlToImage.toCanvas(element, {
      pixelRatio: 2,
      backgroundColor,
      cacheBust: true,
      filter: (node) => !node.classList || !node.classList.contains('no-export'),
    });

    // `compress` and the 'FAST' image setting store the pictures packed; without them a long
    // result made a PDF of tens of megabytes
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const margin = 10;
    const headerBottom = 26;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const pxPerMm = canvas.width / contentWidth;

    // Header metadata
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(title, 14, 15);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated with Netz Algorithm Lab • ${new Date().toLocaleDateString()}`, 14, 21);

    // The picture keeps its shape: a result longer than one page goes on to more pages, cut
    // between sections, instead of being pressed into the first one
    const pieces = sliceCanvasForPages(
      canvas,
      (pageHeight - headerBottom - margin) * pxPerMm,
      (pageHeight - margin * 2) * pxPerMm,
    );
    pieces.forEach((piece, index) => {
      if (index) pdf.addPage();
      pdf.addImage(piece.toDataURL('image/png'), 'PNG', margin, index ? margin : headerBottom, contentWidth, piece.height / pxPerMm, undefined, 'FAST');
    });
    pdf.save(fileName);

    return { success: true, format: 'pdf' };
  });
}

/**
 * PREMIUM TIER: Export Raw Coordinate or Difference Matrix Data as CSV / JSON
 */
export function exportDataAsCSV(data, fileName = 'matrix-data.csv') {
  if (!data || !Array.isArray(data)) throw new Error('Data must be an array.');

  let csvContent = 'data:text/csv;charset=utf-8,';
  
  if (Array.isArray(data[0])) {
    data.forEach(row => {
      csvContent += row.map(v => (v !== undefined && v !== null ? v : '')).join(',') + '\r\n';
    });
  } else if (typeof data[0] === 'object') {
    const headers = Object.keys(data[0]);
    csvContent += headers.join(',') + '\r\n';
    data.forEach(obj => {
      csvContent += headers.map(h => obj[h] ?? '').join(',') + '\r\n';
    });
  }

  const encodedUri = encodeURI(csvContent);
  triggerDownload(encodedUri, fileName);
  return { success: true, format: 'csv' };
}

export function exportDataAsJSON(data, fileName = 'algorithm-data.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, fileName);
  URL.revokeObjectURL(url);
  return { success: true, format: 'json' };
}
