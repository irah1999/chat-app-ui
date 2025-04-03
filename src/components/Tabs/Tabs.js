import React, { useState } from "react";

const tabs = [
  { id: "home", label: "Home", content: "This is the Home tab content." },
  { id: "profile", label: "Profile", content: "This is the Profile tab content." },
  { id: "settings", label: "Settings", content: "This is the Settings tab content." }
];

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="w-full mx-auto bg-white">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 text-gray-600 border-b-2 transition duration-300 ${
              activeTab === tab.id ? "border-blue-500 text-blue-600 font-semibold" : "border-transparent hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 border border-gray-200 rounded-b-lg">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;
