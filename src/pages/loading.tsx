import { memo } from "react";
import { NextPage } from "next";

// COMPONENTS
import { LoadingSpinner } from "@/components/loading-spinner";

const LoadingPage: NextPage = memo(() => {
	return (
		<div className="flex items-center justify-center w-full min-h-screen">
			<LoadingSpinner />
		</div>
	);
});

LoadingPage.displayName = "LoadingPage";

export default LoadingPage;
