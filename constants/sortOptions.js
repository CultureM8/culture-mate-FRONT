// 정렬 옵션 상수 정의
// UI용 한글 라벨과 백엔드 전달용 영문 값을 매핑

// 이벤트 페이지 정렬 옵션
export const eventSortOptions = [
  { value: "title_asc", label: "제목순" },
  { value: "title_desc", label: "제목 역순" },
  { value: "rating_desc", label: "별점 높은순" },
  { value: "rating_asc", label: "별점 낮은순" },
  { value: "review_count_desc", label: "리뷰 많은순" },
  { value: "start_date_asc", label: "시작일 빠른순" },
  { value: "end_date_asc", label: "종료일 빠른순" }
];

// 동행모집글 페이지 정렬 옵션
export const togetherSortOptions = [
  { value: "created_at_desc", label: "최근 작성순" },
  { value: "created_at_asc", label: "작성 오래된순" },
  { value: "meeting_date_asc", label: "모임날짜 빠른순" },
  { value: "meeting_date_desc", label: "모임날짜 늦은순" }
];

// 기본 정렬 옵션 (fallback용)
export const defaultSortOptions = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" }
];