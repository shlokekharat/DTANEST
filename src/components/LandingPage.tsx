import React, { useState } from 'react';
import { 
  Database, ShieldCheck, ArrowRight, Server, Play, Columns, 
  BarChart3, Layers, Check, HelpCircle, Terminal, User, Users, 
  Settings, CheckSquare, Zap, Eye, Lock, Mail, Star, Code, ArrowUpRight
} from 'lucide-react';

interface LandingPageProps {
  onEnterConsole: () => void;
  isLoggedIn: boolean;
  currentUserEmail?: string;
  onLogout?: () => void;
  triggerNotification?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function LandingPage({ 
  onEnterConsole, 
  isLoggedIn, 
  currentUserEmail,
  onLogout,
  triggerNotification 
}: LandingPageProps) {
  // Billing cycle state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Interactive Sandbox state
  const [demoSchema, setDemoSchema] = useState<'employees' | 'products' | 'tasks'>('employees');

  // FAQ Expanded index state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Demo schemas data structure
  const demoSchemas = {
    employees: {
      title: 'Employees Team Catalog',
      fields: ['Full Name', 'Department', 'Compensation Rate', 'Status'],
      rows: [
        { name: 'Alex Rivera', dept: 'System Engineering', salary: '$145,000', status: 'Active' },
        { name: 'Sarah Jenkins', dept: 'Product Design', salary: '$128,000', status: 'Active' },
        { name: 'Michael Chen', dept: 'Cyber Security', salary: '$152,000', status: 'Suspended' }
      ]
    },
    products: {
      title: 'Inventory Catalog Nest',
      fields: ['Product Name', 'SKU Identifier', 'Stock Level', 'VIP Access'],
      rows: [
        { name: 'DataNest Cloud Node v2', dept: 'DN-NODE-X9', salary: '450 Units', status: 'Enabled' },
        { name: 'Relational Stream Controller', dept: 'DN-STRM-88', salary: '12 Units', status: 'Enabled' },
        { name: 'Cryptographic HSM Keycard', dept: 'DN-PASS-01', salary: '900 Units', status: 'Disabled' }
      ]
    },
    tasks: {
      title: 'Agile Software Work items',
      fields: ['Sprint Goal', 'Assigned Engineer', 'Story Points', 'In Progress'],
      rows: [
        { name: 'Provision validation audit trail', dept: 'Alex Rivera', salary: '8 pts', status: 'Yes' },
        { name: 'Implement multi-tenant auth guard', dept: 'Sarah Jenkins', salary: '5 pts', status: 'Yes' },
        { name: 'Reframe mobile-responsive breakpoint', dept: 'Unassigned', salary: '3 pts', status: 'No' }
      ]
    }
  };

  const currentPreview = demoSchemas[demoSchema];

  const faqs = [
    {
      q: 'How does DataNest persist my database configurations?',
      a: 'All custom schemas and data tables are automatically written to secure browser LocalStorage. Data is isolated safely on your machine with zero server overhead or risk of central leakage.'
    },
    {
      q: 'Can I import existing data tables from standard spreadsheets?',
      a: 'Yes! DataNest supports an advanced JSON backup & recovery engine. You can instantly export any active schema along with its records as a structured backup file, or upload a previously exported configuration to swap databases in under 1 second.'
    },
    {
      q: 'How does the simulated validation engine operate?',
      a: 'When inserting or updating records, DataNest triggers an automated client-side integrity guard immediately followed by an optional, realistic mock Express validation API call. This pipeline returns detailed field conflicts and output codes directly to our developer console hud.'
    },
    {
      q: 'Is my corporate auth session encrypted?',
      a: 'DataNest uses client-side cryptographic hashes to cross-examine passwords. When you trigger "Sign Out Securely", active session tokens are wiped entirely from browser registers to block session hijacking.'
    }
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* Dynamic Banner Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl shadow-xs text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">DataNest</span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-[#2563eb] uppercase block">Secure Schema Console</span>
          </div>
        </div>

        {/* Desktop Links Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-650">
          <a href="#features" className="hover:text-blue-600 transition-colors">Platform Features</a>
          <a href="#playground" className="hover:text-blue-600 transition-colors">Interactive Demo</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">SaaS Plans</a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">Frequent Questions</a>
        </nav>

        {/* Launch Workspace Control Button */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 border border-slate-200 p-1.5 px-3 rounded-full text-xs text-slate-650 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentUserEmail}</span>
            </div>
          ) : null}

          <button
            id="btn-goto-platform"
            onClick={onEnterConsole}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
          >
            {isLoggedIn ? 'Launch Workspace' : 'Sign In To Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Premium HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 bg-linear-to-b from-white to-slate-50 border-b border-slate-200/60 overflow-hidden text-center">
        {/* Subtle grid visual backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-blue-700 animate-fadeIn">
            <Zap className="w-3.5 h-3.5 fill-blue-200" />
            <span>DATANEST v2.4 RELEASE AVAILABLE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            The Secure Sanctuary For Your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Relational Local Workspace Data</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            DataNest delivers dynamic schema generation, multi-view Kanban boards, automated compliance validations, and local-first cryptographic session keys inside a single unified database administration terminal.
          </p>

          {/* Interactive CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              id="btn-hero-launch"
              onClick={onEnterConsole}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              🚀 Launch Live DataNest Workspace
            </button>
            <a
              href="#playground"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 rounded-xl text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Code className="w-4 h-4 text-slate-400" />
              Test Mock Sandboxes
            </a>
          </div>

          {/* Core metrics indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 text-left">
            {[
              { label: 'SCHEMA BOOT TIME', val: '< 100ms' },
              { label: 'USER SECURITY LEDGER', val: 'AES-256' },
              { label: 'DEVICE COMPLIANCE', val: 'Fully Responsive' },
              { label: 'PERSISTENCE METHOD', val: 'Local-First' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">{stat.val}</div>
              </div>
            ))}
          </div>

          {/* Interactive Application Window Mockup Showcase */}
          <div className="max-w-4xl mx-auto pt-12">
            <div className="bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 text-left overflow-hidden">
              {/* Fake Chrome window pill controls */}
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1 text-[10px] font-mono text-slate-400 w-1/2 text-center truncate">
                  https://datanest.secure.workspace/employees/active
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">● LIVE CLIENT LEDGER</span>
              </div>

              {/* Simulated Screen with Live Side drawers */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-64 sm:h-80 bg-slate-900 text-slate-300 font-mono text-xs">
                {/* Simulated Sidebar */}
                <div className="md:col-span-3 bg-slate-950 p-4 border-r border-slate-800/80 space-y-4">
                  <div className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">MICRO DATABASES</div>
                  <div className="space-y-1.5 pb-2">
                    <div className="bg-blue-600/10 px-2.5 py-1.5 rounded-lg border border-blue-500/25 flex items-center gap-2 text-white font-semibold">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>employees_db</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span>product_catalog</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span>agile_sprints</span>
                    </div>
                  </div>
                </div>

                {/* Simulated grid records content */}
                <div className="md:col-span-9 p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-slate-100">SCHEMA: EMPLOYEE ENFORCED VALIDATION</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">3 database rows</span>
                    </div>

                    <table className="w-full text-left text-[11px] text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-800/60 pb-1 text-slate-500 uppercase tracking-wider text-[10px]">
                          <th className="py-1">EMPLOYEE NAME</th>
                          <th className="py-1">ROLE DEPT</th>
                          <th className="py-1">COMPENSATION</th>
                          <th className="py-1 text-right">METRIC STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800/20">
                          <td className="py-2 text-white font-bold">Alex Rivera</td>
                          <td className="py-2">System Engineering</td>
                          <td className="py-2 text-emerald-400">$145,000</td>
                          <td className="py-2 text-right"><span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">● TRUE</span></td>
                        </tr>
                        <tr className="border-b border-slate-800/20">
                          <td className="py-2 text-white font-bold">Sarah Jenkins</td>
                          <td className="py-2">Product Design</td>
                          <td className="py-2 text-emerald-400">$128,000</td>
                          <td className="py-2 text-right"><span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">● TRUE</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-950 p-2.5 px-3.5 rounded-lg border border-slate-800 flex items-center justify-between mt-4">
                    <span className="text-[10px] text-slate-500">EXPRESS MOCK APIS ACTIVE:</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      POST /api/v1/schemas/employees/validate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES BENTO MATRIX */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3.5 max-w-xl mx-auto">
          <span className="text-xs font-black tracking-widest text-blue-600 uppercase">THE DATANEST STANDARD</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Engineered For Database Clarity & Security
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Tired of clunky spreadsheets or unsecured cloud setups? DataNest unites speed and professional data verification techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Feature Card 1 */}
          <div className="bg-white border border-slate-200/70 p-6 rounded-2xl shadow-2xs space-y-4 hover:border-slate-300 transition-all group">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-11 h-11 flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Dynamic Scheme Provisioner</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add, configure, or delete database properties dynamically. Choose variable properties including Text fields, Numbers, select Select drop-down arrays, Dates, or Checkbox indicators.
              </p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white border border-slate-200/70 p-6 rounded-2xl shadow-2xs space-y-4 hover:border-slate-300 transition-all group">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-11 h-11 flex items-center justify-center transition-all group-hover:bg-emerald-600 group-hover:text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Two-Tier Data Validation Shield</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Each typed input gets checked instantly client-side. Before actual save commits, custom API rules verify values to ensure semantic consistency blockages.
              </p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white border border-slate-200/70 p-6 rounded-2xl shadow-2xs space-y-4 hover:border-slate-300 transition-all group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-11 h-11 flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white">
              <Columns className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Kanban Board & Visual Grid Views</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seamlessly pivot between premium structured tables, drag-and-drop Kanban visual boards, or responsive information cards tailored for mobile viewports.
              </p>
            </div>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-white border border-slate-200/70 p-6 rounded-2xl shadow-2xs space-y-4 hover:border-slate-300 transition-all group">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl w-11 h-11 flex items-center justify-center transition-all group-hover:bg-orange-600 group-hover:text-white">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Dynamic User Registration Ledger</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Equipped with corporate login forms, password recovery verification pathways, customizable avatar theme options, and profile configuration drawer consoles.
              </p>
            </div>
          </div>

          {/* Feature Card 5 */}
          <div className="bg-white border border-slate-200/70 p-6 rounded-2xl shadow-2xs space-y-4 hover:border-slate-300 transition-all group">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl w-11 h-11 flex items-center justify-center transition-all group-hover:bg-pink-600 group-hover:text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Visual Insights & Metrics panel</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calculate custom database properties summary aggregates instantly. Auto-summarizes data values based on status flags and tracks continuous database events logs.
              </p>
            </div>
          </div>

          {/* Feature Card 6 */}
          <div className="bg-white border border-slate-200/70 p-6 rounded-2xl shadow-2xs space-y-4 hover:border-slate-300 transition-all group">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-11 h-11 flex items-center justify-center transition-all group-hover:bg-teal-600 group-hover:text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Local-First Cryptographic Cache</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                 All security tokens and workspace objects remain stored directly in client-side storage vaults. Safe from external cloud failures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO SANDBOX */}
      <section id="playground" className="py-20 bg-slate-100 border-y border-slate-200/80 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          <div className="md:col-span-5 space-y-4 text-left">
            <span className="text-xs font-black tracking-widest text-[#2563eb] uppercase font-mono">LIVE DEMO CONSOLE</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              A True Taste of relational control
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
               Click through the pre-packaged active database schemas below to visualize how DataNest structures the local payload grid instantly. No sign-up required for trial schema previews.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              {[
                { key: 'employees', label: 'Team employees Database', desc: 'Review team payroll rates and validation tags' },
                { key: 'products', label: 'Inventory list Catalog Nest', desc: 'Analyze warehouse levels and VIP checks' },
                { key: 'tasks', label: 'Agile development Work items', desc: 'Scan code sprint requirements & status checks' }
              ].map((sch) => (
                <button
                  id={`btn-demo-selector-${sch.key}`}
                  key={sch.key}
                  type="button"
                  onClick={() => setDemoSchema(sch.key as any)}
                  className={`w-full text-left p-3.5 border rounded-xl transition-all cursor-pointer ${
                    demoSchema === sch.key 
                      ? 'bg-white border-[#2563eb] shadow-md ring-2 ring-blue-50' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800">{sch.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{sch.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-900 font-mono">{currentPreview.title}</h4>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                SCHEMA: {demoSchema}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 pb-2 text-slate-400 uppercase tracking-widest text-[9px] font-mono">
                    {currentPreview.fields.map((field, i) => (
                      <th key={i} className="pb-2 font-bold">{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPreview.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 font-medium">
                      <td className="py-3 text-slate-900 font-bold">{row.name}</td>
                      <td className="py-3">{row.dept}</td>
                      <td className="py-3 text-blue-600 font-mono font-bold">{row.salary}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'Active' || row.status === 'Enabled' || row.status === 'Yes'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                <span>Want to modify or insert real records?</span>
              </div>
              <button
                id="btn-demo-cta-launch"
                onClick={onEnterConsole}
                className="px-3.5 py-1.5 bg-[#2563eb] text-white hover:bg-blue-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Go to Workspace Console
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SAAS PRICING AND VALUE PLAN INTEGRATOR */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-black tracking-widest text-blue-600 uppercase">PRICING & PLANS</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            A Plan Tailored for Every Scale
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
             Deploy fully responsive sandboxes offline with our zero-risk Local plan, or connect robust multi-user databases.
          </p>

          {/* Pricing swapper billing interval togglers */}
          <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl mt-4">
            <button
              id="btn-billing-monthly"
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly billing
            </button>
            <button
              id="btn-billing-yearly"
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Yearly billing
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          {/* Card 1: Local Developer */}
          <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-2xs space-y-6 text-left relative flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono block">FREE DEVELOPER</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Local Sandbox</h3>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Perfect for software architects looking to test data schemas and integrity. No login required.
              </p>
              <div className="font-mono">
                <span className="text-3xl font-bold text-slate-900">$0</span>
                <span className="text-slate-400 text-xs text-medium"> / forever</span>
              </div>
              
              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                {[
                  'Deploy 10 custom schemas',
                  'Client-side LocalStorage cache',
                  'Interactive Kanban / card switches',
                  'JSON file backup & extraction',
                  'Basic logs summary ledger'
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              id="btn-pricing-free"
              onClick={onEnterConsole}
              className="w-full mt-6 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 rounded-xl text-xs font-bold transition-all text-center cursor-pointer block border-none"
            >
              Launch Session
            </button>
          </div>

          {/* Card 2: Pro Nest (Highlighted) */}
          <div className="bg-white border-2 border-[#2563eb] p-8 rounded-2xl shadow-md space-y-6 text-left relative flex flex-col justify-between transform md:scale-105">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest py-1 px-3.5 rounded-full shadow-xs">
              MOST RECOMMENDED
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black tracking-widest text-[#2563eb] uppercase font-mono block">DEVELOPER SECTOR</span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">Pro Nest Access</h3>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Expand configurations with advanced server validations checks, custom schema metadata, and audit trackers.
              </p>
              <div className="font-mono">
                <span className="text-3xl font-bold text-slate-900">
                  {billingCycle === 'monthly' ? '$24' : '$19'}
                </span>
                <span className="text-slate-400 text-xs text-medium"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-150 pt-5">
                {[
                  'Deploy unlimited schemas',
                  'Active server verification simulations',
                  'Custom avatar palette branding',
                  'No limit client bulk imports',
                  'Full audit log search directories',
                  'Priority technical assistance email'
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              id="btn-pricing-pro"
              onClick={onEnterConsole}
              className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all text-center shadow-xs cursor-pointer block border-none"
            >
              Secure Pro Access
            </button>
          </div>

          {/* Card 3: Enterprise Vault */}
          <div className="bg-white border border-slate-200/85 p-8 rounded-2xl shadow-2xs space-y-6 text-left relative flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono block">ORGANIZATION</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Enterprise Vaults</h3>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                A military-grade schema repository for global agencies requiring robust security controls.
              </p>
              <div className="font-mono">
                <span className="text-3xl font-bold text-slate-900">
                  {billingCycle === 'monthly' ? '$249' : '$199'}
                </span>
                <span className="text-slate-400 text-xs text-medium"> / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
                {[
                  'Everything in the Pro Nest plan',
                  'Continuous cloud backup vault',
                  'SAML Single Sign-On integrations',
                  'Custom schema translation webhooks',
                  '99.99% system uptime service agreements',
                  'Designated system engineer support'
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              id="btn-pricing-enterprise"
              onClick={onEnterConsole}
              className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer block border-none"
            >
              Contact Sandbox Sales
            </button>
          </div>

        </div>
      </section>

      {/* FREQUENT ACCORDION QUESTIONS */}
      <section id="faq" className="py-20 bg-slate-100 border-t border-slate-200 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-8 text-left">
          <div className="text-center space-y-3 mb-6">
            <span className="text-xs font-black tracking-widest text-[#2563eb] uppercase">KNOWLEDGE DISCOVERY</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 text-center">
              Frequent Platform Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, i) => {
              const isOpen = expandedFaq === i;
              return (
                <div 
                  key={i} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    id={`btn-faq-header-${i}`}
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : i)}
                    className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-800 text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer focus:outline-hidden"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <HelpCircle className={`w-4 h-4 text-slate-450 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`} />
                  </button>

                  {isOpen && (
                    <div id={`faq-answer-${i}`} className="p-4 pt-0 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-50 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER CTA BANNER */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-950" />
        
        <div className="relative max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Ready To Harness Your Relational Layouts?</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign up for custom schemas, define relational validation boundaries, and visualize agile assets in under 60 seconds with DataNest.
          </p>
          <div className="pt-2">
            <button
              id="btn-footer-cta"
              onClick={onEnterConsole}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
            >
              🚀 Get Started Instantly - Free
            </button>
          </div>
        </div>
      </section>

      {/* FINAL CORPORATE FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900/80 p-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded text-white inline-flex">
                <Database className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white tracking-tight">DataNest</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Premium multi-tenant database builder, relational validation guard, and interactive client-side ledger console.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-350 uppercase tracking-widest text-[10px] mb-3">Product</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#features" className="hover:text-slate-300">Console Studio</a></li>
              <li><a href="#playground" className="hover:text-slate-300">Mock Playground API</a></li>
              <li><a href="#pricing" className="hover:text-slate-300">Pricing Packages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-350 uppercase tracking-widest text-[10px] mb-3">Compliance</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><span className="text-slate-500">AES-256 Client storage</span></li>
              <li><span className="text-slate-500">ISO-27001 Local Mock</span></li>
              <li><span className="text-slate-500">Workspace Authorized SSL</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-350 uppercase tracking-widest text-[10px] mb-3">Sanctuary System</h4>
            <p className="text-[10px] leading-relaxed text-slate-500">
              © 2026 DataNest Inc. All database transactions are calculated locally in standard memory logs.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
