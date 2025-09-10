"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/path";
import { getLevel1Regions, getLevel2Regions, getLevel3Regions } from "@/lib/regionApi";

export default function RegionSelector({ 
  value = { level1: "", level2: "", level3: "" }, 
  onChange, 
  placeholder = {
    level1: "시/도 선택",
    level2: "시/군/구 선택", 
    level3: "읍/면/동 선택"
  }
}) {
  const [selectedRegion, setSelectedRegion] = useState(value);
  const [options, setOptions] = useState({
    level1: [],
    level2: [],
    level3: []
  });
  const [loading, setLoading] = useState({
    level1: false,
    level2: false,
    level3: false
  });

  // 초기 Level1 데이터 로드
  useEffect(() => {
    const loadLevel1Data = async () => {
      setLoading(prev => ({ ...prev, level1: true }));
      try {
        const level1Data = await getLevel1Regions();
        setOptions(prev => ({ ...prev, level1: level1Data }));
      } catch (error) {
        console.error('Level1 지역 로드 실패:', error);
      } finally {
        setLoading(prev => ({ ...prev, level1: false }));
      }
    };

    loadLevel1Data();
  }, []);

  // Level1 변경 시 Level2 데이터 로드
  const handleLevel1Change = async (level1) => {
    const newRegion = { level1, level2: "", level3: "" };
    setSelectedRegion(newRegion);
    if (onChange) onChange(newRegion);

    // Level2, Level3 옵션 초기화
    setOptions(prev => ({ ...prev, level2: [], level3: [] }));

    if (level1) {
      setLoading(prev => ({ ...prev, level2: true }));
      try {
        const level2Data = await getLevel2Regions(level1);
        setOptions(prev => ({ ...prev, level2: level2Data }));
      } catch (error) {
        console.error('Level2 지역 로드 실패:', error);
      } finally {
        setLoading(prev => ({ ...prev, level2: false }));
      }
    }
  };

  // Level2 변경 시 Level3 데이터 로드
  const handleLevel2Change = async (level2) => {
    const newRegion = { ...selectedRegion, level2, level3: "" };
    setSelectedRegion(newRegion);
    if (onChange) onChange(newRegion);

    // Level3 옵션 초기화
    setOptions(prev => ({ ...prev, level3: [] }));

    if (selectedRegion.level1 && level2) {
      setLoading(prev => ({ ...prev, level3: true }));
      try {
        const level3Data = await getLevel3Regions(selectedRegion.level1, level2);
        setOptions(prev => ({ ...prev, level3: level3Data }));
      } catch (error) {
        console.error('Level3 지역 로드 실패:', error);
      } finally {
        setLoading(prev => ({ ...prev, level3: false }));
      }
    }
  };

  // Level3 변경
  const handleLevel3Change = (level3) => {
    const newRegion = { ...selectedRegion, level3 };
    setSelectedRegion(newRegion);
    if (onChange) onChange(newRegion);
  };

  return (
    <div className="flex items-center gap-2">
      {/* 1단계: 시/도 */}
      <div className="relative">
        <select
          value={selectedRegion.level1}
          onChange={(e) => handleLevel1Change(e.target.value)}
          disabled={loading.level1}
          className="w-28 h-8 px-2 pr-6 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">{loading.level1 ? "로딩..." : placeholder.level1}</option>
          {options.level1.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Image
          src={ICONS.DOWN_ARROW}
          alt="dropdown"
          width={12}
          height={12}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none"
        />
      </div>

      {/* 2단계: 시/군/구 */}
      <div className="relative">
        <select
          value={selectedRegion.level2}
          onChange={(e) => handleLevel2Change(e.target.value)}
          disabled={!selectedRegion.level1 || loading.level2}
          className="w-28 h-8 px-2 pr-6 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">{loading.level2 ? "로딩..." : placeholder.level2}</option>
          {options.level2.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Image
          src={ICONS.DOWN_ARROW}
          alt="dropdown"
          width={12}
          height={12}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none"
        />
      </div>

      {/* 3단계: 읍/면/동 (선택사항) */}
      <div className="relative">
        <select
          value={selectedRegion.level3}
          onChange={(e) => handleLevel3Change(e.target.value)}
          disabled={!selectedRegion.level2 || loading.level3}
          className="w-28 h-8 px-2 pr-6 bg-transparent text-sm border-0 border-b border-gray-300 appearance-none focus:outline-none focus:border-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">{loading.level3 ? "로딩..." : placeholder.level3}</option>
          {options.level3.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Image
          src={ICONS.DOWN_ARROW}
          alt="dropdown"
          width={12}
          height={12}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none"
        />
      </div>
    </div>
  );
}