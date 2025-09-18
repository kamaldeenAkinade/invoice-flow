
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className || ''}`;

    return (
        <button {...props} className={combinedClasses}>
            {children}
        </button>
    );
};
