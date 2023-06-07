import { create } from "zustand";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

interface PostStore {
	post?: PostInterface;
	posts?: PostInterface[];
	loading?: boolean;
	setData: <T>(data?: T) => void;
}

export const usePost = create<PostStore>((set) => ({
	post: undefined,
	posts: undefined,
	loading: false,
	setData: (data) => set((old) => ({ ...old, ...data })),
}));
