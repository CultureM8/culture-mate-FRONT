"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import PostEventMiniCard from "@/components/global/PostEventMiniCard";
import Link from "next/link";
import { togetherData } from "@/lib/togetherData";

export default function TogetherDetailPage() {
  const params = useParams();
  const postId = params.id;
  const [postData, setPostData] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // togetherData에서 해당 ID의 데이터 찾기
    const foundPost = togetherData.find(post => post.id === postId);
    if (foundPost) {
      setPostData(foundPost);
    }
  }, [postId]);

  // 데이터 로딩 중
  if (!postData) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  // 이벤트 카드용 더미 데이터 (실제로는 eventCode로 연결)
  const mockEventData = {
    eventImage: postData.imgSrc,
    eventType: postData.eventType,
    eventName: postData.eventName,
    description: "이벤트 설명에 대한 내용이 들어갑니다. 두 줄 넘어가면 나머지는 ...으로 표기",
    recommendations: 500,
    starScore: 4.5,
    initialLiked: false,
    registeredPosts: 25
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
  };

  const handleReportClick = () => {
    console.log("신고하기");
  };

  const handleChatClick = () => {
    console.log("채팅 신청");
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black">동행 모집</h1>
        </div>

        {/* 글 제목과 정보 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black mb-4">{postData.title}</h2>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>작성자</span>
              <span>{postData.date} 00:00:00</span>
              <span>조회 123</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikeToggle}
                className="flex items-center gap-1"
              >
                <Image 
                  src={isLiked ? ICONS.HEART_FILLED : ICONS.HEART} 
                  alt="좋아요" 
                  width={16} 
                  height={16} 
                />
                <span>좋아요</span>
              </button>
            </div>
          </div>
        </div>

        {/* PostEventMiniCard */}
        <div className="mb-8">
          <PostEventMiniCard {...mockEventData} />
        </div>

        {/* 동행 정보 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-8">
              <span className="text-sm text-gray-700 w-20">동행 날짜</span>
              <span className="text-sm">{postData.date}</span>
            </div>
            
            <div className="flex items-center gap-8">
              <span className="text-sm text-gray-700 w-20">동행 인원</span>
              <span className="text-sm">{postData.group} 명</span>
            </div>
            
            <div className="flex items-center gap-8">
              <span className="text-sm text-gray-700 w-20">이벤트 주소</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">서울특별시 노원구 중계로 181 (노원문화예술회관)</span>
                <Image src={ICONS.LOCATION} alt="위치" width={16} height={16} />
                <button className="text-xs text-blue-500">지도 보기</button>
                <button className="text-xs text-gray-500">주소 복사</button>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-base font-medium mb-4">본문 내용 공간:</h3>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              가격 1200 ~ 새로 (개치하이벤트소개는 어메댓덕이 "추천급유신고마태 위까지")
              
              ***본문공간 외의 참여 얌육
            </div>
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={handleReportClick}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Image src={ICONS.REPORT} alt="신고" width={16} height={16} />
            <span>신고</span>
          </button>
          <button
            onClick={handleChatClick}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            채팅 신청
          </button>
        </div>

        {/* 하단 작성자 정보 */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">작성자 작성자 ID</span>
                <button className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                  + 연락 추가
                </button>
              </div>
              <p className="text-sm text-gray-600">한줄 자기소개 작성자 주저리</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}