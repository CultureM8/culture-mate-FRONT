import TogetherList from "../together/TogetherList";
import ListLayout from "../global/ListLayout";
import SearchFilterSort from "../global/SearchSort";

export default function HistoryWith({ posts }) {
  return (
    <>
      <div className="mt-6 space-y-1">
        <SearchFilterSort />
        {/* viewType에 따라 보여줄 컴포넌트 분기 */}

        <ListLayout Component={TogetherList} items={posts} />
      </div>
    </>
  );
}
