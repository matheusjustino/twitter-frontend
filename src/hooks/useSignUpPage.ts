import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// sERVICES
import { api } from "@/services/api";

const formSchema = z.object({
	username: z.string().min(1).nonempty(),
	email: z.string().email().nonempty(),
	password: z.string().min(6).nonempty(),
});

type FormType = z.infer<typeof formSchema & FieldValues>;

const useSignUpPage = () => {
	const { push } = useRouter();
	const {
		handleSubmit,
		register,
		reset,
		formState: { errors },
	} = useForm<FormType>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	const { mutateAsync, isLoading, error } = useMutation({
		mutationKey: ["register"],
		mutationFn: async (data: FormType) => {
			return await api.post(`/auth/register`, data);
		},
		onSuccess: () => {
			toast.success(`Successfully registered`);
		},
	});

	const onSubmit: SubmitHandler<FormType> = async (data, event) => {
		event?.preventDefault();

		try {
			await mutateAsync(data);
			reset();
			await push("/signin");
		} catch (error: any) {
			console.error(error);
			const errorMsg = error.response?.data?.error || error.message;
			toast.error(errorMsg);
		}
	};

	return {
		loading: isLoading,
		apiError: error,
		handleSubmit,
		register,
		reset,
		formErrors: errors,
		onSubmit,
	};
};

export { useSignUpPage };
