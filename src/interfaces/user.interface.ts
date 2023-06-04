// INTERFACES
import { PostInterface } from "./post.interface";

export interface UserInterface {
	_id?: string;
	id: string;
	username: string;
	email: string;
	profilePic?: string;
	likes: PostInterface[];
	retweets: PostInterface[];
	cratedAt?: Date;
	updatedAt?: Date;
}
