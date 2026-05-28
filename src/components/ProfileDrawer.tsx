import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, KeyRound, Palette, Briefcase, User, Info, Lock } from 'lucide-react';
import { UserProfile, UserSession } from '../types';
import { getRegisteredUsers, saveRegisteredUsers, saveSession } from '../utils/auth';
import { validatePassword } from '../utils/validation';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onProfileUpdated: (updatedUser: UserProfile) => void;
  triggerNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
  writeLog: (schemaId: string, schemaName: string, action: any, details: string) => void;
}

const PALETTE_OPTIONS = [
  { value: '#2563eb', label: 'Classic Blue' },
  { value: '#16a34a', label: 'Forest Green' },
  { value: '#7c3aed', label: 'Royal Purple' },
  { value: '#ea580c', label: 'Sunset Orange' },
  { value: '#db2777', label: 'Vibrant Pink' },
  { value: '#0f172a', label: 'Deep Slate' }
];

export default function ProfileDrawer({
  isOpen,
  onClose,
  session,
  onProfileUpdated,
  triggerNotification,
  writeLog
}: ProfileDrawerProps) {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState('#2563eb');
  
  // Password updates
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bootstrap values when opening
  useEffect(() => {
    if (isOpen && session.user) {
      setDisplayName(session.user.displayName || '');
      setRole(session.user.role || '');
      setBio(session.user.bio || '');
      setAvatarColor(session.user.avatarColor || '#2563eb');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrors({});
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // 1. Validate Profile Fields
    if (!displayName.trim()) {
      newErrors.displayName = 'Display Name is required.';
    }
    if (!role.trim()) {
      newErrors.role = 'Role is required.';
    }

    // 2. Validate Password Changes if requested
    const WantsPasswordReset = currentPassword || newPassword || confirmNewPassword;
    if (WantsPasswordReset) {
      const users = getRegisteredUsers();
      const currentHash = users[session.user.email.toLowerCase()]?.passwordHash;

      if (currentPassword !== currentHash) {
        newErrors.currentPassword = 'Current password does not match our directory credentials.';
      }

      const passValError = validatePassword(newPassword);
      if (passValError) {
        newErrors.newPassword = passValError;
      }

      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerNotification('Please correct the validation errors first.', 'error');
      return;
    }

    setLoading(true);

    // Simulate Server-side verification and persistence
    setTimeout(() => {
      const users = getRegisteredUsers();
      const emailKey = session.user.email.toLowerCase();

      if (!users[emailKey]) {
        setLoading(false);
        triggerNotification('Account profile record not found in system directory.', 'error');
        return;
      }

      const updatedUserRecord = {
        ...users[emailKey],
        displayName: displayName.trim(),
        role: role.trim(),
        bio: bio.trim(),
        avatarColor: avatarColor,
        _updatedAt: new Date().toISOString()
      };

      if (WantsPasswordReset) {
        updatedUserRecord.passwordHash = newPassword;
      }

      users[emailKey] = updatedUserRecord;
      saveRegisteredUsers(users);

      const updatedProfile: UserProfile = {
        id: session.user.id,
        email: session.user.email,
        displayName: displayName.trim(),
        role: role.trim(),
        bio: bio.trim(),
        avatarColor: avatarColor,
        createdAt: session.user.createdAt
      };

      const updatedSession: UserSession = {
        user: updatedProfile,
        token: session.token
      };

      saveSession(updatedSession);
      onProfileUpdated(updatedProfile);
      setLoading(false);
      writeLog(
        'security',
        'Identity Directory',
        'auth_profile_update',
        `User "${updatedProfile.displayName}" modified their credential identity card settings.`
      );
      
      triggerNotification('Profile configurations saved securely to local cache.', 'success');
      onClose();
    }, 700);
  };

  return (
    <div id="profile-drawer-container" className="fixed inset-0 z-50 overflow-hidden font-sans" aria-labelledby="profile-drawer-title" role="dialog" aria-modal="true">
      {/* Dark overlay backdrop */}
      <div 
        id="profile-drawer-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex h-full">
        {/* Sliding card */}
        <div 
          id="profile-drawer-panel"
          className="w-screen max-w-md transform transition-all duration-300 ease-in-out bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="py-6 px-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
            <div>
              <h2 id="profile-drawer-title" className="text-lg font-semibold tracking-tight text-slate-00">
                Manage Profile settings
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Configure your display avatar, information and passkeys.
              </p>
            </div>
            <button
              id="btn-close-profile-drawer"
              onClick={onClose}
              className="rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 focus:outline-hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form scrollable body */}
          <form id="profile-update-form" onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Identity Card Details */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-inner uppercase"
                style={{ backgroundColor: avatarColor }}
              >
                {displayName ? displayName.split(' ').map(n=>n[0]).join('').substring(0,2) : 'A'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-mono">{session.user.email}</h4>
                <p className="text-xs text-slate-500">Registered member: {new Date(session.user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                PERSONAL PARTICULARS
              </h3>

              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Display name
                </label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="profile-displayName"
                    type="text"
                    className={`w-full pl-9.5 pr-4 py-2 border text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      errors.displayName ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                {errors.displayName && <p className="text-red-600 text-xs mt-1 font-medium">{errors.displayName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Professional Role / Status
                </label>
                <div className="relative">
                  <Briefcase className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="profile-role"
                    type="text"
                    className={`w-full pl-9.5 pr-4 py-2 border text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      errors.role ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                {errors.role && <p className="text-red-00 text-xs mt-1 font-medium">{errors.role}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Short Bio Description (Optional)
                </label>
                <div className="relative">
                  <Info className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <textarea
                    id="profile-bio"
                    className="w-full pl-9.5 pr-4 py-2 border border-slate-200 text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 h-20 resize-none transition-all"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Provide a short sentence about you..."
                  />
                </div>
              </div>

              {/* Theme Color selectors swatches */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  AVATAR THEMING STYLE
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PALETTE_OPTIONS.map((color) => (
                    <button
                      id={`btn-color-${color.value}`}
                      key={color.value}
                      type="button"
                      onClick={() => setAvatarColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        avatarColor === color.value ? 'scale-110 border-slate-800 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    >
                      {avatarColor === color.value && <ShieldCheck className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Secret key updates */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2">
                <Palette className="w-4 h-4 text-slate-500" />
                SECURITY CREDS (EDIT TO UPDATE)
              </h3>

              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Current Password secret
                </label>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="profile-current-password"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full pl-9.5 pr-4 py-2 border text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      errors.currentPassword ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                {errors.currentPassword && <p className="text-red-600 text-xs mt-1 font-medium">{errors.currentPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  New Password secret
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="profile-new-password"
                    type="password"
                    placeholder="At least 8 chars, 1 uppercase, 1 number"
                    className={`w-full pl-9.5 pr-4 py-2 border text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      errors.newPassword ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
                  <input
                    id="profile-confirm-password"
                    type="password"
                    placeholder="Re-type new passkey"
                    className={`w-full pl-9.5 pr-4 py-2 border text-sm rounded-lg shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all ${
                      errors.confirmNewPassword ? 'border-red-500 bg-red-50/5' : 'border-slate-200'
                    }`}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                {errors.confirmNewPassword && <p className="text-red-600 text-xs mt-1 font-medium">{errors.confirmNewPassword}</p>}
              </div>
            </div>

          </form>

          {/* Action buttons footer */}
          <div className="py-4 px-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              id="btn-profile-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-hidden transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-profile-save"
              type="submit"
              disabled={loading}
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-hidden flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Verifying Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
