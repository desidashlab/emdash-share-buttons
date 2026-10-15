## What does this plugin do?

It adds a row of share buttons to your posts. A visitor taps one and the post's title and address are handed to X, Facebook, LinkedIn, WhatsApp, Telegram, Bluesky, Threads, Reddit or an email draft. There is also a copy-link button and, on phones, a button that opens the device's own share menu.

## Where do the buttons go?

By default at the end of each post. You can move them under the title, show them in both places, or float them at the left edge of the screen when there is room beside the post (on small screens, or when the post fills the width, they drop back to the end of the post). To put them in a spot of your own, add an element with the `data-share` attribute to your post template and the buttons appear there instead.

## Which pages get buttons?

Every page that has a post area, which is the `article` element in most themes. If your theme uses something else, change **Post area**. To limit the buttons to posts only, choose **Addresses starting with** and enter your posts path, usually `/posts/`.

## What does the share sheet button do?

On a phone it opens the device's own share menu, with every app the visitor has installed. Browsers on desktop computers mostly do not offer one, so the button only appears where it works.

## What are tracking tags?

With **Add tracking tags** on, every shared link gets `utm_source` (the network) and `utm_medium` added, so tools such as Plausible, Fathom or Google Analytics can show you which network brought each visitor.

## Does it count shares?

No. Share counts need calls to each network's servers and most networks no longer offer them. The buttons open the network's own share dialog and nothing else.

## Does it collect anything?

No. The plugin has no access to your content and makes no requests outside your site. The only call is your site fetching its own settings. Each share link goes straight from the visitor's browser to the network they chose.
