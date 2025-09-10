import Image from "next/image";
import Gallery from "@/components/global/Gallery";
import { ICONS } from "@/constants/path";

export default function HistoryEvent({
  id,
  imgSrc,
  alt,
  title = "제목",
  startDate = "0000.00.00",
  endDate = "0000.00.00",
  location = "지역 및 장소명",
  href = "",
  isHot = false,
  enableInterest = true,

  // ✅ 편집 모드 관련 prop
  editMode = false,
  selected = false,
  onToggleSelect, // () => void
}) {
  const interestEnabled = enableInterest && !editMode;

  return (
    <div className="relative">
      {/* 편집 모드일 때 전체 클릭 오버레이로 이동 막고 선택 토글 */}
      {editMode && (
        <button
          type="button"
          className="absolute inset-0 z-20 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect?.(id);
          }}
          aria-label="select-card"
        />
      )}

      {/* 우상단 선택 표시 */}
      {editMode && (
        <div className="absolute top-2 right-2 z-30">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              selected
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white/90 text-gray-600 border-gray-300"
            }`}>
            {selected ? "✓" : ""}
          </div>
        </div>
      )}

      <Gallery
        title={title}
        src={imgSrc}
        alt={alt}
        href={editMode ? "#" : href} // 편집 모드에서는 이동 막기
        enableInterest={interestEnabled}>
        <div>
          {startDate} ~ {endDate}
        </div>
        <div className="flex items-center gap-1">
          {isHot && (
            <div className="flex items-center gap-1">
              인기
              <Image src={ICONS.FIRE} alt="인기" width={24} height={24} />
            </div>
          )}
          {location}
        </div>
      </Gallery>

      {/* 선택 시 테두리 하이라이트(선택 감각 강화) */}
      {editMode && selected && (
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-blue-500 z-10" />
      )}
    </div>
  );
}
