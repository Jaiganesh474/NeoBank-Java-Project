import React from 'react';

const Logo = ({ className = "brand-logo", size = 32 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <circle cx="50" cy="50" r="48" fill="white" fillOpacity="0.05" stroke="url(#logo-gradient)" strokeWidth="1" />
            <path
                d="M30 70V30L50 55L70 30V70"
                stroke="url(#logo-gradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#logo-glow)"
            />
            <path
                d="M45 50L55 65"
                stroke="#60a5fa"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.8"
            />
        </svg>
    );
};

export default Logo;
