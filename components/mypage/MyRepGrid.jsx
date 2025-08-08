import { ICONS } from "@/constants/path";
import Image from "next/image";
import SearchFilterSort from "@/components/global/SearchSort";

export default function MyPostGrid() {
  const posts = [
    {
      id: 1,
      category: "게시물분류",
      title: "원글 게시물 제목1",
      date: "2025-08-06 00:00:00",
      reply: "내가 작성한 대댓글3",
    },
    {
      id: 2,
      category: "게시물분류",
      title: "원글 게시물 제목2",
      date: "2025-08-06 00:00:00",
      reply: "내가 작성한 대댓글2",
    },
    // 추가 게시물 데이터...
    {
      id: 3,
      category: "게시물분류",
      title: "원글 게시물 제목3",
      date: "2025-08-06 00:00:00",
      reply: "내가 작성한 대댓글1",
    },
    // 추가 게시물 데이터...
  ];

  const gridCols = "120px 1fr 190px 60px 60px";

  return (
    <div className="mt-6 space-y-1">
      <SearchFilterSort />
      {/* 게시글 헤더 */}
      <div
        className="grid bg-gray-100 font-semibold text-center rounded-t-md p-2"
        style={{ gridTemplateColumns: gridCols }}
      >
        <div>게시물분류</div>
        <div className="text-left">제목</div>
        <div>작성일</div>
      </div>

      {/* 게시물들 및 댓글*/}
      {posts.map((post) => (
        <div
          key={post.id}
          className="border rounded-2xl p-3 shadow-md hover:shadow-lg space-y-1"
          style={{ width: "100%" }}
        >
          {/* 제목 행 */}
          <div
            className="grid items-center text-center"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="row-span-2 flex items-center justify-center">
              {post.category}
            </div>
            <div className="text-left font-bold truncate" title={post.title}>
              {post.title}
            </div>
            <div></div> {/* 날짜 열 (비움) */}
            <div></div> {/* 편집 버튼 열 (비움) */}
            <div></div> {/* 삭제 버튼 열 (비움) */}
          </div>

          {/* 댓글 + 버튼 행 */}
          <div
            className="grid items-center text-center mt-1"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div></div> {/* 분류열 (비움) */}
            <div className="text-left text-sm text-gray-500 flex items-center gap-1">
              <Image src={ICONS.REPLY} alt="reply" width={20} height={20} />
              {post.reply}
            </div>
            <div className="flex items-center justify-center text-gray-400">
              {post.date}
            </div>
            <div className="flex justify-center">
              <button type="button" className="hover:cursor-pointer">
                <Image src={ICONS.EDIT} alt="edit" width={24} height={24} />
              </button>
            </div>
            <div className="flex justify-center">
              <button type="button" className="hover:cursor-pointer">
                <Image src={ICONS.DELETE} alt="delete" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
