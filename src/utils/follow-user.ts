// SERVICES
import { api } from "@/services/api";

//interfaces
import { UserInterface } from "@/interfaces/user.interface";

export async function followUser({ userId }: { userId: string }) {
	return await api
		.put<UserInterface>(`/users/${userId}/follow`, undefined)
		.then((res) => res.data);
}
