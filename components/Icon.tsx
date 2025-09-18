import React from 'react';

interface IconProps {
    name: 'receipt' | 'download' | 'share' | 'trash' | 'plus';
    className?: string;
}

// FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
// FIX: Specify <any> for React.ReactElement to allow cloning with new props like className.
const icons: Record<IconProps['name'], React.ReactElement<any>> = {
    receipt: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
    ),
    download: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    share: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 4.186m0-4.186c.18.32.32.658.41 1.013m-.41-1.013A2.25 2.25 0 005.625 12m1.592-1.093a2.25 2.25 0 013.84 0m-3.84 0a2.25 2.25 0 00-1.592 1.093m1.592-1.093c.18.32.32.658.41 1.013m0 0a2.25 2.25 0 013.119 2.062M16.5 12a2.25 2.25 0 100-4.186m0 4.186c-.18-.32-.32-.658-.41-1.013m.41 1.013a2.25 2.25 0 001.592 1.093m-1.592-1.093a2.25 2.25 0 01-3.84 0m3.84 0a2.25 2.25 0 001.592-1.093m-1.592-1.093c-.18-.32-.32-.658-.41-1.013m0 0a2.25 2.25 0 01-3.119-2.062" />
        </svg>
    ),
    trash: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.124 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    plus: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
};

export const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
    return React.cloneElement(icons[name], { className });
};