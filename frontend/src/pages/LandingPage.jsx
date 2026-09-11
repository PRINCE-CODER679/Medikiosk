import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Activity,
  ArrowRight,
  Stethoscope,
  Users,
  Globe,
  Accessibility,
  HelpCircle,
  Play,
  Mic,
  Brain,
  FileText,
  HeartPulse,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Modal } from '../components/ui/OverlayAndFeedback';

export function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const startCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/kiosk');
    }, 450);
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('lng', langCode);
    setLangDropdownOpen(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 5-Step Clinical Intake Journey
  const steps = [
    {
      num: '01',
      title: t('journey_identify', 'Patient Check-in'),
      desc: t('journey_identify_desc', 'Scan ABHA QR code or enter hospital OPD token number.'),
      icon: Users
    },
    {
      num: '02',
      title: t('journey_converse', 'Voice & Touch Intake'),
      desc: t('journey_converse_desc', 'Describe current symptoms in Hindi, Marathi, or English.'),
      icon: Mic
    },
    {
      num: '03',
      title: t('journey_scan', 'Document Digitization'),
      desc: t('journey_scan_desc', 'Scan prior paper prescriptions, lab reports, and discharges via OCR.'),
      icon: FileText
    },
    {
      num: '04',
      title: t('journey_structure', 'Structured Summary'),
      desc: t('journey_structure_desc', 'AI organizes symptoms, timeline, vitals, and red flags into standard format.'),
      icon: Brain
    },
    {
      num: '05',
      title: t('journey_review', 'Physician Review'),
      desc: t('journey_review_desc', 'Doctor validates structured findings in EHR before examination begins.'),
      icon: Stethoscope
    }
  ];

  // Real-world OPD Capabilities
  const capabilities = [
    {
      title: t('cap_card_multi_title', 'Multilingual Intake'),
      desc: t('cap_card_multi_desc', 'Full interactive conversational interface in Hindi, Marathi, and English.'),
      badge: 'Vernacular OPD'
    },
    {
      title: t('cap_card_voice_title', 'Voice-First Access'),
      desc: t('cap_card_voice_desc', 'Natural speech capture for elderly or low-literacy patients.'),
      badge: 'Accessible Voice'
    },
    {
      title: t('cap_card_paper_title', 'Paper Record OCR'),
      desc: t('cap_card_paper_desc', 'Instant digitization of crumpled physical prescriptions and past reports.'),
      badge: 'Document Digitize'
    },
    {
      title: t('cap_card_throughput_title', 'OPD Queue Throughput'),
      desc: t('cap_card_throughput_desc', 'Saves 6-8 minutes of repetitive history collection per clinical encounter.'),
      badge: 'High-Volume OPD'
    },
    {
      title: t('cap_abha_fhir', 'ABHA & FHIR Ready'),
      desc: t('cap_abha_fhir_desc', 'Compliant with Ayushman Bharat Digital Mission (ABDM) standards.'),
      badge: 'ABDM Sandbox'
    }
  ];

  const currentLangLabel = i18n.language === 'hi' ? 'हिंदी' : i18n.language === 'mr' ? 'मराठी' : 'English';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-[#1E56A0] selection:text-white font-sans antialiased">
      
      {/* =========================================================================
          INSTITUTIONAL MEDTECH NAVBAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-white/95 backdrop-blur-xs border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand Logo with Medical Cross Icon */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-[#0E7090] text-white flex items-center justify-center font-bold shadow-xs shrink-0 relative overflow-hidden">
              {/* Medical cross motif with pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-2 bg-white/30 rounded-xs" />
                <div className="h-5 w-2 bg-white/30 rounded-xs absolute" />
              </div>
              <Activity className="w-5 h-5 text-white relative z-10" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-[#0B2046] tracking-tight leading-none uppercase block">
                {t('medikiosk', 'MEDIKIOSK')}
              </span>
              <span className="text-[10px] text-[#0E7090] font-semibold tracking-tight block">
                AI-Powered Clinical Intake
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[#0B2046] font-bold border-b-2 border-[#0B2046] pb-1 pt-1 cursor-pointer transition-colors"
            >
              {t('nav_home', 'Home')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#0B2046] pb-1 pt-1 cursor-pointer transition-colors"
            >
              {t('nav_how_it_works', 'How It Works')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('for-patients')}
              className="hover:text-[#0B2046] pb-1 pt-1 cursor-pointer transition-colors"
            >
              {t('nav_for_patients', 'For Patients')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('for-physicians')}
              className="hover:text-[#0B2046] pb-1 pt-1 cursor-pointer transition-colors"
            >
              {t('nav_for_physicians', 'For Physicians')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="hover:text-[#0B2046] pb-1 pt-1 cursor-pointer transition-colors"
            >
              {t('nav_about', 'About')}
            </button>
          </nav>

          {/* Right: Controls & Portal CTA */}
          <div className="flex items-center gap-2.5">
            
            {/* Language Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-full text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#0E7090]" />
                <span>{currentLangLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      i18n.language === 'en' ? 'text-[#0B2046] font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {i18n.language === 'en' && <span className="text-teal-600 font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('hi')}
                    className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      i18n.language === 'hi' ? 'text-[#0B2046] font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>हिंदी</span>
                    {i18n.language === 'hi' && <span className="text-teal-600 font-bold">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('mr')}
                    className={`w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      i18n.language === 'mr' ? 'text-[#0B2046] font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>मराठी</span>
                    {i18n.language === 'mr' && <span className="text-teal-600 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Accessibility Toggle */}
            <button
              type="button"
              onClick={() => setShowAccessibilityModal(true)}
              className="w-8 h-8 rounded-full bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title={t('accessibility', 'Accessibility')}
              aria-label={t('accessibility', 'Accessibility')}
            >
              <Accessibility className="w-4 h-4" />
            </button>

            {/* Clinical Portal Header Button */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-white hover:bg-slate-50 text-[#0B2046] border border-slate-200/90 hover:border-slate-300 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span>{t('clinical_portal', 'Clinical Portal')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTENT AREA
          ========================================================================= */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16 flex-1">
        
        {/* =====================================================================
            HERO SECTION (Matching Reference Design: 45% Text / 55% Visual)
            ===================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column (~45%): Clean MedTech Hierarchy */}
          <div className="lg:col-span-5 space-y-5 text-left">
            
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E7090]" />
              <span>{t('hero_eyebrow', 'AI-POWERED CLINICAL INTAKE')}</span>
            </div>

            {/* Brand Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[54px] font-black text-[#0B2046] tracking-tight leading-none uppercase font-sans">
                {t('medikiosk', 'MEDIKIOSK')}
              </h1>
              
              {/* Main Headline */}
              <h2 className="text-xl sm:text-2xl lg:text-[34px] font-bold text-[#0F2447] tracking-tight leading-[1.2] mt-2 font-sans">
                {t('hero_message', 'Your health story, structured for your physician.')}
              </h2>
            </div>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal max-w-lg">
              {t('hero_supporting', 'Share your health information through a simple, multilingual and accessible intake experience before your consultation.')}
            </p>

            {/* Actions: Primary CTA + Watch How It Works */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-5">
              
              {/* Primary CTA (Dominant) */}
              <button
                type="button"
                onClick={startCheck}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#0B1E3F] hover:bg-[#152F5E] active:bg-[#07142B] text-white rounded-full font-bold text-xs sm:text-sm tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 group border border-[#0B1E3F]"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-teal-400" />
                    <span>{t('preparing_intake', 'Preparing Intake Check...')}</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    <span>{t('start_health_check', 'START HEALTH CHECK')}</span>
                  </>
                )}
              </button>

              {/* Secondary Action: Watch How It Works */}
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1976D2] hover:text-[#1565C0] transition-colors cursor-pointer px-2 py-1"
              >
                <span className="w-8 h-8 rounded-full bg-blue-50 text-[#1976D2] flex items-center justify-center shrink-0 shadow-2xs">
                  <Play className="w-3.5 h-3.5 fill-[#1976D2] ml-0.5" />
                </span>
                <span>{t('watch_how_it_works', 'Watch How It Works')}</span>
              </button>

            </div>

            {/* Language Selector Pills & Accessibility Control */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  i18n.language === 'en'
                    ? 'bg-[#1976D2] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('hi')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  i18n.language === 'hi'
                    ? 'bg-[#1976D2] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('mr')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  i18n.language === 'mr'
                    ? 'bg-[#1976D2] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90'
                }`}
              >
                मराठी
              </button>

              <span className="text-slate-300 mx-1">|</span>

              {/* Accessibility Link with Circular Icon */}
              <button
                type="button"
                onClick={() => setShowAccessibilityModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-700">
                  <Accessibility className="w-3.5 h-3.5" />
                </span>
                <span>{t('accessibility', 'Accessibility')} &gt;</span>
              </button>
            </div>

          </div>

          {/* Right Column (~55%): The Reference Hero Visual */}
          <div className="lg:col-span-7 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl lg:max-w-none">
              <img
                src="/images/medikiosk-hero.png"
                alt="MediKiosk AI-Powered Clinical Intake Platform - Patient to Physician Workflow"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-sm select-none"
                loading="eager"
              />
            </div>
          </div>

        </section>

        {/* =====================================================================
            COMPACT TRUST STRIP (Directly Below Hero)
            ===================================================================== */}
        <section className="py-4 px-4 sm:px-6 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
            
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {t('trust_privacy', 'Privacy First')}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {t('trust_privacy_sub', 'ABDM Consent & Security')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {t('trust_multilingual', 'Multilingual')}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {t('trust_multilingual_sub', 'English, हिंदी, मराठी')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                <Mic className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {t('trust_voice', 'Voice Assisted')}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {t('trust_voice_sub', 'Natural Speech Intake')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                <Accessibility className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {t('trust_accessible', 'Accessible')}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {t('trust_accessible_sub', 'Touch & High-Contrast')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-left col-span-2 sm:col-span-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {t('trust_physician', 'Physician Reviewed')}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {t('trust_physician_sub', 'Doctor-Validated Intake')}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================================
            HOW MEDIKIOSK WORKS (From Check-in to Clinical Summary)
            ===================================================================== */}
        <section id="how-it-works" className="space-y-6 text-left">
          
          {/* Header Row with Stepper Indicator matching Reference Design */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('journey_badge', 'HOW MEDIKIOSK WORKS')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {t('from_check_in_to_summary', 'From Check-in to Clinical Summary')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('simple_5_step_journey', 'A simple 5-step journey for better, faster, more complete care.')}
              </p>
            </div>

            {/* Step Counter Pills */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-7 h-7 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-bold text-xs shadow-2xs">1</span>
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">2</span>
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">3</span>
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">4</span>
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">5</span>
            </div>
          </div>

          {/* 5 Journey Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-left">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-3 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {st.num}
                      </span>
                      <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                        <Icon className="w-3.5 h-3.5 text-teal-600" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            PATIENT EXPERIENCE (Accessible Kiosk Interface)
            ===================================================================== */}
        <section id="for-patients" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-left lg:max-w-md">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
              {t('patient_preview_badge', 'Designed for Patients')}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('patient_preview_title', 'Accessible for All Digital Literacy Levels')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t('patient_preview_sub', 'Large touch targets, vernacular audio prompts, and simple guided interactions make self-intake comfortable for rural patients, elderly citizens, and individuals with visual challenges.')}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={startCheck}
                className="px-5 py-2.5 bg-[#0B1E3F] hover:bg-[#152F5E] text-white rounded-full text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{t('start_health_check', 'START HEALTH CHECK')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              </button>
            </div>
          </div>

          {/* Kiosk Terminal Frame Mockup */}
          <div className="w-full max-w-sm bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[10px]">
              <span className="font-mono font-bold text-slate-600 uppercase">Kiosk Touch Terminal</span>
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Select Preferred Language
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-semibold">
                <div className="p-1.5 rounded-md bg-[#1976D2] text-white">English</div>
                <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">हिंदी</div>
                <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">मराठी</div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  2. Voice Question
                </p>
                <p className="text-xs font-bold text-slate-800">
                  "Please describe your symptoms"
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            INDIAN HEALTHCARE LOCALIZATION SECTION (About / OPD Realities)
            ===================================================================== */}
        <section id="about" className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('indian_badge', 'Indian OPD Context')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('indian_title', 'Built for High-Volume Indian Hospitals')}
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              {t('indian_sub', 'Engineered to handle overcrowding, mixed language dialogues, and legacy physical prescriptions.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-left">
            {capabilities.map((cap, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-2">
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {cap.badge}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    {cap.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            CLINICAL SAFETY & REGULATORY DISCLAIMER
            ===================================================================== */}
        <section className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 flex items-start gap-3.5 text-left">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5 border border-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Clinical Intake & Safety Disclosure
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              MediKiosk is an assistive clinical documentation platform designed to structure patient-reported information and digitize prior medical records before consultation. It does not provide automated diagnoses, evaluate treatment plans, or substitute professional physician judgement. All structured summaries are submitted directly to the licensed consulting doctor for clinical review and verification.
            </p>
          </div>
        </section>

        {/* =====================================================================
            FOR HEALTHCARE PROFESSIONALS (Secondary Physician Portal Access)
            ===================================================================== */}
        <section id="for-physicians" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-2xl mx-auto shadow-2xs">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('physician_banner_eyebrow', 'FOR HEALTHCARE PROFESSIONALS')}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t('physician_banner_title', 'Review every patient story in one clinical workspace.')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Consulting physicians can access real-time intake queue feeds, structured triage summaries, red flag alerts, and OCR document history directly on the workstation.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-300 hover:border-slate-400 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>{t('open_clinical_portal', 'OPEN CLINICAL PORTAL')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </section>

      </main>

      {/* =========================================================================
          HOSPITAL-GRADE CLINICAL FOOTER
          ========================================================================= */}
      <footer className="w-full px-4 sm:px-8 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
        <p>© 2026 MediKiosk • Hospital Clinical Intake & Triage Infrastructure</p>
        <p className="font-mono text-[11px] text-slate-400">
          Smart India Hackathon 2026 • ABDM Sandboxed
        </p>
      </footer>

      {/* =========================================================================
          HELP INSTRUCTIONS MODAL
          ========================================================================= */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title={t('help_title', 'Kiosk Help & Instructions')}
        subtitle={t('help_sub', 'How to complete your pre-consultation health intake')}
      >
        <div className="space-y-4 text-slate-700 text-xs bg-white text-left">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{t('help_self_check_in', 'Patient Self Check-In')}</span>
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium">
              <li>{t('help_step_1', 'Choose your preferred language (English, Hindi, or Marathi).')}</li>
              <li>{t('help_step_2', 'Verify your identity using your ABHA number or hospital token.')}</li>
              <li>{t('help_step_3', 'Speak or tap to explain your current symptoms.')}</li>
              <li>{t('help_step_4', 'Scan any old paper prescriptions or lab reports using the kiosk camera.')}</li>
            </ol>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            {t('help_footer', 'Once complete, your structured summary will be directly sent to your consulting physician before your turn.')}
          </p>
        </div>
      </Modal>

      {/* =========================================================================
          ACCESSIBILITY CONTROLS MODAL
          ========================================================================= */}
      <Modal
        isOpen={showAccessibilityModal}
        onClose={() => setShowAccessibilityModal(false)}
        title={t('accessibility_settings', 'Accessibility Preferences')}
        subtitle={t('accessibility_sub', 'Adjust visual and interaction settings for your comfort')}
      >
        <div className="space-y-4 text-slate-700 bg-white text-left">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold space-y-3">
            <p className="text-slate-900 font-bold">{t('accessibility_select', 'Display & Assistive Modes')}</p>
            <div className="flex flex-col gap-2 pt-1">
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-slate-900 font-bold">{t('contrast_normal', 'High Contrast Mode')}</p>
                  <p className="text-[10px] text-slate-500">Enhanced border and text visibility for low-vision patients</p>
                </div>
                <span className="text-teal-700 text-xs font-bold uppercase bg-teal-50 px-2 py-1 rounded border border-teal-100">
                  Standard
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-slate-900 font-bold">{t('text_normal', 'Text Sizing')}</p>
                  <p className="text-[10px] text-slate-500">Adjust clinical font scaling for optimal readability</p>
                </div>
                <span className="text-slate-700 text-xs font-bold uppercase bg-slate-100 px-2 py-1 rounded">
                  Regular
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-slate-900 font-bold">{t('screen_reader', 'Screen Reader & Audio Prompts')}</p>
                  <p className="text-[10px] text-slate-500">Voice assistance enabled for vernacular question readouts</p>
                </div>
                <span className="text-emerald-700 text-xs font-bold uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
