import React, { useEffect } from 'react';
import { Printer, X, ExternalLink, CalendarCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatArabicDate, printDocumentSection } from '../utils/helpers';

export const PrintAttendanceModal: React.FC = () => {
  const { printAttendanceClassId, setPrintAttendanceClassId, classes, children, staff, settings } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPrintAttendanceClassId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPrintAttendanceClassId]);

  if (!printAttendanceClassId) return null;

  const currentClass = classes.find(c => c.id === printAttendanceClassId);
  const classChildren = children.filter(c => c.classId === printAttendanceClassId && c.status === 'active');
  const mainTeacher = staff.find(s => s.id === currentClass?.mainTeacherId);

  const handlePrint = () => {
    window.print();
  };

  const handleDirectPrint = () => {
    printDocumentSection('printable-attendance-doc', `سجل الحضور - ${currentClass?.name || 'فوج'}`);
  };

  const handleClose = () => {
    setPrintAttendanceClassId(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-6 md:p-8 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 md:p-8 border border-slate-200 relative my-4 sm:my-8 print:my-0 print:border-none print:shadow-none print:p-2 animate-in zoom-in-95"
        dir="rtl"
      >
        {/* Sticky Actions bar (hidden in print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pb-4 mb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="text-sm font-black text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900">معاينة سجل الحضور الرسمي للطباعة</div>
              <div className="text-[11px] text-slate-500 font-normal">فوج: {currentClass?.name || 'غير محدد'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السجل</span>
            </button>

            <button
              onClick={handleDirectPrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نافذة طباعة</span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer transition-colors border border-rose-200 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span className="text-xs font-bold">إغلاق</span>
            </button>
          </div>
        </div>

        {/* Printable Attendance Sheet */}
        <div id="printable-attendance-doc" className="border-2 border-slate-900 p-6 md:p-8 rounded-3xl space-y-6 text-slate-900 font-sans bg-white print:border-2">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 text-xs">
            <div className="text-right">
              <h2 className="font-extrabold text-base">{settings.nurseryName}</h2>
              <div>الترخيص: {settings.licenseNumber}</div>
              <div>الهاتف: {settings.phone1}</div>
            </div>

            <div className="text-center">
              <h1 className="text-lg font-black tracking-wide">الجمهورية التونسية</h1>
              <div className="text-xs font-bold">وزارة الأسرة والمرأة والطفولة وكبار السن</div>
              <div className="text-xs font-semibold mt-1">كشف متابعة الحضور والغياب اليومي</div>
            </div>

            <div className="text-left">
              <div>السنة التربوية: <strong>2025/2026</strong></div>
              <div>التاريخ: <strong>{formatArabicDate(new Date().toISOString().split('T')[0])}</strong></div>
              <div>الفوج: <strong>{currentClass?.name}</strong></div>
            </div>
          </div>

          {/* Subheader info */}
          <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl text-xs">
            <div>المربية المسؤولة: <strong>{mainTeacher?.fullName || 'المربية المؤطرة'}</strong></div>
            <div>القاعة: <strong>{currentClass?.roomNumber}</strong></div>
            <div>إجمالي أطفال الفوج: <strong>{classChildren.length} طفل</strong></div>
          </div>

          {/* Children Attendance Table */}
          <table className="w-full text-xs text-right border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-200 text-slate-800 font-bold">
                <th className="border border-slate-400 p-2 w-10 text-center">الرقم</th>
                <th className="border border-slate-400 p-2">اسم ولقب التلميذ(ة)</th>
                <th className="border border-slate-400 p-2 w-28 text-center">حضور الصباح (08:00)</th>
                <th className="border border-slate-400 p-2 w-28 text-center">وجبة الغداء</th>
                <th className="border border-slate-400 p-2 w-28 text-center">الخروج المسائي (17:00)</th>
                <th className="border border-slate-400 p-2 w-36">توقيع المستلم / ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {classChildren.map((child, index) => (
                <tr key={child.id} className="border-b border-slate-300">
                  <td className="border border-slate-400 p-2 text-center font-mono">{index + 1}</td>
                  <td className="border border-slate-400 p-2 font-bold">{child.fullName}</td>
                  <td className="border border-slate-400 p-2 text-center">
                    <div className="w-4 h-4 border border-slate-500 rounded mx-auto"></div>
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    {child.services?.canteen ? (
                      <div className="w-4 h-4 border border-slate-500 rounded mx-auto"></div>
                    ) : (
                      <span className="text-[10px] text-slate-400">غير مشترك</span>
                    )}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    <div className="w-4 h-4 border border-slate-500 rounded mx-auto"></div>
                  </td>
                  <td className="border border-slate-400 p-2 text-[10px] text-slate-500"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer signature */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-800 text-center text-xs">
            <div>
              <div className="font-bold">توقيع المربية المسؤولة</div>
              <div className="h-14 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
            <div>
              <div className="font-bold">ختم وتوقيع إدارة الروضة</div>
              <div className="h-14 border-b border-dashed border-slate-400 mt-2"></div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between no-print">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer transition-colors"
          >
            إغلاق المعاينة
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectPrint}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-2xl text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-indigo-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>نافذة طباعة منفصلة</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السجل الآن</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
