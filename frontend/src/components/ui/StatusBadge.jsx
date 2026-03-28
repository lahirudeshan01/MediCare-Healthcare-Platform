import React from 'react';
export function StatusBadge({ status, className = '' }) {
  const styles = {
    confirmed: 'bg-[#30D158]/10 text-[#30D158]',
    completed: 'bg-[#30D158]/10 text-[#30D158]',
    online: 'bg-[#30D158]/10 text-[#30D158]',
    pending: 'bg-[#FF9F0A]/10 text-[#FF9F0A]',
    cancelled: 'bg-[#FF3B30]/10 text-[#FF3B30]',
    offline: 'bg-[#86868B]/10 text-[#86868B]'
  };
  const labels = {
    confirmed: 'Confirmed',
    completed: 'Completed',
    online: 'Online',
    pending: 'Pending',
    cancelled: 'Cancelled',
    offline: 'Offline'
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]} ${className}`}>
      
      {labels[status]}
    </span>);

}