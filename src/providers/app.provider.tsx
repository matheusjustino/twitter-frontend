import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { ReactQueryDevtools } from "react-query/devtools";

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
					{children}
					<ReactQueryDevtools initialIsOpen={false} />
				</Hydrate>
			</QueryClientProvider>
		</SessionProvider>
	);
};

export { AppProvider };
