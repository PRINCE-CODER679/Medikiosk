import React from 'react';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = true,
  hoverable = false,
  bordered = true,
  ...props
}) {
  const borderClass = bordered ? 'border border-slate-200/90' : '';
  const hoverClass = hoverable ? 'transition-all duration-150 hover:shadow-xs hover:border-slate-300' : '';
  const paddingClass = padding ? 'p-4 sm:p-5' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-2xs ${borderClass} ${hoverClass} ${paddingClass} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100 ${padding ? 'mb-4' : 'px-4 sm:px-5 pt-4 sm:pt-5 mb-0'}`}>
          <div className="text-left">
            {title && <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="self-start sm:self-auto">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-[#1E56A0] border-blue-200',
    secondary: 'bg-teal-50 text-teal-700 border-teal-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    critical: 'bg-red-600 text-white font-semibold animate-pulse border-red-700'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-transparent transition-colors ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'danger' || variant === 'critical'
              ? 'bg-red-500'
              : variant === 'success'
              ? 'bg-emerald-500'
              : variant === 'warning'
              ? 'bg-amber-500'
              : 'bg-blue-500'
          }`}
        />
      )}
      {children}
    </span>
  );
}

export function Avatar({
  name = 'User',
  src,
  size = 'md',
  status,
  className = ''
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-xl font-bold'
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`rounded-full object-cover border border-slate-200 ${sizes[size] || sizes.md} ${className}`}
        />
      ) : (
        <div
          className={`rounded-full bg-gradient-to-br from-[#1E56A0] to-[#0D9488] text-white flex items-center justify-center font-medium shadow-xs ${sizes[size] || sizes.md} ${className}`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            status === 'active' || status === 'online'
              ? 'bg-emerald-500'
              : status === 'busy'
              ? 'bg-red-500'
              : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
}
