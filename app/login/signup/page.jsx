"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/path";
import { authApi, authUtils } from "@/lib/api/authApi";

export default function SignUpPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get("next") || ROUTES.LOGIN || "/login";

  const [form, setForm] = useState({
    login_id: "",
    nickname: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [checkStatus, setCheckStatus] = useState({
    loginId: null, // null: 미확인, true: 사용가능, false: 중복
    email: null
  });
  const [touched, setTouched] = useState({}); // 사용자가 필드를 터치했는지 추적

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));

    // 아이디나 이메일이 변경되면 중복 확인 상태 초기화
    if (name === 'login_id') {
      setCheckStatus(prev => ({ ...prev, loginId: null }));
    } else if (name === 'email') {
      setCheckStatus(prev => ({ ...prev, email: null }));
    }

    // 실시간 검증 (touched된 필드만)
    if (touched[name]) {
      validateField(name, value);
    }

    // 비밀번호가 변경되면 비밀번호 확인도 다시 검증
    if (name === 'password' && touched.confirm) {
      validateField('confirm', form.confirm);
    }
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // 개별 필드 검증
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'login_id':
        const loginIdError = authUtils.getLoginIdValidationMessage(value);
        if (loginIdError) {
          newErrors.login_id = loginIdError;
        } else {
          delete newErrors.login_id;
        }
        break;
      case 'nickname':
        if (!value.trim()) {
          newErrors.nickname = "닉네임을 입력하세요.";
        } else {
          delete newErrors.nickname;
        }
        break;
      case 'email':
        const emailError = authUtils.getEmailValidationMessage(value);
        if (emailError) {
          newErrors.email = emailError;
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        const passwordError = authUtils.getPasswordValidationMessage(value);
        if (passwordError) {
          newErrors.password = passwordError;
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirm':
        if (value !== form.password) {
          newErrors.confirm = "비밀번호가 일치하지 않습니다.";
        } else {
          delete newErrors.confirm;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  // 아이디 중복 확인
  const checkLoginIdDuplicate = async () => {
    if (!form.login_id.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const result = await authApi.checkLoginIdDuplicate(form.login_id);
      setCheckStatus(prev => ({ ...prev, loginId: !result.isDuplicate }));
      alert(result.message);
    } catch (error) {
      console.error("아이디 중복 확인 실패:", error);
      alert(`중복 확인에 실패했습니다: ${error.message}`);
    }
  };

  // 이메일 중복 확인
  const checkEmailDuplicate = async () => {
    if (!form.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      const result = await authApi.checkEmailDuplicate(form.email);
      setCheckStatus(prev => ({ ...prev, email: !result.isDuplicate }));
      alert(result.message);
    } catch (error) {
      console.error("이메일 중복 확인 실패:", error);
      alert(`중복 확인에 실패했습니다: ${error.message}`);
    }
  };

  const validate = () => {
    const err = {};

    // 통일된 로그인 ID 검증 사용
    const loginIdError = authUtils.getLoginIdValidationMessage(form.login_id);
    if (loginIdError) err.login_id = loginIdError;

    if (!form.nickname.trim()) err.nickname = "닉네임을 입력하세요.";

    // 통일된 이메일 검증 사용
    const emailError = authUtils.getEmailValidationMessage(form.email);
    if (emailError) err.email = emailError;

    // 통일된 비밀번호 검증 사용
    const passwordError = authUtils.getPasswordValidationMessage(form.password);
    if (passwordError) err.password = passwordError;

    if (form.password !== form.confirm)
      err.confirm = "비밀번호가 일치하지 않습니다.";
    if (!form.agree) err.agree = "이용약관 및 개인정보에 동의해주세요.";

    // 중복 확인 검증
    if (checkStatus.loginId === false) err.login_id = "이미 사용 중인 아이디입니다.";
    if (form.email && checkStatus.email === false) err.email = "이미 사용 중인 이메일입니다.";

    // 기존 실시간 검증 에러와 병합
    const finalErrors = { ...errors, ...err };
    setErrors(finalErrors);
    return Object.keys(finalErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await authApi.register({
        loginId: form.login_id,
        password: form.password,
        nickname: form.nickname,
        email: form.email || null
      });

      alert("회원가입이 완료되었습니다.");
      router.replace(
        `${ROUTES.LOGIN || "/login"}?next=${encodeURIComponent(next)}`
      );
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert(`회원가입에 실패했습니다: ${error.message}`);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-10 mb-4 mt-4">
      <h1 className="text-2xl font-semibold mb-6">회원가입</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">아이디</label>
          <div className="flex gap-2">
            <input
              name="login_id"
              value={form.login_id}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="4-20자, 영문/숫자 조합"
              className={`flex-1 border rounded px-3 py-2 ${
                errors.login_id ? 'border-red-500' :
                touched.login_id && !errors.login_id ? 'border-green-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={checkLoginIdDuplicate}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 whitespace-nowrap"
            >
              중복확인
            </button>
          </div>
          {checkStatus.loginId === true && (
            <p className="text-green-600 text-sm mt-1">사용 가능한 아이디입니다.</p>
          )}
          {checkStatus.loginId === false && (
            <p className="text-red-600 text-sm mt-1">이미 사용 중인 아이디입니다.</p>
          )}
          {errors.login_id && (
            <p className="text-red-600 text-sm mt-1">{errors.login_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">닉네임</label>
          <input
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="예: 문화덕후"
            className={`w-full border rounded px-3 py-2 ${
              errors.nickname ? 'border-red-500' :
              touched.nickname && !errors.nickname ? 'border-green-500' : ''
            }`}
          />
          {errors.nickname && (
            <p className="text-red-600 text-sm mt-1">{errors.nickname}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">이메일 (선택)</label>
          <div className="flex gap-2">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              onBlur={onBlur}
              placeholder="you@example.com"
              className={`flex-1 border rounded px-3 py-2 ${
                errors.email ? 'border-red-500' :
                touched.email && !errors.email && form.email ? 'border-green-500' : ''
              }`}
            />
            <button
              type="button"
              onClick={checkEmailDuplicate}
              disabled={!form.email.trim() || !authUtils.isValidEmail(form.email)}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              중복확인
            </button>
          </div>
          {checkStatus.email === true && (
            <p className="text-green-600 text-sm mt-1">사용 가능한 이메일입니다.</p>
          )}
          {checkStatus.email === false && (
            <p className="text-red-600 text-sm mt-1">이미 사용 중인 이메일입니다.</p>
          )}
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">비밀번호</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="8자 이상, 영문+숫자+특수문자 포함"
            className={`w-full border rounded px-3 py-2 ${
              errors.password ? 'border-red-500' :
              touched.password && !errors.password ? 'border-green-500' : ''
            }`}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">비밀번호 확인</label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="비밀번호를 다시 입력하세요"
            className={`w-full border rounded px-3 py-2 ${
              errors.confirm ? 'border-red-500' :
              touched.confirm && !errors.confirm && form.confirm ? 'border-green-500' : ''
            }`}
          />
          {errors.confirm && (
            <p className="text-red-600 text-sm mt-1">{errors.confirm}</p>
          )}
          {touched.confirm && !errors.confirm && form.confirm && (
            <p className="text-green-600 text-sm mt-1">비밀번호가 일치합니다.</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={onChange}
            className="h-4 w-4"
          />
          이용약관 및 개인정보 처리방침에 동의합니다.
        </label>
        {errors.agree && <p className="text-red-600 text-sm">{errors.agree}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white rounded py-2 disabled:opacity-60"
          disabled={!form.login_id || !form.nickname || !form.password || !form.confirm}>
          가입하기
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link
          className="underline"
          href={`${ROUTES.LOGIN || "/login"}?next=${encodeURIComponent(next)}`}>
          로그인
        </Link>
      </p>
    </main>
  );
}
