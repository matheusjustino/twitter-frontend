import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { useQueryClient } from "react-query";

// CONTEXTS
import { useTweet } from "@/contexts/use-tweet.context";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

const TABS = ["Recent", "Following"] as const;
type TAB = (typeof TABS)[number];

interface UseHomePageProps {
	session: Session | null;
	initialData?: PostInterface[];
}

const useHomePage = ({ initialData }: UseHomePageProps = { session: null }) => {
	const {
		tweets,
		setTweets,
		loading,
		fetchTweets,
		fetchNextPage,
		hasNextPage,
	} = useTweet();
	const [selectedTab, setSelectedTab] = useState<TAB>("Recent");
	const queryClient = useQueryClient();

	useEffect(() => {
		if (initialData && !tweets) {
			setTweets(initialData);
		}
	}, [tweets, initialData, setTweets]);

	const handleSelectTab = async (tab: TAB) => {
		if (tab === selectedTab) {
			if (hasNextPage) fetchNextPage();
		} else {
			await queryClient.resetQueries({
				queryKey: ["infinite-list-tweets"],
				exact: true,
			});
			setSelectedTab(tab);
			fetchTweets(tab);
		}
	};

	return {
		tweets,
		setTweets,
		selectedTab,
		setSelectedTab: handleSelectTab,
		loading,
		fetchTweets,
	};
};

export { useHomePage };
