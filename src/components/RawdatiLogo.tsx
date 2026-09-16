import React from 'react';

interface RawdatiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

export const RawdatiLogo: React.FC<RawdatiLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSlogan = false 
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Emblem: Smiling Sun over Open Book */}
      <div className="relative flex-shrink-0">
        <svg 
          viewBox="0 0 100 100" 
          className={isSm ? "w-9 h-9" : isLg ? "w-16 h-16" : "w-12 h-12"}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sun Rays */}
          <g className="animate-spin" style={{ animationDuration: '30s', transformOrigin: '50px 36px' }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="50"
                y1="14"
                x2="50"
                y2="7"
                stroke="#FBBF24"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${angle} 50 36)`}
              />
            ))}
          </g>

          {/* Golden Sun Body */}
          <circle cx="50" cy="36" r="18" fill="#FBBF24" />
          <circle cx="50" cy="36" r="16" fill="#F59E0B" />
          
          {/* Sun Smiling Face */}
          <circle cx="44" cy="33" r="2.2" fill="#78350F" />
          <circle cx="56" cy="33" r="2.2" fill="#78350F" />
          {/* Cheerful blush */}
          <circle cx="40" cy="37" r="2" fill="#F472B6" opacity="0.6" />
          <circle cx="60" cy="37" r="2" fill="#F472B6" opacity="0.6" />
          {/* Smile */}
          <path
            d="M 44 38 Q 50 44 56 38"
            stroke="#78350F"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Open Book / Wings at the bottom */}
          <path
            d="M 18 70 C 30 62, 45 64, 50 72 C 55 64, 70 62, 82 70 C 82 74, 55 86, 50 76 C 45 86, 18 74, 18 70 Z"
            fill="#0284C7"
          />
          <path
            d="M 22 69 C 32 64, 44 65, 49 71 C 47 77, 24 74, 22 69 Z"
            fill="#38BDF8"
          />
          <path
            d="M 78 69 C 68 64, 56 65, 51 71 C 53 77, 76 74, 78 69 Z"
            fill="#34D399"
          />
          
          {/* Sprout / Center Seed */}
          <circle cx="50" cy="71" r="3.5" fill="#FBBF24" />
        </svg>
      </div>

      {/* Typography: "روضتي" */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span 
            className={`font-black tracking-tight text-[#0284C7] leading-none ${
              isSm ? "text-xl" : isLg ? "text-4xl" : "text-2xl sm:text-3xl"
            }`}
            style={{ fontFamily: "'Cairo', 'Tajawal', system-ui, sans-serif" }}
          >
            روضتي
          </span>
          <span className="text-amber-400 text-xs sm:text-sm animate-pulse">✨</span>
        </div>

        {showSlogan && (
          <span className="text-[10px] sm:text-xs text-sky-600 font-bold tracking-wide mt-0.5">
            معاً ... نحو مستقبل مشرق 💛
          </span>
        )}
      </div>
    </div>
  );
};
