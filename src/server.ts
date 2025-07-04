import { Agent, type AgentNamespace, routeAgentRequest } from "agents";
import { MCPClientManager } from "agents/mcp/client";

type Env = {
	MyAgent: AgentNamespace<MyAgent>;
	HOST: string;
};

export class MyAgent extends Agent<Env, never> {
	mcp = new MCPClientManager("my-agent", "1.0.0");

	async onReady() {
		// Connect to the search-mcp server on startup
		await this.addMcpServer(
			"search-mcp",
			"http://localhost:8788", // Assuming the search-mcp runs locally during development
			this.env.HOST,
		);
	}

	async onMessage(message: { message: string; sender: string }) {
		// Only respond to messages from the user
		if (message.sender === "user") {
			try {
				// Find the "Search" tool provided by the MCP servers
				const searchTool = this.mcp.tool("Search");

				// If the tool isn't available, inform the user
				if (!searchTool) {
					this.sendMessage({
						message: "Sorry, the 'Search' tool is not available right now.",
						sender: "agent",
					});
					return;
				}

				// Use the user's message as the query for the search tool
				const result = await searchTool({ query: message.message });

				// Send the result back to the user
				this.sendMessage({
					// Assuming the result is an object that can be stringified
					message: `Search result: \n\`\`\`json\n${JSON.stringify(
						result,
						null,
						2,
					)}\n\`\`\``,
					sender: "agent",
				});
			} catch (error) {
				console.error("Error using the Search tool:", error);
				this.sendMessage({
					message: "An error occurred while trying to search.",
					sender: "agent",
				});
			}
		}
	}

	async onRequest(request: Request): Promise<Response> {
		const reqUrl = new URL(request.url);

		// This allows the client to add more MCP servers dynamically
		if (reqUrl.pathname.endsWith("add-mcp") && request.method === "POST") {
			const mcpServer = (await request.json()) as { url: string; name: string };
			await this.addMcpServer(mcpServer.name, mcpServer.url, this.env.HOST);
			return new Response("Ok", { status: 200 });
		}

		return new Response("Not found", { status: 404 });
	}
}

export default {
	async fetch(request: Request, env: Env) {
		return (
			(await routeAgentRequest(request, env, { cors: true })) ||
			new Response("Not found", { status: 404 })
		);
	},
} satisfies ExportedHandler<Env>;
