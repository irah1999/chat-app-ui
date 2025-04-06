import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ThreeDotMenu({ threeDotMenus }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (menu) => {
    if (menu.action) {
      menu.action();
    } else if (menu.navigation) {
      navigate(menu.navigation);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <MoreVertical className="w-6 h-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50">
          {threeDotMenus.map((menu, index) => (
            <button
              key={index}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => handleClick(menu)}
            >
              {menu.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
