import { useState } from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import {
	QueryClient,
	dehydrate,
	useMutation,
	useQuery,
	useQueryClient,
} from "react-query";
import { IoMdMail } from "react-icons/io";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

// COMPONENTS
import { ProfileImage } from "@/components/profile-image";
import { PostInterface } from "@/interfaces/post.interface";
import { TweetsList } from "@/components/tweets-list";
import { LoadingSpinner } from "@/components/loading-spinner";

async function fetchUserByUsername(username: string) {
	return await api
		.get<UserInterface>(`/users/username/${username}`)
		.then((res) => res.data);
}

async function fetchUserPosts(filters: { [key: string]: string | boolean }) {
	const config = {
		params: {
			filters,
		},
	};
	return await api
		.get<PostInterface[]>(`/posts`, config)
		.then((res) => res.data);
}

const TABS = ["Posts", "Replies"] as const;

interface ProfilesPageProps {
	username: string;
}

const ProfilesPage: NextPage<ProfilesPageProps> = ({ username }) => {
	const { data, status } = useSession();
	const [selectedTab, setSelectedTab] =
		useState<(typeof TABS)[number]>("Posts");

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
	const userPostsQuery = useQuery(
		[`get-posts-by-${username}`],
		async () =>
			await fetchUserPosts({
				postedBy: userProfileQuery.data?._id ?? "",
			}),
		{
			retry: 2,
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);
	const userRepliesQuery = useQuery(
		[`get-retweets-by-${username}`],
		async () =>
			await fetchUserPosts({
				postedBy: userProfileQuery.data?._id ?? "",
				isReply: true,
			}),
		{
			retry: 2,
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);
	const followMutation = useMutation(
		[`follow-user-${userProfileQuery.data?._id}`],
		async ({ userId }: { userId: string }) => {
			return await api
				.put<UserInterface>(`/users/${userId}/follow`, undefined)
				.then((res) => res.data);
		},
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
		(u) => (u as unknown as string) === data?.user.id
	);

	const handleFollowUser = async () => {
		try {
			await followMutation.mutateAsync({
				userId: userProfileQuery.data?._id ?? "",
			});
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
					<ProfileImage className="!w-[132px] !h-[132px] ml-4 !absolute -bottom-[66px] border-4 border-white" />
				</div>

				{/** profile buttons container */}
				<div className="flex justify-end p-4 min-h-[66px] gap-4">
					{data?.user.username !== username && (
						<>
							<span
								className="inline-block border-blue-400 border text-blue-400
								hover:text-gray-700 hover:border-blue-400 py-1 px-4 rounded-[60px]
								hover:bg-blue-100 hover:cursor-pointer transition-colors duration-200"
							>
								<IoMdMail size={24} />
							</span>

							<button
								onClick={handleFollowUser}
								className={`inline-block border-blue-400 border font-bold
									py-1 px-4 rounded-[60px] hover:cursor-pointer transition-colors duration-200
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
					onClick={() => setSelectedTab("Posts")}
					className={`flex flex-1 justify-center items-center font-bold h-[52px]
						hover:cursor-pointer hover:bg-blue-100 transition-colors duration-200 ${
							selectedTab === "Posts"
								? activeTabCss
								: "text-gray-400 hover:text-blue-400"
						}`}
				>
					Posts
				</div>
				<div
					onClick={() => setSelectedTab("Replies")}
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
			<TweetsList
				posts={
					selectedTab === "Posts"
						? userPostsQuery.data
						: userRepliesQuery.data
				}
			/>
		</>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const config = {
		params: {
			limit: 10,
		},
	};
	const usernames = await api
		.get<UserInterface[]>(`/users`, config)
		.then((res) =>
			res.data.map((u) => {
				return {
					params: {
						username: u.username,
					},
				};
			})
		);

	return {
		paths: usernames || [],
		fallback: "blocking",
	};
};

export const getStaticProps: GetStaticProps<{ username: string }> = async (
	ctx
) => {
	const username = ctx.params?.username as string | undefined;

	if (!username) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery(
		[`get-user-${username}`],
		async () => await fetchUserByUsername(username)
	);
	const user = queryClient.getQueryData<UserInterface>([
		`get-user-${username}`,
	]);
	await Promise.all([
		queryClient.prefetchQuery(
			[`get-posts-by-${username}`],
			async () =>
				await fetchUserPosts({
					postedBy: user?._id ?? "",
				})
		),
		queryClient.prefetchQuery(
			[`get-retweets-by-${username}`],
			async () =>
				await fetchUserPosts({
					postedBy: user?._id ?? "",
					isReply: true,
				})
		),
	]);

	return {
		props: {
			key: username,
			username,
			dehydratedState: dehydrate(queryClient),
		},
	};
};

// export const getServerSideProps: GetServerSideProps<{
// 	username: string;
// }> = async (ctx) => {
// 	const username = ctx.params?.username as string | undefined;
// 	if (!username) {
// 		return {
// 			redirect: {
// 				destination: "/",
// 				permanent: false,
// 			},
// 		};
// 	}

// 	const session = await getSession(ctx);
// 	const queryClient = new QueryClient();
// 	await queryClient.prefetchQuery(
// 		[`get-user-${username}`],
// 		async () => await fetchUserByUsername(username)
// 	);

// 	return {
// 		props: {
// 			key: username,
// 			username,
// 			session,
// 			dehydratedState: dehydrate(queryClient),
// 		},
// 	};
// };

export default ProfilesPage;
