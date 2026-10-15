# Share Buttons for EmDash

Share buttons on every post: X, Facebook, LinkedIn, WhatsApp, Telegram, Bluesky, Threads, Reddit, email, copy link and the phone's share sheet.

- **Pick your buttons**: tick the networks you want. They appear in a fixed, sensible order.
- **Where you want them**: end of the post, under the title, both, or floating at the left edge on wide screens.
- **Your look**: brand colours or an outline in your theme's text colour, icons only or with names.
- **Copy link and share sheet**: a copy button that confirms with "Link copied", and the phone's own share menu where the browser offers one.
- **Tracking tags**: optional utm_source and utm_medium on every shared link, so your analytics shows which network sent each visitor.

One-time setup: paste the short block from the Setup tab into the head of your base layout.

Brand icons are from Simple Icons (CC0). Built by DesiDash Lab. MIT licensed.

## Development

```
pnpm install
pnpm test
pnpm build
```

`src/visitor-script.js` is the code that runs on the site. `scripts/embed.mjs` embeds it into the plugin before build and test.
