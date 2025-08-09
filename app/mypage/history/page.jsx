import HistoryTab from "@/components/mypage/HistoryTab";

export default function History() {
  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">히스토리</h1>
      <div className="mt-4 space-y-1">
        <HistoryTab />
      </div>
    </>
  );
}
