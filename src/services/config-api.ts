import { GetServerSidePropsContext } from "next";
import axios, { AxiosError } from "axios";
import { parseCookies } from "nookies";

import { AuthTokenError } from "./errors/auth-token.error";

export const setupAPIClient = (context?: GetServerSidePropsContext) => {
	const token = parseCookies(context)["@auth.token"];

	const api = axios.create({
		baseURL: process.env.NEXT_PUBLIC_API_URL,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	api.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			if (error.response?.status === 401) {
				if (typeof window !== undefined) {
					// logout();
				} else {
					return Promise.reject(new AuthTokenError());
				}
			}

			return Promise.reject(error);
		}
	);

	return api;
};
