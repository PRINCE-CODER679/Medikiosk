import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-xl'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[92vh] sm:max-h-[88vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="min-w-0 pr-2">
            {title && <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusIndicator({
  status = 'operational',
  text,
  className = ''
}) {
  const isOperational = status === 'operational' || status === 'online' || status === 'ok';

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-medium ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {isOperational && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            isOperational ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        ></span>
      </span>
      <span className={isOperational ? 'text-slate-300' : 'text-amber-300'}>
        {text || (isOperational ? 'System Operational' : 'System Notice')}
      </span>
    </div>
  );
}

export function KPICard({
  title,
  value,
  trend,
  trendPositive = true,
  subtitle,
  icon: Icon,
  badge,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col justify-between h-full text-left transition-colors ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                trendPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trendPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {trend}
            </span>
          )}
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-100 font-normal leading-tight">
          {subtitle}
        </p>
      )}
      {badge && <div className="mt-2.5 pt-2 border-t border-slate-100">{badge}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Loading MediKiosk clinical data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-[#1E56A0] mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  description = 'There are currently no items to display in this clinical section.',
  action,
  icon: Icon = Info
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <div className="p-3 bg-white rounded-full shadow-2xs border border-slate-200 mb-3 text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Error Loading Clinical Data',
  description = 'Unable to fetch data from backend. Please check network connection.',
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-red-50/50 rounded-2xl border border-red-200">
      <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
      <h4 className="text-base font-bold text-red-900">{title}</h4>
      <p className="text-xs text-red-600 max-w-md mt-1 mb-4">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}

export function ProgressIndicator({ currentStep = 1, totalSteps = 4, stepNames = [] }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{stepNames[currentStep - 1] || ''}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1E56A0] to-[#0D9488] transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
