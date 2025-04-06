import React from 'react';

const Header = () => {
  return (
    <header className="bg-white text-black shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <h1 className="text-lg font-bold">Chat Application</h1>
        {/* Profile Section */}
        <div className="flex items-center space-x-2">
          {/* Profile Image */}
          <img
            src="/images/avatar.svg" // Replace with your image URL
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-300"
          />
          {/* Name and Designation */}
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-400">Software Engineer</p>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
