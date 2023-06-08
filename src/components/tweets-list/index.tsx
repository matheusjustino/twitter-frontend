import { memo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

// COMPONENTS
import { TweetReplayModal } from "../tweet-modal-replay";
import { TweetListItem } from "../tweet-list-item";

async function handleLikeTweet({
	postId,
	isLiked = false,
	isAuthenticated = false,
}: {
	postId: string;
	isLiked: boolean;
	isAuthenticated: boolean;
}) {
	if (!isAuthenticated) {
		toast.error("You are not authenticated");
		return;
	}

	return await api
		.put<PostInterface>(`/posts/${postId}/like`, { isLiked })
		.then((res) => res.data);
}
async function handleRetweet({
	postId,
	isAuthenticated = false,
}: {
	postId: string;
	isAuthenticated: boolean;
}) {
	if (!isAuthenticated) {
		toast.error("You are not authenticated");
		return;
	}

	return await api
		.post<PostInterface>(`/posts/${postId}/retweet`, undefined)
		.then((res) => res.data);
}

async function handlePinTweet({
	postId,
	pinned,
	isAuthenticated = false,
}: {
	postId: string;
	pinned: boolean;
	isAuthenticated: boolean;
}) {
	if (!isAuthenticated) {
		toast.error("You are not authenticated");
		return;
	}

	return await api
		.put<PostInterface>(`/posts/${postId}/pin`, { pinned })
		.then((res) => res.data);
}

interface TweetsListProps {
	posts?: PostInterface[];
}

const TweetsList: React.FC<TweetsListProps> = memo(({ posts }) => {
	const { data: session } = useSession();
	const [postToReply, setPostToReply] = useState<PostInterface>();

	const queryClient = useQueryClient();
	const likeTweetMutation = useMutation(["like-tweet"], handleLikeTweet, {
		onSuccess: async (data) => {
			if (data && posts) {
				const oldTweetId = posts.findIndex(
					(v: PostInterface) => v._id === data._id
				);
				posts[oldTweetId] = data;
			}
		},
	});
	const retweetMutation = useMutation(["retweet"], handleRetweet, {
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["list-posts"],
				exact: true,
			});
		},
	});
	const pinTweetMutation = useMutation(["pin-tweet"], handlePinTweet, {
		onSuccess: async () => {
			await queryClient.prefetchQuery([
				`get-posts-by-${session?.user.username}`,
			]);
		},
	});

	if (!posts?.length) {
		return (
			<div className="flex flex-col gap-4 items-center justify-center mt-20">
				<h1 className="font-bold">No data</h1>
			</div>
		);
	}

	return (
		<>
			{posts?.map((post, index) => {
				const isLiked = post.likes.some(
					(u) => (u as unknown as string) === session?.user.id
				);
				const hasRetweets = !!post.retweetUsers.length;
				const isRetweet = !!post?.retweetData?._id;
				const retweetedBy = isRetweet ? post.postedBy.username : null;
				post = isRetweet ? post.retweetData! : post;

				return (
					<TweetListItem
						key={`${post._id ?? post.id}${index + 1}`}
						hasControls
						post={post}
						postedBy={post.postedBy}
						isLiked={isLiked}
						isRetweet={isRetweet}
						hasRetweets={hasRetweets}
						retweetedByUsername={`@${
							retweetedBy ??
							post.postedBy.username
								.split(" ")
								.join("")
								.toLowerCase()
						}`}
						handleReplayPost={() => {
							setPostToReply(post);
						}}
						handleRetweet={() => {
							retweetMutation.mutateAsync({
								postId: post._id ?? post.id,
								isAuthenticated: !!session?.user,
							});
						}}
						handleLikeTweet={() => {
							likeTweetMutation.mutateAsync({
								postId: post._id ?? post.id,
								isLiked,
								isAuthenticated: !!session?.user,
							});
						}}
						handlePinPost={() => {
							pinTweetMutation.mutate({
								postId: post._id ?? post.id,
								pinned: !post.pinned,
								isAuthenticated: !!session?.user,
							});
						}}
					/>
				);
			})}

			<TweetReplayModal
				post={postToReply}
				session={session}
				onClose={() => setPostToReply(undefined)}
				onRetweet={() => {
					postToReply
						? retweetMutation.mutateAsync({
								postId: postToReply._id ?? postToReply.id,
								isAuthenticated: !!session?.user,
						  })
						: null;
				}}
				onLikeTweet={() => {
					postToReply
						? likeTweetMutation.mutateAsync({
								postId: postToReply._id ?? postToReply.id,
								isLiked: postToReply.likes.some(
									(u) =>
										(u as unknown as string) ===
										session?.user.id
								),
								isAuthenticated: !!session?.user,
						  })
						: null;
				}}
			/>
		</>
	);
});

TweetsList.displayName = "TweetsList";

export { TweetsList };
