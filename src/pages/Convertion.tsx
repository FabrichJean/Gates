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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FileSpreadsheet className="w-8 h-8 text-green-500" />
                        <h1 className="text-3xl font-bold text-gray-800">Excel Conversion</h1>
                    </div>
                    <p className="text-gray-600">Upload your Excel file</p>
                </div>

                {/* Main Form */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    {/* File Upload Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                                        : 'border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <div className="text-center">
                                    <Upload className={`w-8 h-8 mx-auto mb-2 ${loading ? 'text-gray-300' : 'text-gray-400'}`} />
                                    <p className={`text-sm ${loading ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {loading ? (
                                            <span className="text-gray-400">
                                                ⏳ Conversion in progress...
                                            </span>
                                        ) : file ? (
                                            <span className="text-green-600 font-medium">
                                                📄 {file.name}
                                            </span>
                                        ) : (
                                            <>
                                                Click to select an Excel file
                                                <br />
                                                <span className="text-xs text-gray-400">(.xlsx, .xls)</span>
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
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${!file || loading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                            className={`px-6 py-3 border rounded-lg transition-colors ${
                                loading 
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Reset
                        </button>
                    </div>

                    {/* Info Section */}
                    {file && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">File Information</h4>
                            <div className="text-sm text-blue-700 space-y-1">
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