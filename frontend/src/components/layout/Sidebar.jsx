import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Stethoscope,
  FileText,
  Clock,
  Brain,
  FileSearch,
  AlertTriangle,
  Link,
  RefreshCw,
  Building2,
  ShieldCheck,
  Settings,
  Monitor,
  Activity,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { StatusIndicator } from '../ui/OverlayAndFeedback';

export function Sidebar({ isOpen = false, onClose, className = '' }) {
  const location = useLocation();
  const { t } = useTranslation();

  const navSections = [
    {
      title: t('sidebar_overview', 'OVERVIEW'),
      items: [
        { label: t('nav_dashboard'), path: '/dashboard', icon: LayoutDashboard },
        { label: t('nav_analytics'), path: '/analytics', icon: BarChart3 }
      ]
    },
    {
      title: t('sidebar_clinical', 'CLINICAL'),
      items: [
        { label: t('nav_patients'), path: '/patients', icon: Users },
        { label: t('nav_encounters'), path: '/encounters', icon: Stethoscope },
        { label: t('nav_summaries'), path: '/patients/PAT-10928', icon: FileText },
        { label: t('nav_timeline'), path: '/timeline', icon: Clock }
      ]
    },
    {
      title: t('sidebar_intelligence', 'INTELLIGENCE'),
      items: [
        { label: t('nav_insights'), path: '/analytics', icon: Brain },
        { label: t('nav_documents'), path: '/documents', icon: FileSearch },
        { label: t('nav_redflags'), path: '/alerts', icon: AlertTriangle, badge: '3', badgeColor: 'bg-[#DC2626]' }
      ]
    },
    {
      title: t('sidebar_integration', 'INTEGRATION'),
      items: [
        { label: 'ABDM / ABHA', path: '/integrations', icon: Link },
        { label: 'FHIR', path: '/integrations', icon: RefreshCw },
        { label: 'HIS / EMR', path: '/integrations', icon: Building2 }
      ]
    },
    {
      title: t('sidebar_system', 'SYSTEM'),
      items: [
        { label: t('nav_security'), path: '/settings', icon: ShieldCheck },
        { label: t('nav_settings'), path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside
      className={`
        w-64 bg-gradient-to-b from-[#090E17] via-[#0F172A] to-[#0B1120] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 shrink-0 select-none shadow-2xl z-40
        /* Mobile: fixed overlay drawer, slides in/out */
        fixed inset-y-0 left-0 transform transition-transform duration-250 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        /* Desktop: sticky sidebar, always visible */
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
        ${className}
      `}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-500/20 shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Activity className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent uppercase">
                {t('medikiosk', 'MEDIKIOSK')}
              </h2>
              <p className="text-[10px] text-teal-400 font-semibold tracking-tight">Clinical Portal</p>
            </div>
          </div>
          
          {/* Close button — mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
          
          <span className="hidden lg:inline text-[9px] bg-teal-950/80 text-teal-300 px-2 py-0.5 rounded-full font-mono font-bold border border-teal-500/30">
            SIH '26
          </span>
        </div>

        {/* Navigation Item Groups */}
        <nav className="p-3.5 space-y-4 overflow-y-auto max-h-[calc(100vh-135px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <p className="px-3 text-[10px] font-extrabold text-slate-400/90 uppercase tracking-widest mb-1.5 text-left">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item, iIdx) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/20 via-blue-500/10 to-transparent text-white font-bold border border-teal-500/40 shadow-sm shadow-teal-500/10'
                          : 'text-slate-400 font-medium hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-4 h-4 transition-colors shrink-0 ${
                            isActive ? 'text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white font-mono shadow-xs ${
                            item.badgeColor || 'bg-blue-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Live Operational Status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200 text-xs">{t('system_operational', 'System Operational')}</span>
          </div>
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
          <span className="flex items-center gap-2 font-semibold">
            <Monitor className="w-3.5 h-3.5 text-teal-400" />
            OPD Kiosk 04
          </span>
          <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
            ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
}
