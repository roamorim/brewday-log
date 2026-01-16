import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyle = "w-full py-3 px-4 rounded-lg font-semibold transition-colors flex justify-center items-center gap-2";
  
  const variants = {
    primary: "bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800",
    secondary: "bg-amber-100 text-amber-800 hover:bg-amber-200 active:bg-amber-300",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    outline: "bg-transparent border-2 border-amber-600 text-amber-600 hover:bg-amber-50"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;