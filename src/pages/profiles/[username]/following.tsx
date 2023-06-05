import { NextPage } from "next";
import { useSession } from "next-auth/react";

const FollowingPage: NextPage = () => {
	const { data } = useSession();

	return (
		<>
			<header className="sticky px-2 py-4 border-b-2 font-semibold bg-white">
				<h1 className="text-xl font-bold">
					Following {data?.user.username}
				</h1>
			</header>
		</>
	);
};

export default FollowingPage;
