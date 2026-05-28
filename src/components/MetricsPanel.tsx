/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, Users, DollarSign, Calendar, RefreshCw, BarChart2,
  PieChart, Activity, Layers, CheckCircle2, ShoppingBag, Eye 
} from 'lucide-react';
import { SchemaType, DatabaseRecord, AuditLogEntry } from '../types';

interface MetricsPanelProps {
  schema: SchemaType;
  records: DatabaseRecord[];
  auditLogs: AuditLogEntry[];
}

export default function MetricsPanel({ schema, records, auditLogs }: MetricsPanelProps) {
  
  // 1. Core KPIs
  const totalRecords = records.length;

  // 2. Compute dynamic numerical stats (Averages, Max, Sum)
  const numericalStats = useMemo(() => {
    const numFields = schema.fields.filter(f => f.type === 'number');
    const stats: Record<string, { sum: number; avg: number; max: number; min: number }> = {};

    numFields.forEach((field) => {
      const vals = records
        .map(r => Number(r[field.key]))
        .filter(v => !isNaN(v) && v !== undefined && v !== null);

      if (vals.length > 0) {
        const sum = vals.reduce((a, b) => a + b, 0);
        const avg = sum / vals.length;
        const max = Math.max(...vals);
        const min = Math.min(...vals);
        stats[field.key] = { sum, avg, max, min };
      } else {
        stats[field.key] = { sum: 0, avg: 0, max: 0, min: 0 };
      }
    });

    return { numFields, stats };
  }, [schema, records]);

  // 3. Compute Category Distribution (for Select inputs)
  const categoryDistributions = useMemo(() => {
    const selectFields = schema.fields.filter(f => f.type === 'select');
    const distributions: Record<string, Record<string, { count: number; percentage: number }>> = {};

    selectFields.forEach((field) => {
      distributions[field.key] = {};
      const fieldOptions = field.options || [];

      // Initialise all options with zero
      fieldOptions.forEach(opt => {
        distributions[field.key][opt] = { count: 0, percentage: 0 };
      });
      distributions[field.key]['Unspecified'] = { count: 0, percentage: 0 };

      // Count occurrences
      let validCount = 0;
      records.forEach(rec => {
        const val = rec[field.key];
        if (val) {
          if (!distributions[field.key][val]) {
            distributions[field.key][val] = { count: 0, percentage: 0 };
          }
          distributions[field.key][val].count += 1;
          validCount++;
        } else {
          distributions[field.key]['Unspecified'].count += 1;
          validCount++;
        }
      });

      // Calculate percentages
      if (validCount > 0) {
        Object.keys(distributions[field.key]).forEach(opt => {
          const count = distributions[field.key][opt].count;
          distributions[field.key][opt].percentage = Math.round((count / validCount) * 100);
        });
      }
    });

    return { selectFields, distributions };
  }, [schema, records]);

  // 4. Filter logs to current schema
  const filteredLogs = useMemo(() => {
    return auditLogs
      .filter(log => log.schemaId === schema.id)
      .slice(0, 6); // Only show recent 6 logs
  }, [auditLogs, schema]);

  // Format currency or general numerical attributes
  const formatNumberWithDetails = (val: number, key: string) => {
    const k = key.toLowerCase();
    if (k.includes('salary') || k.includes('price') || k.includes('compensation') || k.includes('cost')) {
      return `$${Math.round(val).toLocaleString()}`;
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  const getLogColorAction = (action: string) => {
    switch(action) {
      case 'create': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'update': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'delete': return 'bg-rose-50 text-rose-700 border-rose-150';
      default: return 'bg-slate-150 text-slate-700 border-slate-200';
    }
  };

  // Helper colors for distribution chart bars
  const barColors = [
    'bg-indigo-600',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-violet-500',
    'bg-fuchsia-500',
    'bg-amber-500'
  ];

  return (
    <div id="analytics-panel" className="space-y-6">
      
      {/* Upper core indicators grid */}
      <div id="metrics-summary-grid" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI: Total rows */}
        <div id="kpi-count" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center gap-4.5">
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Row Density</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {totalRecords}
              </span>
              <span className="text-xs font-medium text-slate-600">active items</span>
            </div>
          </div>
        </div>

        {/* Dynamic Numerical Stat #1: Sum or average of direct weights */}
        {numericalStats.numFields.length > 0 ? (
          (() => {
            const primaryNumField = numericalStats.numFields[0];
            const stats = numericalStats.stats[primaryNumField.key];
            const isCurrency = primaryNumField.key.toLowerCase().includes('salary') || primaryNumField.key.toLowerCase().includes('price');

            return (
              <div id="kpi-numeric-avg" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center gap-4.5">
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                  {isCurrency ? <DollarSign className="w-6 h-6" /> : <BarChart2 className="w-6 h-6" />}
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono truncate max-w-[190px]">
                    Avg {primaryNumField.name}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      {formatNumberWithDetails(stats.avg, primaryNumField.key)}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      <TrendingUp className="w-3 w-3 mr-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div id="kpi-numeric-fallback" className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 border-dashed shadow-3xs flex items-center gap-4 text-slate-400">
            <PieChart className="w-6 h-6 text-slate-300 stroke-[1.5]" />
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Aggregation KPI</span>
              <span className="text-xs text-slate-500 mt-1 block">No numerical columns in schema</span>
            </div>
          </div>
        )}

        {/* Dynamic Numerical Stat #2: Max values */}
        {numericalStats.numFields.length > 1 ? (
          (() => {
            const secondaryNumField = numericalStats.numFields[1];
            const stats = numericalStats.stats[secondaryNumField.key];

            return (
              <div id="kpi-secondary-numeric" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center gap-4.5">
                <div className="p-3 bg-amber-50 border border-amber-150 text-amber-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono truncate max-w-[190px]">
                    Total {secondaryNumField.name}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      {formatNumberWithDetails(stats.sum, secondaryNumField.key)}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-500 ml-1">Sum</span>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          // System logging logs audit log telemetry
          <div id="kpi-logs-preview" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center gap-4.5">
            <div className="p-3 bg-slate-100 border border-slate-250 text-slate-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Sessions Events</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  {auditLogs.length}
                </span>
                <span className="text-xs text-slate-500 font-medium font-mono">Triggers</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Middle Grid containing distributions and parameters */}
      <div id="metrics-charts-row" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category distribution charts */}
        <div id="chart-card-distributions" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col justify-between space-y-6">
          <div id="dist-header" className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Category Distributions</h3>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Adaptive bar chart</span>
          </div>

          <div id="dist-scroller" className="space-y-6 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin">
            {categoryDistributions.selectFields.length === 0 ? (
              <div id="no-dist" className="py-12 text-center text-slate-400 text-xs">
                <BarChart2 className="w-6 h-6 text-slate-300 stroke-[1.5] mx-auto mb-1.5" />
                <p className="font-semibold">No category column detected</p>
                <p className="text-[11px] mt-0.5 text-slate-400">Add a SELECT type field in Custom Schema builder.</p>
              </div>
            ) : (
              categoryDistributions.selectFields.map((field) => {
                const dist = (categoryDistributions.distributions[field.key] || {}) as Record<string, { count: number; percentage: number }>;
                const options = Object.entries(dist).filter(([opt, val]) => opt !== 'Unspecified' || val.count > 0);

                return (
                  <div id={`group-chart-${field.key}`} key={field.key} className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{field.name}</span>
                      <span className="text-[11px] font-medium text-slate-400 font-mono">Option Counts</span>
                    </div>

                    <div className="space-y-2.5">
                      {options.map(([optName, optVal], idx) => {
                        const colorClass = barColors[idx % barColors.length];
                        return (
                          <div id={`bar-${optName}`} key={optName} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                              <span className="truncate max-w-[200px]">{optName}</span>
                              <span className="font-semibold font-mono text-slate-800">
                                {optVal.count} ({optVal.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-800 ease-out-sine ${colorClass}`}
                                style={{ width: `${optVal.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic numerical summaries for all properties */}
        <div id="chart-card-minmax" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col justify-between space-y-6">
          <div id="minmax-header" className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Numerical Field Insights</h3>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Limits & spreads</span>
          </div>

          <div id="minmax-body" className="flex-1 overflow-y-auto max-h-[300px] space-y-4 pr-1 scrollbar-thin">
            {numericalStats.numFields.length === 0 ? (
              <div id="no-insights" className="py-12 text-center text-slate-400 text-xs">
                <PieChart className="w-6 h-6 text-slate-300 stroke-[1.5] mx-auto mb-1.5" />
                <p className="font-semibold">No numerical columns found</p>
                <p className="text-[11px] mt-0.5 text-slate-400">Add a NUMBER key field inside schema configurations.</p>
              </div>
            ) : (
              numericalStats.numFields.map((field) => {
                const stats = numericalStats.stats[field.key] || { sum: 0, avg: 0, max: 0, min: 0 };
                const isCurrency = field.key.toLowerCase().includes('salary') || field.key.toLowerCase().includes('price');

                return (
                  <div id={`insight-field-${field.key}`} key={field.key} className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-150">
                    <div className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
                      Column: <span className="text-indigo-600">{field.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">Min Span</span>
                        <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">
                          {formatNumberWithDetails(stats.min, field.key)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">Max Peak</span>
                        <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block animate-pulse-once">
                          {formatNumberWithDetails(stats.max, field.key)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">Cumulative SUM</span>
                        <span className="text-sm font-extrabold text-slate-850 font-mono mt-0.5 block">
                          {formatNumberWithDetails(stats.sum, field.key)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200/60">
                        <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">Median Average</span>
                        <span className="text-sm font-bold text-slate-850 font-mono mt-0.5 block">
                          {formatNumberWithDetails(stats.avg, field.key)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Audit Event Feeds section */}
      <div id="metrics-audi-logs" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col justify-between">
        <div id="audit-header" className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Dynamic DB Telemetry logs</h3>
          </div>
          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-sm font-bold px-1.5 py-0.5 uppercase tracking-wide">Live Stream</span>
        </div>

        {/* List of event boxes */}
        <div id="audit-list" className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div id="logs-empty" className="py-6 text-center text-slate-400 text-xs text-sans">
              No state transitions recorded in this session. Add or update records to populate logs.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                id={`log-row-${log.id}`}
                key={log.id} 
                className="flex items-start md:items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50 text-xs transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  {/* Action badge tag */}
                  <span className={`px-2 py-0.5 rounded-sm border text-[10px] uppercase font-mono font-bold tracking-wider self-start md:self-auto ${getLogColorAction(log.action)}`}>
                    {log.action}
                  </span>
                  
                  {/* Details text describing modifications */}
                  <span className="text-slate-600 break-words max-w-[280px] md:max-w-[420px]">
                    {log.details}
                  </span>
                </div>

                {/* Date indicator */}
                <span className="text-[10px] font-mono text-slate-400 self-start md:self-auto shrink-0 pl-2">
                  {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
