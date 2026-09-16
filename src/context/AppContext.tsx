import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Child, 
  ClassRoom, 
  StaffMember, 
  DailyAttendance, 
  Invoice, 
  Payment,
  Expense,
  HealthIncident, 
  WeeklyMealPlan, 
  ActivitySchedule, 
  ChildEvaluation, 
  BusRoute, 
  ParentNotification, 
  NurserySettings, 
  UserAccount,
  UserRole,
  AppTab,
  UserPermissions,
  getDefaultPermissionsForRole
} from '../types';
import { 
  getLicenseStatus, 
  verifyAndApplyKey, 
  LicenseStatus 
} from '../utils/licenseManager';
import { 
  initialSettings, 
  initialUsers, 
  initialClasses, 
  initialStaff, 
  initialChildren, 
  initialAttendance, 
  initialInvoices, 
  initialExpenses,
  initialIncidents, 
  initialWeeklyMenu, 
  initialActivities, 
  initialEvaluations, 
  initialBusRoutes, 
  initialNotifications 
} from '../data/initialData';

interface AppContextType {
  // License & Activation
  license: LicenseStatus;
  refreshLicense: () => void;
  activateWithKey: (key: string, clientName?: string) => { success: boolean; message: string; type?: string; expiryDate?: string };
  isActivationModalOpen: boolean;
  setIsActivationModalOpen: (open: boolean) => void;

  // Navigation & View state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Current user & authentication
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (target: UserRole | string, credential?: string, method?: 'pin' | 'password' | 'quick') => { success: boolean; error?: string };
  logout: () => void;
  userAccounts: UserAccount[];
  switchUser: (target: UserRole | string, pin?: string) => boolean;
  updateUserPin: (roleOrId: UserRole | string, newPin: string) => boolean;
  addUser: (userData: Omit<UserAccount, 'id'>) => { success: boolean; error?: string; user?: UserAccount };
  updateUser: (id: string, updatedData: Partial<UserAccount>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
  hasTabPermission: (tab: AppTab | string) => boolean;
  hasActionPermission: (action: keyof Omit<UserPermissions, 'allowedTabs'>) => boolean;

  // Nursery Settings
  settings: NurserySettings;
  updateSettings: (newSettings: Partial<NurserySettings>) => void;

  // Children
  children: Child[];
  addChild: (child: Omit<Child, 'id' | 'registrationNumber'>) => Child;
  updateChild: (id: string, updated: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  getChildById: (id: string) => Child | undefined;
  transferChildrenToClass: (childIds: string[], targetClassId: string) => void;

  // Classes
  classes: ClassRoom[];
  addClass: (cls: Omit<ClassRoom, 'id'>) => void;
  updateClass: (id: string, updated: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  // Staff
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  // Attendance
  attendance: DailyAttendance[];
  recordAttendance: (record: Omit<DailyAttendance, 'id'>) => void;
  bulkRecordAttendance: (records: DailyAttendance[]) => void;
  updateAttendance: (id: string, updated: Partial<DailyAttendance>) => void;

  // Invoices & Payments (Revenues)
  invoices: Invoice[];
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'remainingAmount' | 'payments'>) => Invoice;
  addPaymentToInvoice: (invoiceId: string, paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'invoiceId' | 'childId'>) => Payment | null;
  generateMonthlyInvoices: (month: string) => number;
  deleteInvoice: (id: string) => void;

  // Expenses & Outflows (المصاريف والنفقات)
  expenses: Expense[];
  addExpense: (expenseData: Omit<Expense, 'id' | 'expenseNumber'>) => Expense;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  bulkAddExpenses: (newExpenses: Expense[]) => void;
  generateSalaryExpenses: (month: string) => number;

  // Health & Incidents
  incidents: HealthIncident[];
  addIncident: (inc: Omit<HealthIncident, 'id'>) => void;
  weeklyMenu: WeeklyMealPlan;
  updateWeeklyMenu: (menu: WeeklyMealPlan) => void;

  // Pedagogy & Activities & Evaluations
  activities: ActivitySchedule[];
  addActivity: (act: Omit<ActivitySchedule, 'id'>) => void;
  updateActivity: (id: string, updated: Partial<ActivitySchedule>) => void;
  deleteActivity: (id: string) => void;

  evaluations: ChildEvaluation[];
  saveEvaluation: (evalData: ChildEvaluation) => void;

  // School Transport
  busRoutes: BusRoute[];
  addBusRoute: (route: Omit<BusRoute, 'id'>) => void;
  updateBusRoute: (id: string, updated: Partial<BusRoute>) => void;

  // Parent notifications
  notifications: ParentNotification[];
  addNotification: (notif: Omit<ParentNotification, 'id'>) => void;
  deleteNotification: (id: string) => void;

  // Printable Modals Target State
  printReceiptData: { invoice: Invoice; payment: Payment; child: Child } | null;
  setPrintReceiptData: (data: { invoice: Invoice; payment: Payment; child: Child } | null) => void;
  printChildCardData: Child | null;
  setPrintChildCardData: (child: Child | null) => void;
  printEvaluationData: { evaluation: ChildEvaluation; child: Child } | null;
  setPrintEvaluationData: (data: { evaluation: ChildEvaluation; child: Child } | null) => void;
  printAttendanceClassId: string | null;
  setPrintAttendanceClassId: (classId: string | null) => void;

  // User Manual Guide Modal State
  isUserManualOpen: boolean;
  setIsUserManualOpen: (open: boolean) => void;

  // Backup & Restore
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;
  resetToDefaults: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  setToastMessage: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'rawdati_nursery_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const loadStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // License & Activation
  const [license, setLicense] = useState<LicenseStatus>(() => getLicenseStatus());
  const [isActivationModalOpen, setIsActivationModalOpen] = useState<boolean>(false);

  const refreshLicense = () => {
    setLicense(getLicenseStatus());
  };

  const activateWithKey = (key: string, clientName?: string) => {
    const res = verifyAndApplyKey(key, clientName || settings.nurseryName);
    if (res.success) {
      refreshLicense();
      showToast(res.message);
    }
    return res;
  };

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => loadStored('users', initialUsers));
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<NurserySettings>(() => loadStored('settings', initialSettings));
  const [classes, setClasses] = useState<ClassRoom[]>(() => loadStored('classes', initialClasses));
  const [staff, setStaff] = useState<StaffMember[]>(() => loadStored('staff', initialStaff));
  const [childrenList, setChildrenList] = useState<Child[]>(() => loadStored('children', initialChildren));
  const [attendance, setAttendance] = useState<DailyAttendance[]>(() => loadStored('attendance', initialAttendance));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStored('invoices', initialInvoices));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStored('expenses', initialExpenses));
  const [incidents, setIncidents] = useState<HealthIncident[]>(() => loadStored('incidents', initialIncidents));
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMealPlan>(() => loadStored('menu', initialWeeklyMenu));
  const [activities, setActivities] = useState<ActivitySchedule[]>(() => loadStored('activities', initialActivities));
  const [evaluations, setEvaluations] = useState<ChildEvaluation[]>(() => loadStored('evaluations', initialEvaluations));
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(() => loadStored('routes', initialBusRoutes));
  const [notifications, setNotifications] = useState<ParentNotification[]>(() => loadStored('notifications', initialNotifications));

  // Print modals state
  const [printReceiptData, setPrintReceiptData] = useState<{ invoice: Invoice; payment: Payment; child: Child } | null>(null);
  const [printChildCardData, setPrintChildCardData] = useState<Child | null>(null);
  const [printEvaluationData, setPrintEvaluationData] = useState<{ evaluation: ChildEvaluation; child: Child } | null>(null);
  const [printAttendanceClassId, setPrintAttendanceClassId] = useState<string | null>(null);
  const [isUserManualOpen, setIsUserManualOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'children', JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'menu', JSON.stringify(weeklyMenu));
  }, [weeklyMenu]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'routes', JSON.stringify(busRoutes));
  }, [busRoutes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Auth operations
  const isSuperAdmin = currentUser?.role === 'director';

  const login = (target: UserRole | string, credential?: string, method: 'pin' | 'password' | 'quick' = 'pin'): { success: boolean; error?: string } => {
    // Target can be a role ('director', 'admin', 'educator') or a specific user id ('user-1', etc.) or username
    const user = userAccounts.find(u => u.id === target || u.role === target || u.username.toLowerCase() === target.toLowerCase());
    if (!user) {
      return { success: false, error: 'المستخدم غير مسجل بالنظام' };
    }

    if (method === 'pin' && credential) {
      if (credential !== user.pinCode) {
        return { success: false, error: 'رمز الدخول السري (PIN) غير صحيح' };
      }
    } else if (method === 'password' && credential) {
      if (user.password && credential !== user.password) {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`مرحباً بك! تم تسجيل الدخول بنجاح بصفتك: ${user.fullName}`);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('تم تسجيل الخروج وقفل الجلسة بأمان');
  };

  const switchUser = (target: UserRole | string, _pin?: string): boolean => {
    const user = userAccounts.find(u => u.id === target || u.role === target);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      showToast(`تم التبديل بنجاح إلى حساب: ${user.fullName}`);
      return true;
    }
    return false;
  };

  const updateUserPin = (roleOrId: UserRole | string, newPin: string): boolean => {
    if (!newPin || newPin.length < 4) {
      showToast('يجب أن يتكون رمز PIN من 4 أرقام على الأقل');
      return false;
    }
    setUserAccounts(prev => prev.map(u => (u.id === roleOrId || u.role === roleOrId) ? { ...u, pinCode: newPin } : u));
    if (currentUser?.id === roleOrId || currentUser?.role === roleOrId) {
      setCurrentUser(prev => prev ? { ...prev, pinCode: newPin } : prev);
    }
    showToast('تم تغيير رمز الدخول السري بنجاح');
    return true;
  };

  // Permissions checkers
  const hasTabPermission = (tab: AppTab | string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'director') return true;
    if (currentUser.permissions?.allowedTabs) {
      return currentUser.permissions.allowedTabs.includes(tab as AppTab);
    }
    const defaultPerms = getDefaultPermissionsForRole(currentUser.role);
    return defaultPerms.allowedTabs.includes(tab as AppTab);
  };

  const hasActionPermission = (action: keyof Omit<UserPermissions, 'allowedTabs'>): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'director') return true;
    if (currentUser.permissions && currentUser.permissions[action] !== undefined) {
      return Boolean(currentUser.permissions[action]);
    }
    const defaultPerms = getDefaultPermissionsForRole(currentUser.role);
    return Boolean(defaultPerms[action]);
  };

  // Super Admin Only: Add new user
  const addUser = (userData: Omit<UserAccount, 'id'>): { success: boolean; error?: string; user?: UserAccount } => {
    if (!isSuperAdmin) {
      showToast('خطأ أمني: فقط المشرف العام (Super Admin) يملك صلاحية إضافة مستخدمين');
      return { success: false, error: 'فقط المشرف العام (Super Admin) يملك صلاحية إضافة مستخدم جديد' };
    }

    if (!userData.fullName.trim()) {
      return { success: false, error: 'يرجى إدخال اسم المستخدم بالكامل' };
    }
    if (!userData.username.trim()) {
      return { success: false, error: 'يرجى إدخال اسم تسجيل الدخول' };
    }
    if (userAccounts.some(u => u.username.toLowerCase() === userData.username.trim().toLowerCase())) {
      return { success: false, error: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر' };
    }
    if (!userData.pinCode || userData.pinCode.length < 4) {
      return { success: false, error: 'رمز PIN يجب أن يتكون من 4 أرقام على الأقل' };
    }

    const assignedPermissions: UserPermissions = userData.permissions 
      ? userData.permissions 
      : getDefaultPermissionsForRole(userData.role);

    const newUser: UserAccount = {
      ...userData,
      id: `user-${Date.now()}`,
      username: userData.username.trim().toLowerCase(),
      createdAt: new Date().toISOString().split('T')[0],
      permissions: assignedPermissions,
      avatar: userData.avatar || (userData.role === 'director' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : userData.role === 'admin'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80')
    };

    setUserAccounts(prev => [...prev, newUser]);
    showToast(`تمت إضافة المستخدم الجديد (${newUser.fullName}) بنجاح`);
    return { success: true, user: newUser };
  };

  // Super Admin Only: Update existing user
  const updateUser = (id: string, updatedData: Partial<UserAccount>): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      showToast('خطأ أمني: فقط المشرف العام (Super Admin) يملك صلاحية تعديل المستخدمين');
      return { success: false, error: 'فقط المشرف العام (Super Admin) يملك صلاحية تعديل بيانات المستخدمين' };
    }

    const existingUser = userAccounts.find(u => u.id === id);
    if (!existingUser) {
      return { success: false, error: 'المستخدم غير موجود بالنظام' };
    }

    if (updatedData.username && updatedData.username.trim().toLowerCase() !== existingUser.username.toLowerCase()) {
      if (userAccounts.some(u => u.id !== id && u.username.toLowerCase() === updatedData.username?.trim().toLowerCase())) {
        return { success: false, error: 'اسم الدخول مستخدم بالفعل لمستخدم آخر' };
      }
    }

    setUserAccounts(prev => prev.map(u => {
      if (u.id !== id) return u;
      const targetRole = updatedData.role || u.role;
      const targetPermissions = updatedData.permissions 
        ? updatedData.permissions 
        : (updatedData.role && updatedData.role !== u.role 
            ? getDefaultPermissionsForRole(updatedData.role) 
            : (u.permissions || getDefaultPermissionsForRole(u.role)));

      return {
        ...u,
        ...updatedData,
        role: targetRole,
        permissions: targetPermissions,
        username: updatedData.username ? updatedData.username.trim().toLowerCase() : u.username
      };
    }));

    if (currentUser?.id === id) {
      setCurrentUser(prev => {
        if (!prev) return prev;
        const targetRole = updatedData.role || prev.role;
        const targetPermissions = updatedData.permissions 
          ? updatedData.permissions 
          : (updatedData.role && updatedData.role !== prev.role 
              ? getDefaultPermissionsForRole(updatedData.role) 
              : (prev.permissions || getDefaultPermissionsForRole(prev.role)));
        return {
          ...prev,
          ...updatedData,
          role: targetRole,
          permissions: targetPermissions,
          username: updatedData.username ? updatedData.username.trim().toLowerCase() : prev.username
        };
      });
    }
    showToast(`تم تحديث بيانات وصلاحيات المستخدم (${updatedData.fullName || existingUser.fullName}) بنجاح`);
    return { success: true };
  };

  // Super Admin Only: Delete user
  const deleteUser = (id: string): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      showToast('خطأ أمني: فقط المشرف العام (Super Admin) يملك صلاحية حذف المستخدمين');
      return { success: false, error: 'فقط المشرف العام (Super Admin) يملك صلاحية حذف المستخدمين' };
    }

    if (currentUser?.id === id) {
      showToast('تنبيه أمني: لا يمكنك حذف الحساب النشط حالياً في الجلسة');
      return { success: false, error: 'لا يمكن حذف الحساب النشط حالياً بالجلسة' };
    }

    const targetUser = userAccounts.find(u => u.id === id);
    if (!targetUser) {
      return { success: false, error: 'المستخدم غير موجود بالنظام' };
    }

    if (targetUser.role === 'director') {
      const directorCount = userAccounts.filter(u => u.role === 'director').length;
      if (directorCount <= 1) {
        showToast('تحذير: يجب الإبقاء على حساب مدير عام (Super Admin) واحد على الأقل');
        return { success: false, error: 'يجب الإبقاء على حساب مدير عام (Super Admin) واحد على الأقل' };
      }
    }

    setUserAccounts(prev => prev.filter(u => u.id !== id));
    showToast(`تم حذف حساب المستخدم (${targetUser.fullName}) بنجاح`);
    return { success: true };
  };

  const updateSettings = (newSettings: Partial<NurserySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('تم تحديث إعدادات المؤسسة بنجاح');
  };

  // Children operations
  const addChild = (childData: Omit<Child, 'id' | 'registrationNumber'>): Child => {
    const year = new Date().getFullYear();
    const count = childrenList.length + 1;
    const regNum = `RWD-${year}-${String(count).padStart(3, '0')}`;
    const newChild: Child = {
      ...childData,
      id: `child-${Date.now()}`,
      registrationNumber: regNum,
    };
    setChildrenList(prev => [newChild, ...prev]);
    showToast(`تم تسجيل ملف الطفل: ${newChild.fullName} بنجاح`);
    return newChild;
  };

  const updateChild = (id: string, updated: Partial<Child>) => {
    setChildrenList(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    showToast('تم حفظ تعديلات ملف الطفل بنجاح');
  };

  const deleteChild = (id: string) => {
    const child = childrenList.find(c => c.id === id);
    setChildrenList(prev => prev.filter(c => c.id !== id));
    showToast(`تم حذف ملف الطفل ${child?.fullName || ''}`);
  };

  const getChildById = (id: string) => childrenList.find(c => c.id === id);

  const transferChildrenToClass = (childIds: string[], targetClassId: string) => {
    if (!childIds || childIds.length === 0) return;
    const targetClass = classes.find(c => c.id === targetClassId);
    const targetClassName = targetClass?.name || 'الفوج الجديد';
    setChildrenList(prev => prev.map(child => {
      if (childIds.includes(child.id)) {
        return {
          ...child,
          classId: targetClassId
        };
      }
      return child;
    }));
    showToast(`تم نقل ${childIds.length} طفل بنجاح إلى: ${targetClassName}`);
  };

  // Classes operations
  const addClass = (clsData: Omit<ClassRoom, 'id'>) => {
    const newCls: ClassRoom = {
      ...clsData,
      id: `class-${Date.now()}`
    };
    setClasses(prev => [...prev, newCls]);
    showToast(`تم إنشاء الفوج: ${newCls.name} بنجاح`);
  };

  const updateClass = (id: string, updated: Partial<ClassRoom>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    showToast('تم تحديث بيانات الفوج بنجاح');
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    showToast('تم حذف الفوج بنجاح');
  };

  // Staff operations
  const addStaff = (memberData: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...memberData,
      id: `staff-${Date.now()}`
    };
    setStaff(prev => [...prev, newStaff]);
    showToast(`تم إضافة المربية/الموظفة: ${newStaff.fullName} بنجاح`);
  };

  const updateStaff = (id: string, updated: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast('تم تحديث ملف الموظفة بنجاح');
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    showToast('تم حذف ملف الموظفة');
  };

  // Attendance operations
  const recordAttendance = (record: Omit<DailyAttendance, 'id'>) => {
    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.date === record.date && a.childId === record.childId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...record };
        return updated;
      }
      return [{ ...record, id: `att-${Date.now()}` }, ...prev];
    });
    showToast('تم تسجيل الحضور/الانصراف بنجاح');
  };

  const bulkRecordAttendance = (records: DailyAttendance[]) => {
    setAttendance(prev => {
      const map = new Map<string, DailyAttendance>();
      prev.forEach(item => map.set(`${item.date}_${item.childId}`, item));
      records.forEach(rec => map.set(`${rec.date}_${rec.childId}`, rec));
      return Array.from(map.values());
    });
    showToast('تم حفظ سجل حضور الفوج بالكامل بنجاح');
  };

  const updateAttendance = (id: string, updated: Partial<DailyAttendance>) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  // Financial & Invoicing operations
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'remainingAmount' | 'payments'>): Invoice => {
    const count = invoices.length + 1;
    const invNumber = `FAC-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const newInv: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      paidAmount: 0,
      remainingAmount: invoiceData.totalAmount,
      payments: [],
    };
    setInvoices(prev => [newInv, ...prev]);
    showToast(`تم إنشاء الفاتورة رقم ${invNumber} بنجاح`);
    return newInv;
  };

  const addPaymentToInvoice = (invoiceId: string, paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'invoiceId' | 'childId'>): Payment | null => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return null;

    const receiptNum = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      invoiceId: inv.id,
      childId: inv.childId,
    };

    const newPaidAmount = inv.paidAmount + newPayment.amount;
    const newRemaining = Math.max(0, inv.totalAmount - newPaidAmount);
    const newStatus = newRemaining <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'unpaid';

    setInvoices(prev => prev.map(item => {
      if (item.id === invoiceId) {
        return {
          ...item,
          paidAmount: newPaidAmount,
          remainingAmount: newRemaining,
          status: newStatus,
          payments: [...item.payments, newPayment],
        };
      }
      return item;
    }));

    showToast(`تم تسجيل الدفعة وإصدار سند القبض رقم ${receiptNum}`);
    return newPayment;
  };

  const generateMonthlyInvoices = (month: string): number => {
    let createdCount = 0;
    const newInvoices: Invoice[] = [];

    childrenList.filter(c => c.status === 'active').forEach(child => {
      // Check if already exists for this month
      const exists = invoices.some(i => i.childId === child.id && i.month === month);
      if (!exists) {
        const items = [
          { id: `itm-base-${Date.now()}`, description: `الاشتراك الشهري الأساسي - شهر ${month}`, amount: child.monthlyBaseFee || settings.defaultBaseFee }
        ];

        if (child.services.canteen) {
          items.push({ id: `itm-canteen-${Date.now()}`, description: 'اشتراك المطعم والوجبات الصحية', amount: settings.defaultCanteenFee });
        }
        if (child.services.transport) {
          items.push({ id: `itm-trans-${Date.now()}`, description: 'اشتراك النقل المدرسي (حافلة الروضة)', amount: settings.defaultTransportFee });
        }
        if (child.services.eveningCare) {
          items.push({ id: `itm-care-${Date.now()}`, description: 'حراسة مسائية ممتدة', amount: 30 });
        }
        if (child.services.extracurricularClubs && child.services.extracurricularClubs.length > 0) {
          child.services.extracurricularClubs.forEach((club, idx) => {
            items.push({ id: `itm-club-${idx}-${Date.now()}`, description: `نادي: ${club}`, amount: 35 });
          });
        }

        const subtotal = items.reduce((acc, itm) => acc + itm.amount, 0);
        const discountAmount = child.discountPercent > 0 ? (subtotal * child.discountPercent) / 100 : 0;
        const totalAmount = subtotal - discountAmount;

        const count = invoices.length + createdCount + 1;
        const invNumber = `FAC-${month.replace('-', '')}-${String(count).padStart(3, '0')}`;

        newInvoices.push({
          id: `inv-gen-${child.id}-${month}`,
          invoiceNumber: invNumber,
          childId: child.id,
          month,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: `${month}-10`,
          items,
          subtotal,
          discountAmount,
          discountReason: child.discountReason || (child.discountPercent > 0 ? `تخفيض ${child.discountPercent}%` : undefined),
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          status: 'unpaid',
          payments: [],
          notes: `فاتورة تم توليدها تلقائياً لشهر ${month}`,
        });
        createdCount++;
      }
    });

    if (newInvoices.length > 0) {
      setInvoices(prev => [...newInvoices, ...prev]);
      showToast(`تم توليد ${newInvoices.length} فاتورة لشهر ${month} بنجاح`);
    } else {
      showToast(`جميع أطفال الروضة لديهم فواتير مسجلة لشهر ${month}`);
    }

    return createdCount;
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    showToast('تم حذف الفاتورة بنجاح');
  };

  // Expenses & Outflows (المصاريف والنفقات)
  const addExpense = (expenseData: Omit<Expense, 'id' | 'expenseNumber'>): Expense => {
    const year = expenseData.date ? expenseData.date.split('-')[0] : new Date().getFullYear().toString();
    const count = expenses.length + 1;
    const expNum = `EXP-${year}-${String(count).padStart(3, '0')}`;

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      expenseNumber: expNum,
    };

    setExpenses(prev => [newExpense, ...prev]);
    showToast(`تم تسجيل المصروف رقم ${expNum} بمبلغ ${newExpense.amount.toFixed(3)} د.ت بنجاح`);
    return newExpense;
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updated } : exp));
    showToast('تم تعديل بيانات المصروف بنجاح');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    showToast('تم حذف المصروف بنجاح');
  };

  const bulkAddExpenses = (newExpenses: Expense[]) => {
    setExpenses(prev => [...newExpenses, ...prev]);
    showToast(`تمت إضافة ${newExpenses.length} مصاريف مجمعة`);
  };

  const generateSalaryExpenses = (month: string): number => {
    const activeStaff = staff.filter(s => s.status === 'active');
    const existingSalaryExps = expenses.filter(e => e.category === 'salaries' && e.date.startsWith(month));
    let count = 0;
    const toAdd: Expense[] = [];

    activeStaff.forEach(member => {
      const alreadyPaid = existingSalaryExps.some(e => e.notes?.includes(member.id) || e.beneficiary.includes(member.fullName));
      if (!alreadyPaid) {
        const expNum = `EXP-${month.replace('-', '')}-SAL-${String(count + 1).padStart(2, '0')}`;
        toAdd.push({
          id: `exp-sal-${member.id}-${month}-${Date.now()}`,
          expenseNumber: expNum,
          title: `راتب شهر ${month} - ${member.fullName} (${member.role === 'educator' ? 'مربية' : member.role === 'cook' ? 'طباخة' : member.role === 'driver' ? 'سائق' : 'إطار'})`,
          category: 'salaries',
          amount: member.salary || 650,
          date: `${month}-01`,
          paymentMethod: 'bank_transfer',
          beneficiary: member.fullName,
          notes: `معرف الموظف: ${member.id} - ب.ت.و: ${member.cin}`,
          recordedBy: currentUser.fullName,
          isRecurring: true,
          recurringFrequency: 'monthly',
        });
        count++;
      }
    });

    if (toAdd.length > 0) {
      setExpenses(prev => [...toAdd, ...prev]);
      showToast(`تم توليد ${toAdd.length} إذن صرف رواتب لشهر ${month}`);
    } else {
      showToast(`تم صرف رواتب جميع الموظفين لشهر ${month} مسبقاً`);
    }

    return count;
  };

  // Health incidents
  const addIncident = (incData: Omit<HealthIncident, 'id'>) => {
    const newInc: HealthIncident = {
      ...incData,
      id: `inc-${Date.now()}`
    };
    setIncidents(prev => [newInc, ...prev]);
    showToast('تم تسجيل الحادث في السجل الصحي وإشعار الإدارة');
  };

  const updateWeeklyMenu = (menu: WeeklyMealPlan) => {
    setWeeklyMenu(menu);
    showToast('تم تحديث جدول الوجبات الأسبوعي بنجاح');
  };

  // Activities & Evaluations
  const addActivity = (actData: Omit<ActivitySchedule, 'id'>) => {
    const newAct: ActivitySchedule = {
      ...actData,
      id: `act-${Date.now()}`
    };
    setActivities(prev => [...prev, newAct]);
    showToast('تمت إضافة النشاط التربوي بنجاح');
  };

  const updateActivity = (id: string, updated: Partial<ActivitySchedule>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    showToast('تم تعديل النشاط التربوي');
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    showToast('تم حذف النشاط');
  };

  const saveEvaluation = (evalData: ChildEvaluation) => {
    setEvaluations(prev => {
      const idx = prev.findIndex(e => e.childId === evalData.childId && e.term === evalData.term);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = evalData;
        return updated;
      }
      return [evalData, ...prev];
    });
    showToast('تم حفظ دفتر تقييم مهارات الطفل بنجاح');
  };

  // Bus Routes
  const addBusRoute = (routeData: Omit<BusRoute, 'id'>) => {
    const newRoute: BusRoute = {
      ...routeData,
      id: `route-${Date.now()}`
    };
    setBusRoutes(prev => [...prev, newRoute]);
    showToast('تمت إضافة خط النقل المدرسي');
  };

  const updateBusRoute = (id: string, updated: Partial<BusRoute>) => {
    setBusRoutes(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    showToast('تم تحديث بيانات خط النقل');
  };

  // Parent Notifications
  const addNotification = (notifData: Omit<ParentNotification, 'id'>) => {
    const newNotif: ParentNotification = {
      ...notifData,
      id: `notif-${Date.now()}`
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast('تم نشر الإشعار / البلاغ بنجاح');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('تم حذف الإشعار');
  };

  // Backup and Restore (JSON)
  const exportDatabaseJSON = () => {
    const fullBackup = {
      app: 'Rawdati_Desktop_System',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      classes,
      staff,
      children: childrenList,
      attendance,
      invoices,
      expenses,
      incidents,
      weeklyMenu,
      activities,
      evaluations,
      busRoutes,
      notifications,
    };

    const fileName = `نسخة_احتياطية_روضتي_${new Date().toISOString().split('T')[0]}`;
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    showToast('تم تصدير النسخة الاحتياطية بنجاح إلى ملف JSON محلي');
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.children && data.classes) {
        if (data.settings) setSettings(data.settings);
        if (data.classes) setClasses(data.classes);
        if (data.staff) setStaff(data.staff);
        if (data.children) setChildrenList(data.children);
        if (data.attendance) setAttendance(data.attendance);
        if (data.invoices) setInvoices(data.invoices);
        if (data.expenses) setExpenses(data.expenses);
        if (data.incidents) setIncidents(data.incidents);
        if (data.weeklyMenu) setWeeklyMenu(data.weeklyMenu);
        if (data.activities) setActivities(data.activities);
        if (data.evaluations) setEvaluations(data.evaluations);
        if (data.busRoutes) setBusRoutes(data.busRoutes);
        if (data.notifications) setNotifications(data.notifications);

        showToast('تمت استعادة قاعدة البيانات بنجاح تام!');
        return true;
      }
      showToast('الملف غير متطابق مع بنية قاعدة بيانات روضتي');
      return false;
    } catch (e) {
      showToast('خطأ أثناء قراءة ملف النسخة الاحتياطية');
      return false;
    }
  };

  const resetToDefaults = () => {
    setSettings(initialSettings);
    setClasses(initialClasses);
    setStaff(initialStaff);
    setChildrenList(initialChildren);
    setAttendance(initialAttendance);
    setInvoices(initialInvoices);
    setExpenses(initialExpenses);
    setIncidents(initialIncidents);
    setWeeklyMenu(initialWeeklyMenu);
    setActivities(initialActivities);
    setEvaluations(initialEvaluations);
    setBusRoutes(initialBusRoutes);
    setNotifications(initialNotifications);
    showToast('تمت إعادة ضبط البيانات النموذجية الأصلية');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        searchQuery,
        setSearchQuery,
        license,
        refreshLicense,
        activateWithKey,
        isActivationModalOpen,
        setIsActivationModalOpen,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        isSuperAdmin,
        login,
        logout,
        userAccounts,
        switchUser,
        updateUserPin,
        addUser,
        updateUser,
        deleteUser,
        hasTabPermission,
        hasActionPermission,
        settings,
        updateSettings,
        children: childrenList,
        addChild,
        updateChild,
        deleteChild,
        getChildById,
        transferChildrenToClass,
        classes,
        addClass,
        updateClass,
        deleteClass,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        attendance,
        recordAttendance,
        bulkRecordAttendance,
        updateAttendance,
        invoices,
        createInvoice,
        addPaymentToInvoice,
        generateMonthlyInvoices,
        deleteInvoice,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        bulkAddExpenses,
        generateSalaryExpenses,
        incidents,
        addIncident,
        weeklyMenu,
        updateWeeklyMenu,
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        evaluations,
        saveEvaluation,
        busRoutes,
        addBusRoute,
        updateBusRoute,
        notifications,
        addNotification,
        deleteNotification,
        printReceiptData,
        setPrintReceiptData,
        printChildCardData,
        setPrintChildCardData,
        printEvaluationData,
        setPrintEvaluationData,
        printAttendanceClassId,
        setPrintAttendanceClassId,
        isUserManualOpen,
        setIsUserManualOpen,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetToDefaults,
        toastMessage,
        showToast,
        setToastMessage: (msg: string | null) => {
          if (msg) showToast(msg);
          else setToastMessage(null);
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
