
import React, { useState } from 'react';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { useInvoice } from './hooks/useInvoice';
import { ActionButton } from './components/ActionButton';
import { Icon } from './components/Icon';

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

  const handleDownload = async () => {
    const element = document.getElementById('invoice-to-download');
    if (!element) return;

    setIsDownloading(true);

    try {
      // First, create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Clone the invoice content
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.display = 'block';
      clone.style.width = '210mm';
      clone.style.padding = '10mm';
      clone.style.backgroundColor = 'white';
      container.appendChild(clone);

      // Wait for images to load
      await Promise.all(
        Array.from(clone.getElementsByTagName('img')).map(
          (img: HTMLImageElement) =>
            new Promise((resolve) => {
              if (img.complete) resolve(null);
              else img.onload = () => resolve(null);
            })
        )
      );

      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const opt = {
        margin: 0,
        filename: `${invoiceData.invoiceNumber || 'invoice'}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          scrollY: 0,
          windowWidth: 794, // A4 width in pixels
          windowHeight: 1123, // A4 height in pixels
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          hotfixes: ['px_scaling']
        }
      };

      await window.html2pdf().from(clone).set(opt).save();

      // Cleanup
      document.body.removeChild(container);
      setIsDownloading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsDownloading(false);
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
        const file = new File([blob], opt.filename, {
          type: 'application/pdf',
        });

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
