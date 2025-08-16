'use client';

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText,
  onConfirm,
  onClose,
  hideCancel = false,
}) {
  if (!open) return null;

  /*취소 버튼을 보일지 결정*/
  const showCancel =
    !hideCancel &&
    typeof cancelText === 'string' &&
    cancelText.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-[min(420px,95vw)] bg-white rounded-xl shadow-xl border flex flex-col overflow-hidden">
        <button
          className="absolute top-3 right-5 p-1 rounded hover:bg-gray-100 ml-4 justify-end "
          onClick={onClose}
          aria-label="닫기"
          type="button">
          ×
        </button>

        <div className="flex items-center justify-center px-8 py-8 ">
          <div className="flex-1">
            {title && <h3 className="font-semibold text-gray-900 ">{title}</h3>}

            {description && (
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 px-5 py-5 pb-5 ">
          {showCancel && (
            /* 취소버튼(조건부표시) */
            <button
              type="button"
              className="px-4 py-2 w-25 rounded border border-gray-400 bg-white hover:bg-gray-200"
              onClick={onClose}>
              {cancelText}
            </button>
          )}
          {/* 확인버튼*/}
          <button
            type="button"
            className="px-4 py-2 w-25 rounded border border-gray-500 bg-blue-600 text-white hover:bg-blue-500 "
            onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
