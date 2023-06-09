import { AxiosRequestConfig } from "axios";

// SERVICES
import { api } from "@/services/api";

// INTERRFACES
import { NotificationInterface } from "@/interfaces/notification.interface";

export async function getUserNotifications(token: string) {
	const config: AxiosRequestConfig = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
	return api
		.get<NotificationInterface[]>(`/notifications`, config)
		.then((res) => res.data);
}
