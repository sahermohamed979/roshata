/**
 * Roshteh Direct Print Engine (محرك الطباعة المباشرة)
 * Sends the prescription directly to the physical printer via an isolated print frame,
 * eliminating browser modal backdrops, dialog chrome, and page background interference.
 */

export function directPrintPrescription(
  elementId = 'printable-prescription-document',
  title = 'روشتة_طبية'
): void {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
    return;
  }

  // Remove any previous temporary print frames
  const oldFrame = document.getElementById('roshteh-print-frame');
  if (oldFrame && document.body.contains(oldFrame)) {
    document.body.removeChild(oldFrame);
  }

  // Create an isolated invisible iframe for dedicated printing
  const iframe = document.createElement('iframe');
  iframe.id = 'roshteh-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect all active stylesheets and styles from the document
  let stylesHtml = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        ${stylesHtml}
        <style>
          @page {
            size: auto;
            margin: 0mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          .print-hidden {
            display: none !important;
          }
          .page-print-container {
            margin-bottom: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          html, body {
            background: white !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            visibility: visible !important;
            display: block !important;
          }
          .print-document-root {
            width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: block !important;
            visibility: visible !important;
          }
          .page-sheet {
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            visibility: visible !important;
            display: flex !important;
            overflow: visible !important;
          }
          .page-sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div id="${elementId}" class="print-document-root" dir="rtl">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Allow browser time to render fonts and styles in the iframe, then trigger print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Direct iframe print failed, falling back to window.print():', err);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }
  }, 350);
}
