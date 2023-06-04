import axios from "axios";
import { setupAPIClient } from "./config-api";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});
