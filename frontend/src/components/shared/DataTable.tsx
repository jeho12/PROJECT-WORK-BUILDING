'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  pageSize?: number;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKey,
  pageSize = 10
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchQuery && searchKey) {
      result = result.filter((row) => {
        const val = row[searchKey as string];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }

        return sortOrder === 'asc' 
          ? (valA > valB ? 1 : -1) 
          : (valA < valB ? 1 : -1);
      });
    }

    return result;
  }, [data, searchQuery, searchKey, sortKey, sortOrder]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="bg-surface border border-border-custom rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Search Bar */}
      {searchKey && (
        <div className="p-4 border-b border-border-custom bg-slate-50/50 flex items-center">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border-custom focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none rounded-lg text-text-primary placeholder:text-text-secondary transition-all"
            />
          </div>
        </div>
      )}

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-border-custom text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4">
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.accessorKey as string)}
                      className="inline-flex items-center space-x-1 hover:text-text-primary transition-colors focus:outline-none"
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-custom text-sm text-text-primary">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/40 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                      {col.cell 
                        ? col.cell(row) 
                        : row[col.accessorKey as string] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-text-secondary">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border-custom bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-text-primary">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-text-primary">{filteredData.length}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-border-custom bg-white hover:bg-slate-50 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-text-secondary">
              Page <span className="font-semibold text-text-primary">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-border-custom bg-white hover:bg-slate-50 text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
