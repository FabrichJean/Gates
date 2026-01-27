
import axios, { type AxiosProgressEvent } from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import { socket } from "../utils/socket";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFilteredVideos(params: any) {
    return await axios.get(`${apiURL}/videos`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        params
    })
}

export async function transcodeVideo(videoId: string | number | undefined, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/transcode`, null, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        onUploadProgress
    });
}

export async function uploadS3(videoId: string | number | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/upload`, { socketId: socket.id }, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadVideo(formData: FormData, onUploadProgress?: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.post(apiURL + "/videos/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        },
        onUploadProgress,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateVideo(videoId: string | number, formData: FormData | Object, onUploadProgress?: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.put(apiURL + "/videos/" + videoId, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        },
        onUploadProgress,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deletePerm(videoId: string | number): Promise<any> {
    return await axios.delete(apiURL + "/videos/" + videoId + '/permanently', {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function archiveVideo(videoId: string | number): Promise<any> {
    return await axios.delete(apiURL + "/videos/" + videoId, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

export async function uploadCover(videoId: string | number): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/upload-cover`, null, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

export async function sendProcessing(videoId: string | number) {
    return await axios.post(`${apiURL}/videos/${videoId}/deep-upload`, null, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        }
    });
}


export async function toggleStatus(videoId: string | number): Promise<void> {
    return await axios.put(`${apiURL}/videos/${videoId}/toggleStatus`, null, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

export async function webApp(plateformIds?: number[] | null) {
    // send platform ids in request body (supports multiple)
    const data = plateformIds ? { plateformIds } : {};
    return await axios.post(`${apiURL}/videos/send-to-server`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    })
}

export async function cancelUpload(videoId: string | number): Promise<void> {
    return await axios.put(`${apiURL}/videos/${videoId}/cancel-process`, null, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

// Single Sync API
export async function singleSync({ entity, origin_id, isForce, plateformId }: { entity: string; origin_id: number | string; isForce: boolean; plateformId?: number }) {
    const requestBody: any = { entity, origin_id };
    
    // Add plateformId to request body if provided
    if (plateformId !== undefined && plateformId !== null) {
        requestBody.plateformId = plateformId;
    }
    
    return await axios.post(
        `${apiURL}/synchronize/single?isForce=${isForce}`,
        requestBody,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        }
    );
}

// Multiple Sync API - sends entire page at once
export async function multipleSync({ entity, originIds, isForce, plateformId, signal }: { entity: string; originIds: number[]; isForce: boolean; plateformId?: number; signal?: AbortSignal }) {
    const requestBody: any = { 
        isForce,
        [entity]: originIds.map(id => ({ originId: id }))
    };
    
    // Add plateformId to request body if provided
    if (plateformId !== undefined && plateformId !== null) {
        requestBody.plateformId = plateformId;
    }
    
    return await axios.post(
        `${apiURL}/synchronize/multiple`,
        requestBody,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            signal, // Add abort signal support
        }
    );
}

export async function toggleBannedStatus(videoId: string | number): Promise<void> {
    return await axios.put(`${apiURL}/videos/${videoId}/toggle-banned`, null, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

export async function updateBannedStatus(videoId: string | number, isBanned: boolean): Promise<void> {
    // Send as FormData so client can use multipart/form-data if needed
    const formData = new FormData();
    formData.append("isBanned", String(isBanned));
    return await axios.put(`${apiURL}/videos/${videoId}`, formData, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
        },
    });
}

// Get videos for bulk sync (page 1 with limited results)
export async function getVideosForBulkSync(page: number = 1, limit: number = 50, plateformId?: number) {
    const params: any = {
        page,
        limit,
        select: 'id,title,status,cover,plateform_id', // Include plateform_id field
        processing: 'done'
    };
    
    // Add plateformId filter if provided
    if (plateformId !== undefined && plateformId !== null) {
        params.plateform_id = plateformId;
    }
    
    return await axios.get(`${apiURL}/videos`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
        params
    });
}