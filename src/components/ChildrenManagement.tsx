import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Baby, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Heart,
  Bus,
  Utensils,
  Sparkles,
  IdCard,
  CreditCard,
  Upload,
  Camera,
  GraduationCap,
  Users,
  Layers,
  RotateCcw,
  UserCheck,
  Building,
  Link as LinkIcon,
  ArrowLeftRight,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Child, ChildStatus, Gender, AuthorizedPerson, ChildDocument } from '../types';
import { calculateAge, formatArabicDate, formatTND, exportToCSV } from '../utils/helpers';
import { TransferChildrenModal } from './TransferChildrenModal';

const AVATAR_PRESETS = [
  { label: 'ولد 1', url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=200&auto=format&fit=crop&q=80' },
  { label: 'بنت 1', url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=200&auto=format&fit=crop&q=80' },
  { label: 'ولد 2', url: 'https://images.unsplash.com/photo-1595454223600-91fbdd77e58b?w=200&auto=format&fit=crop&q=80' },
  { label: 'بنت 2', url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&auto=format&fit=crop&q=80' },
  { label: 'طفل 3', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&auto=format&fit=crop&q=80' },
];

export const ChildrenManagement: React.FC = () => {
  const { 
    children, 
    classes, 
    staff,
    addChild, 
    updateChild, 
    deleteChild, 
    searchQuery, 
    setSearchQuery,
    setPrintChildCardData,
    setPrintEvaluationData,
    evaluations,
    settings,
    busRoutes
  } = useApp();

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [viewingChild, setViewingChild] = useState<Child | null>(null);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);

  // Bulk / Transfer State
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSourceClassId, setTransferSourceClassId] = useState<string | undefined>(undefined);

  // Active form tab
  const [formTab, setFormTab] = useState<'basic' | 'parents' | 'pickup' | 'health' | 'services' | 'docs'>('basic');

  // Form State
  const initialFormData = {
    fullName: '',
    birthDate: '2021-01-01',
    gender: 'male' as Gender,
    classId: classes[0]?.id || 'class-1',
    photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'active' as ChildStatus,
    
    fatherName: '',
    fatherPhone: '',
    fatherJob: '',
    motherName: '',
    motherPhone: '',
    motherJob: '',
    address: '',
    emergencyPhone: '',
    emergencyContactName: '',
    
    authorizedPersons: [] as AuthorizedPerson[],
    
    health: {
      bloodType: 'O+' as const,
      allergies: [] as string[],
      chronicDiseases: [] as string[],
      regularMedications: '',
      familyDoctorName: '',
      familyDoctorPhone: '',
      emergencyNotes: '',
    },
    
    services: {
      canteen: true,
      transport: false,
      transportRouteId: '',
      eveningCare: false,
      extracurricularClubs: [] as string[],
    },
    monthlyBaseFee: settings.defaultBaseFee,
    discountPercent: 0,
    discountReason: '',
    
    documents: [
      { id: 'doc-1', title: 'مضمون ولادة (شهادة ميلاد حديثة)', type: 'birth_certificate' as const, submitted: true },
      { id: 'doc-2', title: 'دفتر التلاقيح محين', type: 'vaccine_record' as const, submitted: true },
      { id: 'doc-3', title: 'شهادة طبية تثبت السلامة', type: 'medical_cert' as const, submitted: true },
      { id: 'doc-4', title: '4 صور شمسية للطفل', type: 'photos' as const, submitted: true },
      { id: 'doc-5', title: 'استمارة التسجيل والموافقة ممضاة', type: 'reg_form' as const, submitted: true },
    ] as ChildDocument[],
    
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // File upload state for child photo
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const handleProcessImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, JPEG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({ ...prev, photoUrl: e.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // New authorized person form state
  const [newAuthName, setNewAuthName] = useState('');
  const [newAuthRelation, setNewAuthRelation] = useState('الأب');
  const [newAuthPhone, setNewAuthPhone] = useState('');
  const [newAuthCin, setNewAuthCin] = useState('');
  const [newAuthNotes, setNewAuthNotes] = useState('');

  // Allergy input
  const [newAllergy, setNewAllergy] = useState('');
  const [newClub, setNewClub] = useState('');

  // Open Add Modal
  const handleOpenAdd = (defaultClassId?: string) => {
    setEditingChild(null);
    setFormData({
      ...initialFormData,
      classId: defaultClassId || (selectedClassFilter !== 'all' ? selectedClassFilter : (classes[0]?.id || 'class-1')),
    });
    setFormTab('basic');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (child: Child) => {
    setEditingChild(child);
    setFormData({
      fullName: child.fullName,
      birthDate: child.birthDate,
      gender: child.gender,
      classId: child.classId,
      photoUrl: child.photoUrl,
      registrationDate: child.registrationDate,
      status: child.status,
      fatherName: child.fatherName,
      fatherPhone: child.fatherPhone,
      fatherJob: child.fatherJob || '',
      motherName: child.motherName,
      motherPhone: child.motherPhone,
      motherJob: child.motherJob || '',
      address: child.address,
      emergencyPhone: child.emergencyPhone,
      emergencyContactName: child.emergencyContactName,
      authorizedPersons: child.authorizedPersons || [],
      health: {
        bloodType: child.health.bloodType || 'O+',
        allergies: child.health.allergies || [],
        chronicDiseases: child.health.chronicDiseases || [],
        regularMedications: child.health.regularMedications || '',
        familyDoctorName: child.health.familyDoctorName || '',
        familyDoctorPhone: child.health.familyDoctorPhone || '',
        emergencyNotes: child.health.emergencyNotes || '',
      },
      services: {
        canteen: child.services.canteen,
        transport: child.services.transport,
        transportRouteId: child.services.transportRouteId || '',
        eveningCare: child.services.eveningCare,
        extracurricularClubs: child.services.extracurricularClubs || [],
      },
      monthlyBaseFee: child.monthlyBaseFee,
      discountPercent: child.discountPercent,
      discountReason: child.discountReason || '',
      documents: child.documents || initialFormData.documents,
      notes: child.notes || '',
    });
    setFormTab('basic');
    setIsAddModalOpen(true);
  };

  // Save Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    if (editingChild) {
      updateChild(editingChild.id, formData);
    } else {
      addChild(formData);
    }
    setIsAddModalOpen(false);
    setEditingChild(null);
  };

  // Add Authorized person
  const handleAddAuthorizedPerson = () => {
    if (!newAuthName.trim() || !newAuthPhone.trim()) return;
    const newPerson: AuthorizedPerson = {
      id: `auth-${Date.now()}`,
      name: newAuthName,
      relation: newAuthRelation,
      phone: newAuthPhone,
      cin: newAuthCin,
      isPrimary: false,
      notes: newAuthNotes,
    };
    setFormData(prev => ({
      ...prev,
      authorizedPersons: [...prev.authorizedPersons, newPerson],
    }));
    setNewAuthName('');
    setNewAuthPhone('');
    setNewAuthCin('');
    setNewAuthNotes('');
  };

  const handleRemoveAuthorizedPerson = (id: string) => {
    setFormData(prev => ({
      ...prev,
      authorizedPersons: prev.authorizedPersons.filter(p => p.id !== id),
    }));
  };

  // Add Allergy
  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    if (!formData.health.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        health: {
          ...prev.health,
          allergies: [...prev.health.allergies, newAllergy.trim()],
        }
      }));
    }
    setNewAllergy('');
  };

  const handleRemoveAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      health: {
        ...prev.health,
        allergies: prev.health.allergies.filter(a => a !== allergy),
      }
    }));
  };

  // Add Extracurricular club
  const handleAddClub = () => {
    if (!newClub.trim()) return;
    if (!formData.services.extracurricularClubs.includes(newClub.trim())) {
      setFormData(prev => ({
        ...prev,
        services: {
          ...prev.services,
          extracurricularClubs: [...prev.services.extracurricularClubs, newClub.trim()],
        }
      }));
    }
    setNewClub('');
  };

  const handleRemoveClub = (club: string) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        extracurricularClubs: prev.services.extracurricularClubs.filter(c => c !== club),
      }
    }));
  };

  // Toggle document
  const handleToggleDoc = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === docId ? { ...d, submitted: !d.submitted } : d),
    }));
  };

  // Filtered children
  const filteredChildren = children.filter(child => {
    const matchesSearch = 
      !searchQuery ||
      child.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.fatherPhone.includes(searchQuery) ||
      child.motherPhone.includes(searchQuery);

    const matchesClass = selectedClassFilter === 'all' || child.classId === selectedClassFilter;
    const matchesStatus = selectedStatusFilter === 'all' || child.status === selectedStatusFilter;
    const matchesGender = selectedGenderFilter === 'all' || child.gender === selectedGenderFilter;

    return matchesSearch && matchesClass && matchesStatus && matchesGender;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'رقم التسجيل',
      'الاسم واللقب',
      'تاريخ الميلاد',
      'العمر',
      'الجنس',
      'القسم / الفوج',
      'اسم الأب',
      'هاتف الأب',
      'اسم الأم',
      'هاتف الأم',
      'العنوان',
      'الحالة الصحية والحساسية',
      'المطعم',
      'النقل المدرسي',
      'الاشتراك الأساسي (د.ت)',
      'الحالة'
    ];

    const rows = filteredChildren.map(c => {
      const cls = classes.find(cl => cl.id === c.classId);
      const age = calculateAge(c.birthDate);
      return [
        c.registrationNumber,
        c.fullName,
        c.birthDate,
        age.text,
        c.gender === 'male' ? 'ذكر' : 'أنثى',
        cls?.name || 'غير محدد',
        c.fatherName,
        c.fatherPhone,
        c.motherName,
        c.motherPhone,
        c.address,
        c.health.allergies.join(' / ') || 'سليم',
        c.services.canteen ? 'نعم' : 'لا',
        c.services.transport ? 'نعم' : 'لا',
        c.monthlyBaseFee,
        c.status === 'active' ? 'نشط' : c.status === 'paused' ? 'منقطع' : 'منسحب'
      ];
    });

    exportToCSV(`قائمة_أطفال_روضتي_${new Date().toISOString().split('T')[0]}`, rows, headers);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Baby className="w-6 h-6 text-amber-500" />
            <span>إدارة ملفات الأطفال المسجلين</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {filteredChildren.length} طفل
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            البطاقات الفردية، معلومات الأولياء، الأشخاص المفوضون للاستلام، الملف الصحي، والوثائق
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setTransferSourceClassId(selectedClassFilter !== 'all' ? selectedClassFilter : undefined);
              setIsTransferModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 border border-indigo-200 transition-all active:scale-95 cursor-pointer shadow-xs"
            title="نقل مجموعة أطفال بين الأفواج"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            <span>نقل أطفال بين الأفواج 🔄</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel / CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-amber-200/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل ملف طفل جديد</span>
          </button>
        </div>
      </div>

      {/* Educational Groups / Classes Filter Chips */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>المجموعات التربوية والأفواج الدراسية (تصفية سريعة)</span>
          </div>

          {(selectedClassFilter !== 'all' || selectedStatusFilter !== 'all' || selectedGenderFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedClassFilter('all');
                setSelectedStatusFilter('all');
                setSelectedGenderFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تعيين جميع الفلاتر</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* All Classes Button */}
          <button
            type="button"
            onClick={() => setSelectedClassFilter('all')}
            className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
              selectedClassFilter === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-black">جميع المجموعات</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedClassFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {children.length}
              </span>
            </div>
            <span className={`text-[10px] font-medium mt-1 ${selectedClassFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
              كامل أطفال الروضة
            </span>
          </button>

          {/* Each Class Pill */}
          {classes.map(cls => {
            const classCount = children.filter(c => c.classId === cls.id).length;
            const isSelected = selectedClassFilter === cls.id;
            const teacher = staff.find(s => s.id === cls.mainTeacherId);

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassFilter(cls.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isSelected ? 'bg-white ring-2 ring-white/40' : 'ring-1 ring-black/10'
                      }`}
                      style={{ backgroundColor: isSelected ? '#FFFFFF' : (cls.color || '#F59E0B') }}
                    />
                    <span className="text-xs font-black truncate">{cls.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-amber-100/80 text-amber-900'
                  }`}>
                    {classCount} / {cls.capacity}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full mt-1.5 text-[10px]">
                  <span className={isSelected ? 'text-amber-100' : 'text-slate-400'}>
                    {cls.ageRange}
                  </span>
                  {teacher && (
                    <span className={`truncate max-w-[80px] font-medium ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                      {teacher.fullName.split(' ')[0]}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالاسم، رقم التسجيل، اسم الولي، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
        </div>

        {/* Filter by class / Educational Group */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
            <span>المجموعة التربوية:</span>
          </span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            <option value="all">جميع المجموعات والأفواج ({children.length})</option>
            {classes.map(cls => {
              const count = children.filter(c => c.classId === cls.id).length;
              return (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.ageRange}) - {count} طفل
                </option>
              );
            })}
          </select>
        </div>

        {/* Filter by status */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-bold">الحالة:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط (مستمر)</option>
            <option value="paused">منقطع مؤقتاً</option>
            <option value="withdrawn">منسحب</option>
          </select>
        </div>

        {/* Filter by gender */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-bold">الجنس:</span>
          <select
            value={selectedGenderFilter}
            onChange={(e) => setSelectedGenderFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
          >
            <option value="all">الكل</option>
            <option value="male">ذكور</option>
            <option value="female">إناث</option>
          </select>
        </div>
      </div>

      {/* Active Group Details Banner */}
      {selectedClassFilter !== 'all' && (() => {
        const activeClass = classes.find(c => c.id === selectedClassFilter);
        if (!activeClass) return null;
        const classKids = children.filter(c => c.classId === activeClass.id);
        const activeTeacher = staff.find(s => s.id === activeClass.mainTeacherId);
        const assistantTeacher = staff.find(s => s.id === activeClass.assistantTeacherId);
        const occupancyPercent = Math.min(100, Math.round((classKids.length / (activeClass.capacity || 1)) * 100));

        return (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                style={{ backgroundColor: activeClass.color || '#F59E0B' }}
              >
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base text-slate-800">{activeClass.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {activeClass.ageRange}
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200">
                    {activeClass.code}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 mt-1 flex-wrap">
                  {activeTeacher && (
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>المربية المشرفة: <strong className="text-slate-800">{activeTeacher.fullName}</strong></span>
                    </div>
                  )}
                  {assistantTeacher && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <span>المساعدة: {assistantTeacher.fullName}</span>
                    </div>
                  )}
                  {activeClass.roomNumber && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <Building className="w-3.5 h-3.5" />
                      <span>القاعة: {activeClass.roomNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-between md:justify-end">
              <div className="text-right">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>طاقة الاستيعاب:</span>
                  <span className="text-amber-800 font-extrabold">{classKids.length} / {activeClass.capacity} طفل</span>
                  <span className="text-[10px] text-slate-400">({occupancyPercent}%)</span>
                </div>
                <div className="w-32 sm:w-40 bg-slate-200 rounded-full h-2 mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      occupancyPercent >= 100 ? 'bg-rose-500' : occupancyPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferSourceClassId(activeClass.id);
                    setSelectedChildIds([]);
                    setIsTransferModalOpen(true);
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="نقل مجموعة أطفال من هذا الفوج إلى فوج آخر"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>تحويل أطفال من هذا الفوج</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAdd(activeClass.id)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة طفل لهذا الفوج</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bulk Action Bar when children are selected */}
      {selectedChildIds.length > 0 && (
        <div className="sticky top-3 z-30 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 rounded-3xl shadow-xl border border-indigo-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-2xl bg-amber-400 text-slate-900 font-black text-sm flex items-center justify-center shadow-sm">
              {selectedChildIds.length}
            </span>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>تم تحديد {selectedChildIds.length} طفل</span>
              </div>
              <div className="text-[11px] text-indigo-200">
                يمكنك الآن نقلهم دفعة واحدة إلى أي فوج آخر
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsTransferModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-900" />
              <span>تحويل الأطفال المحددين إلى فوج آخر 🔄</span>
            </button>

            <button
              onClick={() => setSelectedChildIds([])}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Children Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredChildren.map(child => {
          const cls = classes.find(c => c.id === child.classId);
          const age = calculateAge(child.birthDate);
          const hasAllergy = child.health.allergies.length > 0;
          const authCount = child.authorizedPersons ? child.authorizedPersons.length : 0;
          const isSelected = selectedChildIds.includes(child.id);

          const handleToggleSelect = () => {
            setSelectedChildIds(prev =>
              prev.includes(child.id) ? prev.filter(id => id !== child.id) : [...prev, child.id]
            );
          };

          return (
            <div
              key={child.id}
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 relative group ${
                isSelected 
                  ? 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-50/15 shadow-md' 
                  : 'border-slate-200/80 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Status Badge & Checkbox */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={handleToggleSelect}
                      title="تحديد هذا الطفل للتحويل الجماعي"
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                    />
                    <div className="relative">
                      <img
                        src={child.photoUrl}
                        alt={child.fullName}
                        className="w-13 h-13 rounded-2xl object-cover ring-2 ring-amber-200 shadow-sm"
                      />
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white ${child.gender === 'male' ? 'bg-sky-500' : 'bg-pink-500'}`}>
                        {child.gender === 'male' ? '♂' : '♀'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-800 hover:text-amber-600 transition-colors cursor-pointer" onClick={() => setViewingChild(child)}>
                        {child.fullName}
                      </h3>
                    </div>
                    <div className="text-xs text-amber-700 font-bold mt-0.5">
                      {cls?.name || 'غير محدد'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <span>{age.text}</span>
                      <span>•</span>
                      <span>{child.registrationNumber}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                    child.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : child.status === 'paused'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {child.status === 'active' ? 'نشط' : child.status === 'paused' ? 'منقطع' : 'منسحب'}
                </span>
              </div>

              {/* Badges / Services */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {child.services.canteen && (
                  <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-medium border border-orange-100 flex items-center gap-1">
                    <Utensils className="w-3 h-3" />
                    <span>مطعم</span>
                  </span>
                )}
                {child.services.transport && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-100 flex items-center gap-1">
                    <Bus className="w-3 h-3" />
                    <span>نقل</span>
                  </span>
                )}
                {hasAllergy && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-100 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>حساسية ({child.health.allergies[0]})</span>
                  </span>
                )}
                {authCount > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                    {authCount} مفوّضون للاستلام
                  </span>
                )}
              </div>

              {/* Parents & Contact summary */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 font-medium">الأب:</span>
                  <span className="font-bold">{child.fatherName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 font-medium">الأم:</span>
                  <span className="font-bold">{child.motherName}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1 text-slate-500 font-medium text-[11px]">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{child.fatherPhone || child.motherPhone}</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-900">
                    {formatTND(child.monthlyBaseFee)} / شهرياً
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-1.5">
                <button
                  onClick={() => setViewingChild(child)}
                  title="عرض الملف الشامل"
                  className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>الملف</span>
                </button>

                <button
                  onClick={() => setPrintChildCardData(child)}
                  title="طباعة بطاقة التلميذ المدرسية"
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <IdCard className="w-4 h-4 text-indigo-600" />
                </button>

                <button
                  onClick={() => handleOpenEdit(child)}
                  title="تعديل بيانات الطفل"
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-sky-600" />
                </button>

                <button
                  onClick={() => {
                    setSelectedChildIds([child.id]);
                    setTransferSourceClassId(child.classId);
                    setIsTransferModalOpen(true);
                  }}
                  title="نقل الطفل إلى فوج آخر"
                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setChildToDelete(child)}
                  title="حذف الملف نهائياً"
                  className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChildren.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Baby className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800">لم يتم العثور على أطفال يطابقون شروط البحث والتصفية</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {selectedClassFilter !== 'all' 
                ? `لا يوجد حالياً أطفال مسجلون في ${classes.find(c => c.id === selectedClassFilter)?.name || 'هذا الفوج'} بهذه الشروط.`
                : 'جرب تغيير شروط الفلترة أو ابحث باسم أو رقم تسجيل آخر.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSelectedClassFilter('all');
                setSelectedStatusFilter('all');
                setSelectedGenderFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء التصفية وعرض الكل</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAdd(selectedClassFilter !== 'all' ? selectedClassFilter : undefined)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل طفل جديد الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------- ADD / EDIT MODAL -------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Baby className="w-5 h-5" />
                  <span>{editingChild ? `تعديل ملف الطفل: ${editingChild.fullName}` : 'تسجيل ملف طفل جديد'}</span>
                </h3>
                <p className="text-xs text-amber-100">يرجى ملء جميع البيانات الأساسية لضمان سلامة ورعاية الطفل</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2 overflow-x-auto text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setFormTab('basic')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${formTab === 'basic' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent hover:text-slate-900'}`}
              >
                <Baby className="w-4 h-4" />
                <span>1. البيانات الأساسية</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab('parents')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${formTab === 'parents' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent hover:text-slate-900'}`}
              >
                <Phone className="w-4 h-4" />
                <span>2. الأولياء والاتصال</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab('pickup')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${formTab === 'pickup' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent hover:text-slate-900'}`}
              >
                <UserPlus className="w-4 h-4" />
                <span>3. المفوضون للاستلام ({formData.authorizedPersons.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab('health')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${formTab === 'health' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent hover:text-slate-900'}`}
              >
                <Heart className="w-4 h-4" />
                <span>4. الملف الصحي والحساسية</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab('services')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${formTab === 'services' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent hover:text-slate-900'}`}
              >
                <CreditCard className="w-4 h-4" />
                <span>5. الخدمات والاشتراك</span>
              </button>
              <button
                type="button"
                onClick={() => setFormTab('docs')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${formTab === 'docs' ? 'border-amber-500 text-amber-600 bg-white' : 'border-transparent hover:text-slate-900'}`}
              >
                <FileText className="w-4 h-4" />
                <span>6. الوثائق المرفقة</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: BASIC INFO */}
              {formTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل للطفل *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: يوسف الطرابلسي"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الميلاد *</label>
                      <input
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-400"
                      />
                      <span className="text-[11px] text-amber-700 font-medium mt-1 block">
                        العمر الحالي: {calculateAge(formData.birthDate).text}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الجنس *</label>
                      <div className="flex gap-4 pt-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={() => setFormData({ ...formData, gender: 'male' })}
                            className="text-amber-500 focus:ring-amber-400"
                          />
                          <span>ذكر 👦</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={() => setFormData({ ...formData, gender: 'female' })}
                            className="text-amber-500 focus:ring-amber-400"
                          />
                          <span>أنثى 👧</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">القسم / الفوج المسند *</label>
                      <select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-400"
                      >
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.ageRange})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">حالة الملف</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ChildStatus })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800"
                      >
                        <option value="active">نشط ومستمر في الروضة</option>
                        <option value="paused">منقطع مؤقتاً</option>
                        <option value="withdrawn">منسحب نهائياً</option>
                      </select>
                    </div>

                    {/* Enhanced Photo Upload & URL Component */}
                    <div className="sm:col-span-2 p-4 bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-slate-50 border border-amber-200/80 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-amber-600" />
                          <span>صورة التلميذ(ة) الشخصية</span>
                        </label>
                        {formData.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photoUrl: '' })}
                            className="text-[11px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                          >
                            حذف الصورة ✕
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        {/* Live Photo Preview */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-white flex items-center justify-center">
                            {formData.photoUrl ? (
                              <img
                                src={formData.photoUrl}
                                alt="صورة الطفل"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80';
                                }}
                              />
                            ) : (
                              <Baby className="w-10 h-10 text-slate-300" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="تحميل صورة جديدة من الجهاز"
                            className="absolute -bottom-1 -left-1 p-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Upload from Device & Link Input */}
                        <div className="flex-1 w-full space-y-2.5">
                          {/* Hidden HTML file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleProcessImageFile(e.target.files[0]);
                              }
                            }}
                          />

                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* Device Upload Drag & Click button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingPhoto(true);
                              }}
                              onDragLeave={() => setIsDraggingPhoto(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingPhoto(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleProcessImageFile(e.dataTransfer.files[0]);
                                }
                              }}
                              className={`flex-1 py-2.5 px-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all cursor-pointer ${
                                isDraggingPhoto
                                  ? 'border-amber-600 bg-amber-100 text-amber-900 scale-102 ring-2 ring-amber-400'
                                  : 'border-amber-400 hover:border-amber-600 bg-white hover:bg-amber-50 text-amber-900 shadow-sm'
                              }`}
                            >
                              <Upload className="w-4 h-4 text-amber-600" />
                              <span>اختر أو اسحب صورة من جهازك 📁</span>
                            </button>

                            {/* Direct URL input */}
                            <div className="flex-1 relative">
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <LinkIcon className="w-3.5 h-3.5" />
                              </div>
                              <input
                                type="url"
                                placeholder="أو أدخل رابط صورة (URL)..."
                                value={formData.photoUrl}
                                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl pr-8 pl-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-400"
                              />
                            </div>
                          </div>

                          {/* Quick avatar presets */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">نماذج سريعة:</span>
                            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                              {AVATAR_PRESETS.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, photoUrl: preset.url })}
                                  className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer flex-shrink-0 ${
                                    formData.photoUrl === preset.url
                                      ? 'ring-2 ring-amber-500 border-amber-500 scale-110 shadow-sm'
                                      : 'border-slate-200 hover:border-amber-400 opacity-80 hover:opacity-100'
                                  }`}
                                  title={preset.label}
                                >
                                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات عامة حول الطفل</label>
                    <textarea
                      rows={2}
                      placeholder="طباع الطفل، عادات النوم، اللعبة المفضلة..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* TAB 2: PARENTS INFO */}
              {formTab === 'parents' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Father */}
                    <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
                      <div className="font-bold text-xs text-sky-800 flex items-center gap-1.5">
                        <span>معلومات الأب:</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الأب واللقب *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: أحمد الطرابلسي"
                          value={formData.fatherName}
                          onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم هاتف الأب *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: 98 221 340"
                          value={formData.fatherPhone}
                          onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">مهنة الأب ومكان العمل</label>
                        <input
                          type="text"
                          placeholder="مثال: مهندس برمجيات"
                          value={formData.fatherJob}
                          onChange={(e) => setFormData({ ...formData, fatherJob: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Mother */}
                    <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
                      <div className="font-bold text-xs text-pink-800 flex items-center gap-1.5">
                        <span>معلومات الأم:</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الأم واللقب *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: مروى البجاوي"
                          value={formData.motherName}
                          onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم هاتف الأم *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: 22 554 110"
                          value={formData.motherPhone}
                          onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">مهنة الأم ومكان العمل</label>
                        <input
                          type="text"
                          placeholder="مثال: أستاذة تعليم ثانوي"
                          value={formData.motherJob}
                          onChange={(e) => setFormData({ ...formData, motherJob: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address & Emergency Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عنوان السكن الكامل *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: 14 نهج الياسمين، حي النصر 2، تونس"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">شخص للطوارئ الإضافي ورقم هاتفه *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="الاسم والصفة (مثال: الجدة فاطمة)"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                        <input
                          type="text"
                          placeholder="رقم الهاتف"
                          value={formData.emergencyPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AUTHORIZED PERSONS (SECURITY) */}
              {formTab === 'pickup' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                    <strong>🛡️ بروتوكول الأمان والسلامة:</strong> لا يُسلّم الطفل عند الانصراف إلا للأولياء أو للأشخاص المذكورين في هذه القائمة المعتمدة مع التحقق من بطاقة التعريف الوطنية.
                  </div>

                  {/* Add authorized person widget */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="font-bold text-xs text-slate-800">إضافة شخص مفوّض جديد لاستلام الطفل:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      <input
                        type="text"
                        placeholder="الاسم واللقب *"
                        value={newAuthName}
                        onChange={(e) => setNewAuthName(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="صلة القرابة (جد، عم، خالة، سائق...)"
                        value={newAuthRelation}
                        onChange={(e) => setNewAuthRelation(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="رقم الهاتف *"
                        value={newAuthPhone}
                        onChange={(e) => setNewAuthPhone(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="رقم ب.ت.و (CIN)"
                        value={newAuthCin}
                        onChange={(e) => setNewAuthCin(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ملاحظات (مثال: أيام الأربعاء فقط، أو تفويض مؤقت)"
                        value={newAuthNotes}
                        onChange={(e) => setNewAuthNotes(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddAuthorizedPerson}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + إضافة للقائمة
                      </button>
                    </div>
                  </div>

                  {/* List of authorized persons */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-slate-700">قائمة المفوضين المسجلين:</div>
                    {formData.authorizedPersons.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">لم تتم إضافة مفوضين إضافيين بعد (يقتصر الاستلام على الأب والأم).</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {formData.authorizedPersons.map(person => (
                          <div key={person.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                            <div className="text-xs space-y-0.5">
                              <div className="font-bold text-slate-800">{person.name} ({person.relation})</div>
                              <div className="text-slate-500 text-[11px]">📞 {person.phone} {person.cin ? `| CIN: ${person.cin}` : ''}</div>
                              {person.notes && <div className="text-amber-800 text-[10px]">{person.notes}</div>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAuthorizedPerson(person.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 text-xs font-bold"
                            >
                              حذف ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: HEALTH PROFILE */}
              {formTab === 'health' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">فصيلة الدم</label>
                      <select
                        value={formData.health.bloodType}
                        onChange={(e) => setFormData({
                          ...formData,
                          health: { ...formData.health, bloodType: e.target.value as any }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="AB-">AB-</option>
                        <option value="غير محدد">غير محدد</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">طبيب العائلة (طبيب الأطفال)</label>
                      <input
                        type="text"
                        placeholder="مثال: د. سامي المرزوقي"
                        value={formData.health.familyDoctorName}
                        onChange={(e) => setFormData({
                          ...formData,
                          health: { ...formData.health, familyDoctorName: e.target.value }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">هاتف طبيب العائلة</label>
                      <input
                        type="text"
                        placeholder="71 882 345"
                        value={formData.health.familyDoctorPhone}
                        onChange={(e) => setFormData({
                          ...formData,
                          health: { ...formData.health, familyDoctorPhone: e.target.value }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Allergies Builder */}
                  <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-3">
                    <div className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>الحساسية الغذائية والدوائية:</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="أدخل نوع الحساسية (مثال: حساسية الفول السوداني، مشتقات الحليب، الغلوتين...)"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddAllergy}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                      >
                        + إضافة حساسية
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formData.health.allergies.map(allergy => (
                        <span key={allergy} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 font-bold rounded-xl text-xs border border-rose-200">
                          <span>{allergy}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAllergy(allergy)}
                            className="text-rose-600 hover:text-rose-900 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {formData.health.allergies.length === 0 && (
                        <span className="text-xs text-slate-400">لا توجد حساسيات مسجلة (الطفل سليم).</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">أدوية منتظمة أو أمراض مزمنة (ربو، سكري...)</label>
                    <input
                      type="text"
                      placeholder="مثال: بخاخ فنتولين عند الحاجة، فيتامين د..."
                      value={formData.health.regularMedications}
                      onChange={(e) => setFormData({
                        ...formData,
                        health: { ...formData.health, regularMedications: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">توجيهات صحية خاصة للطاقم والمطبخ</label>
                    <textarea
                      rows={2}
                      placeholder="مثال: وجبة خاصة، مراقبة شرب الماء، عدم وضع الضمادات اللاصقة على الجلد..."
                      value={formData.health.emergencyNotes}
                      onChange={(e) => setFormData({
                        ...formData,
                        health: { ...formData.health, emergencyNotes: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* TAB 5: SERVICES & FINANCIALS */}
              {formTab === 'services' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="font-bold text-xs text-slate-800">الاشتراك الأساسي والتخفيضات:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">المعلوم الشهري الأساسي (د.ت) *</label>
                        <input
                          type="number"
                          required
                          value={formData.monthlyBaseFee}
                          onChange={(e) => setFormData({ ...formData, monthlyBaseFee: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">نسبة الخصم (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={formData.discountPercent}
                          onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">سبب الخصم إن وجد</label>
                        <input
                          type="text"
                          placeholder="مثال: خصم الإخوة 10%، حالة اجتماعية"
                          value={formData.discountReason}
                          onChange={(e) => setFormData({ ...formData, discountReason: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Services Checkboxes */}
                  <div className="space-y-2.5">
                    <div className="font-bold text-xs text-slate-800">الخدمات الإضافية المشترك بها:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:bg-amber-50/50">
                        <input
                          type="checkbox"
                          checked={formData.services.canteen}
                          onChange={(e) => setFormData({
                            ...formData,
                            services: { ...formData.services, canteen: e.target.checked }
                          })}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-800">🍽️ خدمة الإطعام والمطعم</div>
                          <div className="text-slate-400 text-[10px]">{formatTND(settings.defaultCanteenFee)} / شهرياً</div>
                        </div>
                      </label>

                      <label className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:bg-amber-50/50">
                        <input
                          type="checkbox"
                          checked={formData.services.transport}
                          onChange={(e) => setFormData({
                            ...formData,
                            services: { ...formData.services, transport: e.target.checked }
                          })}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-800">🚌 خدمة النقل المدرسي</div>
                          <div className="text-slate-400 text-[10px]">{formatTND(settings.defaultTransportFee)} / شهرياً</div>
                        </div>
                      </label>

                      <label className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:bg-amber-50/50">
                        <input
                          type="checkbox"
                          checked={formData.services.eveningCare}
                          onChange={(e) => setFormData({
                            ...formData,
                            services: { ...formData.services, eveningCare: e.target.checked }
                          })}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-800">🌙 الحراسة المسائية المتأخرة</div>
                          <div className="text-slate-400 text-[10px]">إلى الساعة 18:30</div>
                        </div>
                      </label>
                    </div>

                    {formData.services.transport && (
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs space-y-1">
                        <label className="block font-bold text-blue-900">اختر خط النقل الحافلة المسند:</label>
                        <select
                          value={formData.services.transportRouteId}
                          onChange={(e) => setFormData({
                            ...formData,
                            services: { ...formData.services, transportRouteId: e.target.value }
                          })}
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold"
                        >
                          <option value="">-- اختر خط النقل --</option>
                          {busRoutes.map(route => (
                            <option key={route.id} value={route.id}>
                              {route.name} ({route.driverName} - {route.busNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Extracurricular Clubs */}
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
                    <div className="font-bold text-xs text-purple-900">النوادي والأنشطة البيداغوجية الإضافية:</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="أدخل اسم النادي (مثال: روبوتيك، كاراتيه، مسرح، لغة إنجليزية...)"
                        value={newClub}
                        onChange={(e) => setNewClub(e.target.value)}
                        className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddClub}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                      >
                        + إضافة نادي
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {formData.services.extracurricularClubs.map(club => (
                        <span key={club} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-900 font-bold rounded-xl text-xs border border-purple-200">
                          <span>{club}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveClub(club)}
                            className="text-purple-600 hover:text-purple-950 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {formTab === 'docs' && (
                <div className="space-y-3">
                  <div className="font-bold text-xs text-slate-800">قائمة المستندات والوثائق الإدارية المطلوبة:</div>
                  <div className="space-y-2">
                    {formData.documents.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => handleToggleDoc(doc.id)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                          doc.submitted
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {doc.submitted ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-300" />
                          )}
                          <span className="text-xs font-bold">{doc.title}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${doc.submitted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                          {doc.submitted ? 'مستلم ومودع بالملف' : 'غير متوفر / في الانتظار'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  إلغاء
                </button>

                <div className="flex gap-2">
                  {formTab !== 'docs' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: Array<typeof formTab> = ['basic', 'parents', 'pickup', 'health', 'services', 'docs'];
                        const nextIdx = tabs.indexOf(formTab) + 1;
                        if (nextIdx < tabs.length) setFormTab(tabs[nextIdx]);
                      }}
                      className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl text-xs"
                    >
                      التالي ←
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-amber-200/50 cursor-pointer"
                  >
                    {editingChild ? 'حفظ التعديلات' : 'إتمام تسجيل الطفل'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- VIEW FULL CHILD DOSSIER MODAL -------------------- */}
      {viewingChild && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 lg:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95">
            {/* Dossier Header */}
            <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={viewingChild.photoUrl}
                  alt={viewingChild.fullName}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-extrabold">{viewingChild.fullName}</h3>
                  <p className="text-xs text-amber-100 mt-0.5">
                    رقم التسجيل: {viewingChild.registrationNumber} • تاريخ التسجيل: {formatArabicDate(viewingChild.registrationDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingChild(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Dossier Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {/* 1. Identity & Classroom */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">الفوج المسند:</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {classes.find(c => c.id === viewingChild.classId)?.name || 'غير محدد'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">تاريخ الميلاد والعمر:</span>
                  <span className="font-bold text-slate-800 text-xs">{calculateAge(viewingChild.birthDate).text}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">فصيلة الدم:</span>
                  <span className="font-bold text-rose-600 text-xs">{viewingChild.health.bloodType || 'غير محدد'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">حالة الاشتراك:</span>
                  <span className="font-bold text-emerald-600 text-xs">{formatTND(viewingChild.monthlyBaseFee)} / شهرياً</span>
                </div>
              </div>

              {/* 2. Parents */}
              <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-2xl space-y-2">
                <h4 className="font-bold text-xs text-sky-900">👨‍👩‍👧 بيانات الأولياء والعنوان:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">الأب:</span> <strong>{viewingChild.fatherName}</strong> ({viewingChild.fatherJob || 'موظف'})
                    <div className="text-sky-700 font-bold">📞 {viewingChild.fatherPhone}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">الأم:</span> <strong>{viewingChild.motherName}</strong> ({viewingChild.motherJob || 'موظفة'})
                    <div className="text-sky-700 font-bold">📞 {viewingChild.motherPhone}</div>
                  </div>
                  <div className="col-span-full pt-1 border-t border-sky-100/80">
                    <span className="text-slate-400">العنوان:</span> {viewingChild.address}
                  </div>
                </div>
              </div>

              {/* 3. Authorized pickup persons */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-xs text-amber-900">🛡️ الأشخاص المعتمدون للاستلام (الأمان):</h4>
                {viewingChild.authorizedPersons && viewingChild.authorizedPersons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingChild.authorizedPersons.map(p => (
                      <div key={p.id} className="p-2.5 bg-white rounded-xl border border-amber-100 text-xs">
                        <div className="font-bold text-slate-800">{p.name} ({p.relation})</div>
                        <div className="text-slate-500 text-[11px]">📞 {p.phone} {p.cin ? `| CIN: ${p.cin}` : ''}</div>
                        {p.notes && <div className="text-amber-800 text-[10px]">{p.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">يقتصر الاستلام على الأب والأم فقط.</p>
                )}
              </div>

              {/* 4. Health & Allergies */}
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                <h4 className="font-bold text-xs text-rose-900">🩺 الحالة الصحية واليقظة:</h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500">الحساسيات المسجلة:</span>{' '}
                    {viewingChild.health.allergies.length > 0 ? (
                      <strong className="text-rose-600">{viewingChild.health.allergies.join('، ')}</strong>
                    ) : (
                      <span className="text-emerald-700 font-medium">سليم ولا توجد حساسية معروفة</span>
                    )}
                  </div>
                  {viewingChild.health.emergencyNotes && (
                    <div className="text-slate-600 text-[11px]">
                      <span className="text-slate-400">ملاحظات الطوارئ:</span> {viewingChild.health.emergencyNotes}
                    </div>
                  )}
                  {viewingChild.health.familyDoctorName && (
                    <div className="text-[11px] text-slate-500">
                      طبيب الأطفال: {viewingChild.health.familyDoctorName} (📞 {viewingChild.health.familyDoctorPhone})
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Documents */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs text-slate-800">📑 الوثائق والمستندات:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {viewingChild.documents?.map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                      {doc.submitted ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                      <span className={doc.submitted ? 'font-medium text-slate-800' : 'text-slate-400'}>{doc.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dossier Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintChildCardData(viewingChild)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة بطاقة التلميذ المدرسية</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const child = viewingChild;
                    setViewingChild(null);
                    handleOpenEdit(child);
                  }}
                  className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-sky-200"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل البيانات</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChildToDelete(viewingChild);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-rose-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الملف</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingChild(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- CONFIRM DELETE MODAL (CUSTOM SAFE IN-APP DIALOG) -------------------- */}
      {childToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-rose-100 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800">تأكيد حذف ملف الطفل نهائياً</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف ملف الطفل <span className="font-extrabold text-rose-600">{childToDelete.fullName}</span> من المنظومة؟
              </p>
            </div>

            {/* Child Summary Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3 text-right">
              <img
                src={childToDelete.photoUrl}
                alt={childToDelete.fullName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-200"
              />
              <div className="flex-1 text-xs">
                <div className="font-extrabold text-slate-800">{childToDelete.fullName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  رقم التسجيل: <span className="font-mono">{childToDelete.registrationNumber}</span>
                </div>
                <div className="text-amber-700 font-bold text-[11px]">
                  الفوج: {classes.find(c => c.id === childToDelete.classId)?.name || 'غير محدد'}
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-[11px] text-rose-800 font-medium text-right flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>تنبيه: لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChildToDelete(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteChild(childToDelete.id);
                  if (viewingChild?.id === childToDelete.id) {
                    setViewingChild(null);
                  }
                  setChildToDelete(null);
                }}
                className="py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-rose-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الملف</span>
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
            setSelectedChildIds([]);
          }}
          initialSourceClassId={transferSourceClassId}
          preSelectedChildIds={selectedChildIds}
        />
      )}
    </div>
  );
};
