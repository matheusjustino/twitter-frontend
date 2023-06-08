import { ChangeEvent, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";

// SERVICES
import { api } from "@/services/api";

// HOOKS
import { useDebounce } from "@/hooks/use-debounce";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";
import { UserInterface } from "@/interfaces/user.interface";

// COMPONENTS
import { TweetsList } from "@/components/tweets-list";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ProfileImage } from "@/components/profile-image";

const TABS = ["Tweets", "Users"] as const;

const SearchPage: NextPage = () => {
	const { data: session, status } = useSession();
	const [inputValue, setInputValue] = useState<string>("");
	const [selectedTab, setSelectedTab] =
		useState<(typeof TABS)[number]>("Tweets");

	const { refetch: refetchSearchTweets, ...searchTweetsQuery } = useQuery(
		[`search-tweets`],
		async () => {
			const config = {
				params: {
					filters: {
						content: inputValue,
					},
				},
			};
			return await api
				.get<PostInterface[]>(`/posts`, config)
				.then((res) => res.data);
		},
		{
			onSuccess: () => {
				setInputValue("");
			},
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);
	const { refetch: refetchSearchUsers, ...searchUsersQuery } = useQuery(
		[`search-users`],
		async () => {
			const config = {
				params: {
					username: inputValue,
					...(session?.user && { userSearching: session?.user.id }),
				},
			};
			return await api
				.get<UserInterface[]>(`/users`, config)
				.then((res) => res.data);
		},
		{
			onSuccess: () => {
				setInputValue("");
			},
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);

	const debouncedSearchTweets = useDebounce({
		fn: refetchSearchTweets,
		delay: 750,
	});
	const debouncedSearchUsers = useDebounce({
		fn: refetchSearchUsers,
		delay: 750,
	});

	const onSubmit = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();

		const removeBlankSpaces = e.target.value.trim();
		if (!removeBlankSpaces.length) return;

		if (selectedTab === "Tweets") {
			debouncedSearchTweets();
		} else {
			debouncedSearchUsers();
		}
	};

	const searchTweetsLoading =
		searchTweetsQuery.isLoading || searchTweetsQuery.isRefetching;
	const searchUsersLoading =
		searchUsersQuery.isLoading || searchUsersQuery.isRefetching;
	const activeTabCss = `text-blue-400 border-b-4 border-blue-400`;

	if (status === "loading") {
		return (
			<div className="flex flex-col gap-4 items-center justify-center mt-20">
				<LoadingSpinner />
				<h1 className="font-bold">Loading page</h1>
			</div>
		);
	}

	return (
		<>
			<header className="sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">Search</h1>
			</header>

			{/** input container */}
			<div className="p-4">
				<input
					disabled={!session?.user}
					className="w-full h-14 px-4 py-1 rounded-full bg-slate-500/20
					focus:outline-none border-gray-200 border-2 disabled:cursor-not-allowed"
					type="text"
					placeholder="Search for users or tweets"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value);
						onSubmit(e);
					}}
				/>
			</div>

			{/** tabs container */}
			<div className="flex flex-shrink-0 border-b-[1px] border-gray-300">
				<div
					onClick={() => {
						setSelectedTab("Tweets");
						// userTweetsQuery.refetch();
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
						setSelectedTab("Users");
						// userRepliesQuery.refetch();
					}}
					className={`flex flex-1 justify-center items-center text-gray-400 font-bold h-[52px]
					hover:cursor-pointer hover:bg-blue-100 transition-colors duration-200 ${
						selectedTab === "Users"
							? activeTabCss
							: "text-gray-400 hover:text-blue-400"
					}`}
				>
					Users
				</div>
			</div>

			{/** tabs result */}
			{selectedTab === "Tweets" && (
				<>
					{searchTweetsLoading && (
						<div className="flex flex-col gap-4 items-center justify-center mt-20">
							<LoadingSpinner />
							<h1 className="font-bold">Loading tweets...</h1>
						</div>
					)}
					{!searchTweetsLoading && (
						<TweetsList posts={searchTweetsQuery.data} />
					)}
				</>
			)}

			{selectedTab === "Users" && (
				<>
					{searchUsersLoading && (
						<div className="flex flex-col gap-4 items-center justify-center mt-20">
							<LoadingSpinner />
							<h1 className="font-bold">Loading users...</h1>
						</div>
					)}

					{!searchUsersLoading && (
						<>
							{!searchUsersQuery?.data?.length && (
								<div className="flex flex-col gap-4 items-center justify-center mt-20">
									<h1 className="font-bold">No data</h1>
								</div>
							)}

							{searchUsersQuery?.data?.length &&
								searchUsersQuery?.data?.map((u) => {
									const isFollowing = u.followers.some(
										(f) =>
											(f as unknown as string) ===
											session?.user.id
									);

									return (
										<div key={u._id}>
											<div className="flex items-start justify-between p-4">
												<div className="flex items-start gap-4">
													<ProfileImage />

													<div className="flex gap-2">
														<Link
															href={`/profiles/${u.username}`}
															className="font-bold hover:underline"
														>
															{u.username}
														</Link>
														<span className="text-gray-500">{`@${u.username
															.split(" ")
															.join("")
															.toLowerCase()}`}</span>
													</div>
												</div>

												{u.id !== session?.user.id && (
													<div className="flex justify-end p-4 min-h-[66px] gap-4">
														<button
															onClick={() => {}}
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
													</div>
												)}
											</div>
										</div>
									);
								})}
						</>
					)}
				</>
			)}
		</>
	);
};

export default SearchPage;
