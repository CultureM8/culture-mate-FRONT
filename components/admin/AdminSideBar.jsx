"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/path";

export default function AdminSideBar() {
  const pathname = usePathname();

  const menuItems = [
    {
      category: "통계/대시보드",
      items: [
        { name: "대시보드", path: ROUTES.ADMIN }
      ]
    },
    {
      category: "이벤트",
      items: [
        { name: "전체 이벤트", path: `${ROUTES.ADMIN}/events/all` },
        { name: "승인 대기 이벤트", path: `${ROUTES.ADMIN}/events/pending` }
      ]
    },
    {
      category: "게시글",
      items: [
        { name: "전체 게시글", path: `${ROUTES.ADMIN}/contents/all` }
      ]
    },
    {
      category: "사용자",
      items: [
        { name: "전체 사용자", path: `${ROUTES.ADMIN}/users/all` }
      ]
    },
    {
      category: "신고 관리",
      items: [
        { name: "게시글 신고 목록", path: `${ROUTES.ADMIN}/alarms/contents` }
      ]
    },
    {
      category: "고객 소통",
      items: [
        { name: "1:1 문의사항", path: `${ROUTES.ADMIN}/help/contact` }
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