import SystemSettings from "../components/SystemSettings"

function Settings() {

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-8 flex flex-col items-start">
            <SystemSettings />
        </div>
    )
}

export default Settings