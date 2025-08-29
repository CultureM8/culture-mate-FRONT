"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/path";

export default function AdminSideBar() {
  const pathname = usePathname();

  // 메뉴 데이터 구조
  const menuItems = [
    {
      category: "통계/대시보드",
      isCategory: true,
      items: [
        { name: "대시보드", path: "/admin" }
      ]
    },
    {
      category: "이벤트",
      isCategory: true,
      items: [
        { name: "전체 이벤트", path: "/admin/events/all" },
        { name: "승인 대기 이벤트", path: "/admin/events/pending" }
      ]
    },
    {
      category: "게시글",
      isCategory: true,
      items: [
        { name: "전체 게시글", path: "/admin/contents/all" }
      ]
    },
    {
      category: "사용자",
      isCategory: true,
      items: [
        { name: "전체 사용자", path: "/admin/users/all" }
      ]
    },
    {
      category: "신고 관리",
      isCategory: true,
      items: [
        { name: "게시글 신고 목록", path: "/admin/alarms/contents" }
      ]
    },
    {
      category: "고객 소통",
      isCategory: true,
      items: [
        { name: "1:1 문의사항", path: "/admin/help/contact" }
      ]
    }
  ];

  return (
    <div className="
      bg-white
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