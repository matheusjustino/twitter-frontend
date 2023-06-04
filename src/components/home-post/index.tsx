// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

interface HomePostProps {
	content: string;
	postedBy: UserInterface;
	createdAt?: Date;
	updatedAt?: Date;
}

const HomePost: React.FC<HomePostProps> = ({
	content,
	postedBy,
	createdAt,
	updatedAt,
}) => {
	return <div>{content}</div>;
};

export { HomePost };
