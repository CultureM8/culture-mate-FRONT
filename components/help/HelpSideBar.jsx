"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/path";

export default function HelpSideBar() {
  // 메뉴 데이터 구조
  const menuItems = [
    {
      category: "컬쳐메이트 안내",
      isCategory: true,
      items: [
        { name: "서비스 소개", path: ROUTES.ABOUT },
        { name: "이용 가이드", path: ROUTES.GUIDE }
      ]
    },
    {
      category: "고객지원", 
      isCategory: true,
      items: [
        { name: "공지사항", path: ROUTES.NOTICE, isActive: true },
        { name: "FAQ", path: ROUTES.FAQ },
        { name: "1:1 문의하기", path: ROUTES.CONTACT },
        { name: "1:1 문의내역", path: ROUTES.CONTACT_HISTORY }
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
          
          {/* 하위 메뉴 항목들 */}
          {section.items.map((item, itemIndex) => (
            <Link 
              key={itemIndex}
              href={item.path}
              className="
                flex 
                items-center 
                px-4 
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
                font-normal
                group-hover:font-bold
                transition-all
                ${item.isActive 
                  ? "text-[#76787a]" 
                  : "text-[#76787a]"
                }
              `}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}