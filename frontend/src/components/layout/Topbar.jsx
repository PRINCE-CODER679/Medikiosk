import React, { useState, useEffect } from 'react';
import { Search, Bell, Monitor, ExternalLink, Activity, ChevronDown, User, Settings, ShieldCheck, LogOut, Command, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../ui/Card';
import { CommandPalette } from '../ui/CommandPalette';
import { ApiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export function Topbar({ onMenuToggle }) {
  const { t } = useTranslation();
  const [apiHealth, setApiHealth] = useState({ status: 'checking', service: 'MediKiosk API' });
  const [commandOpen, setCommandOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    ApiService.checkHealth().then((res) => {
      if (isMounted) {
        if (res.ok) {
          setApiHealth({ status: 'ok', service: res.data.service || 'MediKiosk API' });
        } else {
          setApiHealth({ status: 'offline', service: 'MediKiosk API (Offline)' });
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs gap-3">
        {/* Mobile menu hamburger */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Patient Search Command Trigger */}
        <div className="flex items-center gap-3 flex-1 min-w-0 max-w-md">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="w-full bg-slate-100/70 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 flex items-center justify-between transition-all shadow-2xs group cursor-pointer min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
              <span className="font-semibold text-slate-600 truncate hidden xs:inline sm:inline">
                {t('dash_search_placeholder', 'Search by Patient Name, ID, or ABHA...')}
              </span>
              <span className="font-semibold text-slate-600 truncate xs:hidden sm:hidden">Search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-white border border-slate-200 text-[10px] font-mono font-extrabold text-slate-500 px-2 py-0.5 rounded-lg shadow-2xs shrink-0">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Live API Health Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
            <span className={`w-2 h-2 rounded-full ${apiHealth.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-bold text-slate-600 text-xs">API:</span>
            <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
              apiHealth.status === 'ok' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {apiHealth.status === 'ok' ? '200 OK' : 'OFFLINE'}
            </span>
          </div>

          {/* Launch Patient Kiosk Button */}
          <button
            type="button"
            onClick={() => navigate('/kiosk')}
            className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Monitor className="w-4 h-4 text-teal-600" />
            <span>{t('dash_kiosk_view', 'View Kiosk')}</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Priority Alerts"
            aria-label="Priority Alerts"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Doctor Profile & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              <Avatar name="Dr. Ananya Sharma" status="active" size="sm" />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">Dr. Ananya Sharma</p>
                <p className="text-[10px] text-slate-500 font-semibold">Chief Clinical Officer</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 text-xs font-medium z-50 animate-in fade-in duration-150"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100 text-left bg-slate-50/50">
                  <p className="font-bold text-slate-900">Dr. Ananya Sharma</p>
                  <p className="text-[11px] text-slate-500 font-medium">ananya.sharma@medikiosk.in</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-semibold"
                >
                  <User className="w-4 h-4 text-slate-400" /> Profile &amp; Bio
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-semibold"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Preferences
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-semibold"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" /> Security Log
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2.5 font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Command Palette Overlay */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
