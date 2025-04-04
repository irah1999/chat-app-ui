import { useState } from "react";
import { MoreVertical } from "lucide-react";

export default function ThreeDotMenu( {openModal} ) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <MoreVertical className="w-6 h-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md">
          <button className="block w-full text-left px-4 py-2 hover:bg-blur-950" onClick={openModal}>+ Group Chat</button>
          <button className="block w-full text-left px-4 py-2 hover:bg-blur-950">Logout</button>
        </div>
      )}
    </div>
  );
}
