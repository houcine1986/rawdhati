# 📦 Guide de Création du Fichier d'Installation Hors-Ligne (.MSI / .EXE)
## منظومة إدارة الروضات والمحاضن المدرسية (نسخة سطح المكتب المستقلة 100% Offline)

هذا الدليل يشرح كيفية تحويل المشروع إلى برنامج تنفيذي مثبت **MSI / EXE** للعمل على حواسيب Windows بدون أي اتصال بالإنترنت مع دعم:
- 🕒 **نسخة تجريبية Demo لمدة 14 يوماً** تبدأ تلقائياً عند أول تشغيل.
- 🔑 **نظام تفعيل برخصة سنوية (1 An) أو رخصة كاملة مدى الحياة (Lifetime)**.
- 💻 **التحقق من بصمة الجهاز (Machine ID)** بدون الحاجة لإنترنت.

---

### الخطوة 1: استخراج وتصدير المشروع إلى حاسوبك
1. من أعلى واجهة المتصفح، قم بتحميل المشروع بصيغة **ZIP** أو عبر **GitHub**.
2. فك الضغط عن المجلد وافتحه في موجه الأوامر (Terminal / PowerShell).

---

### الخطوة 2: تثبيت حزم Electron و Electron-Builder
نفّذ الأمر التالي في مجلد المشروع:
```bash
npm install --save-dev electron electron-builder
```

---

### الخطوة 3: ملف تشغيل البرنامج `electron/main.cjs`
قم بإنشاء مجلد `electron` وبداخله ملف `main.cjs`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: "منظومة إدارة الروضة - Rawdati Management",
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // تشغيل ملفات المشروع المترجمة محلياً 100%
  win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.setMenuBarVisibility(false); // إخفاء القائمة الافتراضية
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

---

### الخطوة 4: إضافة سكريبت التجميع في `package.json`
أضف الإعدادات التالية إلى ملف `package.json`:

```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:msi": "vite build && electron-builder --win msi",
    "build:exe": "vite build && electron-builder --win nsis"
  },
  "build": {
    "appId": "com.rawdati.nurseryapp",
    "productName": "منظومة إدارة الروضة",
    "directories": {
      "output": "dist-installers"
    },
    "win": {
      "target": ["msi", "nsis"],
      "icon": "public/favicon.ico"
    },
    "msi": {
      "oneClick": false,
      "perMachine": true,
      "runAfterFinish": true
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "shortcutName": "منظومة إدارة الروضة",
      "createDesktopShortcut": true
    }
  }
}
```

---

### الخطوة 5: بناء ملف التثبيت `.MSI`
قم بتنفيذ الأمر التالي في الطرفية:
```bash
npm run build:msi
```

🎉 سيتم توليد ملف التثبيت المباشر **`dist-installers/منظومة إدارة الروضة Setup.msi`** جاهز للتسليم لعملائك!

---

### 🛡️ كيفية تفعيل الرخص للعملاء (بدون إنترنت وبأمان تام):

1. **العميل يقوم بتثبيت البرنامج وتشغيله على حاسوبه:**
   - تظهر له النسخة التجريبية المجانية (14 يوماً).
2. **عند طلب الشراء:**
   - يضغط العميل على زر **"تفعيل البرنامج"** في أعلى الشاشة أو صفحة الدخول.
   - يضغط على **"نسخ رمز جهازي (Machine ID)"** (مثال: `MID-XXXX-XXXX-1234`) ويرسله لك عبر الواتساب.
3. **أنت (المطور حصرياً):**
   - تفتح الملف المستقل **`ADMIN_KEYGEN_TOOL.html`** على حاسوبك الشخصي أو هاتفك (يعمل بدون إنترنت).
   - تلصق رمز جهاز العميل.
   - تختار نوع الرخصة: **رخصة مدى الحياة (Lifetime)** أو **اشتراك سنوي (12 شهراً)**.
   - تضغط على **"توليد مفتاح التفعيل الفوري"**.
   - تضغط على **"نسخ الرسالة كاملة"** وترسلها للعميل عبر WhatsApp بضغطة زر واحدة.
4. **العميل يلصق المفتاح في برنامجه:**
   - يتم تفعيل النسخة فوراً وتتحول شارة البرنامج إلى **"مرخص مدى الحياة 🌟"** أو **"اشتراك سنوي 📅"** دون الحاجة لأي اتصال بالإنترنت.
   - تطبيق العميل لا يحتوي على أي خوارزمية لتوليد المفاتيح، مما يضمن حماية البرنامج ومنع التلاعب به.
