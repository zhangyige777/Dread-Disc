import { useState } from 'react';

interface Props {
  spoilerLightContent: string;
  fullSpoilerContent: string;
}

export default function SpoilerToggle({ spoilerLightContent, fullSpoilerContent }: Props) {
  const [showSpoilers, setShowSpoilers] = useState(false);

  return (
    <div>
      {/* Toggle buttons */}
      <div class="flex gap-2 mb-6">
        <button
          onClick={() => setShowSpoilers(false)}
          class={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            !showSpoilers
              ? 'bg-red-700 text-white'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
          }`}
        >
          🔒 Spoiler-Light Route
        </button>
        <button
          onClick={() => setShowSpoilers(true)}
          class={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            showSpoilers
              ? 'bg-red-700 text-white'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
          }`}
        >
          ⚠️ Full Spoiler Route
        </button>
      </div>

      {/* Warning banner for spoilers */}
      {showSpoilers && (
        <div class="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
          <strong>⚠️ Spoiler Warning:</strong> The content below reveals full puzzle solutions, specific difference locations, and story details. Proceed only if you want complete guidance.
        </div>
      )}

      {/* Content */}
      <div
        class="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: showSpoilers ? fullSpoilerContent : spoilerLightContent }}
      />
    </div>
  );
}
