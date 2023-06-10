import Link from "next/link";

import { Session } from "next-auth";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

// COMPONENTS
import { ProfileImage } from "../profile-image";

interface UserListItemProps {
	session: Session | null;
	user: UserInterface;
	isFollowing: boolean;
	handleFollow?: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
	user,
	session,
	isFollowing,
	handleFollow,
}) => {
	return (
		<div className="flex items-start justify-between p-4 border-b-2 hover:cursor-pointer hover:bg-slate-100 transition-colors duration-200">
			<div className="flex items-start gap-4">
				<ProfileImage />

				<div className="flex gap-2">
					<Link
						href={`/profiles/${user.username}`}
						className="font-bold hover:underline"
					>
						{user.username}
					</Link>
					<span className="text-gray-500">{`@${user.username
						.split(" ")
						.join("")
						.toLowerCase()}`}</span>
				</div>
			</div>

			{handleFollow && user.id !== session?.user?.id && (
				<div className="flex justify-end px-1">
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleFollow();
						}}
						className={`inline-block border-blue-400 border font-bold
							py-1 px-2 rounded-[60px] hover:cursor-pointer transition-colors duration-200
							${
								isFollowing
									? "bg-blue-400 text-white"
									: "hover:bg-blue-100 text-blue-400 hover:text-gray-700 hover:border-blue-400"
							}`}
					>
						{isFollowing ? "Following" : "Follow"}
					</button>
				</div>
			)}
		</div>
	);
};

export { UserListItem };
