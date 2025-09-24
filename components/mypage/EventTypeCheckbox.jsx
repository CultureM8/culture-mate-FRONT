"use client"

import { EVENT_TYPE_OPTIONS } from "@/constants/eventTypes";

export default function EventTypeCheckbox({ eventTypes, setEventTypes }) {
  const toggleEventType = (typeValue) => {
    if (eventTypes.includes(typeValue)) {
      setEventTypes(eventTypes.filter(type => type !== typeValue));
    } else {
      setEventTypes([...eventTypes, typeValue]);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-base font-medium text-gray-900 mb-4">관심 이벤트 유형</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {EVENT_TYPE_OPTIONS.map((eventType) => (
          <label
            key={eventType.value}
            className={`
              relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer
              transition-all duration-300 ease-in-out min-h-[60px] group
              ${eventTypes.includes(eventType.value)
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-105'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm'
              }
            `}
          >
            <input
              type="checkbox"
              checked={eventTypes.includes(eventType.value)}
              onChange={() => toggleEventType(eventType.value)}
              className="sr-only"
            />

            {/* 커스텀 체크박스 */}
            <div
              className={`
                absolute top-2 right-2 w-5 h-5 border-2 rounded-md flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${eventTypes.includes(eventType.value)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 bg-white group-hover:border-blue-400'
                }
              `}
            >
              {eventTypes.includes(eventType.value) && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            <span className={`
              text-sm font-medium select-none text-center leading-tight
              ${eventTypes.includes(eventType.value)
                ? 'text-blue-700'
                : 'text-gray-700 group-hover:text-blue-600'
              }
            `}>
              {eventType.label}
            </span>
          </label>
        ))}
      </div>

      {/* 선택된 항목 표시 (선택사항) */}
      {eventTypes.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            선택된 이벤트 유형 ({eventTypes.length}개):
          </p>
          <div className="flex flex-wrap gap-1">
            {eventTypes.map((typeValue) => {
              const eventType = EVENT_TYPE_OPTIONS.find(t => t.value === typeValue);
              return (
                <span
                  key={typeValue}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {eventType?.label || typeValue}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}