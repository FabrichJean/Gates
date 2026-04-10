import type { ReactNode } from 'react';
import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabContainerProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export default function TabContainer({
  tabs,
  defaultTab,
  onChange,
}: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  if (tabs.length === 0) {
    return <div className="text-gray-500">Aucun onglet disponible</div>;
  }

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
        <nav className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div>
        {activeTabContent}
      </div>
    </div>
  );
}
