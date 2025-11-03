import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { saveSettings } from "../api/settings";
import { useSettings } from "../hooks/useSettings";

type Settings = {
  system_code: string;
  mp4_storage_path: string;
  image_storage_path: string;
  cdn_url: string;
  server_url: string;
};

export default function SystemSettings() {
  const { data, reFetch } = useSettings();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);

  // 🧠 On initialise les settings uniquement quand data arrive
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
      toast.success("✅ Paramètres sauvegardés !");
      reFetch();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("❌ Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Chargement des paramètres...</div>;

  return (
    <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-md p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300 shadow-sm dark:shadow-gray-900">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 transition-colors duration-300">
        ⚙️ Paramètres du système
      </h1>

      <div className="space-y-5">
        <SettingField label="System Code" name="system_code" value={settings.system_code} onChange={handleChange} />
        <SettingField label="MP4 Storage Path" name="mp4_storage_path" value={settings.mp4_storage_path} onChange={handleChange} />
        <SettingField label="Image Storage Path" name="image_storage_path" value={settings.image_storage_path} onChange={handleChange} />
        <SettingField label="CDN URL" name="cdn_url" value={settings.cdn_url} onChange={handleChange} />
        <SettingField label="Server URL" name="server_url" value={settings.server_url} onChange={handleChange} />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={submit}
          disabled={loading}
          className={`px-6 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium 
          transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "💾 Enregistrement..." : "💾 Sauvegarder"}
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
    <div className="flex flex-col">
      <label className="text-gray-700 dark:text-gray-300 font-medium mb-1 transition-colors duration-300">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
      />
    </div>
  );
}
