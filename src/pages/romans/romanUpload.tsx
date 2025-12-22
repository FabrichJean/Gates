import { Tag } from "lucide-react";
import { useState } from "react";



const RomanUpload = () => {

    const [ref, setRef] = useState<string | null>(null);

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Upload Roman
                    </h1>
                </div>
                {/*  */}

                {/* Reference */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Reference
                    </h2>
                    <input
                        type="text"
                        value={ref || ""}
                        onChange={(e) => setRef(e.currentTarget.value.trim())}
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                        placeholder="Video reference"
                    />
                </div>

                {/* File Uploads */}
                {/* <div className=" gap-6 mb-4">
                    <UploadBox
                        label="Cover Image"
                        onClick={handleCoverClick}
                        onDrop={(f) => handleFileChange(f, "cover")}
                        preview={coverPreview}
                        inputRef={coverInputRef}
                        accept="image/*"
                        onChange={handleCoverChange}
                        emptyMessage="Click or drag an image (PNG, JPG, WEBP, etc.)"
                        icon={<Image className="w-8 h-8" />}
                    />
                </div> */}
            </div>
        </>
    );
};

export default RomanUpload;