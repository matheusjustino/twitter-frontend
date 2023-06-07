import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";

// CONTEXTS
import { useTweet } from "@/contexts/use-tweet.context";

// SERVICES
import { api } from "@/services/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement | null) {
	if (!textArea) return;

	textArea.style.height = "0";
	textArea.style.height = `${textArea.scrollHeight}px`;
}

async function createPost(content: string) {
	return await api.post(`posts`, { content }).then((res) => res.data);
}

const useNewTweetForm = () => {
	const { tweets, setTweets } = useTweet();
	const [inputValue, setInputValue] = useState("");
	const textAreaRef = useRef<HTMLTextAreaElement>();
	const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
		updateTextAreaSize(textArea);
		textAreaRef.current = textArea;
	}, []);

	const mutation = useMutation({
		mutationKey: ["create-post"],
		mutationFn: async () => await createPost(inputValue),
		onSuccess: async (data) => {
			setTweets(tweets ? [data, ...tweets] : [data]);
			toast.success(`Post created successfully`);
			setInputValue("");

			const revalidateConfig = {
				params: {
					path: `/profiles`,
					secret: process.env.NEXT_PUBLIC_NEXT_REVALIDATE_TOKEN,
				},
			};
			await api.get(`/api/revalidate`, revalidateConfig);
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

	return {
		inputValue,
		setInputValue,
		inputRef,
		handleSubmit,
		loading: mutation.isLoading,
	};
};

export { useNewTweetForm };
