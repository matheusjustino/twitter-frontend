import { useState } from "react";
import Link from "next/link";
import type { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import {
	InfiniteData,
	QueryClient,
	dehydrate,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "react-query";
import { IoMdMail } from "react-icons/io";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// UTILS
import { getTweets } from "@/utils/get-tweets";

// CONTEXTS
import { useNotification } from "@/contexts/notification.context";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";
import { PostInterface } from "@/interfaces/post.interface";

// COMPONENTS
import { ProfileImage } from "@/components/profile-image";
import { TweetsList } from "@/components/tweets-list";
import { LoadingSpinner } from "@/components/loading-spinner";
import { followUser } from "@/utils/follow-user";

async function fetchUserByUsername(username: string) {
	return await api
		.get<UserInterface>(`/users/username/${username}`)
		.then((res) => res.data);
}

const TABS = ["Tweets", "Replies"] as const;

interface ProfilesPageProps {
	username: string;
	initialUserTweets?: InfiniteData<PostInterface[]>;
	initialUserReplies?: InfiniteData<PostInterface[]>;
}

const ProfilesPage: NextPage<ProfilesPageProps> = ({
	username,
	initialUserTweets,
	initialUserReplies,
}) => {
	const { data: session, status } = useSession();
	const { emitNotification } = useNotification();
	const [selectedTab, setSelectedTab] =
		useState<(typeof TABS)[number]>("Tweets");

	const queryClient = useQueryClient();
	const userProfileQuery = useQuery(
		[`get-user-${username}`],
		async () => await fetchUserByUsername(username),
		{
			retry: 2,
			// enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);
	const userTweetsQuery = useInfiniteQuery(
		[`get-infinite-tweets-by-${username}`],
		async ({ pageParam = 0 }) => {
			return getTweets({
				skip: pageParam,
				filters: {
					pinned: true,
					postedBy: userProfileQuery.data?._id ?? "",
				},
			});
		},
		{
			initialData: initialUserTweets,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.length ? allPages.length + 1 : undefined;
			},
			onError: (error: any) => {
				console.error(error);
				const errorMsg = error.response?.data?.error || error.message;
				toast.error(errorMsg);
			},
		}
	);

	const userRepliesQuery = useInfiniteQuery(
		[`get-infinite-replies-by-${username}`],
		async () =>
			getTweets({
				filters: {
					isReply: true,
					postedBy: userProfileQuery.data?._id ?? "",
				},
			}),
		{
			initialData: initialUserReplies,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.length ? allPages.length + 1 : undefined;
			},
			onError: (error: any) => {
				console.error(error);
				const errorMsg = error.response?.data?.error || error.message;
				toast.error(errorMsg);
			},
		}
	);
	const followMutation = useMutation(
		[`follow-user-${userProfileQuery.data?._id}`],
		followUser,
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: [`get-user-${username}`],
					exact: true,
				});
			},
		}
	);
	const isFollowing = !!userProfileQuery.data?.followers.find(
		(u) => (u as unknown as string) === session?.user.id
	);

	const handleFollowUser = async () => {
		if (!session?.user) return;

		try {
			await followMutation.mutateAsync({
				userId: userProfileQuery.data?._id ?? "",
			});

			if (!isFollowing) {
				emitNotification(userProfileQuery.data?._id ?? "");
			}
		} catch (error: any) {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		}
	};

	if (!userProfileQuery.data) {
		return (
			<>
				<header className="sticky px-2 py-4 border-b-2 font-semibold bg-white">
					<h1 className="text-xl font-bold">{"User not found"}</h1>
				</header>

				<div className="flex justify-center p-5">
					<h1 className="font-semibold text-2xl">
						Check the url and trying again!
					</h1>
				</div>
			</>
		);
	}

	const activeTabCss = `text-blue-400 border-b-4 border-blue-400`;

	const tweetsLoading =
		userProfileQuery.isLoading ||
		userProfileQuery.isRefetching ||
		userTweetsQuery.isFetchingNextPage ||
		userTweetsQuery.isLoading ||
		userTweetsQuery.isRefetching ||
		userRepliesQuery.isFetchingNextPage ||
		userRepliesQuery.isLoading ||
		userRepliesQuery.isRefetching ||
		followMutation.isLoading;

	if (status === "loading") {
		return (
			<div className="flex flex-col gap-4 items-center justify-center h-screen">
				<LoadingSpinner />
				<h1 className="font-bold">Loading page...</h1>
			</div>
		);
	}

	return (
		<>
			<header className="sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">
					{userProfileQuery.data.username}
				</h1>
			</header>

			{/** profile header container */}
			<div className="pb-2">
				{/** cover photo container */}
				<div className="h-[180px] bg-blue-400 relative">
					<ProfileImage className="!w-[100px] !h-[100px] sm:!w-[132px] sm:!h-[132px] ml-4 !absolute -bottom-[53px] border-4 border-white" />
				</div>

				{/** profile buttons container */}
				<div className="flex justify-end p-4 min-h-[66px] gap-4">
					{session?.user.username !== username && (
						<>
							<span
								className="inline-block border-blue-400 border text-blue-400
								hover:text-gray-700 hover:border-blue-400 py-1 px-2 sm:px-4 rounded-[60px]
								hover:bg-blue-100 hover:cursor-pointer transition-colors duration-200"
							>
								<IoMdMail size={24} />
							</span>

							<button
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									handleFollowUser();
								}}
								className={`inline-block border-blue-400 border font-bold text-sm sm:text-base
									py-1 px-3 sm:px-4 rounded-[60px] hover:cursor-pointer transition-colors duration-200
									${
										isFollowing
											? "bg-blue-400 text-white"
											: "hover:bg-blue-100 text-blue-400 hover:text-gray-700 hover:border-blue-400"
									}`}
							>
								{isFollowing ? "Following" : "Follow"}
							</button>
						</>
					)}
				</div>

				{/** profile details container */}
				<div className="flex flex-col px-4">
					<span className="text-xl font-bold">
						{userProfileQuery.data.username}
					</span>
					<span className="text-sm text-gray-400 font-bold">
						@{userProfileQuery.data.username}
					</span>

					{/** profile details followers container */}
					<div className="flex gap-4">
						<Link
							href={`/profiles/${username}/following`}
							className="hover:underline border-black"
						>
							<span className="font-bold mr-2">
								{userProfileQuery.data.following.length ?? 0}
							</span>
							<span className="text-gray-400">Following</span>
						</Link>

						<Link
							href={`/profiles/${username}/followers`}
							className="hover:underline border-black"
						>
							<span className="font-bold mr-2">
								{userProfileQuery.data.followers.length ?? 0}
							</span>
							<span className="text-gray-400">Followers</span>
						</Link>
					</div>
				</div>
			</div>

			{/** profile tabs container */}
			<div className="flex flex-shrink-0 border-b-[1px] border-gray-300">
				<div
					onClick={() => {
						setSelectedTab("Tweets");
						userTweetsQuery.refetch();
					}}
					className={`flex flex-1 justify-center items-center font-bold h-[52px]
						hover:cursor-pointer hover:bg-blue-100 transition-colors duration-200 ${
							selectedTab === "Tweets"
								? activeTabCss
								: "text-gray-400 hover:text-blue-400"
						}`}
				>
					Tweets
				</div>
				<div
					onClick={() => {
						setSelectedTab("Replies");
						userRepliesQuery.refetch();
					}}
					className={`flex flex-1 justify-center items-center text-gray-400 font-bold h-[52px]
					hover:cursor-pointer hover:bg-blue-100 transition-colors duration-200 ${
						selectedTab === "Replies"
							? activeTabCss
							: "text-gray-400 hover:text-blue-400"
					}`}
				>
					Replies
				</div>
			</div>

			{/** tweets */}
			{tweetsLoading && (
				<div className="flex flex-col items-center gap-4 justify-center mt-20">
					<LoadingSpinner />
					<h1 className="text-lg font-semibold">Loading tweets...</h1>
				</div>
			)}
			{!tweetsLoading && (
				<TweetsList
					posts={
						selectedTab === "Tweets"
							? userTweetsQuery.data?.pages?.flat()
							: userRepliesQuery.data?.pages?.flat()
					}
				/>
			)}
		</>
	);
};

export const getServerSideProps: GetServerSideProps<{
	username: string;
}> = async (ctx) => {
	const username = ctx.params?.username as string | undefined;
	if (!username) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const session = await getSession(ctx);
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		[`get-user-${username}`],
		async () => await fetchUserByUsername(username)
	);
	const user = queryClient.getQueryData<UserInterface>([
		`get-user-${username}`,
	]);
	await Promise.all([
		queryClient.prefetchInfiniteQuery(
			[`get-infinite-tweets-by-${username}`],
			async () =>
				getTweets({
					filters: {
						pinned: true,
						postedBy: user?._id ?? "",
					},
				})
		),
		queryClient.prefetchInfiniteQuery(
			[`get-infinite-replies-by-${username}`],
			async () =>
				getTweets({
					filters: {
						isReply: true,
						postedBy: user?._id ?? "",
					},
				})
		),
	]);

	queryClient.setQueryData([`get-infinite-tweets-by-${username}`], {
		...queryClient.getQueryData<InfiniteData<PostInterface[]>>([
			`get-infinite-tweets-by-${username}`,
		]),
		pageParams: [null],
	});
	queryClient.setQueryData([`get-infinite-replies-by-${username}`], {
		...queryClient.getQueryData<InfiniteData<PostInterface[]>>([
			`get-infinite-replies-by-${username}`,
		]),
		pageParams: [null],
	});

	return {
		props: {
			key: username,
			username,
			session,
			initialUserTweets: queryClient.getQueryData<
				InfiniteData<PostInterface[]>
			>([`get-infinite-tweets-by-${username}`]),
			initialUserReplies: queryClient.getQueryData<
				InfiniteData<PostInterface[]>
			>([`get-infinite-replies-by-${username}`]),
			dehydratedState: dehydrate(queryClient),
		},
	};
};

export default ProfilesPage;
