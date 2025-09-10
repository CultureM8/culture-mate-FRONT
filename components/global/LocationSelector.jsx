"use client"

import { useState, useEffect } from "react";
import regionApi from "@/lib/api/regionApi";

export default function LocationSelector({
  onRegionSelect,
  selectedRegions = [], 
  maxSelections = 5,
  className = "" 
}) {
  const [selectedLocation1, setSelectedLocation1] = useState("");
  const [selectedLocation2, setSelectedLocation2] = useState("");
  const [selectedLocation3, setSelectedLocation3] = useState("");
  
  const [locations1, setLocations1] = useState([]);
  const [locations2, setLocations2] = useState([]);
  const [locations3, setLocations3] = useState([]);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 1차 지역 로드
  useEffect(() => {
    const loadLevel1Regions = async () => {
      try {
        setLoading(true);
        const regions = await regionApi.getLevel1Regions();
        const regionNames = ["전체", ...regions];
        setLocations1(regionNames);
      } catch (error) {
        console.error("1차 지역 로드 실패:", error);
        setLocations1(["전체"]); // 에러 시 기본값
      } finally {
        setLoading(false);
      }
    };
    
    loadLevel1Regions();
  }, []);

  // 통합된 location 업데이트 로직
  const resetLowerLevels = (level) => {
    if (level <= 2) {
      setSelectedLocation2("");
      setSelectedLocation3("");
      setLocations3([]);
    }
    if (level <= 3) {
      setSelectedLocation3("");
    }
  };

  useEffect(() => {
    const loadLevel2Regions = async () => {
      if (selectedLocation1 && selectedLocation1 !== "전체") {
        try {
          setLoading(true);
          const regions = await regionApi.getLevel2Regions(selectedLocation1);
          const regionNames = ["전체", ...regions];
          setLocations2(regionNames);
          resetLowerLevels(2);
        } catch (error) {
          console.error("2차 지역 로드 실패:", error);
          setLocations2(["전체"]);
          resetLowerLevels(2);
        } finally {
          setLoading(false);
        }
      } else {
        setLocations2([]);
        resetLowerLevels(2);
      }
    };

    loadLevel2Regions();
  }, [selectedLocation1]);

  useEffect(() => {
    const loadLevel3Regions = async () => {
      if (selectedLocation1 && selectedLocation1 !== "전체" && 
          selectedLocation2 && selectedLocation2 !== "전체") {
        try {
          setLoading(true);
          const regions = await regionApi.getLevel3Regions(selectedLocation1, selectedLocation2);
          const regionNames = ["전체", ...regions];
          setLocations3(regionNames);
          resetLowerLevels(3);
        } catch (error) {
          console.error("3차 지역 로드 실패:", error);
          setLocations3(["전체"]);
          resetLowerLevels(3);
        } finally {
          setLoading(false);
        }
      } else {
        setLocations3([]);
        resetLowerLevels(3);
      }
    };

    loadLevel3Regions();
  }, [selectedLocation1, selectedLocation2]);

  // 단순화된 핸들러들
  const handleLocationSelect = (level, value) => {
    if (level === 1) setSelectedLocation1(value);
    else if (level === 2) setSelectedLocation2(value);
    else setSelectedLocation3(value);
  };

  // 지역 객체 생성 헬퍼 함수
  const createRegionObject = () => {
    if (selectedLocation1 === "전체") {
      return { location1: "전체", location2: "", location3: "", fullAddress: "전체" };
    }
    if (selectedLocation2 === "전체") {
      return { 
        location1: selectedLocation1, 
        location2: "전체", 
        location3: "", 
        fullAddress: `${selectedLocation1} 전체` 
      };
    }
    if (selectedLocation3 === "전체") {
      return { 
        location1: selectedLocation1, 
        location2: selectedLocation2, 
        location3: "전체", 
        fullAddress: `${selectedLocation1} ${selectedLocation2} 전체` 
      };
    }
    return { 
      location1: selectedLocation1, 
      location2: selectedLocation2, 
      location3: selectedLocation3, 
      fullAddress: `${selectedLocation1} ${selectedLocation2} ${selectedLocation3}` 
    };
  };

  // 선택 가능 여부 체크
  const canAddRegion = () => {
    return (selectedLocation2 === "전체") || 
           (selectedLocation3 === "전체") ||
           (selectedLocation3);
  };

  // 중복 체크
  const isDuplicateRegion = (region) => {
    return selectedRegions.some(
      existing => 
        existing.location1 === region.location1 &&
        existing.location2 === region.location2 &&
        existing.location3 === region.location3
    );
  };

  const handleAddRegion = () => {
    if (!canAddRegion() || selectedRegions.length >= maxSelections) return;
    
    const newRegion = createRegionObject();
    
    if (!isDuplicateRegion(newRegion)) {
      onRegionSelect([...selectedRegions, newRegion]);
    }
  };

  const handleRemoveRegion = (indexToRemove) => {
    const updatedRegions = selectedRegions.filter((_, index) => index !== indexToRemove);
    onRegionSelect(updatedRegions);
  };

  const handleClearAll = () => {
    onRegionSelect([]);
  };

  const isAddDisabled = () => {
    if (selectedRegions.length >= maxSelections) return true;
    if (!canAddRegion()) return true;
    return isDuplicateRegion(createRegionObject());
  };

  return (
    <div className={`${className}`}>
      {/* 3단계 선택 박스 */}
      <div className="h-60 grid grid-cols-3 gap-2 mb-4 grid-rows-1">
        <div className="flex flex-col h-full min-h-0">
          <label className="text-sm text-gray-600 mb-1 flex-shrink-0">시/도</label>
          <div className="flex-1 border rounded overflow-y-auto bg-white min-h-0">
            {loading && locations1.length === 0 ? (
              <div className="p-2 text-sm text-gray-400">로딩 중...</div>
            ) : (
              locations1.map((location1) => (
                <button
                  key={location1}
                  onClick={() => handleLocationSelect(1, location1)}
                  className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${
                    selectedLocation1 === location1 ? 'bg-blue-100 text-blue-800 font-medium' : ''
                  }`}
                >
                  {location1}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col h-full min-h-0">
          <label className="text-sm text-gray-600 mb-1 flex-shrink-0">시/군/구</label>
          <div className={`flex-1 border rounded overflow-y-auto min-h-0 ${!selectedLocation1 ? 'bg-gray-50' : 'bg-white'}`}>
            {!selectedLocation1 ? (
              <div className="p-2 text-sm text-gray-400">"시/도"를 먼저 선택하세요</div>
            ) : (
              locations2.map((location2) => (
                <button
                  key={location2}
                  onClick={() => handleLocationSelect(2, location2)}
                  className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${
                    selectedLocation2 === location2 ? 'bg-blue-100 text-blue-800 font-medium' : ''
                  }`}
                >
                  {location2}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col h-full min-h-0">
          <label className="text-sm text-gray-600 mb-1 flex-shrink-0">읍/면/동</label>
          <div className={`flex-1 border rounded overflow-y-auto min-h-0 ${!selectedLocation2 ? 'bg-gray-50' : 'bg-white'}`}>
            {!selectedLocation2 ? (
              <div className="p-2 text-sm text-gray-400">"시/군/구"를 먼저 선택하세요</div>
            ) : (
              locations3.map((location3) => (
                <button
                  key={location3}
                  onClick={() => handleLocationSelect(3, location3)}
                  className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${
                    selectedLocation3 === location3 ? 'bg-blue-100 text-blue-800 font-medium' : ''
                  }`}
                >
                  {location3}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 추가 버튼 */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleAddRegion}
          disabled={isAddDisabled()}
          className={`px-4 py-2 rounded font-medium ${
            isAddDisabled()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          지역 추가
        </button>
        
        <span className="text-sm text-gray-600">
          {selectedRegions.length}/{maxSelections} 선택됨
        </span>
      </div>

      {/* 선택된 지역 태그들 - 고정 높이 + 가로 스크롤 */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-700">선택된 지역</h4>
          {selectedRegions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-500 hover:text-red-700"
            >
              전체 삭제
            </button>
          )}
        </div>
        
        <div className="h-12 rounded px-2 overflow-x-auto overflow-y-hidden bg-gray-50 flex items-center">
          {selectedRegions.length === 0 ? (
            <div className="text-sm text-gray-400 whitespace-nowrap">
              선택된 지역이 없습니다
            </div>
          ) : (
            <div className="flex gap-2 items-center" style={{ minWidth: 'max-content' }}>
              {selectedRegions.map((region, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm whitespace-nowrap flex-shrink-0"
                >
                  <span>{region.fullAddress}</span>
                  <button
                    onClick={() => handleRemoveRegion(index)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
