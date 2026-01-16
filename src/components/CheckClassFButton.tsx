import React, { useState } from 'react';
import axios from 'axios';
import { apiURL } from '../constant';

export default function CheckClassFButton({ batchSize = 50 }) {
    const [loading, setLoading] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [error, setError] = useState(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        setJobId(null);
        try {
            const res = await axios.post(
                `${apiURL}/videos-for-app/checkClassF`,
                { batchSize },
                { headers: { 'Content-Type': 'application/json' } }
            );
            const id = res.data?.jobId ?? res.data?.id ?? res.data;
            setJobId(id);
        } catch (e) {
            setError(e.response?.data?.message ?? e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <button
                onClick={handleClick}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
                {loading ? 'Envoi...' : 'Lancer vérification ClassF'}
            </button>

            {jobId && (
                <a
                    href={`${apiURL}/videos-for-app/checkClassF/${jobId}/status`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline text-sm"
                >
                    Job créé — voir statut (ID: {String(jobId)})
                </a>
            )}

            {error && <div className="text-red-600 text-sm">Erreur: {error}</div>}
        </div>
    );
}