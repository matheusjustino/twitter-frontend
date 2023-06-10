import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

// INTERFACES
import { ChatInterface } from "@/interfaces/chat.interface";

// COMPONENTS
import { useMutation } from "react-query";

// SERVICES
import { api } from "@/services/api";

// CONTEXTS
import { useChat } from "@/contexts/chat.context";

// COMPONENTS
import { Modal } from "../modal";
import { VscLoading } from "react-icons/vsc";

interface NewUserChatGroupModalProps {
	currentChat: ChatInterface;
	isVisible: boolean;
	onClose: () => void;
}

const UpdateChatNameModal: React.FC<NewUserChatGroupModalProps> = ({
	currentChat,
	isVisible,
	onClose,
}) => {
	const { chats, setChats } = useChat();
	const [chatName, setChatName] = useState("");
	const { mutateAsync: updateChatName, isLoading } = useMutation(
		[`update-chat-name-${currentChat._id}`],
		async ({ chatId, chatName }: { chatId: string; chatName: string }) => {
			const payload = {
				chatName,
			};
			return api
				.put<ChatInterface>(`/chats/${chatId}/name`, payload)
				.then((res) => res.data);
		},
		{
			onSuccess: (data) => {
				setChats(
					chats?.map((c) => (c._id === data._id ? data : c)) ?? [data]
				);
				handleClose();
			},
			onError: (error: any) => {
				const errorMsg = error.response?.data?.error || error.message;
				toast.error(errorMsg);
			},
		}
	);

	const handleClose = () => {
		setChatName("");
		onClose();
	};

	const onSubmit = async () => {
		try {
			await updateChatName({ chatId: currentChat._id, chatName });
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Modal isVisible={isVisible} onClose={handleClose}>
			<div className="flex flex-1 flex-col gap-4 p-2">
				{currentChat.isGroupChat && (
					<>
						<div className="flex gap-2">
							<input
								type="text"
								name="chatName"
								id="chatName"
								placeholder={
									currentChat.chatName ?? "Chat Name"
								}
								className="w-full focus:outline-none rounded-full bg-gray-200 p-2"
								value={chatName}
								onChange={(e) => setChatName(e.target.value)}
							/>
							<button
								className="bg-blue-400 hover:bg-blue-500 text-white
						transition-colors duration-200 px-4 py-1 rounded-[40px]
						disabled:bg-gray-300 disabled:cursor-not-allowed"
								disabled={isLoading || !chatName.trim().length}
								onClick={onSubmit}
							>
								{isLoading ? (
									<VscLoading className="animate-spin" />
								) : (
									"Save"
								)}
							</button>
						</div>

						<div className="border-b-[1px] border-gray-200"></div>
					</>
				)}

				<label className="flex w-full gap-1 m-0 mr-2 break-words flex-wrap whitespace-pre-wrap">
					{currentChat.users.map((u) => (
						<span
							key={u._id + `${Date.now()}`}
							className="px-2 rounded-md bg-blue-200 hover:bg-blue-300 hover:cursor-pointer"
						>
							<Link href={`/profiles/${u.username}`}>
								{u.username}
							</Link>
						</span>
					))}
				</label>
			</div>
		</Modal>
	);
};

export { UpdateChatNameModal };
