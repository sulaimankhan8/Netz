import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NT_FONT } from './fonts';

/**
 * Exports a NETZ note to a high-resolution Academic PDF Report. Free PDFs say "Made with NETZ" in
 * the footer; Pro PDFs (`clean`) only carry the page number (NETZ_LAUNCH_PLAN.md 5.1).
 * Uses html2canvas for sharp LaTeX KaTeX rendering and jsPDF for multi-page A4 layout.
 * 
 * @param {object} note - The active note data object
 * @param {HTMLElement|string} elementOrId - The DOM element or ID containing the note content
 * @param {{ clean?: boolean }} [options]
 * @returns {Promise<boolean>} True when successfully exported
 */
export async function exportNoteToPdf(note, elementOrId = 'note-printable-area', { clean = false } = {}) {
  const footer = (page) => (clean ? `Page ${page}` : `Made with NETZ • Page ${page}`);
  try {
    const targetElement = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId) 
      : elementOrId;

    if (!targetElement) {
      throw new Error('Note content element not found for PDF export.');
    }

    // Create a temporary print container with high-contrast academic white styling
    const clone = targetElement.cloneNode(true);

    // Style the clone for clean academic print
    clone.style.width = '794px'; // Standard A4 width at 96 DPI
    clone.style.backgroundColor = '#FFFFFF';
    clone.style.color = '#111827';
    clone.style.padding = '36px 40px';
    clone.style.position = 'fixed';
    clone.style.top = '-99999px';
    clone.style.left = '-99999px';
    clone.style.zIndex = '-9999';
    clone.classList.remove('dark');
    // Light Notes colours even when the app is in dark mode (dark text on the white page), the
    // Notes fonts (the copy sits outside the Notes root)
    clone.classList.add('nt-force-light', ...NT_FONT.split(' '));

    // Remove interactive edit buttons and hover toolbars from clone (quiz answers stay)
    // A kept button (banner, page icon, status, quiz answers) becomes a plain block with the same
    // look: html2canvas leaves icons inside buttons blank.
    clone.querySelectorAll('button').forEach((b) => {
      if (b.dataset.print !== 'keep') {
        b.style.display = 'none';
        return;
      }
      const plain = document.createElement('div');
      plain.className = b.className;
      plain.setAttribute('style', b.getAttribute('style') || '');
      [...b.attributes].forEach((a) => {
        if (a.name.startsWith('data-')) plain.setAttribute(a.name, a.value);
      });
      plain.append(...b.childNodes);
      b.replaceWith(plain);
    });

    // html2canvas draws a text box as one line and clips its text, so print each one as plain
    // text with the same look. A copy loses typed values, so they come from the original.
    const originalFields = targetElement.querySelectorAll('input, textarea');
    clone.querySelectorAll('input, textarea').forEach((field, i) => {
      if (['radio', 'checkbox', 'file', 'hidden'].includes(field.type)) return;
      const text = document.createElement('div');
      text.className = field.className;
      text.textContent = originalFields[i]?.value ?? field.value ?? '';
      text.style.whiteSpace = field.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre';
      text.style.overflowWrap = 'anywhere';
      text.style.height = 'auto';
      field.replaceWith(text);
    });

    // The banner runs edge to edge: match the printed page's own margins (36 px, 40 px)
    const banner = clone.querySelector('[data-note-cover]');
    if (banner) {
      banner.style.margin = '-36px -40px 0';
      // html2canvas paints overlapping positioned layers out of order (the banner covered the
      // page icon, and icons in the row went blank). Plain flow paints in page order; the
      // badges stay in the corner because the copy itself is positioned and the banner is first.
      banner.style.position = 'static';
      const fill = banner.firstElementChild;
      if (fill) {
        fill.style.position = 'static';
        fill.style.height = '100%';
      }
      const row = banner.nextElementSibling;
      if (row) {
        row.style.position = 'static';
        row.style.marginTop = '14px';
      }
    }

    document.body.appendChild(clone);

    // html2canvas leaves some inline SVG icons blank ("currentColor" means nothing to it, and it
    // drops icons in some layouts), so every icon becomes a plain picture of itself: its real
    // colour written in, its drawn size fixed.
    clone.querySelectorAll('svg').forEach((svg) => {
      const colour = getComputedStyle(svg).color;
      const { width, height } = svg.getBoundingClientRect();
      if (!width || !height) return;
      [svg, ...svg.querySelectorAll('*')].forEach((el) => {
        ['stroke', 'fill'].forEach((attr) => {
          if (el.getAttribute(attr) === 'currentColor') el.setAttribute(attr, colour);
        });
      });
      const copy = svg.cloneNode(true);
      copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      copy.setAttribute('width', String(width));
      copy.setAttribute('height', String(height));
      // Keep only a background (banner art paints its tint there)
      const background = getComputedStyle(svg).backgroundColor;
      copy.setAttribute('style', background && background !== 'rgba(0, 0, 0, 0)' ? `background:${background}` : '');
      copy.removeAttribute('class');
      const picture = document.createElement('span');
      picture.setAttribute('aria-hidden', 'true');
      picture.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}")`;
      picture.style.backgroundSize = '100% 100%';
      picture.style.backgroundRepeat = 'no-repeat';
      picture.style.width = `${width}px`;
      picture.style.height = `${height}px`;
      picture.style.flexShrink = '0';
      picture.style.display = getComputedStyle(svg).display === 'inline' ? 'inline-block' : 'block';
      svg.replaceWith(picture);
    });

    // html2canvas finds text baselines with an <img> in this page. Tailwind makes images
    // display:block, which draws all text a few pixels low (clipping the bottom of lines and
    // putting KaTeX fraction lines through the numerator), so images are inline-block for the
    // moment of the capture only.
    const baselineFix = document.createElement('style');
    baselineFix.textContent = 'img { display: inline-block !important; }';
    document.head.appendChild(baselineFix);

    // Render with html2canvas at scale 2 for retina crispness
    let canvas;
    try {
      canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 794
      });
    } finally {
      baselineFix.remove();
      document.body.removeChild(clone);
    }

    // Initialize jsPDF A4 document (210mm x 297mm)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/png');

    let heightLeft = contentHeight;
    let position = margin;
    let pageNumber = 1;

    // First page header
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
    
    // Add page footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      footer(pageNumber),
      pdfWidth / 2,
      pdfHeight - 6,
      { align: 'center' }
    );

    heightLeft -= (pdfHeight - margin * 2);

    // Multi-page loop if note content exceeds one A4 page
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pageNumber++;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);

      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        footer(pageNumber),
        pdfWidth / 2,
        pdfHeight - 6,
        { align: 'center' }
      );

      heightLeft -= (pdfHeight - margin * 2);
    }

    const cleanFilename = (note?.title || 'NETZ-Note')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    pdf.save(`${cleanFilename || 'netz-note'}-academic-report.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}
