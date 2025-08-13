"use client";

function Button({ 
  children = "버튼", 
  disabled = false,
  backgroundColor = "#C6C8CA",
  textColor = "#000000",
  className = "",
  ...props
}) {
  const baseStyle = `
    px-4 py-2 rounded-lg
    transition-all duration-100 ease-in-out
    cursor-pointer
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const colorStyle = {
    backgroundColor: backgroundColor,
    color: textColor
  };

  return (
    <button
      {...props}
      className={`${baseStyle} ${className}`}
      style={{ ...colorStyle, ...props.style }}
      disabled={disabled}
    >
      <div className="shrink-0 text-nowrap">
        {children}
      </div>
    </button>
  );
}

export default Button;