import Image from "next/image";

interface ProfileImageProps {
	src?: string | null;
	className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, className = "" }) => {
	const defaultImg = "/images/profilePic.jpeg";
	return (
		<div
			className={`relative h-8 w-8 sm:h-12 sm:w-12 overflow-hidden rounded-full ${className}`}
		>
			<Image
				src={src ?? defaultImg}
				alt="Profile image"
				quality={100}
				priority
				fill
			/>
		</div>
	);
};

export { ProfileImage };
