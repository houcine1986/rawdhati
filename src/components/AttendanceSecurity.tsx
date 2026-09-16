import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CalendarDays,
  Search, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Printer, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Send,
  Sparkles,
  Filter,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyAttendance, Child } from '../types';
import { ChildAvatar } from './ChildAvatar';
import { ParentAbsenceReminderModal } from './ParentAbsenceReminderModal';
import { schoolBooksImg } from '../assets/images';
import { detectConsecutiveAbsences, ConsecutiveAbsenceInfo } from '../utils/helpers';

export const AttendanceSecurity: React.FC = () => {
  const { 
    children, 
    classes, 
    attendance, 
    recordAttendance, 
    setPrintAttendanceClassId, 
    currentUser,
    setToastMessage 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reminderAbsence, setReminderAbsence] = useState<ConsecutiveAbsenceInfo | null>(null);

  // Child checkout state
  const [checkingOutChild, setCheckingOutChild] = useState<{ child: Child; att: DailyAttendance | null } | null>(null);
  const [pickupPerson, setPickupPerson] = useState<string>('');
  const [pickupRelation, setPickupRelation] = useState<string>('الأب');
  const [departureTime, setDepartureTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  // Consecutive absences detection
  const consecutiveAbsences = useMemo(() => {
    return detectConsecutiveAbsences(children, attendance, classes, 3);
  }, [children, attendance, classes]);

  const consecutiveAbsenceMap = useMemo(() => {
    const map = new Map<string, ConsecutiveAbsenceInfo>();
    for (const info of consecutiveAbsences) {
      map.set(info.childId, info);
    }
    return map;
  }, [consecutiveAbsences]);

  // Active children filtered by class & search
  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      if (child.status !== 'active') return false;
      if (selectedClassFilter !== 'all' && child.classId !== selectedClassFilter) return false;
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = child.fullName.toLowerCase().includes(query);
        const matchesReg = child.registrationNumber.toLowerCase().includes(query);
        const className = classes.find(c => c.id === child.classId)?.name.toLowerCase() || '';
        return matchesName || matchesReg || className.includes(query);
      }
      return true;
    });
  }, [children, selectedClassFilter, searchTerm, classes]);

  // Overall attendance statistics for current date & filtered list
  const stats = useMemo(() => {
    const total = filteredChildren.length;
    let present = 0;
    let absent = 0;

    filteredChildren.forEach(child => {
      const att = attendance.find(a => a.date === selectedDate && a.childId === child.id);
      if (att) {
        if (att.status === 'present' || att.status === 'late') {
          present++;
        } else if (att.status === 'absent') {
          absent++;
        }
      } else {
        // Default unrecorded: count as present in demo or absent
        present++;
      }
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  }, [filteredChildren, attendance, selectedDate]);

  // Toggle child status (Present <-> Absent)
  const handleToggleStatus = (child: Child) => {
    const existing = attendance.find(a => a.date === selectedDate && a.childId === child.id);
    const currentStatus = existing ? existing.status : 'present';
    const newStatus = currentStatus === 'present' || currentStatus === 'late' ? 'absent' : 'present';
    const nowTime = new Date().toTimeString().slice(0, 5);

    recordAttendance({
      date: selectedDate,
      childId: child.id,
      classId: child.classId,
      status: newStatus,
      arrivalTime: newStatus === 'present' ? nowTime : undefined,
      departureTime: existing?.departureTime,
      pickedUpBy: existing?.pickedUpBy,
      pickedUpRelation: existing?.pickedUpRelation,
      recordedBy: currentUser?.fullName || 'مديرة الروضة',
      notes: newStatus === 'absent' ? (existing?.notes || 'غياب') : '',
    });

    setToastMessage(`تم تغيير حالة ${child.fullName} إلى: ${newStatus === 'present' ? 'حاضر ✓' : 'غائب ✕'}`);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    filteredChildren.forEach(child => {
      const existing = attendance.find(a => a.date === selectedDate && a.childId === child.id);
      if (!existing || existing.status === 'absent') {
        recordAttendance({
          date: selectedDate,
          childId: child.id,
          classId: child.classId,
          status: 'present',
          arrivalTime: nowTime,
          recordedBy: currentUser?.fullName || 'مديرة الروضة',
        });
      }
    });
    setToastMessage('تم تسجيل حضور جميع أطفال القائمة بنجاح!');
  };

  // Export attendance list to CSV
  const handleExportCSV = () => {
    const rows = [
      ['#', 'رقم التسجيل', 'اسم الطفل', 'القسم', 'حالة الحضور', 'وقت الدخول', 'وقت الخروج', 'ملاحظات'],
      ...filteredChildren.map((child, index) => {
        const att = attendance.find(a => a.date === selectedDate && a.childId === child.id);
        const className = classes.find(c => c.id === child.classId)?.name || 'القسم العام';
        const statusLabel = att?.status === 'absent' ? 'غائب' : att?.status === 'late' ? 'متأخر' : 'حاضر';
        return [
          index + 1,
          child.registrationNumber,
          child.fullName,
          className,
          statusLabel,
          att?.arrivalTime || '08:00',
          att?.departureTime || '—',
          att?.notes || '—'
        ];
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `حضور_أطفال_روضتي_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('تم تنزيل تقرير الحضور بنجاح بصيغة CSV');
  };

  // Format date in Arabic string matching image.png (e.g., الثلاثاء 10 سبتمبر 2025)
  const arabicDateString = useMemo(() => {
    try {
      const dateObj = new Date(selectedDate);
      return new Intl.DateTimeFormat('ar-TN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(dateObj);
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start animate-in fade-in duration-300">
      {/* -------------------- MAIN CARD (CENTER) -------------------- */}
      <div className="flex-1 w-full bg-white rounded-[32px] border border-sky-100 shadow-xl shadow-sky-100/40 p-5 sm:p-7 md:p-8 space-y-6">
        {/* Top Card Header matching image.png */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Search Input on Left */}
          <div className="relative w-full sm:w-64 md:w-72 order-2 sm:order-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن طفل ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F0F7FF] border border-sky-100/80 outline-none rounded-full pr-11 pl-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-400/40 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Title & Date on Right */}
          <div className="text-right order-1 sm:order-2 flex flex-col items-start sm:items-end">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                قائمة الحضور اليومي
              </h2>
              <CalendarDays className="w-6 h-6 text-[#1E88E5]" />
            </div>

            {/* Date Pill & Picker */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-1">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-600 bg-transparent border-none cursor-pointer focus:outline-none hover:text-[#1E88E5]"
                title="انقر لتغيير اليوم"
              />
              <span>{arabicDateString}</span>
              <CalendarIcon className="w-3.5 h-3.5 text-sky-500" />
            </div>
          </div>
        </div>

        {/* Quick Filter Pill / Tabs Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3 text-sky-500" />
              <span>القسم:</span>
            </span>
            <button
              onClick={() => setSelectedClassFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedClassFilter === 'all'
                  ? 'bg-[#1E88E5] text-white shadow-xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              جميع الأقسام ({children.filter(c => c.status === 'active').length})
            </button>
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassFilter(cls.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedClassFilter === cls.id
                    ? 'bg-[#1E88E5] text-white shadow-xs'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>تسجيل حضور الكل</span>
          </button>
        </div>

        {/* 3 Summary Stat Chips matching image.png */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Total Children (Soft Sky Blue) */}
          <div className="bg-[#F0F7FF] rounded-2xl p-4 flex items-center justify-between border border-sky-100/60">
            <div className="flex items-center gap-2 text-sky-900 font-extrabold text-sm">
              <Users className="w-5 h-5 text-sky-600" />
              <span>إجمالي الأطفال</span>
            </div>
            <div className="text-2xl font-black text-[#1E40AF]">
              {stats.total}
            </div>
          </div>

          {/* Present Count (Soft Mint Green) */}
          <div className="bg-[#ECFDF5] rounded-2xl p-4 flex items-center justify-between border border-emerald-100/60">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>الحاضرون</span>
            </div>
            <div className="text-2xl font-black text-[#059669]">
              {stats.present}
            </div>
          </div>

          {/* Absent Count (Soft Light Pink) */}
          <div className="bg-[#FEF2F2] rounded-2xl p-4 flex items-center justify-between border border-rose-100/60">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>الغياب</span>
            </div>
            <div className="text-2xl font-black text-[#DC2626]">
              {stats.absent}
            </div>
          </div>
        </div>

        {/* Consecutive Absence Alert Banner (if any) */}
        {consecutiveAbsences.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                تنبيه ذكي: يوجد <strong>{consecutiveAbsences.length}</strong> أطفال في حالة غياب متتالي (أكثر من 3 أيام)
              </span>
            </div>
            <button
              onClick={() => setReminderAbsence(consecutiveAbsences[0])}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال تنبيه واتساب للأولياء</span>
            </button>
          </div>
        )}

        {/* Data Table matching image.png */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">اسم الطفل</th>
                <th className="py-3.5 px-4 text-center">القسم</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
                <th className="py-3.5 px-4 text-center">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    لا يوجد أطفال يطابقون خيارات البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredChildren.map((child, index) => {
                  const att = attendance.find(a => a.date === selectedDate && a.childId === child.id);
                  const isPresent = !att || att.status === 'present' || att.status === 'late';
                  const isAbsent = att?.status === 'absent';
                  const className = classes.find(c => c.id === child.classId)?.name || 'القسم العام';
                  const notes = att?.notes || (isAbsent ? 'مرض' : '—');

                  return (
                    <tr 
                      key={child.id} 
                      className="hover:bg-sky-50/40 transition-colors"
                    >
                      {/* Row Index (#) */}
                      <td className="py-3 px-4 text-center">
                        <span className="w-7 h-7 rounded-full bg-sky-50 text-[#0284C7] font-black text-xs inline-flex items-center justify-center">
                          {index + 1}
                        </span>
                      </td>

                      {/* Child Name & Cartoon Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ChildAvatar 
                            name={child.fullName} 
                            gender={child.gender} 
                            photoUrl={child.photoUrl}
                            size="md" 
                          />
                          <div>
                            <div className="font-extrabold text-[#0F172A] text-sm">
                              {child.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {child.registrationNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-600 font-bold text-xs">
                          {className}
                        </span>
                      </td>

                      {/* Interactive Status Badge Pill matching image.png */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(child)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black transition-all transform active:scale-95 cursor-pointer ${
                            isPresent
                              ? 'bg-[#DCFCE7] hover:bg-[#bbf7d0] text-[#15803D] border border-[#86EFAC]/50'
                              : 'bg-[#FEE2E2] hover:bg-[#fecaca] text-[#DC2626] border border-[#FCA5A5]/50'
                          }`}
                          title="انقر لتغيير الحالة (حاضر / غائب)"
                        >
                          <span>{isPresent ? 'حاضر' : 'غائب'}</span>
                          {isPresent ? (
                            <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />
                          )}
                        </button>
                      </td>

                      {/* Notes / Security Checkout Trigger */}
                      <td className="py-3 px-4 text-center text-xs text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <span className={isAbsent ? "text-rose-600 font-bold" : "text-slate-400"}>
                            {notes}
                          </span>
                          
                          {/* Quick Checkout security action */}
                          {isPresent && (
                            <button
                              onClick={() => {
                                setCheckingOutChild({ child, att: att || null });
                                setDepartureTime(new Date().toTimeString().slice(0, 5));
                                setPickupPerson(child.fatherName);
                                setPickupRelation('الأب');
                              }}
                              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 flex items-center justify-center text-[10px] cursor-pointer"
                              title="تسجيل وتأمين الانصراف"
                            >
                              🛡️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------- RIGHT COLUMN (WIDGETS & SUMMARY) -------------------- */}
      <div className="w-full xl:w-72 flex-shrink-0 space-y-5 select-none">
        {/* Top Joyful Card: "يوم سعيد في روضتي 💛" matching image.png */}
        <div className="bg-gradient-to-br from-[#FEF9C3] via-[#FEF08A] to-[#FDE047] rounded-3xl p-5 border border-amber-200/80 shadow-md relative overflow-hidden text-center">
          {/* Cute sun rays background */}
          <div className="absolute top-2 right-2 opacity-20 text-4xl pointer-events-none">
            ☀️
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/70 shadow-xs flex items-center justify-center text-2xl mb-1.5">
              ☀️
            </div>
            <h3 className="font-black text-lg text-amber-950 tracking-tight flex items-center justify-center gap-1.5">
              <span>يوم سعيد</span>
              <span>في روضتي</span>
              <span>💛</span>
            </h3>
            <p className="text-[11px] text-amber-900/80 font-bold mt-1">
              مرح، تعلم، وبيئة آمنة لأطفالنا
            </p>
          </div>
        </div>

        {/* Middle Card: "ملخص الحضور" with Donut Gauge matching image.png */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xl shadow-sky-100/40 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>ملخص الحضور</span>
            </h4>
            <span className="text-[10px] font-bold text-slate-400">اليوم</span>
          </div>

          {/* Donut Progress Chart */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="12"
                />
                {/* Foreground Vibrant Green Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (stats.percentage / 100))}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Centered Percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900">
                  {stats.percentage}%
                </span>
              </div>
            </div>

            {/* Attendance numbers */}
            <div className="mt-2 text-center">
              <div className="text-sm font-extrabold text-emerald-600">
                الحضور {stats.present} / {stats.total}
              </div>
            </div>
          </div>

          {/* Absent Pill Card */}
          <div className="bg-[#FEF2F2] rounded-2xl p-2.5 px-4 flex items-center justify-between border border-rose-100">
            <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-xs">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">
                ✕
              </span>
              <span>الغياب</span>
            </div>
            <span className="text-sm font-black text-rose-700">
              {stats.absent}
            </span>
          </div>

          {/* Action Buttons matching image.png */}
          <div className="space-y-2.5 pt-1">
            {/* Solid Vibrant Blue Button: تحميل التقرير */}
            <button
              onClick={handleExportCSV}
              className="w-full py-3 px-4 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل التقرير</span>
            </button>

            {/* Outline Blue Button: طباعة القائمة */}
            <button
              onClick={() => setPrintAttendanceClassId(selectedClassFilter === 'all' ? classes[0]?.id || 'class-1' : selectedClassFilter)}
              className="w-full py-3 px-4 bg-white hover:bg-sky-50 text-[#1E88E5] border-2 border-[#1E88E5] font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة القائمة</span>
            </button>
          </div>
        </div>

        {/* Bottom Stationery Illustration matching image.png */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-sky-50/50 to-amber-50/60 border border-sky-100/70 p-3 text-center shadow-xs">
          <div className="w-full h-32 flex items-center justify-center overflow-hidden">
            <img
              src={schoolBooksImg}
              alt="أدوات مدرسية وكتب"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-sm scale-105"
            />
          </div>
        </div>
      </div>

      {/* ----------------- CHECKOUT / SECURITY MODAL ----------------- */}
      {checkingOutChild && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-sky-100 animate-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sky-800 font-black text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>تأمين انصراف وتسليم الطفل</span>
              </div>
              <button
                onClick={() => setCheckingOutChild(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-3 bg-sky-50/70 rounded-2xl flex items-center gap-3">
              <ChildAvatar 
                name={checkingOutChild.child.fullName} 
                gender={checkingOutChild.child.gender}
                photoUrl={checkingOutChild.child.photoUrl}
                size="lg" 
              />
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">{checkingOutChild.child.fullName}</h4>
                <p className="text-xs text-slate-500">
                  {classes.find(c => c.id === checkingOutChild.child.classId)?.name} • {checkingOutChild.child.registrationNumber}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">اسم الشخص المستلم:</label>
                <input
                  type="text"
                  value={pickupPerson}
                  onChange={(e) => setPickupPerson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  placeholder="مثال: أحمد الطرابلسي"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">صلة القرابة:</label>
                  <select
                    value={pickupRelation}
                    onChange={(e) => setPickupRelation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  >
                    <option value="الأب">الأب</option>
                    <option value="الأم">الأم</option>
                    <option value="جد / جدة">جد / جدة</option>
                    <option value="عم / خالة">عم / خالة</option>
                    <option value="سائق الحافلة">سائق الحافلة</option>
                    <option value="شخص مخول بتوكيل">شخص مخول بتوكيل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">توقيت الخروج:</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">ملاحظات الانصراف:</label>
                <input
                  type="text"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="مثال: انصرف مع والدته بإذن مسبق"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setCheckingOutChild(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!checkingOutChild) return;
                  recordAttendance({
                    date: selectedDate,
                    childId: checkingOutChild.child.id,
                    classId: checkingOutChild.child.classId,
                    status: checkingOutChild.att?.status || 'present',
                    arrivalTime: checkingOutChild.att?.arrivalTime || '08:00',
                    departureTime: departureTime,
                    pickedUpBy: pickupPerson,
                    pickedUpRelation: pickupRelation,
                    recordedBy: currentUser?.fullName || 'مديرة الروضة',
                    notes: checkoutNotes || checkingOutChild.att?.notes,
                  });
                  setCheckingOutChild(null);
                  setToastMessage(`تم تسجيل انصراف ${checkingOutChild.child.fullName} بأمان`);
                }}
                className="px-5 py-2 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                تأكيد الانصراف والحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- CONSECUTIVE ABSENCE MODAL ----------------- */}
      {reminderAbsence && (
        <ParentAbsenceReminderModal
          absenceInfo={reminderAbsence}
          onClose={() => setReminderAbsence(null)}
        />
      )}
    </div>
  );
};
