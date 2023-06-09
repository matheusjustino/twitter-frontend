import Link from "next/link";
import { SVGAttributes } from "react";
import { IconType } from "react-icons";

interface NavItemProps {
	href?: string;
	icon: IconType;
	iconClasses?: SVGAttributes<SVGElement>;
	badge?: {
		count: number;
	};
	onClick?: () => void;
	disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
	href,
	icon: Icon,
	iconClasses,
	badge,
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
						{badge && badge.count > 0 ? (
							<span className="relative flex items-center justify-center gap-4">
								<Icon className={`h-8 w-8`} />
								<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
									{badge.count}
								</span>
							</span>
						) : (
							<span className="flex items-center justify-center gap-4">
								<Icon className={`h-8 w-8`} />
							</span>
						)}
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
