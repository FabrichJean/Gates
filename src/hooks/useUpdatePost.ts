import { useState } from "react";
import axios from "axios";
import { apiURL, token } from "../constant";

type Payload = Record<string, unknown> | FormData;

export default function useUpdatePost() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updatePost = async (idPOst: number | string | undefined, payload: Payload) => {
        if (!idPOst) throw new Error("Post id is required");
        console.log( "Identifiant de post à modifier: " + idPOst);
        
        try {
            setLoading(true);
            setError(null);

            // If payload is FormData, let axios set the Content-Type (multipart/form-data with boundary)
            const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
            const headers: Record<string, string> = {
                Authorization: `Bearer ${token()}`,
            };
            if (!isForm) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await axios.put(`${apiURL}/posts/${idPOst}`, payload, {
                headers,
            });

            setLoading(false);
            return response.data;
        } catch (err) {
            setLoading(false);
            if (axios.isAxiosError(err)) {
                setError(new Error(err.response?.data?.message || err.message));
                throw err;
            }
            const e = err instanceof Error ? err : new Error("Unknown error");
            setError(e);
            throw e;
        }
    };

    return { updatePost, loading, error } as const;
}
