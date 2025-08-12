"use client"

import { useState, useEffect } from "react";
import { ICONS } from "@/constants/path";
import Image from "next/image";

export default function Calendar({ 
  onDatesChange, 
  selectedDates = [], 
  highlightDates = [], 
  mode = "multiple", // "single", "multiple", "range"
  className = "" 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [today] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // highlightDates 자동 처리 - 직관적인 월(1-12) 지원
  const processedHighlightDates = highlightDates.map(date => {
    // 객체 형태 {year: 2025, month: 8, day: 15}로 입력된 경우
    if (typeof date === 'object' && date.year && date.month && date.day) {
      return new Date(date.year, date.month - 1, date.day);
    }
    // 이미 Date 객체면 그대로 사용
    return date;
  });

  // 월 이름 배열
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", 
                    "7월", "8월", "9월", "10월", "11월", "12월"];
  
  // 요일 배열
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 해당 월의 첫 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // 시작 요일과 마지막 날짜
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // 이전 달로 이동
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 날짜 클릭 핸들러 (토글 기능)
  const handleDateClick = (day) => {
    const clickedDate = new Date(year, month, day);
    
    // 이미 선택된 날짜인지 확인
    const isAlreadySelected = selectedDates.some(date => 
      date.getFullYear() === clickedDate.getFullYear() && 
      date.getMonth() === clickedDate.getMonth() && 
      date.getDate() === clickedDate.getDate()
    );

    let newSelectedDates;
    
    if (isAlreadySelected) {
      // 이미 선택된 날짜면 제거 (토글 취소)
      newSelectedDates = selectedDates.filter(date => 
        !(date.getFullYear() === clickedDate.getFullYear() && 
          date.getMonth() === clickedDate.getMonth() && 
          date.getDate() === clickedDate.getDate())
      );
    } else {
      // 선택되지 않은 날짜면 추가
      if (mode === "single") {
        newSelectedDates = [clickedDate];
      } else {
        newSelectedDates = [...selectedDates, clickedDate];
      }
    }

    if (onDatesChange) {
      onDatesChange(newSelectedDates);
    }
  };

  // 오늘 날짜인지 확인
  const isToday = (day) => {
    return today.getFullYear() === year && 
          today.getMonth() === month && 
          today.getDate() === day;
  };

  // 선택된 날짜인지 확인
  const isSelectedDate = (day) => {
    return selectedDates.some(date => 
      date.getFullYear() === year && 
      date.getMonth() === month && 
      date.getDate() === day
    );
  };

  // 하이라이트된 날짜인지 확인 (처리된 날짜 배열 사용)
  const isHighlightDate = (day) => {
    return processedHighlightDates.some(date => 
      date.getFullYear() === year && 
      date.getMonth() === month && 
      date.getDate() === day
    );
  };

  // 달력 날짜 배열 생성
  const generateCalendarDays = () => {
    const days = [];
    
    // 이전 달 마지막 며칠
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }

    // 현재 달
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }

    // 다음 달 시작 며칠
    const remainingDays = 42 - days.length; // 6주 * 7일
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto ${className}`}>
      {/* 헤더: 년월 표시 및 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goToPrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Image 
            src={ICONS.LEFT_ARROW} 
            alt="이전 달"
            width={16}
            height={16}
          />
        </button>
        
        <h2 className="text-xl font-semibold">
          {year}년 {monthNames[month]}
        </h2>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Image 
            src={ICONS.RIGHT_ARROW} 
            alt="다음 달"
            width={16}
            height={16}
          />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dateObj, index) => {
          const { day, isCurrentMonth } = dateObj;
          
          return (
            <button
              key={index}
              onClick={() => isCurrentMonth && handleDateClick(day)}
              disabled={!isCurrentMonth}
              className={`
                h-10 w-10 text-sm rounded-lg transition-all duration-200
                ${!isCurrentMonth 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'hover:bg-gray-100 cursor-pointer'
                }
                ${isCurrentMonth && isToday(day) 
                  ? 'bg-blue-500 text-white font-bold' 
                  : ''
                }
                ${isCurrentMonth && isSelectedDate(day) 
                  ? 'bg-purple-500 text-white font-semibold' 
                  : ''
                }
                ${isCurrentMonth && isHighlightDate(day) && !isSelectedDate(day)
                  ? 'bg-yellow-100 text-yellow-800' 
                  : ''
                }
                ${index % 7 === 0 && isCurrentMonth && !isSelectedDate(day) && !isToday(day)
                  ? 'text-red-500' 
                  : index % 7 === 6 && isCurrentMonth && !isSelectedDate(day) && !isToday(day)
                  ? 'text-blue-500' 
                  : isCurrentMonth && !isSelectedDate(day) && !isToday(day)
                  ? 'text-gray-900' 
                  : ''
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜 개수 표시 */}
      {selectedDates.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          선택된 날짜: {selectedDates.length}개
        </div>
      )}
    </div>
  );
}