import { AxiosRequestConfig } from "axios";

// SERVICES
import { api } from "@/services/api";

// INTERRFACES
import { NotificationInterface } from "@/interfaces/notification.interface";

interface GetUserNotificationsProps {
	token: string;
	limit?: number;
	skip?: number;
	filters?: Record<string, any>;
}

export async function getUserNotifications({
	token,
	limit,
	skip,
	filters = {},
}: GetUserNotificationsProps) {
	const config: AxiosRequestConfig = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		params: {
			limit: limit ?? 10,
			skip: skip ?? 0,
			filters,
		},
	};
	return api
		.get<NotificationInterface[]>(`/notifications`, config)
		.then((res) => res.data);
}
