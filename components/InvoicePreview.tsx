import React from 'react';
import type { InvoiceData } from '../types';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  subtotal: number;
  taxAmount: number;
  total: number;
  containerId?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData, subtotal, taxAmount, total, containerId }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  return (
    <div id={containerId || "invoice-preview"} className="p-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto border border-gray-200 min-h-[29.7cm]">
      <header className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
        <div>
          {invoiceData.businessLogo && (
            <img src={invoiceData.businessLogo} alt="Business Logo" className="h-20 max-w-xs object-contain mb-2" />
          )}
          <h1 className="text-3xl font-bold text-gray-800">{invoiceData.businessName}</h1>
          <p className="text-sm text-gray-500 whitespace-pre-line mt-2">{invoiceData.businessAddress}</p>
          <p className="text-sm text-gray-500 mt-1">{invoiceData.businessPhone}</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-gray-400 uppercase tracking-wider">{invoiceData.type}</h2>
          <p className="text-sm text-gray-500 mt-2"># {invoiceData.invoiceNumber}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Bill To</h3>
          <p className="font-bold text-gray-800 mt-1">{invoiceData.clientName}</p>
          <p className="text-sm text-gray-500 whitespace-pre-line">{invoiceData.clientAddress}</p>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2">
            <span className="font-semibold text-gray-500">{invoiceData.type === 'receipt' ? 'Date:' : 'Invoice Date:'}</span>
            <span className="text-gray-800">{invoiceData.invoiceDate}</span>
          </div>
          {invoiceData.type === 'invoice' && (
            <div className="grid grid-cols-2 mt-1">
              <span className="font-semibold text-gray-500">Due Date:</span>
              <span className="text-gray-800">{invoiceData.dueDate}</span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-sm font-semibold text-gray-600">
              <th className="p-3 rounded-l-lg w-1/2">Description</th>
              <th className="p-3 text-center whitespace-nowrap">Qty</th>
              <th className="p-3 text-right whitespace-nowrap">Unit Price</th>
              <th className="p-3 text-right rounded-r-lg whitespace-nowrap">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="p-3 font-medium">{item.description}</td>
                <td className="p-3 text-center whitespace-nowrap">{item.quantity}</td>
                <td className="p-3 text-right whitespace-nowrap">{invoiceData.currency}{formatNumber(item.price)}</td>
                <td className="p-3 text-right font-semibold whitespace-nowrap">{invoiceData.currency}{formatNumber(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex justify-end mt-8">
        <div className="w-full max-w-sm space-y-2 text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-gray-800">{invoiceData.currency}{formatNumber(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({invoiceData.taxRate}%)</span>
            <span className="font-medium text-gray-800">{invoiceData.currency}{formatNumber(taxAmount)}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between text-xl font-bold text-gray-800 bg-gray-100 p-3 rounded-lg">
            <span>Total</span>
            <span>{invoiceData.currency}{formatNumber(total)}</span>
          </div>
        </div>
      </section>
      
      {invoiceData.notes && (
          <section className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Notes</h3>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{invoiceData.notes}</p>
          </section>
      )}
    </div>
  );
};