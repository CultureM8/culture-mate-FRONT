"use client";

import React, { useState, useEffect } from "react";
import useLogin from "@/hooks/useLogin";
import { getMemberDetail } from "@/lib/api/memberDetailApi";
import { authApi, authUtils } from "@/lib/api/authApi";

// 개인정보 수정 컴포넌트 (ProfileEdit에서 분리)
export default function PersonalInfoEdit({ onValidationChange }) {
  const { user } = useLogin();

  // 하단 개인정보 편집 상태
  const [formData, setFormData] = useState({
    loginId: "", // 현재 로그인 ID (수정 가능)
    currentPassword: "", // 현재 비밀번호 확인용
    newPassword: "", // 비어있어야 함
    confirmPassword: "", // 비어있어야 함
    email: "", // 비어있어야 함
    verificationCode: "",
  });

  // 초기 데이터 저장용
  const [initialData, setInitialData] = useState({
    loginId: "",
    email: ""
  });

  const [validationState, setValidationState] = useState({
    isLoginIdChecked: false,
    isCurrentPasswordVerified: false, // 현재 비밀번호 확인 상태
    isEmailVerificationSent: false,
    isEmailVerified: false,
    loginIdError: "",
    passwordValidation: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });


  // 비밀번호 정규식
  const passwordRegex = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /\d/,
    special: /[!@#$^&*()+-[]{}:|,.?]/,
  };

  useEffect(() => {
    if (user?.id) {
      // 자신의 정보 조회 (ID 없이 호출)
      getMemberDetail()
        .then((data) => {
          const loginId = data.member?.loginId || "";
          const email = data.member?.email || "";

          // 초기 데이터 저장
          setInitialData({ loginId, email });

          // 폼 데이터 설정
          setFormData(prev => ({
            ...prev,
            loginId: loginId,
            email: email
          }));
        })
        .catch((error) => {
          console.error("Failed to fetch member details:", error);
        });
    }
  }, [user]);

  // 개인정보 편집 핸들러들
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 비밀번호 실시간 유효성 검사
    if (field === "newPassword") {
      setValidationState((prev) => ({
        ...prev,
        passwordValidation: {
          length: passwordRegex.length.test(value),
          uppercase: passwordRegex.uppercase.test(value),
          lowercase: passwordRegex.lowercase.test(value),
          number: passwordRegex.number.test(value),
          special: passwordRegex.special.test(value),
        },
      }));
    }
  };

  // 비밀번호 유효성 검사 메시지
  const getPasswordValidationMessage = () => {
    const password = formData.newPassword;
    const validation = validationState.passwordValidation;

    if (!password) return "비밀번호를 입력해주세요.";
    if (!validation.length) return "비밀번호는 최소 8자 이상이어야 합니다.";
    if (!validation.uppercase)
      return "비밀번호에 최소 하나의 대문자를 포함해야 합니다.";
    if (!validation.lowercase)
      return "비밀번호에 최소 하나의 소문자를 포함해야 합니다.";
    if (!validation.number)
      return "비밀번호에 최소 하나의 숫자를 포함해야 합니다.";
    if (!validation.special)
      return "비밀번호에 최소 하나의 특수문자를 포함해야 합니다.";
    return "사용 가능한 비밀번호입니다.";
  };

  // 비밀번호가 모든 조건을 만족하는지 확인
  const isPasswordValid = () => {
    const validation = validationState.passwordValidation;
    return (
      validation.length &&
      validation.uppercase &&
      validation.lowercase &&
      validation.number &&
      validation.special
    );
  };

  // 로그인 ID 변경 여부 확인
  const isLoginIdChanged = () => {
    return formData.loginId !== initialData.loginId;
  };

  // 로그인 ID 중복확인
  const handleLoginIdCheck = async () => {
    if (!formData.loginId.trim()) {
      alert("로그인 아이디를 입력해주세요.");
      return;
    }

    // 기존 아이디와 동일하면 중복확인 불필요
    if (!isLoginIdChanged()) {
      alert("기존 아이디와 동일합니다. 변경할 아이디를 입력해주세요.");
      return;
    }

    // authUtils를 이용한 유효성 검사
    const validationError = authUtils.getLoginIdValidationMessage(formData.loginId);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const result = await authApi.checkLoginIdDuplicate(formData.loginId);
      setValidationState((prev) => ({
        ...prev,
        isLoginIdChecked: !result.isDuplicate,
        loginIdError: result.isDuplicate ? "이미 사용 중인 아이디입니다." : ""
      }));
      alert(result.message);
    } catch (error) {
      console.error("아이디 중복확인 실패:", error);
      alert(`중복확인에 실패했습니다: ${error.message}`);
    }
  };

  // 현재 비밀번호 확인
  const handleCurrentPasswordCheck = async () => {
    if (!formData.currentPassword.trim()) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const result = await authApi.verifyCurrentPassword(formData.currentPassword);

      if (result.isValid) {
        setValidationState(prev => ({
          ...prev,
          isCurrentPasswordVerified: true
        }));
        alert(result.message || "비밀번호가 확인되었습니다. 이제 비밀번호를 변경할 수 있습니다.");
      } else {
        setValidationState(prev => ({
          ...prev,
          isCurrentPasswordVerified: false
        }));
        alert(result.message || "현재 비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("비밀번호 확인 실패:", error);
      setValidationState(prev => ({
        ...prev,
        isCurrentPasswordVerified: false
      }));
      alert(`비밀번호 확인에 실패했습니다: ${error.message}`);
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
      setFormData((prev) => ({
        ...prev,
        newPassword: "********",
        confirmPassword: "********",
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
      setValidationState((prev) => ({
        ...prev,
        isEmailVerificationSent: true,
        isEmailVerified: false,
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
      const isValid = formData.verificationCode === "123456"; // 임시 로직

      if (isValid) {
        alert("이메일 인증이 완료되었습니다.");
        setValidationState((prev) => ({ ...prev, isEmailVerified: true }));
      } else {
        alert("인증번호를 재확인해주세요.");
      }
    } catch (error) {
      alert("인증 확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };


  return (
    <div className="w-full mt-8 border-t border-gray-200">
      {/* 개인 정보 탭 */}
      <div className="flex items-end border-b border-[#eef0f2] mb-6 mt-8">
        <div className="relative w-full max-w-[400px] py-1 border-b-4 border-[#26282a] -mb-px flex justify-center">
          <span className="text-[#26282a] text-lg font-normal leading-[1.55]">
            개인 정보
          </span>
        </div>
      </div>

      {/* 개발 중 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 mt-0.5">ℹ️</span>
          <div>
            <p className="text-blue-800 text-sm font-medium mb-1">
              개인정보 변경 기능 안내
            </p>
            <p className="text-blue-700 text-sm">
              현재 개인정보 변경 UI는 구현되어 있지만, 실제 저장 시에는 적용되지 않습니다.
              추후 보안 강화와 함께 정식 서비스될 예정입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* 로그인 아이디 */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="w-full md:w-[420px]">
            <label className="block text-[#26282a] text-base font-normal mb-2">
              로그인 아이디
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.loginId}
                onChange={(e) => {
                  const value = e.target.value;

                  // 실시간 유효성 검사
                  const validationError = authUtils.getLoginIdValidationMessage(value);

                  setFormData(prev => ({ ...prev, loginId: value }));
                  setValidationState(prev => ({
                    ...prev,
                    loginIdError: validationError || "",
                    isLoginIdChecked: false // 변경시 중복확인 초기화
                  }));
                }}
                placeholder={initialData.loginId || "4-20자, 영문/숫자/언더스코어"}
                className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                maxLength={20}
              />
              <button
                onClick={handleLoginIdCheck}
                disabled={!isLoginIdChanged() || !!validationState.loginIdError}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap w-[80px] md:w-[90px] justify-center flex items-center transition-colors ${
                  !isLoginIdChanged() || !!validationState.loginIdError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#c6c8ca] text-white hover:bg-gray-400'
                }`}>
                중복확인
              </button>
            </div>
            {validationState.loginIdError && (
              <p className="text-red-500 text-sm mt-1">
                {validationState.loginIdError}
              </p>
            )}
            {validationState.isLoginIdChecked && (
              <p className="text-green-600 text-sm mt-1">
                사용 가능한 아이디입니다.
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              4-20자, 영문·숫자·언더스코어(_)만 사용 가능
            </p>
          </div>
        </div>


        {/* 비밀번호 변경 */}
        <div className="flex flex-col gap-4">
          {/* 현재 비밀번호 확인 */}
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-full md:w-[420px]">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                현재 비밀번호
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, currentPassword: e.target.value }));
                    // 현재 비밀번호가 변경되면 확인 상태 초기화
                    if (validationState.isCurrentPasswordVerified) {
                      setValidationState(prev => ({ ...prev, isCurrentPasswordVerified: false }));
                    }
                  }}
                  placeholder="비밀번호 변경을 위해 현재 비밀번호를 입력하세요"
                  className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                />
                <button
                  onClick={handleCurrentPasswordCheck}
                  disabled={!formData.currentPassword.trim()}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors ${
                    !formData.currentPassword.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#4F8FFF] text-white hover:bg-blue-600'
                  }`}>
                  확인
                </button>
              </div>
              {validationState.isCurrentPasswordVerified && (
                <p className="text-green-600 text-sm mt-1">
                  비밀번호가 확인되었습니다.
                </p>
              )}
            </div>
          </div>

          {/* 비밀번호 변경 영역 */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="w-full lg:w-80">
              <label className="block text-[#26282a] text-base font-normal mb-2">
                변경할 비밀번호
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder={validationState.isCurrentPasswordVerified ? "새 비밀번호를 입력하세요" : "현재 비밀번호를 먼저 확인해주세요"}
                disabled={!validationState.isCurrentPasswordVerified}
                className={`w-full h-14 px-4 rounded border text-[#26282a] text-base focus:outline-none ${
                  validationState.isCurrentPasswordVerified
                    ? 'bg-white border-[#c6c8ca] focus:border-[#4F8FFF]'
                    : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                }`}
              />
              {formData.newPassword && validationState.isCurrentPasswordVerified && (
                <p
                  className={`text-sm mt-1 ${
                    isPasswordValid() ? "text-green-600" : "text-red-600"
                  }`}>
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
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder={validationState.isCurrentPasswordVerified ? "새 비밀번호를 다시 입력하세요" : "현재 비밀번호를 먼저 확인해주세요"}
                  disabled={!validationState.isCurrentPasswordVerified}
                  className={`flex-1 h-14 px-4 rounded border text-[#26282a] text-base focus:outline-none ${
                    validationState.isCurrentPasswordVerified
                      ? 'bg-white border-[#c6c8ca] focus:border-[#4F8FFF]'
                      : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                  }`}
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={!validationState.isCurrentPasswordVerified || !formData.newPassword || !formData.confirmPassword}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors ${
                    !validationState.isCurrentPasswordVerified || !formData.newPassword || !formData.confirmPassword
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#c6c8ca] text-white hover:bg-gray-400'
                  }`}>
                  비밀번호 변경
                </button>
              </div>
              {formData.confirmPassword && validationState.isCurrentPasswordVerified && (
                <p className={`text-sm mt-1 ${
                  formData.newPassword === formData.confirmPassword && formData.confirmPassword
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.newPassword === formData.confirmPassword
                    ? '비밀번호가 일치합니다.'
                    : '비밀번호가 일치하지 않습니다.'
                  }
                </p>
              )}
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
                className="bg-[#c6c8ca] text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-base font-medium whitespace-nowrap">
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
                onChange={(e) =>
                  handleInputChange("verificationCode", e.target.value)
                }
                placeholder="●●●●●●"
                className="flex-1 bg-white h-14 px-4 rounded border border-[#c6c8ca] text-[#26282a] text-base focus:outline-none focus:border-[#4F8FFF]"
                disabled={!validationState.isEmailVerificationSent}
              />
              <button
                onClick={handleVerificationCheck}
                disabled={!validationState.isEmailVerificationSent}
                className="bg-[#c6c8ca] text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium whitespace-nowrap disabled:opacity-50">
                인증확인
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}