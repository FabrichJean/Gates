import { useEffect } from "react";
import { SyncLoader } from "react-spinners"

function DeepLoader() {

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = ''; // nécessaire pour Chrome
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);


    return (
        <div className="fixed flex items-center justify-center w-full h-full rounded-2xl shadow-xl p-4 z-50 inset-0 backdrop-blur-xs">
            <SyncLoader className="scale-[1.2]" />
        </div>
    )
}

export default DeepLoader
