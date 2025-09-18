import React, { useState } from 'react';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { useInvoice } from './hooks/useInvoice';
import { ActionButton } from './components/ActionButton';
import { Icon } from './components/Icon';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

declare global {
  interface Window {
    html2pdf: any;
  }
}

const App: React.FC = () => {
  const {
    invoiceData,
    updateField,
    addItem,
    updateItem,
    removeItem,
    subtotal,
    taxAmount,
    total,
    handleLogoUpload,
  } = useInvoice();

  const [isDownloading, setIsDownloading] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  const generatePDF = async (element: HTMLElement): Promise<void> => {
    try {
      console.log('Starting robust PDF generation (sliced pages)...');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff'
      });

      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

      // jsPDF uses points by default when unit='pt'
      const PDF_UNIT = 'pt';
      const PDF_FORMAT = 'a4';
      const pdf = new jsPDF({ unit: PDF_UNIT, format: PDF_FORMAT, orientation: 'portrait' });

      // A4 size in points
      const PDF_WIDTH = pdf.internal.pageSize.getWidth();
      const PDF_HEIGHT = pdf.internal.pageSize.getHeight();
      console.log('PDF page size (pt):', PDF_WIDTH, 'x', PDF_HEIGHT);

      // Canvas size in pixels -> convert to points (1pt = 1.3333px at 96dpi).
      // But instead of guessing DPI, compute scale to fit width.
      const pxToPt = (px: number) => (px * 72) / 96; // convert px -> pt assuming 96 DPI

      const canvasWidthPt = pxToPt(canvas.width);
      const canvasHeightPt = pxToPt(canvas.height);

      // Scale so canvas fits PDF width
      const scale = Math.min(1, PDF_WIDTH / canvasWidthPt);
      const renderedWidthPt = canvasWidthPt * scale;
      const renderedHeightPt = canvasHeightPt * scale;

      console.log('Rendered (pt):', renderedWidthPt, 'x', renderedHeightPt, 'scale:', scale);

      // Slice the canvas into page-sized chunks (in pixels)
      const pageHeightPx = Math.floor((PDF_HEIGHT / pxToPt(1)) / scale); // page height in px at current scale
      const totalPages = Math.ceil(canvas.height / pageHeightPx);
      console.log('pageHeightPx:', pageHeightPx, 'totalPages:', totalPages);

      for (let page = 0; page < totalPages; page++) {
        const sourceY = page * pageHeightPx;
        const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

        // create temporary canvas for the page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        const imgData = pageCanvas.toDataURL('image/jpeg', 1.0);

        // Diagnostics: log sizes and data length
        console.log(`page ${page + 1}/${totalPages} - sourceY=${sourceY} sliceH=${sliceHeight} pageCanvas=${pageCanvas.width}x${pageCanvas.height}`);
        console.log(`imgData length: ${imgData.length}`);

        // compute size in points for this slice
        const imgWidthPt = pxToPt(pageCanvas.width) * scale;
        const imgHeightPt = pxToPt(pageCanvas.height) * scale;

        // center horizontally, top aligned per page
        const x = (PDF_WIDTH - imgWidthPt) / 2;
        const y = 0;

        // Defensive checks: ensure numbers are finite and non-negative and non-zero
        const coords = [x, y, imgWidthPt, imgHeightPt];
        if (!coords.every((n) => Number.isFinite(n) && !Number.isNaN(n) && n >= 0)) {
          console.error('Invalid numeric coordinates for addImage:', coords);
          throw new Error('Invalid numeric coordinates for addImage: ' + coords.join(','));
        }
        if (imgWidthPt === 0 || imgHeightPt === 0) {
          console.error('Computed image width/height is zero:', imgWidthPt, imgHeightPt);
          throw new Error('Computed image width/height is zero');
        }

        // For pages after the first, add a new page
        if (page > 0) pdf.addPage();

        // Final check: sample a few pixels to ensure not blank
        try {
          const ctxCheck = pageCanvas.getContext('2d');
          if (ctxCheck) {
            const sample = ctxCheck.getImageData(0, 0, Math.min(10, pageCanvas.width), Math.min(10, pageCanvas.height)).data;
            let nonWhite = 0;
            for (let i = 0; i < sample.length; i += 4) {
              const r = sample[i], g = sample[i + 1], b = sample[i + 2];
              if (!(r === 255 && g === 255 && b === 255)) nonWhite++;
            }
            console.log('sample non-white pixels:', nonWhite);
          }
        } catch (e) {
          console.warn('Could not sample pixels for diagnostics', e);
        }

        pdf.addImage(imgData, 'JPEG', x, y, imgWidthPt, imgHeightPt);
      }

      pdf.save(`${invoiceData.invoiceNumber || 'invoice'}.pdf`);
      console.log('PDF saved successfully (sliced).');
    } catch (err) {
      console.error('Error generating PDF (sliced):', err);
      throw err;
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('invoice-to-download');
    if (!element) {
        console.error('Element with ID "invoice-to-download" not found.');
        return;
    }

    setIsDownloading(true);
    console.log('Starting PDF generation process...');

  let clone: HTMLElement | null = null;
  try {
    // The invoice HTML is inside a hidden container in the app.
    // Clone it and attach off-screen so html2canvas can measure and render it.
    clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.display = 'block';
    clone.style.width = '210mm';
    clone.style.backgroundColor = 'white';
    clone.style.padding = '10mm';
    clone.style.margin = '0';
    document.body.appendChild(clone);
  console.log('Cloned invoice appended off-screen for PDF generation.');

  // Give the browser a tick to apply styles, load fonts/images and finish layout
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 150)));

  // Generate and save PDF from the clone
  await generatePDF(clone);
  console.log('PDF generated and downloaded successfully.');
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        setIsDownloading(false);
    if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
    // keep original element hidden again
    element.style.display = 'none';
    console.log('PDF generation process completed.');
    }
  };

  const handleShare = async () => {
    const element = document.getElementById('invoice-to-download');
    if (!element) return;

    setIsDownloading(true);
    element.style.display = 'block';

    try {
        const opt = {
            margin: 10,
            filename: `${invoiceData.invoiceNumber || 'invoice'}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                onclone: function(clonedDoc) {
                    const element = clonedDoc.getElementById('invoice-to-download');
                    if (element) {
                        element.style.display = 'block';
                    }
                }
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const pdf = await window.html2pdf().set(opt).from(element).outputPdf();

        if (navigator.share) {
            const blob = new Blob([pdf], { type: 'application/pdf' });
            const file = new File([blob], opt.filename, { type: 'application/pdf' });

            try {
                await navigator.share({
                    title: `Invoice ${invoiceData.invoiceNumber}`,
                    text: `Invoice from ${invoiceData.businessName}`,
                    files: [file]
                });
            } catch (error) {
        if (error.name === 'NotAllowedError') {
          await navigator.share({
            title: `Invoice ${invoiceData.invoiceNumber}`,
            text: `Invoice from ${invoiceData.businessName}`,
          });
        } else {
          throw error;
        }
            }
        }
    } catch (error) {
        console.error('Error sharing:', error);
    } finally {
        setIsDownloading(false);
        element.style.display = 'none';
    }
  };




  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800 pb-24 lg:pb-0">
      <div id="app-container" className="no-print">
        <Header onDownload={handleDownload} isDownloading={isDownloading} />
        <main className="p-4 md:p-8 lg:p-12">
          {/* Mobile View Switcher */}
          <div className="lg:hidden mb-4 p-1 bg-gray-200 rounded-lg flex items-center text-sm font-medium">
            <button
              onClick={() => setMobileView('form')}
              className={`w-1/2 p-2 rounded-md transition-colors ${mobileView === 'form' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
              aria-pressed={mobileView === 'form'}
            >
              Edit
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`w-1/2 p-2 rounded-md transition-colors ${mobileView === 'preview' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
              aria-pressed={mobileView === 'preview'}
            >
              Preview
            </button>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Form View */}
            <div className={`${mobileView === 'form' ? 'block' : 'hidden'} lg:block`}>
              <InvoiceForm
                invoiceData={invoiceData}
                onUpdateField={updateField}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onLogoUpload={handleLogoUpload}
                subtotal={subtotal}
                taxAmount={taxAmount}
                total={total}
              />
            </div>
             {/* Preview View */}
            <div className={`${mobileView === 'preview' ? 'block' : 'hidden'} lg:block`}>
              <div className="lg:sticky lg:top-8">
                <InvoicePreview containerId="invoice-preview-visible" invoiceData={invoiceData} subtotal={subtotal} taxAmount={taxAmount} total={total} />
              </div>
            </div>
          </div>
        </main>
      </div>
      
    {/* Mobile Fixed Footer */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center gap-3 z-50">
    {mobileView === 'form' ? (
      <ActionButton onClick={() => setMobileView('preview')} className="w-full py-3">
        <Icon name="preview" className="w-5 h-5" />
        <span>Generate {invoiceData.type === 'invoice' ? 'Invoice' : 'Receipt'}</span>
      </ActionButton>
    ) : (
      <>
        <ActionButton onClick={handleDownload} disabled={isDownloading} className="flex-1 py-3">
          <Icon name="download" className="w-5 h-5" />
          <span>{isDownloading ? 'Generating...' : 'Download'}</span>
        </ActionButton>
        <ActionButton onClick={handleShare} variant="secondary" className="flex-1 py-3">
           <Icon name="share" className="w-5 h-5" />
           <span>Share</span>
        </ActionButton>
      </>
    )}
    </div>

      {/* Add padding at the bottom to prevent content from being hidden behind fixed footer */}
      <div className="lg:hidden h-20"></div>

      <div className="hidden">
        <div id="invoice-to-download" className="bg-white" style={{ width: '210mm', margin: '0 auto' }}>
          <InvoicePreview invoiceData={invoiceData} subtotal={subtotal} taxAmount={taxAmount} total={total} />
        </div>
      </div>
    </div>
  );
};

export default App;
