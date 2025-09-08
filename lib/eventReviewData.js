import { DUMMY_EVENTS } from "./eventData";
import { getMyEventReviewsFromAPI as apiGetMyEventReviews } from "./eventApi";

// ---- helpers: 이벤트 메타/날짜 보강 ----
const FALLBACK_IMG = "/img/default_img.svg";
function resolveEventMetaById(eventId) {
  const ev = DUMMY_EVENTS.find((e) => e.eventId === eventId);
  return {
    name: ev?.title ?? "이벤트",
    type: ev?.eventType ?? "이벤트",
    image: ev?.imgSrc ?? FALLBACK_IMG,
  };
}

function toISOFromYYMMDD(v) {
  // "25.09.11" -> "2025-09-11T00:00:00.000Z"
  if (!v || typeof v !== "string") return undefined;
  const m = /^(\d{2})\.(\d{2})\.(\d{2})$/.exec(v.trim());
  if (!m) return undefined;
  const year = 2000 + Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toISOString();
}

export const eventReviewData = [
  {
    reviewId: "R_00000001",
    eventId: "E_00000001",
    userNickname: "김컬쳐",
    score: 5.0,
    createdDate: "25.09.11",
    content:
      "배우들의 연기와 노래가 정말 훌륭했습니다. 특히 주연 배우의 감정 연기가 인상 깊었어요. 다시 보고 싶은 뮤지컬입니다.",
  },
  {
    reviewId: "R_00000002",
    eventId: "E_00000103",
    userNickname: "이메이트",
    score: 4.5,
    createdDate: "25.08.21",
    content:
      "지하철이라는 공간에서 벌어지는 다양한 에피소드들이 공감되고 재미있었어요. 배우들의 케미도 좋았습니다.",
  },
  {
    reviewId: "R_00000003",
    eventId: "E_00000053",
    userNickname: "박시네마",
    score: 4.0,
    createdDate: "25.08.16",
    content:
      "긴장감 넘치는 전개와 현실적인 좀비 묘사가 좋았습니다. 몰입해서 봤어요.",
  },
  {
    reviewId: "R_00000004",
    eventId: "E_00000154",
    userNickname: "최아트",
    score: 4.8,
    createdDate: "25.09.02",
    content:
      "고대 이집트의 유물들을 직접 볼 수 있어서 좋았습니다. 설명도 자세해서 이해하기 쉬웠어요.",
  },
  {
    reviewId: "R_00000005",
    eventId: "E_00000256",
    userNickname: "정콘서트",
    score: 5.0,
    createdDate: "25.08.25",
    content:
      "말 그대로 흠뻑 젖었습니다! 싸이의 에너지와 무대 매너는 정말 최고예요. 스트레스가 확 풀렸습니다.",
  },
  {
    reviewId: "R_00000006",
    eventId: "E_00000202",
    userNickname: "강클래식",
    score: 4.7,
    createdDate: "25.09.05",
    content:
      "김정원 피아니스트의 연주는 언제 들어도 감동적입니다. 마음이 편안해지는 시간이었어요.",
  },
  {
    reviewId: "R_00000007",
    eventId: "E_00000007",
    userNickname: "윤뮤지컬",
    score: 4.6,
    createdDate: "25.09.12",
    content:
      "조선 시대를 배경으로 한 힙합 뮤지컬이라니! 신선한 시도였고, 배우들의 랩과 퍼포먼스가 인상 깊었습니다.",
  },
  {
    reviewId: "R_00000008",
    eventId: "E_00000104",
    userNickname: "서연극",
    score: 4.9,
    createdDate: "25.08.22",
    content:
      "관객들이 직접 범인을 추리하는 방식이라 몰입감이 최고였습니다. 배우들의 애드립도 너무 웃겼어요.",
  },
  {
    reviewId: "R_00000009",
    eventId: "E_00000057",
    userNickname: "한애니",
    score: 5.0,
    createdDate: "25.08.18",
    content:
      "오랜만에 다시 봤는데도 여전히 감동적입니다. 환경에 대한 메시지도 좋고, 그림체도 아름다워요.",
  },
  {
    reviewId: "R_00000010",
    eventId: "E_00000157",
    userNickname: "구갤러리",
    score: 4.8,
    createdDate: "25.09.03",
    content:
      "샤갈의 작품들을 한자리에서 볼 수 있어서 좋았습니다. 색감이 너무 아름답고 몽환적인 분위기가 인상 깊었어요.",
  },
  {
    reviewId: "R_00000011",
    eventId: "E_00000255",
    userNickname: "신음악",
    score: 5.0,
    createdDate: "25.08.28",
    content:
      "악뮤의 라이브는 정말 최고입니다. 음원보다 더 좋았어요. 무대 연출도 멋있고, 팬들과 소통하는 모습도 보기 좋았습니다.",
  },
  {
    reviewId: "R_00000012",
    eventId: "E_00000205",
    userNickname: "오지휘",
    score: 4.9,
    createdDate: "25.09.08",
    content:
      "베를린 필하모닉의 연주는 역시 명불허전입니다. 지휘자의 열정적인 모습도 인상 깊었어요.",
  },
  {
    reviewId: "R_00000013",
    eventId: "E_00000002",
    userNickname: "조뮤덕",
    score: 5.0,
    createdDate: "25.09.15",
    content:
      "넘버들이 너무 좋고, 무대 연출도 화려해서 눈을 뗄 수 없었습니다. 엘파바와 글린다의 우정이 감동적이었어요.",
  },
  {
    reviewId: "R_00000014",
    eventId: "E_00000104",
    userNickname: "김탐정",
    score: 4.9,
    createdDate: "25.08.23",
    content:
      "전에 봤을 때랑 범인이 달라서 또 다른 재미가 있었습니다. 배우들의 연기도 여전히 최고예요.",
  },
  {
    reviewId: "R_00000015",
    eventId: "E_00000053",
    userNickname: "이좀비",
    score: 4.2,
    createdDate: "25.08.16",
    content:
      "좀비 영화의 교과서 같은 영화입니다. 긴장감과 메시지 모두 훌륭해요.",
  },
  {
    reviewId: "R_00000016",
    eventId: "E_00000158",
    userNickname: "박색감",
    score: 4.5,
    createdDate: "25.09.02",
    content:
      "미셸 앙리의 작품들은 정말 색감이 아름다웠습니다. 그림 하나하나에 생동감이 넘쳤어요.",
  },
  {
    reviewId: "R_00000017",
    eventId: "E_00000252",
    userNickname: "최캐럿",
    score: 5.0,
    createdDate: "25.08.26",
    content:
      "세븐틴의 퍼포먼스는 역시 최고입니다. 응원봉 흔들면서 정말 즐거웠어요. 다음 콘서트도 꼭 갈 거예요!",
  },
  {
    reviewId: "R_00000018",
    eventId: "E_00000206",
    userNickname: "정음악",
    score: 4.8,
    createdDate: "25.09.06",
    content:
      "오케스트라의 웅장한 연주에 압도당했습니다. 정말 귀가 호강하는 시간이었어요.",
  },
  {
    reviewId: "R_00000019",
    eventId: "E_00000003",
    userNickname: "강팬텀",
    score: 4.7,
    createdDate: "25.09.13",
    content:
      "팬텀의 비극적인 사랑 이야기가 너무 슬펐습니다. 배우들의 가창력도 최고였어요.",
  },
  {
    reviewId: "R_00000020",
    eventId: "E_00000105",
    userNickname: "윤사의",
    score: 4.3,
    createdDate: "25.08.24",
    content:
      "김우진과 윤심덕의 이야기가 마음을 울렸습니다. 배우들의 연기가 정말 좋았어요.",
  },
  {
    reviewId: "R_00000021",
    eventId: "E_00000004",
    userNickname: "서브로드",
    score: 4.8,
    createdDate: "25.09.14",
    content:
      "화려한 탭댄스 군무가 정말 인상 깊었습니다. 눈과 귀가 즐거운 뮤지컬이었어요.",
  },
  {
    reviewId: "R_00000022",
    eventId: "E_00000106",
    userNickname: "한고스트",
    score: 4.5,
    createdDate: "25.08.17",
    content:
      "정말 무서웠습니다. 배우들의 연기가 실감 나서 더 몰입할 수 있었어요. 공포 연극 좋아하시는 분들께 추천합니다.",
  },
  {
    reviewId: "R_00000023",
    eventId: "E_00000051",
    userNickname: "구한국",
    score: 4.0,
    createdDate: "25.06.02",
    content: "한국적인 색채가 강한 영화였습니다. 배우들의 연기도 좋았어요.",
  },
  {
    reviewId: "R_00000024",
    eventId: "E_00000151",
    userNickname: "신파리",
    score: 4.7,
    createdDate: "25.10.01",
    content:
      "오르세 미술관의 명작들을 한국에서 볼 수 있어서 좋았습니다. 마치 파리에 온 것 같았어요.",
  },
  {
    reviewId: "R_00000025",
    eventId: "E_00000251",
    userNickname: "오멜로",
    score: 4.9,
    createdDate: "25.07.27",
    content:
      "멜로망스의 감미로운 목소리에 푹 빠졌습니다. 라이브가 정말 최고예요.",
  },
  {
    reviewId: "R_00000026",
    eventId: "E_00000201",
    userNickname: "조발레",
    score: 5.0,
    createdDate: "25.12.06",
    content:
      "크리스마스 분위기를 제대로 느낄 수 있는 공연이었습니다. 발레리나들의 움직임이 너무 아름다웠어요.",
  },
  {
    reviewId: "R_00000027",
    eventId: "E_00000005",
    userNickname: "김로큰롤",
    score: 4.5,
    createdDate: "25.09.20",
    content:
      "신나는 로큰롤 음악과 배우들의 열정적인 무대가 좋았습니다. 흥이 절로 나는 뮤지컬이에요.",
  },
  {
    reviewId: "R_00000028",
    eventId: "E_00000107",
    userNickname: "이생각",
    score: 4.2,
    createdDate: "25.09.01",
    content:
      "인간의 본성에 대해 다시 한번 생각하게 하는 연극이었습니다. 여운이 많이 남아요.",
  },
  {
    reviewId: "R_00000029",
    eventId: "E_00000052",
    userNickname: "박스피드",
    score: 4.3,
    createdDate: "25.06.25",
    content:
      "F1의 생생한 현장을 느낄 수 있어서 좋았습니다. 스피드와 열정이 그대로 전해졌어요.",
  },
  {
    reviewId: "R_00000030",
    eventId: "E_00000152",
    userNickname: "최감성",
    score: 4.6,
    createdDate: "25.09.15",
    content:
      "이자벨 드 가네의 작품들은 따뜻하고 편안한 느낌을 주었습니다. 그림 하나하나에 이야기가 담겨있는 것 같았어요.",
  },
  {
    reviewId: "R_00000031",
    eventId: "E_00000253",
    userNickname: "정밴드",
    score: 4.4,
    createdDate: "25.08.31",
    content:
      "실리카겔의 독특한 음악 세계를 경험할 수 있어서 좋았습니다. 라이브도 정말 멋있었어요.",
  },
  {
    reviewId: "R_00000032",
    eventId: "E_00000203",
    userNickname: "강봄",
    score: 4.7,
    createdDate: "25.04.12",
    content:
      "봄처럼 따뜻하고 희망찬 연주였습니다. 마음이 정화되는 느낌이었어요.",
  },
  {
    reviewId: "R_00000033",
    eventId: "E_00000006",
    userNickname: "윤맘마",
    score: 4.8,
    createdDate: "25.10.01",
    content:
      "아바의 노래들을 뮤지컬로 들으니 더 좋았습니다. 배우들의 연기도 좋고, 정말 흥겨운 시간이었어요.",
  },
  {
    reviewId: "R_00000034",
    eventId: "E_00000108",
    userNickname: "서블랙",
    score: 4.0,
    createdDate: "25.08.25",
    content:
      "블랙코미디의 진수를 보여주는 연극이었습니다. 웃음 속에 씁쓸함이 느껴졌어요.",
  },
  {
    reviewId: "R_00000035",
    eventId: "E_00000054",
    userNickname: "한심리",
    score: 4.1,
    createdDate: "25.06.25",
    content:
      "조용하지만 긴장감 넘치는 심리 스릴러였습니다. 배우들의 연기가 좋았어요.",
  },
  {
    reviewId: "R_00000036",
    eventId: "E_00000153",
    userNickname: "구픽사",
    score: 4.9,
    createdDate: "25.09.10",
    content:
      "픽사 애니메이션을 좋아하는 사람이라면 꼭 가봐야 할 전시입니다. 동심으로 돌아간 것 같아서 너무 좋았어요.",
  },
  {
    reviewId: "R_00000037",
    eventId: "E_00000254",
    userNickname: "신팬",
    score: 4.6,
    createdDate: "25.09.20",
    content:
      "권지안 배우의 팬 사랑이 느껴지는 따뜻한 팬 미팅이었습니다. 즐거운 시간이었어요.",
  },
  {
    reviewId: "R_00000038",
    eventId: "E_00000204",
    userNickname: "오심포니",
    score: 4.8,
    createdDate: "25.07.29",
    content:
      "국립심포니의 창단 공연이라 더 의미 있었습니다. 앞으로가 기대되는 연주였어요.",
  },
  {
    reviewId: "R_00000039",
    eventId: "E_00000008",
    userNickname: "조쉐도우",
    score: 4.0,
    createdDate: "25.10.05",
    content: "미스터리한 분위기가 인상 깊었습니다. 배우들의 연기도 좋았어요.",
  },
  {
    reviewId: "R_00000040",
    eventId: "E_00000109",
    userNickname: "김킬미",
    score: 4.2,
    createdDate: "25.08.17",
    content:
      "삶과 죽음에 대해 생각하게 하는 감동적인 연극이었습니다. 눈물이 났어요.",
  },
  {
    reviewId: "R_00000041",
    eventId: "E_00000055",
    userNickname: "이히컵",
    score: 4.9,
    createdDate: "25.06.06",
    content: "투슬리스 너무 귀여워요! 스토리도 좋고, 영상미도 훌륭합니다.",
  },
  {
    reviewId: "R_00000042",
    eventId: "E_00000155",
    userNickname: "박미술",
    score: 4.7,
    createdDate: "25.08.31",
    content:
      "유명 화가들의 작품들을 한자리에서 볼 수 있어서 좋았습니다. 서양 미술의 흐름을 이해하는 데 도움이 되었어요.",
  },
  {
    reviewId: "R_00000043",
    eventId: "E_00000340",
    userNickname: "물놀이꾼",
    score: 4.5,
    createdDate: "25.12.09",
    content:
      "더운 여름 시원하게 물놀이하며 즐길 수 있는 축제였습니다. 다양한 프로그램도 많아서 좋았어요.",
  },
  {
    reviewId: "R_00000044",
    eventId: "E_00000301",
    userNickname: "탈춤매니아",
    score: 4.8,
    createdDate: "25.09.28",
    content:
      "다양한 탈춤 공연을 볼 수 있어서 좋았습니다. 한국 전통문화의 아름다움을 느낄 수 있었어요.",
  },
  {
    reviewId: "R_00000045",
    eventId: "E_00000312",
    userNickname: "연어킬러",
    score: 4.9,
    createdDate: "25.10.25",
    content:
      "싱싱한 연어를 맛볼 수 있어서 좋았습니다. 다양한 연어 요리도 즐길 수 있었어요.",
  },
];

export function getEventReviewsByEventId(eventId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reviews = eventReviewData
        .filter((review) => review.eventId === eventId)
        .map((r) => ({
          ...r,
          // 호환: rating/score 동시 제공
          rating: r.rating ?? r.score,
          score: r.score ?? r.rating,
          // ISO 날짜(마이페이지 카드/정렬용)
          createdAt: r.createdAt ?? toISOFromYYMMDD(r.createdDate),
          // 이벤트 미니카드 메타
          event: resolveEventMetaById(r.eventId),
        }));
      resolve(reviews);
    }, 100);
  });
}

export function addEventReview(newReview) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 새 리뷰 코드 생성 (기존 코드에서 다음 번호 계산)
      const lastId =
        eventReviewData.length > 0
          ? Math.max(
              ...eventReviewData.map((review) =>
                parseInt(review.reviewId.replace("R_", ""))
              )
            )
          : 0;
      const newReviewId = `R_${String(lastId + 1).padStart(8, "0")}`;

      // 현재 날짜 생성 (YY.MM.DD 형식)
      const now = new Date();
      const createdDate = `${String(now.getFullYear()).slice(-2)}.${String(
        now.getMonth() + 1
      ).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
      // 이벤트 메타(마이페이지 카드용)
      const eventMeta = resolveEventMetaById(newReview.eventId);

      // 새 리뷰 객체 생성 (BE/FE 호환 키 동시 포함)
      const reviewToAdd = {
        reviewId: newReviewId,
        eventId: String(newReview.eventId),
        // 작성자
        userNickname: newReview.userNickname || "익명",
        userProfileImg: newReview.userProfileImg || "",
        memberId: newReview.memberId, // BE 대비(옵션)
        // 별점
        rating: Number(newReview.rating ?? newReview.score ?? 0), // BE 키
        score: Number(newReview.score ?? newReview.rating ?? 0), // FE 키
        // 내용/날짜
        content: newReview.content,
        createdDate,
        createdAt: now.toISOString(), // ISO (정렬/카드 표기)
        // 이벤트 미니카드 메타
        event: eventMeta,
      };

      // 더미데이터에 추가
      eventReviewData.push(reviewToAdd);

      resolve(reviewToAdd);
    }, 100);
  });
}

// // 마이페이지: 나의 리뷰 목록 프론트
// // - 실제 BE 연동 시 memberId로 필터, 지금은 더미여서 nickname 대체도 지원
// export function getMyEventReviews({ memberId, nickname } = {}) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       let list = eventReviewData;
//       if (memberId != null) {
//         list = list.filter((r) => r.memberId === memberId);
//       } else if (nickname) {
//         list = list.filter((r) => r.userNickname === nickname);
//       }
//       const enriched = list.map((r) => ({
//         ...r,
//         rating: r.rating ?? r.score,
//         score: r.score ?? r.rating,
//         createdAt: r.createdAt ?? toISOFromYYMMDD(r.createdDate),
//         event: resolveEventMetaById(r.eventId),
//       }));
//       resolve(enriched);
//     }, 100);
//   });
// }

//백엔드용

// 환경에 따른 데이터 소스 선택
const USE_BACKEND =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_USE_BACKEND === "true";

export function getMyEventReviews({ memberId, nickname } = {}) {
  console.log(
    "getMyEventReviews 호출됨 - USE_BACKEND:",
    USE_BACKEND,
    "memberId:",
    memberId
  );

  if (USE_BACKEND && memberId) {
    console.log("백엔드 API 호출 - apiGetMyEventReviews 함수 호출");
    console.log("apiGetMyEventReviews 함수 타입:", typeof apiGetMyEventReviews);

    if (typeof apiGetMyEventReviews !== "function") {
      console.error("apiGetMyEventReviews가 함수가 아닙니다!");
      return [];
    }

    return apiGetMyEventReviews({ memberId });
  } else {
    console.log("더미 데이터 사용");
    // 기존 더미 데이터 로직
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = eventReviewData;
        if (memberId != null) {
          list = list.filter((r) => r.memberId === memberId);
        } else if (nickname) {
          list = list.filter((r) => r.userNickname === nickname);
        }
        const enriched = list.map((r) => ({
          ...r,
          rating: r.rating ?? r.score,
          score: r.score ?? r.rating,
          createdAt: r.createdAt ?? toISOFromYYMMDD(r.createdDate),
          event: resolveEventMetaById(r.eventId),
        }));
        resolve(enriched);
      }, 100);
    });
  }
}
