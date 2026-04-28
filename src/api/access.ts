import axios from 'axios';
import { apiURL, token } from '../constant';

export interface AccessRecord {
  id: number;
  user_id: number;
  target_user_id: number;
  entity: 'video' | 'post' | 'video_for_app' | 'post_for_app';
  resource_id: number;
  createdAt: string;
  updatedAt: string;
  user?: any;
  targetUser?: any;
  resource?: any;
}

export interface AccessListResponse {
  total: number;
  resource: {
    video: AccessRecord[];
    post: AccessRecord[];
    video_for_app: AccessRecord[];
    post_for_app: AccessRecord[];
  };
  page: number;
  limit: number;
}

const api = axios.create({
  baseURL: apiURL,
  headers: {
    Authorization: `Bearer ${token()}`,
  },
});

export const accessAPI = {
  list: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
    user_id?: number;
    target_user_id?: number;
    entity?: string;
    resource_id?: number;
  }): Promise<AccessListResponse> => {
    const response = await api.get('/access/list', { params });
    return response.data;
  },

  create: async (data: {
    target_user_id: number;
    entity: 'video' | 'post' | 'video_for_app' | 'post_for_app';
    resource_id: number;
  }): Promise<{ message: string; access: AccessRecord }> => {
    const response = await api.post('/access/add', data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string; id: number }> => {
    const response = await api.delete(`/access/${id}`);
    return response.data;
  },
};

export default accessAPI;
