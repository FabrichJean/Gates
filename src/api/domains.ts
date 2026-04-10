import { apiURL, token } from "../constant";
import axios from "axios";

type Source = {
  model: string;
  column: string;
  recordId: number;
};

export type Domain = {
  domain: string;
  count: number;
  protocol: string;
  sources: Source[];
  urls: string[];
};

export type Statistics = {
  totalUrls: number;
  uniqueDomains: number;
  byModel: Record<string, number>;
  byProtocol: Record<string, number>;
};

export type DomainsResponse = {
  success: boolean;
  data: {
    domains: Domain[];
    statistics: Statistics;
  };
};

export const getAllDomains = async (): Promise<DomainsResponse> => {
  const response = await axios.get(`${apiURL}/admin/domains/all`, {
    headers: {
      Authorization: `Bearer ${token()}`,
    },
  });
  return response.data;
};

export const updateDomain = async (
  domainName: string,
  updates: Partial<Domain>
): Promise<Domain> => {
  const response = await axios.put(
    `${apiURL}/admin/domains/${domainName}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
  return response.data;
};

export type ReplacementProgress = {
  status: "starting" | "scanning" | "updating" | "model_completed" | "completed" | "error";
  message: string;
  totalModels: number;
  currentModel: number;
  modelName: string;
  modelProgress: number;
  updatedSoFar: number;
  replacementsSoFar: number;
  timestamp: string;
};

export const replaceDomain = async (
  oldDomain: string,
  newDomain: string
): Promise<{ success: boolean; message: string; notification: string }> => {
  const response = await axios.post(
    `${apiURL}/admin/domains/replace`,
    { oldDomain, newDomain },
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
  return response.data;
};
