import { createContext, useContext, useEffect, useState } from "react";
import {
	FetchNextPageOptions,
	InfiniteData,
	InfiniteQueryObserverResult,
	useInfiniteQuery,
	useQueryClient,
} from "react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// UTILS
import { getTweets } from "@/utils/get-tweets";

// STORES
import { useTweetStore } from "@/stores/useTweetStore";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

interface TweetContextData {
	tweets?: PostInterface[];
	loading: boolean;
	setTweets: (data?: PostInterface[]) => void;
	fetchTweets: (type?: "Recent" | "Following") => Promise<void>;
	fetchNextPage: (
		options?: FetchNextPageOptions | undefined
	) => Promise<InfiniteQueryObserverResult<PostInterface[], any>>;
	hasNextPage?: boolean;
}

export const TweetContext = createContext<TweetContextData>(
	{} as TweetContextData
);

interface TweetProviderProps {
	children: React.ReactNode;
}

export const TweetProvider: React.FC<TweetProviderProps> = ({ children }) => {
	const { data } = useSession();
	const { tweets, setTweets } = useTweetStore();
	const [loading, setLoading] = useState(false);

	const queryClient = useQueryClient();
	const {
		isLoading,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		refetch,
	} = useInfiniteQuery(
		["infinite-list-tweets"],
		async ({ pageParam = 0 }) => {
			return getTweets({ skip: pageParam });
		},
		{
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.length ? allPages.length + 1 : undefined;
			},
			onSuccess: (result) => {
				setTweets(result.pages.flat());
			},
			onError: (error: any) => {
				console.error(error);
				const errorMsg = error.response?.data?.error || error.message;
				toast.error(errorMsg);
			},
		}
	);

	useEffect(() => {
		if (!tweets) {
			const prefetchedTweets = queryClient.getQueryData<
				InfiniteData<PostInterface[]>
			>(["infinite-list-tweets"]);
			if (prefetchedTweets) {
				setTweets(prefetchedTweets?.pages?.flat() ?? []);
			} else {
				refetch();
			}
		}
	}, [queryClient, tweets, setTweets, refetch]);

	const handleSetTweets = (data?: PostInterface[]) => {
		setTweets(data);
	};

	async function handleFetchTweets(type?: "Recent" | "Following") {
		try {
			setLoading(true);
			const newTweets = await queryClient.fetchInfiniteQuery(
				["infinite-list-tweets", type],
				async ({ queryKey }) =>
					getTweets({
						...(queryKey[1] === "Following" && {
							filters: { userId: data?.user.id },
						}),
					})
			);
			setTweets(newTweets.pages.flat());
		} catch (error: any) {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		} finally {
			setLoading(false);
		}
	}

	const tweetProviderData: TweetContextData = {
		tweets,
		setTweets: handleSetTweets,
		loading: isLoading || isFetchingNextPage || loading,
		fetchTweets: handleFetchTweets,
		fetchNextPage,
		hasNextPage,
	};

	return (
		<TweetContext.Provider value={tweetProviderData}>
			{children}
		</TweetContext.Provider>
	);
};

export const useTweet = () => useContext(TweetContext);
