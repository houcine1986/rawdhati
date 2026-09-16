import React, { useEffect } from 'react';
import { Printer, X, ShieldCheck, Phone, Heart, Bus, Utensils, ExternalLink, Contact } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAge, formatArabicDate, printDocumentSection } from '../utils/helpers';

export const PrintChildCardModal: React.FC = () => {
  const { printChildCardData, setPrintChildCardData, settings, classes, busRoutes } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPrintChildCardData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPrintChildCardData]);

  if (!printChildCardData) return null;

  const child = printChildCardData;
  const childClass = classes.find(c => c.id === child.classId);
  const busRoute = busRoutes.find(r => r.id === child.services?.transportRouteId);
  const age = calculateAge(child.birthDate);

  const handlePrint = () => {
    window.print();
  };

  const handleDirectPrint = () => {
    printDocumentSection('printable-childcard-doc', `بطاقة تلميذ - ${child.fullName}`);
  };

  const handleClose = () => {
    setPrintChildCardData(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-6 md:p-8 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-4 sm:p-6 md:p-8 border border-slate-200 relative my-4 sm:my-8 print:my-0 print:border-none print:shadow-none print:p-2 animate-in zoom-in-95" 
        dir="rtl"
      >
        {/* Sticky Top action bar (hidden in print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pb-4 mb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="text-sm font-black text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Contact className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900">معاينة بطاقة التلميذ المدرسية</div>
              <div className="text-[11px] text-slate-500 font-normal">شارة وبطاقة هوية مدرسية رسمية</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5b4cc4] active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة البطاقة</span>
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

        {/* ===================== PRINTABLE ID CARD TEMPLATE ===================== */}
        <div id="printable-childcard-doc" className="border-2 border-slate-800 rounded-3xl p-6 bg-gradient-to-br from-white to-slate-50 shadow-sm relative overflow-hidden text-slate-900 print:border-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD93D] flex items-center justify-center text-2xl border border-amber-300">
                🏠
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{settings.nurseryName}</h3>
                <p className="text-[11px] text-slate-600 font-medium">بطاقة التلميذ المدرسية • السنة التربوية 2025/2026</p>
                <p className="text-[10px] text-slate-500 font-mono">الترخيص: {settings.licenseNumber}</p>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-extrabold border border-slate-300">
                {child.registrationNumber}
              </span>
            </div>
          </div>

          {/* Body: Photo & Main Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-800 flex-shrink-0 bg-slate-100 shadow-inner">
              <img
                src={child.photoUrl}
                alt={child.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-1.5 text-xs text-right w-full">
              <div className="text-base font-black text-slate-900">{child.fullName}</div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[11px]">الفوج / القسم:</span>
                  <span className="font-bold mr-1 block text-slate-900">{childClass?.name || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">تاريخ الولادة والعمر:</span>
                  <span className="font-bold mr-1 block text-slate-900">{formatArabicDate(child.birthDate)} ({age.years} سنوات)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">الفصيلة الدموية:</span>
                  <span className="font-bold mr-1 block text-rose-700 font-mono">{child.health?.bloodType || 'سليم'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">الحالة الصحية:</span>
                  <span className="font-bold mr-1 block text-slate-900 truncate">
                    {child.health?.allergies?.length ? `حساسية (${child.health.allergies[0]})` : 'لا توجد حساسية'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribed Services */}
          <div className="flex items-center gap-2 mb-4 text-xs font-bold flex-wrap">
            {child.services?.canteen && (
              <span className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 border border-orange-200 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5" />
                <span>اشتراك المطعم المدرسي</span>
              </span>
            )}
            {child.services?.transport && (
              <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                <Bus className="w-3.5 h-3.5" />
                <span>اشتراك النقل: {busRoute?.name || 'حافلة الروضة'}</span>
              </span>
            )}
            {child.services?.eveningCare && (
              <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200">
                حراسة مسائية
              </span>
            )}
          </div>

          {/* Emergency Contacts & Authorized Pickups */}
          <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-800 text-[11px] mb-1">أولياء الأمور للاتصال:</div>
                <div className="text-slate-700 space-y-0.5">
                  <div>الأب: {child.fatherName} ({child.fatherPhone})</div>
                  <div>الأم: {child.motherName} ({child.motherPhone})</div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-800 text-[11px] mb-1">المفوضون باستلام الطفل:</div>
                <div className="text-slate-700 space-y-0.5 max-h-14 overflow-hidden">
                  {child.authorizedPersons?.length > 0 ? (
                    child.authorizedPersons.map((p, i) => (
                      <div key={i} className="truncate">
                        • {p.name} ({p.relation}) - {p.phone}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400">الأولياء فقط</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer & Stamps */}
          <div className="flex items-end justify-between border-t-2 border-slate-800 pt-3 mt-4 text-[11px]">
            <div className="space-y-0.5 text-slate-600">
              <div>📍 {settings.address}</div>
              <div>📞 {settings.phone1} • {settings.phone2}</div>
            </div>

            <div className="text-center font-bold">
              <div className="text-slate-700">ختم وتوقيع الإدارة</div>
              <div className="w-24 h-10 border-b border-dashed border-slate-400 mt-1"></div>
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
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-2xl text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-purple-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>نافذة طباعة منفصلة</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white font-black rounded-2xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة البطاقة الآن</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
