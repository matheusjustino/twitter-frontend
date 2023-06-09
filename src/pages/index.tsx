import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { QueryClient, dehydrate } from "react-query";

// UTILS
import { getTweets } from "@/utils/get-tweets";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

// HOOKS
import { useHomePage } from "@/hooks/useHomePage";

// COMPONENTS
import { NewTweetForm } from "@/components/new-tweet-form";
import { TweetsList } from "@/components/tweets-list";

interface HomePageProps {
	session: Session | null;
	initialData?: PostInterface[];
}

const TABS = ["Recent", "Following"] as const;

const HomePage: NextPage<HomePageProps> = ({ session }) => {
	const { tweets, selectedTab, setSelectedTab } = useHomePage();

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

			<TweetsList posts={tweets} />
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const queryClient = new QueryClient();

	await queryClient.prefetchInfiniteQuery<PostInterface[]>(
		["infinite-list-tweets"],
		() => getTweets({})
	);

	const infiniteQueryData = queryClient.getQueryData<PostInterface[]>([
		"infinite-list-tweets",
	]);
	queryClient.setQueryData(["infinite-list-tweets"], {
		...infiniteQueryData,
		pageParams: [null],
	});

	return {
		props: {
			session: await getSession({
				ctx,
			}),
			dehydratedState: dehydrate(queryClient),
		},
	};
};

export default HomePage;
