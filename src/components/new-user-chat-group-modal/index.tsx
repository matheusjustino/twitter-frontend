import { useRef } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { VscLoading } from "react-icons/vsc";
import { AiOutlineClear } from "react-icons/ai";

// HOOKS
import { useSearchUser } from "@/hooks/useSearchUser";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";
import { ChatInterface } from "@/interfaces/chat.interface";

// COMPONENTS
import { Modal } from "../modal";
import { UserListItem } from "../user-list-item";
import { LoadingSpinner } from "../loading-spinner";
import { useChat } from "@/contexts/chat.context";

interface NewUserChatGroupModalProps {
	currentChat: ChatInterface;
	isVisible: boolean;
	onClose: () => void;
}

const NewUserChatGroupModal: React.FC<NewUserChatGroupModalProps> = ({
	currentChat,
	isVisible,
	onClose,
}) => {
	const { data: session } = useSession();
	const { setChats, chats } = useChat();
	const {
		users,
		termToSearch,
		selectedUsers,
		loading,
		setTermToSearch,
		onSelectUser,
		onSearch,
		onClear,
		onRemoveUser,
	} = useSearchUser({ session, queryKeys: [`search-users-new-chat`] });
	const inputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const mutation = useMutation(
		[`add-new-users-to-chat-${currentChat._id}`],
		async ({ newUsers }: { newUsers: string[] }) => {
			const payload = {
				userIds: newUsers,
				isGroupChat: true,
			};
			return api
				.put<ChatInterface>(`/chats/${currentChat._id}/add`, payload)
				.then((res) => res.data);
		},
		{
			onSuccess: (data: ChatInterface) => {
				setChats(
					chats?.map((c) => {
						if (c._id === currentChat._id) {
							c.users = data.users;
							c.isGroupChat = data.isGroupChat;
						}
						return c;
					}) ?? [data]
				);
				handleClose();
			},
		}
	);

	const handleClose = () => {
		onClear();
		queryClient.setQueryData<UserInterface[] | undefined>(
			[`search-users-new-chat`],
			() => {
				return [];
			}
		);
		onClose();
	};

	const onSubmit = async () => {
		await mutation.mutateAsync({
			newUsers: selectedUsers.map((u) => u.value),
		});
	};

	const noRepeatUsers =
		users?.filter((u) => !currentChat.users.some((c) => c._id === u._id)) ??
		[];

	return (
		<Modal isVisible={isVisible} onClose={handleClose}>
			<div className="flex flex-1 flex-col">
				<div className="flex items-center min-h-[60px] p-2 border-b-2">
					<label
						className="flex w-full gap-1 m-0 mr-2 break-words flex-wrap"
						htmlFor="selectedUsers"
					>
						{/** selected users */}
						To:{" "}
						{selectedUsers.map((u) => {
							return (
								<span
									key={u.value}
									className="
										px-3 py-[2px] rounded-md bg-blue-200 text-sky-700
										hover:bg-red-300 hover:text-red-600 hover:cursor-pointer"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										onRemoveUser(u);
									}}
								>
									{u.label}
								</span>
							);
						})}
						{/** input */}
						<div className="flex items-center justify-between gap-1 w-full py-1">
							<input
								ref={inputRef}
								type="text"
								name="selectedUsers"
								id="selectedUser"
								placeholder="Type the name of the person"
								className="flex-1 focus:outline-none font-extralight px-2 py-1 rounded-full bg-slate-100"
								value={termToSearch}
								onChange={(e) =>
									setTermToSearch(e.target.value)
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										onSearch();
									}
								}}
							/>

							{/** clear selected users */}
							<AiOutlineClear
								onClick={onClear}
								className="w-8 h-8 p-1 rounded-full hover:bg-red-300 hover:cursor-pointer"
								size={26}
							/>
						</div>
					</label>
				</div>

				{loading && (
					<div className="flex flex-col gap-4 items-center justify-center mt-20">
						<LoadingSpinner />
						<h1 className="font-bold">Loading users...</h1>
					</div>
				)}

				{!loading &&
					noRepeatUsers &&
					noRepeatUsers.length > 0 &&
					noRepeatUsers.map((u) => {
						const isFollowing = u.followers.some(
							(f) => (f as unknown as string) === session?.user.id
						);

						const alreadySelected = selectedUsers.find(
							(v) => v.value === u._id
						);

						return (
							<div
								key={u._id}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onSelectUser({
										value: u._id ?? "",
										label: u.username,
									});
								}}
								className={`${
									alreadySelected && "bg-slate-100 opacity-30"
								}`}
							>
								<UserListItem
									session={session}
									user={u}
									isFollowing={isFollowing}
								/>
							</div>
						);
					})}

				<button
					onClick={onSubmit}
					className="
						border-none bg-blue-400 hover:bg-blue-500 font-medium
						transition-colors duration-200 text-white py-2 px-5 my-2 mx-auto
						rounded-[40px] disabled:bg-gray-300 disabled:text-gray-700
						disabled:cursor-not-allowed min-w-[126px] min-h-[40px]"
					type="button"
					disabled={loading || !selectedUsers.length}
				>
					{loading ? (
						<VscLoading
							className="animate-spin mx-auto"
							size={24}
						/>
					) : (
						"Add to Chat"
					)}
				</button>
			</div>
		</Modal>
	);
};

export { NewUserChatGroupModal };
