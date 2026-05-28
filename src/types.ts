/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FieldValueType = 'text' | 'number' | 'select' | 'date' | 'boolean';

export interface FieldDefinition {
  key: string;
  name: string;
  type: FieldValueType;
  options?: string[]; // For select dropdown fields
  required: boolean;
  placeholder?: string;
}

export interface SchemaType {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name to map dynamically
  fields: FieldDefinition[];
  primaryFieldKey: string; // field used as title/main heading
  kanbanFieldKey: string; // field used for grouping in Kanban view
}

export interface DatabaseRecord {
  id: string;
  [key: string]: any; // dynamic model properties
  _createdAt: string;
  _updatedAt: string;
}

export interface AppDatabase {
  schema: SchemaType;
  records: DatabaseRecord[];
}

export type ViewMode = 'table' | 'kanban' | 'cards' | 'analytics';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string;
  role: string;
  bio?: string;
  createdAt: string;
}

export interface UserSession {
  user: UserProfile;
  token: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  schemaId: string;
  schemaName: string;
  action: 'create' | 'update' | 'delete' | 'import' | 'reset' | 'auth_login' | 'auth_register' | 'auth_profile_update' | 'auth_password_reset';
  details: string;
}
