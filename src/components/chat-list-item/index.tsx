import { memo } from "react";
import { Session } from "next-auth";
import { HiOutlineUserGroup } from "react-icons/hi2";

// INTERFACES
import { ChatInterface } from "@/interfaces/chat.interface";

// COMPONENTS
import { ProfileImage } from "../profile-image";
import Link from "next/link";

interface ChatListItemProps {
	session: Session | null;
	chat: ChatInterface;
}

const ChatListItem: React.FC<ChatListItemProps> = memo(({ session, chat }) => {
	const buildChatName = () => {
		if (chat.chatName) return chat.chatName;
		if (chat.users.length === 1) return chat.users[0].username;

		return chat.users
			.filter((u) => u._id !== session?.user.id)
			.map((u) => u.username)
			.join(", ");
	};

	const buildChatImage = () => {
		if (chat.users.length > 2) {
			return (
				<HiOutlineUserGroup className="p-2 rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-slate-400 border-4 border-white mr-2" />
			);
		}

		return <ProfileImage className="border-4 border-white mr-2" />;
	};

	return (
		<Link
			href={`/chats/chat/${chat._id}`}
			className="flex p-2 items-center flex-shrink-0 border-b-2 border-gray-200 hover:bg-gray-200 hover:cursor-pointer"
		>
			{buildChatImage()}
			<div className="flex flex-1 flex-col overflow-hidden whitespace-nowrap overflow-ellipsis">
				<span className="font-semibold">{buildChatName()}</span>
				<span className="text-gray-500 text-[14px]">
					{chat.latestMessage?.content ?? "New Chat"}
				</span>
			</div>
		</Link>
	);
});

ChatListItem.displayName = "ChatListItem";

export { ChatListItem };
