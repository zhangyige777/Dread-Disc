import { useState, useEffect, useMemo } from 'react';

interface DoorWindow {
  id: string;
  name: string;
  location: string;
  currentState: string;
  safeAction: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  verified: 'demo' | 'unconfirmed';
  notes: string;
}

interface Props {
  doorsWindows: DoorWindow[];
}

const STORAGE_KEY = 'dread-disc-doors-windows-checklist';

const RISK_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  low:      { bg: 'bg-green-900/30',   border: 'border-green-700/50',   text: 'text-green-400',   icon: '🟢' },
  medium:   { bg: 'bg-yellow-900/30',  border: 'border-yellow-700/50',  text: 'text-yellow-400',  icon: '🟡' },
  high:     { bg: 'bg-red-900/30',     border: 'border-red-700/50',     text: 'text-red-400',     icon: '🔴' },
  critical: { bg: 'bg-red-900/40',     border: 'border-red-600/60',     text: 'text-red-300',     icon: '🚨' },
};

function loadChecked(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveChecked(checked: Record<string, boolean>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch {}
}

export default function DoorWindowChecklist({ doorsWindows }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChecked(loadChecked());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveChecked(checked);
  }, [checked, mounted]);

  // Group by location
  const grouped = useMemo(() => {
    const map = new Map<string, DoorWindow[]>();
    doorsWindows.forEach(dw => {
      const list = map.get(dw.location) || [];
      list.push(dw);
      map.set(dw.location, list);
    });
    return map;
  }, [doorsWindows]);

  const totalCount = doorsWindows.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const progressColor = progress === 100 ? 'bg-green-500' : progress >= 60 ? 'bg-amber-500' : 'bg-red-600';

  // Find unchecked critical/high items
  const urgentUnchecked = useMemo(() => {
    return doorsWindows.filter(dw =>
      (dw.riskLevel === 'critical' || dw.riskLevel === 'high') && !checked[dw.id]
    );
  }, [doorsWindows, checked]);

  const toggleItem = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAll = () => setChecked({});

  if (!mounted) {
    return <div class="text-center text-gray-500 py-8">Loading checklist...</div>;
  }

  return (
    <div class="space-y-6">
      {/* Progress Bar */}
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-400">Security Progress</span>
          <span class="text-sm font-bold text-gray-200">{checkedCount}/{totalCount} secured ({progress}%)</span>
        </div>
        <div class="h-3 bg-gray-900 rounded-full overflow-hidden">
          <div class={`h-full rounded-full transition-all duration-300 ${progressColor}`} style={`width: ${progress}%`}></div>
        </div>
        {progress === 100 && (
          <div class="mt-3 text-center text-green-400 text-sm font-medium">🔒 All doors and windows secured! You are safe... for now.</div>
        )}
      </div>

      {/* Urgent Warning */}
      {urgentUnchecked.length > 0 && (
        <div class="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
          <h4 class="text-sm font-bold text-red-400 mb-2">⚠️ High-Priority Entry Points Unchecked</h4>
          <div class="flex flex-wrap gap-2">
            {urgentUnchecked.map(dw => {
              const rc = RISK_COLORS[dw.riskLevel];
              return (
                <span class={`text-xs px-2 py-1 rounded border ${rc.bg} ${rc.border} ${rc.text}`}>
                  {rc.icon} {dw.name}
                </span>
              );
            })}
          </div>
          <p class="text-xs text-red-300/70 mt-2">Secure these entry points first to minimize risk.</p>
        </div>
      )}

      {/* Checklist by Location */}
      {[...grouped.entries()].map(([location, items]) => {
        const locChecked = items.filter(i => checked[i.id]).length;
        return (
          <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-red-400">
                🚪 {location}
              </h3>
              <span class="text-xs text-gray-500">{locChecked}/{items.length} checked</span>
            </div>
            <div class="space-y-3">
              {items.map(dw => {
                const rc = RISK_COLORS[dw.riskLevel];
                return (
                  <div class={`border rounded-lg p-4 transition-colors ${
                    checked[dw.id] ? 'bg-green-900/10 border-green-700/30' : `bg-gray-900/30 ${rc.border}`
                  }`}>
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!checked[dw.id]}
                        onChange={() => toggleItem(dw.id)}
                        class="w-4 h-4 accent-red-600 rounded mt-0.5 shrink-0"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class={`text-sm font-medium ${checked[dw.id] ? 'text-green-400 line-through' : 'text-gray-200'}`}>
                            {dw.name}
                          </span>
                          <span class={`text-[10px] px-2 py-0.5 rounded border ${rc.bg} ${rc.border} ${rc.text} font-medium uppercase`}>
                            {rc.icon} {dw.riskLevel}
                          </span>
                          {dw.verified === 'demo' && (
                            <span class="text-[10px] px-2 py-0.5 rounded bg-green-900/30 text-green-400">✓ Verified in demo</span>
                          )}
                        </div>
                        <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span class="text-gray-500">Current state:</span>
                            <span class="text-gray-300 ml-1">{dw.currentState}</span>
                          </div>
                          <div>
                            <span class="text-gray-500">Safe action:</span>
                            <span class="text-gray-300 ml-1">{dw.safeAction}</span>
                          </div>
                        </div>
                        {dw.notes && <p class="text-xs text-gray-600 mt-1.5 italic">{dw.notes}</p>}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Reset Button */}
      <div class="text-center">
        <button
          onClick={resetAll}
          class="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm hover:bg-gray-700 hover:text-gray-200 transition-colors"
        >
          🔄 Reset All
        </button>
      </div>
    </div>
  );
}
