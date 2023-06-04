import { SVGAttributes, memo, useMemo } from "react";
import { signOut, useSession } from "next-auth/react";
import { IconType } from "react-icons";
import { ImSearch } from "react-icons/im";
import { BsTwitter } from "react-icons/bs";
import { IoMdMail } from "react-icons/io";
import { BsPersonFill } from "react-icons/bs";
import {
	IoHomeSharp,
	IoNotificationsSharp,
	IoLogIn,
	IoLogOut,
} from "react-icons/io5";

// COMPONENTS
import { NavItem } from "./components/nav-item";

interface NavItemInterface {
	href?: string;
	icon: IconType;
	iconClasses?: SVGAttributes<SVGElement>;
	onClick?: () => void;
	disabled?: boolean;
}

const Sidenav = memo(() => {
	const { data } = useSession();
	const user = data?.user;

	const navItems: NavItemInterface[] = useMemo(
		() => [
			{
				href: "/",
				icon: BsTwitter,
				iconClasses: {
					className: "text-[#1da1f2]",
				},
			},
			{
				href: "/",
				icon: IoHomeSharp,
				iconClasses: {
					className: "hover:text-[#1da1f2]",
				},
			},
			{
				href: "/",
				icon: ImSearch,
				iconClasses: {
					className: "hover:text-[#1da1f2]",
				},
			},
			{
				href: "/",
				icon: IoNotificationsSharp,
				iconClasses: {
					className: "hover:text-[#1da1f2]",
				},
			},
			{
				href: "/",
				icon: IoMdMail,
				iconClasses: {
					className: "hover:text-[#1da1f2]",
				},
			},
			{
				href: `/profiles/${user?.username}`,
				icon: BsPersonFill,
				disabled: !user,
				iconClasses: {
					className: "hover:text-[#1da1f2]",
				},
			},
			user
				? {
						href: "/",
						onClick: () => signOut({ redirect: false }),
						icon: IoLogOut,
						iconClasses: {
							className: "hover:text-[#1da1f2] text-red-500",
						},
				  }
				: {
						href: "/signin",
						icon: IoLogIn,
						iconClasses: {
							className: "hover:text-[#1da1f2] text-emerald-700",
						},
				  },
		],
		[user]
	);

	return (
		<nav className="sticky top-0 px-2 py-4">
			<ul className="flex flex-col items-start gap-2 whitespace-nowrap">
				{navItems.map((navItem, index) => (
					<NavItem key={index} {...navItem} />
				))}
			</ul>
		</nav>
	);
});

Sidenav.displayName = "Sidenav";

export { Sidenav };
