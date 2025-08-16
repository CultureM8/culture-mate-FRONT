'use client'; /*홍보게시판 글작성페이지 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PromoteWriteOption from '@/components/community/promote/PromoteWriteOption';
import EditorFunction from '@/components/community/promote/EditorFunction';
import ConfirmModal from '@/components/global/ConfirmModal';
import PostEventMiniCard from '@/components/global/PostEventMiniCard';
import GuideModal from '@/components/community/promote/GuideModal';
import { makePost } from '@/lib/schema';
import { addPost } from '@/lib/storage';

export default function PromoteWrite() {
  const router = useRouter();

  const [mode, setMode] = useState('plain');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  /* 모달 */
  const [openCancel, setOpenCancel] = useState(false);
  const [openSubmit, setOpenSubmit] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    setIsGuideOpen(true); // ✅ 존재하는 setter로 변경
  }, []);

  const trySubmit = () => {
    if (!title.trim()) return alert('제목을 입력해주세요.');
    if (!content.trim()) return alert('내용을 입력해주세요.');
    setOpenSubmit(true);
  };

  return (
    <div className="flex flex-col items-center">
      {/* 페이지 타이틀 */}
      <div className="w-full max-w-[1200px] h-[108px] flex items-center">
        <h1 className="font-inter font-semibold text-[36px] leading-[44px] tracking-[-0.005em] text-[#26282A]">
          홍보 게시판
        </h1>
      </div>

      {/* 옵션 박스 (이벤트/컨텐츠/글쓰기 방식) */}
      <PromoteWriteOption
        mode={mode}
        onModeChange={setMode}
        onPickEvent={setSelectedEvent} // 이벤트 선택 콜백 연결
      />

      {/* 선택된 이벤트 카드 (선택 전엔 숨김) */}
      <div className="mt-6 w-full max-w-[1200px]">
        {selectedEvent && <PostEventMiniCard {...selectedEvent} />}
      </div>

      {/* 제목 */}
      <div className="w-[1200px] mt-4">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-[60px] border border-gray-300 rounded px-4 text-base outline-none focus:border-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 에디터 */}
      <div className=" <div className=w-full max-w-[1200px] mt-4">
        <EditorFunction mode={mode} value={content} onChange={setContent} />
      </div>

      {/* 가이드 박스 */}
      <div className="w-full max-w-[1200px] mt-3  text-xs text-gray-500 leading-5 bg-gray-50 border border-gray-200 rounded-md p-3">
        문품권, 식권, 바우처, 암표 및 홍보권, 저작권 침해 게시물은 민, 형사상의
        책임을 질 수 있습니다.
        <br />
        <br />
        [저작권 안내] 이용자가 불법복제물을 거래·유통하거나 이에 대한 광고 및
        불법복제물의 삭제 또는 전송 중단 조치를 할 수 있으며, 공유를 받은
        이용자에게서 사용 정지를 할 수 있습니다.(관련 법령: 저작권법 제133조 및
        제136조)
      </div>

      {/* 버튼 */}
      <div className="w-full max-w-[1200px] flex justify-end gap-3 mt-6 mb-10">
        <button
          onClick={() => setOpenCancel(true)}
          className="px-5 py-2 border rounded bg-gray-400 text-white hover:bg-gray-200">
          취소
        </button>
        <button
          onClick={trySubmit}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
          등록
        </button>
      </div>

      {/* 취소 모달 */}
      <ConfirmModal
        open={openCancel}
        title="취소하겠습니까?"
        description="작성 중인 내용은 저장되지 않습니다."
        confirmText="네"
        cancelText="아니오"
        onConfirm={() => {
          setOpenCancel(false);
          router.push('/community/promote');
        }}
        onClose={() => setOpenCancel(false)}
        variant="danger"
      />

      {/* 등록 모달 */}
      <ConfirmModal
        open={openSubmit}
        title="글을 등록하시겠습니까?"
        description="등록 후 페이지를 이동합니다."
        confirmText="네"
        cancelText="아니오"
        onConfirm={() => {
          if (!title.trim()) return alert('제목을 입력해주세요.');
          if (!content.trim()) return alert('내용을 입력해주세요.');

          const post = makePost({
            board: 'promote',
            title,
            content,
            mode,
            eventId: selectedEvent?.id ?? null,

            eventSnapshot: selectedEvent ?? null,
          });

          addPost(post);
          setOpenSubmit(false);
          router.push(`/community/promote/${post.id}`);
        }}
        onClose={() => setOpenSubmit(false)}
      />

      {/* 안내 모달 */}
      <GuideModal
        open={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="홍보 게시판 작성 시 꼭 확인하세요!"
        description={`1.광고 내용이 사실과 다르거나 소비자를 오인시킬 우려가 있는 내용은 금지됩니다.\n
          2.허위·과장 광고를 하거나, 표시 의무를 위반할 경우 법적 제재를 받을 수 있습니다.\n
          3.과태료 부과 및 광고 중단 등의 조치가 취해질 수 있습니다.\n
          4.공정거래위원회는 "추천·보증 등에 관한 표시·광고 심사지침"을 통해 광고성 게시글 작성 시 준수해야 할 사항을 규정하고 있습니다. `}
        confirmText="확인"
        actionText="이벤트 업체 가이드 보기"
        actionPath="/help/guide"
      />
    </div>
  );
}
