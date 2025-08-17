/*이미지 업로드*/
import { useState, useRef } from 'react';

export function ImgInput({ isOpen, onClose, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  /* 파일 선택*/
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);

      /*미리보기*/
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('이미지 파일만 선택해주세요.');
    }
  };

  /*파일 입력 */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /* 이미지 확인*/
  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile, previewUrl); /*파일과 미리보기 URL 모두 전달*/
      handleCancel(); /* 닫고 초기화*/
    }
  };

  /* 취소*/
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] max-w-[90vw] shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">이미지 추가</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {/* 파일 업로드 영역 */}
        <div className="mb-6">
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-gray-600 mb-2">이미지를 클릭해서 선택하세요</p>
              <p className="text-sm text-gray-400">JPG, PNG, GIF 파일 지원</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 미리보기 */}
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">
                  ✕
                </button>
              </div>

              {/* 파일 정보 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
