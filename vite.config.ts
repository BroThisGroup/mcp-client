import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cloudflare from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		cloudflare({
			proxy: {
				enabled: true,
				bindings: ["MyAgent"],
			},
		}),
	],
	// The ssr option helps distinguish server-side dependencies from client-side ones.
	// We are marking the react and chat-ui-kit packages as external for the server-side
	// build, as they are only needed on the client.
	ssr: {
		external: [
			"react",
			"react-dom",
			"@chatscope/chat-ui-kit-react",
			"@chatscope/chat-ui-kit-styles",
		],
	},
	server: {
		proxy: {
			"/ws": {
				target: "ws://localhost:8787",
				ws: true,
			},
		},
	},
});
