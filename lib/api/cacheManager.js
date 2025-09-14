// lib/api/cacheManager.js
/**
 * 캐시 관리 유틸리티
 * - 백엔드 데이터를 임시 캐싱
 * - TTL(Time To Live) 지원
 * - 자동 만료 처리
 */

const CACHE_PREFIX = 'cm_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5분

class CacheManager {
  /**
   * 캐시 저장
   * @param {string} key - 캐시 키
   * @param {any} data - 저장할 데이터
   * @param {number} ttl - 유효 시간 (밀리초)
   */
  static set(key, data, ttl = DEFAULT_TTL) {
    if (typeof window === 'undefined') return;

    const cacheData = {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    };

    try {
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('캐시 저장 실패:', error);
    }
  }

  /**
   * 캐시 조회
   * @param {string} key - 캐시 키
   * @returns {any|null} 캐시된 데이터 또는 null
   */
  static get(key) {
    if (typeof window === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);

      // 만료 확인
      if (Date.now() > cacheData.expiry) {
        this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('캐시 조회 실패:', error);
      return null;
    }
  }

  /**
   * 캐시 삭제
   * @param {string} key - 캐시 키
   */
  static remove(key) {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(CACHE_PREFIX + key);
  }

  /**
   * 특정 패턴의 캐시 모두 삭제
   * @param {string} pattern - 키 패턴
   */
  static clearPattern(pattern) {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  /**
   * 모든 캐시 삭제
   */
  static clearAll() {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  /**
   * 캐시 유효성 검사
   * @param {string} key - 캐시 키
   * @returns {boolean} 유효 여부
   */
  static isValid(key) {
    if (typeof window === 'undefined') return false;

    try {
      const cached = sessionStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      return Date.now() <= cacheData.expiry;
    } catch {
      return false;
    }
  }
}

export default CacheManager;