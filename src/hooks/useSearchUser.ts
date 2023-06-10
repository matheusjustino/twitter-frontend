import { useEffect, useRef, useState } from "react";
import { Session } from "next-auth";
import { useQuery } from "react-query";

// SERVICES
import { api } from "@/services/api";

// HOOKS
import { useDebounce } from "./use-debounce";

// INTERFACES
import { UserInterface } from "@/interfaces/user.interface";

type SelectedUserType = { value: string; label: string };

const useSearchUser = ({
	session,
	queryKeys,
}: {
	session: Session | null;
	queryKeys: string[];
}) => {
	const [termToSearch, setTermToSearch] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<SelectedUserType[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	const {
		data: users,
		refetch: refetchSearchUsers,
		isLoading,
		isRefetching,
	} = useQuery(
		queryKeys,
		async () => {
			const config = {
				params: {
					username: termToSearch.trim(),
					...(session?.user && { userSearching: session?.user.id }),
				},
			};
			return await api
				.get<UserInterface[]>(`/users`, config)
				.then((res) => res.data);
		},
		{
			onSuccess: (data) => {
				if (data?.length) {
					setTermToSearch("");
				}
			},
			enabled: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		}
	);

	useEffect(() => {
		debouncedOnSearch();
	}, [termToSearch]);

	const onSelectUser = (value: SelectedUserType) => {
		const alreadySelected = selectedUsers.find(
			(v) => v.value === value.value
		);
		if (alreadySelected) return;

		setSelectedUsers((old) => old.concat(value));
		inputRef.current?.focus();
	};

	const onClear = () => {
		setSelectedUsers([]);
		setTermToSearch("");
	};

	const onRemoveUser = (value: SelectedUserType) => {
		setSelectedUsers((old) => old.filter((v) => v.value !== value.value));
	};

	const onSearch = async () => {
		if (!termToSearch.trim().length) return;
		await refetchSearchUsers();
	};

	const debouncedOnSearch = useDebounce({
		fn: onSearch,
		delay: 750,
	});

	return {
		users,
		termToSearch,
		selectedUsers,
		loading: isLoading || isRefetching,
		setTermToSearch,
		onSelectUser,
		onClear,
		onRemoveUser,
		onSearch,
		debouncedOnSearch,
	};
};

export { useSearchUser };
