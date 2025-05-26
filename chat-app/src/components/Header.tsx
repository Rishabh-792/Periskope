import React from 'react';
import Image from 'next/image';
import { IoArrowBack } from 'react-icons/io5';
import { FiSearch, FiPlus, FiMoreVertical } from 'react-icons/fi';

import avatar from '../assets/avatar.png';

const ChatHeader = ({
  chatName = "Team Chat",
  onBackClick,
  onSearch,
  onAdd,
  onMenuClick,
  userAvatarUrl
}) => {
  return (
    <div className="
      flex items-center justify-between
      bg-white
      shadow-sm
      border-b border-gray-200
      px-4 py-3
      min-h-[64px]
    ">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBackClick}
          className="text-green-600 text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <IoArrowBack />
        </button>
        <span className="text-xl font-bold text-gray-800 whitespace-nowrap">
          {chatName}
        </span>
      </div>

      <div className="flex-1 max-w-sm mx-4">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <FiSearch className="text-gray-500 mr-2 text-lg" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-gray-700 text-base placeholder-gray-500"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onAdd}
          className="text-gray-600 text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiPlus />
        </button>
        <button
          onClick={onMenuClick}
          className="text-gray-600 text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiMoreVertical />
        </button>
        <Image
          src={userAvatarUrl || avatar}
          alt="User Avatar"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover border border-gray-300 flex-shrink-0"
        />
      </div>
    </div>
  );
};

export default ChatHeader;