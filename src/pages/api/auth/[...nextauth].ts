import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwtDecode from "jwt-decode";

// SERVICES
import { api } from "@/services/api";

// INTERFACES
import { UserTokenInterface } from "@/interfaces/user-token.interface";

const authOptions: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	jwt: {
		maxAge: 60 * 60 * 12, // 12h - must be equal backend settings
	},
	pages: {
		newUser: "/signup",
		signIn: "/signin",
		error: "/error",
	},
	callbacks: {
		jwt: async ({ token, user }) => {
			user && (token.user = user);
			return token;
		},
		session: async ({ session, token }) => {
			if (session.user) {
				session.user = token.user as UserTokenInterface; // Setting token in session
			}
			return session;
		},
	},
	secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
	providers: [
		CredentialsProvider({
			type: "credentials",
			credentials: {
				email: {
					label: "email",
					type: "email",
					placeholder: "your@email.com",
				},
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials, req) => {
				try {
					const token = await api
						.post<{ token: string }>(`/auth/login`, credentials)
						.then((res) => res.data.token);

					const user = jwtDecode<UserTokenInterface>(token);
					user.token = token;
					return Promise.resolve(user);
				} catch (error: any) {
					console.error(error);
					const errorMsg =
						error.response?.data?.error || error.message;
					throw new Error(
						JSON.stringify({
							error: errorMsg,
							status: error.response.status,
							ok: false,
						})
					);
				}
			},
		}),
	],
};

export default (req: NextApiRequest, res: NextApiResponse) =>
	NextAuth(req, res, authOptions);
