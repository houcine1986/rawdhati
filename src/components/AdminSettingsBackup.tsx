import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Building, 
  CheckCircle2, 
  HardDrive,
  Users,
  KeyRound,
  Lock,
  LogOut,
  UserPlus,
  Trash2,
  Edit3,
  ShieldAlert,
  Crown,
  Calculator,
  GraduationCap,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Shield,
  Check,
  CheckSquare,
  Square,
  Sliders,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { importBackupJSON } from '../utils/helpers';
import { 
  UserRole, 
  UserAccount, 
  AppTab, 
  UserPermissions, 
  ALL_SYSTEM_TABS, 
  GRANULAR_ACTIONS_LIST, 
  getDefaultPermissionsForRole 
} from '../types';

// ================= PERMISSIONS SELECTOR COMPONENT =================
interface PermissionsSelectorProps {
  role: UserRole;
  permissions: UserPermissions;
  onChange: (updated: UserPermissions) => void;
}

const PermissionsSelector: React.FC<PermissionsSelectorProps> = ({ role, permissions, onChange }) => {
  const [activeSubTab, setActiveSubTab] = useState<'tabs' | 'actions'>('tabs');

  const allowedTabs = permissions?.allowedTabs || [];

  const handleToggleTab = (tabId: AppTab) => {
    const isCurrentlyAllowed = allowedTabs.includes(tabId);
    let newTabs: AppTab[];
    if (isCurrentlyAllowed) {
      newTabs = allowedTabs.filter(t => t !== tabId);
    } else {
      newTabs = [...allowedTabs, tabId];
    }
    onChange({
      ...permissions,
      allowedTabs: newTabs
    });
  };

  const handleToggleAction = (actionKey: keyof Omit<UserPermissions, 'allowedTabs'>) => {
    const currentValue = permissions ? Boolean(permissions[actionKey]) : true;
    onChange({
      ...permissions,
      [actionKey]: !currentValue
    });
  };

  const handleSelectAll = () => {
    const allTabs: AppTab[] = ALL_SYSTEM_TABS.map(t => t.id);
    const allActions: Record<string, boolean> = {};
    GRANULAR_ACTIONS_LIST.forEach(a => {
      allActions[a.id] = true;
    });
    onChange({
      allowedTabs: allTabs,
      ...allActions
    });
  };

  const handleDeselectAll = () => {
    const allActions: Record<string, boolean> = {};
    GRANULAR_ACTIONS_LIST.forEach(a => {
      allActions[a.id] = false;
    });
    onChange({
      allowedTabs: ['dashboard'],
      ...allActions
    });
  };

  const handleResetToRoleDefault = () => {
    onChange(getDefaultPermissionsForRole(role));
  };

  const enabledTabsCount = allowedTabs.length;
  const totalTabsCount = ALL_SYSTEM_TABS.length;

  return (
    <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-4 space-y-3.5 mt-2 text-right" dir="rtl">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">
              صلاحيات الوصول والوحدات المتاحة
            </h4>
            <p className="text-[10px] text-slate-500">
              تم تفعيل {enabledTabsCount} من أصل {totalTabsCount} وحدات أساسية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
          >
            تحديد الكل
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
          >
            إلغاء الكل
          </button>
          <button
            type="button"
            onClick={handleResetToRoleDefault}
            className="px-2.5 py-1 bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 border border-[#6C5CE7]/20 text-[#6C5CE7] rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>الافتراضي لرتبة {role === 'director' ? 'المديرة' : role === 'admin' ? 'الإدارية' : 'المربية'}</span>
          </button>
        </div>
      </div>

      {role === 'director' && (
        <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-[11px] font-medium flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>المشرف العام (Super Admin) يملك وصولاً شاملاً لجميع الوحدات والإعدادات افتراضياً، ويمكنك تخصيص الاستثناءات حسب الحاجة.</span>
        </div>
      )}

      {/* Sub tabs: Modules vs Actions */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('tabs')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
            activeSubTab === 'tabs' ? 'bg-white text-[#6C5CE7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الوحدات والأقسام المسموح بها ({enabledTabsCount}/{totalTabsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('actions')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
            activeSubTab === 'actions' ? 'bg-white text-[#6C5CE7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          صلاحيات العمليات والإجراءات
        </button>
      </div>

      {/* Tab 1: Modules / System Tabs */}
      {activeSubTab === 'tabs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-0.5 custom-scrollbar">
          {ALL_SYSTEM_TABS.map((tab) => {
            const isAllowed = allowedTabs.includes(tab.id);
            return (
              <div
                key={tab.id}
                onClick={() => handleToggleTab(tab.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 select-none ${
                  isAllowed 
                    ? 'bg-white border-[#6C5CE7]/40 ring-1 ring-[#6C5CE7]/20 shadow-xs' 
                    : 'bg-white/60 border-slate-200 opacity-60 hover:opacity-100 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                    isAllowed ? 'bg-[#6C5CE7] text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {isAllowed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isAllowed ? 'text-slate-900' : 'text-slate-600'}`}>
                        {tab.label}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-medium">
                        {tab.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {tab.description}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                  isAllowed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isAllowed ? 'متاح' : 'محجوب'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Granular Actions */}
      {activeSubTab === 'actions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-0.5 custom-scrollbar">
          {GRANULAR_ACTIONS_LIST.map((action) => {
            const isEnabled = permissions ? Boolean(permissions[action.id]) : true;
            return (
              <div
                key={action.id}
                onClick={() => handleToggleAction(action.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 select-none ${
                  isEnabled 
                    ? 'bg-white border-sky-400/40 ring-1 ring-sky-400/20 shadow-xs' 
                    : 'bg-white/60 border-slate-200 opacity-60 hover:opacity-100 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                    isEnabled ? 'bg-sky-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {action.label}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                  isEnabled ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isEnabled ? 'مفعل' : 'معطل'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AdminSettingsBackup: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportDatabaseJSON, 
    importDatabaseJSON, 
    resetToDefaults,
    children,
    invoices,
    staff,
    classes,
    userAccounts,
    currentUser,
    isSuperAdmin,
    addUser,
    updateUser,
    deleteUser,
    updateUserPin,
    logout,
    switchUser,
    setIsUserManualOpen
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({ ...settings });
  
  // User Management State (Super Admin Only)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [quickPinUserId, setQuickPinUserId] = useState<string | null>(null);
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // New User Form State
  const [newUserForm, setNewUserForm] = useState<{
    fullName: string;
    role: UserRole;
    title: string;
    username: string;
    email: string;
    phone: string;
    pinCode: string;
    password: string;
    assignedClassName: string;
    avatar: string;
    permissions: UserPermissions;
  }>({
    fullName: '',
    role: 'educator',
    title: 'مربية ومعلمة قسم',
    username: '',
    email: '',
    phone: '',
    pinCode: '',
    password: '',
    assignedClassName: '',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    permissions: getDefaultPermissionsForRole('educator'),
  });

  const avatarPresets = [
    { label: 'سيدة 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { label: 'سيدة 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
    { label: 'سيدة 3', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
    { label: 'سيدة 4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'رجل 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'رجل 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importBackupJSON(
      file,
      (jsonStr) => {
        importDatabaseJSON(jsonStr);
      },
      (err) => {
        alert('فشل في قراءة الملف: ' + err);
      }
    );
  };

  const handleRoleChangeForNewUser = (role: UserRole) => {
    let defaultTitle = 'مربية ومعلمة قسم';
    if (role === 'director') defaultTitle = 'المديرة العامة والمشرفة الإدارية والتربوية';
    if (role === 'admin') defaultTitle = 'المسؤولة الإدارية والمالية وخلاص الاشتراكات';

    setNewUserForm(prev => ({
      ...prev,
      role,
      title: defaultTitle,
      permissions: getDefaultPermissionsForRole(role)
    }));
  };

  const handleRoleChangeForEditingUser = (role: UserRole) => {
    if (!editingUser) return;
    let defaultTitle = editingUser.title;
    if (role === 'director' && (!defaultTitle || defaultTitle === 'مربية ومعلمة قسم' || defaultTitle === 'المسؤولة الإدارية والمالية وخلاص الاشتراكات')) {
      defaultTitle = 'المديرة العامة والمشرفة الإدارية والتربوية';
    } else if (role === 'admin' && (!defaultTitle || defaultTitle === 'مربية ومعلمة قسم' || defaultTitle === 'المديرة العامة والمشرفة الإدارية والتربوية')) {
      defaultTitle = 'المسؤولة الإدارية والمالية وخلاص الاشتراكات';
    } else if (role === 'educator' && (!defaultTitle || defaultTitle === 'المديرة العامة والمشرفة الإدارية والتربوية' || defaultTitle === 'المسؤولة الإدارية والمالية وخلاص الاشتراكات')) {
      defaultTitle = 'مربية ومعلمة قسم';
    }

    setEditingUser({
      ...editingUser,
      role,
      title: defaultTitle,
      permissions: getDefaultPermissionsForRole(role)
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setStatusMessage({ type: 'error', text: 'فقط المشرف العام (Super Admin) يملك صلاحية إضافة مستخدمين' });
      return;
    }

    const res = addUser({
      fullName: newUserForm.fullName,
      role: newUserForm.role,
      title: newUserForm.title,
      username: newUserForm.username,
      email: newUserForm.email || undefined,
      phone: newUserForm.phone || undefined,
      pinCode: newUserForm.pinCode,
      password: newUserForm.password || `${newUserForm.username}2026`,
      assignedClassName: newUserForm.assignedClassName || undefined,
      avatar: newUserForm.avatar,
      permissions: newUserForm.permissions
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setNewUserForm({
        fullName: '',
        role: 'educator',
        title: 'مربية ومعلمة قسم',
        username: '',
        email: '',
        phone: '',
        pinCode: '',
        password: '',
        assignedClassName: '',
        avatar: avatarPresets[2].url,
        permissions: getDefaultPermissionsForRole('educator')
      });
      setStatusMessage({ type: 'success', text: `تمت إضافة المستخدم (${newUserForm.fullName}) وتخصيص صلاحياته بنجاح` });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'فشل في إضافة المستخدم' });
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!isSuperAdmin) {
      setStatusMessage({ type: 'error', text: 'فقط المشرف العام (Super Admin) يملك صلاحية تعديل المستخدمين' });
      return;
    }

    const res = updateUser(editingUser.id, {
      fullName: editingUser.fullName,
      role: editingUser.role,
      title: editingUser.title,
      username: editingUser.username,
      email: editingUser.email,
      phone: editingUser.phone,
      pinCode: editingUser.pinCode,
      password: editingUser.password,
      assignedClassName: editingUser.assignedClassName,
      avatar: editingUser.avatar,
      permissions: editingUser.permissions || getDefaultPermissionsForRole(editingUser.role)
    });

    if (res.success) {
      setEditingUser(null);
      setStatusMessage({ type: 'success', text: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'فشل في تحديث المستخدم' });
    }
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    if (!isSuperAdmin) {
      setStatusMessage({ type: 'error', text: 'فقط المشرف العام (Super Admin) يملك صلاحية حذف المستخدمين' });
      return;
    }

    const res = deleteUser(userToDelete.id);
    if (res.success) {
      setUserToDelete(null);
      setStatusMessage({ type: 'success', text: `تم حذف المستخدم (${userToDelete.fullName}) بنجاح` });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'تعذر حذف المستخدم' });
      setUserToDelete(null);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            <span>الإعدادات، حماية البيانات، والنسخ الاحتياطي (USB / Offline)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            بيانات المؤسسة، الأمان، تصدير واسترجاع قاعدة البيانات محلياً بدون الحاجة للإنترنت
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ الإعدادات بنجاح!</span>
          </div>
        )}
      </div>

      {/* Database & Offline Storage Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">قاعدة البيانات المحلية</div>
            <div className="text-xs text-emerald-600 font-bold mt-0.5">🟢 نشطة ومتزامنة (Local Offline)</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {children.length} أطفال • {staff.length} موظفين • {invoices.length} فواتير
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">حماية المعطيات الشخصية</div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">مشفرة ومحفوظة على جهاز الحاسوب فقط</div>
            <div className="text-[10px] text-slate-400">مطابقة لقانون حماية المعطيات الشخصية التونسي</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">النسخ الدوري الموصى به</div>
            <div className="text-xs text-amber-700 font-bold mt-0.5">تصدير أسبوعي على فلاش ديسك USB</div>
            <div className="text-[10px] text-slate-400">ملف JSON مضغوط وآمن</div>
          </div>
        </div>
      </div>

      {/* ----------------- SECTION 1: BACKUP & RESTORE ----------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <span>إدارة النسخ الاحتياطي والاستعادة (Backup & Restore)</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          يمكنك في أي وقت تنزيل نسخة كاملة لجميع السجلات (الأطفال، الحضور، المربيات، الفواتير، الأنشطة، والتقارير الصحية) وحفظها على قرص صلب خارجي أو مفتاح USB لاسترجاعها في حال تغيير الحاسوب.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Download JSON Backup */}
          <button
            onClick={exportDatabaseJSON}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية كاملة (JSON)</span>
          </button>

          {/* Import JSON Backup */}
          <label className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>استعادة نسخة سابقة من ملف</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset button */}
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من إعادة تعيين البيانات إلى البيانات الأولية النموذجية؟')) {
                resetToDefaults();
              }
            }}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 border border-rose-200 mr-auto transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تعيين البيانات النموذجية</span>
          </button>
        </div>
      </div>

      {/* ----------------- USER MANUAL & PDF DOCUMENTATION ----------------- */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-950 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-lg shadow-amber-400/20">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">دليل المستخدم الرسمي والتوثيق الشامل (PDF)</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  شامل لجميع الأقسام
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                ملف إرشادي منظم ومبسط باللغة العربية يشرح كافة وظائف المنظومة، الحسابات، الأمان، والتثبيت دون إنترنت، مع إمكانية التصفح التفاعلي أو الحفظ والطباعة المباشرة بصيغة PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsUserManualOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>عرض الدليل وطباعة PDF</span>
            </button>

            <a
              href="/USER_MANUAL.html"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              <span>فتح كنافذة مستقلة</span>
            </a>
          </div>
        </div>
      </div>

      {/* ----------------- SECTION 2: NURSERY SETTINGS FORM ----------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
          <Building className="w-5 h-5 text-amber-600" />
          <span>بيانات المؤسسة ومعاليم الاشتراكات الافتراضية</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الروضة / المحضنة *</label>
              <input
                type="text"
                required
                value={formData.nurseryName}
                onChange={(e) => setFormData({ ...formData, nurseryName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الترخيص الوزاري (وزارة المرأة والأسرة والطفولة) *</label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={formData.phone1}
                onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المعرف الجبائي (Matricule Fiscal)</label>
              <input
                type="text"
                value={formData.taxId || ''}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الكامل للروضة</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-700 mb-3">التعريفات الافتراضية للاشتراكات (د.ت)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">الاشتراك الأساسي (د.ت)</label>
                <input
                  type="number"
                  value={formData.defaultBaseFee}
                  onChange={(e) => setFormData({ ...formData, defaultBaseFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">معلوم المطعم (د.ت)</label>
                <input
                  type="number"
                  value={formData.defaultCanteenFee}
                  onChange={(e) => setFormData({ ...formData, defaultCanteenFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">معلوم النقل (د.ت)</label>
                <input
                  type="number"
                  value={formData.defaultTransportFee}
                  onChange={(e) => setFormData({ ...formData, defaultTransportFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-amber-200/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات الرسمية</span>
            </button>
          </div>
        </form>
      </div>

      {/* ----------------- SECTION 3: USER ACCOUNTS & SUPER ADMIN ACCESS CONTROL ----------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-800">
                    إدارة حسابات المستخدمين والتصنيفات (Accès & Rôles)
                  </h3>
                  {isSuperAdmin ? (
                    <span className="px-2.5 py-0.5 bg-[#6C5CE7] text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3" />
                      <span>صلاحيات المشرف العام (Super Admin)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      <span>عرض فقط (صلاحيات مقيدة)</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  فقط المشرف العام (Super Admin) يملك الإمكانية لإضافة مستخدم جديد، التعديل على البيانات أو الحذف
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#8E44AD] hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-200/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة مستخدم جديد</span>
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>قفل الجلسة والخروج</span>
            </button>
          </div>
        </div>

        {/* Permission Warning Banner for Non-Super Admin */}
        {!isSuperAdmin && (
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-black text-amber-950 block mb-0.5">
                تنبيه أمني حول الصلاحيات:
              </strong>
              <span>
                أنت مسجل حالياً بصفتك ({currentUser?.fullName} - {currentUser?.role === 'admin' ? 'إدارية مالية' : 'مربية'}). 
                إضافة المستخدمين الجدد وتعديل الصلاحيات أو حذف الحسابات محصور حصرياً بـ <strong>المشرف العام (Super Admin / المديرة العامة)</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Status notification */}
        {statusMessage && (
          <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* User Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userAccounts.map((user) => {
            const isCurrent = currentUser?.id === user.id;
            const isDirector = user.role === 'director';
            const isAdmin = user.role === 'admin';
            const isEducator = user.role === 'educator';
            const isPasswordVisible = !!showPasswords[user.id];
            const isEditingPin = quickPinUserId === user.id;

            return (
              <div
                key={user.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative ${
                  isCurrent 
                    ? 'border-[#6C5CE7] bg-gradient-to-b from-[#F9F9FF] to-white ring-2 ring-[#6C5CE7]/20 shadow-md' 
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow ${
                          isDirector ? 'bg-[#6C5CE7]' : isAdmin ? 'bg-[#0984E3]' : 'bg-[#00B894]'
                        }`}>
                          {isDirector ? <Crown className="w-3 h-3" /> : isAdmin ? <Calculator className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                        </div>
                      </div>

                      <div>
                        <div className="font-extrabold text-sm text-slate-900 leading-tight">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                          {user.title || (isDirector ? 'المديرة العامة' : isAdmin ? 'إدارية ومالية' : 'مربية ومعلمة قسم')}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full ${
                        isDirector 
                          ? 'bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/20' 
                          : isAdmin 
                          ? 'bg-[#0984E3]/10 text-[#0984E3] border border-[#0984E3]/20' 
                          : 'bg-[#00B894]/10 text-[#00B894] border border-[#00B894]/20'
                      }`}>
                        {isDirector ? 'Super Admin' : isAdmin ? 'إداري ومالي' : 'بيداغوجي وتربوي'}
                      </span>

                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full shadow-2xs">
                          الجلسة الحالية
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Section (if educator) */}
                  {user.assignedClassName && (
                    <div className="mb-3 px-3 py-1.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>القسم: {user.assignedClassName}</span>
                    </div>
                  )}

                  {/* User Credentials & Info Table */}
                  <div className="space-y-2 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 mb-4">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-medium">اسم الدخول:</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        {user.username}
                      </span>
                    </div>

                    {user.email && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-medium">البريد الإلكتروني:</span>
                        <span className="font-mono text-slate-600 truncate max-w-[170px]">
                          {user.email}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-medium">رمز PIN للدخول السريع:</span>
                      <span className="font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 tracking-widest">
                        {user.pinCode}
                      </span>
                    </div>

                    {user.password && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-medium">كلمة المرور:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-slate-700 font-bold">
                            {isPasswordVisible ? user.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="إظهار / إخفاء كلمة المرور"
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Granted Permissions Summary */}
                    <div className="pt-2 mt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#6C5CE7]" />
                          <span>الصلاحيات الممنوحة:</span>
                        </span>
                        <span className="text-[10px] font-extrabold text-[#6C5CE7] bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          {(user.permissions?.allowedTabs || getDefaultPermissionsForRole(user.role).allowedTabs).length} أقسام
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(user.permissions?.allowedTabs || getDefaultPermissionsForRole(user.role).allowedTabs).map((tab) => {
                          const tabLabels: Record<string, string> = {
                            children: 'الأطفال',
                            classes: 'الأقسام',
                            attendance: 'المناداة',
                            daily: 'اليومي',
                            meals: 'الوجبات',
                            finances: 'المالية',
                            transport: 'النقل',
                            reports: 'التقارير',
                            settings: 'الإعدادات'
                          };
                          return (
                            <span
                              key={tab}
                              className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-medium text-slate-700 shadow-2xs"
                            >
                              {tabLabels[tab] || tab}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick PIN Editing Box */}
                {isEditingPin ? (
                  <div className="space-y-2 p-3 bg-amber-50/80 rounded-2xl border border-amber-200 mb-3 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-amber-900">
                      أدخل رمز PIN الجديد (4 أرقام على الأقل):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        maxLength={6}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="مثال: 4567"
                        className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (updateUserPin(user.id, newPinInput)) {
                            setStatusMessage({ type: 'success', text: `تم تحديث رمز PIN للمستخدم (${user.fullName}) بنجاح` });
                            setQuickPinUserId(null);
                            setNewPinInput('');
                            setTimeout(() => setStatusMessage(null), 4000);
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickPinUserId(null);
                          setNewPinInput('');
                        }}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Action Buttons Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                  {/* Super Admin Action Controls */}
                  {isSuperAdmin ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7] text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="تعديل كافة بيانات المستخدم"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickPinUserId(user.id);
                          setNewPinInput(user.pinCode);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-xl transition-colors cursor-pointer"
                        title="تغيير رمز PIN السريع"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors cursor-pointer"
                          title="حذف هذا المستخدم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => switchUser(user.id)}
                          className="px-3 py-1.5 bg-[#6C5CE7]/10 hover:bg-[#6C5CE7] hover:text-white text-[#6C5CE7] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          title="التبديل إلى هذا الحساب"
                        >
                          دخول
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Non-Super Admin: Restricted Controls */
                    <div className="flex items-center justify-between w-full">
                      {isCurrent ? (
                        <button
                          type="button"
                          onClick={() => {
                            setQuickPinUserId(user.id);
                            setNewPinInput(user.pinCode);
                          }}
                          className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                          <span>تغيير رمز PIN الخاص بي</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mx-auto py-1">
                          <Lock className="w-3 h-3" />
                          <span>التعديل مقيد للمشرف العام فقط</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL 1: ADD NEW USER (SUPER ADMIN ONLY) ================= */}
      {isAddModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
            <div className="p-5 bg-gradient-to-r from-[#6C5CE7] to-[#8E44AD] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">إضافة مستخدم جديد للمنظومة</h3>
                  <p className="text-xs text-indigo-100">حدد الصنف الوظيفي، بيانات الدخول وكلمة المرور</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-right">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  تصنيف ورتبة المستخدم (Role):
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChangeForNewUser('director')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      newUserForm.role === 'director'
                        ? 'border-[#6C5CE7] bg-[#F9F9FF] ring-2 ring-[#6C5CE7]/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#6C5CE7] mb-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>مديرة عامة</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Super Admin (كامل الصلاحيات)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForNewUser('admin')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      newUserForm.role === 'admin'
                        ? 'border-[#0984E3] bg-sky-50/50 ring-2 ring-[#0984E3]/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#0984E3] mb-1">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>إدارية مالية</span>
                    </div>
                    <p className="text-[10px] text-slate-500">استخلاص وفواتير ونقل</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForNewUser('educator')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      newUserForm.role === 'educator'
                        ? 'border-[#00B894] bg-emerald-50/50 ring-2 ring-[#00B894]/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#00B894] mb-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>مربية قسم</span>
                    </div>
                    <p className="text-[10px] text-slate-500">حضور وتقييم بيداغوجي</p>
                  </button>
                </div>
              </div>

              {/* Full Name & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم واللقب بالكامل *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: منية الوسلاتي"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المسمى الوظيفي
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مربية فوج التمهيدي"
                    value={newUserForm.title}
                    onChange={(e) => setNewUserForm({ ...newUserForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]"
                  />
                </div>
              </div>

              {/* Assigned Class (if Educator) */}
              {newUserForm.role === 'educator' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القسم / الفوج المعين للمربية
                  </label>
                  <select
                    value={newUserForm.assignedClassName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, assignedClassName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]"
                  >
                    <option value="">-- بدون تعيين قسم محدد --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={`${cls.name} (${cls.nameFr || ''})`}>
                        {cls.name} ({cls.ageGroup})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم تسجيل الدخول (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: monia"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    placeholder="monia@rawdet-elbaraem.tn"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#6C5CE7]"
                  />
                </div>
              </div>

              {/* PIN Code & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-bold text-indigo-950 mb-1">
                    رمز PIN للدخول السريع (4 أرقام) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="مثال: 2233"
                    value={newUserForm.pinCode}
                    onChange={(e) => setNewUserForm({ ...newUserForm, pinCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-[#6C5CE7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-950 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: password2026"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#6C5CE7]"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر الصورة الرمزية (Avatar)
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, avatar: preset.url })}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        newUserForm.avatar === preset.url ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-11 h-11 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permissions Selector */}
              <div className="pt-2">
                <PermissionsSelector
                  role={newUserForm.role}
                  permissions={newUserForm.permissions}
                  onChange={(updated) => setNewUserForm({ ...newUserForm, permissions: updated })}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد إضافة المستخدم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT USER (SUPER ADMIN ONLY) ================= */}
      {editingUser && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
            <div className="p-5 bg-[#6C5CE7] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">تعديل بيانات وصلاحيات المستخدم</h3>
                  <p className="text-xs text-indigo-100">{editingUser.fullName} ({editingUser.username})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-right">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  رتبة وصلاحيات الحساب:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChangeForEditingUser('director')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      editingUser.role === 'director'
                        ? 'border-[#6C5CE7] bg-[#F9F9FF] ring-2 ring-[#6C5CE7]/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#6C5CE7] mb-1">
                      <Crown className="w-3.5 h-3.5" />
                      <span>مديرة عامة</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Super Admin</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForEditingUser('admin')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      editingUser.role === 'admin'
                        ? 'border-[#0984E3] bg-sky-50/50 ring-2 ring-[#0984E3]/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#0984E3] mb-1">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>إدارية مالية</span>
                    </div>
                    <p className="text-[10px] text-slate-500">مالية واستخلاص</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChangeForEditingUser('educator')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      editingUser.role === 'educator'
                        ? 'border-[#00B894] bg-emerald-50/50 ring-2 ring-[#00B894]/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#00B894] mb-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>مربية قسم</span>
                    </div>
                    <p className="text-[10px] text-slate-500">بيداغوجي وتربوي</p>
                  </button>
                </div>
              </div>

              {/* Full Name & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={editingUser.title || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Assigned Class (for educators) */}
              {editingUser.role === 'educator' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم المعين</label>
                  <select
                    value={editingUser.assignedClassName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, assignedClassName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="">-- بدون تعيين قسم --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={`${cls.name} (${cls.nameFr || ''})`}>
                        {cls.name} ({cls.ageGroup})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم تسجيل الدخول (Username) *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* PIN & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">رمز PIN للدخول السريع *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={editingUser.pinCode}
                    onChange={(e) => setEditingUser({ ...editingUser, pinCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center tracking-widest text-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">كلمة المرور</label>
                  <input
                    type="text"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تغيير الصورة الرمزية</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, avatar: preset.url })}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        editingUser.avatar === preset.url ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/30 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-11 h-11 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permissions Selector for Editing User */}
              <div className="pt-2">
                <PermissionsSelector
                  role={editingUser.role}
                  permissions={editingUser.permissions || getDefaultPermissionsForRole(editingUser.role)}
                  onChange={(updated) => setEditingUser({ ...editingUser, permissions: updated })}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CONFIRM DELETE USER (SUPER ADMIN ONLY) ================= */}
      {userToDelete && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">
                تأكيد حذف حساب المستخدم
              </h3>
              <p className="text-xs text-slate-500">
                هل أنت متأكد من رغبتك في حذف حساب المستخدم <strong>«{userToDelete.fullName}»</strong>؟
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">اسم المستخدم:</span>
                <span className="font-mono font-bold text-slate-700">{userToDelete.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الصفة:</span>
                <span className="font-bold text-[#6C5CE7]">
                  {userToDelete.role === 'director' ? 'Super Admin' : userToDelete.role === 'admin' ? 'إدارية مالية' : 'مربية'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer"
              >
                تأكيد الحذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
