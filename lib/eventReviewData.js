import { getMyEventReviewsFromAPI } from "./eventApi";

// 마이페이지: 나의 리뷰 목록 조회
export async function getMyEventReviews() {
  try {
    return await getMyEventReviewsFromAPI();
  } catch (error) {
    console.error("내 리뷰 목록 조회 실패:", error);
    return [];
  }
}
