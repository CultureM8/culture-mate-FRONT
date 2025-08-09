export default function EventSelector({ selected="전체", setSelected }) {

  const eventTypes = [ "전체", "뮤지컬", "영화", "연극", "전시", "클래식/무용", "콘서트/페스티벌", "지역행사", "기타" ];

  return (
    <div className="h-25 flex gap-4 justify-center items-center">
      {eventTypes.map((type, _) => (
        <button
          key={type}
          className={`px-4 py-2 rounded-full border h-9 text-lg flex items-center
            hover:cursor-pointer
            ${selected === type ? "bg-black text-white" : "bg-white text-gray-300"}`}
          onClick={() => setSelected(type)}
        >{type}</button>
      ))}
    </div>
  )
}