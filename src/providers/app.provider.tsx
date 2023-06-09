import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { ReactQueryDevtools } from "react-query/devtools";

// CONTEXTS
import { TweetProvider } from "@/contexts/use-tweet.context";
import { NotificationProvider } from "@/contexts/notification.context";

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
						<NotificationProvider>
							{children}
							<ReactQueryDevtools initialIsOpen={false} />
						</NotificationProvider>
					</TweetProvider>
				</Hydrate>
			</QueryClientProvider>
		</SessionProvider>
	);
};

export { AppProvider };
