/**카드배치 ,전체보기*/
'use client';

import { useState } from 'react';
import EventTile from './EventTile';

export default function ResultGrid({
  results = [],
  initialCount = 6,

  onSelect,
}) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? results : results.slice(0, initialCount);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {visible.map((card) => (
          <EventTile
            key={card.id ?? `${card.eventName}-${card.eventType}`}
            card={card}
            onSelect={onSelect}
          />
        ))}
      </div>

      {results.length > initialCount && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="px-4 py-2 text-sm rounded border bg-white hover:bg-gray-50">
            {showAll
              ? '접기'
              : `더보기 (${results.length - initialCount}개 더)`}
          </button>
        </div>
      )}
    </>
  );
}
