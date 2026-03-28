import React from 'react';
import { motion } from 'framer-motion';
export function GlassCard({
  children,
  className = '',
  hover = false,
  ...props
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      whileHover={
      hover ?
      {
        scale: 1.02,
        y: -5,
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
      } :
      undefined
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 overflow-hidden ${hover ? 'cursor-pointer' : ''} ${className}`}
      {...props}>
      
      {children}
    </motion.div>);

}