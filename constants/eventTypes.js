// 이벤트 타입 상수 정의
// value: 백엔드로 전송할 ENUM 값
// label: UI에서 표시할 사용자 친화적 텍스트

export const EVENT_TYPES = {
  MUSICAL: { value: 'MUSICAL', label: '뮤지컬' },
  MOVIE: { value: 'MOVIE', label: '영화' },
  THEATER: { value: 'THEATER', label: '연극' },
  EXHIBITION: { value: 'EXHIBITION', label: '전시' },
  CLASSIC: { value: 'CLASSIC', label: '클래식' },
  DANCE: { value: 'DANCE', label: '무용' },
  CONCERT: { value: 'CONCERT', label: '콘서트' },
  FESTIVAL: { value: 'FESTIVAL', label: '페스티벌' },
  LOCAL_EVENT: { value: 'LOCAL_EVENT', label: '지역 행사' },
  OTHER: { value: 'OTHER', label: '기타' }
};

// 반복 작업용 배열 (객체에서 자동 생성)
export const EVENT_TYPE_OPTIONS = Object.values(EVENT_TYPES);

// UI 라벨 → 백엔드 ENUM 매핑 (중앙화된 매핑)
export const UI_LABEL_MAPPINGS = {
  [EVENT_TYPES.MUSICAL.label]: [EVENT_TYPES.MUSICAL.value],
  [EVENT_TYPES.MOVIE.label]: [EVENT_TYPES.MOVIE.value],
  [EVENT_TYPES.THEATER.label]: [EVENT_TYPES.THEATER.value],
  [EVENT_TYPES.EXHIBITION.label]: [EVENT_TYPES.EXHIBITION.value],
  [EVENT_TYPES.CLASSIC.label]: [EVENT_TYPES.CLASSIC.value],
  [EVENT_TYPES.DANCE.label]: [EVENT_TYPES.DANCE.value],
  [EVENT_TYPES.CONCERT.label]: [EVENT_TYPES.CONCERT.value],
  [EVENT_TYPES.FESTIVAL.label]: [EVENT_TYPES.FESTIVAL.value],
  [EVENT_TYPES.LOCAL_EVENT.label]: [EVENT_TYPES.LOCAL_EVENT.value],
  [EVENT_TYPES.OTHER.label]: [EVENT_TYPES.OTHER.value],
  // 조합 매핑 (비즈니스 로직)
  "클래식/무용": [EVENT_TYPES.CLASSIC.value, EVENT_TYPES.DANCE.value],
  "콘서트/페스티벌": [EVENT_TYPES.CONCERT.value, EVENT_TYPES.FESTIVAL.value],
};

// 매핑 함수 (재사용 가능)
export const mapUiLabelToBackendTypes = (label) => {
  return UI_LABEL_MAPPINGS[label] || [];
};

// UI 라벨 리스트 편의 함수들
export const getUILabels = () => Object.keys(UI_LABEL_MAPPINGS);

export const getFilterLabels = (includeAll = true) => {
  const labels = Object.keys(UI_LABEL_MAPPINGS);
  return includeAll ? ["전체", ...labels] : labels;
};

// 편의 함수들
export const getEventTypeLabel = (value) => {
  const eventType = EVENT_TYPE_OPTIONS.find(type => type.value === value);
  return eventType ? eventType.label : value;
};

export const getEventTypeValue = (label) => {
  const eventType = EVENT_TYPE_OPTIONS.find(type => type.label === label);
  return eventType ? eventType.value : label;
};