import Link from "next/link";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import { QueryClient, dehydrate, useMutation, useQuery } from "react-query";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

// COMPONENTS
import { LoadingSpinner } from "@/components/loading-spinner";
import { ProfileImage } from "@/components/profile-image";

async function handleFollowUser({
	userId,
	isAuthenticated,
}: {
	userId: string;
	isAuthenticated: boolean;
}) {
	if (!isAuthenticated) {
		toast.error(`You are not allowed to follow`);
		return;
	}

	return await api
		.put<UserInterface>(`/users/${userId}/follow`, undefined)
		.then((res) => res.data)
		.catch((error) => {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		});
}

async function fetchUserFollowersByUsername(username: string) {
	return await api
		.get<UserInterface>(`/users/username/${username}/followers`)
		.then((res) => res.data);
}

interface FollowersPageProps {
	username: string;
}

const FollowersPage: NextPage<FollowersPageProps> = ({ username }) => {
	const { data: loggedUser, status } = useSession();

	const query = useQuery(
		[`get-user-${username}`],
		async () => await fetchUserFollowersByUsername(username),
		{
			enabled: false,
			retry: 2,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);
	const followMutation = useMutation(
		[`followers-user-${query.data?._id}`],
		handleFollowUser,
		{
			onSuccess: async () => {
				await query.refetch();
			},
		}
	);
	const userFollowerPage = query.data;

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
					<Link
						className="mr-2 hover:underline"
						href={`/profiles/${userFollowerPage?.username}`}
					>
						{userFollowerPage?.username}
					</Link>
					Followers
				</h1>
			</header>
			{!userFollowerPage && (
				<div className="px-2 py-4">
					<h1 className="text-xl font-bold">No followings</h1>
				</div>
			)}

			{userFollowerPage && (
				<>
					{/** user */}
					{userFollowerPage.followers?.map((follower) => {
						const showFollowButton =
							follower._id !== loggedUser?.user.id;

						const isFollowing = follower.followers.find(
							(f) =>
								(f as unknown as string) === loggedUser?.user.id
						);

						return (
							<div key={follower._id} className="flex flex-col">
								{/** user details */}
								<div className="flex p-4 border-b-2 border-gray-300">
									<ProfileImage />

									{/** header */}
									<div className="flex flex-1 items-start justify-between px-4 py-0 font-bold">
										<div className="flex gap-2">
											<Link
												className="hover:underline"
												href={`/profiles/${follower.username}`}
											>
												{follower.username}
											</Link>
											<span className="text-gray-400">
												@{follower.username}
											</span>
										</div>

										{showFollowButton && (
											<button
												onClick={() => {
													followMutation.mutateAsync({
														userId:
															follower._id ?? "",
														isAuthenticated:
															status ===
															"authenticated",
													});
												}}
												className={`inline-block border-blue-400 border font-bold
													py-1 px-4 rounded-[60px] hover:cursor-pointer transition-colors duration-200
													${
														isFollowing
															? "bg-blue-400 text-white"
															: "hover:bg-blue-100 text-blue-400 hover:text-gray-700 hover:border-blue-400"
													}`}
											>
												{isFollowing
													? "Following"
													: "Follow"}
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</>
			)}
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
		async () => await fetchUserFollowersByUsername(username)
	);

	return {
		props: {
			key: username,
			username,
			dehydratedState: dehydrate(queryClient),
		},
	};
};

export default FollowersPage;
