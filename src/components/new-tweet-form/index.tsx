import {
	type FormEvent,
	useCallback,
	useRef,
	useState,
	useEffect,
} from "react";
import { Session } from "next-auth";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";

// SERVICES
import { api } from "@/services/api";

// COMPONENTS
import { Button } from "@/components/button";
import { ProfileImage } from "@/components/profile-image";

function updateTextAreaSize(textArea?: HTMLTextAreaElement | null) {
	if (!textArea) return;

	textArea.style.height = "0";
	textArea.style.height = `${textArea.scrollHeight}px`;
}

async function createPost(content: string, token = "") {
	return await api
		.post(
			`posts`,
			{ content },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		.then((res) => res.data);
}

interface NewTweetFormProps {
	session: Session | null;
}

const NewTweetForm: React.FC<NewTweetFormProps> = ({ session }) => {
	const isAuthenticated = !!session?.user;

	const [inputValue, setInputValue] = useState("");
	const textAreaRef = useRef<HTMLTextAreaElement>();
	const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
		updateTextAreaSize(textArea);
		textAreaRef.current = textArea;
	}, []);

	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationKey: ["create-post"],
		mutationFn: async () =>
			await createPost(inputValue, session?.user.token),
		onSuccess: async () => {
			toast.success(`Post created successfully`);
			await queryClient.invalidateQueries({
				queryKey: ["list-posts"],
				exact: true,
			});
			setInputValue("");
		},
	});

	useEffect(() => {
		updateTextAreaSize(textAreaRef?.current);
	}, [inputValue]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		try {
			await mutation.mutateAsync();
		} catch (error: any) {
			console.error(error);
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		}
	};

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
				disabled={!isAuthenticated || !inputValue.trim().length}
			>
				Tweet
			</Button>
		</form>
	);
};

export { NewTweetForm };
