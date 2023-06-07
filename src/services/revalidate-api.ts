import axios from "axios";

const revalidateApi = axios.create({
	baseURL: "/api",
});

export { revalidateApi };
