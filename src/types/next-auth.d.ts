import NextAuth, { DefaultSession } from "next-auth";

INTERFACES;
import { UserTokenInterface } from "@/interfaces/user-token.interface";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: UserTokenInterface & DefaultSession["user"];
	}
}
