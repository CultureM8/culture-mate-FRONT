'use client';
import Link from 'next/link';
import useLogin from '@/hooks/useLogin';
import useFullPath from '@/hooks/useFullPath';
import { ROUTES } from '@/constants/path';

export default function CommentGate({ children }) {
  const { ready, isLogined } = useLogin();
  const fullPath = useFullPath();

  if (!ready) {
    return <div className="text-gray-400 text-sm">댓글 영역 로딩 중...</div>;
  }
  if (isLogined) return children;

  return (
    <div className="p-4 border rounded bg-gray-50 text-sm flex items-center justify-between">
      <span className="text-gray-600">로그인 후 댓글 작성이 가능합니다.</span>
      <Link
        className="px-3 py-1 rounded bg-black text-white"
        href={{
          pathname: ROUTES.LOGIN || '/login',
          query: { next: fullPath },
        }}>
        로그인
      </Link>
    </div>
  );
}
