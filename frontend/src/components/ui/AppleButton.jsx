import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
export function AppleButton({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) {
  const baseStyles =
  'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[#0071E3] text-white hover:bg-[#0077ED] focus:ring-[#0071E3]',
    secondary:
    'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] focus:ring-[#1D1D1F]',
    ghost:
    'bg-transparent text-[#0071E3] hover:bg-[#F5F5F7] focus:ring-[#0071E3]',
    danger: 'bg-[#FF3B30] text-white hover:bg-[#FF453A] focus:ring-[#FF3B30]'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  return (
    <motion.button
      whileTap={
      disabled || loading ?
      undefined :
      {
        scale: 0.97
      }
      }
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}>
      
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>);

}