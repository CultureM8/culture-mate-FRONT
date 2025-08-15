"use client";

export default function AdminMainTitle({ title }) {
  return (
    <div className="w-full">
      <div className="w-full max-w-none lg:max-w-[1200px] mx-auto px-4 lg:px-4 md:px-6 sm:px-4">
        <h1 className="text-4xl font-bold py-[10px] h-16">
          관리자 메뉴
        </h1>
      </div>
    </div>
  );
}