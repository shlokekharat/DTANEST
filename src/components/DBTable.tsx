/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, ArrowUpDown, ChevronDown, ChevronUp, Edit2, Trash2, 
  ChevronLeft, ChevronRight, CheckSquare, Square, Filter, RefreshCw
} from 'lucide-react';
import { SchemaType, DatabaseRecord } from '../types';

interface DBTableProps {
  schema: SchemaType;
  records: DatabaseRecord[];
  onEditRecord: (record: DatabaseRecord) => void;
  onDeleteRecord: (id: string) => void;
  onBatchDeleteRecords: (ids: string[]) => void;
}

export default function DBTable({ 
  schema, 
  records, 
  onEditRecord, 
  onDeleteRecord, 
  onBatchDeleteRecords 
}: DBTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  
  // Sorting State
  const [sortKey, setSortKey] = useState<string>('_createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter list of options for selectivity
  const selectFields = useMemo(() => {
    return schema.fields.filter(f => f.type === 'select');
  }, [schema]);

  const uniqueFilterOptions = useMemo(() => {
    if (!filterField) return [];
    // Get unique values in records for chosen filter column
    const vals = records
      .map(r => r[filterField])
      .filter(v => v !== undefined && v !== null && v !== '');
    return Array.from(new Set(vals)) as string[];
  }, [filterField, records]);

  // Handle Schema or Filter Field switches
  React.useEffect(() => {
    setFilterValue('');
    setSelectedIds([]);
    setCurrentPage(1);
  }, [filterField, schema]);

  // Reset page when search or items change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterValue]);

  // Filtered & Sorted records
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // 1. Apply Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((record) => {
        return schema.fields.some((field) => {
          const val = record[field.key];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // 2. Apply Custom Field Dropdown Filter
    if (filterField && filterValue) {
      result = result.filter((record) => {
        return String(record[filterField]) === filterValue;
      });
    }

    // 3. Apply Sorting
    result.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      // Handle numerical sort
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle boolean sort
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        const aNum = aVal ? 1 : 0;
        const bNum = bVal ? 1 : 0;
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Handle alpha sort
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [records, searchQuery, filterField, filterValue, sortKey, sortOrder, schema]);

  // Compute pagination
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedRecords, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRecords.length / rowsPerPage));

  // Selection Actions
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRecords.map(r => r.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Badge dynamic colors engine based on standard values
  const getBadgeClass = (val: string) => {
    const v = String(val).toLowerCase();
    
    // Status positive values
    if (['active', 'in stock', 'finished review', 'completed', 'onboarded', 'yes', 'true'].includes(v)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    }
    // Warning status keys
    if (['on leave', 'low stock', 'queued next', 'executing reorder', 'remote only', 'contractor', 'watching'].includes(v)) {
      return 'bg-amber-50 text-amber-700 border-amber-200/60';
    }
    // Danger status keys
    if (['terminated', 'out of stock', 'discontinued', 'on hold', 'no', 'false'].includes(v)) {
      return 'bg-rose-50 text-rose-700 border-rose-200/60';
    }
    // Inactive status keys
    if (['in backlog', 'archived', 'draft'].includes(v)) {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }
    // Fallback/standard department badges
    return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Are you absolutely sure you want to delete the ${selectedIds.length} selected records?`)) {
      onBatchDeleteRecords(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div id="table-view" className="space-y-4">
      {/* Search and Filters Strip */}
      <div id="table-controls" className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="table-search"
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 bg-[#fafcfd]/50 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all"
            placeholder={`Search across ${records.length} records in ${schema.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic Filters dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {selectFields.length > 0 && (
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-slate-50/50">
              <select
                id="select-filter-field"
                className="text-xs font-medium text-slate-600 bg-transparent pr-6 pl-2 py-1 focus:outline-hidden border-r border-slate-200"
                value={filterField}
                onChange={(e) => {
                  setFilterField(e.target.value);
                  setFilterValue('');
                }}
              >
                <option value="">No Filter Column</option>
                {selectFields.map(f => (
                  <option key={f.key} value={f.key}>{f.name}</option>
                ))}
              </select>

              {filterField ? (
                <select
                  id="select-filter-value"
                  className="text-xs font-semibold text-slate-800 bg-transparent py-1 px-2 focus:outline-hidden"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                >
                  <option value="">Show All Values</option>
                  {uniqueFilterOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <div id="filter-placeholder" className="text-xs text-slate-400 px-2 py-1">Select a core column</div>
              )}
            </div>
          )}

          {/* Reset Filters Quick Button */}
          {(searchQuery || filterField || filterValue) && (
            <button
              id="btn-reset-filters"
              onClick={() => {
                setSearchQuery('');
                setFilterField('');
                setFilterValue('');
              }}
              className="px-3 py-1.5 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Batch Select Actions Banner */}
      {selectedIds.length > 0 && (
        <div id="batch-banner" className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 rounded-xl shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center rounded-sm text-xs font-bold font-mono">
              {selectedIds.length}
            </div>
            <span className="text-sm font-medium text-slate-300">
              record{selectedIds.length > 1 ? 's' : ''} selected in current table
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-batch-deselect"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel Selection
            </button>
            <button
              id="btn-batch-delete"
              onClick={handleBatchDelete}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Master Data Table Container */}
      <div id="table-container" className="bg-white rounded-xl border border-slate-200/80 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                {/* Batch Checklist Checkbox header */}
                <th id="th-checkbox" className="w-[45px] py-3.5 px-4">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Select All Rows on This Page"
                  >
                    {selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0 ? (
                      <CheckSquare className="w-4.5 h-4.5 text-slate-800" />
                    ) : (
                      <Square className="w-4.5 h-4.5" />
                    )}
                  </button>
                </th>

                {/* Database Fields */}
                {schema.fields.map((field) => {
                  const isSorted = sortKey === field.key;
                  return (
                    <th 
                      id={`th-field-${field.key}`}
                      key={field.key}
                      onClick={() => handleSort(field.key)}
                      className="py-3.5 px-4 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100/50 hover:text-slate-900 select-none transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{field.name}</span>
                        {isSorted ? (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-900" /> : <ChevronDown className="w-3 h-3 text-slate-900" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>
                  );
                })}

                {/* Audit date and row actions header */}
                <th id="th-updated-on" className="py-3.5 px-4 text-xs font-bold text-slate-500">
                  Updated On
                </th>
                <th id="th-row-actions" className="py-3.5 px-4 text-xs font-bold text-slate-500 text-right w-[110px]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={schema.fields.length + 3} className="py-12 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      <p className="font-medium text-slate-500">No matching database records found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or query parameters above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const isSelected = selectedIds.includes(record.id);
                  return (
                    <tr 
                      id={`row-${record.id}`}
                      key={record.id}
                      className={`hover:bg-slate-50/50 group transition-colors ${
                        isSelected ? 'bg-indigo-50/15 hover:bg-indigo-50/25' : ''
                      }`}
                    >
                      {/* Selection Box */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(record.id)}
                          className={`transition-colors ${
                            isSelected ? 'text-slate-800' : 'text-slate-300 hover:text-slate-400'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4.5 h-4.5" />
                          ) : (
                            <Square className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </td>

                      {/* Display cells based on Type mapping */}
                      {schema.fields.map((field) => {
                        const cellVal = record[field.key];
                        const isPrimary = field.key === schema.primaryFieldKey;

                        return (
                          <td 
                            id={`cell-${record.id}-${field.key}`}
                            key={field.key} 
                            onClick={() => onEditRecord(record)}
                            className="py-3 px-4 text-sm text-slate-600 max-w-[200px] truncate cursor-pointer"
                          >
                            {/* Primary Field Styling */}
                            {isPrimary ? (
                              <span className="font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                                {cellVal !== undefined && cellVal !== null ? String(cellVal) : '-'}
                              </span>
                            ) : (
                              <>
                                {/* Number format */}
                                {field.type === 'number' && (
                                  <span className="font-mono text-slate-900 text-xs font-medium">
                                    {cellVal !== undefined && cellVal !== null 
                                      ? (field.key.toLowerCase().includes('salary') || field.key.toLowerCase().includes('price')
                                          ? `$${Number(cellVal).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                          : Number(cellVal).toLocaleString())
                                      : '-'}
                                  </span>
                                )}

                                {/* Date alignment */}
                                {field.type === 'date' && (
                                  <span className="text-[13px] text-slate-600">
                                    {cellVal ? new Date(cellVal).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                  </span>
                                )}

                                {/* Select Badging */}
                                {field.type === 'select' && cellVal && (
                                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold tracking-wide rounded-full border ${getBadgeClass(cellVal)}`}>
                                    {String(cellVal)}
                                  </span>
                                )}

                                {/* Boolean Checks */}
                                {field.type === 'boolean' && (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-bold rounded-md border uppercase ${
                                    cellVal ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}>
                                    {cellVal ? 'Yes' : 'No'}
                                  </span>
                                )}

                                {/* Standard String formatting */}
                                {field.type === 'text' && (
                                  <span className="text-slate-600">
                                    {cellVal !== undefined && cellVal !== null ? String(cellVal) : '-'}
                                  </span>
                                )}
                              </>
                            )}
                          </td>
                        );
                      })}

                      {/* Display of modified timestamp */}
                      <td className="py-3 px-4 text-xs font-mono text-slate-400">
                        {new Date(record._updatedAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })} {new Date(record._updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </td>

                      {/* Quick row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 select-none">
                          <button
                            id={`btn-edit-${record.id}`}
                            onClick={() => onEditRecord(record)}
                            className="p-1 px-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Record Detail"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-${record.id}`}
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this record?')) {
                                onDeleteRecord(record.id);
                              }
                            }}
                            className="p-1 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination footer */}
        <div id="table-pagination" className="bg-slate-50/50 px-4 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{filteredAndSortedRecords.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(filteredAndSortedRecords.length, currentPage * rowsPerPage)}</span> of <span className="font-bold text-slate-700">{filteredAndSortedRecords.length}</span> records
            {records.length !== filteredAndSortedRecords.length && (
              <span className="ml-1 text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-sm">filtered from {records.length}</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Rows selection */}
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>Rows per page:</span>
              <select
                id="select-rows-per-page"
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-xs focus:ring-1 focus:ring-slate-900"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Prev/Next buttons */}
            <div className="flex items-center gap-1">
              <button
                id="btn-prev-page"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                id="btn-next-page"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
