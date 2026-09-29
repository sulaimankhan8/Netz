import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports a NETZ note to a high-resolution, un-watermarked Academic PDF Report.
 * Uses html2canvas for sharp LaTeX KaTeX rendering and jsPDF for multi-page A4 layout.
 * 
 * @param {object} note - The active note data object
 * @param {HTMLElement|string} elementOrId - The DOM element or ID containing the note content
 * @returns {Promise<boolean>} True when successfully exported
 */
export async function exportNoteToPdf(note, elementOrId = 'note-printable-area') {
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

    // Remove interactive edit buttons and hover toolbars from clone
    const buttons = clone.querySelectorAll('button, input[type="radio"], input[type="text"], textarea');
    buttons.forEach((b) => {
      if (b.tagName === 'BUTTON') {
        b.style.display = 'none';
      }
    });

    document.body.appendChild(clone);

    // Render with html2canvas at scale 2 for retina crispness
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 794
    });

    document.body.removeChild(clone);

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
      `NETZ Engineering Notes • Page ${pageNumber} • Access Key: ${note?.accessKey || 'NETZ'}`,
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
        `NETZ Engineering Notes • Page ${pageNumber} • Access Key: ${note?.accessKey || 'NETZ'}`,
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
