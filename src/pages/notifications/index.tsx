import Link from "next/link";
import { GetServerSideProps, NextPage } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { QueryClient } from "react-query";

// UTILS
import { getUserNotifications } from "@/utils/get-user-notification";

// INTERFACES
import { NotificationInterface } from "@/interfaces/notification.interface";

// COMPONENTS
import { ProfileImage } from "@/components/profile-image";
import { NotificationTypeEnum } from "@/enums/notification-type.enum";

interface NotificationsPageProps {
	session: Session | null;
	notifications: NotificationInterface[];
}

const NotificationsPage: NextPage<NotificationsPageProps> = ({
	session,
	notifications,
}) => {
	return (
		<>
			<header className="sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">Notifications</h1>
			</header>

			{!notifications.length && (
				<div className="flex items-center justify-center p-4">
					<h1 className="font-bold">Nothing to show</h1>
				</div>
			)}

			{notifications.map((notification) => {
				const userFromName = notification.userFrom.username;

				let text = "";
				let href = "";
				if (
					notification.notificationType ===
					NotificationTypeEnum.RETWEET
				) {
					text = `${userFromName} retweeted one of your tweets`;
					href = `/posts/${notification.entityId}`;
				} else if (
					notification.notificationType === NotificationTypeEnum.REPLY
				) {
					text = `${userFromName} replied to one of your tweets`;
					href = `/posts/${notification.entityId}`;
				} else if (
					notification.notificationType ===
					NotificationTypeEnum.FOLLOW
				) {
					text = `${userFromName} followed your`;
					href = `/profiles/${userFromName}`;
				} else if (
					notification.notificationType === NotificationTypeEnum.LIKE
				) {
					text = `${userFromName} liked one of your tweets`;
					href = `/posts/${notification.entityId}`;
				}

				return (
					<Link
						key={notification._id}
						href={href}
						className="flex flex-1 items-center gap-2 border-b border-1 p-3"
					>
						<div className="mr-4">
							<ProfileImage />
						</div>

						<div className="text-lg text-ellipsis ">
							<span className="text-gray-500">{text}</span>
						</div>
					</Link>
				);
			})}
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getSession(ctx);

	if (!session?.user) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		[`get-user-notifications-${session?.user.id}`],
		async () => await getUserNotifications(session.user.token)
	);

	const notifications =
		queryClient.getQueryData<NotificationInterface[]>([
			`get-user-notifications-${session?.user.id}`,
		]) ?? [];

	return {
		props: {
			session,
			notifications,
		},
	};
};

export default NotificationsPage;
