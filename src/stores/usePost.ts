import { create } from "zustand";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

interface PostStore {
	post?: PostInterface;
	posts?: PostInterface[];
	setData: <T>(data?: T) => void;
}

export const usePost = create<PostStore>((set) => ({
	post: undefined,
	posts: undefined,
	setData: (data) => set((old) => ({ ...old, ...data })),
}));
