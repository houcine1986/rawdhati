import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Printer, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Building,
  CreditCard,
  Banknote,
  Receipt,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  formatTND, 
  formatArabicDate, 
  exportToCSV, 
  EXPENSE_CATEGORIES_MAP, 
  getCategoryLabel, 
  printDocumentSection,
  numberToArabicWords 
} from '../utils/helpers';

type ReportType = 'daily' | 'monthly' | 'yearly';

const MONTH_NAMES: { [key: string]: string } = {
  '01': 'جانفي',
  '02': 'فيفري',
  '03': 'مارس',
  '04': 'أفريل',
  '05': 'ماي',
  '06': 'جوان',
  '07': 'جويلية',
  '08': 'أوت',
  '09': 'سبتمبر',
  '10': 'أكتوبر',
  '11': 'نوفمبر',
  '12': 'ديسمبر',
};

export const FinanceReports: React.FC = () => {
  const { invoices, expenses, children, settings, currentUser } = useApp();

  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedDay, setSelectedDay] = useState<string>('2026-08-24');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // --- 1. DAILY REPORT DATA ---
  const dailyData = useMemo(() => {
    // Payments made on this date
    const dailyPayments: Array<{
      paymentId: string;
      receiptNumber: string;
      invoiceNumber: string;
      childName: string;
      parentName: string;
      amount: number;
      method: string;
      notes?: string;
    }> = [];

    invoices.forEach(inv => {
      inv.payments.forEach(p => {
        if (p.paymentDate === selectedDay) {
          const ch = children.find(c => c.id === inv.childId);
          dailyPayments.push({
            paymentId: p.id,
            receiptNumber: p.receiptNumber,
            invoiceNumber: inv.invoiceNumber,
            childName: ch ? `${ch.firstName} ${ch.lastName}` : inv.childId,
            parentName: ch ? `${ch.fatherName || ch.motherName}` : 'ولي أمر',
            amount: p.amount,
            method: p.method,
            notes: p.notes,
          });
        }
      });
    });

    // Expenses paid on this date
    const dailyExpenses = expenses.filter(e => e.date === selectedDay);

    const totalIncome = dailyPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpense = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netDaily = totalIncome - totalExpense;

    return {
      date: selectedDay,
      payments: dailyPayments,
      expenses: dailyExpenses,
      totalIncome,
      totalExpense,
      netDaily,
      cashFlowPositive: netDaily >= 0,
    };
  }, [invoices, expenses, children, selectedDay]);

  // --- 2. MONTHLY REPORT DATA ---
  const monthlyData = useMemo(() => {
    const monthInvoices = invoices.filter(i => i.month === selectedMonth || i.issueDate.startsWith(selectedMonth));
    const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

    const totalBilled = monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalCollected = monthInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalRemaining = monthInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalCollected - totalExpenses;
    const profitMargin = totalCollected > 0 ? Math.round((netProfit / totalCollected) * 1000) / 10 : 0;

    // Expenses by category for this month
    const categoryMap: Record<string, number> = {};
    monthExpenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    const categoryList = Object.entries(categoryMap).map(([key, amt]) => ({
      key,
      label: getCategoryLabel(key),
      amount: amt,
      percent: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      month: selectedMonth,
      invoices: monthInvoices,
      expenses: monthExpenses,
      totalBilled,
      totalCollected,
      totalRemaining,
      totalExpenses,
      netProfit,
      profitMargin,
      categoryList,
      isProfitable: netProfit >= 0,
    };
  }, [invoices, expenses, selectedMonth]);

  // --- 3. YEARLY REPORT DATA ---
  const yearlyData = useMemo(() => {
    const yearMonths = Array.from({ length: 12 }, (_, i) => {
      const mStr = String(i + 1).padStart(2, '0');
      return `${selectedYear}-${mStr}`;
    });

    const monthlyBreakdown = yearMonths.map(mKey => {
      const [y, mNum] = mKey.split('-');
      const label = MONTH_NAMES[mNum] || mNum;

      const mInvs = invoices.filter(i => (i.month === mKey) || (i.issueDate && i.issueDate.startsWith(mKey)));
      const mExps = expenses.filter(e => e.date && e.date.startsWith(mKey));

      const billed = mInvs.reduce((sum, i) => sum + i.totalAmount, 0);
      const collected = mInvs.reduce((sum, i) => sum + i.paidAmount, 0);
      const expenseAmt = mExps.reduce((sum, e) => sum + e.amount, 0);
      const net = collected - expenseAmt;
      const margin = collected > 0 ? Math.round((net / collected) * 100) : 0;

      return {
        key: mKey,
        monthNumber: mNum,
        monthName: label,
        fullName: `${label} ${y}`,
        billed,
        collected,
        expenses: expenseAmt,
        netProfit: net,
        margin,
      };
    });

    const totalAnnualBilled = monthlyBreakdown.reduce((sum, m) => sum + m.billed, 0);
    const totalAnnualCollected = monthlyBreakdown.reduce((sum, m) => sum + m.collected, 0);
    const totalAnnualExpenses = monthlyBreakdown.reduce((sum, m) => sum + m.expenses, 0);
    const totalAnnualNetProfit = totalAnnualCollected - totalAnnualExpenses;
    const annualProfitMargin = totalAnnualCollected > 0 ? Math.round((totalAnnualNetProfit / totalAnnualCollected) * 1000) / 10 : 0;

    // Annual Expenses Breakdown by category
    const yearExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedYear));
    const annualCatMap: Record<string, number> = {};
    yearExpenses.forEach(e => {
      annualCatMap[e.category] = (annualCatMap[e.category] || 0) + e.amount;
    });

    const annualCategoryList = Object.entries(annualCatMap).map(([key, amt]) => ({
      key,
      label: getCategoryLabel(key),
      amount: amt,
      percent: totalAnnualExpenses > 0 ? Math.round((amt / totalAnnualExpenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      year: selectedYear,
      monthlyBreakdown,
      totalAnnualBilled,
      totalAnnualCollected,
      totalAnnualExpenses,
      totalAnnualNetProfit,
      annualProfitMargin,
      annualCategoryList,
      isProfitable: totalAnnualNetProfit >= 0,
    };
  }, [invoices, expenses, selectedYear]);

  // Export handlers
  const handleExportReportCSV = () => {
    if (reportType === 'daily') {
      const headers = ['النوع', 'المرجع / الرقم', 'البيان', 'طريقة الدفع', 'المداخيل (د.ت)', 'المصاريف (د.ت)'];
      const rows: string[][] = [];
      
      dailyData.payments.forEach(p => {
        rows.push(['مداخيل (وصل خلاص)', p.receiptNumber, `خلاص الطفل: ${p.childName}`, p.method, p.amount.toFixed(3), '0.000']);
      });
      dailyData.expenses.forEach(e => {
        rows.push(['مصاريف (إذن صرف)', e.expenseNumber, e.title, e.paymentMethod, '0.000', e.amount.toFixed(3)]);
      });

      exportToCSV(`التقرير_المالي_اليومي_${selectedDay}`, rows, headers);
    } else if (reportType === 'monthly') {
      const headers = ['البند / الصنف', 'النوع', 'المبلغ بالدينار (د.ت)', 'النسبة / الملاحظات'];
      const rows: string[][] = [
        ['إجمالي المداخيل المفوترة', 'مداخيل', monthlyData.totalBilled.toFixed(3), `${monthlyData.invoices.length} فاتورة`],
        ['إجمالي المداخيل المحصلة نقداً وبنكياً', 'مداخيل', monthlyData.totalCollected.toFixed(3), 'المقبوضات الفعلية'],
        ['المستحقات المتبقية غير الخالصة', 'ديون', monthlyData.totalRemaining.toFixed(3), 'متخلدات بذمة الأولياء'],
        ['إجمالي المصاريف والنفقات', 'مصاريف', monthlyData.totalExpenses.toFixed(3), `${monthlyData.expenses.length} إذن صرف`],
        ['صافي المرابيح (الفائض المالي)', 'أرباح', monthlyData.netProfit.toFixed(3), `هامش الربح: ${monthlyData.profitMargin}%`],
      ];

      monthlyData.categoryList.forEach(c => {
        rows.push([`مصروف: ${c.label}`, 'مصاريف تفصيلية', c.amount.toFixed(3), `${c.percent}% من المصاريف`]);
      });

      exportToCSV(`التقرير_المالي_الشهري_${selectedMonth}`, rows, headers);
    } else {
      const headers = ['الشهر', 'المفوتر (د.ت)', 'المداخيل المحصلة (د.ت)', 'المصاريف (د.ت)', 'صافي المرابيح (د.ت)', 'هامش الربح (%)'];
      const rows = yearlyData.monthlyBreakdown.map(m => [
        m.fullName,
        m.billed.toFixed(3),
        m.collected.toFixed(3),
        m.expenses.toFixed(3),
        m.netProfit.toFixed(3),
        `${m.margin}%`
      ]);

      rows.push([
        'المجموع السنوي العام',
        yearlyData.totalAnnualBilled.toFixed(3),
        yearlyData.totalAnnualCollected.toFixed(3),
        yearlyData.totalAnnualExpenses.toFixed(3),
        yearlyData.totalAnnualNetProfit.toFixed(3),
        `${yearlyData.annualProfitMargin}%`
      ]);

      exportToCSV(`التقرير_المالي_السنوي_${selectedYear}`, rows, headers);
    }
  };

  const handlePrintCurrentReport = () => {
    printDocumentSection('printable-financial-report', `التقرير_المالي_${reportType}_روضتي`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Ribbon */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              <span>التقارير المالية المحاسبية المفصلة</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              إصدار وطباعة كشوفات المداخيل، المصاريف والمرابيح الدورية (يومية، شهرية، سنوية)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportReportCSV}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={handlePrintCurrentReport}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير الرسمي</span>
            </button>
          </div>
        </div>

        {/* Report Period Switcher & Date Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setReportType('daily')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                reportType === 'daily' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 التقرير اليومي (الخزينة)
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                reportType === 'monthly' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 التقرير الشهري المفصل
            </button>
            <button
              onClick={() => setReportType('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                reportType === 'yearly' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏆 التقرير السنوي الشامل
            </button>
          </div>

          <div className="flex items-center gap-2">
            {reportType === 'daily' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">اختر اليوم:</span>
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
            )}

            {reportType === 'monthly' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">اختر الشهر:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
            )}

            {reportType === 'yearly' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">اختر السنة:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="2026">سنة 2026</option>
                  <option value="2025">سنة 2025</option>
                  <option value="2024">سنة 2024</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINTABLE DOCUMENT WRAPPER */}
      <div id="printable-financial-report" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Printable Header (Official Header) */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">{settings.name}</h2>
            <p className="text-xs text-slate-600">{settings.tagline}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              المعرف الجبائي: {settings.fiscalNumber || '1458920/M/A/000'} | هاتف: {settings.phone}
            </p>
            <p className="text-[11px] text-slate-500">العنوان: {settings.address}</p>
          </div>

          <div className="text-left space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-xl text-xs font-black">
              {reportType === 'daily' && 'كشف الخزينة والسيولة اليومي'}
              {reportType === 'monthly' && 'التقرير المالي وحساب النتائج الشهري'}
              {reportType === 'yearly' && 'التقرير المالي السنوي والختام المحاسبي'}
            </div>
            <div className="text-xs text-slate-600 font-bold">
              الفترة:{' '}
              {reportType === 'daily' && formatArabicDate(selectedDay)}
              {reportType === 'monthly' && `شهر ${MONTH_NAMES[selectedMonth.split('-')[1]] || selectedMonth} (${selectedMonth})`}
              {reportType === 'yearly' && `كامل السنة المالية ${selectedYear}`}
            </div>
            <div className="text-[10px] text-slate-400">
              تاريخ الاستخراج: {new Date().toLocaleDateString('ar-TN')} - بواسطة {currentUser.fullName}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: DAILY FINANCIAL REPORT                                */}
        {/* ------------------------------------------------------------- */}
        {reportType === 'daily' && (
          <div className="space-y-6">
            {/* Daily KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 block">مداخيل اليوم المقبوضة</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">
                  {formatTND(dailyData.totalIncome)}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {dailyData.payments.length} وصولات خلاص
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-xs font-bold text-rose-800 block">مصاريف اليوم المدفوعة</span>
                <span className="text-2xl font-black text-rose-900 mt-1 block">
                  {formatTND(dailyData.totalExpense)}
                </span>
                <span className="text-[10px] text-rose-700 font-medium">
                  {dailyData.expenses.length} أذون صرف
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${dailyData.cashFlowPositive ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-300'}`}>
                <span className="text-xs font-bold text-indigo-800 block">صافي التدفق المالي اليومي</span>
                <span className="text-2xl font-black text-indigo-950 mt-1 block">
                  {formatTND(dailyData.netDaily)}
                </span>
                <span className="text-[10px] text-indigo-700 font-medium">
                  {dailyData.cashFlowPositive ? 'فائض سيولة نقدي إيجابي ✓' : 'عجز سيولة يومي ⚠'}
                </span>
              </div>
            </div>

            {/* Income Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>1. تفاصيل المقبوضات ومداخيل اليوم ({dailyData.payments.length})</span>
                </h4>
                <span className="text-xs font-black text-emerald-700">
                  المجموع: {formatTND(dailyData.totalIncome)}
                </span>
              </div>

              {dailyData.payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">لا توجد مداخيل مقبوضة في هذا اليوم</p>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">رقم الوصل</th>
                      <th className="py-2 px-3">رقم الفاتورة</th>
                      <th className="py-2 px-3">اسم الطفل والولي</th>
                      <th className="py-2 px-3">طريقة الخلاص</th>
                      <th className="py-2 px-3 text-left">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyData.payments.map(p => (
                      <tr key={p.paymentId}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{p.receiptNumber}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{p.invoiceNumber}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">{p.childName} ({p.parentName})</td>
                        <td className="py-2 px-3">
                          {p.method === 'cash' ? 'نقداً' : p.method === 'check' ? 'شيك' : 'تحويل بنكي'}
                        </td>
                        <td className="py-2 px-3 font-black text-emerald-700 text-left">{formatTND(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Expense Section */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>2. تفاصيل المدفوعات والمصاريف اليومية ({dailyData.expenses.length})</span>
                </h4>
                <span className="text-xs font-black text-rose-700">
                  المجموع: {formatTND(dailyData.totalExpense)}
                </span>
              </div>

              {dailyData.expenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">لا توجد مصاريف مسجلة في هذا اليوم</p>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">رقم الإذن</th>
                      <th className="py-2 px-3">بيان المصروف</th>
                      <th className="py-2 px-3">الصنف</th>
                      <th className="py-2 px-3">المستفيد</th>
                      <th className="py-2 px-3 text-left">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyData.expenses.map(e => (
                      <tr key={e.id}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{e.expenseNumber}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">{e.title}</td>
                        <td className="py-2 px-3 text-slate-600">{getCategoryLabel(e.category)}</td>
                        <td className="py-2 px-3 text-slate-600">{e.beneficiary}</td>
                        <td className="py-2 px-3 font-black text-rose-700 text-left">{formatTND(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: MONTHLY FINANCIAL REPORT                              */}
        {/* ------------------------------------------------------------- */}
        {reportType === 'monthly' && (
          <div className="space-y-6">
            {/* Monthly KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block">إجمالي الفوترة</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">
                  {formatTND(monthlyData.totalBilled)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {monthlyData.invoices.length} فواتير صادرة
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">المداخيل المقبوضة</span>
                <span className="text-xl font-black text-emerald-900 mt-1 block">
                  {formatTND(monthlyData.totalCollected)}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">المداخيل الفعلية</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-[11px] font-bold text-rose-800 block">المصاريف التشغيلية</span>
                <span className="text-xl font-black text-rose-900 mt-1 block">
                  {formatTND(monthlyData.totalExpenses)}
                </span>
                <span className="text-[10px] text-rose-700 font-medium">{monthlyData.expenses.length} إذن صرف</span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-800 block">صافي المرابيح الشهرية</span>
                <span className="text-xl font-black text-indigo-900 mt-1 block">
                  {formatTND(monthlyData.netProfit)}
                </span>
                <span className="text-[10px] text-indigo-700 font-bold">هامش الربح: {monthlyData.profitMargin}%</span>
              </div>
            </div>

            {/* In-depth Result Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 border-b border-slate-200">
                جدول حساب النتائج والأرباح لشهر {MONTH_NAMES[selectedMonth.split('-')[1]] || selectedMonth} {selectedMonth.split('-')[0]}
              </div>
              <table className="w-full text-right text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-emerald-50/50 font-bold">
                    <td className="py-2.5 px-4 text-emerald-900">1. مجموع المداخيل المقبوضة المحققة</td>
                    <td className="py-2.5 px-4 font-black text-emerald-800 text-left">{formatTND(monthlyData.totalCollected)}</td>
                  </tr>

                  {/* Expenses categorized */}
                  <tr className="bg-slate-50 font-bold text-slate-700">
                    <td colSpan={2} className="py-2 px-4 text-rose-900">2. تفصيل المصاريف والنفقات التشغيلية:</td>
                  </tr>
                  {monthlyData.categoryList.map(cat => (
                    <tr key={cat.key} className="hover:bg-slate-50">
                      <td className="py-2 px-8 text-slate-600">
                        • {cat.label} ({cat.percent}%)
                      </td>
                      <td className="py-2 px-4 font-mono font-bold text-rose-700 text-left">
                        {formatTND(cat.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-rose-50/60 font-bold text-rose-950">
                    <td className="py-2.5 px-4">مجموع المصاريف والنفقات</td>
                    <td className="py-2.5 px-4 font-black text-left">{formatTND(monthlyData.totalExpenses)}</td>
                  </tr>

                  {/* Final Net Result */}
                  <tr className="bg-indigo-100/70 font-black text-indigo-950 text-sm">
                    <td className="py-3 px-4">
                      النتيجة الصافية (الفائض المالي / المرابيح):
                      <span className="text-xs font-normal text-indigo-800 mr-2">
                        ({numberToArabicWords(Math.max(0, monthlyData.netProfit))})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left font-black text-base">
                      {formatTND(monthlyData.netProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: YEARLY FINANCIAL REPORT                               */}
        {/* ------------------------------------------------------------- */}
        {reportType === 'yearly' && (
          <div className="space-y-6">
            {/* Yearly Executive Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block">إجمالي المقبوضات السنوية</span>
                <span className="text-xl font-black text-emerald-900 mt-1 block">
                  {formatTND(yearlyData.totalAnnualCollected)}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">سنة {selectedYear}</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-[11px] font-bold text-rose-800 block">إجمالي المصاريف السنوية</span>
                <span className="text-xl font-black text-rose-900 mt-1 block">
                  {formatTND(yearlyData.totalAnnualExpenses)}
                </span>
                <span className="text-[10px] text-rose-700 font-medium">سنة {selectedYear}</span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-800 block">صافي الأرباح السنوية</span>
                <span className="text-xl font-black text-indigo-900 mt-1 block">
                  {formatTND(yearlyData.totalAnnualNetProfit)}
                </span>
                <span className="text-[10px] text-indigo-700 font-bold">هامش سنوي: {yearlyData.annualProfitMargin}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 block">متوسط الربح الشهري</span>
                <span className="text-xl font-black text-amber-950 mt-1 block">
                  {formatTND(yearlyData.totalAnnualNetProfit / 12)}
                </span>
                <span className="text-[10px] text-amber-800 font-medium">لكل شهر</span>
              </div>
            </div>

            {/* Complete 12-Month Detailed Grid */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 border-b border-slate-200">
                جدول تطور الحسابات المالية شهراً بشهر لسنة {selectedYear}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">الشهر</th>
                      <th className="py-2.5 px-3">المداخيل المفوترة</th>
                      <th className="py-2.5 px-3">المداخيل المقبوضة</th>
                      <th className="py-2.5 px-3">المصاريف</th>
                      <th className="py-2.5 px-3">صافي المرابيح</th>
                      <th className="py-2.5 px-3 text-center">هامش الربح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {yearlyData.monthlyBreakdown.map(m => (
                      <tr key={m.key} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{m.fullName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatTND(m.billed)}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{formatTND(m.collected)}</td>
                        <td className="py-2.5 px-3 font-bold text-rose-700">{formatTND(m.expenses)}</td>
                        <td className="py-2.5 px-3 font-black text-indigo-900">{formatTND(m.netProfit)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{m.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td className="py-3 px-3">المجموع السنوي العام:</td>
                      <td className="py-3 px-3">{formatTND(yearlyData.totalAnnualBilled)}</td>
                      <td className="py-3 px-3 text-emerald-800">{formatTND(yearlyData.totalAnnualCollected)}</td>
                      <td className="py-3 px-3 text-rose-800">{formatTND(yearlyData.totalAnnualExpenses)}</td>
                      <td className="py-3 px-3 text-indigo-900 text-sm">{formatTND(yearlyData.totalAnnualNetProfit)}</td>
                      <td className="py-3 px-3 text-center text-indigo-900">{yearlyData.annualProfitMargin}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Annual Expense Categories Audit */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h5 className="font-extrabold text-xs text-slate-800">
                التدقيق السنوي للمصاريف حسب الأصناف (سنة {selectedYear})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {yearlyData.annualCategoryList.map(c => (
                  <div key={c.key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{c.label}</div>
                      <div className="text-[10px] text-slate-400">النسبة من المصاريف: {c.percent}%</div>
                    </div>
                    <span className="font-black text-rose-700">{formatTND(c.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Printable Footer with Official Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div className="space-y-8">
            <span className="font-bold text-slate-700">المحاسب / المسؤول المالي</span>
            <div className="text-slate-400 font-handwriting text-sm pt-4">..................................</div>
          </div>
          <div className="space-y-8">
            <span className="font-bold text-slate-700">إدارة الروضة والختم الرسمي</span>
            <div className="text-slate-400 font-handwriting text-sm pt-4">..................................</div>
          </div>
        </div>
      </div>
    </div>
  );
};
