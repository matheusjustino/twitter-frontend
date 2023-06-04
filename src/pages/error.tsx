import { NextPage } from "next";
import Link from "next/link";

interface ErrorPageProps {
	error: Error;
}

const ErrorPage: NextPage<ErrorPageProps> = ({ error }) => {
	return (
		<div className="grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8 bg-gray-900">
			<div className="text-center">
				<p className="text-3xl font-semibold text-emerald-700 dark:text-emerald-500">
					There was a problem
				</p>

				<h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-lg">
					{error?.message || "Something went wrong"}
				</h1>

				<div className="mt-10 flex items-center justify-center gap-x-6">
					<Link href="/">
						<button className="px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 duration-200 transition-colors text-white">
							Back home
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ErrorPage;
