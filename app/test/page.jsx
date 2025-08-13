import TestReviewList from "@/components/community/Test_ReviewList";
import ListGallery from "@/components/global/ListView";
import List from "@/components/global/Test_List";
import TestListLayout from "@/components/global/Test_ListLayout";
import TestTogetherList from "@/components/together/Test_TogetherList";
import TogetherList from "@/components/together/TogetherList";

export default function test() {

  const eventData = [
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-1",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-2",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-3",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-4",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-5",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-6",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-7",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-8",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: true,
    },
    {
      imgSrc: "",
      alt: "",
      title: "제목-9",
      date: "0000.00.00",
      location: "지역 및 장소명",
      isHot: false,
    },
  ];

  return (
    <div className="min-h-150">
      <h1 className="text-4xl font-bold">test</h1>
      <ListGallery src={eventData[0].imgSrc} alt={eventData[0].alt} />
      <List />
      <TogetherList />
      <TestTogetherList />
      
      <TestReviewList 
        score={3.5}
      />

      <TestListLayout 
        Component={TestTogetherList}
        items={eventData}
      />
    </div>
  );
}
