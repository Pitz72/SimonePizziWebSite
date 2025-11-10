import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-250 relative overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-bg-primary border-2 border-primary-500 hover:shadow-lg hover:shadow-glow hover:-translate-y-0.5 focus:ring-primary-500',
    secondary: 'bg-transparent text-primary-500 border-2 border-primary-500 hover:bg-primary-500 hover:text-bg-primary hover:-translate-y-0.5 focus:ring-primary-500',
    ghost: 'bg-transparent text-text-secondary border-2 border-transparent hover:bg-bg-secondary hover:text-primary-500 hover:border-border-primary focus:ring-primary-500',
    outline: 'bg-transparent text-text-primary border-2 border-border-primary hover:border-primary-500 hover:text-primary-500 focus:ring-primary-500',
    danger: 'bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 hover:border-red-700 hover:-translate-y-0.5 focus:ring-red-500',
    success: 'bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 hover:border-green-700 hover:-translate-y-0.5 focus:ring-green-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
    xl: 'px-8 py-4 text-xl rounded-xl',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const loadingClasses = loading ? 'cursor-wait' : '';
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${loadingClasses} ${className}`;
  
  const content = (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'flex items-center gap-2'}>
        {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
        {children}
        {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />}
      </span>
    </>
  );
  
  if (href) {
    return (
      <a 
        href={href}
        className={buttonClasses}
        {...props}
      >
        {content}
      </a>
    );
  }
  
  if (to) {
    return (
      <Link 
        to={to}
        className={buttonClasses}
        {...props}
      >
        {content}
      </Link>
    );
  }
  
  return (
    <button 
      type="button"
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button; 