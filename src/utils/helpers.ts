export const formatTND = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.000 د.ت';
  return `${amount.toFixed(3)} د.ت`;
};

export const calculateAge = (birthDateString: string): { years: number; months: number; text: string } => {
  if (!birthDateString) return { years: 0, months: 0, text: 'غير محدد' };
  const birth = new Date(birthDateString);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  if (now.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      months = 11;
      years--;
    }
  }

  let text = '';
  if (years === 0) {
    text = `${months} ${months === 1 ? 'شهر' : months === 2 ? 'شهران' : months <= 10 ? 'أشهر' : 'شهراً'}`;
  } else if (months === 0) {
    text = `${years} ${years === 1 ? 'سنة' : years === 2 ? 'سنتان' : years <= 10 ? 'سنوات' : 'سنة'}`;
  } else {
    text = `${years} ${years === 1 ? 'سنة' : years === 2 ? 'سنتان' : years <= 10 ? 'سنوات' : 'سنة'} و ${months} أشهر`;
  }

  return { years, months, text };
};

const ARABIC_MONTHS = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const formatArabicDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = ARABIC_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
};

export const exportToCSV = (filename: string, rows: (string | number)[][], headers: string[]) => {
  const processRow = (row: (string | number)[]) => {
    return row.map(val => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',');
  };

  const csvContent = '\uFEFF' + [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(processRow)
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadJSON = (data: unknown, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFullBackupJSON = (backupData: unknown) => {
  const fileName = `نسخة_احتياطية_روضتي_${new Date().toISOString().split('T')[0]}`;
  downloadJSON(backupData, fileName);
};

export const importBackupJSON = (
  file: File,
  onSuccess: (jsonString: string) => void,
  onError: (err: string) => void
) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const content = event.target?.result as string;
      onSuccess(content);
    } catch (e) {
      onError((e as Error).message || 'خطأ في قراءة الملف');
    }
  };
  reader.onerror = () => onError('فشل في فتح الملف');
  reader.readAsText(file);
};

export const numberToArabicWords = (num: number): string => {
  if (num === 0) return 'صفر دينار';

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  const teens = ['أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const thousands = ['', 'ألف', 'ألفان', 'آلاف', 'ألفاً'];

  const integerPart = Math.floor(num);
  const millimes = Math.round((num - integerPart) * 1000);

  const convertThreeDigits = (n: number): string => {
    let result = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    const t = Math.floor(rem / 10);
    const u = rem % 10;

    if (h > 0) result += hundreds[h];

    if (rem > 0) {
      if (result) result += ' و';
      if (rem <= 10) {
        result += units[rem];
      } else if (rem < 20) {
        result += teens[rem - 11];
      } else {
        if (u > 0) result += units[u] + ' و';
        result += tens[t];
      }
    }
    return result;
  };

  let text = '';
  const thou = Math.floor(integerPart / 1000);
  const remUnits = integerPart % 1000;

  if (thou > 0) {
    if (thou === 1) text += 'ألف';
    else if (thou === 2) text += 'ألفان';
    else if (thou >= 3 && thou <= 10) text += `${units[thou]} ${thousands[3]}`;
    else text += `${convertThreeDigits(thou)} ${thousands[4]}`;
  }

  if (remUnits > 0) {
    if (text) text += ' و';
    text += convertThreeDigits(remUnits);
  }

  text += ' ديناراً تونسيّاً';

  if (millimes > 0) {
    text += ` و${convertThreeDigits(millimes)} مليم`;
  }

  text += ' لا غير.';
  return text;
};

export const EXPENSE_CATEGORIES_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  salaries: {
    label: 'أجور ورواتب المربيات والعملة',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  rent: {
    label: 'كراء وإيجار المقر',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  utilities: {
    label: 'فواتير (كهرباء STEG، ماء SONEDE، إنترنت)',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  food_canteen: {
    label: 'مشتريات المطعم ولمجة الأطفال',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  transport_fuel: {
    label: 'وقود وصيانة حافلات النقل',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  educational_supplies: {
    label: 'أدوات تربوية، كتب وقرطاسية',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  cleaning_hygiene: {
    label: 'مواد تنظيف، تعقيم ومستلزمات صحية',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  maintenance_repairs: {
    label: 'صيانة المقر والمعدات والتجهيزات',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  taxes_insurance: {
    label: 'تأمين مدرسي، ضرائب واشتراكات',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  marketing_events: {
    label: 'حفلات، خرجات، رحلات ودعاية',
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
  },
  other: {
    label: 'مصاريف طارئة وأخرى',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
  },
};

export const getCategoryLabel = (cat: string): string => {
  return EXPENSE_CATEGORIES_MAP[cat]?.label || 'مصروف عام';
};

export const printDocumentSection = (elementId: string, documentTitle: string = 'طباعة مستند') => {
  try {
    const elem = document.getElementById(elementId);
    if (!elem) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) {
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>${documentTitle}</title>
          ${styles}
          <style>
            body { background: white !important; padding: 20px !important; font-family: system-ui, -apple-system, sans-serif; }
            .no-print { display: none !important; }
            @page { margin: 1.5cm; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${elem.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (err) {
    console.warn('Standard window.print fallback triggered', err);
    window.print();
  }
};

/**
 * Format phone number to clean WhatsApp link for Tunisia / International
 */
export const formatPhoneForWhatsApp = (rawPhone: string): string => {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('216') && digits.length >= 11) {
    return digits;
  }
  if (digits.length === 8) {
    return `216${digits}`;
  }
  return digits;
};

export const formatPhoneForCall = (rawPhone: string): string => {
  if (!rawPhone) return '';
  return rawPhone.replace(/\s+/g, '');
};

export interface ConsecutiveAbsenceInfo {
  childId: string;
  childName: string;
  childPhoto: string;
  registrationNumber: string;
  className: string;
  consecutiveDays: number;
  startDate: string;
  endDate: string;
  absentDates: string[];
  lastNotes?: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  emergencyPhone: string;
  child: any;
}

/**
 * Detects children who have been absent for >= minDays consecutive recorded days
 */
export const detectConsecutiveAbsences = (
  children: any[],
  attendance: any[],
  classes: any[],
  minDays: number = 3
): ConsecutiveAbsenceInfo[] => {
  if (!Array.isArray(children) || !Array.isArray(attendance)) return [];

  const activeChildren = children.filter(c => c.status === 'active');
  const results: ConsecutiveAbsenceInfo[] = [];

  for (const child of activeChildren) {
    // Get all attendance entries for this child, sorted descending by date
    const childRecords = attendance
      .filter(a => a.childId === child.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (childRecords.length === 0) continue;

    // Filter by unique dates to avoid duplicates on same day
    const uniqueDateRecords: any[] = [];
    const seenDates = new Set<string>();
    for (const rec of childRecords) {
      if (!seenDates.has(rec.date)) {
        seenDates.add(rec.date);
        uniqueDateRecords.push(rec);
      }
    }

    // Check consecutive absence from the latest record backwards
    let streak = 0;
    const absentDates: string[] = [];
    let lastNotes = '';

    for (const rec of uniqueDateRecords) {
      if (rec.status === 'absent' || rec.status === 'excused') {
        streak++;
        absentDates.push(rec.date);
        if (!lastNotes && rec.notes) {
          lastNotes = rec.notes;
        }
      } else {
        // Streak is broken by a presence or late arrival
        break;
      }
    }

    // Check if the streak meets or exceeds threshold (>= minDays)
    if (streak >= minDays) {
      const cls = classes.find(c => c.id === child.classId);
      // Sort dates chronologically
      absentDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      results.push({
        childId: child.id,
        childName: child.fullName,
        childPhoto: child.photoUrl,
        registrationNumber: child.registrationNumber,
        className: cls?.name || 'فوج غير محدد',
        consecutiveDays: streak,
        startDate: absentDates[0],
        endDate: absentDates[absentDates.length - 1],
        absentDates,
        lastNotes,
        fatherName: child.fatherName || 'الولي',
        fatherPhone: child.fatherPhone || '',
        motherName: child.motherName || 'الأم',
        motherPhone: child.motherPhone || '',
        emergencyPhone: child.emergencyPhone || '',
        child
      });
    }
  }

  return results.sort((a, b) => b.consecutiveDays - a.consecutiveDays);
};

