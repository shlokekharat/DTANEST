/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Plus, Download, Upload, Trash2, RefreshCw, 
  Layers, Users, Package, Clapperboard, Columns, BarChart3, 
  Settings, Activity, Sparkles, CheckSquare, ShieldCheck, AlertCircle 
} from 'lucide-react';

import { 
  SchemaType, DatabaseRecord, AppDatabase, ViewMode, AuditLogEntry 
} from './types';

import { 
  INITIAL_SCHEMAS, INITIAL_RECORDS 
} from './mockData';

// Subcomponents imports
import DBTable from './components/DBTable';
import KanbanBoard from './components/KanbanBoard';
import MetricsPanel from './components/MetricsPanel';
import SchemaManager from './components/SchemaManager';
import RecordDrawer from './components/RecordDrawer';
import AuthPage from './components/AuthPage';
import ProfileDrawer from './components/ProfileDrawer';
import LandingPage from './components/LandingPage';
import { UserSession } from './types';
import { getCurrentSession, saveSession } from './utils/auth';
import { LogOut, User as UserIcon, ArrowUpRight } from 'lucide-react';

export default function App() {
  // Website or Platform Router switcher state
  const [showMarketingWebsite, setShowMarketingWebsite] = useState(true);
  // Authentication & session management states
  const [session, setSession] = useState<UserSession | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  // 1. Core Databases & Configuration State
  const [schemas, setSchemas] = useState<SchemaType[]>([]);
  const [activeSchemaId, setActiveSchemaId] = useState<string>('employees');
  const [recordsMap, setRecordsMap] = useState<Record<string, DatabaseRecord[]>>({});
  
  // 2. Navigation / UI state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // 3. active CRUD model drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DatabaseRecord | null>(null);

  // Hidden file inputs identifier pointer
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Success Notification alerts
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 4. Boostrap and LocalStorage Loader
  useEffect(() => {
    // Load Authentication Session
    const activeSession = getCurrentSession();
    if (activeSession) {
      setSession(activeSession);
    }

    // a. Load Schemas
    const cachedSchemas = localStorage.getItem('crud_schemas');
    let loadedSchemas: SchemaType[] = [];
    if (cachedSchemas) {
      try {
        loadedSchemas = JSON.parse(cachedSchemas);
      } catch (e) {
        console.error('Failed to parse cached schemas, reverting to defaults.');
      }
    }
    if (!loadedSchemas || loadedSchemas.length === 0) {
      loadedSchemas = INITIAL_SCHEMAS;
      localStorage.setItem('crud_schemas', JSON.stringify(INITIAL_SCHEMAS));
    }
    setSchemas(loadedSchemas);

    // b. Load Record Maps
    const cachedRecords = localStorage.getItem('crud_records_map');
    let loadedRecordsMap: Record<string, DatabaseRecord[]> = {};
    if (cachedRecords) {
      try {
        loadedRecordsMap = JSON.parse(cachedRecords);
      } catch (e) {
        console.error('Failed to parse cached records map, reverting to defaults.');
      }
    }
    if (!loadedRecordsMap || Object.keys(loadedRecordsMap).length === 0) {
      loadedRecordsMap = INITIAL_RECORDS;
      localStorage.setItem('crud_records_map', JSON.stringify(INITIAL_RECORDS));
    }
    setRecordsMap(loadedRecordsMap);

    // c. Load audit trails logs list
    const cachedLogs = localStorage.getItem('crud_audit_logs');
    if (cachedLogs) {
      try {
        setAuditLogs(JSON.parse(cachedLogs));
      } catch (e) {}
    } else {
      // Seed initial audit log item
      const initialLog: AuditLogEntry = {
        id: `log-seed-${Date.now()}`,
        timestamp: new Date().toISOString(),
        schemaId: 'system',
        schemaName: 'System Engine',
        action: 'reset',
        details: 'Universal CRUD Playground initialized successfully. Welcome Shlok!'
      };
      setAuditLogs([initialLog]);
      localStorage.setItem('crud_audit_logs', JSON.stringify([initialLog]));
    }
  }, []);

  // Save changes helper utilities
  const persistState = (newSchemas: SchemaType[], newRecordsMap: Record<string, DatabaseRecord[]>) => {
    setSchemas(newSchemas);
    setRecordsMap(newRecordsMap);
    localStorage.setItem('crud_schemas', JSON.stringify(newSchemas));
    localStorage.setItem('crud_records_map', JSON.stringify(newRecordsMap));
  };

  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const activeSchema = useMemo(() => {
    return schemas.find((s) => s.id === activeSchemaId) || schemas[0];
  }, [schemas, activeSchemaId]);

  const activeRecords = useMemo(() => {
    return recordsMap[activeSchemaId] || [];
  }, [recordsMap, activeSchemaId]);

  // Log audit helper logger
  const writeLog = (schemaId: string, schemaName: string, action: AuditLogEntry['action'], details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      schemaId,
      schemaName,
      action,
      details
    };
    setAuditLogs((prev) => {
      const updated = [newEntry, ...prev].slice(0, 50); // limit logs stack size
      localStorage.setItem('crud_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // 5. Schema operations handlings
  const handleSelectSchema = (id: string) => {
    setActiveSchemaId(id);
    setViewMode('table');
    triggerNotification(`Switched database active context to: ${schemas.find((s) => s.id === id)?.name || 'Custom Table'}`, 'info');
  };

  const handleCreateCustomSchema = (newSchema: SchemaType) => {
    const updatedSchemas = [...schemas, newSchema];
    // Seed custom table records with 2 default sample objects to look polished immediately
    const firstSeedRecord: DatabaseRecord = {
      id: `rec-${newSchema.id}-seed1`,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString()
    };
    
    // Inject dynamic mock entries
    newSchema.fields.forEach((field) => {
      if (field.type === 'text') {
        firstSeedRecord[field.key] = `Demo ${field.name}`;
      } else if (field.type === 'number') {
        firstSeedRecord[field.key] = field.key.includes('rating') ? 8 : 42;
      } else if (field.type === 'select') {
        firstSeedRecord[field.key] = field.options?.[0] || '';
      } else if (field.type === 'date') {
        firstSeedRecord[field.key] = '2026-05-28';
      } else if (field.type === 'boolean') {
        firstSeedRecord[field.key] = true;
      }
    });

    const updatedRecordsMap = {
      ...recordsMap,
      [newSchema.id]: [firstSeedRecord]
    };

    persistState(updatedSchemas, updatedRecordsMap);
    setActiveSchemaId(newSchema.id);
    setViewMode('table');
    writeLog(newSchema.id, newSchema.name, 'create', `New custom database schema "${newSchema.name}" was provisioned.`);
    triggerNotification(`Database "${newSchema.name}" successfully provisioned with seed values!`, 'success');
  };

  const handleDeleteCustomSchema = (schemaIdToDelete: string) => {
    const schToDelete = schemas.find(s => s.id === schemaIdToDelete);
    if (!schToDelete) return;

    const updatedSchemas = schemas.filter(s => s.id !== schemaIdToDelete);
    const updatedRecordsMap = { ...recordsMap };
    delete updatedRecordsMap[schemaIdToDelete];
    
    // Fallback switch to employees
    persistState(updatedSchemas, updatedRecordsMap);
    setActiveSchemaId('employees');
    setViewMode('table');
    writeLog(schemaIdToDelete, schToDelete.name, 'delete', `Custom database schema "${schToDelete.name}" was deleted.`);
    triggerNotification(`Database "${schToDelete.name}" was deleted permanently from browser local memory.`, 'info');
  };


  // 6. Records operations (CRUD details)
  const handleOpenCreateDrawer = () => {
    setEditingRecord(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (record: DatabaseRecord) => {
    setEditingRecord(record);
    setIsDrawerOpen(true);
  };

  const handleSaveRecord = (partialRecord: Partial<DatabaseRecord>) => {
    const activeList = [...activeRecords];

    if (editingRecord) {
      // a. UPDATE
      const index = activeList.findIndex((r) => r.id === editingRecord.id);
      if (index !== -1) {
        const updatedRecord: DatabaseRecord = {
          ...activeList[index],
          ...partialRecord,
          _updatedAt: new Date().toISOString()
        };
        activeList[index] = updatedRecord;

        const updatedMap = {
          ...recordsMap,
          [activeSchemaId]: activeList
        };
        setRecordsMap(updatedMap);
        localStorage.setItem('crud_records_map', JSON.stringify(updatedMap));

        // Audit Trail Details
        const mainFieldVal = updatedRecord[activeSchema.primaryFieldKey] || updatedRecord.id;
        writeLog(
          activeSchemaId,
          activeSchema.name,
          'update',
          `Modified record details for item "${mainFieldVal}" in tabular database directory.`
        );
        triggerNotification(`Value "${mainFieldVal}" updated successfully.`, 'success');
      }
    } else {
      // b. CREATE
      const newRecord: DatabaseRecord = {
        ...partialRecord,
        id: `rec-${activeSchemaId}-${Date.now()}`,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };
      activeList.unshift(newRecord); // add to top of rows

      const updatedMap = {
        ...recordsMap,
        [activeSchemaId]: activeList
      };
      setRecordsMap(updatedMap);
      localStorage.setItem('crud_records_map', JSON.stringify(updatedMap));

      const mainFieldVal = newRecord[activeSchema.primaryFieldKey] || newRecord.id;
      writeLog(
        activeSchemaId,
        activeSchema.name,
        'create',
        `Appended standard record row for item "${mainFieldVal}" in tabular database directory.`
      );
      triggerNotification(`New item "${mainFieldVal}" created successfully.`, 'success');
    }
  };

  const handleDeleteRecord = (id: string) => {
    const activeList = [...activeRecords];
    const itemToDelete = activeList.find((r) => r.id === id);
    const mainFieldVal = itemToDelete ? (itemToDelete[activeSchema.primaryFieldKey] || id) : id;

    const filtered = activeList.filter((r) => r.id !== id);
    const updatedMap = {
      ...recordsMap,
      [activeSchemaId]: filtered
    };

    setRecordsMap(updatedMap);
    localStorage.setItem('crud_records_map', JSON.stringify(updatedMap));

    writeLog(activeSchemaId, activeSchema.name, 'delete', `Deleted row item "${mainFieldVal}" from columns.`);
    triggerNotification(`Item "${mainFieldVal}" deleted successfully.`, 'info');
  };

  const handleBatchDeleteRecords = (ids: string[]) => {
    const activeList = [...activeRecords];
    const filtered = activeList.filter((r) => !ids.includes(r.id));
    
    const updatedMap = {
      ...recordsMap,
      [activeSchemaId]: filtered
    };

    setRecordsMap(updatedMap);
    localStorage.setItem('crud_records_map', JSON.stringify(updatedMap));

    writeLog(
      activeSchemaId,
      activeSchema.name,
      'delete',
      `Performed system bulk purge. Deleted ${ids.length} records instantly.`
    );
    triggerNotification(`Purged ${ids.length} selected items successfully!`, 'info');
  };

  const handleUpdateRecordStatus = (id: string, fieldKey: string, newStatus: string) => {
    const activeList = [...activeRecords];
    const index = activeList.findIndex((r) => r.id === id);
    if (index !== -1) {
      const updatedRecord: DatabaseRecord = {
        ...activeList[index],
        [fieldKey]: newStatus,
        _updatedAt: new Date().toISOString()
      };
      activeList[index] = updatedRecord;

      const updatedMap = {
        ...recordsMap,
        [activeSchemaId]: activeList
      };
      setRecordsMap(updatedMap);
      localStorage.setItem('crud_records_map', JSON.stringify(updatedMap));

      // Audit transition logged
      const title = updatedRecord[activeSchema.primaryFieldKey] || id;
      writeLog(
        activeSchemaId,
        activeSchema.name,
        'update',
        `Transitioned "${title}" pipeline stage status value to "${newStatus}" in Kanban view.`
      );
    }
  };


  // 7. Global Actions bar (Seeding defaults, Clear Database rows, JSON import/export)
  const handleResetToDefaults = () => {
    if (window.confirm(`Are you sure you want to restore "${activeSchema.name}" data to its pristine, system seed mock entries? All modern edits will be lost.`)) {
      const defaultedList = INITIAL_RECORDS[activeSchemaId] || [];
      const updatedMap = {
        ...recordsMap,
        [activeSchemaId]: JSON.parse(JSON.stringify(defaultedList)) // deep copy
      };
      setRecordsMap(updatedMap);
      localStorage.setItem('crud_records_map', JSON.stringify(updatedMap));

      writeLog(
        activeSchemaId,
        activeSchema.name,
        'reset',
        `Re-seeded structural mock elements template. Restored ${defaultedList.length} initial items.`
      );
      triggerNotification(`Database database items successfully re-seeded.`, 'success');
    }
  };

  const handleClearAllRecords = () => {
    if (window.confirm(`Are you absolutely sure you want to wipe OUT all data records in "${activeSchema.name}"? This tabular index will become totally empty.`)) {
      const updatedMap = {
        ...recordsMap,
        [activeSchemaId]: []
      };
      setRecordsMap(updatedMap);
      localStorage.setItem('crud_records_map', JSON.stringify(updatedMap));

      writeLog(
        activeSchemaId,
        activeSchema.name,
        'reset',
        `Wiped database directory. Cleared all database files and index parameters.`
      );
      triggerNotification(`All ${activeSchema.name} records purged. Ready for fresh inputs!`, 'info');
    }
  };

  const handleExportDatabaseJson = () => {
    // Generate JSON payload representing schema and elements
    const dbPayload: AppDatabase = {
      schema: activeSchema,
      records: activeRecords
    };
    
    const token = activeSchema.id.replace(/\s+/g, '-').toLowerCase();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crud_db_${token}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    writeLog(
      activeSchemaId,
      activeSchema.name,
      'import', // using import for data transfers
      `Compiled database schemas and record nodes down into single downloadable JSON package.`
    );
    triggerNotification(`Schema compiled and JSON packet downloaded successfully!`, 'success');
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImportDatabaseJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedPayload = JSON.parse(content) as AppDatabase;

        // Structured Integrity Check (Validate fields are defined)
        if (!parsedPayload.schema || !parsedPayload.schema.id || !parsedPayload.schema.fields || !Array.isArray(parsedPayload.records)) {
          throw new Error('Malformed schema packet. Required fields missing.');
        }

        const importedSchema = parsedPayload.schema;
        const importedRecords = parsedPayload.records;

        // Check if schema already exists, ask to overwrite
        let newSchemas = [...schemas];
        const existingSchemaIdx = schemas.findIndex(s => s.id === importedSchema.id);
        
        if (existingSchemaIdx !== -1) {
          if (!window.confirm(`Database schema with ID "${importedSchema.id}" ("${importedSchema.name}") already exists in block. Do you want to overwrite its layout and columns?`)) {
            return;
          }
          newSchemas[existingSchemaIdx] = importedSchema;
        } else {
          newSchemas.push(importedSchema);
        }

        const newRecordsMap = {
          ...recordsMap,
          [importedSchema.id]: importedRecords
        };

        persistState(newSchemas, newRecordsMap);
        setActiveSchemaId(importedSchema.id);
        setViewMode('table');

        writeLog(
          importedSchema.id,
          importedSchema.name,
          'import',
          `Restored / Imported schema parameters and ${importedRecords.length} records dynamically from JSON backup.`
        );
        triggerNotification(`Import complete! Loaded database "${importedSchema.name}" with ${importedRecords.length} items.`, 'success');

      } catch (err: any) {
        triggerNotification(`Parsing Failed: Selected file is not a valid CRUD Database export.`, 'error');
      }
    };
    fileReader.readAsText(file);
    // Clear target value to capture another selection
    e.target.value = '';
  };


  if (showMarketingWebsite) {
    return (
      <div id="landing-portal" className="bg-slate-50 min-h-screen relative font-sans">
        {notification && (
          <div 
            id="global-toast" 
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-lg animate-in slide-in-from-top duration-300 text-xs font-semibold ${
              notification.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-fadeIn' 
                : notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-250 animate-fadeIn'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-fadeIn'
            }`}
          >
            {notification.type === 'success' ? (
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
            ) : (
              <Sparkles className="w-4.5 h-4.5 text-indigo-650" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
        <LandingPage 
          onEnterConsole={() => setShowMarketingWebsite(false)}
          isLoggedIn={!!session}
          currentUserEmail={session?.user?.email}
          onLogout={() => {
            saveSession(null);
            setSession(null);
            triggerNotification(`Goodbye! Securely logged out.`, 'info');
          }}
          triggerNotification={triggerNotification}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div id="auth-unauth-layout" className="bg-slate-100 min-h-screen relative font-sans">
        {notification && (
          <div 
            id="global-toast" 
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-lg animate-in slide-in-from-top duration-300 text-xs font-semibold ${
              notification.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-fadeIn' 
                : notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-250 animate-fadeIn'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-fadeIn'
            }`}
          >
            {notification.type === 'success' ? (
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
            ) : (
              <Sparkles className="w-4.5 h-4.5 text-indigo-650" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
        <AuthPage 
          onLoginSuccess={(s) => setSession(s)} 
          triggerNotification={triggerNotification} 
          onGoBackToWebsite={() => setShowMarketingWebsite(true)}
        />
      </div>
    );
  }

  return (
    <div id="root-portal" className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-10">
      
      {/* Hidden file input element pointers */}
      <input 
        id="hidden-import-file"
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportDatabaseJson} 
        className="hidden" 
        accept=".json"
      />

      {/* Top Notification banner layout */}
      {notification && (
        <div 
          id="global-toast" 
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full border shadow-lg animate-in slide-in-from-top duration-300 text-xs font-semibold ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
          }`}
        >
          {notification.type === 'success' ? (
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
          ) : (
            <Sparkles className="w-4.5 h-4.5 text-indigo-650 animate-spin-slow" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Modern High-End Page Navigation Top Bar */}
      <header id="main-header" className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-205/60 z-30 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Brand visual header logos */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
            <Database className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[15px] font-extrabold tracking-tight text-slate-950 leading-none">
                DataNest Console
              </h1>
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">PRO</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded-sm inline-block mt-1">
              Active Table: <span className="text-slate-950">{activeSchema?.name}</span>
            </span>
          </div>
        </div>

        {/* Global Toolbar Actions (CSV/JSON and Resets) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Create Records triggers */}
          <button
            id="btn-trigger-insert"
            onClick={handleOpenCreateDrawer}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Insert Record
          </button>

          {/* Seed Defaults Mock */}
          <button
            id="btn-action-restore-mocks"
            onClick={handleResetToDefaults}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Restore Default Database Mock Seeds"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export database values */}
          <button
            id="btn-action-export-json"
            onClick={handleExportDatabaseJson}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Export Table Schema & Rows as JSON Backups"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON parameters file */}
          <button
            id="btn-action-import-json"
            onClick={handleTriggerFileInput}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Import/Restore Dynamic Database JSON file"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Purge database completely */}
          <button
            id="btn-action-truncate-table"
            onClick={handleClearAllRecords}
            disabled={activeRecords.length === 0}
            className="p-2 border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 disabled:hover:border-slate-200"
            title="Clear All Records Inside This Table"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* User Profile Widget with Dropdown */}
          <div className="relative flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-3 sm:pt-0 sm:pl-4">
            <button
              id="btn-shortcut-landing"
              onClick={() => setShowMarketingWebsite(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-slate-205 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-[11px] font-bold transition-all cursor-pointer mr-1"
              title="Return to DataNest Marketing Website Homepage"
            >
              <span>View Website</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </button>

            <button
              id="profile-dropdown-trigger"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 px-2.5 rounded-xl transition-all cursor-pointer focus:outline-hidden"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-inner uppercase"
                style={{ backgroundColor: session.user.avatarColor || '#2563eb' }}
              >
                {session.user.displayName ? session.user.displayName.split(' ').map(n=>n[0]).join('').substring(0,2) : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {session.user.displayName}
                </div>
                <div className="text-[10px] font-medium text-slate-400 capitalize -mt-0.5">
                  {session.user.role}
                </div>
              </div>
            </button>

            {/* User profile dropdown menu */}
            {showUserDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserDropdown(false)} 
                />
                <div 
                  id="user-dropdown" 
                  className="absolute right-0 top-11 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-1 text-xs animate-fadeIn font-sans"
                >
                  <div className="px-2.5 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-800 leading-tight">
                      {session.user.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {session.user.email}
                    </div>
                  </div>

                  <button
                    id="btn-back-to-landing-dropdown"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowMarketingWebsite(true);
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-indigo-50/50 text-indigo-700 rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-colors border-none"
                  >
                    <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    View Landing Website
                  </button>

                  <button
                    id="btn-trigger-profile-drawer"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setIsProfileOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-colors border-none"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    Edit Profile settings
                  </button>

                  <button
                    id="btn-execute-signout"
                    onClick={() => {
                      const userName = session.user.displayName;
                      setShowUserDropdown(false);
                      saveSession(null);
                      setSession(null);
                      triggerNotification(`Goodbye, ${userName}! Securely logged out.`, 'info');
                    }}
                    className="w-full text-left px-2.5 py-2 hover:bg-rose-50 text-rose-600 rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-colors border-none"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Sign Out Securely
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Core Content canvas split */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Dynamic selector banner layout */}
        <div id="perspective-switcher" className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          
          {/* Custom multi view modes layout */}
          <div className="flex bg-[#e2e8f0]/40 p-1 rounded-xl border border-slate-200/50 self-start">
            <button
              id="tab-view-table"
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-slate-950 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Table Grid
            </button>

            <button
              id="tab-view-kanban"
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-white text-slate-950 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Kanban Pipeline
            </button>

            <button
              id="tab-view-analytics"
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'analytics' 
                  ? 'bg-white text-slate-950 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              DB Analytics
            </button>

            <button
              id="tab-view-schema"
              onClick={() => setViewMode('schema')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'schema' 
                  ? 'bg-white text-slate-950 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Databases Setup
            </button>
          </div>

          {/* Quick info metrics counters */}
          <div id="quick-counter-pill" className="flex items-center gap-2.5 self-start bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-full text-xs text-slate-500">
            <Activity className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>Schema: <strong className="text-slate-800 font-bold capitalize">{activeSchema?.name}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Total Records: <strong className="text-slate-850 font-bold font-mono">{activeRecords.length}</strong></span>
          </div>
        </div>

        {/* Dynamic sub views routes */}
        <div id="tab-views-root">
          {viewMode === 'table' && (
            <DBTable
              schema={activeSchema}
              records={activeRecords}
              onEditRecord={handleOpenEditDrawer}
              onDeleteRecord={handleDeleteRecord}
              onBatchDeleteRecords={handleBatchDeleteRecords}
            />
          )}

          {viewMode === 'kanban' && (
            <KanbanBoard
              schema={activeSchema}
              records={activeRecords}
              onUpdateRecordStatus={handleUpdateRecordStatus}
              onEditRecord={handleOpenEditDrawer}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {viewMode === 'analytics' && (
            <MetricsPanel
              schema={activeSchema}
              records={activeRecords}
              auditLogs={auditLogs}
            />
          )}

          {viewMode === 'schema' && (
            <SchemaManager
              schemas={schemas}
              activeSchemaId={activeSchemaId}
              onSelectSchema={handleSelectSchema}
              onCreateCustomSchema={handleCreateCustomSchema}
              onDeleteCustomSchema={handleDeleteCustomSchema}
            />
          )}
        </div>
      </main>

      {/* Footer information bar */}
      <footer id="main-footer" className="bg-slate-50 border-t border-slate-200/80 py-4.5 px-6 text-xs text-slate-500 flex flex-col sm:flex-row gap-3 items-center justify-between mt-auto">
        <div>
          CRUD Database Interface
        </div>
        <div>
          All changes are seamlessly persisted locally.
        </div>
      </footer>

      {/* Bottom overlay sliding form context */}
      <RecordDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingRecord(null);
        }}
        schema={activeSchema}
        record={editingRecord}
        onSave={handleSaveRecord}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        session={session}
        onProfileUpdated={(updatedProfile) => {
          setSession({ ...session, user: updatedProfile });
        }}
        triggerNotification={triggerNotification}
        writeLog={writeLog}
      />
    </div>
  );
}
