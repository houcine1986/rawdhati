/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ChildrenManagement } from './components/ChildrenManagement';
import { AttendanceSecurity } from './components/AttendanceSecurity';
import { ClassesStaff } from './components/ClassesStaff';
import { FinanceInvoicing } from './components/FinanceInvoicing';
import { HealthNutrition } from './components/HealthNutrition';
import { PedagogyActivities } from './components/PedagogyActivities';
import { TransportManagement } from './components/TransportManagement';
import { InternalAnnouncements } from './components/InternalAnnouncements';
import { AdminSettingsBackup } from './components/AdminSettingsBackup';
import { LoginPage } from './components/LoginPage';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { PrintAttendanceModal } from './components/PrintAttendanceModal';
import { PrintChildCardModal } from './components/PrintChildCardModal';
import { PrintEvaluationModal } from './components/PrintEvaluationModal';
import { ActivationModal } from './components/ActivationModal';
import { UserManualGuideModal } from './components/UserManualGuideModal';
import { BottomNav } from './components/BottomNav';
import { CheckCircle2, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    toastMessage, 
    isAuthenticated, 
    currentUser, 
    hasTabPermission,
    isActivationModalOpen,
    setIsActivationModalOpen
  } = useApp();

  // If user is not authenticated or logged out, show the Role Classification Login Page
  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <LoginPage />
        <ActivationModal 
          isOpen={isActivationModalOpen} 
          onClose={() => setIsActivationModalOpen(false)} 
        />
        <UserManualGuideModal />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#2D3436] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-5 h-5 text-[#55EFC4]" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  const renderContent = () => {
    // Check if the current user has permission to access the active tab
    if (!hasTabPermission(activeTab)) {
      return (
        <div className="p-8 md:p-12 bg-white rounded-3xl border border-amber-200 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4 animate-in fade-in">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-100 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800">صلاحية الوصول غير مفعلة لهذه الوحدة</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              ليس لديك إذن للوصول إلى هذه الوحدة. يمكنك مراجعة <strong>المشرف العام (Super Admin)</strong> لتخصيص وتفعيل صلاحيات حسابك.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2.5 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-indigo-200 cursor-pointer inline-flex items-center gap-2"
          >
            <span>العودة إلى لوحة القيادة</span>
          </button>
        </div>
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'children':
        return <ChildrenManagement />;
      case 'attendance':
        return <AttendanceSecurity />;
      case 'classes':
        return <ClassesStaff />;
      case 'finance':
        return <FinanceInvoicing />;
      case 'health':
        return <HealthNutrition />;
      case 'pedagogy':
        return <PedagogyActivities />;
      case 'transport':
        return <TransportManagement />;
      case 'communication':
      case 'announcements':
        return <InternalAnnouncements />;
      case 'settings':
        return <AdminSettingsBackup />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col text-slate-800 selection:bg-sky-200 selection:text-sky-900 font-sans relative overflow-x-hidden" dir="rtl">
      {/* Subtle joyful sky and sunshine background ambient light */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 left-1/3 w-80 h-80 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <Header />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-7 pb-28 md:pb-8">
          <div className="max-w-[1550px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D3436] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#55EFC4]" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Printable Overlays & Activation Modal */}
      <ActivationModal 
        isOpen={isActivationModalOpen} 
        onClose={() => setIsActivationModalOpen(false)} 
      />
      <UserManualGuideModal />
      <PrintReceiptModal />
      <PrintAttendanceModal />
      <PrintChildCardModal />
      <PrintEvaluationModal />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
