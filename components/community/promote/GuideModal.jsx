'use client'; /*홍보게시글 작성 들어가면 뜨는 가이드 모달*/

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuideModal({
  open,
  onClose,
  title = '',
  description = '',
  confirmText = '확인',
  actionText = '자세히 보기',
  actionPath = '/event',
}) {
  const router = useRouter();

  /*모달 열릴 때 배경 스크롤 방지*/
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleActionClick = () => {
    router.push(actionPath);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-[min(450px,95vw)] bg-white rounded-xl shadow-xl border overflow-hidden">
        <div className=" px-5 py-4 text-center bg-white ">
          {/* 제목 */}
          <h3 className="font-bold text-xl text-gray-900 mt-4 mb-3">{title}</h3>
        </div>

        {/* 내용 영역 */}
        <div className="px-6 py-4 border border-gray-400 mx-8 rounded-md">
          <div className="text-sm text-gray-600 leading-6 whitespace-pre-line text-left">
            {description}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex px-2 justify-between py-4 mx-8 my-8">
          {/* 페이지 이동 버튼 */}
          <button
            type="button"
            className=" px-4 py-2 min-w-[220px] rounded-lg border border-gray-400 bg-white text-black hover:bg-gray-200 transition-colors font-medium "
            onClick={handleActionClick}>
            {actionText}
          </button>

          {/* 확인 버튼*/}
          <button
            type="button"
            className=" px-4 py-2 min-w-[100px] rounded-lg border border-gray-400 bg-blue-600 text-white hover:bg-blue-500 transition-colors "
            onClick={onClose}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
