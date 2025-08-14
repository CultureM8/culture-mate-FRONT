// lib/aiSuggestionData.js
export const AI_SUGGESTION_DATA = [
  {
    id: 1,
    title: "뮤지컬 위키드(WICKED The Musical)",
    reason: "현재 가장 인기 있는 뮤지컬입니다",
    eventCode: "e00000002",
    eventType: "뮤지컬",
    startDate: "2025-07-12",
    endDate: "2025-10-26",
    imgSrc: "",
    alt: "뮤지컬 위키드",
    link: "/events/e00000002"
  },
  {
    id: 2,
    title: "BTS 월드투어 콘서트",
    reason: "월드클래스 아티스트의 특별한 공연",
    eventCode: "e00000260",
    eventType: "콘서트/페스티벌",
    startDate: "2025-10-15",
    endDate: "2025-10-17",
    imgSrc: "",
    alt: "BTS 콘서트",
    link: "/events/e00000260"
  },
  {
    id: 3,
    title: "문도 픽사(Mundo Pixar): 픽사, 상상의 세계로",
    reason: "가족 모두가 즐길 수 있는 인기 전시",
    eventCode: "e00000151",
    eventType: "전시",
    startDate: "2025-05-05",
    endDate: "2025-09-28",
    imgSrc: "",
    alt: "문도 픽사 전시",
    link: "/events/e00000151"
  },
  {
    id: 4,
    title: "부산국제영화제",
    reason: "아시아 최대 규모의 영화축제",
    eventCode: "e00000501",
    eventType: "지역행사",
    startDate: "2025-10-02",
    endDate: "2025-10-11",
    imgSrc: "",
    alt: "부산국제영화제",
    link: "/events/e00000501"
  },
  {
    id: 5,
    title: "뮤지컬 맘마미아 42주년기념",
    reason: "사랑받는 ABBA 음악의 뮤지컬",
    eventCode: "e00000004",
    eventType: "뮤지컬",
    startDate: "2025-07-10",
    endDate: "2025-09-14",
    imgSrc: "",
    alt: "뮤지컬 맘마미아",
    link: "/events/e00000004"
  },
  {
    id: 6,
    title: "아이유 콘서트 : The Golden Hour",
    reason: "국민 가수 아이유의 감동적인 무대",
    eventCode: "e00000261",
    eventType: "콘서트/페스티벌",
    startDate: "2025-09-07",
    endDate: "2025-09-08",
    imgSrc: "",
    alt: "아이유 콘서트",
    link: "/events/e00000261"
  },
  {
    id: 7,
    title: "국립발레단 백조의 호수",
    reason: "클래식 발레의 대표작품",
    eventCode: "e00000402",
    eventType: "클래식/무용",
    startDate: "2025-06-05",
    endDate: "2025-06-15",
    imgSrc: "",
    alt: "발레 백조의 호수",
    link: "/events/e00000402"
  },
  {
    id: 8,
    title: "연극 죽음의 덫",
    reason: "긴장감 넘치는 추리 연극의 명작",
    eventCode: "e00000302",
    eventType: "연극",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    imgSrc: "",
    alt: "연극 죽음의 덫",
    link: "/events/e00000302"
  }
];

// AI 추천 이벤트 데이터 조회 함수
export function getAISuggestionData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(AI_SUGGESTION_DATA);
    }, 50);
  });
}