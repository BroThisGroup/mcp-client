import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// The default import for the cloudflare plugin can sometimes cause issues in certain build environments.
// Changing to a namespace import (`import * as ...`) and accessing the `.default` property is a robust
// way to work around these CommonJS/ESM interoperability problems.
import * as cloudflarePlugin from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		// We now call the plugin using the imported namespace. The `as any` cast is used
		// to prevent potential TypeScript errors if the type definitions are not perfectly aligned.
		(cloudflarePlugin as any).default({
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
