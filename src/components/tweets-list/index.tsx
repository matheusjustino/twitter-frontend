import { memo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "react-query";
import { FaRetweet } from "react-icons/fa";
import { AiOutlineHeart } from "react-icons/ai";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { MdWarning } from "react-icons/md";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

// COMPONENTS
import { ProfileImage } from "@/components/profile-image";
import { calculateTimeDifference } from "@/utils/datetime-relative";
import { toast } from "react-hot-toast";

async function handleLikeTweet({
	postId,
	token = "",
	isLiked = false,
	isAuthenticated = false,
}: {
	postId: string;
	token: string;
	isLiked: boolean;
	isAuthenticated: boolean;
}) {
	if (!isAuthenticated) {
		toast.error("You are not authenticated");
		return;
	}

	return await api
		.put<PostInterface>(
			`/posts/${postId}/like`,
			{ isLiked },
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		)
		.then((res) => res.data);
}
async function handleRetweet({
	postId,
	token = "",
	isAuthenticated = false,
}: {
	postId: string;
	token: string;
	isAuthenticated: boolean;
}) {
	if (!isAuthenticated) {
		toast.error("You are not authenticated");
		return;
	}

	return await api
		.post<PostInterface>(`/posts/${postId}/retweet`, undefined, {
			headers: { Authorization: `Bearer ${token}` },
		})
		.then((res) => res.data);
}

interface TweetsListProps {
	posts?: PostInterface[];
}

const TweetsList: React.FC<TweetsListProps> = memo(({ posts }) => {
	const { data } = useSession();
	const queryClient = useQueryClient();
	const likeTweetMutation = useMutation(["like-tweet"], handleLikeTweet, {
		onSuccess: (data) => {
			console.log({ likeTweetMutation: data });
		},
	});
	const retweetMutation = useMutation(["retweet"], handleRetweet, {
		onSuccess: async (data) => {
			console.log({ retweetMutation: data });
			await queryClient.invalidateQueries({
				queryKey: ["list-posts"],
				exact: true,
			});
		},
	});

	return (
		<>
			{posts?.map((post, index) => {
				const postedBy = post.postedBy;
				const isLiked = post.likes.some(
					(u) => (u as unknown as string) === data?.user.id
				);
				const hasRetweets = !!post.retweetUsers.length;
				const isRetweet = !!post?.retweetData;
				const retweetedBy = isRetweet ? post.postedBy.username : null;
				post = isRetweet ? post.retweetData! : post;

				return (
					<div
						key={`${post._id ?? post.id}${index + 1}`}
						className="flex flex-col flex-shrink-0 p-2 gap-2 hover:cursor-pointer border-b-2"
					>
						{isRetweet && (
							<div className="pl-[35px] text-[13px] text-gray-500 mb-[5px]">
								<span className="flex items-center justify-start gap-1">
									<FaRetweet size={16} />
									<Link
										href={`/profiles/${post.postedBy._id}`}
									>
										Retweeted by{" "}
										{`@${
											retweetedBy ??
											post.postedBy.username
												.split(" ")
												.join("")
												.toLowerCase()
										}`}
									</Link>
								</span>
							</div>
						)}
						<div className="flex flex-1">
							<div>
								<ProfileImage />
							</div>

							<div className="pl-2 flex flex-col flex-1 gap-1">
								{/** post header */}
								<div className="flex gap-2 text-md">
									<Link
										href={`/profiles/${postedBy._id}`}
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

								{/** post body */}
								<div>
									<span>{post.content}</span>
								</div>

								{/** post footer */}
								<div className="flex items-center w-full">
									<div className="flex-1">
										<button className="flex items-center justify-center gap-1 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-blue-200">
											<HiOutlineChatBubbleOvalLeft
												size={22}
											/>
										</button>
									</div>

									<div className="flex-1">
										<button
											onClick={() => {
												retweetMutation.mutateAsync({
													postId: post._id ?? post.id,
													token:
														data?.user.token ?? "",
													isAuthenticated:
														!!data?.user,
												});
											}}
											className={`
											flex items-center justify-center gap-1 p-1 rounded-full hover:bg-emerald-200
												${
													hasRetweets
														? "text-emerald-500 hover:text-emerald-700"
														: "text-gray-500 hover:text-gray-700"
												}`}
										>
											<FaRetweet size={22} />
											{post.retweetUsers.length > 0 && (
												<span>
													{post.retweetUsers.length}
												</span>
											)}
										</button>
									</div>

									<div className="flex-1">
										<button
											onClick={() => {
												likeTweetMutation.mutateAsync({
													postId: post._id ?? post.id,
													token:
														data?.user.token ?? "",
													isLiked,
													isAuthenticated:
														!!data?.user,
												});
											}}
											className={`
												flex items-center justify-center gap-1 p-1 rounded-full
												hover:bg-red-200 ${
													isLiked
														? "text-red-500 hover:text-red-700"
														: "text-gray-500 hover:text-gray-700"
												}`}
										>
											<AiOutlineHeart size={22} />
											{post.likes.length > 0 && (
												<span>{post.likes.length}</span>
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
});

TweetsList.displayName = "TweetsList";

export { TweetsList };
