"use client";

import { useState } from "react";
import Modal from "@/components/global/Modal";

export default function AdminUsersAllModal({ 
  isOpen,           // 모달 표시 여부
  onClose,          // 모달 닫기 함수
  selectedUsers,    // 선택된 사용자 ID 배열
  userData,         // 전체 사용자 데이터
  onApply           // 관리 적용 함수
}) {
  // 관리 옵션 상태 관리
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [targetStatus, setTargetStatus] = useState("활동 중");

  // 선택된 사용자 정보 가져오기
  const selectedUserInfo = userData.filter(user => selectedUsers.includes(user.id));

  // 관리 항목 정의
  const managementOptions = [
    { 
      id: "to_active", 
      label: "활동 중으로 전환", 
      type: "status",
      targetStatus: "활동 중",
      description: "휴면 또는 제재 중인 사용자를 활동 중으로 변경합니다."
    },
    { 
      id: "to_dormant", 
      label: "휴면으로 전환", 
      type: "status",
      targetStatus: "휴면",
      description: "사용자 계정을 휴면 상태로 변경합니다."
    },
    { 
      id: "to_suspended", 
      label: "제재 중으로 전환", 
      type: "status",
      targetStatus: "제재 중",
      description: "사용자 계정을 제재 중 상태로 변경합니다."
    },
    { 
      id: "permanent_ban", 
      label: "영구 정지", 
      type: "ban",
      description: "사용자 계정을 영구적으로 정지합니다. 신중하게 결정해주세요."
    },
    { 
      id: "reset_password", 
      label: "비밀번호 초기화", 
      type: "reset",
      description: "사용자의 비밀번호를 임시 비밀번호로 초기화합니다."
    }
  ];

  // 옵션 선택/해제 핸들러
  const handleOptionChange = (optionId) => {
    const option = managementOptions.find(opt => opt.id === optionId);
    
    if (selectedOptions.includes(optionId)) {
      // 이미 선택된 경우 해제
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      // 상태 변경 옵션들은 상호 배타적으로 처리
      if (option.type === "status") {
        const newOptions = selectedOptions.filter(id => {
          const existingOption = managementOptions.find(opt => opt.id === id);
          return existingOption.type !== "status";
        });
        setSelectedOptions([...newOptions, optionId]);
        setTargetStatus(option.targetStatus);
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    }
  };

  // 적용 버튼 클릭 핸들러
  const handleApply = () => {
    if (selectedOptions.length === 0) {
      alert("적용할 관리 옵션을 선택해주세요.");
      return;
    }

    const managementData = {
      selectedUsers,
      selectedOptions,
      targetStatus: selectedOptions.some(id => 
        managementOptions.find(opt => opt.id === id)?.type === "status"
      ) ? targetStatus : null
    };
    
    onApply(managementData);
    onClose();
    
    // 상태 초기화
    setSelectedOptions([]);
    setTargetStatus("활동 중");
  };

  // 위험한 옵션인지 확인
  const hasRiskyOptions = selectedOptions.some(id => 
    ["to_suspended", "permanent_ban"].includes(id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} disableBackgroundClose={true}>
      {/* 모달 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black">
          선택 사용자 관리
        </h2>
      </div>

      {/* 선택된 사용자 목록 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-3">
          선택된 사용자 ({selectedUsers.length}명)
        </h3>
        <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 border border-gray-200">
          {selectedUserInfo.length > 0 ? (
            selectedUserInfo.map((user, index) => (
              <div key={user.id} className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-700">
                  {index + 1}. {user.id} ({user.loginType})
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === "활동 중" ? "bg-green-100 text-green-800" :
                  user.status === "제재 중" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {user.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              선택된 사용자가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 관리 항목 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-3">
          관리 항목 선택
        </h3>
        <div className="space-y-3">
          {managementOptions.map((option) => (
            <div key={option.id} className="flex items-start space-x-3">
              <input
                type="checkbox"
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionChange(option.id)}
                className="w-4 h-4 mt-1 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label 
                  htmlFor={option.id}
                  className="text-sm font-medium text-black cursor-pointer block"
                >
                  {option.label}
                </label>
                <div className="text-xs text-gray-600 mt-1">
                  {option.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주의사항 영역 */}
      {hasRiskyOptions && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800 mb-2">주의사항</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {selectedOptions.includes("to_suspended") && (
              <li>• 제재 중으로 전환 시 사용자는 서비스 이용이 제한됩니다.</li>
            )}
            {selectedOptions.includes("permanent_ban") && (
              <li>• 영구 정지는 되돌릴 수 없는 조치입니다. 신중하게 결정해주세요.</li>
            )}
          </ul>
        </div>
      )}

      {selectedOptions.includes("reset_password") && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <span className="text-sm font-medium text-yellow-700">
            주의: 비밀번호 초기화 시 임시 비밀번호가 사용자의 이메일로 발송됩니다.
          </span>
        </div>
      )}

      {/* 모달 푸터 */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleApply}
          disabled={selectedUsers.length === 0 || selectedOptions.length === 0}
          className="bg-[#6DADFF] text-white px-4 py-2 rounded-[8px] text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5A9EFF] transition-colors"
        >
          선택 항목 적용
        </button>
      </div>
    </Modal>
  );
}