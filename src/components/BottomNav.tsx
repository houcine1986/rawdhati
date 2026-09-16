import React from 'react';
import { 
  LayoutDashboard, 
  Baby, 
  UserCheck, 
  Receipt, 
  Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, attendance, invoices, children, hasTabPermission } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPresentCount = attendance.filter(a => a.date === todayStr && a.status === 'present').length;
  const unpaidInvoicesCount = invoices.filter(i => i.status !== 'paid').length;
  const activeChildrenCount = children.filter(c => c.status === 'active').length;

  const quickNav = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'children',
      label: 'الأطفال',
      icon: Baby,
      badge: activeChildrenCount,
    },
    {
      id: 'attendance',
      label: 'الحضور',
      icon: UserCheck,
      badge: todayPresentCount > 0 ? `${todayPresentCount}` : null,
    },
    {
      id: 'finance',
      label: 'المالية',
      icon: Receipt,
      badge: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount}` : null,
    },
  ];

  return (
    <nav 
      aria-label="التنقل السريع للهواتف"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around safe-area-pb no-print"
    >
      {quickNav.filter(item => hasTabPermission(item.id)).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id && !isMobileMenuOpen;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl relative transition-all active:scale-95 ${
              isActive
                ? 'text-[#6C5CE7] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all ${
              isActive ? 'bg-[#6C5CE7]/10' : ''
            }`}>
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {item.badge && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* More / Menu Drawer Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl relative transition-all active:scale-95 ${
          isMobileMenuOpen
            ? 'text-[#6C5CE7] font-extrabold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <div className={`p-1.5 rounded-xl transition-all ${
          isMobileMenuOpen ? 'bg-[#6C5CE7]/10' : ''
        }`}>
          <Menu className={`w-5 h-5 ${isMobileMenuOpen ? 'stroke-[2.5]' : 'stroke-2'}`} />
        </div>
        <span className="text-[11px] leading-tight mt-0.5">القائمة</span>
      </button>
    </nav>
  );
};
