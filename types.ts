export interface Item {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  type: 'invoice' | 'receipt';
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessLogo: string | null;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: Item[];
  taxRate: number;
  notes: string;
  currency: string;
}