type AppTo = "/" | "/playground" | "/docs/$slug";

export function appLink(to: string, params?: { slug: string }) {
  if (to === "/" || to === "/playground") {
    return { to: to as AppTo };
  }
  // Templated form: appLink("/docs/$slug", { slug }). Must be checked before the
  // regex below, which would otherwise capture the literal "$slug" segment.
  if (to === "/docs/$slug") {
    if (!params?.slug) throw new Error("appLink(/docs/$slug) requires a slug param");
    return { to: "/docs/$slug" as const, params: { slug: params.slug } };
  }
  const match = to.match(/^\/docs\/(.+)$/);
  if (match) {
    return { to: "/docs/$slug" as const, params: { slug: match[1]! } };
  }
  throw new Error(`Unsupported route: ${to}`);
}
