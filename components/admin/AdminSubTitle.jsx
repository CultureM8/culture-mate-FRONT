"use client";

export default function AdminSubTitle({ title }) {
  return (
    <div className="
      relative 
      w-full 
      pb-6
    ">
      {/* 소제목 텍스트 */}
      <div className="
        flex 
        flex-col 
        justify-center 
        px-5
        pt-2.5
        pb-2.5
      ">
        <h2 className="
          font-bold 
          text-[24px] 
          text-[#26282a] 
          leading-[1.55]
          whitespace-nowrap
        ">
          {title} {/* 소제목 */}
        </h2>
      </div>

      {/* 하단 구분선 */}
      <div className="
        w-[980px] 
        h-px 
        bg-[#eef0f2]
      "></div>
    </div>
  );
}