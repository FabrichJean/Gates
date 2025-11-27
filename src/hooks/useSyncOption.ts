import { useState } from "react";
import { apiURL, token } from "../constant";
import axios from "axios";

type SyncPayload = {
    isForce: boolean;
    label?: string | null;
    platformId?: number | null;
};

type SyncResult = any;

export default function useSyncOption() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<SyncResult | null>(null);

    const sync = async ({ isForce, label, platformId }: SyncPayload) => {
        setLoading(true);
        setError(null);
        try {

            const url = label ? `${apiURL}/synchronize/retry/${label}?isForce=${isForce}` : `${apiURL}/synchronize/?isForce=${isForce}`;

            const option: any = {
                params: { isForce },
                headers: {
                    Authorization: `Bearer ${token()}`
                }
            };

            let payload: { body?: { plateformId?: number } } = {};
            // Add platformId to the request body if provided
            if (platformId) {
                payload.body = { plateformId: platformId };
            }

            const res = await axios.post(url, payload.body, option);

            if (res.status < 200 || res.status >= 300) {
                // throw new Error(`Sync failed: ${res.status} ${res.statusText}`);
                alert(`Sync failed: ${res.status} ${res.statusText}`);
            }

            // return alert(res.data);

            setData(res.data);
            // return res.data;
            console.log(res.data);
            return res.data;
            

        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { sync, loading, error, data } as const;
}
