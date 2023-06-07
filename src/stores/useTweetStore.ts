import { create } from "zustand";

// INTERFACES
import { PostInterface } from "@/interfaces/post.interface";

interface TweetStore {
	tweets?: PostInterface[];
	setTweets: (data?: PostInterface[]) => void;
}

export const useTweetStore = create<TweetStore>((set) => ({
	tweets: undefined,
	setTweets: (data?: PostInterface[]) => set({ tweets: data }),
}));
