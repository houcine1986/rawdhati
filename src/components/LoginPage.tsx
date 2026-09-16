import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Crown, 
  Sparkles, 
  BookOpen,
  Keyboard,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { userAccounts, settings, login, license, setIsActivationModalOpen, setIsUserManualOpen } = useApp();

  // Find the Director account (Super Admin)
  const directorUser = userAccounts.find(u => u.role === 'director') || userAccounts[0];
  const targetPin = directorUser?.pinCode || '1234';

  const [pinCode, setPinCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  const attemptLogin = useCallback((enteredPin: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = login(directorUser?.id || 'director', enteredPin, 'pin');
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'رمز الدخول غير صحيح، يرجى إدخال 1234');
        setPinCode('');
      }
    }, 150);
  }, [directorUser, login]);

  const handlePinInput = useCallback((digit: string) => {
    setLastKeyPressed(digit);
    setTimeout(() => setLastKeyPressed(null), 200);

    setPinCode(prev => {
      if (prev.length < 4) {
        const nextPin = prev + digit;
        setErrorMessage(null);
        if (nextPin.length === 4) {
          setTimeout(() => attemptLogin(nextPin), 100);
        }
        return nextPin;
      }
      return prev;
    });
  }, [attemptLogin]);

  const handlePinBackspace = useCallback(() => {
    setPinCode(prev => prev.slice(0, -1));
    setErrorMessage(null);
  }, []);

  const handlePinClear = useCallback(() => {
    setPinCode('');
    setErrorMessage(null);
  }, []);

  // Quick 1-Click Demo Login
  const handleQuickDemoLogin = () => {
    setPinCode(targetPin);
    attemptLogin(targetPin);
  };

  // Copy PIN to clipboard
  const handleCopyPin = () => {
    navigator.clipboard?.writeText(targetPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard (Clavier) Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys (Ctrl, Alt, Meta) are held
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handlePinInput(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handlePinBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handlePinClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (pinCode.length >= 4) {
          attemptLogin(pinCode);
        } else {
          handleQuickDemoLogin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePinInput, handlePinBackspace, handlePinClear, attemptLogin, pinCode, targetPin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-amber-50/40 text-slate-800 flex flex-col justify-between selection:bg-[#FFDF6D] selection:text-slate-900 font-sans relative overflow-x-hidden p-3 sm:p-6" dir="rtl">
      {/* Ambient background glows */}
      <div className="fixed top-10 right-1/4 w-[450px] h-[450px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-1/4 w-[400px] h-[400px] bg-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 sm:py-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center text-2xl shadow-xs font-bold">
            🏠
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{settings.nurseryName}</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold border border-amber-200/80">
                منظومة الإدارة
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {settings.slogan} • {settings.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* License info pill */}
          <button
            type="button"
            onClick={() => setIsActivationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50"
            title="انقر لتفعيل الرخصة"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">نسخة تجريبية مفتوحة</span>
            <span className="text-emerald-700 font-black">جاهزة</span>
          </button>
        </div>
      </header>

      {/* Main Container - Centered, Focused, Zero Clutter */}
      <main className="max-w-lg w-full mx-auto my-auto py-4 sm:py-6">
        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-[32px] border border-slate-200/90 shadow-xl shadow-indigo-100/50 space-y-6 text-center">
          
          {/* Director Profile Badge */}
          <div className="space-y-3">
            <div className="relative inline-block">
              <img
                src={directorUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={directorUser?.fullName || 'مديرة الروضة'}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl object-cover border-4 border-amber-300/80 shadow-md mx-auto ring-4 ring-amber-100/60"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                <Crown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#6C5CE7] text-xs font-black mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حساب مديرة الروضة والمشرفة العامة</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {directorUser?.fullName || 'الأستاذة مريم (المديرة العامة)'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                كامل الصلاحيات (التسجيلات، المالية، الحضور، الإطار التربوي، الإعدادات)
              </p>
            </div>
          </div>

          {/* Prominent Public PIN Banner with 1-Click Fast Login */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-yellow-50 border-2 border-amber-300/80 rounded-2xl p-3.5 sm:p-4 text-center space-y-2 shadow-xs">
            <div className="text-xs font-extrabold text-amber-950 flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>رمز الدخول المخصص للتجربة والاستكشاف (PIN):</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div 
                onClick={handleCopyPin}
                className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-slate-950 bg-white px-5 py-1.5 rounded-xl border border-amber-300 shadow-inner inline-flex items-center gap-2 cursor-pointer hover:bg-amber-50 transition-colors"
                title="انقر لنسخ الرمز"
              >
                <span>{targetPin}</span>
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                )}
              </div>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="الدخول الفوري بنقرة واحدة"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>دخول فوري</span>
              </button>
            </div>

            <div className="text-[11px] text-amber-800/90 font-medium flex items-center justify-center gap-1">
              <Keyboard className="w-3.5 h-3.5 text-amber-700" />
              <span>اكتب <strong className="font-bold text-amber-950 font-mono">1234</strong> مباشرة من لوحة المفاتيح (Clavier) أو الأزرار أسفله</span>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center justify-center gap-2 animate-in shake">
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PIN Input Visualization (4 Dots / Digits) */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 py-1" dir="ltr">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinCode.length > idx;
                const digitVal = pinCode[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-xl font-black transition-all duration-200 border-2 ${
                      isFilled
                        ? 'bg-[#FFDF6D] text-slate-950 border-amber-400 scale-105 shadow-md shadow-amber-200/60 ring-4 ring-amber-100'
                        : 'bg-slate-50 text-slate-300 border-slate-200'
                    }`}
                  >
                    {isFilled ? digitVal : '•'}
                  </div>
                );
              })}
            </div>

            {/* Numeric Keypad Buttons (1-9, C, 0, Backspace) */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                const isPressed = lastKeyPressed === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinInput(num)}
                    className={`h-12 text-slate-900 font-black text-lg rounded-2xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                      isPressed 
                        ? 'bg-[#FFDF6D] scale-95 border-amber-400 text-slate-950 font-mono' 
                        : 'bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handlePinClear}
                className="h-12 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 font-bold text-xs rounded-2xl border border-slate-200/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                title="مسح الكل (Escape)"
              >
                مسح
              </button>

              <button
                type="button"
                onClick={() => handlePinInput('0')}
                className={`h-12 text-slate-900 font-black text-lg rounded-2xl border border-slate-200/90 shadow-2xs transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                  lastKeyPressed === '0' 
                    ? 'bg-[#FFDF6D] scale-95 border-amber-400 text-slate-950 font-mono' 
                    : 'bg-slate-50 hover:bg-white hover:border-slate-300'
                }`}
              >
                0
              </button>

              <button
                type="button"
                onClick={handlePinBackspace}
                className="h-12 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                title="حذف آخر رقم (Backspace)"
              >
                ⌫ حذف
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  if (pinCode.length >= 4) {
                    attemptLogin(pinCode);
                  } else {
                    handleQuickDemoLogin();
                  }
                }}
                className={`w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                  isLoading ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>{isLoading ? 'جاري التحقق والدخول...' : 'دخول للمنظومة (Enter ↵)'}</span>
              </button>
            </div>
          </div>

          {/* Simple footer security note */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>نظام محلي آمن ومحمي بالكامل 100% (Offline Ready)</span>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-3 border-t border-slate-200/70 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          جميع الحقوق محفوظة © 2026 • <strong>{settings.nurseryName}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUserManualOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-100 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>دليل المستخدم الشامل (PDF)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

