import React, { useState } from 'react';
import { useAuthStore } from '../../../business/store/auth.store';
import { User, Settings, ShieldAlert, Sparkles, BrainCircuit, Bell, Save, CheckCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'preferences'>('profile');
  
  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // AI Configuration State
  const [llmModel, setLlmModel] = useState('gemini-2.5-flash');
  const [tavilyResults, setTavilyResults] = useState(5);
  const [deepResearch, setDeepResearch] = useState(true);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Application Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [prefSuccess, setPrefSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (password && password !== confirmPassword) {
      setProfileError('Passwords do not match.');
      return;
    }

    try {
      await updateProfile(name, password || undefined);
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile.');
    }
  };

  const handleSaveAISettings = (e: React.FormEvent) => {
    e.preventDefault();
    setAiSuccess(true);
    setTimeout(() => setAiSuccess(false), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSuccess(true);
    setTimeout(() => setPrefSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Manage your researcher profile, calibrate multi-agent LLM systems, and configure notification alerts.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex gap-2 border-b border-slate-205 pb-px dark:border-slate-800/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <User className="h-4 w-4" />
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'ai'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="h-4 w-4" />
          AI Configurations
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'preferences'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="h-4 w-4" />
          Alerts & Preferences
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Card: Summary info */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600/10 text-2xl font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-md">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </div>
              <h3 className="mt-4 font-black text-slate-900 dark:text-white text-lg">{user?.name}</h3>
              <p className="text-xs text-slate-500 font-semibold">{user?.email}</p>
              
              <div className="mt-6 w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-left text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-500 font-semibold">User Role</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{user?.role}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-500 font-semibold">License Tier</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Premium Active
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-500 font-semibold">Account Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-450 uppercase">Verified</span>
                </div>
              </div>
            </div>

            {/* Right Card: Input Fields */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 lg:col-span-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                Edit Profile Information
              </h3>

              {profileSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-605 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 dark:bg-rose-955/20 dark:text-rose-455">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 opacity-60">
                    <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="rounded-xl border border-slate-200 bg-slate-105/50 px-3.5 py-2.5 text-sm font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Change Account Password</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        minLength={8}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        minLength={8}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-xl bg-blue-650 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 max-w-4xl">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <BrainCircuit className="h-5 w-5 text-blue-600" />
              Configure AI Research Parameters
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-6">
              Adjust LLM architectures, research iterations, and search behaviors to calibrate multi-agent report compilations.
            </p>

            {aiSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-605 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>AI Configuration saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveAISettings} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Preferred LLM Architecture</label>
                  <select
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Optimized Speed)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Tavily Web Search Results limit</label>
                  <select
                    value={tavilyResults}
                    onChange={(e) => setTavilyResults(parseInt(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value={3}>3 Results (Fastest)</option>
                    <option value={5}>5 Results (Balanced)</option>
                    <option value={10}>10 Results (Detailed)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50/70 p-4 dark:bg-slate-950/40">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Enable Multi-Agent Deep Research Loops</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Allows the graph workflow to perform iterative searches if query validation fails.</p>
                </div>
                <input
                  type="checkbox"
                  checked={deepResearch}
                  onChange={(e) => setDeepResearch(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-blue-650 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" /> Save AI Preferences
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/75 max-w-4xl">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Manage Alerts and Notifications
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-6">
              Configure how and when you receive intelligence reports and critical price movements.
            </p>

            {prefSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-605 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Notification preferences saved!</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-5">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Email Notifications</h4>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1">Receive updates when a requested research report completes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:ring-offset-slate-900"
                  />
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Watchlist Price Alerts</h4>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1">Receive instant triggers when tracked tickers shift by more than 3% in a day.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={priceAlerts}
                    onChange={(e) => setPriceAlerts(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:ring-offset-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Weekly Performance Digest</h4>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1">A curated digest of news consensus and portfolio metrics delivered weekly.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:ring-offset-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-blue-650 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" /> Save Alerts
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
