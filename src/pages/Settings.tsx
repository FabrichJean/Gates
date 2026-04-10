import SystemSettings from "../components/SystemSettings";
import DomainManagement from "../components/DomainManagement";
import TabContainer from "../components/TabContainer";
import type { Tab } from "../components/TabContainer";

function Settings() {
  const tabs: Tab[] = [
    {
      id: "system",
      label: "System",
      content: <SystemSettings />,
    },
    {
      id: "domains",
      label: "Domains",
      content: <DomainManagement />,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-all duration-300 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage system and domain configurations
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded">
          <div className="p-6">
            <TabContainer tabs={tabs} defaultTab="system" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;