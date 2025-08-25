// lib/aiSuggestionData.js
import { DUMMY_EVENTS } from "./eventData";

// 배열을 랜덤하게 섞는 함수
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// AI 추천 알고리즘 - eventData에서 이벤트를 선별하여 추천
function generateAISuggestions() {
  // 추천 기준: 높은 평점(score), 많은 좋아요(likesCount), 핫 이벤트 우선
  const scoredEvents = DUMMY_EVENTS.map(event => {
    let recommendationScore = 0;
    
    // 평점 가중치 (40%)
    recommendationScore += event.score * 0.4;
    
    // 좋아요 수 가중치 (30%) - 정규화
    const normalizedLikes = Math.min(event.likesCount / 5000, 1); // 5000 이상은 최대값
    recommendationScore += normalizedLikes * 0.3;
    
    // 핫 이벤트 가중치 (20%)
    if (event.isHot) {
      recommendationScore += 0.2;
    }
    
    // 이벤트 타입 다양성 가중치 (10%)
    recommendationScore += 0.1;
    
    return {
      ...event,
      recommendationScore
    };
  });
  
  // 점수순으로 정렬하고 상위 20개를 후보로 선택
  const topCandidates = scoredEvents
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 20);
  
  // 상위 20개 중에서 랜덤하게 8개 선택
  const shuffledCandidates = shuffleArray(topCandidates);
  const selectedEvents = shuffledCandidates.slice(0, 8);
  
  // AI 추천 이유 생성
  const aiReasons = [
    "높은 평점과 관객 만족도를 자랑합니다",
    "현재 가장 인기 있는 이벤트입니다", 
    "특별한 경험을 제공하는 추천 이벤트입니다",
    "많은 사람들이 관심을 보이고 있습니다",
    "뛰어난 퀄리티로 인정받는 이벤트입니다",
    "독특하고 매력적인 콘텐츠를 제공합니다",
    "높은 완성도와 재미를 보장합니다",
    "감동적인 경험을 선사하는 이벤트입니다"
  ];
  
  // AI 추천 데이터 형식으로 변환
  return selectedEvents.map((event, index) => ({
    id: index + 1,
    title: event.title,
    reason: aiReasons[index],
    eventId: event.eventId,
    eventType: event.eventType,
    startDate: event.startDate,
    endDate: event.endDate,
    imgSrc: event.imgSrc,
    alt: event.alt,
    link: `/events/${event.eventId}`
  }));
}

// AI 추천 이벤트 데이터 조회 함수
export function getAISuggestionData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const suggestions = generateAISuggestions();
      resolve(suggestions);
    }, 50);
  });
}