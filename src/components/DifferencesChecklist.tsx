import { useState, useEffect, useMemo } from 'react';

interface Difference {
  id: string;
  room: string;
  objectCategory: string;
  objectName: string;
  changeType: 'moved' | 'missing' | 'opened' | 'damaged' | 'new';
  description: string;
  spoilerLevel: 'light' | 'full';
  verified: 'demo' | 'unconfirmed' | 'may-vary';
  notes: string;
}

interface Props {
  differences: Difference[];
}

const STORAGE_KEY = 'dread-disc-differences-checklist';

const CHANGE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  moved:   { bg: 'bg-blue-900/30',    border: 'border-blue-700/50',    text: 'text-blue-400' },
  missing: { bg: 'bg-red-900/30',     border: 'border-red-700/50',     text: 'text-red-400' },
  opened:  { bg: 'bg-yellow-900/30',  border: 'border-yellow-700/50',  text: 'text-yellow-400' },
  damaged: { bg: 'bg-orange-900/30',  border: 'border-orange-700/50',  text: 'text-orange-400' },
  new:     { bg: 'bg-purple-900/30',  border: 'border-purple-700/50',  text: 'text-purple-400' },
};

const VERIFIED_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  'demo':       { bg: 'bg-green-900/30', text: 'text-green-400', label: '✓ Verified in demo' },
  'unconfirmed':{ bg: 'bg-yellow-900/30',text: 'text-yellow-400',label: '? Unconfirmed' },
  'may-vary':   { bg: 'bg-orange-900/30',text: 'text-orange-400',label: '🎲 May vary' },
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

export default function DifferencesChecklist({ differences }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showSpoilers, setShowSpoilers] = useState(false);

  useEffect(() => {
    setChecked(loadChecked());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveChecked(checked);
  }, [checked, mounted]);

  const rooms = useMemo(() => [...new Set(differences.map(d => d.room))].sort(), [differences]);
  const changeTypes = useMemo(() => [...new Set(differences.map(d => d.changeType))], [differences]);

  const filtered = useMemo(() => {
    return differences.filter(d => {
      if (roomFilter !== 'all' && d.room !== roomFilter) return false;
      if (typeFilter !== 'all' && d.changeType !== typeFilter) return false;
      if (!showSpoilers && d.spoilerLevel === 'full') return false;
      return true;
    });
  }, [differences, roomFilter, typeFilter, showSpoilers]);

  const totalCount = differences.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const progressColor = progress === 100 ? 'bg-green-500' : progress >= 60 ? 'bg-amber-500' : 'bg-red-600';

  const toggleItem = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAll = () => setChecked({});

  // Group filtered by room
  const grouped = useMemo(() => {
    const map = new Map<string, Difference[]>();
    filtered.forEach(d => {
      const list = map.get(d.room) || [];
      list.push(d);
      map.set(d.room, list);
    });
    return map;
  }, [filtered]);

  if (!mounted) {
    return <div class="text-center text-gray-500 py-8">Loading checklist...</div>;
  }

  return (
    <div class="space-y-6">
      {/* Progress Bar */}
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-400">Overall Progress</span>
          <span class="text-sm font-bold text-gray-200">{checkedCount}/{totalCount} found ({progress}%)</span>
        </div>
        <div class="h-3 bg-gray-900 rounded-full overflow-hidden">
          <div class={`h-full rounded-full transition-all duration-300 ${progressColor}`} style={`width: ${progress}%`}></div>
        </div>
        {progress === 100 && (
          <div class="mt-3 text-center text-green-400 text-sm font-medium">✅ All differences checked! Great observation.</div>
        )}
      </div>

      {/* Filters */}
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-400 font-medium">Room:</label>
            <select
              value={roomFilter}
              onChange={e => setRoomFilter((e.target as HTMLSelectElement).value)}
              class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-red-700 focus:outline-none"
            >
              <option value="all">All Rooms</option>
              {rooms.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-400 font-medium">Change:</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter((e.target as HTMLSelectElement).value)}
              class="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:border-red-700 focus:outline-none"
            >
              <option value="all">All Types</option>
              {changeTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <button
            onClick={() => setShowSpoilers(!showSpoilers)}
            class={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              showSpoilers
                ? 'bg-red-700 text-white'
                : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {showSpoilers ? '⚠️ Spoilers ON' : '🔒 Spoilers OFF'}
          </button>
        </div>
        {showSpoilers && (
          <div class="mt-2 p-2 rounded-lg bg-red-900/20 border border-red-700/40 text-red-300 text-xs">
            ⚠️ Spoiler-level items are now visible. These may reveal puzzle solutions.
          </div>
        )}
      </div>

      {/* Checklist by Room */}
      {[...grouped.entries()].map(([room, items]) => {
        const roomChecked = items.filter(i => checked[i.id]).length;
        return (
          <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-red-400">
                📍 {room}
              </h3>
              <span class="text-xs text-gray-500">{roomChecked}/{items.length}</span>
            </div>
            <div class="space-y-2">
              {items.map(item => {
                const ct = CHANGE_TYPE_COLORS[item.changeType];
                const vb = VERIFIED_BADGES[item.verified];
                return (
                  <label class={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    checked[item.id] ? 'bg-green-900/20' : 'bg-gray-900/50 hover:bg-gray-900/80'
                  }`}>
                    <input
                      type="checkbox"
                      checked={!!checked[item.id]}
                      onChange={() => toggleItem(item.id)}
                      class="w-4 h-4 accent-red-600 rounded mt-0.5 shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class={`text-sm font-medium ${checked[item.id] ? 'text-green-400 line-through' : 'text-gray-200'}`}>
                          {item.objectName}
                        </span>
                        <span class={`text-[10px] px-2 py-0.5 rounded border ${ct.bg} ${ct.border} ${ct.text} font-medium uppercase`}>
                          {item.changeType}
                        </span>
                        <span class={`text-[10px] px-2 py-0.5 rounded ${vb.bg} ${vb.text}`}>
                          {vb.label}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">{item.description}</p>
                      {item.notes && <p class="text-xs text-gray-600 mt-0.5 italic">{item.notes}</p>}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div class="text-center py-8 text-gray-500">
          No differences match your current filters. Try adjusting the room or change type filters.
        </div>
      )}

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
