
import React from 'react';
import { ActionButton } from './ActionButton';
import { Icon } from './Icon';

interface HeaderProps {
    onDownload: () => void;
    isDownloading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onDownload, isDownloading }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg">
                        <Icon name="receipt" className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        Kwik Invoice
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <ActionButton onClick={onDownload} variant="primary" disabled={isDownloading} className="hidden lg:inline-flex">
                        <Icon name="download" className="w-5 h-5" />
                        <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                    </ActionButton>
                </div>
            </div>
        </header>
    );
};
