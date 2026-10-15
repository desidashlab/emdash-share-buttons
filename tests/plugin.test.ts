import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createPluginRuntimeTestHost, type PluginRuntimeTestHost } from "@emdash-cms/plugin-test";

let host: PluginRuntimeTestHost;

type AnyBlock = Record<string, unknown> & { type: string };
type Config = { version: number; script: string };

const config = () => host.transport.invokeRoute("config", {}, { method: "GET" }) as Promise<Config>;
const tabs = (page: { blocks: unknown[] }) => (page.blocks[1] as { panels: Array<{ label: string; blocks: AnyBlock[] }> }).panels;
const tab = (page: { blocks: unknown[] }, label: string) => tabs(page).find((p) => p.label === label)!.blocks;
const texts = (blocks: AnyBlock[]) => JSON.stringify(blocks);
const save = (values: Record<string, unknown>) => host.admin.submit("/overview", "save_share", values, { blockId: "share#x" });
const cfgOf = (script: string) => JSON.parse(/^var cfg = (.*);\n/.exec(script)![1]!) as Record<string, unknown>;
const field = (blocks: AnyBlock[], id: string) => {
	const form = blocks.find((b) => b.type === "form") as unknown as { fields: Array<{ action_id: string; initial_value?: unknown }> };
	return form.fields.find((f) => f.action_id === id)!.initial_value;
};

beforeEach(async () => {
	host = await createPluginRuntimeTestHost();
	await host.actions.plugin.activate();
});

afterEach(async () => {
	await host.dispose();
});

describe("what the site receives", () => {
	it("serves the script with sensible defaults right after install", async () => {
		const { version, script } = await config();
		expect(version).toBe(1);
		expect(script).toContain("SCRIPT_VERSION = 1");
		expect(cfgOf(script)).toEqual({
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
		});
	});

	it("serves nothing once switched off", async () => {
		const res = await save({ active: false });
		expect(res.toast?.message).toBe("Saved");
		expect((await config()).script).toBe("");
	});

	it("keeps a heading from closing the script", async () => {
		await save({ title: "</script><b>x</b>" });
		const { script } = await config();
		expect(script).not.toContain("</script>");
		expect(cfgOf(script).title).toBe("</script><b>x</b>");
	});
});

describe("settings", () => {
	it("keeps the chosen buttons in site order and drops unknown ones", async () => {
		await save({ networks: ["copy", "bogus", "x", "email", 42] });
		expect(cfgOf((await config()).script).networks).toEqual(["x", "email", "copy"]);
		const page = await host.admin.loadPage("/overview");
		expect(field(tab(page, "Buttons"), "networks")).toEqual(["x", "email", "copy"]);
	});

	it("refuses switching on with no buttons", async () => {
		const res = await save({ active: true, networks: [] });
		expect(res.toast?.type).toBe("error");
		expect(cfgOf((await config()).script).networks).toEqual(["x", "facebook", "linkedin", "whatsapp", "copy"]);
	});

	it("saves every setting, cleans bad ones and shows them back", async () => {
		await save({
			title: "  Spread the word  ",
			position: "floating",
			labels: true,
			colours: "plain",
			utm: true,
			xHandle: "@desidashlab",
			show: "prefix",
			prefix: "posts/",
			area: "main .post",
		});
		expect(cfgOf((await config()).script)).toMatchObject({
			title: "Spread the word",
			position: "floating",
			labels: true,
			colours: "plain",
			utm: true,
			xHandle: "desidashlab",
			show: "prefix",
			prefix: "/posts/",
			area: "main .post",
		});
		const page = await host.admin.loadPage("/overview");
		expect(field(tab(page, "Buttons"), "xHandle")).toBe("desidashlab");
		expect(field(tab(page, "Buttons"), "prefix")).toBe("/posts/");
	});

	it("drops a bad X username and a selector with odd characters, and allows an empty heading", async () => {
		await save({ xHandle: "not a handle!", area: "article{}", title: "" });
		expect(cfgOf((await config()).script)).toMatchObject({ xHandle: "", area: "article", title: "" });
	});

	it("tells the owner whether the site is loading the buttons", async () => {
		const before = await host.admin.loadPage("/overview");
		expect(tabs(before).map((p) => p.label)).toEqual(["Buttons", "Setup"]);
		expect(texts(tab(before, "Buttons"))).toContain("not reaching the site yet");
		await config();
		expect(texts(tab(await host.admin.loadPage("/overview"), "Buttons"))).toContain("Showing now");
	});
});

describe("setup", () => {
	it("shows the loader block and reports when the site has loaded it", async () => {
		const before = await host.admin.loadPage("/overview");
		expect(texts(tab(before, "Setup"))).toContain("/_emdash/api/plugins/share-buttons/config");
		expect(texts(tab(before, "Setup"))).toContain("has not loaded");
		await config();
		expect(texts(tab(await host.admin.loadPage("/overview"), "Setup"))).toContain("last loaded the buttons just now");
	});
});
