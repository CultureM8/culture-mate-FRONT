'use client';
/**네비게이션 바에서 사용하는 로그인/로그아웃 UI 컴포넌트 */

import Link from 'next/link';
import useLogin from '@/hooks/useLogin';

export default function LoginNavControls({ className = '' }) {
  const { ready, isLogined, user, logout, loading } = useLogin();

  /**초기 로딩상태 */
  if (!ready) {
    return <div className={`w-[180px] h-9 ${className}`} />;
  }
  /**로그아웃상태 */
  if (!isLogined) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link
          href="/login"
          className="px-4 h-9 inline-flex items-center rounded border hover:bg-gray-50">
          로그인
        </Link>
      </div>
    );
  }
  /**로그인상태 */
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      아바타(선택)
      {user?.avatarUrl && (
        <img
          src={user.avatarUrl}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
      <span className="text-sm text-gray-600 hidden sm:inline">
        {user?.login_id}
      </span>
      <Link
        href="/mypage"
        className="px-4 h-9 inline-flex items-center rounded border hover:bg-gray-50">
        마이페이지
      </Link>
      <button
        onClick={logout}
        disabled={loading}
        className="px-3 h-9 inline-flex items-center rounded bg-black text-white disabled:opacity-60">
        {loading ? '...' : '로그아웃'}
      </button>
    </div>
  );
}
