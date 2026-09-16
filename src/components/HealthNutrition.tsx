import React, { useState } from 'react';
import { 
  HeartPulse, 
  Utensils, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Activity, 
  Apple, 
  Calendar, 
  Clock, 
  Phone,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HealthIncident, WeeklyMealPlan } from '../types';
import { formatArabicDate } from '../utils/helpers';

export const HealthNutrition: React.FC = () => {
  const { 
    children, 
    classes, 
    incidents, 
    addIncident, 
    weeklyMenu,
    updateWeeklyMenu,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'incidents' | 'nutrition' | 'allergies'>('incidents');

  // Meal Plan Edit Modal
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState<WeeklyMealPlan>(weeklyMenu);

  // Incident Modal
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    childId: children[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'fever' as HealthIncident['type'],
    typeLabel: 'ارتفاع حرارة',
    description: '',
    actionTaken: '',
    notifiedParents: true,
  });

  const handleOpenEditMenu = () => {
    setMenuForm(JSON.parse(JSON.stringify(weeklyMenu)));
    setIsEditMenuModalOpen(true);
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    updateWeeklyMenu(menuForm);
    setIsEditMenuModalOpen(false);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.childId || !incidentForm.description) return;

    addIncident({
      ...incidentForm,
      reportedBy: currentUser.fullName,
    });

    setIsIncidentModalOpen(false);
    setIncidentForm({
      childId: children[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type: 'fever',
      typeLabel: 'ارتفاع حرارة',
      description: '',
      actionTaken: '',
      notifiedParents: true,
    });
  };

  // Children with allergies or chronic issues
  const allergicChildren = children.filter(c => 
    (c.health?.allergies && c.health.allergies.length > 0) || 
    (c.health?.chronicDiseases && c.health.chronicDiseases.length > 0)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-500" />
            <span>الصحة، التغذية، ومتابعة السلامة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            سجل الحوادث والعوارض الصحية، التلقيحات، وقائمة وجبات المطعم الصحي المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sub-tabs */}
          <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'incidents' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              سجل العوارض والحوادث ({incidents.length})
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'nutrition' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              قائمة الوجبات الأسبوعية
            </button>
            <button
              onClick={() => setActiveTab('allergies')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${activeTab === 'allergies' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              الحساسيات والأدوية ({allergicChildren.length})
            </button>
          </div>

          {activeTab === 'incidents' && (
            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل عارض / حادث</span>
            </button>
          )}
        </div>
      </div>

      {/* ----------------- TAB 1: HEALTH INCIDENTS ----------------- */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold text-xl">
                {incidents.filter(i => i.type === 'fever' || i.type === 'wound').length}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">حالات طفيفة</div>
                <div className="text-[11px] text-slate-400">سحجات بسيطة، حرارة طفيفة</div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-extrabold text-xl">
                {incidents.filter(i => i.type === 'allergy_reaction' || i.type === 'fall').length}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">حالات استوجبت المتابعة</div>
                <div className="text-[11px] text-slate-400">إشعار فوري للأولياء / طبيب الروضة</div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xl">
                {incidents.filter(i => i.notifiedParents).length}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">أولياء تم إشعارهم</div>
                <div className="text-[11px] text-slate-400">شفافية كاملة مع العائلات</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 font-bold text-xs text-slate-700">
              السجل الطبي واليومي للحوادث والملاحظات الصحية
            </div>

            <div className="divide-y divide-slate-100">
              {incidents.map(inc => {
                const child = children.find(c => c.id === inc.childId);
                const cls = classes.find(cl => cl.id === child?.classId);

                return (
                  <div key={inc.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl mt-0.5 bg-rose-50 text-rose-600">
                        <Activity className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">{child?.fullName}</span>
                          <span className="text-[11px] text-slate-400">({cls?.name || 'الفوج'})</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {inc.typeLabel || inc.type}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {inc.description}
                        </p>

                        <div className="text-xs text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100 inline-block mt-1">
                          <strong>الإجراء المتخذ:</strong> {inc.actionTaken}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs space-y-1 md:min-w-[170px] border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                      <div className="text-slate-500 font-medium">
                        📅 {formatArabicDate(inc.date)} - {inc.time}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        المشرفة: {inc.reportedBy}
                      </div>
                      <div className="pt-1">
                        {inc.notifiedParents ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم إبلاغ الولي فوراً</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-600 font-bold">لم يتم إبلاغ الولي</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: MEAL PLAN ----------------- */}
      {activeTab === 'nutrition' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 p-4 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Apple className="w-6 h-6 text-amber-700" />
              <div>
                <h3 className="font-extrabold text-sm text-amber-900">برنامج التغذية الصحية المتوازنة للروضة</h3>
                <p className="text-xs text-amber-800">وجبات مطبوخة يومياً بمكونات طازجة ومراقبة صحية دورية</p>
              </div>
            </div>

            <button
              onClick={handleOpenEditMenu}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit2 className="w-4 h-4" />
              <span>تعديل برنامج الوجبات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyMenu.days.map((dayItem, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>يوم {dayItem.dayName}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    متوازن صحياً
                  </span>
                </div>

                {/* Breakfast */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 block">🥛 لمجة الصباح (09:00):</span>
                  <p className="text-xs text-slate-700 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60">
                    {dayItem.breakfast}
                  </p>
                </div>

                {/* Lunch */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 block">🍲 وجبة الغداء الساخنة (12:00):</span>
                  <p className="text-xs text-slate-700 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
                    {dayItem.lunch}
                  </p>
                </div>

                {/* Snack */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-800 block">🍎 لمجة العصر (16:00):</span>
                  <p className="text-xs text-slate-700 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/60">
                    {dayItem.snack}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: ALLERGIES & DIET ----------------- */}
      {activeTab === 'allergies' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-base text-slate-800">قائمة الأطفال ذوي الحساسيات والأنظمة الخاصة</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allergicChildren.map(child => {
              const cls = classes.find(c => c.id === child.classId);

              return (
                <div key={child.id} className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 flex items-start gap-3">
                  <img src={child.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-200" />
                  <div className="space-y-1 text-xs">
                    <div className="font-extrabold text-slate-800 text-sm">{child.fullName}</div>
                    <div className="text-slate-500">{cls?.name} • ولي الأمر: {child.fatherName} (📞 {child.fatherPhone})</div>

                    {child.health?.allergies && child.health.allergies.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="font-bold text-rose-700">الحساسيات:</span>
                        {child.health.allergies.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold text-[10px]">
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {child.health?.chronicDiseases && child.health.chronicDiseases.length > 0 && (
                      <div className="text-slate-700">
                        <strong className="text-slate-800">أمراض / إرشادات:</strong> {child.health.chronicDiseases.join('، ')}
                      </div>
                    )}

                    {child.health?.familyDoctorName && (
                      <div className="text-slate-500 text-[11px]">
                        طبيب العائلة: د. {child.health.familyDoctorName} (📞 {child.health.familyDoctorPhone})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- RECORD INCIDENT MODAL ----------------- */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" />
                <span>تسجيل عارض صحي أو حادث طارئ</span>
              </h3>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleIncidentSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الطفل المعني *</label>
                  <select
                    value={incidentForm.childId}
                    onChange={(e) => setIncidentForm({ ...incidentForm, childId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع العارض *</label>
                  <select
                    value={incidentForm.type}
                    onChange={(e) => {
                      const val = e.target.value as HealthIncident['type'];
                      const labels: Record<string, string> = {
                        fever: 'ارتفاع حرارة',
                        fall: 'سقوط / كدمة',
                        wound: 'جرح سطحي',
                        allergy_reaction: 'نوبة حساسية',
                        stomach_ache: 'ألم بالبطن',
                        other: 'عارض آخر'
                      };
                      setIncidentForm({ 
                        ...incidentForm, 
                        type: val,
                        typeLabel: labels[val] || val
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="fever">ارتفاع درجة الحرارة</option>
                    <option value="fall">سقوط / كدمة خفيفة</option>
                    <option value="wound">خدش أو جرح سطحي</option>
                    <option value="allergy_reaction">نوبة حساسية أو طفح</option>
                    <option value="stomach_ache">ألم بالبطن أو اضطراب هضمي</option>
                    <option value="other">عارض آخر</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التوقيت *</label>
                  <input
                    type="time"
                    value={incidentForm.time}
                    onChange={(e) => setIncidentForm({ ...incidentForm, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المشرفة المسجلة</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف الحادث أو العارض بدقة *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="سقوط طفيف أثناء اللعب، ارتفاع الحرارة لـ 38.5..."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الإجراء المتخذ والإسعافات الأولية *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="تنظيف المكان، وضع كمادات ماء بارد، إعطاء دواء خافض حرارة حسب الوصفة..."
                  value={incidentForm.actionTaken}
                  onChange={(e) => setIncidentForm({ ...incidentForm, actionTaken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={incidentForm.notifiedParents}
                    onChange={(e) => setIncidentForm({ ...incidentForm, notifiedParents: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>تم إشعار الولي فوراً هاتفياً / بالرسالة</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  تسجيل بالسجل الطبي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- EDIT MEAL PLAN MODAL ----------------- */}
      {isEditMenuModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Apple className="w-5 h-5 text-amber-600" />
                <span>تعديل برنامج الوجبات الأسبوعي للروضة</span>
              </h3>
              <button
                onClick={() => setIsEditMenuModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4 text-xs">
              <div className="space-y-4">
                {menuForm.days.map((dayItem, dIdx) => (
                  <div key={dIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2.5">
                    <div className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>يوم {dayItem.dayName}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block font-bold text-amber-900 mb-1">🥛 لمجة الصباح:</label>
                        <input
                          type="text"
                          value={dayItem.breakfast}
                          onChange={(e) => {
                            const newDays = [...menuForm.days];
                            newDays[dIdx] = { ...newDays[dIdx], breakfast: e.target.value };
                            setMenuForm({ ...menuForm, days: newDays });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">🍲 وجبة الغداء:</label>
                        <input
                          type="text"
                          value={dayItem.lunch}
                          onChange={(e) => {
                            const newDays = [...menuForm.days];
                            newDays[dIdx] = { ...newDays[dIdx], lunch: e.target.value };
                            setMenuForm({ ...menuForm, days: newDays });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-indigo-900 mb-1">🍎 لمجة العصر:</label>
                        <input
                          type="text"
                          value={dayItem.snack}
                          onChange={(e) => {
                            const newDays = [...menuForm.days];
                            newDays[dIdx] = { ...newDays[dIdx], snack: e.target.value };
                            setMenuForm({ ...menuForm, days: newDays });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditMenuModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ البرنامج الأسبوعي</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
