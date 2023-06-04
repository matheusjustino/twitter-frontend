import { memo } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { AiOutlineLock } from "react-icons/ai";
import { MdPersonOutline } from "react-icons/md";

// HOOKS
import { useSignInPage } from "@/hooks/useSignInPage";

// COMPONENTS
import { Input } from "@/components/input";

const SignInPage: NextPage = memo(() => {
	const { handleSubmit, register, errors, onSubmit } = useSignInPage();

	return (
		<div className="w-full h-screen mx-auto flex">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-4 p-4 rounded-md min-w-[500px] m-auto border"
			>
				<Input
					className="w-full"
					id="email"
					type="text"
					placeholder="Type here"
					register={register("email")}
					icon={MdPersonOutline}
					label="Email"
					errors={errors}
				/>

				<Input
					className="w-full"
					id="password"
					type="password"
					placeholder="Type here"
					register={register("password")}
					icon={AiOutlineLock}
					label="Password"
					errors={errors}
				/>

				<div className="flex flex-col gap-2">
					<button
						type="submit"
						className="bg-[#1da1f2] px-8 py-2 rounded-md text-white font-semibold hover:opacity-80"
					>
						Login
					</button>

					<Link
						className="text-xs text-right hover:text-blue-800 hover:underline"
						href="/signup"
					>
						Create your account here
					</Link>
				</div>
			</form>
		</div>
	);
});

SignInPage.displayName = "SignInPage";

export default SignInPage;
