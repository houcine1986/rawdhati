import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Phone, 
  Users, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Edit2, 
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusRoute } from '../types';

export const TransportManagement: React.FC = () => {
  const { busRoutes, addBusRoute, children } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(busRoutes[0]?.id || 'route-1');

  // Form
  const [routeName, setRouteName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [capacity, setCapacity] = useState(16);
  const [stopsText, setStopsText] = useState('حي النصر 1، حي النصر 2، المنزه 9، رياض الأندلس');

  const selectedRoute = busRoutes.find(r => r.id === selectedRouteId) || busRoutes[0];
  const enrolledChildrenInRoute = children.filter(c => c.services?.transport && (c.services?.transportRouteId === selectedRoute?.id || !c.services?.transportRouteId));

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim() || !driverName.trim()) return;

    addBusRoute({
      name: routeName,
      busNumber,
      driverName,
      driverPhone,
      supervisorName,
      morningStartTime: '07:30',
      eveningReturnTime: '17:30',
      capacity,
      stops: stopsText.split('،').map(s => s.trim()).filter(Boolean),
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Bus className="w-6 h-6 text-cyan-600" />
            <span>إدارة النقل المدرسي وخطوط الحافلات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة خطوط التوصيل، السائقين والمرافقات، ومحطات انطلاق وركوب الأطفال
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خط نقل جديد</span>
        </button>
      </div>

      {/* Routes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {busRoutes.map(route => {
          const isSelected = route.id === selectedRoute?.id;
          const assignedCount = children.filter(c => c.services?.transport && c.services?.transportRouteId === route.id).length;

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-50/40 border-cyan-300 ring-2 ring-cyan-200 shadow-md'
                  : 'bg-white border-slate-200/80 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md">
                    {route.busNumber || 'حافلة الروضة'}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-800 mt-1">{route.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-cyan-900">
                    {assignedCount} / {route.capacity} مقعد
                  </span>
                  <span className="text-[10px] text-slate-400 block">طاقة الاستيعاب</span>
                </div>
              </div>

              {/* Driver & Assistant */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold">السائق المسؤول:</span>
                  <div className="font-extrabold text-slate-800">{route.driverName}</div>
                  <span className="text-[11px] text-emerald-700 font-bold">📞 {route.driverPhone}</span>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-bold">المرافقة المؤطرة:</span>
                  <div className="font-extrabold text-slate-800">{route.supervisorName}</div>
                  <span className="text-[11px] text-cyan-700 font-medium">مرافقة أطفال</span>
                </div>
              </div>

              {/* Stops */}
              <div className="mt-3">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">المحطات والمسار:</span>
                <div className="flex flex-wrap gap-1.5">
                  {route.stops?.map((st, i) => (
                    <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700">
                      📍 {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Children List */}
      {selectedRoute && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                <span>قائمة الأطفال المشتركين في النقل المدرسي ({selectedRoute.name})</span>
              </h3>
              <p className="text-xs text-slate-400">عناوين السكن وأرقام هواتف الأولياء لتسهيل التوصيل اليومي</p>
            </div>
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full">
              {enrolledChildrenInRoute.length} أطفال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrolledChildrenInRoute.map(child => (
              <div key={child.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <img src={child.photoUrl} alt="" className="w-11 h-11 rounded-xl object-cover ring-2 ring-cyan-200" />
                <div className="text-xs">
                  <div className="font-extrabold text-slate-800">{child.fullName}</div>
                  <div className="text-slate-500 text-[11px] truncate max-w-[180px]">📍 {child.address}</div>
                  <div className="text-emerald-700 font-bold text-[11px] mt-0.5">📞 {child.fatherPhone}</div>
                </div>
              </div>
            ))}

            {enrolledChildrenInRoute.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400 text-xs">
                لا يوجد أطفال مسجلون في هذا الخط حالياً.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- CREATE ROUTE MODAL ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">إضافة خط حافلة نقل مدرسي</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخط / المسار *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الخط 3: حي النصر - المنار"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم السائق *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عماد الشابي"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">هاتف السائق *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 98 123 456"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المرافقة التربوية</label>
                  <input
                    type="text"
                    placeholder="مثال: سلمى القروي"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ترقيم الحافلة</label>
                  <input
                    type="text"
                    placeholder="مثال: 198 تونس 4521"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طاقة الاستيعاب القصوى</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المحطات ونقاط التوقف (مفصولة بـ فاصلة)</label>
                <textarea
                  rows={2}
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  حفظ الخط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
