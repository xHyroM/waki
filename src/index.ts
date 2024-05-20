import { getMainProvider, parseProviders, verify } from "./utils";

export default {
	async fetch(request: Request, env: Env, _: ExecutionContext): Promise<Response> {
		if (!verify(request, env.API_TOKEN)) {
			return new Response("Unauthorized", { status: 401 });
		}

		const providers = parseProviders(env.PROVIDERS);
		if (providers.length === 0) {
			return new Response("Invalid providers", { status: 400 });
		}

		const mainProvider = getMainProvider(providers, env.MAIN_PROVIDER);

		const baseUrl = new URL(request.url);

		providers.sort((a, _) => (a.name === mainProvider?.name ? 1 : -1));

		const body = request.body !== null ? request.body : null;

		let res: Response;
		for (const provider of providers) {
			const url = new URL(provider.url);
			url.pathname += baseUrl.pathname;

			if (request.body !== null) {
				// @ts-expect-error expected
				res = await fetch(url.toString(), {
					method: request.method,
					headers: {
						...request.headers,
						authorization: `Bearer ${btoa(provider.token)}`,
					},
					body: body,
				});
			} else {
				// @ts-expect-error expected
				res = await fetch(url.toString(), {
					method: request.method,
					headers: {
						...request.headers,
						authorization: `Bearer ${btoa(provider.token)}`,
					},
				});
			}
		}

		return res!;
	},
};
