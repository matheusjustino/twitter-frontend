// ENUMS
import { NotificationTypeEnum } from "@/enums/notification-type.enum";

// INTERFACES
import { UserInterface } from "./user.interface";

export interface NotificationInterface {
	_id?: string;
	id: string;
	userTo: UserInterface;
	userFrom: UserInterface;
	notificationType: NotificationTypeEnum;
	opened: boolean;
	entityId: string;
	createdAt: Date;
	updatedAt: Date;
}
