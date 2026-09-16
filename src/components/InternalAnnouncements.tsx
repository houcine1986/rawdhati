import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Share2, 
  Check, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ParentNotification } from '../types';
import { formatArabicDate } from '../utils/helpers';

export const InternalAnnouncements: React.FC = () => {
  const { notifications, addNotification, deleteNotification, classes } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'class' | 'individual'>('all');
  const [targetId, setTargetId] = useState<string>('');
  const [notifType, setNotifType] = useState<ParentNotification['type']>('general');
  const [isImportant, setIsImportant] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addNotification({
      title,
      message,
      type: notifType,
      targetAudience,
      targetId: targetAudience === 'class' ? targetId : undefined,
      date: new Date().toISOString().split('T')[0],
      isImportant,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setMessage('');
  };

  const handleCopyForWhatsApp = (notif: ParentNotification) => {
    const text = `📢 *روضتي - بلاغ رسمي*\n\n📌 *${notif.title}*\n\n${notif.message}\n\n📅 التاريخ: ${notif.date}\nإدارة الروضة`;
    navigator.clipboard.writeText(text);
    setCopiedId(notif.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-pink-600" />
            <span>البلاغات والمراسلات الداخلية للأولياء والإطار التربوي</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إصدار البلاغات الرسمية، مذكرات الإشعار بالعطل، دعوات لقاءات الأولياء، والتنسيق عبر WhatsApp وSMS
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>نشر بلاغ جديد</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notifications.map(ann => {
          const targetClass = classes.find(c => c.id === ann.targetId);

          return (
            <div
              key={ann.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 bg-white ${
                ann.isImportant ? 'border-rose-300 ring-2 ring-rose-100 shadow-md' : 'border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ann.isImportant && (
                      <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                        ⚠️ عاجل وهام
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-pink-50 text-pink-800 px-2 py-0.5 rounded-md">
                      {ann.targetAudience === 'all' ? 'لكافة الأولياء' : ann.targetAudience === 'class' ? `فوج: ${targetClass?.name}` : 'إشعار فردي'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-800 mt-1.5">{ann.title}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyForWhatsApp(ann)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="نسخ نص الرسالة لـ WhatsApp / SMS"
                  >
                    {copiedId === ann.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px]">تم النسخ ✓</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px]">نسخ للإرسال</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteNotification(ann.id)}
                    className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl text-xs"
                    title="حذف البلاغ"
                  >
                    ×
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                {ann.message}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>📅 {formatArabicDate(ann.date)}</span>
                <span>الناشر: إدارة الروضة</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ----------------- CREATE ANNOUNCEMENT MODAL ----------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800">نشر بلاغ أو تعميم جديد</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البلاغ *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: موعد رحلة الربيع الاستكشافية"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الفئة المستهدفة *</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="all">كافة أولياء الروضة</option>
                    <option value="class">فوج مخصص فقط</option>
                  </select>
                </div>

                {targetAudience === 'class' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اختر الفوج</label>
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-700">
                      <input
                        type="checkbox"
                        checked={isImportant}
                        onChange={(e) => setIsImportant(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>تحديد كبلاغ عاجل وهام ⚠️</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص البلاغ بالتفصيل *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="نرجو من السادة الأولياء الكرام التفضل بالحضور يوم..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  نشر البلاغ فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
