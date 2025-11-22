import type { Context as HonoContext } from "hono";
import { auth } from "@b2bsaas/auth";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

    // Get IP for rate limiting anonymous users
    // Hono proxies might need 'x-forwarded-for'
    const ip = context.req.header('x-forwarded-for') || "127.0.0.1";

	return {
		session,
        ip, 
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;