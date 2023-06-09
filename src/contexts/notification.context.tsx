import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
	FetchNextPageOptions,
	InfiniteData,
	InfiniteQueryObserverResult,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "react-query";
import { toast } from "react-hot-toast";

// UTILS
import { getUserNotifications } from "@/utils/get-user-notification";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { NotificationInterface } from "@/interfaces/notification.interface";

interface NotificationContextData {
	notificationsNotOpenedCount: number;
	allOpened: boolean;
	notifications?: NotificationInterface[];
	loading: boolean;
	hasNextPage?: boolean;
	fetchNextPage: (
		options?: FetchNextPageOptions | undefined
	) => Promise<InfiniteQueryObserverResult<NotificationInterface[], unknown>>;
	openSingleNotification: (notificationId: string, opened: boolean) => void;
	openAllNotifications: () => void;
}

export const NotificationsContext = createContext<NotificationContextData>(
	{} as NotificationContextData
);

interface NotificationProviderProps {
	children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
	children,
}) => {
	const { data: session, status } = useSession();
	const [notifications, setNotifications] =
		useState<NotificationInterface[]>();

	const queryClient = useQueryClient();
	const {
		hasNextPage,
		fetchNextPage,
		isLoading,
		isFetching,
		isFetchingNextPage,
		refetch,
	} = useInfiniteQuery(
		[`get-infinite-user-notifications-${session?.user.id}`],
		async ({ pageParam = 0 }) => {
			return getUserNotifications({
				token: session?.user.token ?? "",
				skip: pageParam,
			});
		},
		{
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.length ? allPages.length + 1 : undefined;
			},
			onSuccess: (data) => {
				setNotifications(data?.pages.flat() ?? []);
			},
		}
	);

	const {
		mutate: openSingleNotification,
		isLoading: openSingleNotificationLoading,
	} = useMutation({
		mutationKey: [`user-notifications-${session?.user.id}`],
		mutationFn: async (notificationId?: string) => {
			const body = {
				...(notificationId && { notificationId }),
			};
			return await api
				.put<NotificationInterface>(
					`/notifications/${notificationId}/open`,
					body
				)
				.then((res) => res.data);
		},
		onSuccess: async (data) => {
			queryClient.setQueryData<
				InfiniteData<NotificationInterface[]> | undefined
			>(
				[`get-infinite-user-notifications-${session?.user.id}`],
				(oldData?: InfiniteData<NotificationInterface[]>) => {
					if (!oldData) return undefined;

					oldData.pages = oldData.pages.map((page) => {
						return page.map((item) => {
							if ((item._id ?? item.id) === data._id) {
								return data;
							}
							return item;
						});
					});

					setNotifications(oldData.pages.flat());

					return oldData;
				}
			);
		},
		onError: (error: any) => {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		},
	});
	const {
		mutate: openAllNotification,
		isLoading: openAllNotificationsLoading,
	} = useMutation({
		mutationKey: [`user-notifications-${session?.user.id}`],
		mutationFn: async () => {
			return await api
				.put<void>(`/notifications/open/all`)
				.then((res) => res.data);
		},
		onSuccess: async () => {
			queryClient.setQueryData<
				InfiniteData<NotificationInterface[]> | undefined
			>(
				[`get-infinite-user-notifications-${session?.user.id}`],
				(oldData?: InfiniteData<NotificationInterface[]>) => {
					if (!oldData) return undefined;

					oldData.pages = oldData.pages.map((page) => {
						return page.map((item) => {
							item.opened = true;
							return item;
						});
					});

					setNotifications(oldData.pages.flat());

					return oldData;
				}
			);
		},
		onError: (error: any) => {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		},
	});

	useEffect(() => {
		if (status === "authenticated") {
			if (!notifications) {
				refetch();
			}
		}
	}, [status, refetch, notifications]);

	const onSubmit = (notificationId: string, opened: boolean) => {
		if (opened) return;

		openSingleNotification(notificationId);
	};

	const [allOpened, notificationsNotOpenedCount] = notifications?.reduce(
		(prev, curr) => {
			const count = prev[1] + Number(!curr.opened);
			return [prev[0] && curr.opened, count];
		},
		[true, 0]
	) ?? [true, 0];

	const notificationContextData: NotificationContextData = {
		notifications,
		allOpened,
		notificationsNotOpenedCount,
		fetchNextPage,
		openSingleNotification: onSubmit,
		openAllNotifications: openAllNotification,
		hasNextPage,
		loading:
			isLoading ||
			isFetching ||
			isFetchingNextPage ||
			openSingleNotificationLoading ||
			openAllNotificationsLoading,
	};

	return (
		<NotificationsContext.Provider value={notificationContextData}>
			{children}
		</NotificationsContext.Provider>
	);
};

export const useNotification = () => useContext(NotificationsContext);
