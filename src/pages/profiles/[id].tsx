import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	NextPage,
} from "next";
import { getSession, useSession } from "next-auth/react";
import { QueryClient, dehydrate, useQuery } from "react-query";
import { VscArrowLeft } from "react-icons/vsc";

// SERVICES
import { api } from "@/services/api";

// COMPONENTS
import { ProfileImage } from "@/components/profile-image";

async function fetchUserById(userId: string, token: string) {
	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
	return await api.get(`/users/${userId}`, config).then((res) => res.data);
}

const ProfilesPage: NextPage<
	InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
	const { data } = useSession();

	const query = useQuery(
		[`get-user-${id}`],
		async () => await fetchUserById(id, data?.user.token ?? ""),
		{
			retry: 2,
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);

	return <div>profiles page - {id}</div>;
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

	const session = await getSession(ctx);
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		[`get-user-${id}`],
		async () => await fetchUserById(id, session?.user.token ?? "")
	);

	return {
		props: {
			key: id,
			id,
			dehydratedState: dehydrate(queryClient),
		},
	};
};

export default ProfilesPage;
