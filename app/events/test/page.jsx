"use client"

import CategoryFilterModal from "@/components/events/CategoryFilterModal";
import { useState } from "react";

export default function testpage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(true); // Set to true for demonstration

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  return(
    <>
      <h1>Test Page for Category Filter Modal</h1>
      <button onClick={openFilterModal} className="p-2 bg-green-500 text-white rounded">
        Open Category Filter Modal
      </button>

      <CategoryFilterModal isOpen={isFilterModalOpen} onClose={closeFilterModal} />
    </>
  )
}
