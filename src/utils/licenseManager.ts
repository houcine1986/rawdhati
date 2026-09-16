/**
 * Offline License & Activation Engine
 * Supports 14-day Demo Trial, 1-Year Subscription, and Lifetime Offline Licenses.
 */

export type LicenseType = 'trial' | 'annual' | 'lifetime' | 'expired';

export interface LicenseStatus {
  isLicensed: boolean;
  type: LicenseType;
  daysRemaining: number;
  expiryDate: string | null;
  machineId: string;
  licensedTo: string;
  activationKey?: string;
  activatedAt?: string;
  trialStartDate: string;
  trialEndDate: string;
  isTrialExpired: boolean;
}

const STORAGE_KEY_LICENSE = 'nursery_app_license_data';
const STORAGE_KEY_MACHINE = 'nursery_app_machine_id';

// Generate or retrieve persistent machine ID
export function getMachineId(): string {
  let mid = localStorage.getItem(STORAGE_KEY_MACHINE);
  if (!mid) {
    // Generate deterministic machine identifier hash from browser/hardware footprint
    const raw = [
      navigator.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      navigator.language,
      navigator.hardwareConcurrency || 4,
      'NURSERY-SYS-2026'
    ].join('###');

    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const cleanHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    mid = `MID-${cleanHash.slice(0, 4)}-${cleanHash.slice(4, 8)}-${randomSuffix}`;
    localStorage.setItem(STORAGE_KEY_MACHINE, mid);
  }
  return mid;
}

// License Payload inside local storage
interface StoredLicense {
  trialStartDate: string;
  activationKey?: string;
  licensedTo?: string;
  expiryDate?: string;
  type?: 'annual' | 'lifetime';
  activatedAt?: string;
  signature?: string;
}

// Simple deterministic signature verification for offline validation
function generateSignature(machineId: string, type: 'annual' | 'lifetime', expiryOrLifetime: string): string {
  const secretSalt = 'NURSERY_OFFLINE_SECRET_SALT_TUNISIA_2026';
  const str = `${machineId}:::${type}:::${expiryOrLifetime}:::${secretSalt}`;
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ code;
    hash2 = (hash2 * 33) ^ code;
  }
  const h1 = Math.abs(hash1).toString(16).toUpperCase().padStart(8, '0');
  const h2 = Math.abs(hash2).toString(16).toUpperCase().padStart(8, '0');
  return `${h1.slice(0, 4)}-${h2.slice(0, 4)}-${h1.slice(4, 8)}`;
}

/**
 * Offline License Validation
 */

export function verifyAndApplyKey(
  inputKey: string, 
  clientName: string = 'الروضة'
): { success: boolean; message: string; type?: 'annual' | 'lifetime'; expiryDate?: string } {
  const machineId = getMachineId();
  const cleanKey = inputKey.trim().toUpperCase();

  if (!cleanKey.startsWith('KEY-')) {
    return { success: false, message: 'صيغة المفتاح غير صحيحة، يجب أن يبدأ بـ KEY-' };
  }

  if (cleanKey.startsWith('KEY-LIFE-')) {
    // Lifetime verification
    const expectedSig = generateSignature(machineId, 'lifetime', 'LIFETIME');
    if (!cleanKey.endsWith(expectedSig)) {
      return { success: false, message: 'مفتاح التفعيل غير مطابق لهذا الجهاز أو غير صالح.' };
    }

    const licenseData: StoredLicense = {
      trialStartDate: getTrialStartDate(),
      activationKey: cleanKey,
      licensedTo: clientName,
      type: 'lifetime',
      expiryDate: '9999-12-31',
      activatedAt: new Date().toISOString(),
      signature: expectedSig
    };
    localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify(licenseData));
    return { success: true, message: 'تم تفعيل النسخة الكاملة مدى الحياة بنجاح!', type: 'lifetime', expiryDate: 'مدى الحياة' };
  }

  if (cleanKey.startsWith('KEY-1Y-')) {
    // Annual verification: KEY-1Y-YYYYMMDD-SIG
    const parts = cleanKey.split('-');
    if (parts.length < 5) {
      return { success: false, message: 'مفتاح التفعيل السنوي غير مكتمل.' };
    }
    const dateStr = parts[2]; // e.g. 20270831
    if (dateStr.length !== 8) {
      return { success: false, message: 'تاريخ صلاحية المفتاح غير صحيح.' };
    }
    const yyyy = dateStr.slice(0, 4);
    const mm = dateStr.slice(4, 6);
    const dd = dateStr.slice(6, 8);
    const formattedExpiry = `${yyyy}-${mm}-${dd}`;

    const expectedSig = generateSignature(machineId, 'annual', formattedExpiry);
    const keySig = `${parts[3]}-${parts[4]}-${parts[5] || ''}`.replace(/-$/, '');

    if (!cleanKey.endsWith(expectedSig) && keySig !== expectedSig) {
      return { success: false, message: 'مفتاح التفعيل السنوي غير مطابق لهذا الجهاز.' };
    }

    // Check if expired
    const expDate = new Date(formattedExpiry);
    const now = new Date();
    if (expDate < now) {
      return { success: false, message: `هذا المفتاح منتهي الصلاحية بتاريخ ${formattedExpiry}.` };
    }

    const licenseData: StoredLicense = {
      trialStartDate: getTrialStartDate(),
      activationKey: cleanKey,
      licensedTo: clientName,
      type: 'annual',
      expiryDate: formattedExpiry,
      activatedAt: new Date().toISOString(),
      signature: expectedSig
    };
    localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify(licenseData));
    return { success: true, message: `تم تفعيل الاشتراك السنوي بنجاح حتى تاريخ ${formattedExpiry}!`, type: 'annual', expiryDate: formattedExpiry };
  }

  return { success: false, message: 'نوع مفتاح التفعيل غير معروف.' };
}

function getTrialStartDate(): string {
  const raw = localStorage.getItem(STORAGE_KEY_LICENSE);
  if (raw) {
    try {
      const parsed: StoredLicense = JSON.parse(raw);
      if (parsed.trialStartDate) return parsed.trialStartDate;
    } catch {}
  }
  const now = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify({ trialStartDate: now }));
  return now;
}

export function getLicenseStatus(): LicenseStatus {
  const machineId = getMachineId();
  const raw = localStorage.getItem(STORAGE_KEY_LICENSE);
  let stored: StoredLicense | null = null;

  if (raw) {
    try {
      stored = JSON.parse(raw);
    } catch {
      stored = null;
    }
  }

  if (!stored || !stored.trialStartDate) {
    const initialStart = new Date().toISOString();
    stored = { trialStartDate: initialStart };
    localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify(stored));
  }

  const trialStart = new Date(stored.trialStartDate);
  const trialEnd = new Date(trialStart);
  trialEnd.setDate(trialEnd.getDate() + 14); // 14-day demo

  const now = new Date();

  // If activated
  if (stored.activationKey && stored.type) {
    if (stored.type === 'lifetime') {
      return {
        isLicensed: true,
        type: 'lifetime',
        daysRemaining: 99999,
        expiryDate: null,
        machineId,
        licensedTo: stored.licensedTo || 'الروضة',
        activationKey: stored.activationKey,
        activatedAt: stored.activatedAt,
        trialStartDate: stored.trialStartDate,
        trialEndDate: trialEnd.toISOString(),
        isTrialExpired: false
      };
    }

    if (stored.type === 'annual' && stored.expiryDate) {
      const expDate = new Date(stored.expiryDate);
      const diffMs = expDate.getTime() - now.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (days > 0) {
        return {
          isLicensed: true,
          type: 'annual',
          daysRemaining: days,
          expiryDate: stored.expiryDate,
          machineId,
          licensedTo: stored.licensedTo || 'الروضة',
          activationKey: stored.activationKey,
          activatedAt: stored.activatedAt,
          trialStartDate: stored.trialStartDate,
          trialEndDate: trialEnd.toISOString(),
          isTrialExpired: false
        };
      } else {
        return {
          isLicensed: false,
          type: 'expired',
          daysRemaining: 0,
          expiryDate: stored.expiryDate,
          machineId,
          licensedTo: stored.licensedTo || 'الروضة',
          activationKey: stored.activationKey,
          activatedAt: stored.activatedAt,
          trialStartDate: stored.trialStartDate,
          trialEndDate: trialEnd.toISOString(),
          isTrialExpired: true
        };
      }
    }
  }

  // Demo Trial mode calculation
  const trialDiffMs = trialEnd.getTime() - now.getTime();
  const trialDaysRemaining = Math.max(0, Math.ceil(trialDiffMs / (1000 * 60 * 60 * 24)));
  const isTrialExpired = trialDaysRemaining <= 0;

  return {
    isLicensed: false,
    type: isTrialExpired ? 'expired' : 'trial',
    daysRemaining: trialDaysRemaining,
    expiryDate: trialEnd.toISOString().split('T')[0],
    machineId,
    licensedTo: 'نسخة تجريبية (14 يوماً)',
    trialStartDate: stored.trialStartDate,
    trialEndDate: trialEnd.toISOString().split('T')[0],
    isTrialExpired
  };
}

export function resetToTrialForTesting(): void {
  const initialStart = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_LICENSE, JSON.stringify({ trialStartDate: initialStart }));
}
