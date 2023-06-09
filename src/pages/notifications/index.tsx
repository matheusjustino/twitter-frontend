import Link from "next/link";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BsCheck2All } from "react-icons/bs";
import { VscRefresh } from "react-icons/vsc";

// ENUMS
import { NotificationTypeEnum } from "@/enums/notification-type.enum";

// CONTEXTS
import { useNotification } from "@/contexts/notification.context";

// COMPONENTS
import { ProfileImage } from "@/components/profile-image";
import { LoadingSpinner } from "@/components/loading-spinner";

const NotificationsPage: NextPage = () => {
	const {
		notifications,
		allOpened,
		loading,
		hasNextPage,
		fetchNextPage,
		openAllNotifications,
		openSingleNotification,
	} = useNotification();

	return (
		<>
			<header className="flex items-center justify-between sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">Notifications</h1>

				<button
					type="button"
					disabled={loading || allOpened}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (!loading && !allOpened) {
							openAllNotifications();
						}
					}}
					className={`
					p-1 rounded-full bg-slate-100 hover:bg-slate-200
					hover:cursor-pointer transition-colors duration-200
					${allOpened ? "border-blue-400" : "border-gray-400"} border-[1px]`}
				>
					{loading && (
						<VscRefresh
							className={`animate-spin w-5 h-5 sm:w-6 sm:h-6`}
						/>
					)}
					{!loading && (
						<BsCheck2All
							className={`w-5 h-5 sm:w-6 sm:h-6 ${
								allOpened && "text-blue-500"
							}`}
						/>
					)}
				</button>
			</header>

			{loading && (
				<div className="flex flex-col flex-1 items-center justify-end gap-2 mt-12">
					<LoadingSpinner />
					<h1 className="font-bold">Loading notifications...</h1>
				</div>
			)}

			{!loading && notifications?.length === 0 && (
				<div className="flex items-center justify-center p-4">
					<h1 className="font-bold">Nothing to show</h1>
				</div>
			)}

			{!loading && notifications && notifications?.length > 0 && (
				<InfiniteScroll
					dataLength={notifications?.length ?? 0}
					hasMore={!!hasNextPage}
					next={fetchNextPage}
					loader={<LoadingSpinner />}
				>
					{notifications.map((notification) => {
						const userFromName = notification.userFrom.username;
						const activeClasses = !notification.opened
							? `bg-blue-100 border-white`
							: "";

						let text = "";
						let href = "";
						if (
							notification.notificationType ===
							NotificationTypeEnum.RETWEET
						) {
							text = ` retweeted one of your tweets`;
							href = `/posts/${notification.entityId}`;
						} else if (
							notification.notificationType ===
							NotificationTypeEnum.REPLY
						) {
							text = ` replied to one of your tweets`;
							href = `/posts/${notification.entityId}`;
						} else if (
							notification.notificationType ===
							NotificationTypeEnum.FOLLOW
						) {
							text = ` followed you`;
							href = `/profiles/${userFromName}`;
						} else if (
							notification.notificationType ===
							NotificationTypeEnum.LIKE
						) {
							text = ` liked one of your tweets`;
							href = `/posts/${notification.entityId}`;
						}

						return (
							<Link
								key={notification._id}
								href={href}
								onClick={() =>
									openSingleNotification(
										notification._id ?? notification.id,
										notification.opened
									)
								}
								className={`flex flex-1 items-center gap-2
							border-b border-1 p-3 hover:bg-slate-100 ${activeClasses}`}
							>
								<div className="mr-4">
									<ProfileImage />
								</div>

								<div className="text-lg text-ellipsis ">
									<span className="text-gray-500">
										<strong>{userFromName}</strong>
										{text}
									</span>
								</div>
							</Link>
						);
					})}
				</InfiniteScroll>
			)}
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

	return {
		props: {},
	};
};

export default NotificationsPage;
