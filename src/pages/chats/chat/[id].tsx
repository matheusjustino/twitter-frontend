import { useState } from "react";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { QueryClient } from "react-query";
import { FaPaperPlane } from "react-icons/fa";
import { AiOutlineUserAdd } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi2";

// HOOKS
import { useChatPage } from "@/hooks/useChatPage";

// CONTEXTS
import { useChat } from "@/contexts/chat.context";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { MessageInterface } from "@/interfaces/message.interface";

// COMPONENTS
import { LoadingSpinner } from "@/components/loading-spinner";
import { ChatInterface } from "@/interfaces/chat.interface";
import { ProfileImage } from "@/components/profile-image";
import { NewUserChatGroupModal } from "@/components/new-user-chat-group-modal";
import { UpdateChatNameModal } from "@/components/update-chat-name-modal";

interface ChatPageProps {
	chatId: string;
	initialData?: MessageInterface[];
	session: Session | null;
}

const ChatPage: NextPage<ChatPageProps> = ({
	session,
	chatId,
	initialData,
}) => {
	const {
		isLoading,
		loadingChatMessages,
		chatMessages,
		newMessage,
		setNewMessage,
		listMessagesRef,
		inputTextRef,
		isTyping,
		updateTyping,
		onSubmit,
	} = useChatPage(chatId, initialData);
	const { loading: loadingChats, chats } = useChat();
	const [newUserChatModalIsOpen, setNewUserChatModalIsOpen] = useState(false);
	const [updateChatNameIsOpen, setUpdateChatNameIsOpen] = useState(false);
	const currentChat = chats?.filter((c) => c._id === chatId)[0];

	const buildChatName = (chat?: ChatInterface) => {
		if (!chat) return `New Chat`;
		if (chat.chatName?.trim()) return chat.chatName;
		if (chat.users.length === 1) return chat.users[0].username;

		return chat.users
			.filter((u) => u._id !== session?.user.id)
			.map((u) => u.username)
			.join(", ");
	};

	const buildChatImage = (chat?: ChatInterface) => {
		if (chat && chat.users.length > 2) {
			return (
				<HiOutlineUserGroup className="p-2 rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-slate-400 border-4 border-white" />
			);
		}

		return (
			<ProfileImage className="border-4 border-white !w-12 !h-12 sm:!w-14 sm:!h-14" />
		);
	};

	return (
		<div className="flex flex-col flex-1 h-screen">
			<header className="flex items-center justify-between sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">Chat</h1>

				{currentChat?.isGroupChat && (
					<AiOutlineUserAdd
						onClick={() => setNewUserChatModalIsOpen(true)}
						className="p-2 bg-slate-100 hover:bg-slate-200 hover:cursor-pointer rounded-full w-10 h-10"
					/>
				)}
			</header>

			{loadingChats && (
				<div className="flex items-center justify-center h-screen">
					<LoadingSpinner />
				</div>
			)}

			{!loadingChats && (
				<main className="flex flex-col flex-1 basis-0 overflow-y-auto">
					{/** chat name */}
					<div
						onClick={() => setUpdateChatNameIsOpen(true)}
						className="border-b-2 flex items-center px-2 py-4 w-full cursor-pointer hover:bg-slate-100 border-gray-200 transition-colors duration-200"
					>
						<div className="flex items-center gap-2 w-full px-1 py-[5px] hover:cursor-pointer">
							{buildChatImage(currentChat)}
							<p className="overflow-hidden line-clamp-1">
								{buildChatName(currentChat)}
							</p>
						</div>
					</div>

					<div className="flex flex-1 flex-col overflow-y-hidden">
						{/** messages */}
						<div
							ref={listMessagesRef}
							id="chat-messages"
							className="flex-1 flex flex-col p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500
							scrollbar-track-slate-400"
						>
							{loadingChatMessages && (
								<div className="flex flex-1 flex-col items-center justify-center">
									<LoadingSpinner />
									<span>Loading messages...</span>
								</div>
							)}

							{!loadingChatMessages && (
								<>
									<ul>
										{chatMessages.map((message, index) => {
											const isMine =
												message.sender._id ===
												session?.user.id;

											const liMineClasses =
												"flex-row-reverse";
											const liOtherUserClasses = "";

											const sender = message.sender;
											const currentSenderId = sender._id;

											const nextMessage =
												chatMessages[index + 1] ?? null;
											const nextSenderId =
												nextMessage !== null
													? nextMessage.sender._id
													: "";

											const isLast =
												nextSenderId !==
												currentSenderId;

											const isMineAndLast = isMine
												? isLast
													? `rounded-tr-[2px]`
													: `rounded-br-[2px]`
												: isLast
												? `rounded-tl-[2px]`
												: `rounded-bl-[2px]`;

											return (
												<li
													key={
														message._id +
														`${Date.now()}`
													}
													className={`py-[3px] list-none flex items-end flex-shrink-0 ${
														isMine
															? liMineClasses
															: liOtherUserClasses
													}`}
												>
													<div className="flex flex-col max-w-[55%] break-words">
														{!isMine && (
															<span className="flex justify-start">
																{
																	message
																		.sender
																		.username
																}
															</span>
														)}
														<span
															className={` px-[6px] py-[12px] rounded-xl text-sm ${
																isMine
																	? "bg-blue-600 text-white border"
																	: "bg-emerald-500 border"
															} ${isMineAndLast}`}
														>
															{message.content}
														</span>
														{isLast && (
															<span className="text-[11px] text-gray-900">
																{new Date(
																	message.createdAt
																).toLocaleString(
																	"pt-BR",
																	{
																		day: "2-digit",
																		month: "2-digit",
																		year: "2-digit",
																		hour: "2-digit",
																		minute: "2-digit",
																		second: "2-digit",
																	}
																)}
															</span>
														)}
													</div>
												</li>
											);
										})}
									</ul>

									{/** user typing */}
									{isTyping && (
										<div className="w-[60px]">
											<Image
												className="mt-4 rounded-full px-2 bg-[#f1f0f0]"
												src="/images/dots.gif"
												alt='"user typing'
												priority={true}
												quality={100}
												width={80}
												height={80}
											/>
										</div>
									)}
								</>
							)}
						</div>

						{/** controls */}
						<footer className="flex p-4 gap-2 flex-shrink-0">
							<textarea
								ref={inputTextRef}
								className="py-[8px] px-[12px] h-[48px] rounded-full border-2 focus:border-gray-500 focus:outline-none flex-1 resize-none bg-black/5"
								name="message"
								id="message"
								placeholder={
									isLoading
										? "Sending..."
										: "Type a message..."
								}
								disabled={isLoading}
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								onKeyDown={(e) => {
									updateTyping();

									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										onSubmit();
									}
								}}
							></textarea>

							<button
								disabled={isLoading}
								onClick={onSubmit}
								type="button"
								className="bg-transparent text-blue-500 border border-blue-500 hover:text-blue-600 transition-colors duration-15 rounded-full"
							>
								<div className="rounded-full p-[10px] border hover:bg-blue-200 transition-colors duration-150">
									<FaPaperPlane size={24} />
								</div>
							</button>
						</footer>
					</div>
				</main>
			)}

			{/* <ChatUsersModal
				isVisible={showChatUsersModal}
				onClose={() => setShowChatUsersModal(false)}
				chatUsers={chatUsers.map((u) => u.username)}
			/> */}
			{currentChat && (
				<UpdateChatNameModal
					currentChat={currentChat}
					isVisible={updateChatNameIsOpen}
					onClose={() => setUpdateChatNameIsOpen(false)}
				/>
			)}
			{currentChat && currentChat?.isGroupChat && (
				<NewUserChatGroupModal
					currentChat={currentChat}
					isVisible={newUserChatModalIsOpen}
					onClose={() => setNewUserChatModalIsOpen(false)}
				/>
			)}
		</div>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { id } = ctx.query;
	const session = await getSession(ctx);
	if (!session?.user || !id) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const queryClient = new QueryClient();

	try {
		const data = await queryClient.fetchQuery(
			[`get-chat-messages-${id}`],
			async () => {
				const config = {
					headers: {
						Authorization: `Bearer ${session.user.token}`,
					},
				};

				return await api
					.get<MessageInterface[]>(`/chats/${id}/messages`, config)
					.then((res) => res.data);
			}
		);

		return {
			props: {
				key: id,
				chatId: id,
				initialData: data,
				session,
			},
		};
	} catch (error: any) {
		console.error(error);
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}
};

export default ChatPage;
