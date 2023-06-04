import Link from "next/link";
import { SVGAttributes } from "react";
import { IconType } from "react-icons";

interface NavItemProps {
	href?: string;
	icon: IconType;
	iconClasses?: SVGAttributes<SVGElement>;
	onClick?: () => void;
	disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
	href,
	icon: Icon,
	iconClasses,
	onClick,
	disabled,
}) => {
	return (
		<li
			onClick={onClick}
			className={`${disabled ? "pointer-events-none" : ""}`}
		>
			{href && (
				<Link href={href}>
					<div
						className={`rounded-full p-2 transition-colors duration-200 hover:bg-blue-100 ${
							iconClasses?.className
						} ${disabled ? "bg-gray-100 text-gray-300" : ""}`}
					>
						<span className="flex items-center justify-center gap-4">
							<Icon className={`h-8 w-8`} />
						</span>
					</div>
				</Link>
			)}

			{!href && (
				<div
					className={`rounded-full p-2 transition-colors duration-200 hover:bg-neutral-200 ${iconClasses?.className}`}
				>
					<span className="flex items-center justify-center gap-4">
						<Icon className={`h-8 w-8`} />
					</span>
				</div>
			)}
		</li>
	);
};

export { NavItem };
