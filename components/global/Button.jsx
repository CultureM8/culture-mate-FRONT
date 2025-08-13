"use client";

import { useState } from "react";

function Button({ 
  children = "편집", 
  onClick, 
  disabled = false, 
  className = "",
  ...props 
}) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
    
    setIsClicked(true);
    if (onClick) onClick(e);
    
    // 클릭 효과를 잠시 보여준 후 원래 상태로 복원
    setTimeout(() => {
      setIsClicked(false);
    }, 300);
  };

  const baseStyle = `
    box-border flex flex-row gap-2.5 items-center justify-center 
    px-4 py-2 rounded-lg font-medium text-[16px] text-center 
    font-['Inter:Medium',_'Noto_Sans_KR:Bold',_sans-serif] 
    leading-[1.5] tracking-[0.032px] transition-all duration-300 ease-in-out
    min-w-fit w-auto cursor-pointer
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const colorStyle = isClicked 
    ? "bg-[#4F8FFF] text-[#FFFFFF]" 
    : "bg-[#9EA0A2] text-[#FFFFFF] hover:bg-[#6DADFF]";

  return (
    <button
      className={`${baseStyle} ${colorStyle} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <div className="flex flex-col justify-center not-italic shrink-0 text-nowrap">
        <p className="block whitespace-pre">{children}</p>
      </div>
    </button>
  );
}

export default Button;