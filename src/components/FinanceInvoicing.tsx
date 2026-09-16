import React, { useState } from 'react';
import { 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  Plus, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  Search, 
  CreditCard, 
  Calendar, 
  MessageSquare,
  Sparkles,
  DollarSign,
  PieChart as PieIcon,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice, Payment, PaymentMethod, PaymentStatus } from '../types';
import { formatTND, formatArabicDate, exportToCSV } from '../utils/helpers';
import { FinanceExpenses } from './FinanceExpenses';
import { FinanceProfitLoss } from './FinanceProfitLoss';
import { FinanceReports } from './FinanceReports';

type FinanceSubTab = 'invoicing' | 'expenses' | 'profit_loss' | 'reports';

export const FinanceInvoicing: React.FC = () => {
  const { 
    invoices, 
    expenses,
    children, 
    classes, 
    createInvoice, 
    addPaymentToInvoice, 
    generateMonthlyInvoices, 
    deleteInvoice,
    setPrintReceiptData, 
    settings,
    currentUser 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('invoicing');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Payment Modal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // New manual invoice modal
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || '');
  const [newInvMonth, setNewInvMonth] = useState<string>('2026-08');
  const [itemDescription, setItemDescription] = useState<string>('اشتراك شهري');
  const [itemAmount, setItemAmount] = useState<number>(180);
  const [invoiceItems, setInvoiceItems] = useState<{ id: string; description: string; amount: number }[]>([
    { id: 'itm-1', description: 'الاشتراك الأساسي', amount: 180 },
  ]);
  const [invDiscount, setInvDiscount] = useState<number>(0);
  const [invDiscountReason, setInvDiscountReason] = useState<string>('');

  // Quick stats calculations
  const totalBilledAll = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollectedAll = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalExpensesAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfitAll = totalCollectedAll - totalExpensesAll;

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const child = children.find(c => c.id === inv.childId);
    const matchesMonth = !selectedMonth || inv.month === selectedMonth;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = 
      !searchTerm ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child?.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child?.fatherPhone.includes(searchTerm);

    return matchesMonth && matchesStatus && matchesSearch;
  });

  // Totals calculations for filtered view
  const totalBilled = filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalDue = filteredInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

  // Open payment modal
  const handleOpenPayment = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.remainingAmount);
    setPaymentMethod('cash');
    setReferenceNumber('');
    setPaymentNotes('');
  };

  // Submit payment
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || paymentAmount <= 0) return;

    const child = children.find(c => c.id === payingInvoice.childId);
    if (!child) return;

    const newPayment = addPaymentToInvoice(payingInvoice.id, {
      amount: paymentAmount,
      date: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      receivedBy: currentUser.fullName,
      referenceNumber: referenceNumber || undefined,
      notes: paymentNotes || undefined,
    });

    if (newPayment) {
      setPrintReceiptData({
        invoice: {
          ...payingInvoice,
          paidAmount: payingInvoice.paidAmount + paymentAmount,
          remainingAmount: Math.max(0, payingInvoice.remainingAmount - paymentAmount),
        },
        payment: newPayment,
        child,
      });
    }

    setPayingInvoice(null);
  };

  // Handle Add Item to new invoice
  const handleAddItem = () => {
    if (!itemDescription.trim() || itemAmount <= 0) return;
    setInvoiceItems(prev => [
      ...prev,
      { id: `itm-${Date.now()}`, description: itemDescription, amount: itemAmount }
    ]);
    setItemDescription('');
    setItemAmount(0);
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(prev => prev.filter(i => i.id !== id));
  };

  const handleCreateManualInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceItems.length === 0 || !selectedChildId) return;

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.amount, 0);
    const totalAmount = Math.max(0, subtotal - invDiscount);

    createInvoice({
      childId: selectedChildId,
      month: newInvMonth,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: `${newInvMonth}-10`,
      items: invoiceItems,
      subtotal,
      discountAmount: invDiscount,
      discountReason: invDiscountReason || undefined,
      totalAmount,
      status: 'unpaid',
      notes: 'فاتورة يدوية مخصصة',
    });

    setIsNewInvoiceModalOpen(false);
  };

  // Export financial statement to CSV
  const handleExportFinanceCSV = () => {
    const headers = [
      'رقم الفاتورة',
      'اسم الطفل',
      'الفوج',
      'الشهر',
      'المبلغ الجملي (د.ت)',
      'المدفوع (د.ت)',
      'المتبقي (د.ت)',
      'الحالة',
      'تاريخ الاستحقاق',
      'هاتف الولي'
    ];

    const rows = filteredInvoices.map(inv => {
      const child = children.find(c => c.id === inv.childId);
      const cls = classes.find(cl => cl.id === child?.classId);
      return [
        inv.invoiceNumber,
        child?.fullName || 'غير معروف',
        cls?.name || 'غير محدد',
        inv.month,
        inv.totalAmount.toFixed(3),
        inv.paidAmount.toFixed(3),
        inv.remainingAmount.toFixed(3),
        inv.status === 'paid' ? 'خلاص تام' : inv.status === 'partial' ? 'دفعة جزئية' : 'غير مسددة',
        inv.dueDate,
        child?.fatherPhone || child?.motherPhone || ''
      ];
    });

    exportToCSV(`التقرير_المالي_روضتي_${selectedMonth}`, rows, headers);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 4 Main Module Tabs Navigator */}
      <div className="bg-white p-2 md:p-3 rounded-3xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setActiveSubTab('invoicing')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'invoicing'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>1. المداخيل والفوترة ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'expenses'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>2. المصاريف والنفقات ({expenses.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('profit_loss')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'profit_loss'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. حساب النتائج والأرباح 💰</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'reports'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. التقارير المالية (يومي/شهري/سنوي)</span>
          </button>
        </div>

        {/* Global Financial Quick Pill */}
        <div className="hidden xl:flex items-center gap-3 text-xs px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-200 font-bold">
          <span className="text-emerald-700">مداخيل: {formatTND(totalCollectedAll)}</span>
          <span className="text-slate-300">|</span>
          <span className="text-rose-700">مصاريف: {formatTND(totalExpensesAll)}</span>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-900 font-black">المرابيح: {formatTND(netProfitAll)}</span>
        </div>
      </div>

      {/* Render Sub Tabs */}
      {activeSubTab === 'expenses' && <FinanceExpenses />}
      {activeSubTab === 'profit_loss' && <FinanceProfitLoss />}
      {activeSubTab === 'reports' && <FinanceReports />}

      {/* INVOICING TAB CONTENT */}
      {activeSubTab === 'invoicing' && (
        <div className="space-y-6">
          {/* Financial Top Header */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <Receipt className="w-6 h-6 text-amber-600" />
                <span>الفوترة والاشتراكات وسندات القبض (د.ت)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                إصدار فواتير الاشتراكات، الإطعام، النقل، والنوادي، وطباعة سندات القبض الرسمية بالدينار التونسي
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => generateMonthlyInvoices(selectedMonth)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-amber-200/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>توليد فواتير شهر {selectedMonth} آلياً</span>
              </button>

              <button
                onClick={() => setIsNewInvoiceModalOpen(true)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>فاتورة مخصصة</span>
              </button>

              <button
                onClick={handleExportFinanceCSV}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                title="تصدير Excel"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-xs font-bold text-slate-400">إجمالي الفواتير الصادرة</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-2">{formatTND(totalBilled)}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{filteredInvoices.length} فواتير مسجلة</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm">
              <div className="text-xs font-bold text-emerald-600">المداخيل المستخلصة (الخلاص)</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2">{formatTND(totalCollected)}</div>
              <div className="text-xs text-emerald-600 mt-1 font-bold">
                نسبة الاستخلاص: {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}%
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">
              <div className="text-xs font-bold text-rose-600">المتأخرات والديون المعلقة</div>
              <div className="text-2xl font-extrabold text-rose-600 mt-2">{formatTND(totalDue)}</div>
              <div className="text-xs text-rose-600 mt-1 font-medium">
                {filteredInvoices.filter(i => i.status !== 'paid').length} فواتير غير مسددة
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="min-w-[200px] flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث برقم الفاتورة، اسم الطفل أو الولي..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">الشهر:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">حالة الدفع:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="paid">خلاص تام (مسددة)</option>
                  <option value="partial">دفعة جزئية</option>
                  <option value="unpaid">غير مدفوعة (متأخرات)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-4">رقم الفاتورة</th>
                    <th className="p-4">اسم الطفل والفوج</th>
                    <th className="p-4">الشهر</th>
                    <th className="p-4">تفاصيل الخدمات</th>
                    <th className="p-4">المبلغ الإجمالي</th>
                    <th className="p-4">المدفوع</th>
                    <th className="p-4">المتبقي</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const child = children.find(c => c.id === inv.childId);
                    const cls = classes.find(cl => cl.id === child?.classId);
                    const lastPayment = inv.payments[inv.payments.length - 1];

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                        <td className="p-4">
                          <div className="font-extrabold text-slate-800 flex items-center gap-2">
                            {child?.photoUrl && <img src={child.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />}
                            <span>{child?.fullName || 'طفل غير مسجل'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{cls?.name || 'غير محدد'}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">{inv.month}</td>
                        <td className="p-4">
                          <div className="text-[11px] text-slate-600 space-y-0.5 max-w-[200px]">
                            {inv.items.map((itm, idx) => (
                              <div key={idx} className="truncate">• {itm.description}</div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-slate-800">{formatTND(inv.totalAmount)}</td>
                        <td className="p-4 font-bold text-emerald-700">{formatTND(inv.paidAmount)}</td>
                        <td className="p-4 font-bold text-rose-600">{formatTND(inv.remainingAmount)}</td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-block ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'partial'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {inv.status === 'paid' ? 'خلاص تام ✓' : inv.status === 'partial' ? 'دفعة جزئية ⌛' : 'غير مسددة ✗'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => handleOpenPayment(inv)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>تسجيل دفعة</span>
                              </button>
                            )}

                            {lastPayment && child && (
                              <button
                                onClick={() => setPrintReceiptData({ invoice: inv, payment: lastPayment, child })}
                                title="طباعة سند القبض"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                              >
                                <Printer className="w-4 h-4 text-indigo-600" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`هل تريد حذف الفاتورة ${inv.invoiceNumber}؟`)) deleteInvoice(inv.id);
                              }}
                              title="حذف الفاتورة"
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInvoices.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  لا توجد فواتير مطابقة لشروط البحث أو للشهر المحدد.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PAYMENT RECORD MODAL -------------------- */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>تسجيل دفعة وإصدار سند قبض</span>
              </h3>
              <button
                onClick={() => setPayingInvoice(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">الفاتورة:</span>
                <span className="font-mono font-bold text-slate-800">{payingInvoice.invoiceNumber} ({payingInvoice.month})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الطفل:</span>
                <span className="font-bold text-slate-800">{children.find(c => c.id === payingInvoice.childId)?.fullName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-bold">المبلغ المتبقي:</span>
                <span className="font-extrabold text-rose-600 text-sm">{formatTND(payingInvoice.remainingAmount)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المدفوع (د.ت) *</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  max={payingInvoice.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-extrabold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                >
                  <option value="cash">نقداً (Espèces / كاش)</option>
                  <option value="check">شيك بنكي (Chèque)</option>
                  <option value="bank_transfer">تحويل بنكي / بريدي (Virement)</option>
                </select>
              </div>

              {paymentMethod === 'check' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الشيك واسم البنك *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: CHQ-BIAT-123456"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات على سند القبض</label>
                <input
                  type="text"
                  placeholder="مثال: خلاص قسط أول، تسليم السند للأم..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الخلاص وطباعة السند</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- NEW CUSTOM INVOICE MODAL -------------------- */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">إنشاء فاتورة يدوية مخصصة</h3>
              <button
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateManualInvoice} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الطفل المعني *</label>
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الشهر *</label>
                  <input
                    type="month"
                    value={newInvMonth}
                    onChange={(e) => setNewInvMonth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-xs text-slate-700">بنود ومكونات الفاتورة:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="البيان (مثال: اشتراك نادي، زي موحد...)"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="المبلغ (د.ت)"
                    value={itemAmount || ''}
                    onChange={(e) => setItemAmount(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                  >
                    + إضافة
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {invoiceItems.map(itm => (
                    <div key={itm.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 text-xs">
                      <span>{itm.description}</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800">{formatTND(itm.amount)}</strong>
                        <button type="button" onClick={() => handleRemoveItem(itm.id)} className="text-rose-500 font-bold">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ الخصم إن وجد (د.ت)</label>
                  <input
                    type="number"
                    value={invDiscount}
                    onChange={(e) => setInvDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سبب الخصم</label>
                  <input
                    type="text"
                    placeholder="تخفيض خاص..."
                    value={invDiscountReason}
                    onChange={(e) => setInvDiscountReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  إصدار الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
