// 임시 테스트용 컴포넌트 - components/debug/ServerTest.jsx
"use client";

import { useState } from "react";

export default function ServerTest() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult("");

    try {
      // 1. 기본 fetch로 백엔드 서버 테스트
      console.log("1. 기본 서버 연결 테스트 시작...");
      const response = await fetch("http://localhost:8080/api/v1/together", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("응답 상태:", response.status);
      console.log("응답 헤더:", response.headers);

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ 서버 연결 성공!\n상태 코드: ${response.status}\n응답 데이터: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ 서버 응답 에러\n상태 코드: ${response.status}\n상태 텍스트: ${response.statusText}`);
      }
    } catch (error) {
      console.error("서버 테스트 에러:", error);
      setResult(`❌ 연결 실패\n에러 타입: ${error.name}\n에러 메시지: ${error.message}\n에러 코드: ${error.code || "없음"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "20px" }}>
      <h3>🔧 백엔드 서버 연결 테스트</h3>
      <button onClick={testConnection} disabled={loading}>
        {loading ? "테스트 중..." : "서버 연결 테스트"}
      </button>
      
      {result && (
        <pre style={{
          background: "#f5f5f5",
          padding: "10px",
          marginTop: "10px",
          whiteSpace: "pre-wrap",
          fontSize: "12px"
        }}>
          {result}
        </pre>
      )}
      
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        <p>• 백엔드 서버가 http://localhost:8080 에서 실행 중인지 확인</p>
        <p>• CORS 설정이 올바른지 확인</p>
        <p>• 네트워크 연결 상태 확인</p>
      </div>
    </div>
  );
}
