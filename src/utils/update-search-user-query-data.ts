import { type QueryClient } from "react-query";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

export const FOLLOW_ACTION = ["Follow", "Unfollow"] as const;

interface UpdateSearchedUsersInterface {
	queryClient: QueryClient;
	updatedLoggedUser: UserInterface;
	selectedUserId: string;
	action: (typeof FOLLOW_ACTION)[number];
	queryKeys: string[];
}

export function updateSearchedUsers({
	queryClient,
	updatedLoggedUser,
	selectedUserId,
	action,
	queryKeys,
}: UpdateSearchedUsersInterface) {
	queryClient.setQueryData<UserInterface[] | undefined>(
		queryKeys,
		(oldData) => {
			if (!oldData) return;

			// find updated user
			const updatedUserIndex = oldData.findIndex(
				(u) => u._id === selectedUserId
			);

			// return oldData if not founded
			if (updatedUserIndex < 0) return oldData;

			// If it's a follow action, then add the logged in user ID to the selected user's follower array. Otherwise, remove
			if (action === "Follow") {
				(
					oldData[updatedUserIndex].followers as unknown as string[]
				).push(updatedLoggedUser._id ?? "");
			} else {
				oldData[updatedUserIndex].followers = oldData[
					updatedUserIndex
				].followers.filter(
					(u) => (u as unknown as string) !== updatedLoggedUser._id
				);
			}
			return oldData;
		}
	);
}
