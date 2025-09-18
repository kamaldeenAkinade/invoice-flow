import { useState, useMemo, useCallback, ChangeEvent } from 'react';
import type { InvoiceData, Item } from '../types';

const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const getDueDate = (): string => {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    return today.toISOString().split('T')[0];
}

export const useInvoice = () => {
    const [invoiceData, setInvoiceData] = useState<InvoiceData>({
        type: 'invoice',
        businessName: 'Your Company',
        businessAddress: '123 Business St, Suite 100\nCity, State 12345',
        businessPhone: '555-123-4567',
        businessLogo: null,
        clientName: 'Client Company',
        clientAddress: '456 Client Ave\nClient City, State 67890',
        invoiceNumber: 'INV-001',
        invoiceDate: getTodayDate(),
        dueDate: getDueDate(),
        items: [
            { id: nanoid(), description: 'Item Description', quantity: 1, price: 0 },
        ],
        taxRate: 0,
        notes: 'Thank you for your business!',
        currency: '₦',
    });

    const updateField = useCallback(<K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }));
    }, []);

    const addItem = useCallback(() => {
        setInvoiceData(prev => ({
            ...prev,
            items: [...prev.items, { id: nanoid(), description: '', quantity: 1, price: 0 }]
        }));
    }, []);
    
    const removeItem = useCallback((id: string) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    }, []);

    const updateItem = useCallback(<K extends keyof Item>(id: string, field: K, value: Item[K]) => {
        setInvoiceData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    }, []);

    // FIX: Replaced React.ChangeEvent with ChangeEvent to resolve "Cannot find namespace 'React'" error.
    const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    updateField('businessLogo', result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const subtotal = useMemo(() => 
        invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0),
        [invoiceData.items]
    );

    const taxAmount = useMemo(() => 
        (subtotal * invoiceData.taxRate) / 100,
        [subtotal, invoiceData.taxRate]
    );

    const total = useMemo(() => 
        subtotal + taxAmount,
        [subtotal, taxAmount]
    );
    
    return {
        invoiceData,
        updateField,
        addItem,
        removeItem,
        updateItem,
        handleLogoUpload,
        subtotal,
        taxAmount,
        total,
    };
};

// nanoid implementation to avoid external dependency
const a="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
const nanoid=(b=21)=>{let c="",d=crypto.getRandomValues(new Uint8Array(b));for(;b--;){let e=63&d[b];e<36?c+=e.toString(36):e<62?c+=String.fromCharCode(e+29):c+=e<63?String.fromCharCode(e+32):String.fromCharCode(e+33)}return c};