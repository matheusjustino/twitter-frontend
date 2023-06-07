import { AiOutlineHeart } from "react-icons/ai";
import { FaRetweet } from "react-icons/fa";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";

interface TweetListItemFooterProps {
	hasRetweets: boolean;
	totalRetweets: number;
	isLiked: boolean;
	totalLikes: number;
	handleReply: () => void;
	handleRetweet: () => void;
	handleLike: () => void;
}

const TweetListItemFooter: React.FC<TweetListItemFooterProps> = ({
	hasRetweets,
	totalRetweets,
	isLiked,
	totalLikes,
	handleReply,
	handleRetweet,
	handleLike,
}) => {
	return (
		<div className="flex items-center w-full">
			<div className="flex-1">
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleReply();
					}}
					className="flex items-center justify-center gap-1 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-blue-200"
				>
					<HiOutlineChatBubbleOvalLeft className="h-5 w-5 sm:h-8 sm:w-8" />
				</button>
			</div>

			<div className="flex-1">
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleRetweet();
					}}
					className={`
						flex items-center justify-center gap-1 p-1 rounded-full hover:bg-emerald-200
							${
								hasRetweets
									? "text-emerald-500 hover:text-emerald-700"
									: "text-gray-500 hover:text-gray-700"
							}`}
				>
					<FaRetweet className="h-5 w-5 sm:h-8 sm:w-8" />
					{totalRetweets && <span>{totalRetweets}</span>}
				</button>
			</div>

			<div className="flex-1">
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleLike();
					}}
					className={`
						flex items-center justify-center gap-1 p-1 rounded-full
						hover:bg-red-200 ${
							isLiked
								? "text-red-500 hover:text-red-700"
								: "text-gray-500 hover:text-gray-700"
						}`}
				>
					<AiOutlineHeart className="h-5 w-5 sm:h-8 sm:w-8" />
					{totalLikes > 0 && <span>{totalLikes}</span>}
				</button>
			</div>
		</div>
	);
};

export { TweetListItemFooter };
