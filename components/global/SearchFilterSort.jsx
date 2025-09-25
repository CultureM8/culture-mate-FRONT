import Image from "next/image";
import SearchBar from "./SearchBar";
import { ICONS } from "@/constants/path";

export default function SearchFilterSort({
  enableTitle = false,
  title = "전체",
  enableViewType = false,
  viewType = "Gallery",
  setViewType,
  filterAction,
  sortAction,
  sortOption = "latest",
  onSearch, // 검색 함수 추가
  searchValue = "", // 검색값 추가 (Together 방식)
  onSearchChange, // 검색값 변경 함수 추가
}) {
  const viewTypes = [
    ["Gallery", ICONS.MENU],
    ["List", ICONS.LIST],
  ];

  // 정렬 옵션들
  const sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "oldest", label: "오래된순" },
    { value: "views", label: "조회수순" },
    { value: "likes", label: "관심순" },
    { value: "title", label: "제목순" },
  ];

  const handleSortChange = (e) => {
    if (typeof sortAction === "function") {
      sortAction(e.target.value);
    }
  };

  return (
    <div className="px-2.5 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {enableTitle && <h2 className="text-xl font-bold">{title}</h2>}
        {enableViewType && (
          <div className="flex items-center gap-4">
            {viewTypes.map((type, _) => (
              <button
                key={type[0]}
                className={`${
                  viewType === type[0] ? "" : "opacity-50"
                } hover:cursor-pointer`}
                onClick={() => setViewType(type[0])}>
                <Image src={type[1]} alt={type[0]} width={24} height={24} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
        <button
          className="flex items-center gap-2 hover:cursor-pointer"
          onClick={filterAction}>
          필터
          <Image src={ICONS.FILTER} alt="필터" width={24} height={24} />
        </button>

        {/* 정렬 드롭다운으로 변경 */}
        <div className="flex items-center gap-2">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="h-8 px-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
