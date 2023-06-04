import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

// PROVIDERS
import { AppProvider } from "@/providers/app.provider";

// COMPONENTS
import { Layout } from "@/components/layout";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<AppProvider pageProps={pageProps}>
			<Layout>
				<Component {...pageProps} />
			</Layout>
			<Toaster position="top-center" reverseOrder={true} />
		</AppProvider>
	);
}
