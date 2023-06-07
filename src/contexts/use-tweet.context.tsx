import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// STORES
import { useTweetStore } from "@/stores/useTweetStore";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

interface TweetContextData {
	tweets?: PostInterface[];
	loading: boolean;
	setTweets: (data?: PostInterface[]) => void;
	fetchTweets: (type?: "Recent" | "Following") => Promise<void>;
}

export const TweetContext = createContext<TweetContextData>(
	{} as TweetContextData
);

interface TweetProviderProps {
	children: React.ReactNode;
}

async function listPosts({ userId }: { userId?: string }) {
	const config = userId
		? {
				params: {
					filters: {
						userId,
					},
				},
		  }
		: {};
	return await api
		.get<PostInterface[]>(`/posts`, config)
		.then((res) => res.data);
}

export const TweetProvider: React.FC<TweetProviderProps> = ({ children }) => {
	const { data } = useSession();
	const { tweets, setTweets } = useTweetStore();
	const [loading, setLoading] = useState(false);

	const queryClient = useQueryClient();
	const tweetQuery = useQuery(
		["list-posts"],
		async ({ queryKey }) => {
			console.log({ queryKey });
			return await listPosts({});
		},
		{
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			onSuccess: (data) => {
				setTweets(data);
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
			const prefetchedTweets = queryClient.getQueryData<PostInterface[]>([
				"list-posts",
			]);
			if (prefetchedTweets) {
				setTweets(prefetchedTweets);
			} else {
				tweetQuery.refetch();
			}
		}
	}, [queryClient, tweets, setTweets, tweetQuery]);

	const handleSetTweets = (data?: PostInterface[]) => {
		setTweets(data);
	};

	async function handleFetchTweets(type?: "Recent" | "Following") {
		try {
			setLoading(true);
			const newTweets = await queryClient.fetchQuery(
				["list-posts", type],
				async ({ queryKey }) =>
					await listPosts(
						queryKey[1] === "Following"
							? { userId: data?.user.id }
							: {}
					)
			);
			setTweets(newTweets);
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
		loading: tweetQuery.isLoading || tweetQuery.isRefetching || loading,
		fetchTweets: handleFetchTweets,
	};

	return (
		<TweetContext.Provider value={tweetProviderData}>
			{children}
		</TweetContext.Provider>
	);
};

export const useTweet = () => useContext(TweetContext);
