import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { QueryClient, dehydrate } from "react-query";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

// HOOKS
import { useHomePage } from "@/hooks/useHomePage";

// COMPONENTS
import { NewTweetForm } from "@/components/new-tweet-form";
import { TweetsList } from "@/components/tweets-list";
import { LoadingSpinner } from "@/components/loading-spinner";

async function listPosts({
	onlyFollowing,
	userId,
}: {
	onlyFollowing?: boolean;
	userId?: string;
}) {
	const config =
		onlyFollowing && userId
			? {
					params: {
						filters: {
							onlyFollowing,
							userId,
						},
					},
			  }
			: {};
	return await api
		.get<PostInterface[]>(`/posts`, config)
		.then((res) => res.data);
}

interface HomePageProps {
	session: Session | null;
	initialData?: PostInterface[];
}

const TABS = ["Recent", "Following"] as const;

const HomePage: NextPage<HomePageProps> = ({ session, initialData }) => {
	const { tweets, selectedTab, loading, setSelectedTab } = useHomePage();

	return (
		<>
			<header className="sticky px-2 py-4 font-semibold bg-white">
				<h1 className="text-xl font-bold">Home</h1>
			</header>

			<div className="flex mt-4">
				{TABS.map((tab) => (
					<button
						disabled={!tweets || !session?.user}
						key={tab}
						className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200
							${tab === selectedTab ? "border-b-4 border-b-blue-500 font-bold" : ""}
							disabled:cursor-not-allowed`}
						onClick={() => setSelectedTab(tab)}
					>
						{tab}
					</button>
				))}
			</div>

			<NewTweetForm session={session} />

			{loading && (
				<div className="flex flex-col items-center justify-around gap-2 mt-28">
					<LoadingSpinner />
					<h1 className="text-lg font-semibold">Loading tweets...</h1>
				</div>
			)}
			{!loading && <TweetsList posts={tweets} />}
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery<PostInterface[]>(["list-posts"], () =>
		listPosts({ onlyFollowing: false })
	);

	return {
		props: {
			session: await getSession({
				ctx,
			}),
			initialData: queryClient.getQueryData<PostInterface[]>([
				"list-posts",
			]),
			dehydratedState: dehydrate(queryClient),
		},
	};
};

export default HomePage;
