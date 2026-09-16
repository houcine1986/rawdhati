import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Download,
  Receipt,
  Users,
  Building,
  Utensils,
  Bus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTND, EXPENSE_CATEGORIES_MAP, exportToCSV } from '../utils/helpers';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  Line,
  ComposedChart
} from 'recharts';

const ARABIC_MONTH_NAMES: { [key: string]: string } = {
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

const PIE_COLORS = [
  '#6366F1', // indigo
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#0EA5E9', // sky
  '#8B5CF6', // purple
  '#14B8A6', // teal
  '#F97316', // orange
  '#3B82F6', // blue
  '#64748B', // slate
];

export const FinanceProfitLoss: React.FC = () => {
  const { invoices, expenses, children, settings } = useApp();

  const [periodFilter, setPeriodFilter] = useState<'all' | '2026' | 'current_month'>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // Month-by-Month Aggregate Data for 2026
  const monthlyComparisonData = useMemo(() => {
    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
    
    return months.map(m => {
      const [year, month] = m.split('-');
      const monthLabel = ARABIC_MONTH_NAMES[month] || month;

      // Revenues in this month (paid amount)
      const monthInvs = invoices.filter(i => i.month === m || i.issueDate.startsWith(m));
      const collectedRevenue = monthInvs.reduce((sum, i) => sum + i.paidAmount, 0);
      const totalBilled = monthInvs.reduce((sum, i) => sum + i.totalAmount, 0);

      // Expenses in this month
      const monthExps = expenses.filter(e => e.date.startsWith(m));
      const totalExpense = monthExps.reduce((sum, e) => sum + e.amount, 0);

      // Net Profit
      const netProfit = collectedRevenue - totalExpense;
      const margin = collectedRevenue > 0 ? (netProfit / collectedRevenue) * 100 : 0;

      return {
        monthKey: m,
        name: monthLabel,
        fullName: `${monthLabel} ${year}`,
        collectedRevenue,
        totalBilled,
        totalExpense,
        netProfit,
        margin: Math.round(margin),
      };
    });
  }, [invoices, expenses]);

  // Overall calculations based on periodFilter
  const summary = useMemo(() => {
    let filteredInvs = invoices;
    let filteredExps = expenses;

    if (periodFilter === '2026') {
      filteredInvs = invoices.filter(i => (i.month && i.month.startsWith('2026')) || i.issueDate.startsWith('2026'));
      filteredExps = expenses.filter(e => e.date.startsWith('2026'));
    } else if (periodFilter === 'current_month') {
      filteredInvs = invoices.filter(i => i.month === selectedMonth || i.issueDate.startsWith(selectedMonth));
      filteredExps = expenses.filter(e => e.date.startsWith(selectedMonth));
    }

    const totalRevenueBilled = filteredInvs.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalRevenueCollected = filteredInvs.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalRemainingDue = filteredInvs.reduce((sum, i) => sum + i.remainingAmount, 0);

    const totalExpenses = filteredExps.reduce((sum, e) => sum + e.amount, 0);
    
    // Net Profit: Revenues Collected - Total Expenses Paid
    const netProfit = totalRevenueCollected - totalExpenses;
    const profitMargin = totalRevenueCollected > 0 ? (netProfit / totalRevenueCollected) * 100 : 0;

    return {
      totalRevenueBilled,
      totalRevenueCollected,
      totalRemainingDue,
      totalExpenses,
      netProfit,
      profitMargin: Math.round(profitMargin * 10) / 10,
      isProfitable: netProfit >= 0,
      invCount: filteredInvs.length,
      expCount: filteredExps.length,
    };
  }, [invoices, expenses, periodFilter, selectedMonth]);

  // Expenses Category Breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    let filteredExps = expenses;
    if (periodFilter === '2026') {
      filteredExps = expenses.filter(e => e.date.startsWith('2026'));
    } else if (periodFilter === 'current_month') {
      filteredExps = expenses.filter(e => e.date.startsWith(selectedMonth));
    }

    const total = filteredExps.reduce((sum, e) => sum + e.amount, 0);
    const map: Record<string, number> = {};

    filteredExps.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map).map(([catKey, amount], idx) => {
      const catInfo = EXPENSE_CATEGORIES_MAP[catKey] || EXPENSE_CATEGORIES_MAP.other;
      const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
      return {
        key: catKey,
        name: catInfo.label,
        value: amount,
        percent,
        color: PIE_COLORS[idx % PIE_COLORS.length],
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, periodFilter, selectedMonth]);

  // Export Financial Summary to CSV
  const handleExportSummaryCSV = () => {
    const headers = ['الشهر', 'إجمالي الفوترة (د.ت)', 'المداخيل المحصلة (د.ت)', 'إجمالي المصاريف (د.ت)', 'صافي المرابيح (د.ت)', 'هامش الربح (%)'];
    const rows = monthlyComparisonData.map(d => [
      d.fullName,
      d.totalBilled.toFixed(3),
      d.collectedRevenue.toFixed(3),
      d.totalExpense.toFixed(3),
      d.netProfit.toFixed(3),
      `${d.margin}%`
    ]);

    exportToCSV(`جدول_الأرباح_والخسائر_${periodFilter}`, rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Control Ribbon */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span>جدول حساب النتائج والأرباح الصافية (Profit & Loss)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            طرح إجمالي المصاريف من المداخيل المحصلة وحساب صافي المرابيح وهامش الربحية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setPeriodFilter('2026')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodFilter === '2026' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كامل سنة 2026
            </button>
            <button
              onClick={() => setPeriodFilter('current_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'current_month' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهر محدد
            </button>
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كامل المدة
            </button>
          </div>

          {periodFilter === 'current_month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
            />
          )}

          <button
            onClick={handleExportSummaryCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards: Revenue, Expenses, Net Profit, Margin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenues */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-5 rounded-3xl border border-emerald-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">إجمالي المداخيل المحصلة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-200/70 text-emerald-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-900">
            {formatTND(summary.totalRevenueCollected)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold pt-1 border-t border-emerald-100">
            <span>مفوتر: {formatTND(summary.totalRevenueBilled)}</span>
            <span>باقي: {formatTND(summary.totalRemainingDue)}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-rose-50 via-pink-50/40 to-white p-5 rounded-3xl border border-rose-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">إجمالي المصاريف والنفقات</span>
            <div className="w-9 h-9 rounded-xl bg-rose-200/70 text-rose-800 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-rose-900">
            {formatTND(summary.totalExpenses)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-rose-700 font-semibold pt-1 border-t border-rose-100">
            <span>{summary.expCount} إذن صرف مسجل</span>
            <span>تشغيلية ورأسمالية</span>
          </div>
        </div>

        {/* Net Profit (المرابيح الصافية) */}
        <div className={`p-5 rounded-3xl border shadow-sm space-y-2 ${
          summary.isProfitable 
            ? 'bg-gradient-to-br from-indigo-50 via-sky-50/40 to-white border-indigo-200/90' 
            : 'bg-gradient-to-br from-amber-50 via-orange-50/40 to-white border-amber-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
              <span>صافي المرابيح (الفائض المالي)</span>
              {summary.isProfitable ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-black">ربح إيجابي ✓</span>
              ) : (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] rounded-full font-black">عجز مالي ⚠</span>
              )}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              summary.isProfitable ? 'bg-indigo-200/80 text-indigo-800' : 'bg-amber-200 text-amber-900'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl md:text-3xl font-black ${
            summary.isProfitable ? 'text-indigo-900' : 'text-amber-900'
          }`}>
            {formatTND(summary.netProfit)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-indigo-700 font-semibold pt-1 border-t border-indigo-100">
            <span>المداخيل المقبوضة - المصاريف</span>
            <span className="font-extrabold">{summary.isProfitable ? '+ فائض صافٍ' : '- عجز'}</span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50/40 to-white p-5 rounded-3xl border border-amber-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">نسبة هامش الربح الصافي</span>
            <div className="w-9 h-9 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-950">
            {summary.profitMargin}%
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden mt-2">
            <div 
              className={`h-full rounded-full ${summary.profitMargin > 30 ? 'bg-emerald-500' : summary.profitMargin > 15 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.max(0, Math.min(100, summary.profitMargin))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Comprehensive Evolution Chart: Revenues vs Expenses vs Net Profit */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>مقارنة تطور المداخيل والمصاريف وصافي المرابيح الشهرية (2026)</span>
            </h4>
            <p className="text-xs text-slate-500">
              رسم بياني مركب يوضح المداخيل المحصلة (أخضر)، المصاريف (وردي)، ومنحنى صافي المرابيح (أزرق)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>المداخيل</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>المصاريف</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-700">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span>المرابيح الصافية</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyComparisonData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val} د.ت`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl text-xs shadow-xl space-y-1.5 text-right font-sans" dir="rtl">
                        <div className="font-bold border-b border-slate-700 pb-1 text-amber-300">
                          {data.fullName}
                        </div>
                        <div className="text-emerald-300 flex justify-between gap-4">
                          <span>المداخيل المقبوضة:</span>
                          <span className="font-black">{formatTND(data.collectedRevenue)}</span>
                        </div>
                        <div className="text-rose-300 flex justify-between gap-4">
                          <span>إجمالي المصاريف:</span>
                          <span className="font-black">{formatTND(data.totalExpense)}</span>
                        </div>
                        <div className="text-indigo-300 flex justify-between gap-4 pt-1 border-t border-slate-700 font-extrabold">
                          <span>صافي المرابيح:</span>
                          <span className="font-black">{formatTND(data.netProfit)}</span>
                        </div>
                        <div className="text-amber-300 flex justify-between gap-4 text-[10px]">
                          <span>هامش الربح:</span>
                          <span>{data.margin}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="collectedRevenue" name="المداخيل" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={36} />
              <Bar dataKey="totalExpense" name="المصاريف" fill="#F43F5E" radius={[8, 8, 0, 0]} maxBarSize={36} />
              <Line type="monotone" dataKey="netProfit" name="المرابيح الصافية" stroke="#4F46E5" strokeWidth={3} dot={{ r: 5, fill: '#4F46E5' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Category Breakdown Pie Chart + Monthly Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Breakdown */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" />
              <span>توزيع المصاريف حسب الأقسام</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              نسبة كل بند من إجمالي النفقات ({formatTND(summary.totalExpenses)})
            </p>
          </div>

          <div className="h-56 w-full relative" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expenseCategoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${formatTND(val)}`, 'المبلغ']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-bold">المصاريف</span>
              <span className="text-xs font-black text-slate-800">{formatTND(summary.totalExpenses)}</span>
            </div>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {expenseCategoryBreakdown.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-xs py-1 px-2 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-700 font-bold truncate max-w-[130px]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-black text-slate-800">{formatTND(item.value)}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({item.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Monthly Financial Breakdown Table */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>الجدول التفصيلي لحسابات النتائج الشهرية (2026)</span>
            </h4>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
              8 أشهر مفصلة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">الشهر</th>
                  <th className="py-2.5 px-3">المداخيل المحصلة</th>
                  <th className="py-2.5 px-3">المصاريف التشغيلية</th>
                  <th className="py-2.5 px-3">صافي المرابيح</th>
                  <th className="py-2.5 px-3 text-center">هامش الربح</th>
                  <th className="py-2.5 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyComparisonData.map((row) => (
                  <tr key={row.monthKey} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-slate-800">
                      {row.fullName}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {formatTND(row.collectedRevenue)}
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-700">
                      {formatTND(row.totalExpense)}
                    </td>
                    <td className="py-3 px-3 font-black text-indigo-900">
                      {formatTND(row.netProfit)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      <span className={`px-2 py-0.5 rounded-lg text-[11px] ${
                        row.margin > 30 ? 'bg-emerald-50 text-emerald-700 font-black' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {row.margin}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.netProfit >= 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>فائض</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-extrabold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>عجز</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
