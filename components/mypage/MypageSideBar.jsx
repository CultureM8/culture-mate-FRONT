"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/path";

export default function MypageSideBar() {
  const pathname = usePathname();

  const menuItems = [
    {
      category: "개인정보",
      items: [
        { name: "프로필 관리", path: ROUTES.MYPAGE }
      ]
    },
    {
      category: "활동 관리",
      items: [
        { name: "관심 목록", path: ROUTES.INTEREST },
        { name: "동행 관리", path: ROUTES.FRIENDLIST },
        { name: "활동 내역", path: ROUTES.HISTORY }
      ]
    },
    {
      category: "게시글",
      items: [
        { name: "내 게시글", path: ROUTES.POST_MANAGE }
      ]
    },
    {
      category: "설정",
      items: [
        { name: "계정 설정", path: ROUTES.SETTINGS }
      ]
    }
  ];

  return (
    <div className="
      flex 
      flex-col 
      w-full
      min-h-full
    ">
      {menuItems.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {/* 카테고리 제목 */}
          <div className="
            flex 
            items-center 
            px-4 
            py-2.5
            w-full
          ">
            <h3 className="
              font-bold 
              text-[18px] 
              text-[#26282a] 
              leading-[1.55]
              whitespace-nowrap
            ">
              {section.category}
            </h3>
          </div>
          
          {/* 하위 메뉴 항목들 - 1칸 들여쓰기 추가 */}
          {section.items.map((item, itemIndex) => {
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={itemIndex}
                href={item.path}
                className="
                  flex 
                  items-center 
                  pl-8
                  pr-4
                  py-2.5
                  w-full
                  hover:bg-gray-50
                  transition-colors
                  group
                "
              >
                <span className={`
                  text-[16px] 
                  leading-[1.5]
                  whitespace-nowrap
                  transition-all
                  ${isActive 
                    ? "font-bold text-[#4E5052]" 
                    : "font-normal text-[#76787a] group-hover:font-bold"
                  }
                `}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}