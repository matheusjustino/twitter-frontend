import {
	GetServerSideProps,
	InferGetServerSidePropsType,
	NextPage,
} from "next";
import { getSession } from "next-auth/react";
import { QueryClient, dehydrate, useQuery } from "react-query";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";
import { TweetListItem } from "@/components/tweet-list-item";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

async function fetchPostById<T>(userId: string) {
	return await api.get<T>(`/posts/${userId}`).then((res) => res.data);
}

interface PostByIdResponseInterface {
	post: PostInterface;
	replyTo?: PostInterface;
	replies?: PostInterface[];
}

interface postPageProps {
	id: string;
	session?: Session;
}

const PostPage: NextPage<postPageProps> = ({ id, session }) => {
	const { push } = useRouter();
	const query = useQuery(
		[`get-post-${id}`],
		async () => await fetchPostById<PostByIdResponseInterface>(id),
		{
			staleTime: 1000 * 60 * 3,
			cacheTime: 1000 * 60 * 3,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);

	const data = query.data;

	if (!data) {
		push("/");
		return null;
	}

	const { post, replyTo, replies } = data;

	return (
		<>
			<header className="sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">View Post</h1>
			</header>

			{replyTo && (
				<TweetListItem
					post={replyTo}
					postedBy={replyTo.postedBy}
					isLiked={replyTo.likes.some(
						(u) => (u as unknown as string) === session?.user.id
					)}
					retweetedByUsername={
						replyTo.retweetData?.postedBy.username ??
						replyTo.postedBy.username
					}
				/>
			)}

			<div className="font-bold bg-gray-100">
				<TweetListItem
					post={post}
					postedBy={post.postedBy}
					isLiked={post.likes.some(
						(u) => (u as unknown as string) === session?.user.id
					)}
					retweetedByUsername={
						post.retweetData?.postedBy.username ??
						post.postedBy.username
					}
				/>
			</div>

			{replies?.map((reply, index) => (
				<TweetListItem
					key={(reply?._id ?? "") + index}
					post={reply}
					postedBy={reply.postedBy}
					isLiked={reply.likes.some(
						(u) => (u as unknown as string) === session?.user.id
					)}
					retweetedByUsername={
						reply.retweetData?.postedBy.username ??
						reply.postedBy.username
					}
				/>
			))}
		</>
	);
};

export const getServerSideProps: GetServerSideProps<{ id: string }> = async (
	ctx
) => {
	const id = ctx.params?.id as string | undefined;
	if (!id) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		[`get-post-${id}`],
		async () => await fetchPostById<PostByIdResponseInterface>(id)
	);

	const session = await getSession(ctx);

	return {
		props: {
			key: id,
			id,
			session,
			dehydratedState: dehydrate(queryClient),
		},
	};
};

export default PostPage;
