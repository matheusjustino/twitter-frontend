import Link from "next/link";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { HiOutlineChatBubbleLeftEllipsis } from "react-icons/hi2";

// CONTEXTS
import { useChat } from "@/contexts/chat.context";

// COMPONENTS
import { LoadingSpinner } from "@/components/loading-spinner";
import { ChatListItem } from "@/components/chat-list-item";
import { Session } from "next-auth";

interface ChatsPageProps {
	session: Session | null;
}

const ChatsPage: NextPage<ChatsPageProps> = ({ session }) => {
	const { chats, loading, hasNextPage, fetchNextPage } = useChat();

	return (
		<>
			<header className="flex items-center justify-between sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">Inbox</h1>

				<Link
					href="/chats/new"
					type="button"
					className={`
						p-1 rounded-full bg-slate-100 hover:bg-slate-200
						hover:cursor-pointer transition-colors duration-200
						border-[1px]`}
				>
					<HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 sm:w-6 sm:h-6" />
				</Link>
			</header>

			{loading && (
				<div className="flex flex-col flex-1 items-center justify-end gap-2 mt-12">
					<LoadingSpinner />
					<h1 className="font-bold">Loading chats...</h1>
				</div>
			)}

			{!loading && chats && chats.length > 0 && (
				<InfiniteScroll
					dataLength={chats.length ?? 0}
					hasMore={!!hasNextPage}
					next={fetchNextPage}
					loader={<LoadingSpinner />}
				>
					{chats.map((chat) => {
						return (
							<ChatListItem
								key={chat._id}
								session={session}
								chat={chat}
							/>
						);
					})}
				</InfiniteScroll>
			)}
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

export default ChatsPage;
