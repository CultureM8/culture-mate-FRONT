// Modal.jsx
// disableBackgroundClose: 배경 클릭 시 모달 닫힘 방지 (true: 비활성화, false: 활성화)
export default function Modal({ isOpen, onClose, children, disableBackgroundClose = false }) {
  if (!isOpen) return null; // 모달이 열리지 않으면 렌더링 안 함

  const handleBackgroundClick = (e) => {
    if (!disableBackgroundClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      {/* 배경 */}
      <div 
        className="absolute inset-0 bg-black opacity-50"
        onClick={handleBackgroundClick} // 배경 클릭 시 닫기 (조건부)
      ></div>

      {/* 모달 박스 */}
      <div 
        className="bg-white p-6 rounded-lg shadow-lg relative z-10"
        onClick={(e) => e.stopPropagation()} // 내용 클릭 시 닫힘 방지
      >
        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
