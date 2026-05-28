/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, Users, Package, Clapperboard, Plus, Trash2, 
  Settings, FolderPlus, Info, Check, Sparkles, HelpCircle 
} from 'lucide-react';
import { SchemaType, FieldDefinition, FieldValueType } from '../types';

interface SchemaManagerProps {
  schemas: SchemaType[];
  activeSchemaId: string;
  onSelectSchema: (id: string) => void;
  onCreateCustomSchema: (newSchema: SchemaType) => void;
  onDeleteCustomSchema: (id: string) => void;
}

// Icon list options for schema representation
const ICON_POOL = [
  { name: 'Database', icon: Database },
  { name: 'Users', icon: Users },
  { name: 'Package', icon: Package },
  { name: 'Clapperboard', icon: Clapperboard }
];

export default function SchemaManager({
  schemas,
  activeSchemaId,
  onSelectSchema,
  onCreateCustomSchema,
  onDeleteCustomSchema
}: SchemaManagerProps) {
  // Mode togglers
  const [isCreating, setIsCreating] = useState(false);

  // Schema form state
  const [schemaName, setSchemaName] = useState('');
  const [schemaDesc, setSchemaDesc] = useState('');
  const [schemaIconName, setSchemaIconName] = useState('Database');
  
  // Field constructor states
  const [fields, setFields] = useState<FieldDefinition[]>([
    { key: 'title', name: 'Item Title', type: 'text', required: true, placeholder: 'e.g. Project Apollo' }
  ]);

  // Temp field state for active drafting input
  const [tempFieldName, setTempFieldName] = useState('');
  const [tempFieldType, setTempFieldType] = useState<FieldValueType>('text');
  const [tempFieldOptionsStr, setTempFieldOptionsStr] = useState('');
  const [tempFieldRequired, setTempFieldRequired] = useState(true);

  // Constraint key targets
  const [primaryFieldKey, setPrimaryFieldKey] = useState('title');
  const [kanbanFieldKey, setKanbanFieldKey] = useState('');

  // Auto-generate keys based on field name string input
  const sanitizeKeyName = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, 'CamelCase')
      .replace(/^(.)/, (match) => match.toLowerCase()); // convert to camelCase
  };

  const handleAddFieldDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFieldName.trim()) return;

    const generatedKey = sanitizeKeyName(tempFieldName);

    // Check duplicate keys
    if (fields.some(f => f.key === generatedKey)) {
      alert('A column with a similar name already exists! Enter a distinct name.');
      return;
    }

    // Explode select options
    let parsedOptions: string[] | undefined = undefined;
    if (tempFieldType === 'select') {
      if (!tempFieldOptionsStr.trim()) {
        alert('Please fill in some comma-separated options list (e.g. Active, Pending, Closed).');
        return;
      }
      parsedOptions = tempFieldOptionsStr
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
    }

    const newField: FieldDefinition = {
      key: generatedKey,
      name: tempFieldName.trim(),
      type: tempFieldType,
      required: tempFieldRequired,
      options: parsedOptions,
      placeholder: tempFieldType === 'number' ? 'e.g. 50' : `Enter ${tempFieldName.toLowerCase()}...`
    };

    setFields(prev => [...prev, newField]);
    
    // Auto-update default configurations
    if (tempFieldType === 'select') {
      setKanbanFieldKey(generatedKey);
    }

    // Reset Drafting fields inputs
    setTempFieldName('');
    setTempFieldOptionsStr('');
    setTempFieldRequired(true);
  };

  const handleRemoveFieldDraft = (keyToRemove: string) => {
    if (keyToRemove === 'title' || keyToRemove === primaryFieldKey) {
      alert('Primary identifying field key cannot be deleted.');
      return;
    }
    setFields(prev => prev.filter(f => f.key !== keyToRemove));
    if (kanbanFieldKey === keyToRemove) {
      setKanbanFieldKey('');
    }
  };

  const handleSaveSchema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemaName.trim()) {
      alert('Please fill in a name for your custom database schema.');
      return;
    }
    if (fields.length === 0) {
      alert('A database requires at least one field column definition.');
      return;
    }

    // Create unique ID
    const schemaId = sanitizeKeyName(schemaName) || `db-custom-${Date.now()}`;

    // Schema compilation
    const completedCustomSchema: SchemaType = {
      id: schemaId,
      name: schemaName.trim(),
      description: schemaDesc.trim() || 'User-provisioned client custom database schema configuration.',
      iconName: schemaIconName,
      fields: fields,
      primaryFieldKey: primaryFieldKey || fields[0].key,
      kanbanFieldKey: kanbanFieldKey || fields.find(f => f.type === 'select')?.key || fields[0].key
    };

    onCreateCustomSchema(completedCustomSchema);

    // Reset whole form state
    setSchemaName('');
    setSchemaDesc('');
    setSchemaIconName('Database');
    setFields([{ key: 'title', name: 'Item Title', type: 'text', required: true, placeholder: 'e.g. Project Alpha' }]);
    setPrimaryFieldKey('title');
    setKanbanFieldKey('');
    setIsCreating(false);
  };

  const renderIconComponent = (name: string, props: any) => {
    switch (name) {
      case 'Users': return <Users {...props} />;
      case 'Package': return <Package {...props} />;
      case 'Clapperboard': return <Clapperboard {...props} />;
      default: return <Database {...props} />;
    }
  };

  return (
    <div id="schema-manager-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Dynamic database selection list */}
      <div id="selection-list-panel" className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col justify-between space-y-4">
        <div className="space-y-4 flex-1">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              Active Databases
            </h3>
            <span className="text-[10px] bg-slate-100 font-bold font-mono text-slate-500 px-2 py-0.5 rounded-full">
              {schemas.length}
            </span>
          </div>

          <div id="schema-cards-container" className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin">
            {schemas.map((sch) => {
              const isActive = sch.id === activeSchemaId;
              const isBaseDefault = ['employees', 'products', 'movies'].includes(sch.id);

              return (
                <div 
                  id={`schema-btn-${sch.id}`}
                  key={sch.id}
                  onClick={() => onSelectSchema(sch.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 group relative flex items-start gap-3.5 ${
                    isActive 
                      ? 'bg-slate-900 border-slate-950 text-white' 
                      : 'bg-[#fcfdfe]/30 border-slate-200/80 hover:bg-slate-50/50 hover:border-slate-350 text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                    isActive ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:bg-slate-100'
                  }`}>
                    {renderIconComponent(sch.iconName, { className: "w-4.5 h-4.5" })}
                  </div>

                  <div className="space-y-1 pr-6 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-[13px] leading-tight">
                      <span className="truncate block font-sans">{sch.name}</span>
                      {!isBaseDefault && (
                        <span className={`text-[9px] font-sans px-1.5 py-0.2 rounded border uppercase shrink-0 ${
                          isActive ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-indigo-50 border-indigo-150 text-indigo-700'
                        }`}>
                          Custom
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {sch.description}
                    </p>
                  </div>

                  {/* Active selection tick */}
                  {isActive && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 bg-white text-slate-900 rounded-full">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}

                  {/* Delete button option for custom schemas */}
                  {!isBaseDefault && !isActive && (
                    <button
                      id={`btn-del-schema-${sch.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to permanently provision and delete "${sch.name}"? All rows inside will be discarded.`)) {
                          onDeleteCustomSchema(sch.id);
                        }
                      }}
                      className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Schema"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Builder dynamic switch */}
        {!isCreating && (
          <button
            id="btn-trigger-schema-builder"
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            Provision New Database
          </button>
        )}
      </div>

      {/* Database Setup & Builder panel */}
      <div id="builder-canvas-panel" className="lg:col-span-2">
        {isCreating ? (
          <div id="schema-builder" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6 animate-in fade-in duration-250">
            <div id="builder-header" className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <FolderPlus className="w-4.5 h-4.5 text-indigo-600" />
                  Custom Schema Architect
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Design a custom database layout by defining columns.</p>
              </div>
              <button
                id="btn-cancel-schema-builder"
                onClick={() => setIsCreating(false)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel Setup
              </button>
            </div>

            {/* Base definitions form */}
            <form onSubmit={handleSaveSchema} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="input-schema-name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Database Name *</label>
                  <input
                    id="input-schema-name"
                    type="text"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-2xs focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    placeholder="e.g. Customer Inquiries"
                    value={schemaName}
                    onChange={(e) => setSchemaName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="input-schema-icon" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visual Icon</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {ICON_POOL.map((item) => (
                      <button
                        id={`btn-icon-${item.name}`}
                        key={item.name}
                        type="button"
                        onClick={() => setSchemaIconName(item.name)}
                        className={`p-2 rounded-lg border transition-all ${
                          schemaIconName === item.name 
                            ? 'bg-slate-900 text-white border-slate-950 shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
                        }`}
                        title={item.name}
                      >
                        <item.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label htmlFor="input-schema-desc" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <input
                    id="input-schema-desc"
                    type="text"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-2xs focus:outline-hidden focus:border-slate-900"
                    placeholder="A concise description outlining database responsibilities..."
                    value={schemaDesc}
                    onChange={(e) => setSchemaDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic schema columns definition area */}
              <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-4">
                <div className="border-b border-indigo-100 pb-2 flex items-baseline justify-between">
                  <span className="text-[12px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Insert Columns Def
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Dynamic parsing</span>
                </div>

                {/* Sub form to add a column draft */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2 space-y-1.5">
                    <label htmlFor="input-col-name" className="block text-[10px] font-bold text-slate-600">Column Label</label>
                    <input
                      id="input-col-name"
                      type="text"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800"
                      placeholder="e.g. Employee Role, Priority, Date"
                      value={tempFieldName}
                      onChange={(e) => setTempFieldName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-col-type" className="block text-[10px] font-bold text-slate-600">Type Category</label>
                    <select
                      id="input-col-type"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-800"
                      value={tempFieldType}
                      onChange={(e) => setTempFieldType(e.target.value as FieldValueType)}
                    >
                      <option value="text">Text (Short String)</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown (Selections)</option>
                      <option value="date">Calendar Date</option>
                      <option value="boolean">Toggle Boolean</option>
                    </select>
                  </div>

                  <button
                    id="btn-add-column-draft"
                    type="button"
                    onClick={handleAddFieldDraft}
                    className="py-1.5 px-3.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Column
                  </button>

                  {tempFieldType === 'select' && (
                    <div className="md:col-span-4 space-y-1.5 mt-2 bg-indigo-50/20 p-2.5 rounded-lg border border-indigo-100 border-dashed animate-in slide-in-from-top duration-200">
                      <label htmlFor="input-col-options" className="block text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-indigo-500" />
                        Options lists (Separated by commas) *
                      </label>
                      <input
                        id="input-col-options"
                        type="text"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden"
                        placeholder="e.g. Critical, Moderate, Low, Backlog"
                        value={tempFieldOptionsStr}
                        onChange={(e) => setTempFieldOptionsStr(e.target.value)}
                      />
                      <span className="text-[9px] text-slate-400 block line-clamp-1">Providing this list allows you to filters rows neatly and group cards in Kanban stages!</span>
                    </div>
                  )}
                </div>

                {/* Grid columns preview checklist */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Schema Columns Blueprint</span>
                  <div id="blueprint-chips-container" className="flex flex-wrap gap-2.5">
                    {fields.map((field) => {
                      const isMainKey = field.key === primaryFieldKey;
                      const isKanbanKey = field.key === kanbanFieldKey;

                      return (
                        <div 
                          id={`blueprint-chip-${field.key}`}
                          key={field.key} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 font-mono text-xs shadow-2xs hover:border-slate-350"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 font-sans">{field.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{field.type}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 ml-2.5 border-l border-slate-100 pl-2 shrink-0">
                            {/* Selection badges */}
                            {isMainKey && <span className="bg-indigo-50 text-indigo-600 text-[8px] font-sans font-bold px-1 rounded uppercase">Primary</span>}
                            {isKanbanKey && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-sans font-bold px-1 rounded uppercase">Pipeline</span>}
                            
                            {/* Delete button (except base identifier) */}
                            {field.key !== 'title' && (
                              <button
                                id={`btn-remove-blueprint-${field.key}`}
                                type="button"
                                onClick={() => handleRemoveFieldDraft(field.key)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded-sm hover:bg-slate-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selector setup fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="select-primary-key" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Column *</label>
                  <select
                    id="select-primary-key"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                    value={primaryFieldKey}
                    onChange={(e) => setPrimaryFieldKey(e.target.value)}
                  >
                    {fields.map(f => (
                      <option key={f.key} value={f.key}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="select-kanban-key" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pipeline Column</label>
                  <select
                    id="select-kanban-key"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                    value={kanbanFieldKey}
                    onChange={(e) => setKanbanFieldKey(e.target.value)}
                  >
                    <option value="">No Kanban Board grouped</option>
                    {fields.map(f => (
                      <option key={f.key} value={f.key}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  id="btn-dismiss-builder"
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Discard Setup
                </button>
                <button
                  id="btn-provision-database"
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  Provision Database
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div id="selection-details-card" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col justify-between h-full min-h-[300px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                  {renderIconComponent(schemas.find(s => s.id === activeSchemaId)?.iconName || 'Database', { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 flex items-center gap-1.5 tracking-tight">
                    {schemas.find(s => s.id === activeSchemaId)?.name} Configuration
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Schema Identifier: {activeSchemaId}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-600">
                <p className="font-semibold text-slate-800 mb-0.5">Database Scope:</p>
                {schemas.find(s => s.id === activeSchemaId)?.description}
              </div>

              {/* Fields Table preview */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Columns Layout</span>
                <div id="columns-matrix" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {schemas.find(s => s.id === activeSchemaId)?.fields.map((field) => (
                    <div id={`field-badge-${field.key}`} key={field.key} className="p-2 rounded-lg border border-slate-100 bg-[#f9fbfd]/50 text-[11px] font-mono">
                      <div className="font-bold font-sans text-slate-800 truncate" title={field.name}>{field.name}</div>
                      <div className="text-slate-400 text-[10px] uppercase truncate">{field.type} {field.required ? '• Required' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="schema-help" className="mt-5 border-t border-slate-100 pt-3 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <Info className="w-4 h-4 text-slate-300 stroke-[1.5]" />
              <span>Selecting another database from the left column swaps the current workspace, metrics, and cards natively!</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
