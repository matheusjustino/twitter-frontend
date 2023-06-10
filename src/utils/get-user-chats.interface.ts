// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { ChatInterface } from "@/interfaces/chat.interface";

export async function getUserChats({ limit = 10, skip = 0, filters = {} }) {
	const config = {
		params: {
			limit,
			skip,
			filters,
		},
	};
	return api.get<ChatInterface[]>(`/chats`, config).then((res) => res.data);
}

export async function getUserChat(chatId: string) {
	return api.get<ChatInterface>(`/chats/${chatId}`).then((res) => res.data);
}
