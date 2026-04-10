import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { saveSettings } from "../api/settings";
import { useSettings } from "../hooks/useSettings";
import { useI18n } from "../i18n";

type Settings = {
  system_code: string;
  mp4_storage_path: string;
  image_storage_path: string;
  cdn_url: string;
  server_url: string;
};

export default function SystemSettings() {
  const { data, reFetch } = useSettings();
  const { t } = useI18n();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const submit = async () => {
    if (!settings) return;
    setLoading(true);
    try {
      await saveSettings(settings);
      toast.success(t("SystemSettings.toast.saved"));
      reFetch();
    } catch (err) {
      toast.error(t("SystemSettings.toast.save_error"));
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t("SystemSettings.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SettingField
        label={t("SystemSettings.fields.system_code")}
        name="system_code"
        value={settings.system_code}
        onChange={handleChange}
      />
      <SettingField
        label={t("SystemSettings.fields.mp4_storage_path")}
        name="mp4_storage_path"
        value={settings.mp4_storage_path}
        onChange={handleChange}
      />
      <SettingField
        label={t("SystemSettings.fields.image_storage_path")}
        name="image_storage_path"
        value={settings.image_storage_path}
        onChange={handleChange}
      />
      <SettingField
        label={t("SystemSettings.fields.cdn_url")}
        name="cdn_url"
        value={settings.cdn_url}
        onChange={handleChange}
      />
      <SettingField
        label={t("SystemSettings.fields.server_url")}
        name="server_url"
        value={settings.server_url}
        onChange={handleChange}
      />

      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={submit}
          disabled={loading}
          className="px-3 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white dark:text-gray-900 text-sm font-medium rounded transition disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}

function SettingField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
      />
    </div>
  );
}
