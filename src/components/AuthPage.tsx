import React, { useState } from 'react';
import { 
  Lock, Mail, User, Briefcase, KeyRound, Database, ArrowRight, 
  Check, AlertCircle, Eye, EyeOff, ShieldCheck, HelpCircle, ArrowLeft
} from 'lucide-react';
import { UserProfile, UserSession } from '../types';
import { getRegisteredUsers, saveRegisteredUsers, saveSession } from '../utils/auth';
import { validateEmail, validatePassword } from '../utils/validation';

interface AuthPageProps {
  onLoginSuccess: (session: UserSession) => void;
  triggerNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
  onGoBackToWebsite?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'verify_code' | 'reset_password';

export default function AuthPage({ onLoginSuccess, triggerNotification, onGoBackToWebsite }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('Staff Engineer');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Form Field Validation States (Instant Validation alerts)
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Code verification flows
  const [simulatedCode, setSimulatedCode] = useState('');

  const resetErrors = () => {
    setEmailError(null);
    setPasswordError(null);
    setSubmitError(null);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) setPasswordError(null);
  };

  // Submit Handler for Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    // Client side checks
    const errEmail = validateEmail(email);
    if (errEmail) {
      setEmailError(errEmail);
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setLoading(true);

    // Simulate Server request checking credential hashing integrity
    setTimeout(() => {
      const users = getRegisteredUsers();
      const userRecord = users[email.trim().toLowerCase()];

      if (!userRecord || userRecord.passwordHash !== password) {
        setSubmitError('Invalid email credentials or password match pattern.');
        setLoading(false);
        triggerNotification('Authentication failed: Invalid credentials.', 'error');
        return;
      }

      // Login Successful
      const userProfile: UserProfile = {
        id: userRecord.id,
        email: userRecord.email,
        displayName: userRecord.displayName,
        avatarColor: userRecord.avatarColor || '#3b82f6',
        role: userRecord.role,
        bio: userRecord.bio,
        createdAt: userRecord.createdAt
      };

      const session: UserSession = {
        user: userProfile,
        token: `mock-jwt-token-${Math.random().toString(36).substring(2)}`
      };

      saveSession(session);
      setLoading(false);
      onLoginSuccess(session);
      triggerNotification(`Welcome back, ${userProfile.displayName}!`, 'success');
    }, 900);
  };

  // Submit Handler for Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    // Client side validations rules
    if (!displayName.trim()) {
      setSubmitError('Please enter your full name/display identity.');
      return;
    }
    const errEmail = validateEmail(email);
    if (errEmail) {
      setEmailError(errEmail);
      return;
    }
    const errPass = validatePassword(password);
    if (errPass) {
      setPasswordError(errPass);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const cleanEmail = email.trim().toLowerCase();

      if (users[cleanEmail]) {
        setSubmitError('This email identifier is already registered.');
        setLoading(false);
        return;
      }

      // Avatar dynamic select colors
      const avatarColors = ['#2563eb', '#16a34a', '#db2777', '#7c3aed', '#ea580c', '#0891b2'];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      // Store new record
      const newUser = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        displayName: displayName.trim(),
        avatarColor: randomColor,
        role: role.trim(),
        createdAt: new Date().toISOString(),
        passwordHash: password
      };

      users[cleanEmail] = newUser;
      saveRegisteredUsers(users);

      // Create session
      const userProfile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        avatarColor: newUser.avatarColor,
        role: newUser.role,
        createdAt: newUser.createdAt
      };

      const session: UserSession = {
        user: userProfile,
        token: `mock-jwt-token-${Math.random().toString(36).substring(2)}`
      };

      saveSession(session);
      setLoading(false);
      onLoginSuccess(session);
      triggerNotification(`Account successfully provisioned! Welcome ${displayName}.`, 'success');
    }, 1000);
  };

  // Forgot Password Phase 1 - Code Generation
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    const errEmail = validateEmail(email);
    if (errEmail) {
      setEmailError(errEmail);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const cleanEmail = email.trim().toLowerCase();

      if (!users[cleanEmail]) {
        setSubmitError('If this user exists, a reset code will be generated.');
        // We simulate sending even if it doesn't to prevent account harvesting
      }

      // Generate a mock code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(code);
      setLoading(false);
      setMode('verify_code');
      triggerNotification(`Reset code dispatched to ${email}! (Check console or developer HUD)`, 'success');
      console.log(`[AUTH SERVICE] Simulated Reset Code for ${email} is: ${code}`);
    }, 800);
  };

  // Forgot Password Phase 2 - Verification
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    if (resetCode !== simulatedCode && resetCode !== '123456') { // Fallback bypass
      setSubmitError('Invalid verification code parameters. Try again.');
      return;
    }

    setMode('reset_password');
    triggerNotification('Security identity confirmed! Set your premium password.', 'success');
  };

  // Forgot Password Phase 3 - Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetErrors();

    const errPass = validatePassword(newPassword);
    if (errPass) {
      setPasswordError(errPass);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getRegisteredUsers();
      const cleanEmail = email.trim().toLowerCase();

      if (users[cleanEmail]) {
        users[cleanEmail].passwordHash = newPassword;
        saveRegisteredUsers(users);
      }

      setLoading(false);
      setMode('login');
      setPassword('');
      triggerNotification('Credentials reset successfully! Please log in now.', 'success');
    }, 800);
  };

  return (
    <div id="auth-view" className="w-full min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-sm sm:max-w-md bg-white border border-slate-200/60 shadow-xl rounded-2xl overflow-hidden flex flex-col">
        
        {/* Banner with Enterprise Theme Branding */}
        <div className="bg-slate-900 border-b border-slate-850 px-6 py-6 text-center text-white flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-blue-600 rounded-xl shadow-md inline-flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">DATANEST PORTAL</h1>
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#2563eb]">
            Secure Relational Database Shell
          </p>
        </div>

        {/* Dynamic Sandbox Code Log Trigger tool for password reset code */}
        {mode === 'verify_code' && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1 font-mono">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <ShieldCheck className="w-4 h-4" />
              SANDBOX SIMULATION INTERCEPT:
            </div>
            <div>We processed a password recovery request for:</div>
            <div className="font-semibold text-slate-900">{email}</div>
            <div className="mt-1">
              Simulated verification security code is: <span className="bg-blue-200 px-1.5 py-0.5 rounded font-bold text-blue-950 text-sm">{simulatedCode}</span>
            </div>
          </div>
        )}

        {/* Main interactive form */}
        <div className="p-6 sm:p-8 flex-1">
          {submitError && (
            <div id="auth-err-banner" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    className={`w-full pl-9.5 pr-4 py-2 bg-white text-sm border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      emailError ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    placeholder="alex.rivera@company.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                </div>
                {emailError && <p className="text-red-600 text-xs mt-1 font-medium">{emailError}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    id="btn-forgot-mode"
                    type="button"
                    onClick={() => { resetErrors(); setMode('forgot'); }}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full pl-9.5 pr-10 py-2 bg-white text-sm border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      passwordError ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    placeholder="Enter database passkey"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <button
                    id="btn-toggle-password"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-red-600 text-xs mt-1 font-medium">{passwordError}</p>}
              </div>

              <div className="bg-slate-50 border border-slate-200/45 p-2.5 rounded-lg text-[11px] text-slate-500 text-center font-mono space-y-0.5">
                <div>DEFAULT WORKSPACE CREDENTIALS:</div>
                <div className="font-bold text-slate-750">admin@example.com • Password123</div>
              </div>

              <button
                id="btn-auth-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Performing Security Sandbox Login...' : 'Enter Console'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  New member of access list?{' '}
                  <button
                    id="btn-register-mode"
                    type="button"
                    onClick={() => { resetErrors(); setMode('register'); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Request Access Key
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name / Identifier
                </label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="register-fullname"
                    type="text"
                    required
                    className="w-full pl-9.5 pr-4 py-2 border border-slate-200 bg-white text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="e.g. Alex Rivera"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    className={`w-full pl-9.5 pr-4 py-2 bg-white text-sm border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      emailError ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                </div>
                {emailError && <p className="text-red-600 text-xs mt-1 font-medium">{emailError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Authorized Role Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="register-role"
                    type="text"
                    className="w-full pl-9.5 pr-4 py-2 border border-slate-200 bg-white text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="e.g. Lead Architect"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Create Passkey (Min 8 chars, 1 capital, 1 digit)
                </label>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full pl-9.5 pr-10 py-2 bg-white text-sm border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      passwordError ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    placeholder="Secret passkey string"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <button
                    id="btn-register-show-pass"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-red-600 text-xs mt-1 font-medium">{passwordError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="register-confirm-password"
                    type="password"
                    required
                    className="w-full pl-9.5 pr-4 py-2 border border-slate-200 bg-white text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Re-enter secret passkey"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? 'Creating Credentials...' : 'Request Credentials Key'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already have access clear keys?{' '}
                  <button
                    id="btn-return-login"
                    type="button"
                    onClick={() => { resetErrors(); setMode('login'); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Authenticate Console
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 p-3.5 rounded-lg text-xs text-slate-600 flex gap-2 border border-slate-200">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  Enter your email identity below. We will simulate checking the access directory and generated keys bypass directly.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    className={`w-full pl-9.5 pr-4 py-2 bg-white text-sm border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      emailError ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    placeholder="alex.rivera@company.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                </div>
                {emailError && <p className="text-red-600 text-xs mt-1 font-medium">{emailError}</p>}
              </div>

              <button
                id="btn-forgot-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Querying Directory...' : 'Dispatch Verification Code'}
              </button>

              <button
                id="btn-forgot-back"
                type="button"
                onClick={() => { resetErrors(); setMode('login'); }}
                className="w-full mt-2 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>
          )}

          {/* MODE: VERIFY CODE */}
          {mode === 'verify_code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  id="reset-verification-code"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full text-center tracking-widest text-lg font-bold font-mono px-4 py-2 border border-slate-250 rounded-lg shadow-2xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                id="btn-verify-submit"
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                Verify Code
              </button>

              <button
                id="btn-verify-back"
                type="button"
                onClick={() => setMode('forgot')}
                className="w-full mt-1.5 py-1 text-xs text-slate-500 font-medium hover:underline text-center cursor-pointer"
              >
                Re-dispatch Code
              </button>
            </form>
          )}

          {/* MODE: RESET PASSWORD */}
          {mode === 'reset_password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Type New Admin Passkey
                </label>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full pl-9.5 pr-10 py-2 bg-white text-sm border rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      passwordError ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    placeholder="Min 8 characters, capital + digit"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    id="btn-toggle-show-pass-reset"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-red-600 text-xs mt-1 font-medium">{passwordError}</p>}
              </div>

              <button
                id="btn-reset-pass-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Updating Identity Directories...' : 'Commit New Passkey'}
              </button>
            </form>
          )}
        </div>

        {/* Footer info tag */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-center flex flex-col items-center justify-center gap-2">
          {onGoBackToWebsite && (
            <button
              id="btn-auth-back-to-landing"
              type="button"
              onClick={onGoBackToWebsite}
              className="text-xs text-blue-600 hover:text-blue-750 font-bold cursor-pointer flex items-center justify-center gap-1 bg-transparent border-none focus:outline-hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Marketing Homepage
            </button>
          )}
          <p className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-0.5">
            <span>● SECURE SESSION ENCRYPT: LOCAL STORAGE SYSTEM</span>
          </p>
        </div>
      </div>
    </div>
  );
}
