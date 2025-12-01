import axios from "axios";
import { apiURL, token } from "../constant";

export type TagCategoryItem = {
	id?: number;
	name: string;
	meta?: string | object | null;
};

export async function getTagCategoriesApi() {
	return await axios.get(`${apiURL}/tag-category`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
}

export async function getTagCategoryByIdApi(id: number) {
	return await axios.get(`${apiURL}/tag-category/${id}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
}

export async function createTagCategoryApi(data: { name: string; meta?: string | object }) {
	return await axios.post(
		`${apiURL}/tag-category`,
		{ name: data.name, meta: data.meta ?? null },
		{ headers: { Authorization: `Bearer ${token()}` } }
	);
}

export async function updateTagCategoryApi(id: number, data: { name?: string; meta?: string | object | null }) {
	return await axios.put(`${apiURL}/tag-category/${id}`, data, {
		headers: { Authorization: `Bearer ${token()}` },
	});
}

export async function deleteTagCategoryApi(id: number) {
	return await axios.delete(`${apiURL}/tag-category/${id}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
}

/**
 * Bulk upsert tag categories.
 * The backend expects a payload like: { tagCategory: [ { id?, name, meta? }, ... ] }
 */
export async function bulkUpsertTagCategoriesApi(items: TagCategoryItem[]) {
	return await axios.post(
		`${apiURL}/tag-category`,
		{ tagCategory: items },
		{ headers: { Authorization: `Bearer ${token()}` } }
	);
}

export default {
	getTagCategoriesApi,
	getTagCategoryByIdApi,
	createTagCategoryApi,
	updateTagCategoryApi,
	deleteTagCategoryApi,
	bulkUpsertTagCategoriesApi,
};
