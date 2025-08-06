"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";

export default function UserProfileEditForm() {
  const [formData, setFormData] = useState({
    userId: "UserID", // DB에서 불러올 값
    nickname: "사용자 별명",
    newPassword: "",
    confirmPassword: "",
    email: "something@somewhere.com",
    verificationCode: "",
    address: "무슨로 00길 00 (000아파트)",
    detailAddress: "무슨아파트 몇동 몇호"
  });

  const [validationState, setValidationState] = useState({
    isNicknameChecked: false,
    isEmailVerificationSent: false,
    isEmailVerified: false,
    passwordValidation: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  const [showAddressModal, setShowAddressModal] = useState(false);

  // 비밀번호 정규식
  const passwordRegex = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    special: /[!@#$%^&*()_+\-=\[\]{};':"|,.<>\/?]/
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 비밀번호 실시간 유효성 검사
    if (field === "newPassword") {
      setValidationState(prev => ({
        ...prev,
        passwordValidation: {
          length: passwordRegex.length.test(value),
          uppercase: passwordRegex.uppercase.test(value),
          lowercase: passwordRegex.lowercase.test(value),
          number: passwordRegex.number.test(value),
          special: passwordRegex.special.test(value)
        }
      }));
    }

    // 별명이 변경되면 중복확인 상태 초기화
    if (field === "nickname") {
      setValidationState(prev => ({
        ...prev,
        isNicknameChecked: false
      }));
    }
  };

  // 비밀번호 유효성 검사 메시지
  const getPasswordValidationMessage = () => {
    const password = formData.newPassword;
    const validation = validationState.passwordValidation;

    if (!password) return "비밀번호를 입력해주세요.";
    if (!validation.length) return "비밀번호는 최소 8자 이상이어야 합니다.";
    if (!validation.uppercase) return "비밀번호에 최소 하나의 대문자를 포함해야 합니다.";
    if (!validation.lowercase) return "비밀번호에 최소 하나의 소문자를 포함해야 합니다.";
    if (!validation.number) return "비밀번호에 최소 하나의 숫자를 포함해야 합니다.";
    if (!validation.special) return "비밀번호에 최소 하나의 특수문자를 포함해야 합니다.";
    return "사용 가능한 비밀번호입니다.";
  };

  // 비밀번호가 모든 조건을 만족하는지 확인
  const isPasswordValid = () => {
    const validation = validationState.passwordValidation;
    return validation.length && validation.uppercase && validation.lowercase && 
           validation.number && validation.special;
  };

  // 별명 중복확인
  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      alert("별명을 입력해주세요.");
      return;
    }

    try {
      // TODO: DB 연동 시 실제 중복 확인 로직 구현
      // const isDuplicate = await checkNicknameDuplicate(formData.nickname);
      const isDuplicate = Math.random() > 0.5; // 임시 로직

      if (isDuplicate) {
        alert("이미 사용 중인 별명입니다. 다른 별명을 사용해주세요.");
        setValidationState(prev => ({ ...prev, isNicknameChecked: false }));
      } else {
        alert("사용 가능한 별명입니다.");
        setValidationState(prev => ({ ...prev, isNicknameChecked: true }));
      }
    } catch (error) {
      alert("중복확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = () => {
    if (!formData.newPassword) {
      alert("변경할 비밀번호를 입력해주세요.");
      return;
    }

    if (!isPasswordValid()) {
      alert("비밀번호가 조건을 충족하지 않습니다. 다시 확인해주세요.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      // TODO: DB 연동 시 비밀번호 변경 로직 구현
      alert("비밀번호가 변경되었습니다.");
      
      // 비밀번호 마스킹 처리
      setFormData(prev => ({
        ...prev,
        newPassword: "********",
        confirmPassword: "********"
      }));
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 인증번호 받기
  const handleEmailVerification = async () => {
    if (!formData.email.trim()) {
      alert("이메일 주소를 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      // TODO: 실제 이메일 발송 로직 구현
      alert("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
      setValidationState(prev => ({ 
        ...prev, 
        isEmailVerificationSent: true,
        isEmailVerified: false
      }));
    } catch (error) {
      alert("인증번호 발송 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 인증번호 확인
  const handleVerificationCheck = async () => {
    if (!formData.verificationCode.trim()) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    try {
      // TODO: 실제 인증번호 확인 로직 구현
      // const isValid = await verifyCode(formData.email, formData.verificationCode);
      const isValid = formData.verificationCode === "123456"; // 임시 로직

      if (isValid) {
        alert("이메일 인증이 완료되었습니다.");
        setValidationState(prev => ({ ...prev, isEmailVerified: true }));
      } else {
        alert("인증번호를 재확인해주세요.");
      }
    } catch (error) {
      alert("인증 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 주소 검색
  const handleAddressSearch = () => {
    setShowAddressModal(true);
  };

  // 주소 선택 완료 (임시 모달 로직)
  const handleAddressSelect = (selectedAddress) => {
    setFormData(prev => ({
      ...prev,
      address: selectedAddress
    }));
    setShowAddressModal(false);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white p-4 md:p-8 mb-96">
      {/* 개인 정보 탭 */}
      <div className="flex items-end border-b border-[#eef0f2] mb-6">
        <div className="relative w-full max-w-[400px] py-1 border-b-4 border-[#26282a] -mb-px flex justify-center">
          <span className="text-[#26282a] text-lg font-normal leading-[1.55]">개인 정보</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* 로그인 아이디 */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="w-full md:w-80">
            <label className="block text-[#26282a] text-base font-normal mb-2">
              로그인 아이디
            </label>
            <div className="bg-gray-100 h-14 flex items-center px-4 rounded border border-[#c6c8ca] w-full">
              <span className="text-[#26282a] text-base">{formData.userId}</span>
            </div>
          </div>
        </div>

        {/* 별명 */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="w-full md:w-[420px]">
            <label className="block text-[#26282a] text-base font-normal mb-2">
              별명
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
              />
              <button
                onClick={handleNicknameCheck}
                className="bg-[#c6c8ca] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap w-[80px] md:w-[90px] justify-center flex items-center"
              >
                중복확인
              </button>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="w-full lg:w-80">
            <label className="block text-[#26282a] text-base font-normal mb-2">
              변경할 비밀번호
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              placeholder="-"
              className="w-full bg-gray-100 h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
            />
            {formData.newPassword && (
              <p className={`text-sm mt-1 ${isPasswordValid() ? 'text-green-600' : 'text-red-600'}`}>
                {getPasswordValidationMessage()}
              </p>
            )}
          </div>
          <div className="w-full lg:w-[455px]">
            <label className="block text-[#26282a] text-base font-normal mb-2">
              비밀번호 확인
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="-"
                className="flex-1 bg-gray-100 h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
              />
              <button
                onClick={handlePasswordChange}
                className="bg-[#c6c8ca] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap"
              >
                비밀번호 변경
              </button>
            </div>
          </div>
        </div>

        {/* 이메일 인증 */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="w-full lg:w-[695px]">
            <label className="block text-[#26282a] text-base font-normal mb-2">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
              />
              <button
                onClick={handleEmailVerification}
                className="bg-[#c6c8ca] text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-base font-medium whitespace-nowrap"
              >
                인증번호 받기
              </button>
            </div>
          </div>
          <div className="w-full lg:flex-1">
            <label className="block text-[#26282a] text-base font-medium mb-2">
              인증번호
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.verificationCode}
                onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                placeholder="●●●●●●"
                className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                disabled={!validationState.isEmailVerificationSent}
              />
              <button
                onClick={handleVerificationCheck}
                disabled={!validationState.isEmailVerificationSent}
                className="bg-[#c6c8ca] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap disabled:opacity-50"
              >
                인증확인
              </button>
            </div>
          </div>
        </div>

        {/* 주소 */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          <div className="w-full lg:w-[695px]">
            <label className="block text-[#26282a] text-base font-normal mb-2">
              주소
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.address}
                readOnly
                className="flex-1 bg-gray-100 h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base cursor-pointer"
                onClick={handleAddressSearch}
              />
              <button
                onClick={handleAddressSearch}
                className="bg-[#c6c8ca] text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-base font-medium flex items-center gap-1 md:gap-2 whitespace-nowrap w-[100px] md:w-[125px] justify-center"
              >
                <Image 
                  src={ICONS.SEARCH}
                  alt="search-icon"
                  width={16}
                  height={16}
                  className="md:w-5 md:h-5"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                주소 검색
              </button>
            </div>
          </div>
          <div className="w-full lg:flex-1">
            <label className="block text-[#26282a] text-base font-medium mb-2">
              상세 주소
            </label>
            <input
              type="text"
              value={formData.detailAddress}
              onChange={(e) => handleInputChange("detailAddress", e.target.value)}
              className="w-full bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
            />
          </div>
        </div>
      </div>

      {/* 주소 검색 모달 (임시) */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">주소 검색</h3>
            <p className="text-gray-600 mb-4">
              실제 구현 시에는 주소 API가 연동될 예정입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleAddressSelect("서울특별시 강남구 테헤란로 123")}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded"
              >
                샘플 주소 선택
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}