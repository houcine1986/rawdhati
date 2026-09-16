import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  X, 
  Check, 
  Search, 
  GraduationCap, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Baby, 
  Filter,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Child, ClassRoom } from '../types';
import { calculateAge } from '../utils/helpers';

interface TransferChildrenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceClassId?: string;
  preSelectedChildIds?: string[];
}

export const TransferChildrenModal: React.FC<TransferChildrenModalProps> = ({
  isOpen,
  onClose,
  initialSourceClassId,
  preSelectedChildIds = [],
}) => {
  const { children, classes, transferChildrenToClass } = useApp();

  // Selected source class ('all' or specific class ID)
  const [sourceClassId, setSourceClassId] = useState<string>(initialSourceClassId || 'all');
  
  // Selected target class ID
  const [targetClassId, setTargetClassId] = useState<string>(() => {
    // Pick first class different from initial source class if possible
    const otherClass = classes.find(c => c.id !== initialSourceClassId);
    return otherClass ? otherClass.id : (classes[0]?.id || '');
  });

  // Selected child IDs
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>(preSelectedChildIds);

  // Search filter
  const [searchQuery, setSearchTerm] = useState<string>('');

  // Transfer reason / note (optional)
  const [transferReason, setTransferReason] = useState<string>('ترقية سنوية حسب الفئة العمرية');

  // Filter children available based on sourceClassId and search
  const availableChildren = useMemo(() => {
    return children.filter(c => {
      // Must not be already in the target class if source is all
      const matchesSource = sourceClassId === 'all' || c.classId === sourceClassId;
      const matchesSearch = !searchQuery.trim() || 
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSource && matchesSearch;
    });
  }, [children, sourceClassId, searchQuery]);

  // Target class details
  const targetClass = useMemo(() => {
    return classes.find(c => c.id === targetClassId);
  }, [classes, targetClassId]);

  // Current enrolled count in target class (excluding selected who are moving in)
  const targetEnrolledCount = useMemo(() => {
    if (!targetClassId) return 0;
    return children.filter(c => c.classId === targetClassId && c.status === 'active').length;
  }, [children, targetClassId]);

  // Number of selected children that are NOT already in target class
  const actuallyMovingCount = useMemo(() => {
    return selectedChildIds.filter(id => {
      const child = children.find(c => c.id === id);
      return child && child.classId !== targetClassId;
    }).length;
  }, [selectedChildIds, children, targetClassId]);

  const newTargetTotal = targetEnrolledCount + actuallyMovingCount;
  const isOverCapacity = targetClass ? newTargetTotal > targetClass.capacity : false;

  // Toggle single child selection
  const handleToggleChild = (childId: string) => {
    setSelectedChildIds(prev => 
      prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]
    );
  };

  // Select all visible children
  const handleSelectAll = () => {
    const visibleIds = availableChildren.map(c => c.id);
    setSelectedChildIds(prev => {
      const combined = new Set([...prev, ...visibleIds]);
      return Array.from(combined);
    });
  };

  // Deselect all visible children
  const handleDeselectAll = () => {
    const visibleIds = new Set(availableChildren.map(c => c.id));
    setSelectedChildIds(prev => prev.filter(id => !visibleIds.has(id)));
  };

  // Execute transfer
  const handleExecuteTransfer = () => {
    if (!targetClassId) return;
    const validChildIdsToMove = selectedChildIds.filter(id => {
      const child = children.find(c => c.id === id);
      return child && child.classId !== targetClassId;
    });

    if (validChildIdsToMove.length === 0) {
      alert('يرجى تحديد طفل واحد على الأقل لنقله، والتأكد من أنه ليس مسجلاً بالفوج المستهدف مسبقاً.');
      return;
    }

    transferChildrenToClass(validChildIdsToMove, targetClassId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] flex flex-col animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-200">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-800">
                نقل وتحويل مجموعة أطفال بين الأفواج
              </h3>
              <p className="text-xs text-slate-400">
                تغيير الفوج التربوي لعدة أطفال دفعة واحدة مع مراقبة طاقة الاستيعاب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1">
          
          {/* Step 1 & Step 2 Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            
            {/* 1. Source Class Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                <span>1. من الفوج الحالي (المصدر):</span>
              </label>
              <select
                value={sourceClassId}
                onChange={(e) => {
                  setSourceClassId(e.target.value);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="all">جميع الأفواج والأطفال ({children.length} طفل)</option>
                {classes.map(c => {
                  const count = children.filter(kid => kid.classId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count} طفل)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. Target Class Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. إلى الفوج الجديد (المستهدف):</span>
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full bg-white border-2 border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              >
                {classes.map(c => {
                  const count = children.filter(kid => kid.classId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ageRange}) - حالياً {count}/{c.capacity} طفل
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Target Class Capacity Status Alert */}
          {targetClass && (
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              isOverCapacity 
                ? 'bg-rose-50/80 border-rose-200 text-rose-800' 
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                {isOverCapacity ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="font-extrabold">{targetClass.name}</span>
                  <span className="text-[11px] mr-1.5 opacity-90">
                    (طاقة الاستيعاب القصوى: {targetClass.capacity} طفل)
                  </span>
                </div>
              </div>

              <div className="text-left font-mono font-bold text-xs shrink-0">
                {targetEnrolledCount} + {actuallyMovingCount} = <span className="underline">{newTargetTotal}</span> / {targetClass.capacity} طفل
              </div>
            </div>
          )}

          {/* Children Selection Section */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-extrabold text-slate-800">
                  حدد الأطفال المطلوب تحويلهم:
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  تم تحديد {actuallyMovingCount} طفل للتحويل
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer text-[11px]"
                >
                  تحديد الكل ({availableChildren.length})
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg font-bold transition-colors cursor-pointer text-[11px]"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="تصفية الأطفال بالاسم أو رقم التسجيل..."
                value={searchQuery}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              />
            </div>

            {/* Children List with Checkboxes */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto bg-white">
              {availableChildren.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  لا يوجد أطفال متاحون يطابقون شروط البحث أو الفوج المحدد.
                </div>
              ) : (
                availableChildren.map(child => {
                  const isSelected = selectedChildIds.includes(child.id);
                  const isAlreadyInTarget = child.classId === targetClassId;
                  const currentClass = classes.find(c => c.id === child.classId);
                  const age = calculateAge(child.birthDate);

                  return (
                    <div
                      key={child.id}
                      onClick={() => !isAlreadyInTarget && handleToggleChild(child.id)}
                      className={`p-2.5 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                        isAlreadyInTarget
                          ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-indigo-50/60 hover:bg-indigo-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isAlreadyInTarget}
                          onChange={() => handleToggleChild(child.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />

                        <img
                          src={child.photoUrl}
                          alt={child.fullName}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                            <span>{child.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({child.registrationNumber})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>{age.text}</span>
                            <span>•</span>
                            <span className="text-amber-700 font-medium">
                              الفوج الحالي: {currentClass?.name || 'غير محدد'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {isAlreadyInTarget ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            مسجل بهذا الفوج بالفعل
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>محدد للتحويل</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reason / Note input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>سبب أو مبرر التحويل (اختياري):</span>
            </label>
            <input
              type="text"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="مثال: ترقية سنوية، رغبة الولي، موازنة النصاب التربوي..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs transition-colors cursor-pointer"
          >
            إلغاء التراجع
          </button>

          <button
            type="button"
            onClick={handleExecuteTransfer}
            disabled={actuallyMovingCount === 0 || !targetClassId}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>
              تأكيد تحويل {actuallyMovingCount} طفل إلى {targetClass?.name || 'الفوج الجديد'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
