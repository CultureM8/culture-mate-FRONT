// lib/regionApi.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

/**
 * 시/도 목록 조회
 */
export const getLevel1Regions = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/v1/regions/dropdown/level1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Level1 지역 조회 실패:', error);
    return [];
  }
};

/**
 * 시/군/구 목록 조회
 */
export const getLevel2Regions = async (level1) => {
  if (!level1) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/regions/dropdown/level2?level1=${encodeURIComponent(level1)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Level2 지역 조회 실패:', error);
    return [];
  }
};

/**
 * 읍/면/동 목록 조회
 */
export const getLevel3Regions = async (level1, level2) => {
  if (!level1 || !level2) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/regions/dropdown/level3?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Level3 지역 조회 실패:', error);
    return [];
  }
};