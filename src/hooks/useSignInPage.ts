import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const formSchema = z.object({
	email: z.string().email().nonempty(),
	password: z.string().min(6).nonempty(),
});

type FormType = z.infer<typeof formSchema & FieldValues>;

const useSignInPage = () => {
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
		await signIn("credentials", {
			...data,
			redirect: false,
		}).then(({ ok, error }: any) => {
			if (ok) {
				toast.success("Login successful");
				setTimeout(() => {
					window.location.replace("http://localhost:3000/");
				}, 750);
			} else {
				toast.error(JSON.parse(error).error);
			}
		});
	};

	return {
		handleSubmit,
		register,
		reset,
		errors,
		onSubmit,
	};
};

export { useSignInPage };