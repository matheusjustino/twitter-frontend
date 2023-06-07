import { Session } from "next-auth";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";
import { revalidateApi } from "@/services/revalidate-api";

// CONTEXTS
import { useTweet } from "@/contexts/use-tweet.context";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

async function deletePost({ postId }: { postId: string }) {
	return await api
		.delete<PostInterface>(`/posts/${postId}`)
		.then((res) => res.data);
}

interface TweetDeleteModalProps {
	open: boolean;
	onClose: () => void;
	post?: PostInterface;
	session: Session | null;
}

const TweetDeleteModal: React.FC<TweetDeleteModalProps> = ({
	open = false,
	onClose,
	post,
	session,
}) => {
	const { tweets, setTweets } = useTweet();
	const mutation = useMutation([`delete-post-${post?._id}`], deletePost, {
		onSuccess: async () => {
			setTweets(tweets?.filter((t) => t._id !== post?._id));
			const revalidateConfig = {
				params: {
					path: `/profiles/${session?.user.username}`,
					secret: process.env.NEXT_PUBLIC_NEXT_REVALIDATE_TOKEN,
				},
			};
			await revalidateApi.get(`/revalidate`, revalidateConfig);
		},
	});

	const handleDelete = async () => {
		try {
			await mutation.mutateAsync({ postId: post?._id ?? "" });
			onClose();
		} catch (error: any) {
			console.error(error);
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		}
	};

	const isAuthenticated = !!session;
	const canDeleteTweet =
		isAuthenticated && post && session?.user.id === post?.postedBy._id;

	return (
		<div
			className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm ${
				open ? "flex" : "hidden"
			} justify-center items-center px-2 z-50`}
		>
			<div
				className={`bg-white rounded w-full md:w-2/3 xl:w-1/3 animate-[fade-in-down_0.4s_ease-in-out]`}
			>
				{/** header */}
				<div className="border-b px-4 py-2 font-semibold text-xl">
					Delete the post?
				</div>

				{/** post content */}
				{!canDeleteTweet && (
					<div className="py-6 px-4">
						{`You won't be able to delete this.`}
					</div>
				)}

				{canDeleteTweet && (
					<div className="py-6 px-4">{`Are you sure?`}</div>
				)}

				{/** footer */}
				<div className="flex justify-end items-center w-100 border-t p-3 gap-1">
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onClose();
						}}
						className="bg-gray-500 hover:bg-gray-600 px-3 py-1
							rounded text-white min-w-[80px] transition-colors duration-200"
					>
						Cancel
					</button>

					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleDelete();
						}}
						disabled={!canDeleteTweet}
						className="bg-red-500 hover:bg-red-600 px-3 py-1
							rounded text-white min-w-[80px] disabled:bg-red-300
							disabled:cursor-not-allowed transition-colors duration-200"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export { TweetDeleteModal };
