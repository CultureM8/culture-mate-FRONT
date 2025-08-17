/*url,이미지,비디오 컴포넌트 버튼 컴포넌트*/
'use client';
import { useRef } from 'react';
import { ICONS } from '@/constants/path';
import { useState } from 'react';
import Image from 'next/image';
import { UrlInput } from './UrlInput';
import { ImgInput } from './ImgInput';
import { VideoInput } from './VideoInput';

export default function AddContent() {
  /*상태 선언*/
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  /*url*/
  const handleUrlSubmit = (url) => {
    console.log('받은 URL:', url);
    setShowUrlModal(false);
  };

  /*이미지 */
  const handleImageSubmit = (file, previewUrl) => {
    console.log('선택된 이미지 파일:', file);
    console.log('미리보기 URL:', previewUrl);
    setShowImageModal(false);
  };

  /*비디오 */
  const handleVideoSubmit = (file, previewUrl) => {
    console.log('선택된 동영상 파일:', file);
    console.log('미리보기 URL:', previewUrl);
    setShowVideoModal(false);
  };

  return (
    <span className="flex gap-6 w-[450px] h-[36px] ">
      {/* URL 컨텐츠 */}
      <button
        onClick={() => setShowUrlModal(true)}
        className="flex items-center gap-1  border-2 border-gray-300 rounded hover:bg-gray-200 transition-colors px-1">
        <span>외부 컨텐츠</span>
        <Image src="/img/add_contents.svg" alt="link" width={24} height={24} />
      </button>

      {/* 이미지 */}
      <button
        onClick={() => setShowImageModal(true)}
        className="flex items-center gap-1 border-2 border-gray-300 rounded hover:bg-gray-200 transition-colors px-1">
        <span>이미지 추가</span>
        <Image src="/img/add_image.svg" alt="image" width={24} height={24} />
      </button>

      {/* 동영상 */}
      <button
        onClick={() => setShowVideoModal(true)}
        className="flex items-center gap-1 border border-gray-300 rounded hover:bg-gray-200 transition-colors px-1">
        <span>동영상 추가</span>

        <Image src="/img/add_video.svg" alt="video" width={24} height={24} />
      </button>

      {showUrlModal && (
        <UrlInput
          isOpen={showUrlModal}
          onClose={() => setShowUrlModal(false)}
          onSubmit={handleUrlSubmit}
        />
      )}

      {showImageModal && (
        <ImgInput
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onSubmit={handleImageSubmit}
        />
      )}

      {showVideoModal && (
        <VideoInput
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          onSubmit={handleVideoSubmit}
        />
      )}
    </span>
  );
}
