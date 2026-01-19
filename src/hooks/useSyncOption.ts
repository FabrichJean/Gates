import { useState } from "react";
import { apiURL, token } from "../constant";
import axios from "axios";

type SyncPayload = {
  isForce: boolean;
  label?: number | null;
  platformId?: number | null;
  isAll?: boolean | null;
};

type SyncResult = {
  id: number;
  entity:
    | "videos"
    | "posts"
    | "category"
    | "users"
    | "plateform"
    | "sync_process";
  action:
    | "payload"
    | "patch"
    | "identifiers"
    | "upload"
    | "sync"
    | "validation"
    | "processing";
  error_message: string;
  stack_trace: string | null;
  severity: "info" | "warning" | "error" | "critical";
  plateform_id: number | null;
  entity_id: number | null;
  error_json: object | null;
  metadata: object | null;
  request: object | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: number | null;
  resolution_notes: string | null;
  createdAt: string;
  updatedAt: string;
  plateform: {
    id: number;
    name: string;
    video_sync_url: string;
  } | null;
}[];

export default function useSyncOption() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SyncResult | null>(null);

  const sync = async ({
    isForce,
    label,
    platformId,
    isAll,
  }: SyncPayload) => {
    setLoading(true);
    setError(null);
    try {
      const base = label
        ? `${apiURL}/synchronize/retry/${label}`
        : `${apiURL}/synchronize/`;

      const params = new URLSearchParams();
      params.set("isForce", String(isForce));
      if (typeof isAll !== "undefined" && isAll !== null) {
        params.set("isAll", String(isAll));
      }

      const url = params.toString() ? `${base}?${params.toString()}` : base;

      const option: any = {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      };

      let payload: { body?: { plateformId?: number } } = {};
      if (platformId) {
        payload.body = { plateformId: platformId };
      }

      const res = await axios.post(url, payload.body, option);

      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Sync failed: ${res.status} ${res.statusText}`);
      }

      setData(res.data);
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
