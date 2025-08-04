import { ICONS } from "@/constants/path";
import Image from "next/image";

export default function SearchBar() {
  return (
    <form 
      action="" 
      className="flex items-center h-8 w-[clamp(50px,30vw,300px)]
        border rounded-full p-3 gap-2"
    >
      <input type="text" className="w-full" 
        placeholder="검색어를 입력해주세요" 
      />
      <button type="submit" className="hover:cursor-pointer">
        <Image 
          src={ICONS.SEARCH} 
          alt="search"
          width={24}
          height={24}
        />
      </button>
    </form>
  );
}