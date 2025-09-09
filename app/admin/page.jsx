"use client";

import AdminSubTitle from "@/components/admin/AdminSubTitle";
import AnalysisByPeriod from "@/components/admin/dashboard/AnalysisByPeriod";
import MonthlyChart from "@/components/admin/dashboard/MonthlyChart";

function SumStatMiniBoard({ title, count = 0, unit = "" }) {
  
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div className="w-full border border-gray-300 rounded-md px-4 py-4 flex flex-col gap-4">
      <strong>{title}</strong>
      <div className="px-4 text-right">{formatNumber(count)} {unit}</div>
    </div>
  );
}

export default function DashBoard() {
  let statData = [
    { 
      title: "누적 방문자 수",
      count: 324709581278,
      unit: "명"
    },
    { 
      title: "오늘 방문자 수",
      count: 1288,
      unit: "명"
    },
    { 
      title: "총 회원 수",
      count: 897234,
      unit: "명"
    },
    { 
      title: "오늘 가입자 수",
      count: 35,
      unit: "명"
    },
  ];

  return (
    <div className="w-full">
      {/* 관리자 소제목 */}
      <AdminSubTitle title="통계 / 대시보드" />

      {/* 관리자 컨텐츠 */}
      <div className="py-6 min-h-[200px] flex flex-col gap-6">
            {/* 상단 미니 통계 표시 */}
            <div className="flex gap-4">
              {statData.map((data, index) => (
                <SumStatMiniBoard 
                  key={index}
                  title={data.title}
                  count={data.count}
                  unit={data.unit}
                />
              ))}
            </div>

            {/* 기간별 분석표 */}
            <AnalysisByPeriod />

            {/* 월별 차트 */}
            <MonthlyChart />
      </div>
    </div>
  );
}