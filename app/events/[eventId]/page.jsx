import EventPageClient from "./EventPageClient";
import { getEventById } from "@/lib/eventData";

export default async function EventId({ params }) {
  const { eventId } = await params;
  
  let eventData = null;
  try {
    eventData = await getEventById(eventId);
  } catch (err) {
    console.error("이벤트 데이터 로딩 실패:", err);
  }
  
  if (!eventData) {
    return (
      <>  
        <h1 className="text-4xl font-bold py-[10px] h-16 px-6">이벤트</h1>
        <div className="flex justify-center items-center h-64 px-6">
          <div>이벤트를 찾을 수 없습니다.</div>
        </div>
      </>
    );
  }

  return(
    <>
      <EventPageClient eventData={eventData} />
    </>
  )
}