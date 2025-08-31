import HistoryTab from "@/components/mypage/HistoryTab";
import PageTitle from "@/components/global/PageTitle";
import { useMemo } from "react";

export default function History() {
  const eventData = useMemo(
    () => [
      {
        imgSrc: "",
        alt: "",
        title: "제목-1",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-2",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-3",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-4",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-5",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-6",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-7",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-8",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-9",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-1",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-2",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-3",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-4",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-5",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-6",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-7",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-8",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-9",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-1",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-2",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-3",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-4",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-5",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-6",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-7",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-8",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: true,
      },
      {
        imgSrc: "",
        alt: "",
        title: "제목-9",
        date: "0000.00.00 ~ 0000.00.00",
        location: "지역 및 장소명",
        isHot: false,
      },
    ],
    []
  );

  const withData = useMemo(
    () => [
      {
        id: 1,
        title: "동행 기록-1",
        description: "함께한 동행 활동 설명",
        date: "2025-08-20",
        participants: 4,
        location: "강남구",
        status: "완료",
      },
      {
        id: 2,
        title: "동행 기록-2", 
        description: "문화 체험 동행 활동",
        date: "2025-08-15",
        participants: 6,
        location: "홍대입구",
        status: "완료",
      },
      {
        id: 3,
        title: "동행 기록-3",
        description: "전시회 관람 동행",
        date: "2025-08-10", 
        participants: 3,
        location: "종로구",
        status: "완료",
      },
    ],
    []
  );

  return (
    <>
      <PageTitle>활동 내역</PageTitle>
      <div className="mt-4 space-y-1">
        <HistoryTab eventData={eventData} withData={withData} />
      </div>
    </>
  );
}
