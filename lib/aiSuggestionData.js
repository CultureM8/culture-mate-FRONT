import { getAllEvents } from "./eventApi";

// 배열을 랜덤하게 섞는 함수
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// AI 추천 알고리즘 - 백엔드 이벤트 데이터 기반
function generateAISuggestions(events) {
  const scoredEvents = events.map((event) => {
    let recommendationScore = 0;

    // 평점 가중치 (40%) - avgRating 필드가 없으면 기본값 0
    recommendationScore += (event.avgRating ?? 0) * 0.4;

    // 좋아요 수 가중치 (30%) - 정규화
    const normalizedLikes = Math.min((event.interestCount ?? 0) / 5000, 1);
    recommendationScore += normalizedLikes * 0.3;

    // 핫 이벤트 가중치 (20%)
    if (event.isHot) {
      recommendationScore += 0.2;
    }

    // 이벤트 타입 다양성 가중치 (10%) - 임시로 모든 이벤트 동일 부여
    recommendationScore += 0.1;

    return {
      ...event,
      recommendationScore,
    };
  });

  // 점수순으로 정렬하고 상위 20개 후보 선택
  const topCandidates = scoredEvents
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 20);

  // 상위 20개 중 랜덤하게 8개 선택
  const shuffledCandidates = shuffleArray(topCandidates);
  const selectedEvents = shuffledCandidates.slice(0, 8);

  // AI 추천 이유
  const aiReasons = [
    "높은 평점과 관객 만족도를 자랑합니다",
    "현재 가장 인기 있는 이벤트입니다",
    "특별한 경험을 제공하는 추천 이벤트입니다",
    "많은 사람들이 관심을 보이고 있습니다",
    "뛰어난 퀄리티로 인정받는 이벤트입니다",
    "독특하고 매력적인 콘텐츠를 제공합니다",
    "높은 완성도와 재미를 보장합니다",
    "감동적인 경험을 선사하는 이벤트입니다",
  ];

  return selectedEvents.map((event, index) => ({
    id: index + 1,
    title: event.title,
    reason: aiReasons[index],
    eventId: event.id ?? event.eventId,
    eventType: event.eventType,
    startDate: event.startDate,
    endDate: event.endDate,
    imgSrc: event.mainImageUrl ?? event.imgSrc,
    alt: event.title,
    link: `/events/${event.id ?? event.eventId}`,
  }));
}

// AI 추천 이벤트 데이터 조회 함수
export async function getAISuggestionData() {
  try {
    const events = await getAllEvents(); // 백엔드에서 이벤트 전체 목록 불러오기
    return generateAISuggestions(events);
  } catch (error) {
    console.error("AI 추천 데이터 생성 실패:", error);
    return [];
  }
}
