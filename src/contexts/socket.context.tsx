import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";

interface SocketContextData {
	socket?: Socket;
	connected: boolean;
}

interface SocketProviderProps {
	children: React.ReactNode;
}

export const SocketContext = createContext<SocketContextData>(
	{} as SocketContextData
);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const { data: session } = useSession();
	const [socket, setSocket] = useState<Socket>();
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		if (session?.user) {
			const socketIO = io(
				process.env.NEXT_PUBLIC_SOCKET_IO_URL as string
			);

			socketIO.emit("setup", session?.user);

			socketIO.on("connection", () => {
				console.log(`User ${session?.user?.id} connected to server`);
				socketIO.emit("setup", session?.user);
			});

			socketIO.on("connected", () => {
				setConnected(true);
				setSocket(socketIO);
				return true;
			});

			socketIO.on("disconnect", () => {
				console.log(
					`User ${session?.user?.id} disconnected from server`
				);
			});

			return () => {
				socketIO.disconnect();
			};
		}
	}, [session?.user]);

	const socketContextData: SocketContextData = {
		socket,
		connected,
	};

	return (
		<SocketContext.Provider value={socketContextData}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => useContext(SocketContext);
