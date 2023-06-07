import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { ReactQueryDevtools } from "react-query/devtools";

// CONTEXTS
import { TweetProvider } from "@/contexts/use-tweet.context";

interface AppProviderProps {
	children: React.ReactNode;
	pageProps: any;
}

const AppProvider: React.FC<AppProviderProps> = ({ children, pageProps }) => {
	const [QC] = useState(
		new QueryClient({
			defaultOptions: {
				queries: {
					refetchOnMount: false,
					refetchOnWindowFocus: false,
				},
			},
		})
	);

	return (
		<SessionProvider session={pageProps.session}>
			<QueryClientProvider client={QC}>
				<Hydrate state={pageProps.dehydratedState}>
					<TweetProvider>
						{children}
						<ReactQueryDevtools initialIsOpen={false} />
					</TweetProvider>
				</Hydrate>
			</QueryClientProvider>
		</SessionProvider>
	);
};

export { AppProvider };
