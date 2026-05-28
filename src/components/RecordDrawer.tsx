/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Server, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';
import { SchemaType, DatabaseRecord } from '../types';
import { validateRecord } from '../utils/validation';

interface RecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schema: SchemaType;
  record: DatabaseRecord | null; // Null means "Create New Mode"
  onSave: (data: Partial<DatabaseRecord>) => void;
}

export default function RecordDrawer({ isOpen, onClose, schema, record, onSave }: RecordDrawerProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Server Validation Simulation States
  const [useServerValidation, setUseServerValidation] = useState(true);
  const [isServerValidating, setIsServerValidating] = useState(false);
  const [serverConsoleLogs, setServerConsoleLogs] = useState<string[]>([]);

  // Reset form data when isOpen changes or when we load a different record
  useEffect(() => {
    if (isOpen) {
      if (record) {
        // Load existing record values
        const initialData: Record<string, any> = {};
        schema.fields.forEach((field) => {
          initialData[field.key] = record[field.key] !== undefined ? record[field.key] : '';
        });
        setFormData(initialData);
      } else {
        // Prepare initial defaults for new records
        const defaults: Record<string, any> = {};
        schema.fields.forEach((field) => {
          if (field.type === 'boolean') {
            defaults[field.key] = false;
          } else if (field.type === 'select' && field.options && field.options.length > 0) {
            defaults[field.key] = field.options[0];
          } else {
            defaults[field.key] = '';
          }
        });
        setFormData(defaults);
      }
      setErrors({});
      setTouchedFields({});
      setServerConsoleLogs([]);
    }
  }, [isOpen, record, schema]);

  if (!isOpen) return null;

  const handleInputChange = (key: string, value: any) => {
    const updatedData = {
      ...formData,
      [key]: value
    };
    setFormData(updatedData);
    setTouchedFields((prev) => ({ ...prev, [key]: true }));

    // Instant/Interactive Client-side validation callback
    const validationErrors = validateRecord(updatedData, schema.fields);
    const fieldErr = validationErrors.find(e => e.field === key);

    setErrors((prev) => {
      const copy = { ...prev };
      if (fieldErr) {
        copy[key] = fieldErr.message;
      } else {
        delete copy[key];
      }
      return copy;
    });
  };

  const processAndSave = () => {
    // Process submission data - convert numbers correctly
    const processedData: Record<string, any> = {};
    schema.fields.forEach((field) => {
      const originalValue = formData[field.key];
      if (field.type === 'number' && originalValue !== '') {
        processedData[field.key] = Number(originalValue);
      } else if (field.type === 'boolean') {
        processedData[field.key] = Boolean(originalValue);
      } else {
        processedData[field.key] = originalValue;
      }
    });

    onSave(processedData);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Step 1: Pre-flight Client Validation Check
    const clientValidationErrors = validateRecord(formData, schema.fields);
    if (clientValidationErrors.length > 0) {
      const clientErrorsMap: Record<string, string> = {};
      clientValidationErrors.forEach((err) => {
        clientErrorsMap[err.field] = err.message;
      });
      setErrors(clientErrorsMap);
      
      // Mark all as touched to show errors visually
      const allTouched: Record<string, boolean> = {};
      schema.fields.forEach(f => { allTouched[f.key] = true; });
      setTouchedFields(allTouched);
      return;
    }

    // Step 2: Simulated Server Validation Check (API simulation)
    if (useServerValidation) {
      setIsServerValidating(true);
      const requestPayload = JSON.stringify({
        schemaId: schema.id,
        record: formData,
        timestamp: new Date().toISOString()
      }, null, 2);

      setServerConsoleLogs([
        `[${new Date().toLocaleTimeString()}] 🚀 POST /api/v1/schemas/${schema.id}/validate`,
        `[${new Date().toLocaleTimeString()}] 📤 Payload: ${requestPayload.substring(0, 110)}...`,
        `[${new Date().toLocaleTimeString()}] ⏳ Verifying schema specifications at mock server runtime...`
      ]);

      setTimeout(() => {
        // Perform server compliance validation checks
        const serverValidationErrors = validateRecord(formData, schema.fields);
        
        if (serverValidationErrors.length > 0) {
          setIsServerValidating(false);
          const serverErrorsMap: Record<string, string> = {};
          serverValidationErrors.forEach((err) => {
            serverErrorsMap[err.field] = `[API Constraint Server Reject] ${err.message}`;
          });
          setErrors(serverErrorsMap);
          setServerConsoleLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ❌ HTTP 422 Unprocessable Entity - Validation failed.`,
            `[${new Date().toLocaleTimeString()}] ✏️ Fields with warnings: ${serverValidationErrors.map(e => e.field).join(', ')}`
          ]);
        } else {
          setIsServerValidating(false);
          setServerConsoleLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✅ HTTP 200 OK - No validation conflicts.`,
            `[${new Date().toLocaleTimeString()}] 💾 Committing transaction state securely.`
          ]);
          processAndSave();
        }
      }, 750);
    } else {
      processAndSave();
    }
  };

  return (
    <div id="drawer-container" className="fixed inset-0 z-50 overflow-hidden font-sans" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Dark overlay backdrop with fade animation */}
      <div 
        id="drawer-overlay"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex h-full">
        {/* Sliding panel card */}
        <div 
          id="drawer-panel"
          className="w-screen max-w-md transform transition-all duration-300 ease-in-out bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="py-6 px-6 bg-slate-50 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="slide-over-title" className="text-lg font-semibold tracking-tight text-slate-900">
                  {record ? 'Edit Record Detail' : 'Create New Record'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {schema.name} Table Interface
                </p>
              </div>
              <div className="ml-3 h-7 flex items-center">
                <button
                  id="btn-close-drawer"
                  type="button"
                  onClick={onClose}
                  className="rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 focus:outline-hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Form Content body (Scrollable) */}
          <form id="record-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Validation Strategy Box */}
            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Simulate Server Validation API</span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">POST /api/v1/validate</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUseServerValidation(!useServerValidation)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden ${
                  useServerValidation ? 'bg-blue-600' : 'bg-slate-250'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                  useServerValidation ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {Object.keys(errors).length > 0 && (
              <div id="form-error-banner" className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-sm text-red-750 font-medium">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Compliance Flags:</span> Inputs violated database rules. Verify values.
                </div>
              </div>
            )}

            {schema.fields.map((field) => {
              const hasError = !!errors[field.key];
              const isTouched = !!touchedFields[field.key];
              const valueExists = formData[field.key] !== undefined && formData[field.key] !== null && String(formData[field.key]).trim() !== '';
              const isSuccessful = isTouched && valueExists && !hasError;

              return (
                <div id={`field-wrapper-${field.key}`} key={field.key} className="space-y-1.5 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <label htmlFor={`input-${field.key}`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                    </label>
                    {isSuccessful && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Matches schema
                      </span>
                    )}
                  </div>

                  {field.type === 'text' && (
                    <input
                      id={`input-${field.key}`}
                      type="text"
                      className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 transition-all ${
                        hasError 
                          ? 'border-red-500 bg-red-50/5 focus:ring-red-100' 
                          : isSuccessful 
                            ? 'border-emerald-500 focus:ring-emerald-50' 
                            : 'border-slate-200 focus:ring-blue-50 focus:border-blue-500'
                      }`}
                      placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      id={`input-${field.key}`}
                      type="number"
                      step="any"
                      className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 transition-all ${
                        hasError 
                          ? 'border-red-500 bg-red-50/5 focus:ring-red-100' 
                          : isSuccessful 
                            ? 'border-emerald-500 focus:ring-emerald-50' 
                            : 'border-slate-200 focus:ring-blue-55 focus:border-blue-500'
                      }`}
                      placeholder={field.placeholder || 'e.g. 100'}
                      value={formData[field.key] !== undefined ? formData[field.key] : ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      id={`input-${field.key}`}
                      type="date"
                      className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 transition-all ${
                        hasError 
                          ? 'border-red-500 bg-red-50/5 focus:ring-red-100' 
                          : isSuccessful 
                            ? 'border-emerald-500 focus:ring-emerald-50' 
                            : 'border-slate-200 focus:ring-blue-55'
                      }`}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      id={`input-${field.key}`}
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 transition-all ${
                        hasError 
                          ? 'border-red-500 bg-red-50/5 focus:ring-red-100' 
                          : isSuccessful 
                            ? 'border-emerald-500 focus:ring-emerald-50' 
                            : 'border-slate-200 focus:ring-blue-55'
                      }`}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                    >
                      <option value="" disabled>Select an option</option>
                      {field.options?.map((opt) => (
                        <option id={`opt-${opt}`} key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'boolean' && (
                    <div id={`toggle-wrapper-${field.key}`} className="flex items-center pt-1">
                      <button
                        id={`input-${field.key}`}
                        type="button"
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          formData[field.key] ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                        role="switch"
                        aria-checked={formData[field.key]}
                        onClick={() => handleInputChange(field.key, !formData[field.key])}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            formData[field.key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-slate-600 font-medium">
                        {formData[field.key] ? 'Active / True' : 'Inactive / False'}
                      </span>
                    </div>
                  )}

                  {hasError && (
                    <p id={`error-${field.key}`} className="text-xs text-red-600 font-semibold mt-1">
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Developer Simulated Live Server Console Logs */}
            {useServerValidation && serverConsoleLogs.length > 0 && (
              <div className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] border border-slate-800 space-y-1.5 shadow-inner leading-relaxed">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 mb-2">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    Express Mock Validator Console
                  </div>
                  <span className="text-[9px] px-1 bg-slate-800 rounded font-bold text-slate-300">HTTP/1.1</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {serverConsoleLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                  {isServerValidating && (
                    <div className="text-blue-400 animate-pulse flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                      [Simulating server-side integrity latency checks...]
                    </div>
                  )}
                </div>
              </div>
            )}

            {record && (
              <div id="record-metadata-box" className="pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-400 space-y-1">
                <div>RECORD ID: {record.id}</div>
                <div>CREATED: {new Date(record._createdAt).toLocaleString()}</div>
                <div>LAST UPDATED: {new Date(record._updatedAt).toLocaleString()}</div>
              </div>
            )}
          </form>

          {/* Action buttons footer */}
          <div className="py-4 px-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button
              id="btn-drawer-cancel"
              type="button"
              onClick={onClose}
              disabled={isServerValidating}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-hidden transition-colors cursor-pointer disabled:opacity-50 font-sans"
            >
              Cancel
            </button>
            <button
              id="btn-drawer-save"
              type="submit"
              disabled={isServerValidating}
              onClick={(e) => handleSubmit(e as any)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 focus:outline-hidden flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 font-sans"
            >
              {isServerValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  Validating payload...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  {record ? 'Save Changes' : 'Insert Record'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
