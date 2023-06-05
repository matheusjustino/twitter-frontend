import { useEffect } from "react";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { QueryClient, dehydrate, useQuery } from "react-query";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

// STORES
import { usePost } from "@/stores/usePost";

// COMPONENTS
import { NewTweetForm } from "@/components/new-tweet-form";
import { TweetsList } from "@/components/tweets-list";

async function listPosts() {
	return await api.get<PostInterface[]>(`/posts`).then((res) => res.data);
}

interface HomePageProps {
	session: Session | null;
}

const HomePage: NextPage<HomePageProps> = ({ session }) => {
	const { posts, setData } = usePost();

	const query = useQuery(["list-posts"], async () => await listPosts(), {
		// staleTime: 1000 * 60 * 3,
		// cacheTime: 1000 * 60 * 3,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		setData({ posts: query.data });
	}, [query.data, setData]);

	return (
		<>
			<header className="sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">Home</h1>
			</header>

			<NewTweetForm session={session} />

			<TweetsList posts={posts} />
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(["list-posts"], listPosts);

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
