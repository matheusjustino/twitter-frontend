import { InputHTMLAttributes } from "react";
import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";
import { IconType } from "react-icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	register: UseFormRegisterReturn<string>;
	errors: FieldErrors;
	icon: IconType;
	iconSize?: number;
}

const Input: React.FC<InputProps> = ({
	id,
	label,
	register,
	errors,
	icon: Icon,
	iconSize,
	...props
}) => {
	return (
		<div className="flex flex-col gap-2">
			<label className="flex items-center gap-2" htmlFor="email">
				<>
					<Icon size={iconSize ?? 20} /> {label}
				</>
			</label>
			<input {...props} {...register} />

			{id && errors[id] && (
				<span className="text-sm text-red-400">
					{errors[id]?.message?.toString() ?? "Error"}
				</span>
			)}
		</div>
	);
};

export { Input };
