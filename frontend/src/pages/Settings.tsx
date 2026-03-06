import React, { useState } from "react";

const cardStyle =
  "bg-white border border-zinc-400 rounded-xl p-5 shadow-sm flex flex-col gap-4";

const Toggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      enabled ? "bg-secondary" : "bg-zinc-200"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
        enabled ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className="mb-4">
    <h2 className="text-xs font-semibold text-zinc-800 uppercase tracking-widest">
      {title}
    </h2>
    {description && (
      <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
    )}
  </div>
);

const FieldRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0 gap-6">
    <span className="text-sm text-zinc-700 shrink-0">{label}</span>
    <div className="flex-1 flex justify-end">{children}</div>
  </div>
);

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "alex@example.com",
    currency: "USD",
  });

  const [notifications, setNotifications] = useState({
    goalMilestones: true,
    monthlyDigest: true,
    offTrackAlerts: true,
    newFeatures: false,
  });

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="py-8 px-4 flex flex-col gap-6">
      {/* Page Title */}
      <div>
        <h1 className="page-title font-serifDisplay">Settings</h1>
      </div>

      {/* Profile Information */}
      <section className={cardStyle}>
        <SectionHeader title="Profile" />

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-zinc-100">
          <div className="w-14 h-14 rounded-full object-contain bg-zinc-900 flex items-center justify-center shrink-0">
            <img
              className="rounded-full"
              src="https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/24510842/john_wick_chapter_4_JW4_Unit_211027_00134_R2_rgb.jpeg?quality=90&strip=all&crop=19.583333333333%2C0%2C60.833333333333%2C100&w=2400"
              alt=""
            />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{profile.name}</p>
            <p className="text-xs text-zinc-400">{profile.email}</p>
          </div>
          <button className="ml-auto text-xs font-medium text-zinc-500 hover:text-zinc-800 border border-zinc-200 rounded-lg px-3 py-1.5 transition-colors">
            Change photo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Name</label>
            <input
              className="border rounded-md px-3 py-2"
              placeholder="John Doe"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Email</label>
            <input
              className="border rounded-md px-3 py-2"
              placeholder="john@email.com"
            />
          </div>
        </div>

        <button className="self-start px-4 py-2 rounded-md bg-black text-white text-sm">
          Save Changes
        </button>
      </section>

      {/* Account Settings */}
      <section className={cardStyle}>
        <SectionHeader title="Account & Security" />

        <FieldRow label="Currency">
          <select
            name="currency"
            value={profile.currency}
            onChange={handleProfileChange}
            className="border border-zinc-200 rounded-lg px-3 py-1.5 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all appearance-none"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="AUD">AUD — Australian Dollar</option>
          </select>
        </FieldRow>

        <FieldRow label="Password">
          <button className="text-xs font-medium text-zinc-500 hover:text-zinc-800 border border-zinc-200 rounded-lg px-3 py-1.5 transition-colors">
            Change password
          </button>
        </FieldRow>

        <FieldRow label="Two-factor authentication">
          <button className="text-xs font-medium text-zinc-500 hover:text-zinc-800 border border-zinc-200 rounded-lg px-3 py-1.5 transition-colors">
            Enable 2FA
          </button>
        </FieldRow>
      </section>

      {/* App Preferences */}
      <section className={cardStyle}>
        <SectionHeader
          title="Notifications"
          description="Choose what updates you want to hear about."
        />

        {(
          [
            {
              key: "goalMilestones",
              label: "Goal milestones",
              sub: "When you hit 25%, 50%, 75%, or 100% of a goal",
            },
            {
              key: "offTrackAlerts",
              label: "Off-track alerts",
              sub: "When a goal is projected to miss its target date",
            },
            {
              key: "monthlyDigest",
              label: "Monthly digest",
              sub: "A summary of your progress every month",
            },
            {
              key: "newFeatures",
              label: "Product updates",
              sub: "New features and announcements",
            },
          ] as const
        ).map(({ key, label, sub }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0 gap-4"
          >
            <div>
              <p className="text-sm text-zinc-800">{label}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
            </div>
            <Toggle
              enabled={notifications[key]}
              onChange={() => toggleNotification(key)}
            />
          </div>
        ))}
      </section>

      {/* Danger Zone */}
      <section className={`${cardStyle} border-red-200`}>
        <SectionHeader title="Account actions" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between py-3 border-b border-zinc-100">
            <div>
              <p className="text-sm text-zinc-800">Sign Out</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sign out of your account on this device.
              </p>
            </div>
            <button className="text-xs font-medium text-zinc-500 hover:text-zinc-800 border border-zinc-200 rounded-lg px-3 py-1.5 transition-colors shrink-0">
              Sign out
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-zinc-100">
            <div>
              <p className="text-sm text-rose-600">Delete Account</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Permanently delete your account and all data.
              </p>
            </div>
            <button className="text-xs font-medium text-rose-500 hover:text-rose-800 border border-rose-200 rounded-lg px-3 py-1.5 transition-colors shrink-0">
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
