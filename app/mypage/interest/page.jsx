import InterestTab from "@/components/mypage/InterestTab";

export default function Interest() {
  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">관심 목록</h1>
      <div className="mt-4 space-y-1">
        <InterestTab />
      </div>
    </>
  );
}
