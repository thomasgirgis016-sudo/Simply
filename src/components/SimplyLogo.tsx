import React, { useState } from 'react';

interface SimplyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export const SimplyLogo: React.FC<SimplyLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'full',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { img: 'h-7 w-7', text: 'text-base', sub: 'text-[9px]' },
    md: { img: 'h-9 w-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { img: 'h-12 w-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'h-16 w-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Graduation Cap "S" Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        {!imgError ? (
          <img
            src="/simply-logo.png"
            alt="Simply IGCSE"
            className={`${currentSize.img} object-contain rounded-xl drop-shadow-md`}
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-Fidelity Vector SVG Fallback with exact Coral-to-Amber gradient cap */
          <svg
            className={`${currentSize.img} drop-shadow-md`}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="simplyGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#FF4B4B" />
                <stop offset="50%" stopColor="#FF6B4A" />
                <stop offset="100%" stopColor="#FFA63A" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF5A4A" floodOpacity="0.4" />
              </filter>
            </defs>
            {/* Graduation Mortarboard Diamond Cap */}
            <path
              d="M50 16 L88 32 L50 48 L12 32 Z"
              fill="none"
              stroke="url(#simplyGrad)"
              strokeWidth="5.5"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            {/* Cap Skull Base */}
            <path
              d="M26 38.5 V52 C26 62 74 62 74 52 V38.5"
              fill="none"
              stroke="url(#simplyGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Tassel */}
            <path
              d="M84 34 V52 M84 52 L87 56"
              stroke="url(#simplyGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Interlacing S Curve */}
            <path
              d="M62 38 C40 38 30 48 30 58 C30 72 70 66 70 80 C70 90 56 94 40 92 C32 91 26 86 24 82"
              fill="none"
              stroke="url(#simplyGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Typography: "Simply" */}
      {showText && variant === 'full' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-white ${currentSize.text} font-['Plus_Jakarta_Sans',sans-serif]`}
            >
              Simply
            </span>
            <span className="rounded-md bg-gradient-to-r from-[#FF5E62] to-[#FFA63A] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-950 shadow-sm">
              IGCSE
            </span>
          </div>
          <span className={`font-semibold tracking-wide text-slate-400 mt-0.5 ${currentSize.sub}`}>
            AI Examination Suite
          </span>
        </div>
      )}
    </div>
  );
};
