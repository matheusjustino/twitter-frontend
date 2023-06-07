import { useEffect, useState } from "react";
import { Session } from "next-auth";

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
	const { tweets, setTweets, loading, fetchTweets } = useTweet();
	const [selectedTab, setSelectedTab] = useState<TAB>("Recent");

	useEffect(() => {
		if (initialData && !tweets) {
			setTweets(initialData);
		}
	}, [tweets, initialData, setTweets]);

	const handleSelectTab = (tab: TAB) => {
		setSelectedTab(tab);
		fetchTweets(tab);
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
