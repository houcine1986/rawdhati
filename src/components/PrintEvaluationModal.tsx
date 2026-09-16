import React, { useEffect } from 'react';
import { Printer, X, Award, CheckCircle2, Star, Calendar, BookOpen, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatArabicDate, printDocumentSection } from '../utils/helpers';

export const PrintEvaluationModal: React.FC = () => {
  const { printEvaluationData, setPrintEvaluationData, settings, classes } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPrintEvaluationData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPrintEvaluationData]);

  if (!printEvaluationData) return null;

  const { evaluation, child } = printEvaluationData;
  const childClass = classes.find(c => c.id === child?.classId);

  const handlePrint = () => {
    window.print();
  };

  const handleDirectPrint = () => {
    printDocumentSection('printable-evaluation-doc', `دفتر التقييم - ${child?.fullName || 'تلميذ'}`);
  };

  const handleClose = () => {
    setPrintEvaluationData(null);
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return <span className="text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 rounded-lg text-xs">ممتاز (مكتسب بالكامل)</span>;
      case 'good':
        return <span className="text-blue-800 font-bold bg-blue-100 px-2.5 py-1 rounded-lg text-xs">جيد جداً (في طور التثبيت)</span>;
      case 'in_progress':
        return <span className="text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-lg text-xs">في طور الاكتساب</span>;
      default:
        return <span className="text-rose-800 font-bold bg-rose-100 px-2.5 py-1 rounded-lg text-xs">يحتاج إلى دعم وتأطير</span>;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-6 md:p-8 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 md:p-8 border border-slate-200 relative my-4 sm:my-8 print:my-0 print:border-none print:shadow-none print:p-2 animate-in zoom-in-95" 
        dir="rtl"
      >
        {/* Sticky Top Action Bar (hidden in print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pb-4 mb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="text-sm font-black text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900">معاينة بطاقة التقييم البيداغوجي للطباعة</div>
              <div className="text-[11px] text-slate-500 font-normal">الطفل: {child?.fullName || 'غير محدد'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              title="طباعة مباشرة"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير</span>
            </button>

            <button
              onClick={handleDirectPrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="فتح في نافذة مستقلة للطباعة"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نافذة طباعة</span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer transition-colors border border-rose-200 flex items-center gap-1"
              title="إغلاق النافذة (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="text-xs font-bold">إغلاق</span>
            </button>
          </div>
        </div>

        {/* ===================== PRINTABLE EVALUATION REPORT ===================== */}
        <div id="printable-evaluation-doc" className="border-2 border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 text-slate-900 font-sans bg-white print:border-2">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">{settings.nurseryName}</h2>
              <p className="text-xs text-slate-700 font-medium">الجمهورية التونسية • وزارة الأسرة والمرأة والطفولة وكبار السن</p>
              <p className="text-[11px] text-slate-600">روضة نموذجية معتمدة • ترخيص عدد: {settings.licenseNumber}</p>
            </div>

            <div className="text-left text-xs space-y-1">
              <div className="font-bold text-slate-800 font-mono">السنة التربوية: 2025 / 2026</div>
              <div className="text-slate-600 font-bold">{evaluation.term}</div>
              <div className="text-slate-500 font-mono text-[11px]">التاريخ: {formatArabicDate(evaluation.date)}</div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center py-3 bg-purple-50 rounded-2xl border border-purple-200">
            <h1 className="text-lg md:text-xl font-black text-purple-950">دفتر المتابعة والتقييم البيداغوجي الفردي</h1>
            <p className="text-xs text-purple-800 font-medium mt-0.5">ملاحظات التطور الحركي، المعرفي، اللغوي والاندماج الاجتماعي للطفل</p>
          </div>

          {/* Child details box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">اسم الطفل ولقبه:</span>
              <strong className="text-slate-900 text-sm">{child?.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">الفوج / القسم:</span>
              <strong className="text-slate-800">{childClass?.name || 'غير محدد'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">رقم التسجيل:</span>
              <span className="font-mono font-bold text-slate-800">{child?.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">المربية المؤطرة:</span>
              <strong className="text-slate-800">{evaluation.teacherId || 'المربية المسؤولة'}</strong>
            </div>
          </div>

          {/* Skills Evaluation Categories */}
          <div className="space-y-3">
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>شبكة تقييم الكفايات والمهارات المكتسبة:</span>
            </h3>

            <div className="space-y-2.5">
              {evaluation.categories?.map((cat, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{cat.name}</span>
                    <span className="text-[11px] text-slate-600">{cat.skills[0]?.name}</span>
                  </div>
                  <div>
                    {getRatingBadge(cat.skills[0]?.rating || 'good')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Remarks & Pedagogical Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
              <span className="font-extrabold text-purple-950 block">ملاحظات وتقييم المربية:</span>
              <p className="text-slate-800 leading-relaxed">{evaluation.generalRemarks || 'طفل هادئ ومتفاعل بشكل إيجابي في الأنشطة الجماعية.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
              <span className="font-extrabold text-amber-950 block">توصيات للأسرة والمتابعة المنزلية:</span>
              <p className="text-slate-800 leading-relaxed">{evaluation.recommendations || 'مواصلة المتابعة والتفاعل الإيجابي مع أنشطة الروضة والتشجيع المستمر.'}</p>
            </div>
          </div>

          {/* Signatures and Stamp */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-800 text-center text-xs">
            <div>
              <div className="font-bold text-slate-700">ملاحظة وتوقيع الولي</div>
              <div className="h-14 border-b border-dashed border-slate-300 mt-2"></div>
            </div>
            <div>
              <div className="font-bold text-slate-700">توقيع المربية المؤطرة</div>
              <div className="h-14 border-b border-dashed border-slate-300 mt-2"></div>
            </div>
            <div>
              <div className="font-bold text-slate-700">ختم وتوقيع إدارة الروضة</div>
              <div className="h-14 border-b border-dashed border-slate-300 mt-2"></div>
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
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-2xl text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-purple-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>نافذة طباعة منفصلة</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير الآن</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
