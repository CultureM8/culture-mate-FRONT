import PostManageTab from "@/components/mypage/PostManageTab";

export default function PostManage() {
  return (
    <>
      <h1 className="text-4xl font-bold py-[10px] h-16">게시물 관리</h1>
      <div className="mt-4 space-y-1">
        <PostManageTab />
      </div>
    </>
  );
}
