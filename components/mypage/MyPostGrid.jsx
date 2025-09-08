import { ICONS } from "@/constants/path";
import Image from "next/image";
import SearchFilterSort from "@/components/global/SearchSort";

export default function MyPostGrid({ posts }) {
  const gridCols = "140px 1fr 60px 60px 60px 200px 60px 60px";

  return (
    <div className="mt-6 mb-10 space-y-1">
      <SearchFilterSort />
      {/* 게시글 헤더 */}
      <div
        className="grid border-b  text-center text-sm py-3 px-4 mb-4"
        style={{ gridTemplateColumns: gridCols }}>
        <div className="text-left">게시물분류</div>
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
          className="grid text-sm text-gray-800 border-b border-gray-300 py-3 px-4 text-center  hover:bg-gray-50"
          style={{ gridTemplateColumns: gridCols }}>
          <div className="text-left">{post.category}</div>
          <div
            className="truncate  text-left text-sm text-gray-800"
            title={post.title}>
            {post.title}
          </div>
          <div>{post.comments}</div>
          <div>{post.likes}</div>
          <div>{post.favorites}</div>
          <div className="text-center text-sm text-gray-400">{post.date}</div>
          <div>
            <button type="submit" className="hover:cursor-pointer">
              <Image src={ICONS.EDIT} alt="edit" width={16} height={16} />
            </button>
          </div>
          <div>
            <button type="submit" className="hover:cursor-pointer">
              <Image src={ICONS.DELETE} alt="delete" width={16} height={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
