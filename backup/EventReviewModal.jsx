"use client"

import Modal from "../components/global/Modal"

export default function EventReviewModal({ isOpen, onClose, 
  eventType = "이벤트유형", 
  eventName = "이벤트명", 
}) {

  return (
    <Modal isOpen={isOpen} onClose={onClose} >
      <div className="w-xl">

        <h2 className="text-xl font-bold mb-4 text-center">이벤트 필터</h2>
        <div className="flex gap-2">
          <span className="border border-b-2 rounded-4xl px-2 w-fit">{eventType}</span>
          <strong>{eventName}</strong>
        </div>

      </div>
    </Modal>
  )
}