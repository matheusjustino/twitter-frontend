// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

export async function getTweets({ limit = 10, skip = 0, filters = {} }) {
	const config = {
		params: {
			filters,
			limit,
			skip,
		},
	};
	return await api
		.get<PostInterface[]>(`/posts`, config)
		.then((res) => res.data);
}
