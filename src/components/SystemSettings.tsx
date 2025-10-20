import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { saveSettings, type TSettings } from "../api/settings";
import { apiURL, token } from "../constant";

export default function SystemSettings() {

    // Single local state for settings. We'll fetch once on mount using axios.
    const [settings, setSettings] = useState<Partial<TSettings> | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${apiURL}/settings`, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
                const remote = res?.data?.settings ?? res?.data;
                if (mounted) setSettings(remote);
            } catch (err) {
                console.error("Failed to fetch settings", err);
                toast.error("Impossible de charger les paramètres");
            }
        };
        fetchSettings();
        return () => {
            mounted = false;
        };
    }, []);

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...(prev ?? {}), [name]: value }));
    };

    const submit = async () => {
        setLoading(true);
        try {
            if (!settings) return;
            await saveSettings(settings as TSettings);
            toast.success("Paramètres sauvegardés !");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl w-full bg-white rounded-lg p-8 border border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                System Settings
            </h1>

            <div className="space-y-5">
                <SettingField
                    label="System Code"
                    name="system_code"
                    value={settings?.system_code ?? ""}
                    onChange={handleChange}
                />
                <SettingField
                    label="MP4 Storage Path"
                    name="mp4_storage_path"
                    value={settings?.mp4_storage_path ?? ""}
                    onChange={handleChange}
                />
                <SettingField
                    label="Image Storage Path"
                    name="image_storage_path"
                    value={settings?.image_storage_path ?? ""}
                    onChange={handleChange}
                />
                <SettingField
                    label="CDN URL"
                    name="cdn_url"
                    value={settings?.cdn_url ?? ""}
                    onChange={handleChange}
                />
                <SettingField
                    label="SERVER URL"
                    name="server_url"
                    value={settings?.server_url ?? ""}
                    onChange={handleChange}
                />
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={submit}
                    disabled={loading}
                    className="relative flex items-center justify-center gap-2 px-6 py-2.5
    font-medium text-sm rounded-xl transition-all duration-300
    backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/90 hover:bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                >
                    {loading ? "Saving..." : "💾 Save Settings"}
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
            <label className="text-gray-700 font-medium mb-1">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-gray-600 focus:outline-none"
            />
        </div>
    );
}
