// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { ChatInterface } from "@/interfaces/chat.interface";

export async function createChat({ users }: { users: string[] }) {
	const payload = {
		users,
		isGroupChat: users.length > 2,
	};

	return api.post<ChatInterface>(`/chats`, payload).then((res) => res.data);
}
