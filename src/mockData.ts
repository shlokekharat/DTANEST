/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaType, DatabaseRecord } from './types';

export const INITIAL_SCHEMAS: SchemaType[] = [
  {
    id: 'employees',
    name: 'Employee Directory',
    description: 'Manage staff profiles, role departments, compensation, and active contract status.',
    iconName: 'Users',
    primaryFieldKey: 'fullName',
    kanbanFieldKey: 'status',
    fields: [
      { key: 'fullName', name: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Jane Doe' },
      { key: 'email', name: 'Work Email', type: 'text', required: true, placeholder: 'e.g. jane@company.com' },
      { key: 'role', name: 'Job Role', type: 'text', required: true, placeholder: 'e.g. Senior Software Engineer' },
      {
        key: 'department',
        name: 'Department',
        type: 'select',
        required: true,
        options: ['Engineering', 'Product', 'Sales', 'Marketing', 'Operations', 'Human Resources']
      },
      {
        key: 'status',
        name: 'Work Status',
        type: 'select',
        required: true,
        options: ['Onboarded', 'Active', 'On Leave', 'Remote Only', 'Contractor']
      },
      { key: 'salary', name: 'Annual Salary ($)', type: 'number', required: true, placeholder: 'e.g. 115000' },
      { key: 'hireDate', name: 'Hire Date', type: 'date', required: true }
    ]
  },
  {
    id: 'products',
    name: 'Product Inventory',
    description: 'Track items, serial SKUs, pricing distributions, stock levels, and store statuses.',
    iconName: 'Package',
    primaryFieldKey: 'productName',
    kanbanFieldKey: 'status',
    fields: [
      { key: 'productName', name: 'Product Name', type: 'text', required: true, placeholder: 'e.g. Quantum Laptop Pro' },
      { key: 'sku', name: 'Item SKU Code', type: 'text', required: true, placeholder: 'e.g. QNTM-LTP-09' },
      {
        key: 'category',
        name: 'Category',
        type: 'select',
        required: true,
        options: ['Hardware', 'Mobile Accessories', 'Office Supplies', 'Consumer Software', 'Network Gear', 'Other']
      },
      { key: 'price', name: 'Retail Price ($)', type: 'number', required: true, placeholder: 'e.g. 1499.99' },
      { key: 'stock', name: 'Stock Quantity', type: 'number', required: true, placeholder: 'e.g. 74' },
      {
        key: 'status',
        name: 'Stock Status',
        type: 'select',
        required: true,
        options: ['In Stock', 'Executing Reorder', 'Low Stock', 'Out of Stock', 'Discontinued']
      },
      { key: 'isFeatured', name: 'Featured on Storefront', type: 'boolean', required: false }
    ]
  },
  {
    id: 'movies',
    name: 'Content & Media Tracker',
    description: 'Log and review films, documentaries, episodes, viewing status, and star scores.',
    iconName: 'Clapperboard',
    primaryFieldKey: 'title',
    kanbanFieldKey: 'status',
    fields: [
      { key: 'title', name: 'Media Title', type: 'text', required: true, placeholder: 'e.g. Interstellar' },
      { key: 'director', name: 'Director / Creator', type: 'text', required: true, placeholder: 'e.g. Christopher Nolan' },
      {
        key: 'genre',
        name: 'Genre Group',
        type: 'select',
        required: true,
        options: ['Sci-Fi & Cyberpunk', 'Drama & Romance', 'Action & Adventure', 'Mystery & Thriller', 'Documentary', 'Animation', 'Horror']
      },
      { key: 'rating', name: 'Star Rating (1-10)', type: 'number', required: true, placeholder: 'e.g. 9' },
      { key: 'releaseDate', name: 'Release Date', type: 'date', required: true },
      {
        key: 'status',
        name: 'Viewing Progress',
        type: 'select',
        required: true,
        options: ['In Backlog', 'Queued Next', 'Currently Screening', 'Finished Review', 'On Hold']
      },
      { key: 'recommend', name: 'Recommend to Friends', type: 'boolean', required: false }
    ]
  }
];

export const INITIAL_RECORDS: Record<string, DatabaseRecord[]> = {
  employees: [
    {
      id: 'emp-101',
      fullName: 'Alexander Wright',
      email: 'a.wright@firmware.co',
      role: 'Staff Infrastructure Architect',
      department: 'Engineering',
      status: 'Active',
      salary: 165000,
      hireDate: '2022-04-12',
      _createdAt: '2026-05-10T14:22:00Z',
      _updatedAt: '2026-05-18T10:45:00Z'
    },
    {
      id: 'emp-102',
      fullName: 'Sophia Henderson',
      email: 's.henderson@firmware.co',
      role: 'Principal Product Manager',
      department: 'Product',
      status: 'Active',
      salary: 152000,
      hireDate: '2023-01-15',
      _createdAt: '2026-05-11T09:30:00Z',
      _updatedAt: '2026-05-11T09:30:00Z'
    },
    {
      id: 'emp-103',
      fullName: 'Marcus Vance',
      email: 'm.vance@firmware.co',
      role: 'Senior Growth strategist',
      department: 'Sales',
      status: 'Remote Only',
      salary: 112000,
      hireDate: '2024-02-28',
      _createdAt: '2026-05-12T16:40:00Z',
      _updatedAt: '2026-05-24T11:15:00Z'
    },
    {
      id: 'emp-104',
      fullName: 'Elena Rostova',
      email: 'e.rostova@firmware.co',
      role: 'Creative Interface Designer',
      department: 'Product',
      status: 'Active',
      salary: 124000,
      hireDate: '2024-06-05',
      _createdAt: '2026-05-13T10:05:00Z',
      _updatedAt: '2026-05-13T10:05:00Z'
    },
    {
      id: 'emp-105',
      fullName: 'Jordan Sterling',
      email: 'j.sterling@firmware.co',
      role: 'HR Administration Lead',
      department: 'Human Resources',
      status: 'On Leave',
      salary: 95000,
      hireDate: '2021-11-01',
      _createdAt: '2026-05-14T08:12:00Z',
      _updatedAt: '2026-05-14T08:12:00Z'
    },
    {
      id: 'emp-106',
      fullName: 'Kofi Mensah',
      email: 'k.mensah@firmware.co',
      role: 'DevOps Security Specialist',
      department: 'Engineering',
      status: 'Contractor',
      salary: 130000,
      hireDate: '2025-03-10',
      _createdAt: '2026-05-15T15:55:00Z',
      _updatedAt: '2026-05-15T15:55:00Z'
    }
  ],
  products: [
    {
      id: 'prod-201',
      productName: 'Spectre Display 32" OLED',
      sku: 'SPEC-DSP-32',
      category: 'Hardware',
      price: 1199.99,
      stock: 45,
      status: 'In Stock',
      isFeatured: true,
      _createdAt: '2026-05-10T12:00:00Z',
      _updatedAt: '2026-05-27T09:12:00Z'
    },
    {
      id: 'prod-202',
      productName: 'CyberSwitch 10G Gateway',
      sku: 'CYBR-SW-10G',
      category: 'Network Gear',
      price: 450.00,
      stock: 8,
      status: 'Low Stock',
      isFeatured: false,
      _createdAt: '2026-05-11T13:40:00Z',
      _updatedAt: '2026-05-11T13:40:00Z'
    },
    {
      id: 'prod-203',
      productName: 'HyperCharge Pad Duo',
      sku: 'HYPR-CHG-PD',
      category: 'Mobile Accessories',
      price: 69.95,
      stock: 120,
      status: 'In Stock',
      isFeatured: true,
      _createdAt: '2026-05-12T10:10:00Z',
      _updatedAt: '2026-05-12T10:10:00Z'
    },
    {
      id: 'prod-204',
      productName: 'LogiWrite Ink Pro Stylus',
      sku: 'LOGI-WR-STY',
      category: 'Mobile Accessories',
      price: 129.00,
      stock: 0,
      status: 'Out of Stock',
      isFeatured: false,
      _createdAt: '2026-05-13T17:30:00Z',
      _updatedAt: '2026-05-14T11:00:00Z'
    },
    {
      id: 'prod-205',
      productName: 'SaaS Metric Engine Annual',
      sku: 'METR-ENG-AN',
      category: 'Consumer Software',
      price: 299.00,
      stock: 9999,
      status: 'In Stock',
      isFeatured: true,
      _createdAt: '2026-05-14T08:50:00Z',
      _updatedAt: '2026-05-14T08:50:00Z'
    }
  ],
  movies: [
    {
      id: 'mov-301',
      title: 'Cosmic Horizons',
      director: 'Lana Wachowski',
      genre: 'Sci-Fi & Cyberpunk',
      rating: 9,
      releaseDate: '2025-11-20',
      status: 'Finished Review',
      recommend: true,
      _createdAt: '2026-05-10T20:30:00Z',
      _updatedAt: '2026-05-15T22:15:00Z'
    },
    {
      id: 'mov-302',
      title: 'Code of the Samurai',
      director: 'Hayao Miyazaki',
      genre: 'Animation',
      rating: 10,
      releaseDate: '2001-07-20',
      status: 'Finished Review',
      recommend: true,
      _createdAt: '2026-05-11T12:00:00Z',
      _updatedAt: '2026-05-11T12:00:00Z'
    },
    {
      id: 'mov-303',
      title: 'Echoes of Silence',
      director: 'Denis Villeneuve',
      genre: 'Mystery & Thriller',
      rating: 8,
      releaseDate: '2026-03-14',
      status: 'Currently Screening',
      recommend: false,
      _createdAt: '2026-05-12T19:00:00Z',
      _updatedAt: '2026-05-25T14:40:00Z'
    },
    {
      id: 'mov-304',
      title: 'Finding Trust',
      director: 'Richard Linklater',
      genre: 'Drama & Romance',
      rating: 7,
      releaseDate: '2024-05-01',
      status: 'In Backlog',
      recommend: false,
      _createdAt: '2026-05-13T11:45:00Z',
      _updatedAt: '2026-05-13T11:45:00Z'
    }
  ]
};
