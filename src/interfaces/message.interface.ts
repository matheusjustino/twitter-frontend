// INTERFACES
import { ChatInterface } from "./chat.interface";
import { UserInterface } from "./user.interface";

export interface MessageInterface {
	_id: string;
	id?: string;
	sender: UserInterface;
	content: string;
	chat: ChatInterface;
	readBy: UserInterface[];
	createdAt: Date;
	updatedAt: Date;
}
