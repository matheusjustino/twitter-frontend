/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/tw-elements/dist/js/**/*.js",
	],
	theme: {
		extend: {},
		safelist: [
			"animate-[fade-in-up_1s_ease-in-out]",
			"animate-[fade-in-down_1s_ease-in-out]",
		],
	},
	plugins: [
		require("tw-elements/dist/plugin.cjs"),
		require("tailwind-scrollbar"),
	],
};
