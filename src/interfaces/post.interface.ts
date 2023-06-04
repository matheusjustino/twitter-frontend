// INTERFACES
import { UserInterface } from "./user.interface";

export interface PostInterface {
	_id?: string;
	id: string;
	content: string;
	pinned: boolean;
	postedBy: UserInterface;
	likes: UserInterface[];
	retweetUsers: UserInterface[];
	retweetData?: PostInterface;
	createdAt: Date;
	updatedAt: Date;
}
