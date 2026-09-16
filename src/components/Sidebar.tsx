import React, { useState } from 'react';
import { 
  Home, 
  CalendarCheck, 
  Users, 
  Baby, 
  GraduationCap, 
  FileText, 
  Settings, 
  HeartPulse, 
  Bus, 
  MessageSquareText, 
  X,
  BookOpen,
  Receipt,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  FolderKanban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RawdatiLogo } from './RawdatiLogo';
import { cartoonKidsImg } from '../assets/images';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeType?: 'primary' | 'warning' | 'info';
}

interface NavSection {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    children, 
    attendance, 
    invoices, 
    hasTabPermission,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();

  // Collapsible section state - all open by default for immediate accessibility
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showMascot, setShowMascot] = useState(true);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPresentCount = attendance.filter(a => a.date === todayStr && (a.status === 'present' || a.status === 'late')).length;
  const activeChildrenCount = children.filter(c => c.status === 'active').length;
  const unpaidInvoicesCount = invoices.filter(i => i.status !== 'paid').length;

  // Structured Sections definition
  const sections: NavSection[] = [
    {
      id: 'general',
      title: 'الرئيسية العامة',
      items: [
        {
          id: 'dashboard',
          label: 'الرئيسية',
          icon: Home,
          badge: null,
        },
      ],
    },
    {
      id: 'children-section',
      title: 'قسم الأطفال',
      icon: Baby,
      items: [
        {
          id: 'children',
          label: 'ملفات الأطفال',
          icon: Baby,
          badge: activeChildrenCount > 0 ? `${activeChildrenCount}` : null,
          badgeType: 'info',
        },
        {
          id: 'attendance',
          label: 'الحضور والغياب',
          icon: Users,
          badge: todayPresentCount > 0 ? `${todayPresentCount} حاضر` : null,
          badgeType: 'primary',
        },
        {
          id: 'classes',
          label: 'الأفواج والمربيات',
          icon: GraduationCap,
          badge: null,
        },
      ],
    },
    {
      id: 'finance-section',
      title: 'قسم المالية',
      icon: Receipt,
      items: [
        {
          id: 'finance',
          label: 'المالية والاشتراكات',
          icon: Receipt,
          badge: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount} معلقة` : null,
          badgeType: 'warning',
        },
      ],
    },
    {
      id: 'pedagogy-section',
      title: 'قسم التربية والأنشطة',
      icon: BookOpen,
      items: [
        {
          id: 'pedagogy',
          label: 'البرامج والتقارير',
          icon: FileText,
          badge: null,
        },
        {
          id: 'health',
          label: 'الصحة والتغذية',
          icon: HeartPulse,
          badge: null,
        },
      ],
    },
    {
      id: 'services-section',
      title: 'قسم الخدمات والتواصل',
      icon: Bus,
      items: [
        {
          id: 'transport',
          label: 'النقل المدرسي',
          icon: Bus,
          badge: null,
        },
        {
          id: 'communication',
          label: 'التواصل والإعلانات',
          icon: MessageSquareText,
          badge: null,
        },
      ],
    },
    {
      id: 'admin-section',
      title: 'قسم الإدارة والنظام',
      icon: Settings,
      items: [
        {
          id: 'settings',
          label: 'الإعدادات والنسخ',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const renderNavContent = (isDrawer = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Top Logo (rendered in desktop sidebar; mobile drawer has its own header) */}
      {!isDrawer && (
        <div className="pb-2 pt-1 shrink-0">
          <RawdatiLogo size="md" showSlogan={false} />
        </div>
      )}

      {/* Grouped Navigation Sections List - Scrollable container occupying full remaining height */}
      <nav 
        className="flex-1 overflow-y-auto space-y-3 pr-1 pl-1 scrollbar-thin scrollbar-thumb-slate-200" 
        aria-label="القائمة الرئيسية المقسمة"
      >
        {sections.map((section) => {
          // Filter allowed items in this section
          const allowedItems = section.items.filter(item => hasTabPermission(item.id));
          if (allowedItems.length === 0) return null;

          const isCollapsed = collapsedSections[section.id];
          const hasActiveItem = allowedItems.some(i => i.id === activeTab);

          // Special single general section (e.g. Dashboard)
          const isGeneral = section.id === 'general';

          return (
            <div 
              key={section.id} 
              className="space-y-1 bg-white/50 rounded-2xl p-1.5 border border-sky-100/70 shadow-2xs transition-colors hover:bg-white/70"
            >
              {/* Section Header */}
              {!isGeneral ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-black text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full transition-all ${
                      hasActiveItem ? 'bg-amber-400 ring-2 ring-amber-200' : 'bg-slate-300 group-hover:bg-amber-400'
                    }`} />
                    <span className="tracking-wide">{section.title}</span>
                  </div>

                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                    isCollapsed ? '-rotate-90' : 'rotate-0'
                  }`} />
                </button>
              ) : null}

              {/* Section Items */}
              {(!isCollapsed || isGeneral) && (
                <div className="space-y-1 pt-0.5 animate-in fade-in duration-150">
                  {allowedItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#FFDF6D] text-slate-950 shadow-sm ring-1 ring-amber-300/80 font-black'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 transition-colors ${
                              isActive
                                ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-500/40'
                                : item.badgeType === 'warning'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Mascot Banner - Placed inside scrollable nav so it NEVER obscures or covers any menu items */}
        <div className="pt-2 pb-1">
          {showMascot ? (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-white/80 via-emerald-50/40 to-emerald-100/60 border border-emerald-100/80 p-2 text-center shadow-xs group">
              {/* Close/Minimize button */}
              <button
                type="button"
                onClick={() => setShowMascot(false)}
                className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center text-[10px] transition-colors cursor-pointer shadow-xs opacity-70 hover:opacity-100"
                title="تصغير الصورة"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Cartoon Kids mascot image with gentle height */}
              <div className="w-full h-20 flex items-center justify-center overflow-hidden">
                <img 
                  src={cartoonKidsImg} 
                  alt="أطفالنا مستقبلنا"
                  referrerPolicy="no-referrer"
                  className="h-full w-auto object-contain drop-shadow-xs"
                />
              </div>

              {/* Ribbon banner */}
              <div className="bg-white/95 backdrop-blur-xs rounded-xl py-0.5 px-2.5 border border-emerald-200/60 shadow-2xs inline-block mx-auto mt-1">
                <span className="text-[10px] font-extrabold text-[#0284C7] flex items-center justify-center gap-1">
                  <span>أطفالنا .. مستقبلنا</span>
                  <span>💛</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-1">
              <button
                type="button"
                onClick={() => setShowMascot(true)}
                className="text-[10px] text-sky-600 hover:text-sky-800 font-bold bg-white/70 hover:bg-white px-2.5 py-1 rounded-full border border-sky-100/80 transition-colors cursor-pointer inline-flex items-center gap-1"
                title="إظهار صورة أطفالنا مستقبلنا"
              >
                <span>💛 أطفالنا .. مستقبلنا</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Slim, elegant footer with zero vertical footprint */}
      <div className="pt-1.5 text-center shrink-0">
        <span className="text-[10px] text-slate-400/80 font-medium">
          روضتي 2026-2027
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-70 flex-shrink-0 p-3.5 xl:p-4 flex-col justify-between no-print select-none h-screen sticky top-0 bg-[#F0F7FF]/70 border-l border-sky-100/80">
        {renderNavContent(false)}
      </aside>

      {/* 2. Mobile & Tablet Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex no-print"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content sliding from right (RTL) */}
          <div className="relative w-72 max-w-[85vw] bg-[#F0F7FF] text-slate-800 h-full shadow-2xl p-4 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100 mb-2">
              <RawdatiLogo size="sm" showSlogan={false} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs border border-slate-200/60"
                aria-label="إغلاق القائمة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
              {renderNavContent(true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
