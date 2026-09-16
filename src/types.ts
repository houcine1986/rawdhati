export type ChildStatus = 'active' | 'paused' | 'withdrawn';
export type Gender = 'male' | 'female';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer';
export type UserRole = 'director' | 'admin' | 'educator';

export interface AuthorizedPerson {
  id: string;
  name: string;
  relation: string; // أب، أم، جد، جدة، عم، خالة، سائق...
  phone: string;
  cin?: string; // بطاقة التعريف الوطنية
  photo?: string;
  isPrimary: boolean;
  notes?: string;
}

export interface ChildDocument {
  id: string;
  title: string;
  type: 'birth_certificate' | 'vaccine_record' | 'medical_cert' | 'photos' | 'reg_form' | 'other';
  submitted: boolean;
  notes?: string;
}

export interface HealthProfile {
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'غير محدد';
  allergies: string[]; // حساسية الغلوتين، الفول السوداني، الحليب، البيض...
  chronicDiseases: string[]; // ربو، سكري...
  regularMedications: string;
  familyDoctorName: string;
  familyDoctorPhone: string;
  emergencyNotes: string;
}

export interface Child {
  id: string;
  registrationNumber: string; // رقم التسجيل (مثال: RWD-2024-001)
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  classId: string;
  photoUrl: string;
  registrationDate: string;
  status: ChildStatus;
  
  // Parents Info
  fatherName: string;
  fatherPhone: string;
  fatherJob?: string;
  motherName: string;
  motherPhone: string;
  motherJob?: string;
  address: string;
  emergencyPhone: string;
  emergencyContactName: string;
  
  // Security & Pick up
  authorizedPersons: AuthorizedPerson[];
  
  // Health
  health: HealthProfile;
  
  // Subscription settings
  services: {
    canteen: boolean;
    transport: boolean;
    transportRouteId?: string;
    eveningCare: boolean; // حراسة مسائية
    extracurricularClubs: string[]; // روبوتيك، مسرح، كاراتيه، لغات...
  };
  monthlyBaseFee: number; // بالدينار التونسي د.ت
  discountPercent: number; // %
  discountReason?: string; // تخفيض إخوة، حالة اجتماعية...
  
  // Documents checklist
  documents: ChildDocument[];
  
  notes?: string;
}

export interface ClassRoom {
  id: string;
  name: string; // الرضع، الصغار، المتوسط، التحضيري
  code: string;
  ageRange: string; // 3 أشهر - سنة، 1 - 2 سنوات، 3 - 4 سنوات، 5 - 6 سنوات
  capacity: number;
  mainTeacherId?: string;
  assistantTeacherId?: string;
  roomNumber: string;
  color: string;
  description?: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  role: 'educator' | 'assistant' | 'nurse' | 'cook' | 'driver' | 'admin' | 'director';
  phone: string;
  cin: string;
  assignedClassId?: string;
  hireDate: string;
  qualifications: string; // شهادة كفاءة مهنية، إجازة في رعاية الطفولة...
  salary: number; // د.ت
  status: 'active' | 'on_leave' | 'inactive';
  photoUrl: string;
  notes?: string;
}

export interface DailyAttendance {
  id: string;
  date: string; // YYYY-MM-DD
  childId: string;
  classId: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  arrivalTime?: string; // HH:mm
  departureTime?: string; // HH:mm
  pickedUpBy?: string; // اسم من استلم الطفل
  pickedUpRelation?: string; // صفته (أب، أم، خالة...)
  authorizedPersonId?: string;
  notes?: string;
  recordedBy?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number; // د.ت
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // FAT-2026-001
  childId: string;
  month: string; // 2026-09 (شهر / سنة)
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  totalAmount: number; // المبلغ الإجمالي د.ت
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  payments: Payment[];
  notes?: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // REC-2026-001
  invoiceId: string;
  childId: string;
  amount: number; // د.ت
  date: string;
  method: PaymentMethod;
  receivedBy: string;
  referenceNumber?: string; // رقم الشيك أو التحويل
  notes?: string;
}

export type ExpenseCategory = 
  | 'salaries'            // رواتب وأجور الإطار التربوي والموظفين
  | 'rent'                // إيجار / كراء المقر
  | 'utilities'           // فواتير الكهرباء (STEG)، الماء (SONEDE)، الغاز، والإنترنت
  | 'food_canteen'        // مشتريات المطعم، أغذية، خضر ولمجات الأطفال
  | 'transport_fuel'      // بنزين، صيانة وتأمين حافلات النقل
  | 'educational_supplies'// أدوات بيداغوجية، كتب، ألعاب وقرطاسية
  | 'cleaning_hygiene'    // مواد تنظيف وتعقيم ومستلزمات صحية
  | 'maintenance_repairs' // صيانة المقر والمعدات والدهان
  | 'taxes_insurance'     // ضرائب، تأمين مدرسي واشتراكات رسمية
  | 'marketing_events'    // حفلات، رحلات، ودعاية
  | 'other';              // مصاريف طارئة وأخرى

export interface Expense {
  id: string;
  expenseNumber: string; // EXP-2026-001
  title: string;
  category: ExpenseCategory;
  amount: number; // بالدينار التونسي د.ت
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  beneficiary: string; // المستفيد / المزود / الموظف
  invoiceRef?: string; // رقم فاتورة المزود أو الإيصال
  notes?: string;
  recordedBy: string;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'yearly';
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface HealthIncident {
  id: string;
  childId: string;
  date: string;
  time: string;
  type: 'fall' | 'fever' | 'wound' | 'allergy_reaction' | 'stomach_ache' | 'other';
  typeLabel: string;
  description: string;
  actionTaken: string; // الإسعاف الأولي أو الإجراء المتخذ
  notifiedParents: boolean;
  notifiedAt?: string;
  parentResponse?: string;
  reportedBy: string;
  notes?: string;
}

export interface VaccineRecord {
  id: string;
  childId: string;
  vaccineName: string; // BCG, Hexavalent, ROR, إلخ
  doseNumber: number;
  scheduledDate: string;
  administeredDate?: string;
  isCompleted: boolean;
  notes?: string;
}

export interface WeeklyMealPlan {
  id: string;
  weekStarting: string; // YYYY-MM-DD
  days: {
    dayName: 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';
    breakfast: string; // الفطور الصباحي
    lunch: string; // وجبة الغداء
    snack: string; // اللمجة المسائية
    notes?: string;
  }[];
}

export interface ActivitySchedule {
  id: string;
  classId: string;
  dayOfWeek: string;
  timeSlot: string;
  title: string;
  category: 'motor' | 'linguistic' | 'art' | 'quran' | 'math' | 'science' | 'music' | 'montessori';
  categoryLabel: string;
  description: string;
  objective: string;
}

export interface SkillCategory {
  id: string;
  name: string; // المهارات الحركية، اللغوية والتعبير، الاجتماعية والسلوكية، الاستقلالية الذاتية، الإبداع والفنون
  skills: {
    id: string;
    name: string;
    rating: 'excellent' | 'good' | 'in_progress' | 'needs_support';
    notes?: string;
  }[];
}

export interface ChildEvaluation {
  id: string;
  childId: string;
  term: 'الثلاثي الأول' | 'الثلاثي الثاني' | 'الثلاثي الثالث' | 'شهري';
  date: string;
  teacherId: string;
  categories: SkillCategory[];
  generalRemarks: string;
  recommendations: string;
}

export interface BusRoute {
  id: string;
  name: string; // خط المنزه - النصر، خط باردو - حي التحرير...
  busNumber: string;
  driverName: string;
  driverPhone: string;
  supervisorName: string; // المرافقة
  morningStartTime: string;
  eveningReturnTime: string;
  capacity: number;
  stops: string[];
  notes?: string;
}

export interface ParentNotification {
  id: string;
  title: string;
  message: string;
  type: 'payment_reminder' | 'event' | 'holiday' | 'health_alert' | 'general';
  targetAudience: 'all' | 'class' | 'individual';
  targetId?: string; // childId or classId
  date: string;
  isImportant: boolean;
}

export interface NurserySettings {
  nurseryName: string;
  slogan: string;
  directorName: string;
  licenseNumber: string; // رقم الترخيص من وزارة الأسرة والمرأة والطفولة
  taxId: string; // المعرف الجبائي / Matricule Fiscale
  phone1: string;
  phone2?: string;
  email: string;
  address: string;
  city: string; // تونس، أريانة، صفاقس، سوسة، بنزرت...
  logoUrl?: string;
  currency: string; // د.ت
  defaultBaseFee: number;
  defaultCanteenFee: number;
  defaultTransportFee: number;
  enableAutoBackup: boolean;
  lastBackupDate?: string;
}

export type AppTab = 
  | 'dashboard'
  | 'children'
  | 'attendance'
  | 'classes'
  | 'finance'
  | 'health'
  | 'pedagogy'
  | 'transport'
  | 'communication'
  | 'announcements'
  | 'settings';

export interface UserPermissions {
  allowedTabs: AppTab[];
  canAddChildren?: boolean;
  canEditChildren?: boolean;
  canDeleteRecords?: boolean;
  canManageAttendance?: boolean;
  canManageFinance?: boolean;
  canExportReports?: boolean;
  canManageClasses?: boolean;
  canManageHealth?: boolean;
  canManagePedagogy?: boolean;
  canManageTransport?: boolean;
  canManageAnnouncements?: boolean;
  canManageSettings?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  pinCode: string;
  password?: string;
  email?: string;
  avatar: string;
  title?: string;
  assignedClassName?: string;
  phone?: string;
  createdAt?: string;
  permissions?: UserPermissions;
}

export const ALL_SYSTEM_TABS: { id: AppTab; label: string; description: string; category: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', description: 'المؤشرات والإحصائيات العامة والتنبيهات', category: 'الأساسية' },
  { id: 'children', label: 'إدارة الأطفال', description: 'ملفات الأطفال، التسجيل، والوثائق والأولياء', category: 'التربوية والإدارية' },
  { id: 'attendance', label: 'الحضور والأمان', description: 'تسجيل الحضور اليومي وسجل تسليم واستلام الأطفال', category: 'الأمان والمتابعة' },
  { id: 'classes', label: 'الأقسام والمربيات', description: 'توزيع الأفواج، تعيين المربيات، والمجموعات', category: 'التربوية والإدارية' },
  { id: 'finance', label: 'المالية والاشتراكات', description: 'استخلاص الرسوم، الفواتير، ومتابعة المتأخرات', category: 'المالية' },
  { id: 'health', label: 'الصحة والتغذية', description: 'الملفات الصحية، سجل الحوادث، والوجبات الغذائية', category: 'الرعاية والصحة' },
  { id: 'pedagogy', label: 'البرنامج والتقييم', description: 'جدول الأنشطة البيداغوجية والتقييم الفصلي', category: 'التربوية والإدارية' },
  { id: 'transport', label: 'النقل المدرسي', description: 'خطوط الحافلات، المحطات والمشتركين في النقل', category: 'الخدمات' },
  { id: 'communication', label: 'التواصل والإعلانات', description: 'نشر الإعلانات والملاحظات للأولياء والإطار', category: 'التواصل' },
  { id: 'settings', label: 'الإعدادات والنسخ الاحتياطي', description: 'بيانات المؤسسة، التعريف الجبائي، النسخ والاسترجاع', category: 'الإدارة العامة' },
];

export const GRANULAR_ACTIONS_LIST: { id: keyof Omit<UserPermissions, 'allowedTabs'>; label: string; description: string }[] = [
  { id: 'canAddChildren', label: 'تسجيل أطفال جدد', description: 'إضافة ملفات تسجيل أطفال جدد بالروضة' },
  { id: 'canEditChildren', label: 'تعديل ملفات الأطفال', description: 'تعديل البيانات الشخصية والصحية ومعطيات الأولياء' },
  { id: 'canDeleteRecords', label: 'حذف السجلات والبيانات', description: 'حذف أطفال، فواتير أو مستندات من المنظومة' },
  { id: 'canManageAttendance', label: 'تسجيل الحضور والتسليم', description: 'تأكيد حضور ومغادرة الأطفال وتحديد هوية المستلم' },
  { id: 'canManageFinance', label: 'الاستخلاص وإصدار الفواتير', description: 'قبض المبالغ المالية، طباعة التواصيل وتتبع الديون' },
  { id: 'canExportReports', label: 'تصدير التقارير والطباعة', description: 'تصدير بيانات Excel، وبطاقات الأطفال وسجلات الحضور' },
  { id: 'canManageClasses', label: 'إدارة وتعديل الأقسام', description: 'إنشاء قاعات جديدة وتعيين المربيات للمجموعات' },
  { id: 'canManageHealth', label: 'تدوين الحالات الصحية والحوادث', description: 'إضافة سجلات حوادث، ملاحظات طبية وتعديل الوجبات' },
  { id: 'canManagePedagogy', label: 'إدارة البرامج والتقييمات', description: 'برمجة أنشطة أسبوعية وتقييم المهارات الفصلية' },
  { id: 'canManageTransport', label: 'إدارة مسارات النقل', description: 'تعديل خطوط الحافلات وسائقي النقل' },
  { id: 'canManageAnnouncements', label: 'نشر وتعديل الإعلانات', description: 'إنشاء بلاغات وتوجيهات للإطار التربوي والأولياء' },
  { id: 'canManageSettings', label: 'إعدادات المؤسسة والنسخ', description: 'تعديل الرسوم والتعريفات والنسخ الاحتياطي' },
];

export function getDefaultPermissionsForRole(role: UserRole): UserPermissions {
  if (role === 'director') {
    return {
      allowedTabs: ['dashboard', 'children', 'attendance', 'classes', 'finance', 'health', 'pedagogy', 'transport', 'communication', 'settings'],
      canAddChildren: true,
      canEditChildren: true,
      canDeleteRecords: true,
      canManageAttendance: true,
      canManageFinance: true,
      canExportReports: true,
      canManageClasses: true,
      canManageHealth: true,
      canManagePedagogy: true,
      canManageTransport: true,
      canManageAnnouncements: true,
      canManageSettings: true,
    };
  }
  if (role === 'admin') {
    return {
      allowedTabs: ['dashboard', 'children', 'attendance', 'classes', 'finance', 'health', 'pedagogy', 'transport', 'communication', 'settings'],
      canAddChildren: true,
      canEditChildren: true,
      canDeleteRecords: false,
      canManageAttendance: true,
      canManageFinance: true,
      canExportReports: true,
      canManageClasses: true,
      canManageHealth: true,
      canManagePedagogy: false,
      canManageTransport: true,
      canManageAnnouncements: true,
      canManageSettings: false,
    };
  }
  // educator
  return {
    allowedTabs: ['dashboard', 'children', 'attendance', 'classes', 'health', 'pedagogy', 'communication'],
    canAddChildren: false,
    canEditChildren: false,
    canDeleteRecords: false,
    canManageAttendance: true,
    canManageFinance: false,
    canExportReports: true,
    canManageClasses: false,
    canManageHealth: true,
    canManagePedagogy: true,
    canManageTransport: false,
    canManageAnnouncements: false,
    canManageSettings: false,
  };
}
