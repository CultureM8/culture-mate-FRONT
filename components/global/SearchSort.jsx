import Image from "next/image";
import SearchBar from "@/components/global/SearchBar";
import { ICONS } from "@/constants/path";

export default function SearchFilterSort({
  enableTitle = false,
  title = "전체",
  enableViewType = false,
  viewType = "Gallery",
  setViewType,
}) {
  const viewTypes = [
    ["Gallery", ICONS.VIEWTYPE_GALLERY],
    ["List", ICONS.VIEWTYPE_LIST],
  ];

  return (
    <div className="px-2.5 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {enableTitle && <h2 className="text-xl font-bold">{title}</h2>}
        {enableViewType && (
          <div className="flex items-cente gap-4">
            {viewTypes.map((type, _) => (
              <button
                key={type[0]}
                className={`${
                  viewType === type[0] ? "" : "opacity-50"
                } hover:cursor-pointer`}
                onClick={() => setViewType(type[0])}
              >
                <Image src={type[1]} alt={type[0]} width={24} height={24} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <SearchBar />
        <button className="flex items-cente gap-2 hover:cursor-pointer">
          정렬
          <Image src={ICONS.DOWN_ARROW} alt="정렬" width={24} height={24} />
        </button>
      </div>
    </div>
  );
}
