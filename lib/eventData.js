// lib/eventData.js
export const DUMMY_EVENTS = [
  // 전시 카테고리
  {
    eventCode:  "e00000151",
    title:		  "문도 픽사(Mundo Pixar): 픽사, 상상의 세계로",
    location:	  "성남문화예술센터",
    startDate:	"2025-05-05",
    endDate:	  "2025-09-28",
    viewTime:	  "60분",
    ageLimit:	  "전체관람가",
    price:		  "성인 45,000원",
    eventType:	"전시",
    imgSrc:		  "",
    alt:		    "문도 픽사 전시",
    isHot:	    true
  },
  {
    eventCode:  "e00000152",
    title:		  "국립한글박물관 한글디자인 특별전",
    location:	  "국립한글박물관 한글디자인센터",
    startDate:	"2025-09-20",
    endDate:	  "2025-11-21",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가", 
    price:		  "일반 22,000원",
    eventType:	"전시",
    imgSrc:		  "",
    alt:		    "한글디자인 특별전",
    isHot:		  true
  },
  {
    eventCode:  "e00000153",
    title:		  "몰입의 방 플래닛 : 반고흐",
    location:	  "국립중앙박물관 한국미술관 제7전시실",
    startDate:	"2025-09-12",
    endDate:	  "2025-10-12",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가",
    price:		  "12,000원",
    eventType:	"전시",
    imgSrc:		  "",
    alt:		    "반고흐 전시",
    isHot:		  false
  },
  {
    eventCode:  "e00000154",
    title:		  "대구아트페어 아트앤아이디어",
    location:	  "엑스코 특별전시실",
    startDate:	"2025-03-27",
    endDate:	  "2025-09-28",
    viewTime:	  "자유관람",
    ageLimit:	  "8세이상",
    price:		  "성인 30,000원",
    eventType:	"전시",
    imgSrc:		  "",
    alt:		    "대구아트페어",
    isHot:		  false
  },
  {
    eventCode:  "e00000155",
    title:		  "모네와의 몰입형홀로그램",
    location:	  "국립미술관 미술관",
    startDate:	"2025-05-16",
    endDate:	  "2025-08-31",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가",
    price:		  "성인 20,000원",
    eventType:	"전시",
    imgSrc:		  "",
    alt:		    "모네 홀로그램 전시",
    isHot:		  false
  },
  {
    eventCode:  "e00000165",
    title:		  "AI 아트 : 인공지능과 예술",
    location:	  "성남아트센터",
    startDate:	"2025-09-01",
    endDate:	  "2025-12-15",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가",
    price:		  "성인 12,000원",
    eventType:	"전시",
    imgSrc:		  "",
    alt:		    "AI 아트 전시",
    isHot:		  true
  },

  // 뮤지컬 카테고리
  {
    eventCode:  "e00000002",
    title:		  "뮤지컬 위키드(WICKED The Musical)",
    location:	  "블루스퀘어 신한카드홀",
    startDate:	"2025-07-12",
    endDate:	  "2025-10-26",
    viewTime:	  "170분(인터미션 20분 포함)",
    ageLimit:	  "8세이상",
    price:		  "A석 80,000원",
    eventType:	"뮤지컬",
    imgSrc:		  "",
    alt:		    "뮤지컬 위키드",
    isHot:		  false
  },
  {
    eventCode:  "e00000004",
    title:		  "뮤지컬 맘마미아 42주년기념",
    location:	  "롯데콘서트홀",
    startDate:	"2025-07-10",
    endDate:	  "2025-09-14",
    viewTime:	  "160분(인터미션 20분 포함)",
    ageLimit:	  "8세이상",
    price:		  "A석 80,000원",
    eventType:	"뮤지컬",
    imgSrc:		  "",
    alt:		    "뮤지컬 맘마미아",
    isHot:		  true
  },
  {
    eventCode:  "e00000005",
    title:		  "뮤지컬 레미제라블",
    location:	  "충무아트센터 대극장",
    startDate:	"2025-06-17",
    endDate:	  "2025-09-21",
    viewTime:	  "160분(인터미션 20분 포함)",
    ageLimit:	  "14세 이상",
    price:		  "A석 80,000원",
    eventType:	"뮤지컬",
    imgSrc:		  "",
    alt:		    "뮤지컬 레미제라블",
    isHot:		  false
  },
  {
    eventCode:  "e00000008",
    title:		  "뮤지컬 캣츠",
    location:	  "광림아트홀(자유석)",
    startDate:	"2025-09-05",
    endDate:	  "2025-10-26",
    viewTime:	  "110분",
    ageLimit:	  "8세이상",
    price:		  "R석 66,000원",
    eventType:	"뮤지컬",
    imgSrc:		  "",
    alt:		    "뮤지컬 캣츠",
    isHot:		  false
  },
  {
    eventCode:  "e00000009",
    title:		  "뮤지컬 알라딘",
    location:	  "샬롯데씨어터 2관",
    startDate:	"2025-08-01",
    endDate:	  "2025-11-30",
    viewTime:	  "150분(인터미션 20분 포함)",
    ageLimit:	  "전체관람가",
    price:		  "VIP석 90,000원",
    eventType:	"뮤지컬",
    imgSrc:		  "",
    alt:		    "뮤지컬 알라딘",
    isHot:		  true
  },
  {
    eventCode:  "e00000011",
    title:		  "뮤지컬 팬텀",
    location:	  "세종문화회관 대극장",
    startDate:	"2025-08-15",
    endDate:	  "2025-11-15",
    viewTime:	  "170분(인터미션 20분 포함)",
    ageLimit:	  "8세이상",
    price:		  "VIP석 100,000원",
    eventType:	"뮤지컬",
    imgSrc:		  "",
    alt:		    "뮤지컬 팬텀",
    isHot:		  true
  },
  {
    eventCode:  "e00000013",
    title:		  "뮤지컬 지킬앤하이드",
    location:	  "국립중앙극장 해오름극장",
    startDate:	"2025-09-01",
    endDate:	  "2025-11-30",
    viewTime:	  "160분(인터미션 20분 포함)",
    ageLimit:	  "14세 이상",
    price:		  "VIP석 88,000원",
    eventType:	"뮤지컬",
    imgSrc:		  "",
    alt:		    "뮤지컬 지킬앤하이드",
    isHot:		  false
  },

  // 콘서트/페스티벌 카테고리
  {
    eventCode:  "e00000251",
    title:		  "마마무+ 콘서트투어",
    location:	  "경희대학교 평화의전당 (서울)",
    startDate:	"2025-07-26",
    endDate:	  "2025-07-27",
    viewTime:	  "120분",
    ageLimit:	  "초등학생 이상",
    price:		  "121,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "마마무+ 콘서트",
    isHot:		  false
  },
  {
    eventCode:  "e00000252",
    title:		  "볼빨간사춘기 콘서트 - 인천",
    location:	  "인천 아시아드 주 경기장 (인천)",
    startDate:	"2025-09-13",
    endDate:	  "2025-09-14",
    viewTime:	  "120분",
    ageLimit:	  "초등학생 이상",
    price:		  "132,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "볼빨간사춘기 콘서트",
    isHot:		  true
  },
  {
    eventCode:  "e00000254",
    title:		  "박효신 더 콘서트",
    location:	  "잠실실내체육관 SOLTI스퀘어홀 (서울)",
    startDate:	"2025-09-19",
    endDate:	  "2025-09-21",
    viewTime:	  "120분",
    ageLimit:	  "초등학생 이상",
    price:		  "110,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "박효신 콘서트",
    isHot:		  false
  },
  {
    eventCode:  "e00000255",
    title:		  "악뮤 AKMU",
    location:	  "올림픽체조경기장 (서울)",
    startDate:	"2025-08-08",
    endDate:	  "2025-08-24", 
    viewTime:	  "120분",
    ageLimit:	  "초등학생 이상",
    price:		  "132,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "악뮤 콘서트",
    isHot:		  true
  },
  {
    eventCode:  "e00000256",
    title:		  "김범수 콘서트",
    location:	  "부산아시아드 주경기장 (부산)",
    startDate:	"2025-08-15",
    endDate:	  "2025-08-16",
    viewTime:	  "120분",
    ageLimit:	  "전체관람가",
    price:		  "175,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "김범수 콘서트",
    isHot:		  false
  },
  {
    eventCode:  "e00000257",
    title:		  "<5.0> 10cm 콘서트",
    location:	  "올림픽공원 자유로운무대 (서울)",
    startDate:	"2025-08-09",
    endDate:	  "2025-08-10",
    viewTime:	  "120분",
    ageLimit:	  "초등학생 이상",
    price:		  "121,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "10cm 콘서트",
    isHot:		  true
  },
  {
    eventCode:  "e00000258",
    title:		  "<ATTRACTION> TOUCHED",
    location:	  "킨텍스 제2전시장 10홀 (경기)",
    startDate:	"2025-08-23",
    endDate:	  "2025-08-24",
    viewTime:	  "120분",
    ageLimit:	  "초등학생 이상",
    price:		  "132,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "ATTRACTION 콘서트",
    isHot:		  false
  },
  {
    eventCode:  "e00000259",
    title:		  "정승환 솔로콘서트",
    location:	  "롯데콘서트홀 (서울)",
    startDate:	"2025-08-01",
    endDate:	  "2025-08-02",
    viewTime:	  "150분",
    ageLimit:	  "전체관람가",
    price:		  "44,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "정승환 콘서트",
    isHot:		  true
  },
  {
    eventCode:  "e00000260",
    title:		  "BTS 월드투어 콘서트",
    location:	  "잠실종합운동장 (서울)",
    startDate:	"2025-10-15",
    endDate:	  "2025-10-17",
    viewTime:	  "180분",
    ageLimit:	  "전체관람가",
    price:		  "198,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "BTS 콘서트",
    isHot:		  true
  },
  {
    eventCode:  "e00000261",
    title:		  "아이유 콘서트 : The Golden Hour",
    location:	  "고척스카이돔 (서울)",
    startDate:	"2025-09-07",
    endDate:	  "2025-09-08",
    viewTime:	  "150분",
    ageLimit:	  "전체관람가",
    price:		  "154,000원",
    eventType:	"콘서트/페스티벌",
    imgSrc:		  "",
    alt:		    "아이유 콘서트",
    isHot:		  true
  },

  // 연극 카테고리
  {
    eventCode:  "e00000301",
    title:		  "연극 햄릿",
    location:	  "국립극장 달오름극장",
    startDate:	"2025-08-01",
    endDate:	  "2025-10-15",
    viewTime:	  "180분(인터미션 20분 포함)",
    ageLimit:	  "14세 이상",
    price:		  "R석 55,000원",
    eventType:	"연극",
    imgSrc:		  "",
    alt:		    "연극 햄릿",
    isHot:		  false
  },
  {
    eventCode:  "e00000302",
    title:		  "연극 죽음의 덫",
    location:	  "대학로 자유극장",
    startDate:	"2025-06-01",
    endDate:	  "2025-08-31",
    viewTime:	  "120분(인터미션 15분 포함)",
    ageLimit:	  "15세 이상",
    price:		  "일반석 44,000원",
    eventType:	"연극",
    imgSrc:		  "",
    alt:		    "연극 죽음의 덫",
    isHot:		  true
  },
  {
    eventCode:  "e00000303",
    title:		  "연극 로미오와 줄리엣",
    location:	  "예술의전당 자유소극장",
    startDate:	"2025-07-15",
    endDate:	  "2025-09-30",
    viewTime:	  "150분(인터미션 20분 포함)",
    ageLimit:	  "12세 이상",
    price:		  "S석 60,000원",
    eventType:	"연극",
    imgSrc:		  "",
    alt:		    "연극 로미오와 줄리엣",
    isHot:		  false
  },
  {
    eventCode:  "e00000304",
    title:		  "연극 오셀로",
    location:	  "충무아트센터 중극장",
    startDate:	"2025-05-01",
    endDate:	  "2025-07-31",
    viewTime:	  "170분(인터미션 25분 포함)",
    ageLimit:	  "15세 이상",
    price:		  "R석 50,000원",
    eventType:	"연극",
    imgSrc:		  "",
    alt:		    "연극 오셀로",
    isHot:		  false
  },

  // 무용/클래식 카테고리
  {
    eventCode:  "e00000401",
    title:		  "국립오페라단 라보엠",
    location:	  "예술의전당 오페라극장",
    startDate:	"2025-09-15",
    endDate:	  "2025-09-30",
    viewTime:	  "180분(인터미션 30분 포함)",
    ageLimit:	  "만7세이상",
    price:		  "S석 120,000원",
    eventType:	"클래식/무용",
    imgSrc:		  "",
    alt:		    "오페라 라보엠",
    isHot:		  false
  },
  {
    eventCode:  "e00000402",
    title:		  "국립발레단 백조의 호수",
    location:	  "예술의전당 오페라극장",
    startDate:	"2025-06-05",
    endDate:	  "2025-06-15",
    viewTime:	  "150분(인터미션 20분 포함)",
    ageLimit:	  "만5세이상",
    price:		  "VIP석 100,000원",
    eventType:	"클래식/무용",
    imgSrc:		  "",
    alt:		    "발레 백조의 호수",
    isHot:		  true
  },
  {
    eventCode:  "e00000403",
    title:		  "서울시향 정기연주회",
    location:	  "롯데콘서트홀",
    startDate:	"2025-07-20",
    endDate:	  "2025-07-20",
    viewTime:	  "120분(인터미션 20분 포함)",
    ageLimit:	  "만7세이상",
    price:		  "R석 60,000원",
    eventType:	"클래식/무용",
    imgSrc:		  "",
    alt:		    "서울시향 정기연주회",
    isHot:		  false
  },
  {
    eventCode:  "e00000404",
    title:		  "국립무용단 전통춤 공연",
    location:	  "국립극장 해오름극장",
    startDate:	"2025-08-10",
    endDate:	  "2025-08-25",
    viewTime:	  "100분(인터미션 15분 포함)",
    ageLimit:	  "전체관람가",
    price:		  "S석 50,000원",
    eventType:	"클래식/무용",
    imgSrc:		  "",
    alt:		    "국립무용단 전통춤",
    isHot:		  true
  },

  // 지역행사 카테고리
  {
    eventCode:  "e00000501",
    title:		  "부산국제영화제",
    location:	  "부산 영화의전당",
    startDate:	"2025-10-02",
    endDate:	  "2025-10-11",
    viewTime:	  "상영작별 상이",
    ageLimit:	  "상영작별 상이",
    price:		  "일반 15,000원",
    eventType:	"지역행사",
    imgSrc:		  "",
    alt:		    "부산국제영화제",
    isHot:		  true
  },
  {
    eventCode:  "e00000502",
    title:		  "제주 한라문화제",
    location:	  "제주종합경기장",
    startDate:	"2025-10-15",
    endDate:	  "2025-10-18",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가",
    price:		  "무료",
    eventType:	"지역행사",
    imgSrc:		  "",
    alt:		    "제주 한라문화제",
    isHot:		  false
  },
  {
    eventCode:  "e00000503",
    title:		  "전주한옥마을 전통문화축제",
    location:	  "전주한옥마을 일대",
    startDate:	"2025-05-03",
    endDate:	  "2025-05-05",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가",
    price:		  "무료",
    eventType:	"지역행사",
    imgSrc:		  "",
    alt:		    "전주한옥마을 축제",
    isHot:		  true
  },
  {
    eventCode:  "e00000504",
    title:		  "경주 벚꽃축제",
    location:	  "경주시 일대",
    startDate:	"2025-04-01",
    endDate:	  "2025-04-15",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가",
    price:		  "무료",
    eventType:	"지역행사",
    imgSrc:		  "",
    alt:		    "경주 벚꽃축제",
    isHot:		  false
  },
  {
    eventCode:  "e00000505",
    title:		  "강릉 커피축제",
    location:	  "강릉 안목해변",
    startDate:	"2025-09-20",
    endDate:	  "2025-09-22",
    viewTime:	  "자유관람",
    ageLimit:	  "전체관람가",
    price:		  "무료",
    eventType:	"지역행사",
    imgSrc:		  "",
    alt:		    "강릉 커피축제",
    isHot:		  true
  },

  // 영화 카테고리
  {
    eventCode:  "e00000601",
    title:		  "아바타: 물의 길",
    location:	  "CGV 강남",
    startDate:	"2025-06-15",
    endDate:	  "2025-08-31",
    viewTime:	  "192분",
    ageLimit:	  "12세 관람가",
    price:		  "일반 14,000원",
    eventType:	"영화",
    imgSrc:		  "",
    alt:		    "아바타: 물의 길",
    isHot:		  true
  },
  {
    eventCode:  "e00000602",
    title:		  "탑건: 매버릭",
    location:	  "롯데시네마 월드타워",
    startDate:	"2025-07-01",
    endDate:	  "2025-09-30",
    viewTime:	  "130분",
    ageLimit:	  "12세 관람가",
    price:		  "일반 14,000원",
    eventType:	"영화",
    imgSrc:		  "",
    alt:		    "탑건: 매버릭",
    isHot:		  false
  },
  {
    eventCode:  "e00000603",
    title:		  "미니언즈: 라이즈 오브 그루",
    location:	  "메가박스 코엑스",
    startDate:	"2025-05-20",
    endDate:	  "2025-08-20",
    viewTime:	  "87분",
    ageLimit:	  "전체 관람가",
    price:		  "일반 14,000원",
    eventType:	"영화",
    imgSrc:		  "",
    alt:		    "미니언즈: 라이즈 오브 그루",
    isHot:		  true
  },
  {
    eventCode:  "e00000604",
    title:		  "쥬라기 월드: 도미니언",
    location:	  "CGV 용산아이파크몰",
    startDate:	"2025-06-01",
    endDate:	  "2025-08-31",
    viewTime:	  "147분",
    ageLimit:	  "12세 관람가",
    price:		  "일반 14,000원",
    eventType:	"영화",
    imgSrc:		  "",
    alt:		    "쥬라기 월드: 도미니언",
    isHot:		  false
  },
  {
    eventCode:  "e00000605",
    title:		  "토이 스토리 5",
    location:	  "롯데시네마 건대입구",
    startDate:	"2025-07-15",
    endDate:	  "2025-10-15",
    viewTime:	  "105분",
    ageLimit:	  "전체 관람가",
    price:		  "일반 14,000원",
    eventType:	"영화",
    imgSrc:		  "",
    alt:		    "토이 스토리 5",
    isHot:		  true
  }
];

// eventCode로 이벤트 데이터 조회 함수
export function getEventByCode(eventCode) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const event = DUMMY_EVENTS.find(event => event.eventCode === eventCode);
      
      if (event) {
        resolve(event);
      } else {
        reject(new Error(`이벤트를 찾을 수 없습니다: ${eventCode}`));
      }
    }, 100);
  });
}

// 이벤트 목록 조회 (events/page.jsx에서 사용)
export function getAllEvents() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const eventListData = DUMMY_EVENTS.map(event => ({
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        imgSrc: event.imgSrc,
        alt: event.alt,
        href: `/events/${event.eventCode}`,
        isHot: event.isHot,
        eventType: event.eventType
      }));
      resolve(eventListData);
    }, 100);
  });
}

// eventType별 이벤트 조회 함수 (필터링용)
export function getEventsByType(eventType) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const events = DUMMY_EVENTS.filter(event => event.eventType === eventType);
      const eventListData = events.map(event => ({
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        imgSrc: event.imgSrc,
        alt: event.alt,
        href: `/events/${event.eventCode}`,
        isHot: event.isHot,
        eventType: event.eventType
      }));
      resolve(eventListData);
    }, 100);
  });
}