import PropTypes from "prop-types";
import { useState } from "react";
import { X } from "lucide-react";
import { SettingsSidebar } from "./SettingsSidebar";
import SettingsSection from "./SettingsSection";
import ThemeSelector from "./ThemeSelector";
import ChangePasswordForm from "./ChangePasswordForm";
import NotificationToggles from "./NotificationToggles";
import { useTheme } from "../../context/ThemeContext";
import { useSettingsStore } from "../../store/settingsStore";

const sections = {
  general: {
    title: "General Preferences",
    description: "Update your basic preferences and workspace details.",
    render: () => (
      <div className="space-y-6">
        <SettingsSection
          title="Workspace Name"
          description="The name used across your workspace."
        >
          <input
            type="text"
            defaultValue="YourCase HQ"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30"
          />
        </SettingsSection>
        <SettingsSection
          title="Default Language"
          description="Select the default language for your workspace."
        >
          <select className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/30">
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Hindi</option>
          </select>
        </SettingsSection>
      </div>
    ),
  },
  account: {
    title: "Account Security",
    description: "Manage your account security and authentication options.",
    render: () => (
      <div className="space-y-6">
        <SettingsSection
          title="Change Password"
          description="Update your password to keep your account secure."
        >
          <ChangePasswordForm />
        </SettingsSection>
        <SettingsSection
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account."
        >
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <p className="mb-3 text-sm">
              2FA is currently{" "}
              <span className="font-semibold text-red-500">disabled</span>.
            </p>
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Enable 2FA
            </button>
          </div>
        </SettingsSection>
      </div>
    ),
  },
  theme: {
    title: "Theme & Appearance",
    description:
      "Switch between light, dark, or system themes for the application.",
    render: ({ theme, setTheme, accentColor, setAccentColor, onThemeChange, onAccentChange }) => (
      <SettingsSection
        title="Appearance"
        description="Choose how YourCase looks on your device."
      >
        <ThemeSelector
          value={theme}
          onChange={onThemeChange || setTheme}
          accentColor={accentColor}
          onAccentChange={onAccentChange || setAccentColor}
        />
      </SettingsSection>
    ),
  },
};

export function SettingsDrawer({ isOpen, onClose }) {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { setTheme: setStoredTheme, setAccentColor: setStoredAccent } =
    useSettingsStore();

  const handleThemeChange = (value) => {
    setStoredTheme(value);
    setTheme(value);
  };

  const handleAccentChange = (value) => {
    setStoredAccent(value);
    setAccentColor(value);
  };
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div
      className={`fixed inset-0 z-[200] transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-4xl transform bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-2xl transition-all duration-300 dark:bg-gray-950 dark:text-gray-100 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-full flex-col lg:flex-row">
          <div className="hidden w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-6 dark:border-gray-800 dark:bg-gray-900 lg:block">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">
              Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Manage your account preferences
            </p>
            <div className="mt-6">
              <nav className="space-y-2">
                {["general", "account", "theme"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="capitalize">{tab}</span>
                    <span className="text-xs uppercase text-gray-300 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {tab === activeTab ? "active" : ""}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-5 dark:border-gray-800">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {activeTab}
                </p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">
                  {sections[activeTab].title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {sections[activeTab].description}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-2 text-gray-500 dark:text-gray-400 dark:text-gray-500 transition hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-5rem)] overflow-y-auto px-6 py-6">
              {sections[activeTab].render({
                theme,
                setTheme,
                accentColor,
                setAccentColor,
                onThemeChange: handleThemeChange,
                onAccentChange: handleAccentChange,
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

SettingsDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SettingsDrawer;
