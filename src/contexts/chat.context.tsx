import { createContext, useContext, useEffect, useState } from "react";
import {
	FetchNextPageOptions,
	InfiniteData,
	InfiniteQueryObserverResult,
	QueryObserverResult,
	RefetchOptions,
	RefetchQueryFilters,
	UseMutateAsyncFunction,
	useInfiniteQuery,
	useMutation,
} from "react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// CONTEXTS
import { useSocket } from "./socket.context";

// UTILS
import { getUserChats } from "@/utils/get-user-chats.interface";
import { createChat } from "@/utils/create-chat";

// INTERFACES
import { ChatInterface } from "@/interfaces/chat.interface";
import { MessageInterface } from "@/interfaces/message.interface";

interface ChatContextData {
	chats?: ChatInterface[];
	loading: boolean;
	hasNextPage?: boolean;
	setChats: (data?: ChatInterface[]) => void;
	fetchChats: <TPageData>(
		options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
	) => Promise<QueryObserverResult<InfiniteData<ChatInterface[]>, any>>;
	fetchNextPage: (
		options?: FetchNextPageOptions | undefined
	) => Promise<InfiniteQueryObserverResult<ChatInterface[], any>>;
	createChat: UseMutateAsyncFunction<
		ChatInterface,
		unknown,
		{
			users: string[];
		},
		unknown
	>;
}

interface ChatProviderProps {
	children: React.ReactNode;
}

export const ChatContext = createContext<ChatContextData>(
	{} as ChatContextData
);

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
	const { data: session, status } = useSession();
	const { socket } = useSocket();
	const [chats, setChats] = useState<ChatInterface[]>();

	const {
		refetch: fetchChats,
		fetchNextPage,
		hasNextPage,
		isLoading,
		isFetching,
		isFetchingNextPage,
		isRefetching,
	} = useInfiniteQuery(
		[`get-infinite-user-chats-${session?.user.id}`],
		async ({ pageParam = 0 }) => {
			return getUserChats({
				skip: pageParam,
			});
		},
		{
			initialData: {
				pages: [{} as any],
				pageParams: [null],
			},
			// enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.length ? allPages.length + 1 : undefined;
			},
			onSuccess: (data) => {
				setChats(data?.pages?.flat() ?? []);
			},
			onError: (error: any) => {
				console.error(error);
				const errorMsg = error.response?.data?.error || error.message;
				toast.error(errorMsg);
			},
		}
	);
	const { mutateAsync, ...chatsMutation } = useMutation({
		mutationKey: [`create-chats-to-user-${session?.user.id}`],
		mutationFn: createChat,
		onSuccess: (data) => {
			setChats((old) => (old ? old.concat(data) : [data]));
		},
		onError: (error: any) => {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		},
	});

	useEffect(() => {
		if (status === "authenticated") {
			if (!chats) {
				fetchChats();
			}
		}
	}, [status, chats, fetchChats]);

	useEffect(() => {
		socket?.on("new chat received", async (newChat: ChatInterface) => {
			setChats(chats ? [...chats, newChat] : [newChat]);
		});

		socket?.on(
			"update last message chat",
			async (newMessage: MessageInterface) => {
				if (chats) {
					const updatedChats = chats.map((chat) =>
						chat._id === newMessage.chat._id
							? { ...chat, latestMessage: { ...newMessage } }
							: chat
					);
					setChats(updatedChats ?? []);
				}
			}
		);
	}, [socket, chats]);

	const chatProviderData: ChatContextData = {
		chats,
		loading:
			isLoading ||
			isFetching ||
			isFetchingNextPage ||
			isRefetching ||
			chatsMutation.isLoading,
		hasNextPage,
		setChats,
		fetchChats,
		fetchNextPage,
		createChat: mutateAsync,
	};

	return (
		<ChatContext.Provider value={chatProviderData}>
			{children}
		</ChatContext.Provider>
	);
};

export const useChat = () => useContext(ChatContext);
