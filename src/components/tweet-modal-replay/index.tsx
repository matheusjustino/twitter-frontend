import { useCallback, useEffect, useRef, useState } from "react";
import { Session } from "next-auth";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// UTILS
import { updateTextAreaSize } from "@/utils/update-text-area-size";

// CONTEXTS
import { useNotification } from "@/contexts/notification.context";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

// COMPONENTS
import { ProfileImage } from "../profile-image";
import { TweetListItem } from "../tweet-list-item";

async function replayTweet({
	content,
	replyTo,
}: {
	content: string;
	replyTo: string;
}) {
	return await api
		.post<PostInterface>(`posts`, { content, replyTo })
		.then((res) => res.data);
}

interface TweetReplayModalProps {
	onClose: () => void;
	onRetweet?: () => void;
	onLikeTweet?: () => void;
	post?: PostInterface;
	session: Session | null;
}

const TweetReplayModal: React.FC<TweetReplayModalProps> = ({
	onClose,
	onRetweet,
	onLikeTweet,
	post,
	session,
}) => {
	const isAuthenticated = !!session;
	const { emitNotification } = useNotification();
	const [inputValue, setInputValue] = useState("");
	const textAreaRef = useRef<HTMLTextAreaElement>();
	const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
		updateTextAreaSize(textArea);
		textAreaRef.current = textArea;
	}, []);

	const queryClient = useQueryClient();
	const replayTweetMutation = useMutation({
		mutationKey: ["reply-tweet"],
		mutationFn: replayTweet,
		onSuccess: async (data) => {
			toast.success(`Tweet replied successfully`);
			await queryClient.invalidateQueries({
				queryKey: ["list-posts"],
				exact: true,
			});
			setInputValue("");

			emitNotification(data?.replyTo?.postedBy._id ?? "");
		},
	});

	useEffect(() => {
		updateTextAreaSize(textAreaRef?.current);
	}, [inputValue]);

	const handleClose = () => {
		setInputValue("");
		onClose();
	};

	const renderTweetModalContent = () => {
		if (post) {
			const isLiked = post.likes.some(
				(u) => (u as unknown as string) === session?.user.id
			);
			const isRetweet = !!post?.retweetData;
			const hasRetweets = !!post.retweetUsers.length;
			const retweetedBy = isRetweet ? post.postedBy.username : null;

			return (
				<TweetListItem
					post={post}
					postedBy={post.postedBy}
					isLiked={isLiked}
					isRetweet={isRetweet}
					hasRetweets={hasRetweets}
					retweetedByUsername={`@${
						retweetedBy ??
						post.postedBy.username.split(" ").join("").toLowerCase()
					}`}
					handleRetweet={onRetweet}
					handleLikeTweet={onLikeTweet}
				/>
			);
		} else {
			return (
				<div className="flex items-center justify-center text-xl">
					No content
				</div>
			);
		}
	};

	return (
		<div
			className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm ${
				post ? "flex" : "hidden"
			} justify-center items-center px-2 z-50`}
		>
			<div
				className={`bg-white rounded-xl p-4 sm:px-2 w-full md:w-2/3 xl:w-1/3 animate-[fade-in-down_0.4s_ease-in-out]`}
			>
				{/** header */}
				<div className="border-b px-4 py-2 font-bold">Reply Tweet</div>

				{/** post content */}
				<div className="py-10">{renderTweetModalContent()}</div>

				{/** reply content */}
				<div className="p-3">
					<div className="flex gap-4">
						<ProfileImage src={session?.user.profilePic} />
						<textarea
							ref={inputRef}
							style={{ height: 0 }}
							className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none min-h-[100px]"
							placeholder={
								isAuthenticated
									? `What's happening?`
									: "Login to post a tweet"
							}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							disabled={!isAuthenticated}
						/>
					</div>
				</div>

				{/** footer */}
				<div className="flex justify-end items-center w-100 border-t p-3 gap-1">
					<button
						onClick={handleClose}
						className="bg-red-500 hover:bg-red-600 px-3 py-1
							rounded text-white min-w-[80px] transition-colors duration-200"
					>
						Cancel
					</button>
					<button
						onClick={() =>
							replayTweetMutation.mutateAsync({
								content: inputValue,
								replyTo: post?._id ?? post?.id ?? "",
							})
						}
						disabled={!isAuthenticated || !inputValue.trim().length}
						className="bg-blue-500 hover:bg-blue-600 px-3 py-1
							rounded text-white min-w-[80px] disabled:bg-blue-300
							disabled:cursor-not-allowed transition-colors duration-200"
					>
						Reply
					</button>
				</div>
			</div>
		</div>
	);
};

export { TweetReplayModal };
