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
