// INTERFACES
import { UserInterface } from "./user.interface";
import { MessageInterface } from "./message.interface";

export interface ChatInterface {
	_id: string;
	id?: string;
	chatName?: string;
	isGroupChat: boolean;
	users: UserInterface[];
	latestMessage?: MessageInterface;
	createdAt: Date;
	updatedAt: Date;
}
