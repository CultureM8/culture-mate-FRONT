import { getFilterLabels } from "@/constants/eventTypes";

export default function EventSelector({ selected="전체", setSelected }) {

  const eventTypes = getFilterLabels(); // includeAll=true가 기본값

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