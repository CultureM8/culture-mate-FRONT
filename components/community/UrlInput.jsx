import { useState } from 'react';

/*url입력창*/
export function UrlInput({ isOpen, onClose, onSubmit }) {
  const [inputValue, setInputValue] = useState('');

  /*URL 처리*/
  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue); /* URL 전달*/
      setInputValue(''); /*초기화*/
      onClose();
    }
  };

  /* 취소*/
  const handleCancel = () => {
    setInputValue('');
    onClose();
  };

  if (!isOpen) return null; /*닫혀있으면 렌더링 안함*/

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            외부 링크 추가
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {/* 입력 필드 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            웹사이트 주소를 입력하세요
          </label>
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
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
            disabled={!inputValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
