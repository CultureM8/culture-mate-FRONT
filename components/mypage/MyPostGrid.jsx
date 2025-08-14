import { ICONS } from "@/constants/path";
import Image from "next/image";
import SearchFilterSort from "@/components/global/SearchSort";

export default function MyPostGrid({ posts }) {
  const gridCols = "120px 1fr 60px 60px 60px 190px 60px 60px";

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
        <div>댓글수</div>
        <div>추천수</div>
        <div>관심수</div>
        <div>작성일</div>
      </div>

      {/* 게시물들 */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="grid text-center border rounded-2xl p-3 shadow-md hover:shadow-lg"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div>{post.category}</div>
          <div className="truncate font-bold text-left" title={post.title}>
            {post.title}
          </div>
          <div>{post.comments}</div>
          <div>{post.likes}</div>
          <div>{post.favorites}</div>
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
      ))}
    </div>
  );
}
