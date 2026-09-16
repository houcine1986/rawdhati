import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  MessageSquare, 
  Check, 
  Copy, 
  Calendar, 
  AlertTriangle, 
  UserCheck, 
  HeartHandshake, 
  FileText, 
  GraduationCap,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConsecutiveAbsenceInfo, formatArabicDate, formatPhoneForWhatsApp, formatPhoneForCall } from '../utils/helpers';

interface ParentAbsenceReminderModalProps {
  absenceInfo: ConsecutiveAbsenceInfo | null;
  onClose: () => void;
}

export const ParentAbsenceReminderModal: React.FC<ParentAbsenceReminderModalProps> = ({
  absenceInfo,
  onClose
}) => {
  const { settings, addNotification, currentUser } = useApp();
  const [selectedParent, setSelectedParent] = useState<'father' | 'mother'>('father');
  const [templateType, setTemplateType] = useState<'wellbeing' | 'formal' | 'pedagogy'>('wellbeing');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSavedToSystem, setIsSavedToSystem] = useState<boolean>(false);

  if (!absenceInfo) return null;

  const targetPhone = selectedParent === 'father' 
    ? (absenceInfo.fatherPhone || absenceInfo.emergencyPhone)
    : (absenceInfo.motherPhone || absenceInfo.emergencyPhone);

  const targetName = selectedParent === 'father'
    ? (absenceInfo.fatherName || 'ولي أمر الطفل')
    : (absenceInfo.motherName || 'والدة الطفل');

  const nurseryTitle = settings?.nurseryName || 'روضتي';

  // Templates definition
  const getTemplateText = (type: 'wellbeing' | 'formal' | 'pedagogy') => {
    const formattedStart = formatArabicDate(absenceInfo.startDate);
    const formattedEnd = formatArabicDate(absenceInfo.endDate);
    const dateRangeStr = absenceInfo.consecutiveDays > 1 
      ? `(من ${formattedStart} إلى ${formattedEnd})`
      : `(بتاريخ ${formattedEnd})`;

    switch (type) {
      case 'wellbeing':
        return `السلام عليكم ورحمة الله وبركاته،\n\nتحية عطرة من إدارة ${nurseryTitle}.\nنود الاطمئنان على صحة وسلامة طفلنا العزيز *${absenceInfo.childName}*، نظراً لتسجيل غيابه عن الروضة لمدة *${absenceInfo.consecutiveDays} أيام متتالية* ${dateRangeStr}.\n\nنرجو أن يكون بأفضل حال ونتمنى له دوام الصحة والعافية، ونحن في انتظار عودته الميمونة إلى فضاء الروضة وأصدقائه في ${absenceInfo.className}.\n\nدمتم بخير وعافية،\nإدارة ${nurseryTitle}`;

      case 'formal':
        return `السلام عليكم ورحمة الله وبركاته،\n\nالسيد(ة) *${targetName}* ولي أمر الطفل(ة) *${absenceInfo.childName}* المحترم،\n\nنحيطكم علماً بأنه قد تم تسجيل غياب طفلكم عن الروضة لمدة *${absenceInfo.consecutiveDays} أيام متتالية* ${dateRangeStr}.\nحرصاً على سلامة ومتابعة الطفل البيداغوجية، يرجى التكرم بموافاتنا بمبرر الغياب أو الإدلاء بشهادة طبية عند استئناف الحضور.\n\nشاكرين حسن تفهمكم وتعاونكم المستمر،\nإدارة ${nurseryTitle}\nالهاتف: ${settings?.phone1 || ''}`;

      case 'pedagogy':
        return `تحية طيبة من الإطار التربوي لـ ${nurseryTitle}،\n\nنرجو أن يكون طفلنا العزيز *${absenceInfo.childName}* في صحة جيدة.\nنظراً لغيابه المتواصل لمدة *${absenceInfo.consecutiveDays} أيام* ${dateRangeStr}، وحرصاً منا على عدم انقطاعه عن البرنامج التربوي لفوج *${absenceInfo.className}*، يسعدنا تزويدكم بملخص الأنشطة والتمارين لمواكبة زملائه في المنزل.\n\nيسعدنا تواصلكم معنا،\nالمربية وإدارة ${nurseryTitle}`;
    }
  };

  // Initialize or get current message
  const activeMessage = customMessage || getTemplateText(templateType);

  const handleTemplateChange = (type: 'wellbeing' | 'formal' | 'pedagogy') => {
    setTemplateType(type);
    setCustomMessage(getTemplateText(type));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleWhatsAppSend = () => {
    const waPhone = formatPhoneForWhatsApp(targetPhone);
    const encodedText = encodeURIComponent(activeMessage);
    const waUrl = waPhone 
      ? `https://wa.me/${waPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    
    window.open(waUrl, '_blank');
  };

  const handleSmsSend = () => {
    const cleanPhone = formatPhoneForCall(targetPhone);
    const encodedText = encodeURIComponent(activeMessage);
    const smsUrl = `sms:${cleanPhone}?body=${encodedText}`;
    window.location.href = smsUrl;
  };

  const handleSaveToSystemNotifications = () => {
    addNotification({
      title: `تذكير غياب: ${absenceInfo.childName} (${absenceInfo.consecutiveDays} أيام)`,
      message: activeMessage,
      type: 'general',
      targetAudience: 'individual',
      targetId: absenceInfo.childId,
      date: new Date().toISOString().split('T')[0],
      isImportant: true,
    });
    setIsSavedToSystem(true);
    setTimeout(() => setIsSavedToSystem(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white shadow-inner">
              <AlertTriangle className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                <span>متابعة الغياب المتكرر</span>
                <span>•</span>
                <span className="text-amber-200 font-black">{absenceInfo.consecutiveDays} أيام متتالية</span>
              </div>
              <h3 className="text-xl font-black mt-1">
                إرسال رسالة تذكير واطمئنان لولي الأمر
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Child & Absence Summary Banner */}
          <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={absenceInfo.childPhoto}
                alt={absenceInfo.childName}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-800">{absenceInfo.childName}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono font-bold">
                    {absenceInfo.registrationNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2 font-medium">
                  <span>فوج: <strong className="text-slate-800">{absenceInfo.className}</strong></span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">
                    غائب من {formatArabicDate(absenceInfo.startDate)} إلى {formatArabicDate(absenceInfo.endDate)}
                  </span>
                </div>
                {absenceInfo.lastNotes && (
                  <div className="text-[11px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-lg mt-1.5 inline-block">
                    ملاحظة بالسجل: {absenceInfo.lastNotes}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center sm:text-left bg-white px-3 py-2 rounded-2xl border border-amber-200 shadow-sm flex-shrink-0">
              <div className="text-[10px] text-slate-400 font-bold">مدة الانقطاع</div>
              <div className="text-lg font-black text-rose-600 font-mono">{absenceInfo.consecutiveDays} أيام</div>
            </div>
          </div>

          {/* Select Parent Contact Target */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block">
              اختر ولي الأمر المستلم:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Father Card */}
              <div
                onClick={() => setSelectedParent('father')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedParent === 'father'
                    ? 'bg-indigo-50/80 border-[#6C5CE7] shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    selectedParent === 'father' ? 'bg-[#6C5CE7] text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    أب
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">{absenceInfo.fatherName || 'الأب'}</div>
                    <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{absenceInfo.fatherPhone || 'غير مسجل'}</div>
                  </div>
                </div>

                {absenceInfo.fatherPhone && (
                  <a
                    href={`tel:${formatPhoneForCall(absenceInfo.fatherPhone)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                    title="اتصال هاتفي مباشر"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Mother Card */}
              <div
                onClick={() => setSelectedParent('mother')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedParent === 'mother'
                    ? 'bg-indigo-50/80 border-[#6C5CE7] shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    selectedParent === 'mother' ? 'bg-[#6C5CE7] text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    أم
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">{absenceInfo.motherName || 'الأم'}</div>
                    <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{absenceInfo.motherPhone || 'غير مسجل'}</div>
                  </div>
                </div>

                {absenceInfo.motherPhone && (
                  <a
                    href={`tel:${formatPhoneForCall(absenceInfo.motherPhone)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                    title="اتصال هاتفي مباشر"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Template Choice Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block">
              اختر صيغة الرسالة المناسبة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('wellbeing')}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border text-right flex items-start gap-2 cursor-pointer ${
                  templateType === 'wellbeing'
                    ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold">اطمئنان وتفقد صحي</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">نبرة ودية للسؤال عن أحوال الطفل</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('formal')}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border text-right flex items-start gap-2 cursor-pointer ${
                  templateType === 'formal'
                    ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold">تذكير رسمي ومبرر غياب</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">طلب شهادة طبية أو تبرير كتابي</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('pedagogy')}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border text-right flex items-start gap-2 cursor-pointer ${
                  templateType === 'pedagogy'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold">متابعة الأنشطة والدروس</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">اقتراح تزويده بالأنشطة المنزلية</div>
                </div>
              </button>
            </div>
          </div>

          {/* Editable Message Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700">
                نص الرسالة (قابل للتعديل والإضافة):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-[#6C5CE7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">تم نسخ النص!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النص للحافظة</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={6}
              value={activeMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-[#6C5CE7] focus:ring-2 focus:ring-indigo-100 outline-none leading-relaxed resize-none transition-all font-sans"
              placeholder="اكتب نص الرسالة..."
            />
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp Send Button */}
            <button
              type="button"
              onClick={handleWhatsAppSend}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>إرسال عبر WhatsApp</span>
            </button>

            {/* SMS Send Button */}
            {targetPhone && (
              <button
                type="button"
                onClick={handleSmsSend}
                className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>رسالة SMS</span>
              </button>
            )}

            {/* Register in internal notification log */}
            <button
              type="button"
              onClick={handleSaveToSystemNotifications}
              className={`px-3.5 py-2.5 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isSavedToSystem
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              {isSavedToSystem ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isSavedToSystem ? 'تم الحفظ بالسجل' : 'تسجيل إشعار بالنظام'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>

        </div>

      </div>
    </div>
  );
};
