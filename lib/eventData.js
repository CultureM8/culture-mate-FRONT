import {
  getEventById as apiGetEventById,
  getAllEvents as apiGetAllEvents,
  getEventsByType as apiGetEventsByType,
} from "./eventApi";

// eventId로 이벤트 데이터 조회 함수 (백엔드 연동)
export async function getEventById(eventId) {
  return await apiGetEventById(eventId);
}

// 전체 이벤트 목록 조회 (백엔드 연동)
export async function getAllEvents() {
  return await apiGetAllEvents();
}

// 타입별 이벤트 조회 (백엔드 연동)
export async function getEventsByType(eventType) {
  return await apiGetEventsByType(eventType);
}
