import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useState } from "react";

const formSchema = z.object({
	email: z.string().email().nonempty(),
	password: z.string().min(6).nonempty(),
});

type FormType = z.infer<typeof formSchema & FieldValues>;

const useSignInPage = () => {
	const [loading, setLoading] = useState(false);
	const {
		handleSubmit,
		register,
		reset,
		formState: { errors },
	} = useForm<FormType>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "matheusz_7@hotmail.com",
			password: "123456",
		},
	});

	const onSubmit: SubmitHandler<FormType> = async (data, event) => {
		event?.preventDefault();
		setLoading(true);
		await signIn("credentials", {
			...data,
			redirect: false,
		})
			.then(({ ok, error }: any) => {
				if (ok) {
					toast.success("Login successful");
					setTimeout(() => {
						window.location.replace(
							process.env.NEXT_PUBLIC_NEXTAUTH_URL as string
						);
					}, 750);
				} else {
					toast.error(JSON.parse(error).error);
				}
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return {
		handleSubmit,
		register,
		reset,
		errors,
		onSubmit,
		loading,
	};
};

export { useSignInPage };
