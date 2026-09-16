import React, { useState } from 'react';

interface ChildAvatarProps {
  name: string;
  gender?: 'male' | 'female';
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ChildAvatar: React.FC<ChildAvatarProps> = ({
  name,
  gender = 'male',
  photoUrl,
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  // Size mapping
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  // Determine gender heuristic if not explicitly set
  const isFemale = gender === 'female' || 
    name.includes('مريم') || 
    name.includes('سارة') || 
    name.includes('لينا') || 
    name.includes('دانية') || 
    name.includes('سلمى') || 
    name.includes('فاطمة') || 
    name.includes('نور') || 
    name.includes('آية');

  // If a valid image URL is given and didn't fail
  if (photoUrl && !imgError && !photoUrl.includes('placeholder')) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-xs flex-shrink-0 ${className}`}
      />
    );
  }

  // Cartoon stylized child avatar matching image.png
  if (isFemale) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-pink-100 to-amber-100 border-2 border-white shadow-xs flex items-center justify-center flex-shrink-0 relative overflow-hidden ${className}`}
        title={name}
      >
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
          {/* Background circle */}
          <circle cx="18" cy="18" r="18" fill="#FCE7F3" />
          
          {/* Hair back */}
          <path d="M7 22 C6 14, 10 7, 18 7 C26 7, 30 14, 29 22 C29 25, 27 27, 24 24 C21 21, 23 15, 18 15 C13 15, 15 21, 12 24 C9 27, 7 25, 7 22 Z" fill="#92400E" />
          {/* Pigtails / Buns */}
          <circle cx="8" cy="14" r="4.5" fill="#92400E" />
          <circle cx="28" cy="14" r="4.5" fill="#92400E" />
          <circle cx="8" cy="14" r="2" fill="#F43F5E" />
          <circle cx="28" cy="14" r="2" fill="#F43F5E" />

          {/* Clothes */}
          <path d="M10 36 C10 29, 26 29, 26 36 Z" fill="#FB923C" />
          <path d="M14 36 L18 31 L22 36 Z" fill="#FDE047" />

          {/* Face */}
          <circle cx="18" cy="20" r="8" fill="#FED7AA" />
          
          {/* Bangs */}
          <path d="M11 17 C13 13, 16 13, 18 15 C20 13, 23 13, 25 17 C22 15, 14 15, 11 17 Z" fill="#78350F" />

          {/* Eyes */}
          <circle cx="15" cy="19" r="1.2" fill="#1E293B" />
          <circle cx="21" cy="19" r="1.2" fill="#1E293B" />
          
          {/* Cheerful blush */}
          <circle cx="13.5" cy="21.5" r="1.3" fill="#F43F5E" opacity="0.4" />
          <circle cx="22.5" cy="21.5" r="1.3" fill="#F43F5E" opacity="0.4" />

          {/* Smile */}
          <path d="M16 22.5 Q18 25 20 22.5" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Boy cartoon avatar
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-sky-100 to-cyan-100 border-2 border-white shadow-xs flex items-center justify-center flex-shrink-0 relative overflow-hidden ${className}`}
      title={name}
    >
      <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
        {/* Background circle */}
        <circle cx="18" cy="18" r="18" fill="#E0F2FE" />
        
        {/* Clothes */}
        <path d="M9 36 C9 28, 27 28, 27 36 Z" fill="#0284C7" />
        <circle cx="18" cy="30" r="2.5" fill="#38BDF8" />

        {/* Neck */}
        <rect x="16" y="24" width="4" height="4" fill="#FDBA74" />

        {/* Face */}
        <circle cx="18" cy="19" r="7.5" fill="#FED7AA" />
        
        {/* Hair - spiky cute boy hair */}
        <path d="M10 17 C10 10, 14 8, 18 8 C22 8, 26 10, 26 17 C25 13, 22 11, 18 12 C14 11, 11 13, 10 17 Z" fill="#78350F" />
        <path d="M12 11 L14 8 L16 11 L19 7 L21 11 L24 9 L25 13 Z" fill="#78350F" />

        {/* Eyes */}
        <circle cx="15.5" cy="18.5" r="1.2" fill="#1E293B" />
        <circle cx="20.5" cy="18.5" r="1.2" fill="#1E293B" />
        
        {/* Cheerful blush */}
        <circle cx="14" cy="21" r="1.2" fill="#F43F5E" opacity="0.3" />
        <circle cx="22" cy="21" r="1.2" fill="#F43F5E" opacity="0.3" />

        {/* Smile */}
        <path d="M16 21.5 Q18 24 20 21.5" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
};
