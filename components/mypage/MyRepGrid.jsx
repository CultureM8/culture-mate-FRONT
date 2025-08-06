import { ICONS } from "@/constants/path";
import Image from "next/image";
import SearchFilterSort from "@/components/mypage/SearchSort";

export default function MyPostGrid() {
  const posts = [
    {
      id: 1,
      category: "게시물분류",
      title: "원글 게시물 제목",
      date: "2025-08-06 00:00:00",
      reply: "내가 작성한 대댓글",
    },
    {
      id: 2,
      category: "게시물분류",
      title: "원글 게시물 제목",
      date: "2025-08-06 00:00:00",
      reply: "내가 작성한 대댓글",
    },
    // 추가 게시물 데이터...
    {
      id: 3,
      category: "게시물분류",
      title: "원글 게시물 제목",
      date: "2025-08-06 00:00:00",
      reply: "내가 작성한 대댓글",
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
        <div>편집</div>
        <div>삭제</div>
      </div>

      {/* 게시물들 및 댓글*/}
      {posts.map((post) => (
        <div
          key={post.id}
          className="border rounded-2xl p-3 shadow-md hover:shadow-lg space-y-2"
          style={{ width: "100%" }}
        >
          {/* 게시물 정보 그리드 */}
          <div
            className="grid text-center"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div>{post.category}</div>
            <div className="text-left">
              <div className="font-bold truncate" title={post.title}>
                {post.title}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {post.reply}
                {/* 필요하면 댓글 내용 일부도 여기 넣을 수 있음 */}
              </div>
            </div>
            <div className="text-gray-400">{post.date}</div>
            <div>
              <button type="submit" className="hover:cursor-pointer">
                <Image src={ICONS.EDIT} alt="edit" width={24} height={24} />
              </button>
            </div>
            <div>
              <button type="submit" className="hover:cursor-pointer">
                <Image src={ICONS.DELETE} alt="delete" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
