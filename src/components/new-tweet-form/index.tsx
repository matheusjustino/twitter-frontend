import { Session } from "next-auth";

// HOOKS
import { useNewTweetForm } from "@/hooks/useNewTweetForm";

// COMPONENTS
import { Button } from "@/components/button";
import { ProfileImage } from "@/components/profile-image";

interface NewTweetFormProps {
	session: Session | null;
}

const NewTweetForm: React.FC<NewTweetFormProps> = ({ session }) => {
	const isAuthenticated = !!session?.user;
	const { inputValue, setInputValue, inputRef, loading, handleSubmit } =
		useNewTweetForm();

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-2 border-b-8 px-4 py-2"
		>
			<div className="flex gap-4">
				<ProfileImage src={session?.user.profilePic} />
				<textarea
					ref={inputRef}
					style={{ height: 0 }}
					className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
					placeholder={
						isAuthenticated
							? `What's happening?`
							: "Login to post a tweet"
					}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					disabled={!isAuthenticated}
				/>
			</div>

			<Button
				className="self-end"
				disabled={
					!isAuthenticated || !inputValue.trim().length || loading
				}
			>
				{loading ? "Posting..." : "Tweet"}
			</Button>
		</form>
	);
};

export { NewTweetForm };
