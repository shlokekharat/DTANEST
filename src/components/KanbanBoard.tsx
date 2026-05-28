/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Trash, User, Sparkles, MoveRight, ArrowRightLeft } from 'lucide-react';
import { SchemaType, DatabaseRecord } from '../types';

interface KanbanBoardProps {
  schema: SchemaType;
  records: DatabaseRecord[];
  onUpdateRecordStatus: (id: string, fieldKey: string, newStatus: string) => void;
  onEditRecord: (record: DatabaseRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export default function KanbanBoard({
  schema,
  records,
  onUpdateRecordStatus,
  onEditRecord,
  onDeleteRecord
}: KanbanBoardProps) {
  // Retrieve the Kanban group field definition from schema fields
  const kanbanField = useMemo(() => {
    return schema.fields.find(f => f.key === schema.kanbanFieldKey);
  }, [schema]);

  const columnsList = useMemo(() => {
    if (kanbanField && kanbanField.type === 'select' && kanbanField.options) {
      return kanbanField.options;
    }
    // Fallback/Draft columns if no select definitions are found
    return ['General Queue'];
  }, [kanbanField]);

  // Group records into state columns
  const columnRecordsMap = useMemo(() => {
    const groups: Record<string, DatabaseRecord[]> = {};
    columnsList.forEach(col => {
      groups[col] = [];
    });
    groups['Unassigned'] = [];

    records.forEach(rec => {
      const currentVal = rec[schema.kanbanFieldKey];
      if (currentVal && groups[currentVal]) {
        groups[currentVal].push(rec);
      } else {
        groups['Unassigned'].push(rec);
      }
    });

    return groups;
  }, [records, columnsList, schema]);

  // Shift/Transition a card value left or right in the workflow index
  const handleMoveCard = (id: string, currentVal: string, dir: 'left' | 'right') => {
    if (!kanbanField?.options) return;
    const ops = kanbanField.options;
    const currentIndex = ops.indexOf(currentVal);
    
    let nextIndex = currentIndex;
    if (dir === 'left') {
      nextIndex = currentIndex - 1;
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= 0 && nextIndex < ops.length) {
      onUpdateRecordStatus(id, schema.kanbanFieldKey, ops[nextIndex]);
    }
  };

  // Helper to extract a dynamic secondary field to display underneath the title
  const getSecondaryDetails = (rec: DatabaseRecord) => {
    const keysToTry = ['role', 'department', 'category', 'director', 'genre', 'email', 'price'];
    const fieldsFound: string[] = [];

    keysToTry.forEach(k => {
      if (rec[k] !== undefined && rec[k] !== null && rec[k] !== '') {
        if (k === 'price') {
          fieldsFound.push(`$${rec[k]}`);
        } else {
          fieldsFound.push(String(rec[k]));
        }
      }
    });

    return fieldsFound.slice(0, 2).join(' • ');
  };

  // Status-colored headers
  const getColumnColorText = (colName: string) => {
    const col = colName.toLowerCase();
    if (['onboarded', 'in stock', 'finished review', 'completed', 'active'].some(x => col.includes(x))) {
      return 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
    }
    if (['low stock', 'remote only', 'contractor', 'on leave', 'queued next', 'executing reorder', 'watching'].some(x => col.includes(x))) {
      return 'text-amber-700 bg-amber-50 border-amber-200/50';
    }
    if (['terminated', 'out of stock', 'discontinued', 'on hold'].some(x => col.includes(x))) {
      return 'text-red-700 bg-red-50 border-red-200/50';
    }
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  return (
    <div id="kanban-view" className="space-y-4">
      {/* Intro info bar */}
      <div id="kanban-info-bar" className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-slate-400" />
          <span>Showing records structured in sequential stages grouped by column: <strong className="text-slate-700 capitalize font-medium">{kanbanField?.name || schema.kanbanFieldKey}</strong>.</span>
        </div>
        <span className="hidden md:inline font-mono">DRAG/CLICK ARROWS TO TRANSITION WORKFLOWS</span>
      </div>

      {/* Grid columns view list */}
      <div id="columns-scroller" className="flex gap-4 overflow-x-auto pb-4 snap-x select-none">
        {columnsList.map((colName) => {
          const colRecords = columnRecordsMap[colName] || [];
          const headerStyles = getColumnColorText(colName);

          return (
            <div 
              id={`kanban-col-${colName.replace(/\s+/g, '-').toLowerCase()}`}
              key={colName} 
              className="flex-1 min-w-[280px] max-w-[340px] bg-slate-50/60 rounded-2xl border border-slate-200/50 p-4 shrink-0 snap-align-start flex flex-col h-[520px] shadow-3xs"
            >
              {/* Header Title count */}
              <div id="col-header" className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/40">
                <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold font-sans tracking-wide truncate max-w-[80%] ${headerStyles}`}>
                  {colName}
                </div>
                <span className="text-xs bg-white border border-slate-200 font-bold font-mono text-slate-500 px-2 py-0.5 rounded-full shadow-3xs">
                  {colRecords.length}
                </span>
              </div>

              {/* Stack items container */}
              <div 
                id="cards-stack"
                className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200"
              >
                {colRecords.length === 0 ? (
                  <div id="col-empty" className="h-[120px] rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                    <Sparkles className="w-5 h-5 text-slate-300 stroke-[1.5] mb-1" />
                    <span className="text-[11px] font-semibold text-slate-400">Empty Column</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Move cards here</p>
                  </div>
                ) : (
                  colRecords.map((item) => {
                    const primaryVal = item[schema.primaryFieldKey];
                    const leftDisabled = kanbanField?.options ? kanbanField.options.indexOf(colName) === 0 : true;
                    const rightDisabled = kanbanField?.options ? kanbanField.options.indexOf(colName) === kanbanField.options.length - 1 : true;

                    return (
                      <div
                        id={`kanban-card-${item.id}`}
                        key={item.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-350 shadow-2xs hover:shadow-xs hover:-translate-y-[1px] transition-all duration-200 group flex flex-col justify-between"
                      >
                        {/* Upper card core label */}
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <span 
                              onClick={() => onEditRecord(item)}
                              className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer capitalize break-words line-clamp-2 max-w-[85%]"
                            >
                              {primaryVal !== undefined ? String(primaryVal) : 'Untitled Item'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono tracking-tighter self-start uppercase">
                              #{item.id.split('-')[1] || item.id.substring(0, 4)}
                            </span>
                          </div>

                          {/* Subtitles metadata formatting */}
                          <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                            {getSecondaryDetails(item)}
                          </p>

                          {/* Special badge overlays depending on contents */}
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {Object.entries(item).map(([key, val]) => {
                              // If value is boolean, show an inline stamp badge on the footer of card
                              if (typeof val === 'boolean' && key !== 'id') {
                                return (
                                  <span key={key} className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-sm border uppercase ${
                                    val ? 'bg-indigo-50 border-indigo-150 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                                  }`}>
                                    {key}: {val ? 'Yes' : 'No'}
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>

                        {/* Slide and Settings controls bottom bar */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100/75 flex items-center justify-between">
                          {/* Inner edit actions */}
                          <div className="flex gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                            <button
                              id={`card-edit-${item.id}`}
                              onClick={() => onEditRecord(item)}
                              title="Edit Details"
                              className="p-1 hover:bg-slate-100 hover:text-slate-800 text-slate-400 rounded-md transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`card-del-${item.id}`}
                              onClick={() => {
                                if (window.confirm('Delete this record?')) {
                                  onDeleteRecord(item.id);
                                }
                              }}
                              title="Delete Record"
                              className="p-1 hover:bg-slate-100 hover:text-rose-600 text-slate-400 rounded-md transition-colors"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Navigation workflow trigger anchors */}
                          {kanbanField && kanbanField.options && (
                            <div className="flex items-center gap-1">
                              <button
                                id={`card-move-left-${item.id}`}
                                onClick={() => handleMoveCard(item.id, colName, 'left')}
                                disabled={leftDisabled}
                                title="Move Column Left"
                                className="p-1 hover:bg-slate-100 hover:text-slate-900 border border-transparent disabled:opacity-30 text-slate-400 rounded-md transition-colors disabled:hover:bg-transparent"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              <button
                                id={`card-move-right-${item.id}`}
                                onClick={() => handleMoveCard(item.id, colName, 'right')}
                                disabled={rightDisabled}
                                title="Move Column Right"
                                className="p-1 hover:bg-slate-100 hover:text-slate-900 border border-transparent disabled:opacity-30 text-slate-400 rounded-md transition-colors disabled:hover:bg-transparent"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
