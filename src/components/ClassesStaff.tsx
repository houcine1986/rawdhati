import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  Users, 
  Plus, 
  Baby, 
  UserPlus, 
  Phone, 
  Award, 
  ShieldCheck, 
  Edit2, 
  Trash2, 
  CheckCircle,
  Briefcase,
  Upload,
  Camera,
  Link as LinkIcon,
  ArrowLeftRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassRoom, StaffMember } from '../types';
import { formatTND, formatArabicDate } from '../utils/helpers';
import { TransferChildrenModal } from './TransferChildrenModal';

export const ClassesStaff: React.FC = () => {
  const { 
    classes, 
    addClass, 
    updateClass, 
    deleteClass, 
    staff, 
    addStaff, 
    updateStaff, 
    deleteStaff, 
    children 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'classes' | 'staff'>('classes');

  // Transfer children modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferClassId, setTransferClassId] = useState<string | undefined>(undefined);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Class Form State
  const initialClassForm = {
    name: '',
    code: '',
    ageRange: 'من 3 إلى 4 سنوات',
    capacity: 15,
    mainTeacherId: '',
    assistantTeacherId: '',
    roomNumber: 'القاعة 1',
    color: 'amber',
    description: '',
  };
  const [classForm, setClassForm] = useState(initialClassForm);

  // Staff Form State
  const initialStaffForm = {
    fullName: '',
    role: 'educator' as const,
    phone: '',
    cin: '',
    assignedClassId: '',
    hireDate: new Date().toISOString().split('T')[0],
    qualifications: '',
    salary: 750,
    status: 'active' as const,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    notes: '',
  };
  const [staffForm, setStaffForm] = useState(initialStaffForm);

  // Open Class Modal
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm(initialClassForm);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      code: cls.code,
      ageRange: cls.ageRange,
      capacity: cls.capacity,
      mainTeacherId: cls.mainTeacherId || '',
      assistantTeacherId: cls.assistantTeacherId || '',
      roomNumber: cls.roomNumber,
      color: cls.color || 'amber',
      description: cls.description || '',
    });
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    if (editingClass) {
      updateClass(editingClass.id, classForm);
    } else {
      addClass(classForm);
    }
    setIsClassModalOpen(false);
  };

  // Open Staff Modal
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm(initialStaffForm);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (st: StaffMember) => {
    setEditingStaff(st);
    setStaffForm({
      fullName: st.fullName,
      role: st.role,
      phone: st.phone,
      cin: st.cin,
      assignedClassId: st.assignedClassId || '',
      hireDate: st.hireDate,
      qualifications: st.qualifications,
      salary: st.salary,
      status: st.status,
      photoUrl: st.photoUrl,
      notes: st.notes || '',
    });
    setIsStaffModalOpen(true);
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.fullName.trim()) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, staffForm);
    } else {
      addStaff(staffForm);
    }
    setIsStaffModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>الأقسام والطاقم التربوي والإداري</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تنظيم الأفواج حسب الفئة العمرية، ومتابعة ملفات المربيات والمؤطرات والمعايير البيداغوجية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sub-tab switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveSubTab('classes')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${activeSubTab === 'classes' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              الأقسام والأفواج ({classes.length})
            </button>
            <button
              onClick={() => setActiveSubTab('staff')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${activeSubTab === 'staff' ? 'bg-white text-slate-800 shadow-sm' : 'hover:text-slate-900'}`}
            >
              الطاقم والمربيات ({staff.length})
            </button>
          </div>

          {activeSubTab === 'classes' ? (
            <button
              onClick={handleOpenAddClass}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فوج جديد</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddStaff}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مربية / موظفة</span>
            </button>
          )}
        </div>
      </div>

      {/* ----------------- SUB-TAB 1: CLASSES ----------------- */}
      {activeSubTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map(cls => {
            const enrolled = children.filter(c => c.classId === cls.id && c.status === 'active');
            const mainTeacher = staff.find(s => s.id === cls.mainTeacherId);
            const assistant = staff.find(s => s.id === cls.assistantTeacherId);
            const occupancyRate = Math.round((enrolled.length / cls.capacity) * 100);

            // Ratio check (e.g. 1 educator per enrolled count)
            const staffCount = (mainTeacher ? 1 : 0) + (assistant ? 1 : 0) || 1;
            const ratio = Math.round(enrolled.length / staffCount);

            return (
              <div
                key={cls.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 mb-1">
                        <span>{cls.code || 'فوج'}</span>
                        <span>•</span>
                        <span>{cls.roomNumber}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-800">{cls.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{cls.ageRange}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setClassToDelete(cls)}
                        title="حذف الفوج"
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {cls.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mt-3 leading-relaxed">
                      {cls.description}
                    </p>
                  )}

                  {/* Occupancy and standard Ratio */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100/80">
                      <span className="text-[10px] text-amber-800 font-bold block">نسبة إشغال المقاعد</span>
                      <div className="text-sm font-extrabold text-amber-900 mt-0.5">
                        {enrolled.length} / {cls.capacity} طفل
                      </div>
                      <div className="w-full bg-amber-200/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, occupancyRate)}%` }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100/80">
                      <span className="text-[10px] text-emerald-800 font-bold block">معيار التأطير (أطفال / مربية)</span>
                      <div className="text-sm font-extrabold text-emerald-900 mt-0.5">
                        1 مربية لكل {ratio} أطفال
                      </div>
                      <span className="text-[10px] text-emerald-700 font-medium block mt-1">✓ مطابق لمعايير الوزارة</span>
                    </div>
                  </div>

                  {/* Assigned Educators */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block">الإشراف التربوي المسند:</span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {mainTeacher ? (
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <img src={mainTeacher.photoUrl} alt="" className="w-6 h-6 rounded-lg object-cover" />
                          <div>
                            <span className="font-bold text-slate-800 block">{mainTeacher.fullName}</span>
                            <span className="text-[10px] text-indigo-600">المربية الرئيسية</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-500">لم تُعيّن مربية رئيسية بعد</span>
                      )}

                      {assistant && (
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <img src={assistant.photoUrl} alt="" className="w-6 h-6 rounded-lg object-cover" />
                          <div>
                            <span className="font-bold text-slate-800 block">{assistant.fullName}</span>
                            <span className="text-[10px] text-slate-500">مساعدة مربية</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enrolled children avatars preview */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center -space-x-2 space-x-reverse overflow-hidden">
                    {enrolled.slice(0, 5).map(c => (
                      <img
                        key={c.id}
                        src={c.photoUrl}
                        alt={c.fullName}
                        title={c.fullName}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                    {enrolled.length > 5 && (
                      <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        +{enrolled.length - 5}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {enrolled.length === 0 ? 'لا يوجد أطفال بعد' : `${enrolled.length} أطفال مسجلون`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTransferClassId(cls.id);
                    setIsTransferModalOpen(true);
                  }}
                  className="w-full mt-2 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-indigo-100 transition-colors cursor-pointer"
                  title="نقل أو تحويل أطفال من هذا الفوج إلى فوج آخر"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                  <span>تحويل أطفال من هذا الفوج 🔄</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- SUB-TAB 2: STAFF MEMBERS ----------------- */}
      {activeSubTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staff.map(member => {
            const assignedClass = classes.find(c => c.id === member.assignedClassId);
            const roleLabels: Record<string, string> = {
              educator: 'مربية أطفال',
              assistant: 'مساعدة رعاية ونظافة',
              nurse: 'ممرضة أطفال معتمدة',
              cook: 'طاهية المطبخ الصحي',
              driver: 'سائق حافلة النقل',
              admin: 'إدارية ومحاسبة',
              director: 'مديرة عامة',
            };

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-sm"
                      />
                      <div>
                        <h3 className="font-extrabold text-base text-slate-800">{member.fullName}</h3>
                        <span className="inline-block text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg mt-0.5">
                          {roleLabels[member.role] || member.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditStaff(member)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setStaffToDelete(member)}
                        title="حذف ملف الموظفة"
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">الفوج المسند:</span>
                      <strong className="text-slate-800">{assignedClass?.name || 'كامل الروضة'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">رقم الهاتف:</span>
                      <span className="font-bold text-emerald-700">📞 {member.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">بطاقة التعريف (CIN):</span>
                      <span>{member.cin}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">تاريخ الانتداب:</span>
                      <span>{formatArabicDate(member.hireDate)}</span>
                    </div>
                  </div>

                  {member.qualifications && (
                    <div className="text-xs text-slate-600 flex items-start gap-1.5">
                      <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{member.qualifications}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">الراتب الشهري:</span>
                  <span className="font-bold text-amber-900">{formatTND(member.salary)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- ADD/EDIT CLASSROOM MODAL ----------------- */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingClass ? `تعديل الفوج: ${editingClass.name}` : 'إنشاء فوج / قسم جديد'}
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleClassSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم القسم / الفوج *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الفوج الصغير (Petite Section)"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفئة العمرية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: من 2 إلى 3 سنوات"
                    value={classForm.ageRange}
                    onChange={(e) => setClassForm({ ...classForm, ageRange: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طاقة الاستيعاب القصوى *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المربية الرئيسية</label>
                  <select
                    value={classForm.mainTeacherId}
                    onChange={(e) => setClassForm({ ...classForm, mainTeacherId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">-- بدون تعيين --</option>
                    {staff.filter(s => s.role === 'educator' || s.role === 'nurse').map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.qualifications})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القاعة / الفضاء</label>
                  <input
                    type="text"
                    placeholder="مثال: القاعة 2 (الطابق 1)"
                    value={classForm.roomNumber}
                    onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف والأهداف البيداغوجية</label>
                <textarea
                  rows={2}
                  placeholder="التركيز على النظافة، الحركية، الحروف والأرقام..."
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  {editingClass ? 'حفظ التعديلات' : 'إضافة الفوج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- ADD/EDIT STAFF MODAL ----------------- */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingStaff ? `تعديل ملف: ${editingStaff.fullName}` : 'إضافة مربية أو موظفة جديدة'}
              </h3>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم واللقب *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: وفاء الماجري"
                    value={staffForm.fullName}
                    onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصفة / الوظيفة *</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="educator">مربية أطفال</option>
                    <option value="assistant">مساعدة مربية / نظافة</option>
                    <option value="nurse">ممرضة أطفال</option>
                    <option value="cook">طاهية مطبخ</option>
                    <option value="driver">سائق حافلة</option>
                    <option value="admin">إدارية ومحاسبة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 98 560 321"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم ب.ت.و (CIN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 08765432"
                    value={staffForm.cin}
                    onChange={(e) => setStaffForm({ ...staffForm, cin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفوج المسند</label>
                  <select
                    value={staffForm.assignedClassId}
                    onChange={(e) => setStaffForm({ ...staffForm, assignedClassId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">-- بدون فوج مخصص --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الشهري (د.ت)</label>
                  <input
                    type="number"
                    value={staffForm.salary}
                    onChange={(e) => setStaffForm({ ...staffForm, salary: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المؤهلات والشهادات العلمية</label>
                <input
                  type="text"
                  placeholder="مثال: إجازة في الطفولة المبكرة + شهادة الإسعافات الأولية"
                  value={staffForm.qualifications}
                  onChange={(e) => setStaffForm({ ...staffForm, qualifications: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              {/* Staff Photo Upload */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">صورة الموظفة الشخصية</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-300 bg-white flex-shrink-0">
                    <img
                      src={staffForm.photoUrl}
                      alt="صورة الموظفة"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 flex gap-2">
                    <label className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer border border-indigo-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>تحميل من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setStaffForm(prev => ({ ...prev, photoUrl: evt.target!.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="أو رابط URL..."
                      value={staffForm.photoUrl}
                      onChange={(e) => setStaffForm({ ...staffForm, photoUrl: e.target.value })}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  {editingStaff ? 'حفظ التعديلات' : 'إضافة الموظفة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Class Modal */}
      {classToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-rose-100 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800">تأكيد حذف الفوج</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف فوج <span className="font-extrabold text-rose-600">{classToDelete.name}</span>؟
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteClass(classToDelete.id);
                  setClassToDelete(null);
                }}
                className="py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الفوج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Staff Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-rose-100 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800">تأكيد حذف ملف الموظفة</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف ملف الموظفة <span className="font-extrabold text-rose-600">{staffToDelete.fullName}</span>؟
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteStaff(staffToDelete.id);
                  setStaffToDelete(null);
                }}
                className="py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الموظفة</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Transfer Children Modal */}
      {isTransferModalOpen && (
        <TransferChildrenModal
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setTransferClassId(undefined);
          }}
          initialSourceClassId={transferClassId}
        />
      )}
    </div>
  );
};
