import React, { useState } from 'react';
import { 
  Palette, 
  Calendar, 
  Award, 
  Plus, 
  Clock, 
  Printer, 
  CheckCircle2, 
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivitySchedule, ChildEvaluation } from '../types';
import { formatArabicDate } from '../utils/helpers';

export const PedagogyActivities: React.FC = () => {
  const { 
    classes, 
    children, 
    activities, 
    evaluations, 
    addActivity, 
    saveEvaluation, 
    deleteActivity,
    setPrintEvaluationData,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'schedule' | 'evaluations'>('schedule');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'class-1');

  // Evaluation modal
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalChildId, setEvalChildId] = useState<string>(children[0]?.id || '');
  const [evalTerm, setEvalTerm] = useState<'الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث' | 'شهري'>('الثلاثي الأول');
  const [motorRating, setMotorRating] = useState<'excellent' | 'good' | 'in_progress' | 'needs_support'>('good');
  const [langRating, setLangRating] = useState<'excellent' | 'good' | 'in_progress' | 'needs_support'>('good');
  const [socialRating, setSocialRating] = useState<'excellent' | 'good' | 'in_progress' | 'needs_support'>('good');
  const [autonomyRating, setAutonomyRating] = useState<'excellent' | 'good' | 'in_progress' | 'needs_support'>('good');
  const [generalRemarks, setGeneralRemarks] = useState<string>('طفل هادئ ومتفاعل بشكل إيجابي في الأنشطة الجماعية والتعبير الشفوي.');
  const [recommendations, setRecommendations] = useState<string>('مواصلة التشجيع على الاستقلالية الذاتية في تناول الوجبات.');

  // Activity modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState<ActivitySchedule['category']>('linguistic');
  const [actDay, setActDay] = useState('الإثنين');
  const [actTime, setActTime] = useState('09:00 - 10:00');
  const [actObjective, setActObjective] = useState('');
  const [actDesc, setActDesc] = useState('');

  const classActivities = activities.filter(a => a.classId === selectedClassId);
  const daysOfWeek = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const categoryLabels: Record<ActivitySchedule['category'], string> = {
    motor: 'حركية ورياضة',
    linguistic: 'تواصل ولغة',
    art: 'فنون وتشكيل',
    quran: 'قرآن وأخلاق',
    math: 'حساب ومنتسوري',
    science: 'إيقاظ علمي',
    music: 'إيقاع وموسيقى',
    montessori: 'ورشة منتسوري'
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalChildId) return;

    saveEvaluation({
      id: `eval-${Date.now()}`,
      childId: evalChildId,
      term: evalTerm,
      date: new Date().toISOString().split('T')[0],
      teacherId: currentUser.fullName,
      categories: [
        {
          id: 'cat-1',
          name: 'المهارات الحركية والتوازن',
          skills: [{ id: 'sk-1', name: 'التحكم الحركي الدقيق والقفز والتوازن', rating: motorRating }]
        },
        {
          id: 'cat-2',
          name: 'التعبير اللغوي والتواصل',
          skills: [{ id: 'sk-2', name: 'المفردات، النطق، والاستماع للقصة', rating: langRating }]
        },
        {
          id: 'cat-3',
          name: 'الاندماج الاجتماعي والسلوك',
          skills: [{ id: 'sk-3', name: 'المشاركة، احترام الدور والتعاون مع الأصدقاء', rating: socialRating }]
        },
        {
          id: 'cat-4',
          name: 'الاستقلالية الذاتية والنظافة',
          skills: [{ id: 'sk-4', name: 'ارتداء الحذاء، غسل اليدين وترتيب الأدوات', rating: autonomyRating }]
        }
      ],
      generalRemarks,
      recommendations,
    });

    setIsEvalModalOpen(false);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    addActivity({
      classId: selectedClassId,
      dayOfWeek: actDay,
      timeSlot: actTime,
      title: actTitle,
      category: actCategory,
      categoryLabel: categoryLabels[actCategory] || 'نشاط',
      description: actDesc,
      objective: actObjective,
    });

    setIsActivityModalOpen(false);
    setActTitle('');
    setActObjective('');
    setActDesc('');
  };

  const skillBadge = (level: string) => {
    switch (level) {
      case 'excellent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">ممتاز ★★★</span>;
      case 'good':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">جيد جداً ★★</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">في طور الاكتساب ⟳</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">يحتاج دعماً ⚠️</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-600" />
            <span>البرنامج البيداغوجي وتقييم مكتسبات الطفل</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جداول الحصص والأنشطة الإيقاعية والحركية واللغوية، وبطاقات المتابعة الفردية لكل طفل
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'schedule' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              جدول الأنشطة الأسبوعي
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'evaluations' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              دفتر التقييم والملاحظات ({evaluations.length})
            </button>
          </div>

          {activeTab === 'schedule' ? (
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حصة / نشاط</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEvalModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>تسجيل بطاقة تقييم لطفل</span>
            </button>
          )}
        </div>
      </div>

      {/* Class selector bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500">اختر الفوج / القسم:</span>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-800"
        >
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.ageRange})
            </option>
          ))}
        </select>
      </div>

      {/* ----------------- TAB 1: WEEKLY ACTIVITY SCHEDULE ----------------- */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daysOfWeek.map(day => {
            const dayActs = classActivities.filter(a => a.dayOfWeek === day);

            return (
              <div key={day} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>{day}</span>
                  </span>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                    {dayActs.length} حصص
                  </span>
                </div>

                <div className="space-y-2">
                  {dayActs.map(act => (
                    <div key={act.id} className="p-3 bg-purple-50/40 rounded-2xl border border-purple-100/60 space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-900">{act.title}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-purple-600" />
                          <span>{act.timeSlot}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">🎯 الهدف: {act.objective}</p>
                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="absolute left-2 top-2 hidden group-hover:block text-slate-400 hover:text-rose-500 text-xs font-bold"
                        title="حذف الحصة"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {dayActs.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      لا توجد حصص مبرمجة لهذا اليوم
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- TAB 2: EVALUATIONS & REPORT CARDS ----------------- */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map(ev => {
              const child = children.find(c => c.id === ev.childId);
              const cls = classes.find(c => c.id === child?.classId);

              return (
                <div key={ev.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={child?.photoUrl} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-100" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">{child?.fullName}</h4>
                        <span className="text-xs text-slate-400">{cls?.name} • {ev.term}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">📅 {formatArabicDate(ev.date)}</span>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {ev.categories?.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1 bg-white rounded-lg border border-slate-100">
                        <span className="text-slate-700 font-medium truncate max-w-[130px]">{cat.name}:</span>
                        {skillBadge(cat.skills[0]?.rating || 'good')}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-slate-700 bg-purple-50/50 p-3 rounded-2xl border border-purple-100 space-y-1">
                    <strong className="text-purple-900 block">ملاحظات المربية:</strong>
                    <p className="leading-relaxed">{ev.generalRemarks}</p>
                    {ev.recommendations && (
                      <p className="text-slate-500 mt-1">💡 <strong>التوصيات:</strong> {ev.recommendations}</p>
                    )}
                    <span className="text-[10px] text-slate-400 block pt-1">المؤطرة: {ev.teacherId}</span>
                  </div>

                  {/* Print / Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">بطاقة التقييم الثلاثي</span>
                    <button
                      onClick={() => setPrintEvaluationData({ evaluation: ev, child, className: cls?.name })}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة بطاقة التقييم</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- RECORD EVALUATION MODAL ----------------- */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>إصدار بطاقة تقييم بيداغوجية للطفل</span>
              </h3>
              <button
                onClick={() => setIsEvalModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الطفل المعني *</label>
                  <select
                    value={evalChildId}
                    onChange={(e) => setEvalChildId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفترة / الثلاثي *</label>
                  <select
                    value={evalTerm}
                    onChange={(e) => setEvalTerm(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="الثلاثي الأول">الثلاثي الأول</option>
                    <option value="الثلاثي الثاني">الثلاثي الثاني</option>
                    <option value="الثلاثي الثالث">الثلاثي الثالث</option>
                    <option value="شهري">تقييم شهري</option>
                  </select>
                </div>
              </div>

              {/* 4 axes */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">1. الحركية والتوازن:</span>
                  <select
                    value={motorRating}
                    onChange={(e) => setMotorRating(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value="excellent">ممتاز</option>
                    <option value="good">جيد جداً</option>
                    <option value="in_progress">في طور الاكتساب</option>
                    <option value="needs_support">يحتاج دعماً</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">2. اللغة والتعبير:</span>
                  <select
                    value={langRating}
                    onChange={(e) => setLangRating(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value="excellent">ممتاز</option>
                    <option value="good">جيد جداً</option>
                    <option value="in_progress">في طور الاكتساب</option>
                    <option value="needs_support">يحتاج دعماً</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">3. التفاعل والاندماج:</span>
                  <select
                    value={socialRating}
                    onChange={(e) => setSocialRating(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value="excellent">ممتاز</option>
                    <option value="good">جيد جداً</option>
                    <option value="in_progress">في طور الاكتساب</option>
                    <option value="needs_support">يحتاج دعماً</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">4. الاستقلالية والنظافة:</span>
                  <select
                    value={autonomyRating}
                    onChange={(e) => setAutonomyRating(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value="excellent">ممتاز</option>
                    <option value="good">جيد جداً</option>
                    <option value="in_progress">في طور الاكتساب</option>
                    <option value="needs_support">يحتاج دعماً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الملاحظات العامة للأولياء *</label>
                <textarea
                  required
                  rows={2}
                  value={generalRemarks}
                  onChange={(e) => setGeneralRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توصيات إضافية</label>
                <input
                  type="text"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEvalModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  حفظ البطاقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- ADD ACTIVITY MODAL ----------------- */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">إضافة حصة نشاط بيداغوجي</h3>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان النشاط *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ورشة الرسم الحر بالأصابع"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اليوم *</label>
                  <select
                    value={actDay}
                    onChange={(e) => setActDay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المجال / النوع</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="linguistic">تواصل ولغة</option>
                    <option value="motor">حركية ورياضة</option>
                    <option value="art">فنون وتشكيل</option>
                    <option value="music">إيقاع وموسيقى</option>
                    <option value="math">حساب ومنتسوري</option>
                    <option value="quran">قرآن وأخلاق</option>
                    <option value="science">إيقاظ علمي</option>
                    <option value="montessori">ورشة منتسوري</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التوقيت *</label>
                <input
                  type="text"
                  placeholder="مثال: 09:30 - 10:30"
                  value={actTime}
                  onChange={(e) => setActTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الهدف البيداغوجي</label>
                <input
                  type="text"
                  placeholder="مثال: تنمية الخيال والتنسيق البصري الحركي"
                  value={actObjective}
                  onChange={(e) => setActObjective(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  إضافة الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
