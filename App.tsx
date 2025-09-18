
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
    
    const options = {
      margin: 0.5,
      filename: `${invoiceData.invoiceNumber || 'invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
        windowHeight: document.documentElement.scrollHeight,
        height: document.documentElement.scrollHeight
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      const pdf = await window.html2pdf().from(element).set(options).outputPdf();
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.filename;
      a.click();
      URL.revokeObjectURL(url);
      setIsDownloading(false);
      return blob; // Return the blob for sharing
    } catch (error) {
      setIsDownloading(false);
      console.error('Error generating PDF:', error);
    }
  };

  const handleShare = async () => {
    try {
      const element = document.getElementById('invoice-to-download');
      if (!element) return;

      setIsDownloading(true);
      const pdf = await handleDownload();
      
      if (pdf && navigator.share) {
        const file = new File([pdf], `${invoiceData.invoiceNumber || 'invoice'}.pdf`, {
          type: 'application/pdf',
        });

        await navigator.share({
          title: `Invoice ${invoiceData.invoiceNumber}`,
          text: `Invoice from ${invoiceData.businessName}`,
          files: [file]
        }).catch((error) => {
          // Fallback for devices that don't support file sharing
          if (error.name === 'NotAllowedError') {
            navigator.share({
              title: `Invoice ${invoiceData.invoiceNumber}`,
              text: `Invoice from ${invoiceData.businessName}`,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsDownloading(false);
    }
  };




  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800">
      <div id="app-container" className="no-print pb-24 lg:pb-0">
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
      
      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] flex items-center gap-3 z-20">
        {mobileView === 'form' ? (
            <ActionButton onClick={() => setMobileView('preview')} className="w-full">
                <Icon name="preview" className="w-5 h-5" />
                <span>Generate Invoice</span>
            </ActionButton>
        ) : (
            <>
                <ActionButton onClick={handleDownload} disabled={isDownloading} className="flex-1">
                    <Icon name="download" className="w-5 h-5" />
                    <span>{isDownloading ? 'Downloading' : 'Download'}</span>
                </ActionButton>
                <ActionButton onClick={handleShare} variant="secondary">
                     <Icon name="share" className="w-5 h-5" />
                     <span>Share</span>
                </ActionButton>
            </>
        )}
      </div>

      <div className="hidden print-area fixed top-0 left-0 w-full min-h-screen bg-white">
         <InvoicePreview containerId="invoice-to-download" invoiceData={invoiceData} subtotal={subtotal} taxAmount={taxAmount} total={total} />
      </div>
    </div>
  );
};

export default App;
