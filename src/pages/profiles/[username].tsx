import type {
	GetServerSideProps,
	GetStaticPaths,
	GetStaticProps,
	InferGetServerSidePropsType,
	NextPage,
} from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { QueryClient, dehydrate, useQuery } from "react-query";
import { VscArrowLeft } from "react-icons/vsc";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

// COMPONENTS
import { ProfileImage } from "@/components/profile-image";

async function fetchUserByUsername(username: string) {
	return await api
		.get<UserInterface>(`/users/username/${username}`)
		.then((res) => res.data);
}

interface ProfilesPageProps {
	username: string;
}

const ProfilesPage: NextPage<ProfilesPageProps> = ({ username }) => {
	const { data } = useSession();

	const query = useQuery(
		[`get-user-${username}`],
		async () => await fetchUserByUsername(username),
		{
			retry: 2,
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);

	return <div>profiles page - {username}</div>;
};

export const getStaticPaths: GetStaticPaths = async () => {
	const config = {
		params: {
			limit: 10,
		},
	};
	const usernames = await api
		.get<UserInterface[]>(`/users`, config)
		.then((res) =>
			res.data.map((u) => {
				return {
					params: {
						username: u.username,
					},
				};
			})
		);

	return {
		paths: usernames || [],
		fallback: "blocking",
	};
};

export const getStaticProps: GetStaticProps<{ username: string }> = async (
	ctx
) => {
	const username = ctx.params?.username as string | undefined;
	if (!username) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		[`get-user-${username}`],
		async () => await fetchUserByUsername(username)
	);

	return {
		props: {
			key: username,
			username,
			dehydratedState: dehydrate(queryClient),
		},
	};
};

// export const getServerSideProps: GetServerSideProps<{
// 	username: string;
// }> = async (ctx) => {
// 	const username = ctx.params?.username as string | undefined;
// 	if (!username) {
// 		return {
// 			redirect: {
// 				destination: "/",
// 				permanent: false,
// 			},
// 		};
// 	}

// 	const session = await getSession(ctx);
// 	const queryClient = new QueryClient();
// 	await queryClient.prefetchQuery(
// 		[`get-user-${username}`],
// 		async () => await fetchUserByUsername(username)
// 	);

// 	return {
// 		props: {
// 			key: username,
// 			username,
// 			session,
// 			dehydratedState: dehydrate(queryClient),
// 		},
// 	};
// };

export default ProfilesPage;
