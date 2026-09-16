import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Download, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  FileText, 
  Sparkles,
  Users,
  Building,
  Zap,
  Utensils,
  Bus,
  BookOpen,
  Shield,
  Tag,
  Clock,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { formatTND, formatArabicDate, exportToCSV, EXPENSE_CATEGORIES_MAP, getCategoryLabel } from '../utils/helpers';

export const FinanceExpenses: React.FC = () => {
  const { 
    expenses, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    generateSalaryExpenses, 
    staff,
    currentUser,
    settings 
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isSalaryConfirmOpen, setIsSalaryConfirmOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    paymentMethod: PaymentMethod;
    beneficiary: string;
    invoiceRef: string;
    notes: string;
    isRecurring: boolean;
  }>({
    title: '',
    category: 'food_canteen',
    amount: 50,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    beneficiary: '',
    invoiceRef: '',
    notes: '',
    isRecurring: false,
  });

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesMonth = !selectedMonth || exp.date.startsWith(selectedMonth);
      const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
      const matchesMethod = selectedMethod === 'all' || exp.paymentMethod === selectedMethod;
      const matchesSearch = 
        !searchTerm ||
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.invoiceRef && exp.invoiceRef.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesMonth && matchesCategory && matchesMethod && matchesSearch;
    });
  }, [expenses, selectedMonth, selectedCategory, selectedMethod, searchTerm]);

  // Statistics for selected filters
  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown for current selection
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [filteredExpenses]);

  // Open create modal
  const handleOpenCreate = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'food_canteen',
      amount: 50,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      beneficiary: '',
      invoiceRef: '',
      notes: '',
      isRecurring: false,
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      paymentMethod: exp.paymentMethod,
      beneficiary: exp.beneficiary,
      invoiceRef: exp.invoiceRef || '',
      notes: exp.notes || '',
      isRecurring: exp.isRecurring || false,
    });
    setIsModalOpen(true);
  };

  // Save Expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) {
      alert('يرجى إدخال بيان المصروف والمبلغ بشكل صحيح');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        ...formData,
      });
    } else {
      addExpense({
        ...formData,
        recordedBy: currentUser.fullName,
      });
    }

    setIsModalOpen(false);
  };

  // Quick action: pay staff salaries
  const handlePaySalaries = () => {
    setIsSalaryConfirmOpen(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'رقم الإذن',
      'التاريخ',
      'بيان المصروف',
      'الصنف',
      'المبلغ (د.ت)',
      'المستفيد / المزود',
      'طريقة الدفع',
      'رقم الفاتورة / الوصل',
      'سجل بواسطة',
      'ملاحظات'
    ];

    const rows = filteredExpenses.map(e => [
      e.expenseNumber,
      e.date,
      e.title,
      getCategoryLabel(e.category),
      e.amount.toFixed(3),
      e.beneficiary,
      e.paymentMethod === 'cash' ? 'نقداً' : e.paymentMethod === 'check' ? 'شيك' : 'تحويل بنكي',
      e.invoiceRef || '',
      e.recordedBy,
      e.notes || ''
    ]);

    exportToCSV(`مصاريف_ونفقات_روضتي_${selectedMonth || 'الكل'}`, rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-rose-600" />
              <span>إدارة المصاريف والنفقات التشغيلية</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تسجيل وتوثيق فواتير المشتريات، كراء المقر، الأجور، الطاقة، والمصاريف اليومية
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePaySalaries}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 border border-indigo-200 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="توليد أذون صرف رواتب جميع المربيات والموظفات للشهر المحدد"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>صرف رواتب الشهر 👥</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف جديد</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Month Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">الشهر المستهدف</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">صنف المصروف</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="all">جميع الأصناف ({expenses.length})</option>
              {Object.entries(EXPENSE_CATEGORIES_MAP).map(([catKey, info]) => (
                <option key={catKey} value={catKey}>{info.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">طريقة الدفع</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="all">جميع طرق الدفع</option>
              <option value="cash">💵 نقداً (خزينة الروضة)</option>
              <option value="bank_transfer">🏛️ تحويل بنكي</option>
              <option value="check">📝 شيك بنكي</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">بحث في المصاريف</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="بيان، مزود، رقم وصل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 p-4 rounded-3xl border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800 block">إجمالي المصاريف المحددة</span>
            <span className="text-2xl font-black text-rose-900 mt-1 block">
              {formatTND(totalFilteredAmount)}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">عدد الأذون: {filteredExpenses.length} مصروف</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-200/70 text-rose-700 flex items-center justify-center font-bold">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 p-4 rounded-3xl border border-indigo-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-800 block">أجور ورواتب الإطار</span>
            <span className="text-2xl font-black text-indigo-900 mt-1 block">
              {formatTND(categoryStats['salaries'] || 0)}
            </span>
            <span className="text-[10px] text-indigo-600 font-medium">
              {totalFilteredAmount > 0 ? Math.round(((categoryStats['salaries'] || 0) / totalFilteredAmount) * 100) : 0}% من إجمالي المصاريف
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-200/70 text-indigo-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-3xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 block">المطعم والتغذية واللمجة</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">
              {formatTND(categoryStats['food_canteen'] || 0)}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              {totalFilteredAmount > 0 ? Math.round(((categoryStats['food_canteen'] || 0) / totalFilteredAmount) * 100) : 0}% من إجمالي المصاريف
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-200/70 text-emerald-700 flex items-center justify-center font-bold">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h4 className="font-extrabold text-sm text-slate-800">
              سجل أذون الصرف والمصاريف ({filteredExpenses.length})
            </h4>
          </div>
          <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
            المجموع: {formatTND(totalFilteredAmount)}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <TrendingDown className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-bold text-slate-600">لا توجد مصاريف مطابقة لخيارات البحث أو التصفية</p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 text-xs text-rose-600 font-bold hover:underline"
            >
              + إضافة أول مصروف الآن
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">رقم الإذن والتاريخ</th>
                  <th className="py-3 px-4">بيان المصروف</th>
                  <th className="py-3 px-4">الصنف</th>
                  <th className="py-3 px-4">المستفيد / المزود</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.map((exp) => {
                  const catInfo = EXPENSE_CATEGORIES_MAP[exp.category] || EXPENSE_CATEGORIES_MAP.other;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800 text-xs">{exp.expenseNumber}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{formatArabicDate(exp.date)}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-800">{exp.title}</div>
                        {exp.invoiceRef && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            مرجع: {exp.invoiceRef}
                          </span>
                        )}
                        {exp.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{exp.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold border ${catInfo.bg} ${catInfo.color} ${catInfo.border}`}>
                          {catInfo.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{exp.beneficiary || 'غير محدد'}</div>
                        <div className="text-[10px] text-slate-400">سجل بواسطة: {exp.recordedBy}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-600">
                          {exp.paymentMethod === 'cash' && '💵 نقداً'}
                          {exp.paymentMethod === 'bank_transfer' && '🏛️ تحويل'}
                          {exp.paymentMethod === 'check' && '📝 شيك'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-rose-700 text-sm">
                          {formatTND(exp.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="تعديل المصروف"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setExpenseToDelete(exp)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف إذن الصرف نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <span>{editingExpense ? 'تعديل بيانات المصروف' : 'تسجيل إذن صرف / مصروف جديد'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان المصروف (العنوان) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مشتريات خضر ولحوم، صيانة مكيف، فاتورة كهرباء..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ بالدينار التونسي (د.ت) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-rose-700 focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الصرف *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">صنف المصروف *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-400"
                  >
                    {Object.entries(EXPENSE_CATEGORIES_MAP).map(([catKey, info]) => (
                      <option key={catKey} value={catKey}>{info.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="cash">💵 نقداً من الخزينة</option>
                    <option value="bank_transfer">🏛️ تحويل بنكي</option>
                    <option value="check">📝 شيك بنكي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستفيد / المزود / الموظف</label>
                  <input
                    type="text"
                    placeholder="اسم الموظف أو الشركة المزودة..."
                    value={formData.beneficiary}
                    onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الفاتورة أو وصل الشراء</label>
                  <input
                    type="text"
                    placeholder="BL-1234 أو STEG-9988..."
                    value={formData.invoiceRef}
                    onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات وتفاصيل إضافية</label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل حول المصروف..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="recurringExp"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-400 cursor-pointer"
                />
                <label htmlFor="recurringExp" className="font-semibold text-slate-700 cursor-pointer">
                  مصروف دوري متكرر شهرياً (مثل الكراء والرواتب)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {editingExpense ? 'حفظ التعديلات' : 'تسجيل المصروف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">تأكيد حذف إذن الصرف</h3>
                <p className="text-xs text-slate-500">سيتم شطب هذا السند نهائياً من سجل المصاريف والمحاسبة</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">رقم الإذن:</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  {expenseToDelete.expenseNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">بيان المصروف:</span>
                <span className="font-bold text-slate-800">{expenseToDelete.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">المستفيد:</span>
                <span className="font-semibold text-slate-700">{expenseToDelete.beneficiary || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">المبلغ الإجمالي:</span>
                <span className="font-black text-rose-600 text-sm">{formatTND(expenseToDelete.amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد حذف إذن الصرف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Pay Salaries Modal */}
      {isSalaryConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">توليد أذون صرف رواتب الشهر</h3>
                <p className="text-xs text-slate-500">إصدار أذون صرف آلية لجميع المربيات والموظفات النشطات</p>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
              <p>
                سيتم إصدار أذون صرف رواتب شهر <strong className="font-bold text-indigo-800">{selectedMonth || 'الشهر الحالي'}</strong> لجميع الموظفين الذين لم تُصرف رواتبهم بعد.
              </p>
              <p className="text-[11px] text-indigo-700">
                عدد الموظفات المؤهلات: {staff.filter(s => s.status === 'active').length} موظفة.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsSalaryConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  generateSalaryExpenses(selectedMonth || '2026-08');
                  setIsSalaryConfirmOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد تسجيل أذون الصرف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
