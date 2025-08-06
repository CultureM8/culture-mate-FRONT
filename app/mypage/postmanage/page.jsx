import PostManageTab from "@/components/mypage/PostManageTab";

export default function interest() {
  return (
    <>
      <h1 className="text-3xl font-bold mt-5">게시물 관리</h1>
      <div className="mt-4 space-y-1">
        <PostManageTab />
      </div>
    </>
  );
}
