'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number; // 0-indexed or 1-indexed based on state
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
      >
        Previous
      </button>

      <span className="text-sm text-gray-600 px-3">
        Page {currentPage + 1} of {totalPages || 1}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
};