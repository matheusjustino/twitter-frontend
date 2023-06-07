import { memo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// CONTEXTS
import { useTweet } from "@/contexts/use-tweet.context";

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

interface TweetsListProps {
	posts?: PostInterface[];
}

const TweetsList: React.FC<TweetsListProps> = memo(({ posts }) => {
	const { data } = useSession();
	const { tweets } = useTweet();
	const [postToReply, setPostToReply] = useState<PostInterface>();

	const queryClient = useQueryClient();
	const likeTweetMutation = useMutation(["like-tweet"], handleLikeTweet, {
		onSuccess: (data) => {
			if (data && tweets) {
				const oldTweetId = tweets.findIndex(
					(v: PostInterface) => v._id === data._id
				);
				tweets[oldTweetId].likes = data.likes;
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

	return (
		<>
			{posts?.map((post, index) => {
				// const postedBy = post.postedBy;
				const isLiked = post.likes.some(
					(u) => (u as unknown as string) === data?.user.id
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
								isAuthenticated: !!data?.user,
							});
						}}
						handleLikeTweet={() => {
							likeTweetMutation.mutateAsync({
								postId: post._id ?? post.id,
								isLiked,
								isAuthenticated: !!data?.user,
							});
						}}
					/>
				);
			})}

			<TweetReplayModal
				post={postToReply}
				session={data}
				onClose={() => setPostToReply(undefined)}
				onRetweet={() => {
					postToReply
						? retweetMutation.mutateAsync({
								postId: postToReply._id ?? postToReply.id,
								isAuthenticated: !!data?.user,
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
										data?.user.id
								),
								isAuthenticated: !!data?.user,
						  })
						: null;
				}}
			/>
		</>
	);
});

TweetsList.displayName = "TweetsList";

export { TweetsList };
