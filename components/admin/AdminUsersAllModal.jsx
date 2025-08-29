"use client";

import { useState } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

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

  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

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
    
    // 상태 초기화 및 모달 닫기
    setSelectedOptions([]);
    setTargetStatus("활동 중");
    onClose();
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    setSelectedOptions([]);
    setTargetStatus("활동 중");
    onClose();
  };

  // 위험한 옵션인지 확인
  const hasRiskyOptions = selectedOptions.some(id => 
    ["to_suspended", "permanent_ban"].includes(id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            선택 사용자 관리
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Image
              src={ICONS.X}
              alt="close"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* 본문 - 스크롤 가능 영역 */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 선택된 사용자 목록 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              선택된 사용자 ({selectedUsers.length}명)
            </h3>
            <div className="max-h-32 overflow-y-auto border border-gray-200 bg-gray-50 rounded-md p-3">
              <div className="space-y-2">
                {selectedUserInfo.map((user) => (
                  <div key={user.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-900">{user.id}</span>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>{user.loginType}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "활동 중" ? "bg-green-100 text-green-800" :
                        user.status === "제재 중" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 관리 항목 선택 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              관리 항목 선택
            </h3>
            <div className="space-y-3">
              {managementOptions.map((option) => (
                <div key={option.id} className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionChange(option.id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 주의사항 영역 */}
          {hasRiskyOptions && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div>
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
            </div>
          )}

          {selectedOptions.includes("reset_password") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">안내사항</h4>
                <p className="text-sm text-yellow-700">
                  비밀번호 초기화 시 임시 비밀번호가 사용자의 이메일로 발송됩니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            disabled={selectedOptions.length === 0}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedOptions.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#6DADFF] text-white hover:bg-blue-500"
            }`}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}