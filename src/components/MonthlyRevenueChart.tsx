import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTND } from '../utils/helpers';

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

export const MonthlyRevenueChart: React.FC = () => {
  const { invoices, setActiveTab } = useApp();
  const [chartType, setChartType] = useState<'area' | 'bar' | 'rate'>('area');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'last6'>('all');

  // Aggregation of invoices by month
  const monthlyData = useMemo(() => {
    // Map to collect monthly summaries
    const monthMap = new Map<string, {
      monthKey: string;
      label: string;
      collected: number;
      expected: number;
      outstanding: number;
      count: number;
      paidCount: number;
    }>();

    // Base months for 2026 to ensure continuous timeline
    const standardMonths = [
      '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'
    ];

    standardMonths.forEach(m => {
      const [year, month] = m.split('-');
      const monthName = ARABIC_MONTH_NAMES[month] || month;
      monthMap.set(m, {
        monthKey: m,
        label: `${monthName} ${year}`,
        collected: 0,
        expected: 0,
        outstanding: 0,
        count: 0,
        paidCount: 0,
      });
    });

    // Populate with actual invoice data from AppContext
    invoices.forEach(inv => {
      const monthKey = inv.month || inv.issueDate.substring(0, 7);
      if (!monthKey) return;

      if (!monthMap.has(monthKey)) {
        const [year, month] = monthKey.split('-');
        const monthName = ARABIC_MONTH_NAMES[month] || month;
        monthMap.set(monthKey, {
          monthKey,
          label: `${monthName} ${year || ''}`,
          collected: 0,
          expected: 0,
          outstanding: 0,
          count: 0,
          paidCount: 0,
        });
      }

      const entry = monthMap.get(monthKey)!;
      entry.expected += Number(inv.totalAmount || 0);
      entry.collected += Number(inv.paidAmount || 0);
      entry.outstanding += Number(inv.remainingAmount || 0);
      entry.count += 1;
      if (inv.status === 'paid') {
        entry.paidCount += 1;
      }
    });

    // Convert map to sorted array
    const sorted = Array.from(monthMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    // Calculate rates and format
    const formatted = sorted.map(item => {
      const rate = item.expected > 0 ? Math.round((item.collected / item.expected) * 100) : 0;
      return {
        ...item,
        rate,
        collectedFormatted: formatTND(item.collected),
        expectedFormatted: formatTND(item.expected),
        outstandingFormatted: formatTND(item.outstanding),
      };
    });

    if (selectedPeriod === 'last6') {
      return formatted.slice(-6);
    }
    return formatted;
  }, [invoices, selectedPeriod]);

  // Overall calculations across all processed months
  const totals = useMemo(() => {
    const totalCollected = monthlyData.reduce((acc, curr) => acc + curr.collected, 0);
    const totalExpected = monthlyData.reduce((acc, curr) => acc + curr.expected, 0);
    const totalOutstanding = monthlyData.reduce((acc, curr) => acc + curr.outstanding, 0);
    const averageMonthly = monthlyData.length > 0 ? Math.round(totalCollected / monthlyData.length) : 0;
    const overallRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    // Peak month
    let peakMonth = monthlyData[0];
    monthlyData.forEach(m => {
      if (m.collected > (peakMonth?.collected || 0)) {
        peakMonth = m;
      }
    });

    return {
      totalCollected,
      totalExpected,
      totalOutstanding,
      averageMonthly,
      overallRate,
      peakMonthLabel: peakMonth ? peakMonth.label : 'أوت 2026',
      peakMonthAmount: peakMonth ? peakMonth.collected : 0,
    };
  }, [monthlyData]);

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 text-right min-w-[200px]" dir="rtl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="font-black text-sm text-[#2D3436] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#6C5CE7]" />
              <span>{label}</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00B894]/15 text-[#00B894] font-bold">
              {data.rate}% استخلاص
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B894]"></span>
                المداخيل المحصلة:
              </span>
              <span className="font-black text-[#00B894] font-mono">{formatTND(data.collected)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#74B9FF]"></span>
                المبالغ المتوقعة:
              </span>
              <span className="font-bold text-[#0984e3] font-mono">{formatTND(data.expected)}</span>
            </div>

            {data.outstanding > 0 && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7675]"></span>
                  المتبقي قيد الانتظار:
                </span>
                <span className="font-bold text-[#FF7675] font-mono">{formatTND(data.outstanding)}</span>
              </div>
            )}

            <div className="pt-1.5 text-[10px] text-slate-400 text-center">
              عدد الفواتير: {data.count} (منها {data.paidCount} مسددة بالكامل)
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm p-6 md:p-8 border border-[#F0F0F0] space-y-6">
      {/* Header section with title and controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#00B894]/15 text-[#00B894] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg md:text-xl text-[#2D3436]">
                تطور المداخيل الشهرية بالدينار التونسي (د.ت)
              </h3>
              <p className="text-xs text-slate-500">
                متابعة الأداء المالي لمقابيض الروضة، معدلات التحصيل، ومقارنة المداخيل المحصلة بالمبالغ المتوقعة
              </p>
            </div>
          </div>
        </div>

        {/* Action and Chart Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Chart Type Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="مساحة بيانية تفاعلية"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>مساحي</span>
            </button>

            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="أعمدة بيانية للمقارنة"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>أعمدة</span>
            </button>

            <button
              onClick={() => setChartType('rate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartType === 'rate'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نسبة التحصيل %"
            >
              <LineIcon className="w-3.5 h-3.5" />
              <span>نسبة %</span>
            </button>
          </div>

          {/* Quick link to finance */}
          <button
            onClick={() => setActiveTab('finance')}
            className="px-4 py-2 bg-[#74B9FF]/15 hover:bg-[#74B9FF]/25 text-[#0984e3] font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>إدارة الفواتير وسندات القبض</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#55EFC4]/15 border border-[#55EFC4]/40">
          <div className="text-[11px] font-bold text-emerald-900">إجمالي المقابيض المحصلة</div>
          <div className="text-xl font-black text-emerald-950 mt-1 font-mono">{formatTND(totals.totalCollected)}</div>
          <div className="text-[10px] text-emerald-800/80 mt-0.5">من أصل {formatTND(totals.totalExpected)} متوقع</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#81ECEC]/20 border border-[#81ECEC]/40">
          <div className="text-[11px] font-bold text-cyan-950">معدل التحصيل الشهري</div>
          <div className="text-xl font-black text-cyan-950 mt-1 font-mono">{formatTND(totals.averageMonthly)}</div>
          <div className="text-[10px] text-cyan-900/80 mt-0.5">متوسط المداخيل لكل شهر</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFEAA7]/30 border border-[#FFD93D]/40">
          <div className="text-[11px] font-bold text-amber-950">نسبة الاستخلاص العامة</div>
          <div className="text-xl font-black text-amber-950 mt-1">{totals.overallRate}%</div>
          <div className="text-[10px] text-amber-900/80 mt-0.5">كفاءة تسديد أولياء الأمور</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAB1A0]/20 border border-[#FF7675]/30">
          <div className="text-[11px] font-bold text-rose-950">أفضل أداء شهري</div>
          <div className="text-sm font-black text-rose-950 mt-1 truncate">{totals.peakMonthLabel}</div>
          <div className="text-[10px] text-rose-900/80 mt-0.5 font-mono">{formatTND(totals.peakMonthAmount)} محصل</div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-72 md:h-80 w-full pt-3" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B894" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#00B894" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#74B9FF" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#74B9FF" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${val} د.ت`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => (
                  <span className="text-xs font-bold text-[#2D3436]">
                    {value === 'collected' ? 'المداخيل المحصلة (د.ت)' : 'المبالغ المتوقعة (د.ت)'}
                  </span>
                )}
              />
              <Area 
                type="monotone" 
                dataKey="expected" 
                name="expected" 
                stroke="#74B9FF" 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorExpected)" 
              />
              <Area 
                type="monotone" 
                dataKey="collected" 
                name="collected" 
                stroke="#00B894" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCollected)" 
                activeDot={{ r: 7, fill: '#00B894', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${val} د.ت`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => (
                  <span className="text-xs font-bold text-[#2D3436]">
                    {value === 'collected' ? 'المداخيل المحصلة (د.ت)' : 'المبالغ المتوقعة (د.ت)'}
                  </span>
                )}
              />
              <Bar 
                dataKey="expected" 
                name="expected" 
                fill="#74B9FF" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                dataKey="collected" 
                name="collected" 
                fill="#00B894" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          ) : (
            <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={() => (
                  <span className="text-xs font-bold text-[#2D3436]">نسبة الاستخلاص الشهري (%)</span>
                )}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                name="rate" 
                stroke="#6C5CE7" 
                strokeWidth={3}
                dot={{ r: 5, fill: '#6C5CE7', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, fill: '#FFD93D', stroke: '#6C5CE7', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer information pill */}
      <div className="p-3.5 rounded-2xl bg-[#FDFCF0] border border-[#FFEAA7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Sparkles className="w-4 h-4 text-[#FFD93D]" />
          <span>
            يتم تحديث الرسم البياني للمداخيل آلياً مع كل سند قبض جديد أو فاتورة مسجلة بالدينار التونسي.
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#00B894] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تسجيل فوري دون إنترنت</span>
          </span>
        </div>
      </div>
    </div>
  );
};
