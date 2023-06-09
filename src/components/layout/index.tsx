import { usePathname } from "next/navigation";
import NextNProgress from "nextjs-progressbar";

// COMPONENTS
import { Sidenav } from "../sidenav";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const pathname = usePathname();
	const isAuthPage = pathname === "/signin" || pathname === "/signup";

	return (
		<>
			<div className="sm:container sm:max-w-[1080px] sm:mx-auto flex items-start">
				{!isAuthPage && <Sidenav />}
				<div className="min-h-screen flex-grow border-x overflow-hidden whitespace-nowrap overflow-ellipsis">
					{children}
				</div>
			</div>
			<NextNProgress
				height={5}
				stopDelayMs={200}
				startPosition={0.3}
				color="#1da1f2"
			/>
		</>
	);
};

export { Layout };
