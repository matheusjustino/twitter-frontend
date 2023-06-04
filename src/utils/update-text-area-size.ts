export function updateTextAreaSize(textArea?: HTMLTextAreaElement | null) {
	if (!textArea) return;

	textArea.style.height = "0";
	textArea.style.height = `${textArea.scrollHeight}px`;
}
