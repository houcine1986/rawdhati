import React, { useState, useMemo } from 'react';
import { 
  Baby, 
  UserCheck, 
  TrendingUp, 
  AlertCircle, 
  AlertTriangle,
  BellRing,
  ShieldAlert, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Utensils, 
  ArrowUpRight,
  Sparkles,
  Users,
  Search,
  GraduationCap,
  ChevronLeft,
  X,
  Phone,
  PhoneCall,
  Send,
  MessageSquare,
  Hash,
  ArrowRight,
  UserX
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  formatTND, 
  formatArabicDate, 
  calculateAge,
  detectConsecutiveAbsences,
  ConsecutiveAbsenceInfo,
  formatPhoneForCall,
  formatPhoneForWhatsApp
} from '../utils/helpers';
import { MonthlyRevenueChart } from './MonthlyRevenueChart';
import { ParentAbsenceReminderModal } from './ParentAbsenceReminderModal';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { 
    children, 
    classes, 
    staff,
    attendance, 
    invoices, 
    incidents, 
    weeklyMenu, 
    setActiveTab, 
    setSearchQuery: setGlobalSearch,
    recordAttendance,
    settings 
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedAbsenceForReminder, setSelectedAbsenceForReminder] = useState<ConsecutiveAbsenceInfo | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeChildren = children.filter(c => c.status === 'active');
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = activeChildren.length > 0 ? Math.round((presentCount / activeChildren.length) * 100) : 0;

  // Detect children with >= 3 consecutive days of absence
  const consecutiveAbsenceAlerts = useMemo(() => {
    return detectConsecutiveAbsences(children, attendance, classes, 3);
  }, [children, attendance, classes]);

  // Smart Search Filtering for Children and Staff
  const searchResults = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) return { children: [], staff: [] };

    const matchedChildren = children.filter(c => 
      c.fullName.toLowerCase().includes(q) ||
      c.registrationNumber.toLowerCase().includes(q) ||
      (c.fatherPhone && c.fatherPhone.includes(q)) ||
      (c.motherPhone && c.motherPhone.includes(q))
    ).slice(0, 5);

    const matchedStaff = staff.filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.specialty && s.specialty.toLowerCase().includes(q))
    ).slice(0, 4);

    return { children: matchedChildren, staff: matchedStaff };
  }, [localSearch, children, staff]);

  const hasResults = searchResults.children.length > 0 || searchResults.staff.length > 0;

  const handleSelectChild = (childName: string) => {
    setGlobalSearch(childName);
    setActiveTab('children');
    setLocalSearch('');
    setIsSearchFocused(false);
  };

  const handleSelectStaff = (staffName: string) => {
    setActiveTab('classes');
    setLocalSearch('');
    setIsSearchFocused(false);
  };

  // Financial calculations
  const currentMonth = '2026-08';
  const monthInvoices = invoices.filter(i => i.month === currentMonth || i.issueDate.startsWith(currentMonth));
  const totalRevenueExpected = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalRevenueCollected = monthInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = monthInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  // Total nursery capacity
  const totalCapacity = classes.reduce((sum, cls) => sum + cls.capacity, 0);
  const capacityRate = totalCapacity > 0 ? Math.round((activeChildren.length / totalCapacity) * 100) : 0;

  // Today's meal
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayOfWeek = dayNames[new Date().getDay()];
  const todayMeal = weeklyMenu.days.find(d => d.dayName === dayOfWeek) || weeklyMenu.days[0];

  // Allergy alerts count
  const childrenWithAllergies = activeChildren.filter(c => c.health.allergies && c.health.allergies.length > 0);

  // Chart data: Class distribution
  const classDistData = classes.map(cls => {
    const count = activeChildren.filter(c => c.classId === cls.id).length;
    return {
      name: cls.name.split(' ')[0] + ' ' + (cls.name.split(' ')[1] || ''),
      enrolled: count,
      capacity: cls.capacity,
    };
  });

  const pieData = [
    { name: 'حاضرون', value: presentCount, color: '#10b981' },
    { name: 'غائبون', value: absentCount, color: '#f43f5e' },
    { name: 'لم يُسجل بعد', value: Math.max(0, activeChildren.length - todayAttendance.length), color: '#cbd5e1' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome banner with joyful sky & sunny kindergarten accents */}
      <div className="bg-gradient-to-r from-[#1E88E5] via-[#0284C7] to-[#0369A1] rounded-[32px] p-6 sm:p-7 text-white shadow-xl shadow-sky-200/50 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-sky-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 right-20 w-48 h-48 bg-[#FDE047]/25 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
              <span>مرحباً بكم في {settings.nurseryName}</span>
              <span>💛</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
              لوحة القيادة والمتابعة اليومية
            </h2>
            <p className="text-white/90 text-sm max-w-xl font-medium">
              تسيير إداري وتربوي ومالي شامل بالدينار التونسي يعمل باستقلالية تامة دون حاجة للإنترنت.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-5 py-2.5 bg-[#FFDF6D] hover:bg-yellow-300 text-slate-900 font-black rounded-full text-xs shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-300/60"
            >
              <UserCheck className="w-4 h-4 text-slate-900" />
              <span>سجل الحضور والغياب</span>
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full text-xs backdrop-blur-md transition-colors flex items-center gap-2 border border-white/25 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-[#FDE047]" />
              <span>الاشتراكات والمالية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Smart Quick Access Search Bar */}
      <div className="relative z-20">
        <div className="bg-white rounded-[28px] p-3 md:p-4 border border-[#F0F0F0] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#74B9FF]/15 text-[#0984e3] flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5" />
            </div>
            
            <div className="relative flex-1">
              <input
                type="text"
                value={localSearch}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="ابحث سريعاً عن طفل أو مربية (الاسم، رقم التسجيل مثلاً: 2026-CH-001، أو الهاتف)..."
                className="w-full bg-transparent border-none outline-none text-sm text-[#2D3436] placeholder-slate-400 font-medium"
              />
            </div>

            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 border-r border-slate-200 pr-3 mr-1">
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold">بحث فوري</span>
            </div>
          </div>
        </div>

        {/* Instant Search Results Dropdown */}
        {localSearch.trim() && (
          <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-[28px] border border-[#F0F0F0] shadow-2xl p-4 z-30 animate-in fade-in slide-in-from-top-2">
            {!hasResults ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>لا توجد نتائج مطابقة لـ "{localSearch}"</p>
                <p className="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم أو رقم التسجيل بالشكل الصحيح</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Children matches */}
                {searchResults.children.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100 text-xs font-extrabold text-[#6C5CE7]">
                      <span className="flex items-center gap-1.5">
                        <Baby className="w-4 h-4" />
                        <span>الأطفال المسجلون ({searchResults.children.length})</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">انقر لفتح الملف الكامل</span>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {searchResults.children.map(child => {
                        const childClass = classes.find(c => c.id === child.classId);
                        return (
                          <div
                            key={child.id}
                            onClick={() => handleSelectChild(child.fullName)}
                            className="p-2.5 rounded-2xl bg-[#FDFCF0] hover:bg-[#FFEAA7]/40 border border-slate-100 hover:border-[#FFD93D] flex items-center justify-between transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={child.photoUrl}
                                alt={child.fullName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                              <div>
                                <div className="font-extrabold text-xs text-[#2D3436] group-hover:text-[#6C5CE7] flex items-center gap-1.5">
                                  <span>{child.fullName}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#55EFC4]/30 text-emerald-900 font-mono font-bold">
                                    {child.registrationNumber}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>فوج: {childClass?.name || 'غير محدد'}</span>
                                  <span>•</span>
                                  <span>{calculateAge(child.birthDate).years} سنوات</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-left text-xs text-[#6C5CE7] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>فتح</span>
                              <ChevronLeft className="w-4 h-4" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Staff matches */}
                {searchResults.staff.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100 text-xs font-extrabold text-[#0984e3]">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>الإطار التربوي والمربيات ({searchResults.staff.length})</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">انقر لفتح القسم</span>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {searchResults.staff.map(member => (
                        <div
                          key={member.id}
                          onClick={() => handleSelectStaff(member.fullName)}
                          className="p-2.5 rounded-2xl bg-[#F9F9FF] hover:bg-[#74B9FF]/20 border border-slate-100 hover:border-[#74B9FF] flex items-center justify-between transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={member.photoUrl}
                              alt={member.fullName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <div>
                              <div className="font-extrabold text-xs text-[#2D3436] group-hover:text-[#0984e3] flex items-center gap-1.5">
                                <span>{member.fullName}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#74B9FF]/20 text-[#0984e3] font-bold">
                                  {member.role === 'educator' ? 'مربية رئيسية' : member.role === 'assistant' ? 'مساعدة' : member.role}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>{member.specialty}</span>
                                {member.phone && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{member.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-left text-xs text-[#0984e3] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>عرض</span>
                            <ChevronLeft className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature 4 Vibrant Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Children (Mint Pastel) */}
        <div className="bg-[#55EFC4] p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-emerald-950 font-bold text-sm">إجمالي الأطفال المسجلين</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-900/10 text-emerald-950 flex items-center justify-center font-bold">
              <Baby className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-950">{activeChildren.length}</span>
            <span className="text-xs text-emerald-950/80 font-bold">طفل نشط</span>
          </div>
          <div className="text-[11px] text-emerald-950/90 font-semibold flex items-center justify-between">
            <span>الطاقة: {totalCapacity}</span>
            <span className="font-extrabold">{capacityRate}% مشغولة</span>
          </div>
        </div>

        {/* Card 2: Attendance Rate (Aqua Pastel) */}
        <div className="bg-[#81ECEC] p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-cyan-950 font-bold text-sm">الحضور اليوم ({dayOfWeek})</span>
            <div className="w-9 h-9 rounded-2xl bg-cyan-900/10 text-cyan-950 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-cyan-950">{attendanceRate}%</span>
            <span className="text-xs text-cyan-950/80 font-bold">{presentCount} حاضر</span>
          </div>
          <div className="text-[11px] text-cyan-950/90 font-semibold flex items-center justify-between">
            <span>نسبة الالتزام</span>
            <span className="font-extrabold">{presentCount} من {activeChildren.length}</span>
          </div>
        </div>

        {/* Card 3: Monthly Revenue (Warm Butter Pastel) */}
        <div className="bg-[#FFEAA7] p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-amber-950 font-bold text-sm">المداخيل الشهرية المحصلة</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-900/10 text-amber-950 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-950">{formatTND(totalRevenueCollected)}</span>
          </div>
          <div className="text-[11px] text-amber-950/90 font-semibold flex items-center justify-between">
            <span>المتوقع الإجمالي:</span>
            <span className="font-extrabold">{formatTND(totalRevenueExpected)}</span>
          </div>
        </div>

        {/* Card 4: Overdue/Pending Receivables (Coral Pastel) */}
        <div className="bg-[#FAB1A0] p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-orange-950 font-bold text-sm">متأخرات الدفع المعلقة</span>
            <div className="w-9 h-9 rounded-2xl bg-orange-900/10 text-orange-950 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-950">{formatTND(totalOutstanding)}</span>
          </div>
          <div className="text-[11px] text-orange-950/90 font-semibold flex items-center justify-between">
            <span>فواتير قيد الانتظار:</span>
            <span className="font-extrabold">{monthInvoices.filter(i => i.status !== 'paid').length} أولياء أمور</span>
          </div>
        </div>
      </div>

      {/* PROMINENT AUTOMATIC CONSECUTIVE ABSENCE ALERT (تنبيه تلقائي للغياب أكثر من 3 أيام متتالية) */}
      {consecutiveAbsenceAlerts.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-orange-500/10 rounded-[32px] md:rounded-[36px] p-5 sm:p-6 border-2 border-rose-300/80 shadow-lg shadow-rose-100/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    تنبيه الغياب المتكرر (أكثر من 3 أيام متتالية)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-sm">
                    {consecutiveAbsenceAlerts.length} {consecutiveAbsenceAlerts.length === 1 ? 'حالة تستوجب المتابعة' : 'حالات تستوجب المتابعة'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  تم رصد أطفال متغيبين بشكل متواصل. يرجى الاطمئنان على سلامتهم وإرسال تذكير فوري لولي الأمر.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-white/80 hover:bg-white px-3.5 py-2 rounded-2xl border border-rose-200 shadow-sm transition-all flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>فتح سجل الحضور الشامل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards for each child with consecutive absence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {consecutiveAbsenceAlerts.map((alert) => (
              <div
                key={alert.childId}
                className="bg-white rounded-[26px] p-4 sm:p-5 border border-rose-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={alert.childPhoto}
                          alt={alert.childName}
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-rose-200 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                          !
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{alert.childName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold">
                            {alert.registrationNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>فوج: <strong className="text-slate-700">{alert.className}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="inline-block px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-black text-xs border border-rose-200">
                        غائب {alert.consecutiveDays} أيام متتالية
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        فترة الغياب: من <strong className="text-rose-700">{formatArabicDate(alert.startDate)}</strong> إلى <strong className="text-rose-700">{formatArabicDate(alert.endDate)}</strong>
                      </span>
                    </div>
                    {alert.lastNotes && (
                      <div className="text-[11px] text-slate-600 pr-5">
                        آخر ملاحظة مسجلة: <em>{alert.lastNotes}</em>
                      </div>
                    )}
                  </div>

                  {/* Parents contact summary */}
                  <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">الأب:</span>
                      <span className="font-bold text-slate-800">{alert.fatherName}</span>
                      <span className="font-mono text-slate-500 text-[11px]" dir="ltr">{alert.fatherPhone}</span>
                    </div>
                    {alert.motherPhone && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">الأم:</span>
                        <span className="font-mono text-slate-500 text-[11px]" dir="ltr">{alert.motherPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  {/* Primary Quick Reminder Action Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedAbsenceForReminder(alert)}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال رسالة تذكير لولي الأمر</span>
                  </button>

                  {/* Quick Direct WhatsApp Button */}
                  {alert.fatherPhone && (
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(alert.fatherPhone)}?text=${encodeURIComponent(`السلام عليكم، تحية من إدارة الروضة للاطمئنان على الطفل ${alert.childName}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="محادثة WhatsApp سريعة"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}

                  {/* Quick Direct Call Button */}
                  {alert.fatherPhone && (
                    <a
                      href={`tel:${formatPhoneForCall(alert.fatherPhone)}`}
                      className="p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="اتصال هاتفي مباشر"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span className="hidden sm:inline">اتصال</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Monthly Revenue Evolution Chart */}
      <MonthlyRevenueChart />

      {/* Middle Section: Classroom Enrolment & Live Attendance Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classroom Capacity Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] md:rounded-[40px] shadow-sm p-6 border border-[#F0F0F0] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#2D3436]">توزيع الأطفال وطاقة استيعاب الأفواج</h3>
              <p className="text-xs text-slate-400">مقارنة عدد الأطفال المسجلين مع الطاقة الاستيعابية المرخصة لكل فوج</p>
            </div>
            <button 
              onClick={() => setActiveTab('classes')}
              className="text-xs font-bold text-[#6C5CE7] hover:underline flex items-center gap-1"
            >
              <span>تفاصيل الأقسام</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [value, name === 'enrolled' ? 'المسجلون' : 'الطاقة القصوى']}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Bar dataKey="enrolled" name="enrolled" fill="#6C5CE7" radius={[8, 8, 0, 0]} />
                <Bar dataKey="capacity" name="capacity" fill="#FFEAA7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Classroom summary pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
            {classes.map(cls => {
              const enrolled = activeChildren.filter(c => c.classId === cls.id).length;
              return (
                <div key={cls.id} className="p-3 rounded-2xl bg-[#FDFCF0] border border-[#FFEAA7] text-center">
                  <div className="text-xs font-bold text-[#2D3436] truncate">{cls.name}</div>
                  <div className="text-[11px] text-[#6C5CE7] mt-0.5 font-bold">
                    {enrolled} / {cls.capacity} طفل
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Attendance & Security Feed */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm p-6 border border-[#F0F0F0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#2D3436]">أحدث حركات الحضور اليوم</h3>
              <span className="text-xs text-emerald-900 font-bold bg-[#55EFC4] px-2.5 py-0.5 rounded-full">
                {attendanceRate}% حضور
              </span>
            </div>

            {/* Attendance movement list */}
            <div className="space-y-3 my-3">
              {todayAttendance.slice(0, 3).map((att) => {
                const child = children.find(c => c.id === att.childId);
                const isPresent = att.status === 'present';
                return (
                  <div 
                    key={att.id} 
                    className={`flex items-center justify-between p-3 rounded-2xl border-r-4 ${
                      isPresent ? 'bg-[#F9F9FF] border-[#6C5CE7]' : 'bg-[#FFF5F5] border-[#FF7675]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={child?.photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80'} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <div>
                        <p className="font-bold text-xs text-[#2D3436]">{child?.fullName || 'طفل'}</p>
                        <p className="text-[11px] text-slate-400">
                          {classes.find(cl => cl.id === child?.classId)?.name || 'فوج'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-bold ${isPresent ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isPresent ? `استلام: ${att.arrivalTime || '08:00'}` : 'غياب مسجل'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {att.pickedUpBy ? `بواسطة: ${att.pickedUpBy}` : 'بواسطة: الولي'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {todayAttendance.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  لم يتم تسجيل حركات حضور بعد لليوم
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('attendance')}
            className="w-full mt-3 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-bold rounded-2xl text-xs transition-colors text-center block shadow-md shadow-indigo-100 cursor-pointer"
          >
            عرض السجل الكامل والتسليم ←
          </button>
        </div>
      </div>

      {/* Bottom Grid: Health Alerts & Today's Menu & Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Health & Allergy Vigilance Widget */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm p-6 border border-[#F0F0F0] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>يقظة الحساسية الغذائية</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAB1A0] text-orange-950">
              {childrenWithAllergies.length} أطفال
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {childrenWithAllergies.map(child => (
              <div key={child.id} className="p-3 rounded-2xl bg-[#FFF5F5] border-r-4 border-[#FF7675] flex items-start gap-3">
                <img
                  src={child.photoUrl}
                  alt={child.fullName}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[#2D3436]">{child.fullName}</div>
                  <div className="text-[#FF7675] font-bold text-[11px]">
                    ⚠️ {child.health.allergies.join('، ')}
                  </div>
                  {child.health.emergencyNotes && (
                    <div className="text-slate-500 text-[10px] leading-tight">
                      {child.health.emergencyNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('health')}
            className="w-full text-center text-xs text-[#6C5CE7] font-bold hover:underline pt-2 block"
          >
            عرض السجل الصحي الكامل وتتبع التلاقيح ←
          </button>
        </div>

        {/* 2. Today's Nutritional Menu */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm p-6 border border-[#F0F0F0] space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>قائمة وجبات اليوم ({todayMeal.dayName})</span>
            </div>
            <span className="text-xs text-amber-950 bg-[#FFEAA7] font-bold px-2.5 py-0.5 rounded-full">
              طبيعي وصحي
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#FEF4E8] rounded-2xl">
              <span className="font-extrabold text-[#D35400] block mb-0.5">🥐 فطور الصباح (08:30):</span>
              <p className="text-slate-700 text-[11px] leading-relaxed">{todayMeal.breakfast}</p>
            </div>

            <div className="p-3 bg-[#FEF4E8] rounded-2xl">
              <span className="font-extrabold text-[#D35400] block mb-0.5">🍲 وجبة الغداء (11:45):</span>
              <p className="text-slate-700 text-[11px] leading-relaxed">{todayMeal.lunch}</p>
            </div>

            <div className="p-3 bg-[#FDFCF0] rounded-2xl border-2 border-dashed border-[#FFD93D]">
              <span className="font-extrabold text-[#D4AC0D] block mb-0.5">🍎 اللمجة المسائية (15:30):</span>
              <p className="text-slate-700 text-[11px] leading-relaxed">{todayMeal.snack}</p>
            </div>
          </div>
        </div>

        {/* 3. Important System Alerts */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm p-6 border border-[#F0F0F0] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#2D3436] font-bold text-sm">
                <Clock className="w-4 h-4 text-[#6C5CE7]" />
                <span>تنبيهات وملاحظات هامة</span>
              </div>
              <button 
                onClick={() => setActiveTab('communication')}
                className="text-xs text-[#6C5CE7] font-bold hover:underline"
              >
                الكل
              </button>
            </div>

            <div className="space-y-2.5 my-2">
              {consecutiveAbsenceAlerts.length > 0 && (
                <div 
                  onClick={() => setSelectedAbsenceForReminder(consecutiveAbsenceAlerts[0])}
                  className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex gap-3 cursor-pointer hover:bg-rose-100/70 transition-colors"
                >
                  <span className="text-xl">🚨</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-rose-800">غياب متواصل (&gt; 3 أيام)</p>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-200/70 px-1.5 py-0.5 rounded-md">
                        {consecutiveAbsenceAlerts.length} أطفال
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {consecutiveAbsenceAlerts[0].childName} متغيب منذ {consecutiveAbsenceAlerts[0].consecutiveDays} أيام. اضغط لإرسال تذكير.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-[#FEF4E8] rounded-2xl flex gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold text-xs text-[#D35400]">تأخير استلام</p>
                  <p className="text-[11px] text-slate-600">يرجى متابعة الأطفال الذين تجاوزوا توقيت الانصراف المحدد.</p>
                </div>
              </div>

              <div className="p-3 bg-[#E3F2FD] rounded-2xl flex gap-3">
                <span className="text-xl">💉</span>
                <div>
                  <p className="font-bold text-xs text-[#1976D2]">تذكير تلقيح</p>
                  <p className="text-[11px] text-slate-600">3 أطفال في فوج الأرانب بحاجة لتحديث الدفتر الصحي الأسبوع القادم.</p>
                </div>
              </div>

              <div className="p-3 bg-[#F3E5F5] rounded-2xl flex gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <p className="font-bold text-xs text-[#7B1FA2]">دفعات معلقة</p>
                  <p className="text-[11px] text-slate-600">{monthInvoices.filter(i => i.status !== 'paid').length} فواتير مستحقة الشهر الحالي.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('communication')}
            className="w-full text-center text-xs text-[#6C5CE7] font-bold hover:underline pt-2 block"
          >
            فتح مركز الإعلانات والتواصل مع الأولياء ←
          </button>
        </div>
      </div>

      {/* Parent Absence Reminder Modal */}
      {selectedAbsenceForReminder && (
        <ParentAbsenceReminderModal
          absenceInfo={selectedAbsenceForReminder}
          onClose={() => setSelectedAbsenceForReminder(null)}
        />
      )}
    </div>
  );
};
