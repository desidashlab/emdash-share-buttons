import type { SandboxedPlugin, PluginContext } from "emdash/plugin";
import type { Block, BlockResponse, FormField } from "@emdash-cms/blocks";

import { SCRIPT_VERSION, VISITOR_SCRIPT } from "./visitor.js";

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

/** Every button the plugin can draw, in the order they appear on the site. */
const NETWORKS = [
	{ value: "x", label: "X" },
	{ value: "facebook", label: "Facebook" },
	{ value: "linkedin", label: "LinkedIn" },
	{ value: "whatsapp", label: "WhatsApp" },
	{ value: "telegram", label: "Telegram" },
	{ value: "bluesky", label: "Bluesky" },
	{ value: "threads", label: "Threads" },
	{ value: "reddit", label: "Reddit" },
	{ value: "email", label: "Email" },
	{ value: "copy", label: "Copy link" },
	{ value: "native", label: "Share sheet (the phone's own share menu)" },
] as const;
type Network = (typeof NETWORKS)[number]["value"];
const NETWORK_VALUES = NETWORKS.map((n) => n.value) as readonly Network[];

const POSITION = ["end", "start", "both", "floating"] as const;
const COLOURS = ["brand", "plain"] as const;
const SHOW = ["all", "prefix"] as const;
type Position = (typeof POSITION)[number];
type Colours = (typeof COLOURS)[number];
type Show = (typeof SHOW)[number];

interface Settings {
	active: boolean;
	networks: Network[];
	title: string;
	position: Position;
	labels: boolean;
	colours: Colours;
	utm: boolean;
	xHandle: string;
	show: Show;
	prefix: string;
	area: string;
}

const DEFAULTS: Settings = {
	active: true,
	networks: ["x", "facebook", "linkedin", "whatsapp", "copy"],
	title: "Share",
	position: "end",
	labels: false,
	colours: "brand",
	utm: false,
	xHandle: "",
	show: "all",
	prefix: "",
	area: "article",
};

const LOADER_SEEN_WINDOW_MS = 10 * 60_000;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, max: number): string {
	return typeof v === "string" ? v.slice(0, max) : "";
}

function pick<T extends string>(v: unknown, allowed: readonly T[], d: T): T {
	return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : d;
}

function bool(v: unknown, d: boolean): boolean {
	return typeof v === "boolean" ? v : d;
}

function cleanPrefix(v: unknown): string {
	const p = str(v, 300).trim();
	if (!p) return "";
	return p.startsWith("/") ? p : `/${p}`;
}

/** The chosen buttons, in site order, unknown names dropped. */
function cleanNetworks(v: unknown, d: Network[]): Network[] {
	if (!Array.isArray(v)) return d;
	const chosen = new Set(v.filter((x): x is Network => typeof x === "string" && (NETWORK_VALUES as readonly string[]).includes(x)));
	return NETWORK_VALUES.filter((n) => chosen.has(n));
}

/** An X username without the @ sign. */
function cleanHandle(v: unknown): string {
	const h = str(v, 40).trim().replace(/^@/, "");
	return /^[A-Za-z0-9_]{1,15}$/.test(h) ? h : "";
}

/** A CSS selector for the post area. Kept short and free of characters that could break out of the config. */
function cleanArea(v: unknown): string {
	const a = str(v, 120).trim();
	return /^[a-zA-Z0-9 .#\[\]="'_:>,-]*$/.test(a) ? a : "";
}

function settingsFrom(v: unknown, base: Settings = DEFAULTS): Settings {
	const o = isRecord(v) ? v : {};
	const show = pick(o.show, SHOW, base.show);
	const prefix = cleanPrefix(o.prefix);
	return {
		active: bool(o.active, base.active),
		networks: cleanNetworks(o.networks, base.networks),
		title: "title" in o ? str(o.title, 60).trim() : base.title,
		position: pick(o.position, POSITION, base.position),
		labels: bool(o.labels, base.labels),
		colours: pick(o.colours, COLOURS, base.colours),
		utm: bool(o.utm, base.utm),
		xHandle: cleanHandle(o.xHandle),
		show: show === "prefix" && !prefix ? "all" : show,
		prefix: show === "prefix" ? prefix : "",
		area: "area" in o ? cleanArea(o.area) || DEFAULTS.area : base.area,
	};
}

async function loadSettings(ctx: PluginContext): Promise<Settings> {
	return settingsFrom(await ctx.settings.get<unknown>("share"));
}

/* ------------------------------------------------------------------ */
/* What the site receives                                              */
/* ------------------------------------------------------------------ */

function siteScript(s: Settings): string {
	if (!s.active || s.networks.length === 0) return "";
	const cfg = {
		networks: s.networks,
		title: s.title,
		position: s.position,
		labels: s.labels,
		colours: s.colours,
		utm: s.utm,
		xHandle: s.xHandle,
		show: s.show,
		prefix: s.prefix,
		area: s.area,
	};
	// "<" is escaped so the settings can never close a script tag.
	return `var cfg = ${JSON.stringify(cfg).replace(/</g, "\\u003c")};\n${VISITOR_SCRIPT}`;
}

function loader(pluginId: string): string {
	const url = `/_emdash/api/plugins/${pluginId}/config`;
	return [
		`<script is:inline>`,
		`\t/* Share Buttons: adds the buttons you chose in the admin. */`,
		`\tfetch("${url}").then(function (r) { return r.json(); }).then(function (j) {`,
		`\t\tif (!j || !j.data || !j.data.script) return;`,
		`\t\tvar s = document.createElement("script"); s.text = j.data.script; document.head.appendChild(s);`,
		`\t}).catch(function () {});`,
		`</script>`,
	].join("\n");
}

/* ------------------------------------------------------------------ */
/* Admin page                                                          */
/* ------------------------------------------------------------------ */

type Interaction = {
	type?: string;
	action_id?: string;
	block_id?: string;
	value?: unknown;
	values?: Record<string, unknown>;
};

const TABS = { buttons: 0, setup: 1 } as const;

async function loaderStatus(ctx: PluginContext): Promise<{ seen: boolean; ago: string }> {
	const at = await ctx.kv.get<number>("loaderSeenAt");
	if (!at) return { seen: false, ago: "" };
	const mins = Math.max(0, Math.round((Date.now() - at) / 60_000));
	const ago = mins < 1 ? "just now" : mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.round(mins / 60)} h ago` : `${Math.round(mins / 1440)} days ago`;
	return { seen: true, ago };
}

function buttonsForm(s: Settings): Block {
	const fields: FormField[] = [
		{ type: "toggle", action_id: "active", label: "Show share buttons", initial_value: s.active },
		{ type: "checkbox", action_id: "networks", label: "Buttons", options: NETWORKS.map((n) => ({ value: n.value, label: n.label })), initial_value: [...s.networks] },
		{ type: "text_input", action_id: "title", label: "Heading", placeholder: "Share this post (leave empty for none)", initial_value: s.title },
		{
			type: "select",
			action_id: "position",
			label: "Position",
			options: [
				{ value: "end", label: "End of the post" },
				{ value: "start", label: "Start of the post, under the title" },
				{ value: "both", label: "Start and end" },
				{ value: "floating", label: "Floating at the left edge when there is room, else end of the post" },
			],
			initial_value: s.position,
		},
		{ type: "toggle", action_id: "labels", label: "Show names next to the icons", initial_value: s.labels },
		{
			type: "select",
			action_id: "colours",
			label: "Colours",
			options: [
				{ value: "brand", label: "Brand colours" },
				{ value: "plain", label: "Outline in the theme's text colour" },
			],
			initial_value: s.colours,
		},
		{ type: "toggle", action_id: "utm", label: "Add tracking tags to shared links", description: "Adds utm_source and utm_medium so your analytics shows which network sent each visitor.", initial_value: s.utm },
		{ type: "text_input", action_id: "xHandle", label: "Your X username", placeholder: "yourname", initial_value: s.xHandle },
		{
			type: "select",
			action_id: "show",
			label: "Show on",
			options: [
				{ value: "all", label: "Every page that has a post area" },
				{ value: "prefix", label: "Addresses starting with…" },
			],
			initial_value: s.show,
		},
		{
			type: "text_input",
			action_id: "prefix",
			label: "Address starts with",
			placeholder: "/posts/",
			initial_value: s.prefix,
			condition: { field: "show", eq: "prefix" },
		},
		{ type: "text_input", action_id: "area", label: "Post area (CSS selector)", placeholder: DEFAULTS.area, initial_value: s.area },
	];
	return {
		type: "form",
		block_id: `share#${Date.now().toString(36)}`,
		fields,
		submit: { label: "Save", action_id: "save_share" },
	};
}

async function buttonsTab(ctx: PluginContext, s: Settings): Promise<Block[]> {
	const status = await loaderStatus(ctx);
	const blocks: Block[] = [];
	if (s.active && !status.seen) {
		blocks.push({ type: "banner", variant: "alert", title: "The buttons are not reaching the site yet", description: "Add the block from the Setup tab to your theme once." });
	} else if (s.active) {
		blocks.push({ type: "banner", title: "Showing now", description: "Visitors see the buttons. Changes reach the site within a minute." });
	}
	blocks.push(buttonsForm(s), {
		type: "context",
		text: "The share sheet button only appears on devices that have one, mostly phones. Your X username is added as \"via\" when someone shares on X. Post area is where the buttons go; article is right for most themes.",
	});
	return blocks;
}

async function setupTab(ctx: PluginContext): Promise<Block[]> {
	const status = await loaderStatus(ctx);
	return [
		status.seen
			? { type: "banner", title: "Working", description: `Your site last loaded the buttons ${status.ago}.` }
			: { type: "banner", title: "One block to add", description: "Your site has not loaded the buttons yet. Add the block below to your theme." },
		{ type: "section", text: "Paste this once into the head of your base layout, usually src/layouts/Base.astro." },
		{ type: "code", language: "tsx", code: loader(ctx.plugin.id) },
		{ type: "context", text: "Everything you change here reaches the site within a minute, without touching the theme again. To put the buttons in a spot of your own, add an element with the data-share attribute to your post template." },
	];
}

async function page(ctx: PluginContext, tab: number): Promise<BlockResponse> {
	const s = await loadSettings(ctx);
	return {
		blocks: [
			{ type: "header", text: "Share Buttons" },
			{
				type: "tab",
				default_tab: tab,
				panels: [
					{ label: "Buttons", blocks: await buttonsTab(ctx, s) },
					{ label: "Setup", blocks: await setupTab(ctx) },
				],
			},
		],
	};
}

async function handleAdmin(ctx: PluginContext, i: Interaction): Promise<BlockResponse> {
	const toast = (message: string, type: "success" | "error" | "info" = "success") => ({ toast: { type, message } });

	if (i.type === "form_submit" && i.action_id === "save_share") {
		const current = await loadSettings(ctx);
		const next = settingsFrom(i.values ?? {}, current);
		if (next.active && next.networks.length === 0) return { ...(await page(ctx, TABS.buttons)), ...toast("Pick at least one button.", "error") };
		await ctx.settings.set("share", next);
		return { ...(await page(ctx, TABS.buttons)), ...toast("Saved") };
	}

	return page(ctx, TABS.buttons);
}

/* ------------------------------------------------------------------ */
/* The plugin                                                          */
/* ------------------------------------------------------------------ */

const plugin: SandboxedPlugin = {
	routes: {
		/** Public: the script the site runs, with the current settings in it. Same for every visitor, so it may be cached for a minute. */
		config: {
			public: true,
			methods: ["GET"],
			request: { body: "none" },
			cacheControl: "public, max-age=60",
			handler: async (_routeCtx, ctx) => {
				const s = await loadSettings(ctx);
				const seen = (await ctx.kv.get<number>("loaderSeenAt")) ?? 0;
				if (Date.now() - seen > LOADER_SEEN_WINDOW_MS) await ctx.kv.set("loaderSeenAt", Date.now());
				return { version: SCRIPT_VERSION, script: siteScript(s) };
			},
		},

		/** The admin page. */
		admin: {
			permission: "plugins:manage",
			handler: async (routeCtx, ctx) => handleAdmin(ctx, (routeCtx.input ?? {}) as Interaction),
		},
	},
};

export default plugin;
