import { CgCloseO } from "react-icons/cg";

interface ModalProps {
	isVisible: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, children }) => {
	const handleCloseModal = () => {
		onClose();
	};

	if (!isVisible) return null;
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center px-2 z-50">
			<div className="flex items-center bg-white p-2 rounded w-[600px]">
				{children}
				<button
					type="button"
					onClick={handleCloseModal}
					className="text-xl mb-auto"
				>
					<CgCloseO size={24} />
				</button>
			</div>
		</div>
	);
};

export { Modal };
