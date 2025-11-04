import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import { apiURL } from '../constant';
import { getToken } from '../utils/storage';

const Conversion = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(() => {
        // Récupérer l'état de loading depuis localStorage au chargement
        return localStorage.getItem('excel_conversion_loading') === 'true';
    });

    // Fonction pour mettre à jour l'état de loading
    const updateLoadingState = (isLoading: boolean) => {
        setLoading(isLoading);
        if (isLoading) {
            localStorage.setItem('excel_conversion_loading', 'true');
        } else {
            localStorage.removeItem('excel_conversion_loading');
        }
    };

    // Effet pour surveiller les changements dans localStorage (cas d'autres onglets)
    useEffect(() => {
        const handleStorageChange = () => {
            const storageLoading = localStorage.getItem('excel_conversion_loading') === 'true';
            setLoading(storageLoading);
        };

        // Écouter les changements de localStorage
        window.addEventListener('storage', handleStorageChange);
        
        // Vérifier périodiquement l'état au cas où le localStorage serait modifié
        const interval = setInterval(handleStorageChange, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            // Check that it's an Excel file
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
            ];

            if (!validTypes.includes(selectedFile.type)) {
                toast.error('Please select an Excel file (.xlsx or .xls)');
                return;
            }

            setFile(selectedFile);
            toast.success(`File "${selectedFile.name}" selected`);
        }
    };

    const downloadFile = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleConvert = async () => {
        if (!file) {
            toast.error('Please select an Excel file');
            return;
        }

        updateLoadingState(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('file', file);

            const response = await axios.post(`${apiURL}/uploads/excel`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob'
            });

            // Get the file as blob
            const blob = response.data;

            // Generate filename with timestamp
            const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `${originalName}_converted_${timestamp}.xlsx`;

            // Automatic download
            downloadFile(blob, filename);

            toast.success(` Conversion successful! File downloaded: ${filename}`);

        } catch (error: any) {
            console.error('Error during conversion:', error);

            // Handle axios errors
            if (error.response) {
                toast.error(`Error ${error.response.status}: ${error.response.data || 'Server error'}`);
            } else if (error.request) {
                toast.error('Network error: Unable to reach the server');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            updateLoadingState(false);
        }
    };

    const resetForm = () => {
        if (loading) return; // Empêcher le reset pendant le loading
        
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // S'assurer que le loading est bien désactivé
        updateLoadingState(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900 p-6 mb-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <FileSpreadsheet className="w-8 h-8 text-green-500 dark:text-green-400" />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">Excel Conversion</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Upload your Excel file</p>
                </div>

                {/* Main Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900 p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    {/* File Upload Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                            Excel File
                        </label>
                        <div className="relative">
                            <input
                                id="file-input"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                disabled={loading}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-input"
                                className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
                                    loading 
                                        ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-not-allowed' 
                                        : 'border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="text-center">
                                    <Upload className={`w-8 h-8 mx-auto mb-2 ${loading ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'}`} />
                                    <p className={`text-sm ${loading ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'} transition-colors duration-300`}>
                                        {loading ? (
                                            <span className="text-gray-400 dark:text-gray-500">
                                                ⏳ Conversion in progress...
                                            </span>
                                        ) : file ? (
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                📄 {file.name}
                                            </span>
                                        ) : (
                                            <>
                                                Click to select an Excel file
                                                <br />
                                                <span className="text-xs text-gray-400 dark:text-gray-500">(.xlsx, .xls)</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleConvert}
                            disabled={!file || loading}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${!file || loading
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Convert & Download
                                </>
                            )}
                        </button>

                        <button
                            onClick={resetForm}
                            disabled={loading}
                            className={`px-6 py-3 border rounded-lg transition-colors duration-300 ${
                                loading 
                                    ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700' 
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
                            }`}
                        >
                            Reset
                        </button>
                    </div>
                    {/* Info Section */}
                    {file && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-300">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">File Information</h4>
                            <div className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                                <p><strong>Name:</strong> {file.name}</p>
                                <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                                <p><strong>Type:</strong> {file.type}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Conversion;