import Link from "next/link";
import { memo } from "react";
import { NextPage } from "next";
import { MdPersonOutline } from "react-icons/md";
import { AiOutlineLock } from "react-icons/ai";
import { VscLoading } from "react-icons/vsc";

// HOOKS
import { useSignUpPage } from "@/hooks/useSignUpPage";

// COMPONENTS
import { Input } from "@/components/input";

const SignUpPage: NextPage = memo(() => {
	const { handleSubmit, register, formErrors, onSubmit, loading } =
		useSignUpPage();

	return (
		<div className="w-full h-screen mx-auto flex">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-4 p-4 rounded-md min-w-[500px] m-auto border"
			>
				<Input
					className="w-full"
					id="username"
					type="text"
					placeholder="Type here"
					register={register("username")}
					icon={MdPersonOutline}
					label="Username"
					errors={formErrors}
				/>

				<Input
					className="w-full"
					id="email"
					type="text"
					placeholder="Type here"
					register={register("email")}
					icon={MdPersonOutline}
					label="Email"
					errors={formErrors}
				/>

				<Input
					className="w-full"
					id="password"
					type="password"
					placeholder="Type here"
					register={register("password")}
					icon={AiOutlineLock}
					label="Password"
					errors={formErrors}
				/>

				<div className="flex flex-col gap-2">
					<button
						disabled={loading}
						type="submit"
						className="bg-[#1da1f2] px-8 py-2 rounded-md text-white font-semibold
							hover:opacity-80 disabled:bg-gray-300 disabled:cursor-not-allowed w-full
							min-h-[50px]"
					>
						{loading ? (
							<VscLoading
								className="animate-spin mx-auto"
								size={26}
							/>
						) : (
							"Register"
						)}
					</button>

					<Link
						className="text-xs text-right hover:text-blue-800 hover:underline"
						href="/signin"
					>
						Already have an account?
					</Link>
				</div>
			</form>
		</div>
	);
});

SignUpPage.displayName = "SignUpPage";

export default SignUpPage;
