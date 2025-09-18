import React from 'react';
import type { InvoiceData, Item } from '../types';
import { ActionButton } from './ActionButton';
import { Icon } from './Icon';

interface InvoiceFormProps {
    invoiceData: InvoiceData;
    onUpdateField: <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => void;
    onAddItem: () => void;
    onUpdateItem: <K extends keyof Item>(id: string, field: K, value: Item[K]) => void;
    onRemoveItem: (id: string) => void;
    onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    subtotal: number;
    taxAmount: number;
    total: number;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
    </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea id={id} {...props} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
    </div>
);

const currencies = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' },
    { symbol: '¥', name: 'JPY' },
    { symbol: '₹', name: 'INR' },
    { symbol: '₦', name: 'NGN' },
];

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
    invoiceData, onUpdateField, onAddItem, onUpdateItem, onRemoveItem, onLogoUpload,
    subtotal, taxAmount, total
}) => {
    
    const handleItemChange = <K extends keyof Item>(id: string, field: K, value: string) => {
        const numericValue = (field === 'quantity' || field === 'price') ? parseFloat(value) || 0 : value;
        onUpdateItem(id, field, numericValue as Item[K]);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    };

    return (
        <div className="space-y-8">
            <FormSection title="Document Type">
                 <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="invoiceType"
                            value="invoice"
                            checked={invoiceData.type === 'invoice'}
                            onChange={() => onUpdateField('type', 'invoice')}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-gray-700">Invoice</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="invoiceType"
                            value="receipt"
                            checked={invoiceData.type === 'receipt'}
                            onChange={() => onUpdateField('type', 'receipt')}
                             className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-gray-700">Receipt</span>
                    </label>
                </div>
            </FormSection>

            <FormSection title="Your Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Company Name" id="businessName" value={invoiceData.businessName} onChange={(e) => onUpdateField('businessName', e.target.value)} />
                    <InputField label="Phone Number" id="businessPhone" value={invoiceData.businessPhone} onChange={(e) => onUpdateField('businessPhone', e.target.value)} />
                    <div className="md:col-span-2">
                        <TextAreaField label="Company Address" id="businessAddress" value={invoiceData.businessAddress} onChange={(e) => onUpdateField('businessAddress', e.target.value)} rows={3} />
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-600 mb-1">Company Logo</label>
                    <div className="mt-1 flex items-center gap-4">
                        {invoiceData.businessLogo && <img src={invoiceData.businessLogo} alt="Company Logo" className="h-16 w-16 object-contain rounded-md bg-gray-100 p-1" />}
                        <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                            <span>{invoiceData.businessLogo ? 'Change Logo' : 'Upload Logo'}</span>
                            <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={onLogoUpload} accept="image/*" />
                        </label>
                         {invoiceData.businessLogo && <button onClick={() => onUpdateField('businessLogo', null)} className="text-sm text-red-500 hover:text-red-700">Remove</button>}
                    </div>
                </div>
            </FormSection>

            <FormSection title="Client Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Client Name" id="clientName" value={invoiceData.clientName} onChange={(e) => onUpdateField('clientName', e.target.value)} />
                     <div className="md:col-span-2">
                        <TextAreaField label="Client Address" id="clientAddress" value={invoiceData.clientAddress} onChange={(e) => onUpdateField('clientAddress', e.target.value)} rows={3} />
                    </div>
                </div>
            </FormSection>
            
            <FormSection title={invoiceData.type === 'receipt' ? 'Receipt Details' : 'Invoice Details'}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InputField label={invoiceData.type === 'receipt' ? 'Receipt Number' : 'Invoice Number'} id="invoiceNumber" value={invoiceData.invoiceNumber} onChange={(e) => onUpdateField('invoiceNumber', e.target.value)} />
                    <InputField label={invoiceData.type === 'receipt' ? 'Date' : 'Invoice Date'} id="invoiceDate" type="date" value={invoiceData.invoiceDate} onChange={(e) => onUpdateField('invoiceDate', e.target.value)} />
                    {invoiceData.type === 'invoice' && (
                        <InputField label="Due Date" id="dueDate" type="date" value={invoiceData.dueDate} onChange={(e) => onUpdateField('dueDate', e.target.value)} />
                    )}
                </div>
            </FormSection>
            
            <FormSection title="Items">
                <div className="space-y-4">
                    {invoiceData.items.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg border">
                            <div className="col-span-12 md:col-span-5">
                                {index === 0 && <label className="text-xs font-medium text-gray-500">Description</label>}
                                <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Item description" />
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                 {index === 0 && <label className="text-xs font-medium text-gray-500">Qty</label>}
                                <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="1"/>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                {index === 0 && <label className="text-xs font-medium text-gray-500">Price</label>}
                                <input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="0.00"/>
                            </div>
                            <div className="col-span-4 md:col-span-2 flex items-end">
                                <span className="p-2 text-gray-600 tabular-nums">{invoiceData.currency}{formatNumber(item.quantity * item.price)}</span>
                            </div>
                            <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                               <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition">
                                    <Icon name="trash" className="w-5 h-5" />
                               </button>
                            </div>
                        </div>
                    ))}
                </div>
                <ActionButton onClick={onAddItem} variant="secondary" className="mt-4">
                    <Icon name="plus" className="w-5 h-5" />
                    <span>Add Item</span>
                </ActionButton>
            </FormSection>

            <FormSection title="Summary & Notes">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <TextAreaField label="Notes / Terms" id="notes" value={invoiceData.notes} onChange={(e) => onUpdateField('notes', e.target.value)} rows={4} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                         <div className="flex justify-between items-center">
                            <label htmlFor="currency" className="text-sm font-medium text-gray-600">Currency</label>
                            <select
                                id="currency"
                                value={invoiceData.currency}
                                onChange={(e) => onUpdateField('currency', e.target.value)}
                                className="w-36 p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {currencies.map(c => <option key={c.name} value={c.symbol}>{c.name} ({c.symbol})</option>)}
                            </select>
                        </div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="taxRate" className="text-sm font-medium text-gray-600">Tax Rate (%)</label>
                            <input id="taxRate" type="number" value={invoiceData.taxRate} onChange={(e) => onUpdateField('taxRate', parseFloat(e.target.value) || 0)} className="w-36 p-2 border border-gray-300 rounded-md" />
                        </div>

                        <div className="space-y-2 pt-2 text-right font-medium">
                           <div className="flex justify-between items-center text-gray-600"><span>Subtotal:</span> <span>{invoiceData.currency}{formatNumber(subtotal)}</span></div>
                           <div className="flex justify-between items-center text-gray-600"><span>Tax ({invoiceData.taxRate}%):</span> <span>{invoiceData.currency}{formatNumber(taxAmount)}</span></div>
                           <hr className="my-2"/>
                           <div className="flex justify-between items-center text-lg font-bold text-gray-800"><span>Total:</span> <span>{invoiceData.currency}{formatNumber(total)}</span></div>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 border-b pb-3 mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);