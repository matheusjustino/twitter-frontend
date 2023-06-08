import { useCallback, useRef } from "react";

interface UseDebounceProps {
	fn: (args?: any) => void;
	delay: number;
}

const useDebounce = ({ fn, delay }: UseDebounceProps) => {
	const timeoutRef: any = useRef(null);

	const debounceFn = (...args: any[]) => {
		clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			fn(...args);
		}, delay);
	};

	return useCallback(debounceFn, [fn, delay]);
};

export { useDebounce };
