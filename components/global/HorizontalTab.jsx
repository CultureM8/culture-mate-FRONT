"use client"

export default function HorizontalTab( {menuList=[], currentMenu, setCurrentMenu, width=1200, align="center"} ) {
  return(
    <div className="border-[#eef0f2] border-[0px_0px_1px] h-8">
      <div 
        className={`flex 
          ${align === "center" ? "mx-auto" : 
            align === "left" ? "mr-auto" : 
            align === "right" ? "ml-auto" : ""
          }`}
        style={{ width: `${width}px` }}
      >
        {menuList.map((menu, _) => (
          <button
            key={menu}
            onClick={() => setCurrentMenu(menu)}
            className={`h-8 ${
            currentMenu === menu 
              ? "border-[#26282a] border-[0px_0px_3px] bottom-[-1.5px] left-0 right-0 top-0"
              : "border-[#eef0f2] border-[0px_0px_1px]"
            }`}
            style={{ width: `${width / menuList.length}px` }}
          >
            {menu}
          </button>
        ))}
      </div>
    </div>
  )
}
