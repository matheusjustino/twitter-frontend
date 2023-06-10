import { useEffect, useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// CONTEXTS
import { useSocket } from "@/contexts/socket.context";
import { useChat } from "@/contexts/chat.context";

// INTERFACES
import { MessageInterface } from "@/interfaces/message.interface";

export const useChatPage = (
	chatId: string,
	initialData?: MessageInterface[]
) => {
	const { data: session } = useSession();
	const { socket, connected } = useSocket();
	const { chats, setChats } = useChat();
	const [newMessage, setNewMessage] = useState<string>("");
	const [chatMessages, setChatMessages] = useState<MessageInterface[]>(
		initialData ?? []
	);
	const [isTyping, setIsTyping] = useState(false);
	const listMessagesRef = useRef<HTMLDivElement | null>(null);
	const inputTextRef = useRef<HTMLTextAreaElement>(null);
	const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const { isRefetching: fetchingChatMessagesLoading } = useQuery({
		queryKey: [`get-chat-messages-${chatId}`],
		queryFn: async () => {
			return await api
				.get<MessageInterface[]>(`/chats/${chatId}/messages`)
				.then((res) => res.data);
		},
		onSuccess(data) {
			setChatMessages(data);
		},
		onError: (error: any) => {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		},
		initialData,
		enabled: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
	const { mutateAsync, isLoading } = useMutation({
		mutationKey: ["create-message"],
		mutationFn: async (messageContent: string) => {
			const payload = {
				chatId,
				content: messageContent,
			};
			return await api
				.post<MessageInterface>(`/messages`, payload)
				.then((res) => res.data);
		},
		onSuccess: (data) => {
			if (chats) {
				const updatedChats = chats?.map((c) => {
					if (c._id === data.chat._id) {
						c.latestMessage = data;
					}
					return c;
				});
				setChats(updatedChats ?? []);
			}
			setChatMessages((old) => old.concat(data));
			setNewMessage("");
			socket?.emit("new message", data);
		},
		onError: (error: any) => {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		},
	});

	useEffect(() => {
		if (connected) {
			socket?.emit("join room", {
				room: chatId,
				userId: session?.user.id,
			});

			socket?.on("message received", (newMessage: MessageInterface) => {
				if (chatId === newMessage.chat._id) {
					setChatMessages((old) => [...old, newMessage]);
					setIsTyping(false);
				}
			});

			socket?.on("typing", () => {
				if (!isTyping) {
					setIsTyping(true);
				}
			});

			socket?.on("stop typing", () => {
				setIsTyping(false);
			});

			return () => {
				socket?.emit("leave room", {
					room: chatId,
					userId: session?.user.id,
				});
			};
		}
	}, [socket, chatId]);

	useEffect(() => {
		const list = listMessagesRef.current;
		if (list) {
			list.scrollTo({
				top: list.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [chatMessages, isTyping, initialData]);

	const updateTyping = () => {
		let typing = true;
		socket?.emit("typing", { room: chatId, userId: session?.user?.id });

		if (stopTypingTimeoutRef.current) {
			clearTimeout(stopTypingTimeoutRef.current);
		}

		const timer = 3000;
		setTimeout(() => {
			typing = false;
		}, timer);

		if (stopTypingTimeoutRef) {
			stopTypingTimeoutRef.current = setTimeout(() => {
				if (!typing) {
					socket?.emit("stop typing", {
						room: chatId,
						userId: session?.user,
					});
				}
			}, timer + 1000);
		}
	};

	const onSubmit = useCallback(async () => {
		const removeBlankSpaces = newMessage.trim();
		if (!removeBlankSpaces.length) return;

		await mutateAsync(removeBlankSpaces);
		inputTextRef.current?.focus();
	}, [newMessage, mutateAsync]);

	return {
		isLoading,
		loadingChatMessages: fetchingChatMessagesLoading,
		chatUsers: chats?.filter((c) => c._id === chatId)[0]?.users ?? [],
		chatMessages,
		setChatMessages,
		newMessage,
		setNewMessage,
		listMessagesRef,
		inputTextRef,
		isTyping,
		setIsTyping,
		updateTyping,
		onSubmit,
	};
};
