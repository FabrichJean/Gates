import axios, { type AxiosProgressEvent } from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export const activateVideoBot = async (videoId: number) => {
  const response = await axios.put(
    `${apiURL}/bot-videos/${videoId}/toggleStatus`,
    {},
    { headers: headers() }
  );
  return response.data;
};

export const sendVideoBotToServer = async (videoId: number) => {
  const response = await axios.post(
    `${apiURL}/bot-videos/${videoId}/deep-upload`,
    {},
    { headers: headers() }
  );
  return response.data;
};

export async function updateVideoBotWithProgress(videoId: string | number, formData: FormData, onUploadProgress?: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.put(apiURL + "/bot-videos/" + videoId, formData, {
        headers: headers(),
        onUploadProgress,
    });
}

export const updateVideoBot = async (videoId: number | string | undefined, payload: any) => {
  if (!videoId) throw new Error("Video ID is required");
  const response = await axios.put(
    `${apiURL}/bot-videos/${videoId}`,
    payload,
    { headers: headers() }
  );
  return response.data;
};

export const cancelVideoBotUpload = async (videoId: number) => {
  const response = await axios.post(
    `${apiURL}/bot-videos/${videoId}/cancel`,
    {},
    { headers: headers() }
  );
  return response.data;
};

export const sendMultipleBotVideosToWebapp = async (platformIds: number[], videoIds?: number[]) => {
  const response = await axios.post(
    `${apiURL}/bot-videos/send-to-webapp`,
    { platformIds, videoIds },
    { headers: headers() }
  );
  return response.data;
};

export const convertBotVideoToMp4 = async (videoId: number) => {
  const response = await axios.post(
    `${apiURL}/bot-videos/${videoId}/convert-m3u8`,
    {},
    { headers: headers() }
  );
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFilteredBotVideos(params: any) {
  return await axios.get(`${apiURL}/bot-videos`, {
    headers: headers(),
    params,
  });
}
