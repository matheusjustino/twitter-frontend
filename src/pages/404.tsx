import { memo } from "react";
import { NextPage } from "next";
import Link from "next/link";

const Page404: NextPage = memo(() => {
	return (
		<div className="flex flex-col w-full min-h-screen gap-6 items-center justify-center">
			<div className="flex flex-col gap-2 text-3xl sm:flex-row">
				<h1 className="text-center">Ops... </h1>
				<h1 className="">Page not found</h1>
			</div>

			<Link href="/">
				<button className="px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 duration-200 transition-colors text-white">
					Back home
				</button>
			</Link>
		</div>
	);
});

Page404.displayName = "Page404";

export default Page404;
