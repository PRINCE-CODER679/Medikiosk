import React from 'react';
import { Search } from 'lucide-react';

export function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:border-[#1E56A0] focus:ring-2 focus:ring-blue-100 transition-all ${
            Icon ? 'pl-9' : 'px-3.5'
          } py-2.5 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  options = [],
  error,
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:border-[#1E56A0] focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 transition-all ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SearchBar({
  placeholder = 'Search patients, encounters, ABHA ID...',
  value,
  onChange,
  className = '',
  ...props
}) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200/90 text-slate-900 text-sm rounded-xl pl-9 pr-4 py-2 focus:border-[#1E56A0] focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400 shadow-2xs"
        {...props}
      />
    </div>
  );
}
