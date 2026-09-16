import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Printer, 
  Download, 
  X, 
  Search, 
  ShieldCheck, 
  Baby, 
  UserCheck, 
  GraduationCap, 
  Receipt, 
  HeartPulse, 
  Bus, 
  MessageSquareText, 
  Settings, 
  HardDrive, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  QrCode,
  Calendar,
  CreditCard,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Laptop,
  Check,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { printDocumentSection } from '../utils/helpers';

export const UserManualGuideModal: React.FC = () => {
  const { isUserManualOpen, setIsUserManualOpen, settings } = useApp();
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserManualOpen(false);
      }
    };
    if (isUserManualOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserManualOpen, setIsUserManualOpen]);

  if (!isUserManualOpen) return null;

  const handlePrintPDF = () => {
    printDocumentSection('printable-user-manual-content', `دليل_المستخدم_الشامل_${settings.nurseryName.replace(/\s+/g, '_')}`);
  };

  const handleDownloadStandaloneHTML = () => {
    const elem = document.getElementById('printable-user-manual-content');
    if (!elem) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>دليل المستخدم الشامل - ${settings.nurseryName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
    body { font-family: 'Tajawal', sans-serif; background: #f8fafc; color: #1e293b; }
    @media print {
      body { background: white !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
      .avoid-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body class="p-4 md:p-8">
  <div class="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-lg border border-slate-200">
    <div class="no-print mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
      <span class="text-xs font-bold text-amber-900">💡 يمكنك حفظ هذا الدليل كملف PDF بالضغط على الزر:</span>
      <button onclick="window.print()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer">
        🖨️ حفظ كملف PDF
      </button>
    </div>
    ${elem.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `دليل_المستخدم_الشامل_${settings.nurseryName.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chapters = [
    {
      id: 0,
      title: 'مقدمة ونظرة عامة على المنظومة',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 1,
      title: 'التثبيت، التفعيل والعمل بدون إنترنت',
      icon: Laptop,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 2,
      title: 'لوحة القيادة والمؤشرات الحيوية',
      icon: HelpCircle,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 3,
      title: 'إدارة الأطفال، التسجيل والتصفية',
      icon: Baby,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 4,
      title: 'الحضور، أمان الاستلام والباركود',
      icon: UserCheck,
      color: 'from-sky-500 to-blue-500',
    },
    {
      id: 5,
      title: 'الأقسام والمربيات وتوزيع الأفواج',
      icon: GraduationCap,
      color: 'from-violet-500 to-indigo-500',
    },
    {
      id: 6,
      title: 'المالية، الفواتير، الوصولات والمصاريف',
      icon: Receipt,
      color: 'from-emerald-600 to-green-600',
    },
    {
      id: 7,
      title: 'الصحة، التغذية وسجل الحوادث',
      icon: HeartPulse,
      color: 'from-rose-500 to-red-500',
    },
    {
      id: 8,
      title: 'البرنامج البيداغوجي وبطاقات التقييم',
      icon: FileText,
      color: 'from-amber-600 to-yellow-600',
    },
    {
      id: 9,
      title: 'النقل المدرسي ومسارات الحافلات',
      icon: Bus,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 10,
      title: 'الصلاحيات، الأمان والنسخ الاحتياطي',
      icon: ShieldCheck,
      color: 'from-slate-700 to-slate-900',
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsUserManualOpen(false);
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden relative"
        dir="rtl"
      >
        {/* Top Sticky Controls Toolbar */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between gap-3 flex-wrap border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight">دليل المستخدم الشامل والتوثيق الرسمي</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PDF & Print Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {settings.nurseryName} • الدليل التوضيحي المصور لكافة الوحدات والخصائص
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              title="طباعة الدليل أو حفظه بصيغة PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <button
              onClick={handleDownloadStandaloneHTML}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer hidden sm:inline-flex"
              title="تنزيل نسخة HTML مستقلة"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل نسخة مستقلة</span>
            </button>

            <button
              onClick={() => setIsUserManualOpen(false)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chapters Navigation Tabs (Horizontal on top) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {chapters.map((ch) => {
            const Icon = ch.icon;
            const isSelected = activeChapter === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChapter(ch.id);
                  const el = document.getElementById(`chapter-${ch.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{ch.id === 0 ? 'المقدمة' : `فصل ${ch.id}`}</span>
              </button>
            );
          })}
        </div>

        {/* Manual Content Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60">
          <div id="printable-user-manual-content" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm max-w-4xl mx-auto space-y-12">
            
            {/* ================= COVER PAGE ================= */}
            <div className="text-center py-10 px-4 border-b-2 border-slate-100 space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 text-white flex items-center justify-center text-4xl mx-auto shadow-xl shadow-amber-200">
                🏠
              </div>

              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block">
                  الوثيقة الإرشادية والتقنية الشاملة
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  دليل المستخدم الشامل لمنظومة إدارة الروضة
                </h1>
                <p className="text-sm sm:text-base font-bold text-slate-600 max-w-2xl mx-auto">
                  {settings.nurseryName} • الإصدار المكتبي الاحترافي (Offline Desktop Edition)
                </p>
              </div>

              {/* Quick Feature Pills */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-2">
                <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% يعمل بدون إنترنت (Offline)
                </span>
                <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> مطابقة للمعايير التونسية (دينار تونسي)
                </span>
                <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> بطاقات ورموز استلام ذكية
                </span>
              </div>

              {/* Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-right mt-6">
                <div>
                  <span className="text-slate-400 block text-[10px]">المؤسسة:</span>
                  <span className="font-bold text-slate-800">{settings.nurseryName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">رقم الترخيص:</span>
                  <span className="font-bold text-slate-800 font-mono">{settings.licenseNumber || 'TN-KIND-2026'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">تاريخ الإصدار:</span>
                  <span className="font-bold text-slate-800">{new Date().toLocaleDateString('ar-TN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">المطور:</span>
                  <span className="font-bold text-indigo-600">فريق الدعم التقني</span>
                </div>
              </div>
            </div>

            {/* ================= CHAPTER 0: INTRODUCTION ================= */}
            <section id="chapter-0" className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-r-4 border-amber-500 pr-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  0
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">مقدمة عامة وهيكل البرنامج</h2>
                  <p className="text-xs text-slate-500">نظرة عامة على الوحدات والمفاهيم الأساسية لتشغيل الروضة</p>
                </div>
              </div>

              <div className="prose text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  تم تصميم وتطوير هذه المنظومة خصيصاً لتلبية كافة المتطلبات الإدارية، المالية، والتربوية لرياض الأطفال والمحاضن المدرسية. يعمل النظام بشكل <strong>محلي ومستقل تماماً دون الحاجة لاتصال بالإنترنت</strong>، مما يضمن أقصى درجات السرعة وحماية سرية بيانات الأطفال والأولياء.
                </p>

                {/* Architecture Diagram Mockup */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl shadow-md space-y-4">
                  <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>خارطة وحدات المنظومة المتكاملة:</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-right">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-amber-300">1. إدارة الأطفال</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">الملف الشامل، الفلاتر، البطاقات</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-sky-300">2. الحضور والأمان</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">تسجيل فوري، باركود، استلام آمن</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-emerald-300">3. المالية والمصاريف</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">توليد فواتير، وصولات، أرباح وخسائر</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-purple-300">4. الأقسام والمربيات</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">توزيع الأفواج، كفاءات، رواتب</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-rose-300">5. الصحة والتغذية</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">قوائم الوجبات، الحساسية، حوادث</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-yellow-300">6. البيداغوجيا</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">أنشطة أسبوعية، بطاقات تقييم</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-cyan-300">7. النقل المدرسي</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">مسارات الحافلات، مرافقين، توقيت</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <div className="font-extrabold text-teal-300">8. الأمان والنسخ</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">صلاحيات دقيقة، نسخ USB محلي</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 1: INSTALLATION & ACTIVATION ================= */}
            <section id="chapter-1" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-emerald-500 pr-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">التثبيت، تفعيل النسخة والعمل المكتبي</h2>
                  <p className="text-xs text-slate-500">طريقة تشغيل البرنامج وتثبيت الترخيص الدائم بدون إنترنت</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">1</span>
                    <h4 className="font-extrabold text-slate-900">تشغيل التطبيق</h4>
                    <p className="text-[11px] text-slate-500">افتح البرنامج من سطح المكتب مباشرة. لا يتطلب تثبيت خوادم معقدة.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">2</span>
                    <h4 className="font-extrabold text-slate-900">نسخ معرف الجهاز (Machine ID)</h4>
                    <p className="text-[11px] text-slate-500">يتم توليد معرف فريد لجهازك تلقائياً يظهر في نافذة التفعيل.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">3</span>
                    <h4 className="font-extrabold text-slate-900">إدخال مفتاح التفعيل</h4>
                    <p className="text-[11px] text-slate-500">ألصق مفتاح الترخيص المستلم من الإدارة التقنية لتفعيل النسخة الدائمة مدى الحياة.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-black mb-0.5">ضمان استمرارية العمل (100% Offline):</strong>
                    جميع البيانات تخزن محلياً داخل جهازك (LocalStorage & SQLite / IndexedDB)، ويمكنك العمل حتى عند انقطاع شبكة الإنترنت كلياً دون أي تأثير على العمليات اليومية.
                  </div>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 2: DASHBOARD ================= */}
            <section id="chapter-2" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-indigo-500 pr-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">لوحة القيادة والمؤشرات الحيوية اليومية</h2>
                  <p className="text-xs text-slate-500">متابعة نبض الروضة، الحضور، الإيرادات والتنبيهات الاستباقية</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <p>
                  توفر لوحة القيادة نظرة مركزية شاملة للمديرة والمشرفين لمتابعة الأنشطة اليومية فور فتح البرنامج:
                </p>

                {/* Visual Dashboard Card Mockup */}
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                  <div className="text-xs font-black text-slate-800">العناصر الرئيسية في لوحة القيادة:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-right">
                      <div className="text-[10px] text-slate-400 font-bold">إجمالي الأطفال المسجلين</div>
                      <div className="text-lg font-black text-indigo-600 mt-1">الأطفال النشطين</div>
                      <div className="text-[10px] text-slate-500">موزعين على كافة الأفواج</div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-right">
                      <div className="text-[10px] text-slate-400 font-bold">حضور اليوم</div>
                      <div className="text-lg font-black text-emerald-600 mt-1">نسبة الحضور %</div>
                      <div className="text-[10px] text-slate-500">تسجيل مباشر وفوري</div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-right">
                      <div className="text-[10px] text-slate-400 font-bold">الاشتراكات والديون</div>
                      <div className="text-lg font-black text-rose-600 mt-1">المستحقات المتبقية</div>
                      <div className="text-[10px] text-slate-500">تنبيهات الفواتير المتأخرة</div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-right">
                      <div className="text-[10px] text-slate-400 font-bold">الرصيد المالي الشهري</div>
                      <div className="text-lg font-black text-amber-600 mt-1">صافي الأرباح (د.ت)</div>
                      <div className="text-[10px] text-slate-500">المداخيل - المصاريف</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-900">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>نظام كشف الغياب المتتالي والتذكير عبر WhatsApp:</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    يقوم البرنامج تلقائياً بتحليل سجلات الحضور؛ وفي حال غياب طفل لمدة <strong>3 أيام متتالية أو أكثر</strong>، يظهر تنبيه فوري باللون البرتقالي مع زر اتصال مباشر وزر إرسال رسالة تذكير مخصصة لولي الأمر عبر WhatsApp بنقرة واحدة!
                  </p>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 3: CHILDREN MANAGEMENT & FILTERS ================= */}
            <section id="chapter-3" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-pink-500 pr-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black">
                  3
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">إدارة ملفات الأطفال والتصفية حسب الفوج</h2>
                  <p className="text-xs text-slate-500">تسجيل التلميذ، البيانات الصحية، الأشخاص المخولون، وفلاتر الأفواج</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                  <h4 className="font-black text-slate-900 flex items-center gap-2">
                    <Baby className="w-4 h-4 text-pink-600" />
                    <span>خطوات تسجيل طفل جديد في المنظومة:</span>
                  </h4>

                  <ol className="space-y-2.5 text-xs text-slate-600 list-decimal list-inside pr-1">
                    <li>
                      <strong className="text-slate-800">البيانات الأساسية:</strong> الاسم واللقب، تاريخ الولادة (يتم احتساب السن بالسنوات والأشهر تلقائياً)، الجنس، وتعيين الفوج الدراسي المناسب.
                    </li>
                    <li>
                      <strong className="text-slate-800">أولياء الأمور:</strong> اسم الأب، مهنته، هاتفه، اسم الأم وهاتفها، العنوان ورقم الطوارئ البديل.
                    </li>
                    <li>
                      <strong className="text-slate-800">الأشخاص المخولون بالاستلام:</strong> إضافة أسماء الأشخاص المعتمدين لاستلام الطفل (العم، الخال، الجدة...) مع أرقام بطاقات التعريف وأرقام هواتفهم.
                    </li>
                    <li>
                      <strong className="text-slate-800">الملف الصحي:</strong> تسجيل فصيلة الدم، الحساسيات الغذائية والدوائية، الأمراض المزمنة، وتعليمات الإسعاف الأولي.
                    </li>
                    <li>
                      <strong className="text-slate-800">الخدمات والنوادي:</strong> تحديد اشتراك نصف إقامة، وجبة غداء، نقل مدرسي، أو نوادي عطلة نهاية الأسبوع (رسم، موسيقى، روبوتيك).
                    </li>
                  </ol>
                </div>

                {/* Filter Feature Highlight */}
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
                  <div className="font-extrabold text-sky-900 flex items-center gap-2 text-xs">
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <span>ميزة التصفية الذكية السريعة حسب الفوج (Group Filters):</span>
                  </div>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    يمكنك بنقرة واحدة على أيقونة الفوج في أعلى القائمة تصفية وعرض أطفال ذلك الفصل فقط، مع ظهور بطاقة سياقية توضح: طاقة الاستيعاب، نسبة الامتلاء، المربية المشرفة، وزر تسجيل طفل جديد في ذلك الفوج مباشرة.
                  </p>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 4: ATTENDANCE & SECURITY ================= */}
            <section id="chapter-4" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-sky-500 pr-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                  4
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">سجل الحضور، أمان الاستلام والباركود</h2>
                  <p className="text-xs text-slate-500">نظام تسجيل الحضور السريع، المسح الضوئي لبطاقات الأطفال، والتحقق من الهوية</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>1. تسجيل الحضور والانصراف:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      خيارات متعددة: تسجيل طفل بطفل بنقرة زر (حاضر / غائب / متأخر / معذور)، أو استخدام زر <strong>"تسجيل حضور الفوج بالكامل بنقرة واحدة"</strong> لتسريع العملية الصباحية.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span>2. ماسح الباركود وبطاقة التلميذ:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      يدعم قارئ الباركود عبر USB أو كاميرا الحاسوب. يتم طباعة بطاقة مدرسية لكل طفل تحتوي على باركود ورقم التسجيل، وعند المسح يتم تسجيل دخوله وانصرافه فورياً.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 text-rose-900">
                  <div className="font-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>بروتوكول أمان تسليم الأطفال (Pickup Security Protocol):</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    عند تسليم الطفل في نهاية الدوام، يعرض النظام قائمة الأشخاص المخولين بالاستلام المعتمدين من الولي مع أرقام بطاقات هوياتهم وهواتفهم، لمنع تسليم أي طفل لأي شخص غير مصرح به.
                  </p>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 5: CLASSES & STAFF ================= */}
            <section id="chapter-5" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-violet-500 pr-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-black">
                  5
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">الأقسام، المربيات وتوزيع الأفواج</h2>
                  <p className="text-xs text-slate-500">تنظيم البنية التربوية، طاقات الاستيعاب، وملفات الكادر التعليمي</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <p>
                  يسمح قسم الأقسام والمربيات بهيكلة المؤسسة وفق المقاييس البيداغوجية المعتمدة:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <strong className="text-indigo-900 font-black block">إدارة الفصول والأفواج:</strong>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      <li>• تحديد الفئة العمرية لكل قسم (رضع، صغار، متوسط، تحضيري).</li>
                      <li>• تحديد طاقة الاستيعاب القصوى ومراقبة نسبة الامتلاء.</li>
                      <li>• تخصيص لون مميز لكل فوج لسهولة التمييز البصري.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <strong className="text-indigo-900 font-black block">إدارة شؤون المربيات والموظفين:</strong>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      <li>• بطاقة مهنية شاملة: المؤهل العلمي، الخبرة، الهاتف، ورقم الهوية.</li>
                      <li>• إسناد المربية الرئيسية والمربية المساعدة لكل قسم.</li>
                      <li>• إدارة الراتب الشهري وساعات العمل وتوليد مسيرات الرواتب تلقائياً.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 6: FINANCE & EXPENSES ================= */}
            <section id="chapter-6" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-emerald-600 pr-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  6
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">المالية، الفواتير، وصولات الاستخلاص والمصاريف</h2>
                  <p className="text-xs text-slate-500">الدورة المالية الكاملة: الفواتير، الاستخلاص بالدينار التونسي، المصاريف، ودفتر الأرباح والخسائر</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>1. التوليد التلقائي للفواتير:</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      زر واحد في بداية كل شهر يقوم بإنشاء فواتير الاشتراكات الشهرية لكافة الأطفال النشطين تلقائياً حسب الرسوم المحددة.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span>2. الاستخلاص وطباعة الوصل:</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      تسجيل الدفع (نقداً، شيك، تحويل)، وتوليد وصل استخلاص رسمي مرقم يحتوي على تفقيط المبلغ بالدينار التونسي والكلمات.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                      <CreditCard className="w-4 h-4 text-rose-600" />
                      <span>3. إدارة المصاريف والأرباح:</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      تسجيل كافة المصاريف التشغيلية (كراء، كهرباء، رواتب، تغذية، تنظيف) وحساب الصافي المالي الشهري بدقة.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span><strong>تصدير الجداول إلى Excel / CSV:</strong> متوفر في جميع تقارير المالية بنقرة واحدة.</span>
                  </div>
                  <span className="font-mono font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                    Format: 0.000 TND
                  </span>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 7: HEALTH & NUTRITION ================= */}
            <section id="chapter-7" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-rose-500 pr-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                  7
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">الصحة، التغذية وسجل الحوادث الطارئة</h2>
                  <p className="text-xs text-slate-500">جداول الوجبات الأسبوعية، رصد الحساسيات، وتوثيق الحوادث والإسعافات</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <strong className="text-slate-900 font-extrabold block text-xs">جدول الوجبات الأسبوعي (Menu):</strong>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      تخطيط وجبات الأسبوع (فطور الصباح، وجبة الغداء المتوازنة، اللمجة المسائية) لجميع أيام الأسبوع، مع إمكانية طباعتها وتعليقها للأولياء.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <strong className="text-slate-900 font-extrabold block text-xs">سجل الحوادث والإسعافات الأولية:</strong>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      توثيق أي عارض صحي أو حادث مدرسي بالوقت، المكان، الإجراء المتخذ، واسم المربية المسؤولة، مع إشعار ولي الأمر فوراً.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 8: PEDAGOGY & EVALUATIONS ================= */}
            <section id="chapter-8" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-amber-600 pr-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  8
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">البرنامج البيداغوجي وبطاقات التقييم الفردي</h2>
                  <p className="text-xs text-slate-500">جدولة الأنشطة، ورشات التعلم، ودفتر تقييم مكتسبات الطفل</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <p>
                  يساعد النظام المربيات على متابعة التطور النمائي لكل طفل بدقة ومشاركة التقارير مع الأولياء:
                </p>

                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                  <div className="font-extrabold text-amber-900 text-xs">مجالات التقييم المعتمدة في البطاقة البيداغوجية:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-800">
                    <div className="p-2 bg-white rounded-xl border border-amber-200 text-center font-bold">
                      🏃 الجانب الحركي والبدني
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-amber-200 text-center font-bold">
                      🗣️ التواصل والتعبير اللغوي
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-amber-200 text-center font-bold">
                      🤝 التفاعل الاجتماعي والسلوك
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-amber-200 text-center font-bold">
                      🎨 الإبداع، الرسم والأنشطة
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-800 pt-1">
                    ✨ تتيح المنظومة زر <strong>"طباعة دفتر التقييم الفردي للطفل"</strong> لتقديم تقرير رسمي أنيق للأولياء في نهاية كل ثلاثي.
                  </div>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 9: TRANSPORT ================= */}
            <section id="chapter-9" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-cyan-600 pr-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black">
                  9
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">إدارة النقل المدرسي ومسارات الحافلات</h2>
                  <p className="text-xs text-slate-500">تنظيم رحلات الحافلات، نقاط التوقف، بيانات السائق والمرافقة</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <strong className="text-slate-900 font-extrabold block">مزايا وحدة النقل المدرسي:</strong>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    <li>• تحديد أسماء الخطوط والمسارات (مثال: مسار حي الوفاق، مسار النصر، مسار الياسمين).</li>
                    <li>• تسجيل رقم لوحة الحافلة، اسم ورقم هاتف السائق، واسم المرافقة المشرفة.</li>
                    <li>• حصر قائمة الأطفال المسجلين في كل رحلة لتسهيل تفقد الصعود والنزول الآمن.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ================= CHAPTER 10: ROLES & BACKUP ================= */}
            <section id="chapter-10" className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 border-r-4 border-slate-800 pr-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-black">
                  10
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">الأمان، الصلاحيات الدقيقة والنسخ الاحتياطي</h2>
                  <p className="text-xs text-slate-500">حماية البيانات، التحكم في صلاحيات الموظفين، وحفظ النسخ الاحتياطية على USB</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <strong className="text-slate-900 font-black flex items-center gap-1.5 text-xs">
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>صلاحيات المستخدمين (Granular RBAC):</span>
                    </strong>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      يملك المشرف العام (Super Admin) صلاحية تحديد الأقسام التي يسمح لكل مستخدم بفتحها بدقة (مثال: حجب الوحدة المالية عن المربيات، ومنع حذف السجلات إلا بإذن).
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <strong className="text-slate-900 font-black flex items-center gap-1.5 text-xs">
                      <HardDrive className="w-4 h-4 text-emerald-600" />
                      <span>النسخ الاحتياطي (USB Backup):</span>
                    </strong>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      بنقرة واحدة على زر التحميل في الشريط العلوي يتم حفظ ملف نسخة احتياطية مشفر بصيغة JSON على حاسوبك أو فلاش ديسك خارجي لحماية البيانات من أي تلف للحاسوب.
                    </p>
                  </div>
                </div>

                {/* Pro Tips Section */}
                <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl space-y-2.5">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>نصائح ذهبية لإدارة احترافية وسلسة:</span>
                  </div>
                  <ul className="text-xs text-slate-200 space-y-1.5 pr-2">
                    <li>✓ <strong>النسخ الأسبوعي:</strong> قم بتصدير نسخة احتياطية أسبوعياً على فلاش ديسك خارجي.</li>
                    <li>✓ <strong>أرقام الهواتف:</strong> تأكد من إدخال أرقام الهواتف التونسية (8 أرقام) لتعمل روابط WhatsApp مباشرة.</li>
                    <li>✓ <strong>طباعة البطاقات:</strong> اطبع بطاقة التلميذ المدرسية مع بداية كل سنة دراسية وغلفها حرارياً لحفظ الباركود.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Manual Footer */}
            <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
              <p className="font-bold text-slate-600">منظومة روضتي لإدارة رياض الأطفال والمحاضن المدرسية</p>
              <p>تم إعداد وتنسيق هذا الدليل الرسمي لضمان أفضل تجربة مستخدم لكافة الإداريين والمربيات</p>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500 font-medium">
            💡 يمكنك طباعة هذا الدليل أو تصديره إلى ملف PDF عبر خيار "Save as PDF" في نافذة الطباعة.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الدليل كاملاً كـ PDF</span>
            </button>

            <button
              onClick={() => setIsUserManualOpen(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
