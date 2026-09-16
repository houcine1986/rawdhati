import React, { useEffect } from 'react';
import { Printer, X, ExternalLink, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTND, numberToArabicWords, formatArabicDate, printDocumentSection } from '../utils/helpers';

export const PrintReceiptModal: React.FC = () => {
  const { printReceiptData, setPrintReceiptData, settings } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPrintReceiptData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPrintReceiptData]);

  if (!printReceiptData) return null;

  const { invoice, payment, child } = printReceiptData;

  const handlePrint = () => {
    window.print();
  };

  const handleDirectPrint = () => {
    printDocumentSection('printable-receipt-doc', `وصل استخلاص - ${child?.fullName || 'سند'}`);
  };

  const handleClose = () => {
    setPrintReceiptData(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-6 md:p-8 overflow-y-auto print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 border border-slate-200 relative my-4 sm:my-8 print:my-0 print:border-none print:shadow-none print:p-2 animate-in zoom-in-95"
        dir="rtl"
      >
        {/* Sticky Actions bar (hidden in print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pb-4 mb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="text-sm font-black text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900">معاينة وصل الاستخلاص للطباعة</div>
              <div className="text-[11px] text-slate-500 font-normal">سند قبض رسمي بالدينار التونسي</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند</span>
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

        {/* ===================== PRINTABLE RECEIPT TEMPLATE ===================== */}
        <div id="printable-receipt-doc" className="border-2 border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-slate-900 font-sans bg-white print:border-2">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{settings.nurseryName}</h1>
              <p className="text-xs text-slate-700 font-medium">روضة ومحضنة أطفال نموذجية معتمدة</p>
              <p className="text-[11px] text-slate-600 mt-1">الترخيص الوزاري: {settings.licenseNumber}</p>
              {settings.taxId && <p className="text-[11px] text-slate-600">المعرف الجبائي: {settings.taxId}</p>}
            </div>

            <div className="text-left text-xs space-y-1">
              <div className="font-bold text-slate-800">الهاتف: {settings.phone1}</div>
              <div className="text-slate-600">{settings.address}</div>
              <div className="text-slate-500 font-mono text-[11px]">التاريخ: {formatArabicDate(payment.date)}</div>
            </div>
          </div>

          {/* Receipt Title Box */}
          <div className="text-center py-2.5 bg-slate-100 rounded-2xl border border-slate-300">
            <h2 className="text-lg font-extrabold tracking-wide text-slate-900">وصل استخلاص / سند قبض رسمي</h2>
            <div className="text-xs font-mono font-bold text-slate-700 mt-0.5">
              رقم السند: REC-{payment.id.toUpperCase()} • الفاتورة: {invoice.invoiceNumber}
            </div>
          </div>

          {/* Child & Parent Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">اسم التلميذ(ة):</span>
              <span className="font-bold text-slate-900 text-sm">{child?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ولي الأمر:</span>
              <span className="font-bold text-slate-900 text-sm">{child?.fatherName || child?.motherName || 'الولي'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">رقم التسجيل المدرسي:</span>
              <span className="font-mono font-bold text-slate-800">{child?.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">الشهر المعني بالأداء:</span>
              <span className="font-bold text-slate-800">{invoice.month}</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 px-3 bg-slate-100 rounded-xl text-xs font-bold">
              <span>بيان الخدمة المسددة</span>
              <span>المبلغ</span>
            </div>
            <div className="space-y-1 text-xs">
              {invoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1.5 px-3 border-b border-slate-100">
                  <span className="text-slate-700">{it.description}</span>
                  <span className="font-mono font-bold text-slate-900">{formatTND(it.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Box */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-emerald-950 text-sm">المبلغ المدفوع المقبوض:</span>
              <span className="font-black text-emerald-950 text-lg font-mono">{formatTND(payment.amount)}</span>
            </div>
            <div className="text-slate-700 pt-1 border-t border-emerald-200">
              <span className="font-bold">المبلغ بالحروف:</span> {numberToArabicWords(payment.amount)}
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>طريقة الخلاص: <strong>{payment.method === 'cash' ? 'نقداً (سيولة)' : payment.method === 'cheque' ? `شيك بنكي (رقم: ${payment.reference || '-'})` : 'تحويل بنكي / بريدي'}</strong></span>
              <span>المتبقي في الفاتورة: <strong className="font-mono text-rose-600">{formatTND(invoice.remainingAmount)}</strong></span>
            </div>
          </div>

          {/* Signatures and Stamp */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-800 text-center text-xs">
            <div>
              <div className="font-bold text-slate-700">توقيع ولي الأمر (المودع)</div>
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
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-2xl text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-amber-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>نافذة طباعة منفصلة</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl text-xs shadow-md cursor-pointer transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند الآن</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
