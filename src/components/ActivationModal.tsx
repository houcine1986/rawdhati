import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Lock, 
  CheckCircle2, 
  Laptop,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getMachineId } from '../utils/licenseManager';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose }) => {
  const { license, activateWithKey, settings } = useApp();
  const [inputKey, setInputKey] = useState('');
  const [clientName, setClientName] = useState(settings.nurseryName || '');
  const [copiedMid, setCopiedMid] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const machineId = getMachineId();

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    setCopiedMid(true);
    setTimeout(() => setCopiedMid(false), 3000);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);

    if (!inputKey.trim()) {
      setStatusMessage({ type: 'error', text: 'الرجاء إدخال مفتاح التفعيل.' });
      setIsSubmitting(false);
      return;
    }

    const result = activateWithKey(inputKey.trim(), clientName.trim() || settings.nurseryName);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">تفعيل رخصة البرنامج (Offline Activation)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                تفعيل الترخيص الدائم أو السنوي للعمل بدون إنترنت 100%
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Current Status banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            license.isLicensed
              ? license.type === 'lifetime'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              : license.isTrialExpired
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {license.isLicensed ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : license.isTrialExpired ? (
                <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <div className="font-extrabold text-sm">
                  {license.isLicensed
                    ? license.type === 'lifetime'
                      ? 'البرنامج مفعل بنجاح (رخصة كاملة مدى الحياة)'
                      : `البرنامج مفعل باشتراك سنوي (متبقي ${license.daysRemaining} يوماً)`
                    : license.isTrialExpired
                    ? 'انتهت الفترة التجريبية المجانية (14 يوماً)'
                    : `النسخة التجريبية نشطة (متبقي ${license.daysRemaining} يوماً)`}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {license.isLicensed && license.expiryDate ? `تاريخ الانتهاء: ${license.expiryDate}` : 'الترخيص يعمل محلياً بالكامل'}
                </div>
              </div>
            </div>

            <span className="text-[11px] font-black px-3 py-1 rounded-full bg-white shadow-xs border">
              {license.type === 'lifetime' ? 'مدى الحياة' : license.type === 'annual' ? 'سنوي' : 'نسخة ديمو'}
            </span>
          </div>

          {/* Machine ID Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>رمز تعريف جهازك (Machine ID):</span>
              </label>
              <span className="text-[10px] text-slate-400">فريد ومخصص لهذا الحاسوب</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={machineId}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 text-center tracking-wider selection:bg-indigo-100"
              />
              <button
                type="button"
                onClick={handleCopyMachineId}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  copiedMid
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
                }`}
              >
                {copiedMid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMid ? 'تم النسخ!' : 'نسخ الرمز'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * قم بنسخ هذا الرمز وإرساله للمطور عبر الواتساب أو البريد الإلكتروني لاستلام مفتاح التفعيل الخاص بك.
            </p>
          </div>

          {/* Activation Form */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                اسم المؤسسة / الروضة:
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="اسم الروضة المسجلة..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                مفتاح التفعيل (Activation Key):
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                placeholder="KEY-LIFE-XXXX-XXXX-XXXX أو KEY-1Y-XXXXXXXX-XXXX..."
                className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-100 outline-none tracking-wider"
              />
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري التحقق...' : 'تفعيل البرنامج الآن'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>

          {/* Quick FAQ / Help */}
          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-700">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>أنواع التراخيص المتاحة:</span>
            </div>
            <p>• <strong>رخصة مدى الحياة (Lifetime):</strong> تفعيل دائم للبرنامج على هذا الجهاز بدون أي رسوم تجديد مستقبلية.</p>
            <p>• <strong>اشتراك سنوي (Annual):</strong> تفعيل لمدة 365 يوماً مع إمكانية التجديد.</p>
            <p>• <strong>العمل بدون إنترنت:</strong> التفعيل والتحقق يتم محلياً دون الحاجة لأي اتصال بالشبكة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
