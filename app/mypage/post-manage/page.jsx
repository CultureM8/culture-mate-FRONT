import PostManageTab from "@/components/mypage/PostManageTab";
import PageTitle from "@/components/global/PageTitle";
import { useMemo } from "react";

export default function PostManage() {
  const posts = useMemo(
    () => [
      {
        id: 1,
        category: "게시물분류",
        title: "제목(공백 포함 30자 이후 말줄임...여기까지 30자)...",
        comments: 1,
        likes: 2,
        favorites: 3,
        date: "2025-08-06 00:00:00",
      },
      {
        id: 2,
        category: "게시물분류",
        title: "제목(공백 포함 30자 이후 말줄임...여기까지 30자)...",
        comments: 4,
        likes: 5,
        favorites: 6,
        date: "2025-08-06 00:00:00",
      },
      {
        id: 3,
        category: "게시물분류",
        title: "제목(공백 포함 30자 이후 말줄임...여기까지 30자)...",
        comments: 7,
        likes: 8,
        favorites: 9,
        date: "2025-08-06 00:00:00",
      },
    ],
    []
  );
  const reply = useMemo(
    () => [
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
      {
        id: 4,
        category: "게시물분류",
        title: "원글 게시물 제목4",
        date: "2025-08-06 00:00:00",
        reply: "내가 작성한 대댓글0",
      },
      // 추가 게시물 데이터...
    ],
    []
  );
  return (
    <>
      <PageTitle>내 게시글</PageTitle>
      <div className="mt-4 space-y-1">
        <PostManageTab posts={posts} />
      </div>
    </>
  );
}
