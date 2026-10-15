/* Share Buttons for EmDash. Adds share buttons to each post: X, Facebook, LinkedIn, WhatsApp and more, plus copy link and the device share sheet.
 * The settings object `cfg` is written in front of this file by the plugin's config route.
 * Brand icons are from Simple Icons (CC0). */
var SCRIPT_VERSION = 1;
(function () {
	if (typeof cfg !== "object" || !cfg || window.__ddShare) return;
	window.__ddShare = true;

	var NETWORKS = {
		x: { name: "X", color: "#000000", path: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" },
		facebook: { name: "Facebook", color: "#0866ff", path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" },
		linkedin: { name: "LinkedIn", color: "#0a66c2", path: "M5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.2 9h3.6v12H3.2zM9 9h3.5v1.7c.6-1 1.9-2 3.9-2 4 0 4.6 2.6 4.6 6V21h-3.7v-5.6c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21H9z" },
		whatsapp: { name: "WhatsApp", color: "#25d366", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" },
		telegram: { name: "Telegram", color: "#26a5e4", path: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
		bluesky: { name: "Bluesky", color: "#1185fe", path: "M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026" },
		threads: { name: "Threads", color: "#000000", path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" },
		reddit: { name: "Reddit", color: "#ff4500", path: "M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" },
		email: { name: "Email", color: "#6b7280", path: "M2 4h20a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1.2 2.5v.9L12 13l8.8-5.6v-.9L12 12z" },
		copy: { name: "Copy link", color: "#6b7280", path: "M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zm-1.4 4.2-1.3 1.3a3 3 0 0 1-4.2-4.2l3.5-3.5a3 3 0 0 1 4.2 0 1 1 0 0 0 1.4-1.4 5 5 0 0 0-7 0L2.3 13.3a5 5 0 0 0 7 7l1.3-1.3a1 1 0 0 0-1.4-1.4zm12.5-14a5 5 0 0 0-7 0l-1.3 1.3a1 1 0 0 0 1.4 1.4l1.3-1.3a3 3 0 0 1 4.2 4.2l-3.5 3.5a3 3 0 0 1-4.2 0 1 1 0 0 0-1.4 1.4 5 5 0 0 0 7 0l3.5-3.5a5 5 0 0 0 0-7z" },
		native: { name: "Share", color: "#374151", path: "M18 16a3 3 0 0 0-2.2 1l-7-4.1a3 3 0 0 0 0-1.8l7-4.1A3 3 0 1 0 15 5a3 3 0 0 0 .1.7l-7 4.1a3 3 0 1 0 0 4.4l7 4.1A3 3 0 1 0 18 16z" }
	};

	function meta(name) {
		var m = document.querySelector('meta[property="' + name + '"]');
		return m && m.getAttribute("content") || "";
	}

	function pageUrl() {
		var c = document.querySelector('link[rel="canonical"]');
		return (c && c.getAttribute("href")) || meta("og:url") || location.origin + location.pathname;
	}

	function pageTitle() {
		return meta("og:title") || document.title || "";
	}

	function tagged(url, network) {
		if (!cfg.utm) return url;
		var medium = network === "email" ? "email" : network === "copy" || network === "native" ? "share" : "social";
		return url + (url.indexOf("?") < 0 ? "?" : "&") + "utm_source=" + network + "&utm_medium=" + medium;
	}

	function href(key, url, title) {
		var u = encodeURIComponent(url), t = encodeURIComponent(title);
		switch (key) {
			case "x": return "https://x.com/intent/post?text=" + t + "&url=" + u + (cfg.xHandle ? "&via=" + encodeURIComponent(cfg.xHandle) : "");
			case "facebook": return "https://www.facebook.com/sharer/sharer.php?u=" + u;
			case "linkedin": return "https://www.linkedin.com/sharing/share-offsite/?url=" + u;
			case "whatsapp": return "https://wa.me/?text=" + t + "%20" + u;
			case "telegram": return "https://t.me/share/url?url=" + u + "&text=" + t;
			case "bluesky": return "https://bsky.app/intent/compose?text=" + t + "%20" + u;
			case "threads": return "https://www.threads.net/intent/post?text=" + t + "%20" + u;
			case "reddit": return "https://www.reddit.com/submit?url=" + u + "&title=" + t;
			case "email": return "mailto:?subject=" + t + "&body=" + t + "%0A%0A" + u;
		}
		return "";
	}

	function style() {
		if (document.getElementById("dd-share-style")) return;
		var css =
			".dd-share{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;gap:.5em;margin:1.5em 0;font:500 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
			".dd-share-title{margin-right:.25em;font-weight:600}" +
			".dd-share-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:.45em;min-width:40px;height:40px;padding:0 .9em;border-radius:999px;border:1px solid transparent;color:#fff;text-decoration:none;cursor:pointer;font:inherit;transition:opacity .15s,transform .15s;position:relative}" +
			".dd-share-icons .dd-share-btn{width:40px;padding:0}" +
			".dd-share-btn:hover{opacity:.85;transform:translateY(-1px)}" +
			".dd-share-btn:focus-visible{outline:2px solid currentColor;outline-offset:2px}" +
			".dd-share-plain .dd-share-btn{background:Canvas!important;color:inherit;border-color:currentColor}" +
			".dd-share-btn svg{width:18px;height:18px;fill:currentColor;flex:none}" +
			".dd-share-done{position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);background:#111827;color:#fff;font-size:12px;padding:.3em .6em;border-radius:4px;white-space:nowrap;pointer-events:none}" +
			".dd-share-floating{position:fixed;left:16px;top:50%;transform:translateY(-50%);flex-direction:column;margin:0;z-index:50}.dd-share-floating .dd-share-btn{box-shadow:0 1px 3px rgba(0,0,0,.2)}" +
			".dd-share-floating .dd-share-title{display:none}" +
			"@media print{.dd-share{display:none}}";
		var el = document.createElement("style");
		el.id = "dd-share-style";
		el.textContent = css;
		document.head.appendChild(el);
	}

	function icon(path) {
		var ns = "http://www.w3.org/2000/svg";
		var svg = document.createElementNS(ns, "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.setAttribute("aria-hidden", "true");
		var p = document.createElementNS(ns, "path");
		p.setAttribute("d", path);
		svg.appendChild(p);
		return svg;
	}

	function flash(btn, text) {
		var old = btn.querySelector(".dd-share-done");
		if (old) old.parentNode.removeChild(old);
		var tip = document.createElement("span");
		tip.className = "dd-share-done";
		tip.setAttribute("role", "status");
		tip.textContent = text;
		btn.appendChild(tip);
		setTimeout(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 1600);
	}

	function copyText(text) {
		if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
		return new Promise(function (resolve, reject) {
			var ta = document.createElement("textarea");
			ta.value = text;
			ta.setAttribute("readonly", "");
			ta.style.position = "fixed";
			ta.style.left = "-9999px";
			document.body.appendChild(ta);
			ta.select();
			var ok = false;
			try { ok = document.execCommand("copy"); } catch (e) {}
			document.body.removeChild(ta);
			ok ? resolve() : reject();
		});
	}

	function popup(e, url) {
		if (window.innerWidth < 768) return;
		var w = 600, h = 560;
		var left = Math.max(0, (screen.width - w) / 2), top = Math.max(0, (screen.height - h) / 2);
		var win = window.open(url, "dd-share", "width=" + w + ",height=" + h + ",left=" + left + ",top=" + top + ",scrollbars=yes,resizable=yes");
		if (!win) return;
		try { win.opener = null; } catch (err) {}
		e.preventDefault();
	}

	function button(key, url, title) {
		var n = NETWORKS[key];
		if (!n) return null;
		var label = key === "copy" || key === "native" ? n.name : "Share on " + n.name;
		if (key === "email") label = "Share by email";
		var el;
		if (key === "copy" || key === "native") {
			if (key === "native" && !(navigator.share)) return null;
			el = document.createElement("button");
			el.type = "button";
		} else {
			el = document.createElement("a");
			el.href = href(key, tagged(url, key), title);
			if (key !== "email") { el.target = "_blank"; el.rel = "noopener noreferrer"; }
		}
		el.className = "dd-share-btn dd-share-" + key;
		el.setAttribute("aria-label", label);
		el.title = label;
		el.style.background = n.color;
		el.appendChild(icon(n.path));
		if (cfg.labels) {
			var s = document.createElement("span");
			s.textContent = n.name;
			el.appendChild(s);
		}
		if (key === "copy") {
			el.addEventListener("click", function () {
				copyText(tagged(url, "copy")).then(function () { flash(el, "Link copied"); }, function () { flash(el, "Could not copy"); });
			});
		} else if (key === "native") {
			el.addEventListener("click", function () {
				navigator.share({ title: title, url: tagged(url, "native") }).catch(function () {});
			});
		} else if (key !== "email") {
			el.addEventListener("click", function (e) { popup(e, el.href); });
		}
		return el;
	}

	function build(floating) {
		var url = pageUrl(), title = pageTitle();
		var box = document.createElement("div");
		box.className = "dd-share" + (cfg.labels ? "" : " dd-share-icons") + (cfg.colours === "plain" ? " dd-share-plain" : "") + (floating ? " dd-share-floating" : "");
		box.setAttribute("role", "group");
		box.setAttribute("aria-label", cfg.title || "Share");
		if (cfg.title) {
			var t = document.createElement("span");
			t.className = "dd-share-title";
			t.textContent = cfg.title;
			box.appendChild(t);
		}
		var count = 0;
		for (var i = 0; i < cfg.networks.length; i++) {
			var b = button(cfg.networks[i], url, title);
			if (b) { box.appendChild(b); count++; }
		}
		return count ? box : null;
	}

	function area() {
		var el = cfg.area ? document.querySelector(cfg.area) : null;
		return el || document.querySelector("article") || document.querySelector("main");
	}

	function atStart(root, box) {
		var h1 = root.querySelector("h1");
		if (h1 && root.contains(h1)) h1.parentNode.insertBefore(box, h1.nextSibling);
		else root.insertBefore(box, root.firstChild);
	}

	function run() {
		if (document.querySelector(".dd-share")) return;
		var p = location.pathname;
		if (cfg.show === "prefix" && p.indexOf(cfg.prefix) !== 0) return;
		var slot = document.querySelector("[data-share]");
		var root = slot || area();
		if (!root) return;
		style();
		if (slot) { var b = build(false); if (b) slot.appendChild(b); return; }
		var pos = cfg.position;
		if (pos === "floating") {
			if (window.innerWidth >= 1024 && root.getBoundingClientRect().left >= 72) { var f = build(true); if (f) document.body.appendChild(f); return; }
			pos = "end";
		}
		if (pos === "start" || pos === "both") { var s = build(false); if (s) atStart(root, s); }
		if (pos === "end" || pos === "both") { var e = build(false); if (e) root.appendChild(e); }
	}

	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
	else run();
	document.addEventListener("astro:page-load", run);
})();
