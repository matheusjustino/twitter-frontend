import { useEffect, useRef, useState } from "react";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { IoArrowBackSharp } from "react-icons/io5";
import { AiOutlineClear } from "react-icons/ai";

// HOOKS
import { useDebounce } from "@/hooks/use-debounce";

// SERVICES
import { api } from "@/services/api";

// UTILS
import { followUser } from "@/utils/follow-user";
import { updateSearchedUsers } from "@/utils/update-search-user-query-data";

// CONTEXTS
import { useChat } from "@/contexts/chat.context";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

// COMPONENTS
import { UserListItem } from "@/components/user-list-item";
import { LoadingSpinner } from "@/components/loading-spinner";
import { VscLoading } from "react-icons/vsc";
import { useSearchUser } from "@/hooks/useSearchUser";

type SelectedUserType = { value: string; label: string };

interface NewChatPageProps {
	session: Session | null;
}

const NewChatPage: NextPage<NewChatPageProps> = ({ session }) => {
	const { createChat, loading } = useChat();
	const {
		users,
		termToSearch,
		selectedUsers,
		loading: useSearchUserLoading,
		setTermToSearch,
		onSelectUser,
		onSearch,
		onClear,
		onRemoveUser,
	} = useSearchUser({ session, queryKeys: [`search-users-new-chat`] });
	const inputRef = useRef<HTMLInputElement>(null);

	const queryClient = useQueryClient();
	const followMutation = useMutation(
		[`follow-user-${session?.user.id}`],
		followUser
	);

	const handleCreateChat = () => {
		createChat({
			users: selectedUsers.map((v) => v.value),
		}).then(() => {
			queryClient.setQueryData<UserInterface[] | undefined>(
				[`search-users-new-chat`],
				() => {
					return [];
				}
			);
			onClear();
		});
	};

	return (
		<>
			<header className="flex items-center gap-4 sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<Link href="/chats">
					<IoArrowBackSharp className="w-[34px] h-[34px] hover:cursor-pointer hover:bg-slate-200 p-1 rounded-full" />
				</Link>
				<h1 className="text-xl font-bold">New Chat</h1>
			</header>

			{/** results container */}
			<div className="flex flex-col min-h-0">
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
									key={u.value + `${Date.now()}`}
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

				{useSearchUserLoading && (
					<div className="flex flex-col gap-4 items-center justify-center mt-20">
						<LoadingSpinner />
						<h1 className="font-bold">Loading users...</h1>
					</div>
				)}

				{!useSearchUserLoading &&
					users &&
					users.length > 0 &&
					users.map((u) => {
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
									handleFollow={() => {
										const alreadySelected =
											selectedUsers.find(
												(v) => v.value === u._id
											);
										if (alreadySelected) return;

										followMutation
											.mutateAsync({
												userId: u._id ?? "",
											})
											.then((res) => {
												updateSearchedUsers({
													queryClient,
													updatedLoggedUser: res,
													selectedUserId: u._id ?? "",
													action: isFollowing
														? "Unfollow"
														: "Follow",
													queryKeys: [
														`search-users-new-chat`,
													],
												});
											});
									}}
								/>
							</div>
						);
					})}

				<button
					onClick={handleCreateChat}
					className="
						border-none bg-blue-400 hover:bg-blue-500 font-medium
						transition-colors duration-200 text-white py-2 px-5 my-2 mx-auto
						rounded-[40px] disabled:bg-gray-300 disabled:text-gray-700
						disabled:cursor-not-allowed min-w-[126px] min-h-[40px]"
					type="button"
					disabled={useSearchUserLoading || loading}
				>
					{loading ? (
						<VscLoading
							className="animate-spin mx-auto"
							size={24}
						/>
					) : (
						"Create Chat"
					)}
				</button>
			</div>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getSession(ctx);
	if (!session?.user) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	return {
		props: {
			session,
		},
	};
};

export default NewChatPage;
