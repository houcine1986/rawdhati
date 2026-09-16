import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  Download, 
  Calendar,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  Settings,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { RawdatiLogo } from './RawdatiLogo';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    userAccounts, 
    switchUser, 
    logout,
    searchQuery, 
    setSearchQuery, 
    setActiveTab,
    notifications,
    exportDatabaseJSON,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    license,
    setIsActivationModalOpen,
    setIsUserManualOpen
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const todayStr = new Intl.DateTimeFormat('ar-TN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  // Role display label matching screenshot
  const roleDisplayLabel = 
    currentUser?.role === 'director' 
      ? 'مديرة الروضة' 
      : currentUser?.role === 'admin' 
      ? 'الإدارة المالية' 
      : 'مربية القسم';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left (or Right in RTL): Mobile Hamburger + Slogan */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-700 hover:text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-2xl transition-colors cursor-pointer"
            aria-label="تبديل القائمة"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo on mobile only (desktop has it in sidebar) */}
          <div className="lg:hidden">
            <RawdatiLogo size="sm" showSlogan={false} />
          </div>

          {/* Cheerful Slogan matching image.png */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm md:text-base lg:text-lg font-black text-[#0284C7] tracking-wide flex items-center gap-1.5">
              <span>معاً ... نحو مستقبل مشرق</span>
              <span className="text-amber-400 text-base">💛</span>
            </span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن طفل، ولي أمر، أو فاتورة ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F0F7FF] border border-sky-100/80 outline-none rounded-full pr-11 pl-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-400/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick actions, notifications, user profile pill */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User Manual Guide PDF shortcut */}
          <button
            onClick={() => setIsUserManualOpen(true)}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-full text-xs font-black transition-colors cursor-pointer"
            title="دليل المستخدم الرسمي للروضة بصيغة PDF"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>دليل الاستخدام (PDF)</span>
          </button>

          {/* Notifications Bell matching image.png */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200/60 flex items-center justify-center transition-colors relative cursor-pointer"
              aria-label="الإشعارات والتنبيهات"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-sky-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">التنبيهات والإشعارات ({notifications.length})</h4>
                  <button 
                    onClick={() => {
                      setActiveTab('communication');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    مركز التواصل
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-2xl bg-sky-50/60 border-r-4 border-sky-500 text-xs space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        {n.isImportant && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        {n.title}
                      </div>
                      <p className="text-slate-600 line-clamp-2 text-[11px]">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block">{n.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill matching image.png exactly */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 p-1 pr-2 sm:pr-3 bg-slate-100/90 hover:bg-slate-200/80 rounded-full transition-all cursor-pointer border border-slate-200/60"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-100 flex items-center justify-center text-xs sm:text-sm border border-white shadow-xs overflow-hidden flex-shrink-0">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sky-700 font-bold">👩‍🏫</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {roleDisplayLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 pl-0.5" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-64 sm:w-72 bg-white rounded-3xl shadow-2xl border border-sky-100 p-3 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-black text-slate-800">{currentUser?.fullName}</div>
                  <div className="text-[11px] text-sky-600 font-bold mt-0.5">
                    {roleDisplayLabel}
                  </div>
                </div>

                <div className="py-1 space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1">تبديل المستخدم النشط:</div>
                  {userAccounts.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.role as UserRole);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-colors cursor-pointer ${
                        currentUser?.role === user.role
                          ? 'bg-sky-50 text-sky-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span>{user.fullName}</span>
                      </div>
                      {currentUser?.role === user.role && <UserCheck className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-xs text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl font-bold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>إعدادات الروضة والنسخ</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-right px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج وقفل الجلسة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
