import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaRetweet } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { AiOutlineHeart } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

// UTILS
import { calculateTimeDifference } from "@/utils/datetime-relative";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";
import { UserInterface } from "@/interfaces/user.interface";

// COMPONENTS
import { ProfileImage } from "../profile-image";
import { TweetDeleteModal } from "../tweet-delete-modal";

interface TweetListItemProps {
	post: PostInterface;
	postedBy: UserInterface;
	isLiked?: boolean;
	isRetweet?: boolean;
	hasRetweets?: boolean;
	retweetedByUsername: string;
	handleReplayPost?: () => void;
	handleLikeTweet?: () => void;
	handleRetweet?: () => void;
}

const TweetListItem: React.FC<TweetListItemProps> = ({
	post,
	postedBy,
	isRetweet = false,
	hasRetweets = false,
	isLiked = false,
	retweetedByUsername,
	handleReplayPost,
	handleLikeTweet,
	handleRetweet,
}) => {
	const { push } = useRouter();
	const { data } = useSession();
	const [isDeleteTweetModalOpen, setIsDeleteTweetModalOpen] = useState(false);

	const navigateTo = (event: any, href: string) => {
		// avoid Link click propagation to div with onClick event
		if (event.target.tagName.toLowerCase() !== "a") {
			event.preventDefault();
			event.stopPropagation();
			push(href);
		}
	};

	return (
		<>
			<div
				onClick={(e: any) => navigateTo(e, `/posts/${post._id}`)}
				className={`flex flex-col flex-shrink-0 p-2 gap-2 hover:cursor-pointer border-b-2 text-xs sm:lg min-h-[100px] justify-between`}
			>
				{isRetweet && (
					<div className="pl-[35px] text-[13px] text-gray-500 mb-[5px] z-50">
						<span className="flex items-center justify-start gap-1">
							<FaRetweet size={16} />
							<Link href={`/profiles/${post.postedBy.username}`}>
								Retweeted by {retweetedByUsername}
							</Link>
						</span>
					</div>
				)}

				<div className="flex flex-1 h-full">
					<ProfileImage />

					<div className="pl-2 flex flex-col flex-1 gap-1">
						<div className="text-sm sm:text-lg">
							{/** post header */}
							<div className="flex flex-1 items-center justify-between">
								<div className="flex gap-2">
									<Link
										href={`/profiles/${postedBy.username}`}
										className="font-bold hover:underline"
									>
										{postedBy.username}
									</Link>
									<span className="text-gray-500">{`@${postedBy.username
										.split(" ")
										.join("")
										.toLowerCase()}`}</span>
									<span className="text-gray-500">
										{calculateTimeDifference(
											new Date().getTime(),
											new Date(post.createdAt).getTime()
										)}
									</span>
								</div>

								{data?.user.id === post.postedBy._id && (
									<AiOutlineClose
										onClick={(e) => {
											e.stopPropagation();
											setIsDeleteTweetModalOpen(true);
										}}
										className="hover:text-white hover:bg-red-400 p-1 rounded-full"
										size={26}
									/>
								)}
							</div>

							{/** reply to */}
							{post?.replyTo && (
								<div className="mb-1">
									Replying to{" "}
									<Link
										className="text-blue-500 hover:underline"
										href={`/profiles/${post.replyTo.postedBy.username}`}
									>
										{`@${post.replyTo.postedBy.username
											.split(" ")
											.join("")
											.toLowerCase()}`}
									</Link>
								</div>
							)}
						</div>

						{/** post body */}
						<div className="text-base py-1">
							<span>{post.content}</span>
						</div>

						{/** post footer */}
						<div className="flex items-center w-full">
							<div className="flex-1">
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										!!handleReplayPost &&
											handleReplayPost();
									}}
									className="flex items-center justify-center gap-1 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-blue-200"
								>
									<HiOutlineChatBubbleOvalLeft className="h-5 w-5 sm:h-8 sm:w-8" />
								</button>
							</div>

							<div className="flex-1">
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										!!handleRetweet && handleRetweet();
									}}
									className={`
												flex items-center justify-center gap-1 p-1 rounded-full hover:bg-emerald-200
													${
														hasRetweets
															? "text-emerald-500 hover:text-emerald-700"
															: "text-gray-500 hover:text-gray-700"
													}`}
								>
									<FaRetweet className="h-5 w-5 sm:h-8 sm:w-8" />
									{post.retweetUsers.length > 0 && (
										<span>{post.retweetUsers.length}</span>
									)}
								</button>
							</div>

							<div className="flex-1">
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										!!handleLikeTweet && handleLikeTweet();
									}}
									className={`
													flex items-center justify-center gap-1 p-1 rounded-full
													hover:bg-red-200 ${
														isLiked
															? "text-red-500 hover:text-red-700"
															: "text-gray-500 hover:text-gray-700"
													}`}
								>
									<AiOutlineHeart className="h-5 w-5 sm:h-8 sm:w-8" />
									{post.likes.length > 0 && (
										<span>{post.likes.length}</span>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<TweetDeleteModal
				open={isDeleteTweetModalOpen}
				post={post}
				session={data}
				onClose={() => setIsDeleteTweetModalOpen(false)}
			/>
		</>
	);
};

export { TweetListItem };
