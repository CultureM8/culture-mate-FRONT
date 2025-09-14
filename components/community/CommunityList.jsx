"use client";

import Link from "next/link";

function fmtDate(iso) {
  if (!iso) return "0000-00-00 00:00:00";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "0000-00-00 00:00:00";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function CommunityList({
  id,
  title,
  author,
  createdAt,
  // views,
  recommendations,
  comments,
}) {
  return (
    <div
      className="grid hover:bg-gray-50 bg-white py-3 px-4 border-b border-gray-300 transition-colors duration-150"
      style={{
        gridTemplateColumns: "140px 1fr 60px 60px  200px",
      }}>
      <div className="text-sm text-gray-800 text-left truncate" title={author}>
        {author}
      </div>
      <div className="min-w-0">
        <Link
          href={`/community/${id}`}
          className="text-left text-sm text-gray-800 hover:text-blue-600 hover:underline line-clamp-1 transition-colors"
          title={title}>
          {title}
        </Link>
      </div>
      <div className="text-center text-sm text-gray-600">{comments}</div>
      <div className="text-center text-sm text-gray-600">{recommendations}</div>
      {/* <div className="text-center text-sm text-gray-600">
        {views}
      </div> */}
      <div className="text-center text-xs text-gray-400">
        {fmtDate(createdAt)}
      </div>
    </div>
  );
}
