import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { IoFilter } from "react-icons/io5";
import { HiFolderArrowDown } from "react-icons/hi2";

const FilterBar = () => {
  const isFilteredActive = true;

  const handleCustomFilter = () => {
    console.log('Custom filter clicked');
  };

  const handleSave = () => {
    console.log('Save clicked');
  };

  const handleSearch = () => {
    console.log('Search clicked');
  };

  const handleClearFilter = () => {
    console.log('Clear filter clicked');
  };

  return (
    <div className="
      flex items-center justify-between
      bg-gray-50
      py-2
      text-sm
    ">
      <div className="flex items-center gap-2">
        <span
          onClick={handleCustomFilter}
          className="
            flex items-center
            text-green-600 font-semibold
            cursor-pointer
            py-1.5
          "
        >
          <HiFolderArrowDown className="mr-2 text-lg" /> 
          Custom filter
        </span>

        <button
          onClick={handleSave}
          className="
            px-3 py-1.5
            bg-white text-gray-700 font-medium
            rounded-md shadow-sm border border-gray-300
            hover:bg-gray-50 transition-colors
          "
        >
          Save
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSearch}
          className="
            flex items-center px-3 py-1.5
            bg-white text-gray-700 font-medium
            rounded-md shadow-sm border border-gray-300 
            hover:bg-gray-50 transition-colors
          "
        >
          <FiSearch className="mr-2 text-base" /> 
          Search
        </button>

        <button
          onClick={handleClearFilter}
          className="
            relative flex items-center px-3 py-1.5 pr-5
            bg-white text-green-700 font-medium
            rounded-md shadow-sm border border-gray-300 
            hover:bg-gray-50 transition-colors
          "
        >
          <IoFilter className="mr-2 text-base" /> 
          Filtered
          {isFilteredActive && (
            <span
              className="
                absolute -top-1 -right-1.5
                w-5 h-5 flex items-center justify-center
                bg-green-500 rounded-full
                text-white text-xs
                cursor-pointer
                border-2 border-white
              "
            >
              <FiX />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default FilterBar;