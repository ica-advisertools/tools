# How this site is built (for Claude)

The site is four password-locked pages that share one password and one salt:

| Path | What it is | Source of truth |
|---|---|---|
| `/` | Landing page with links to both tools | `_build/landing.html` |
| `/vantage/` | PRUVantage Plan Simulator | Laura's Claude artifact "PRUVantage Plan Simulator" |
| `/legacy/` | PRUApex Legacy Index II Simulator | Laura's Claude artifact "PRUApex Legacy Index II Simulator" (https://claude.ai/artifact/Lx1KphCK6A9H1bqpZ2L6bm) |
| `/retirement/` | Retirement Calculator | Laura's Claude artifact "Retirement Calculator v1.3" (https://claude.ai/artifact/TbdWP73FnkbUKtMQhNJn5g) |

Each page is `_build/lock_tpl.html` with its content encrypted inside (AES-GCM-256, key from PBKDF2-SHA256, 250,000 iterations, using the salt stored in each page's payload). The password is entered in lower case with spaces trimmed. **The password is never stored in this repo; ask Laura for it.** Never commit unencrypted tool content: this repo is public.

## Updating the Retirement Calculator after Laura changes her artifact
1. Read the latest artifact HTML; drop the artifact viewer's outer wrapper (first and last lines) so you have the calculator's own `<!DOCTYPE html> ... </html>`.
2. For the team version, remove "Isaac Chong & Associates" everywhere (page heading, footer, "Prepared by" default value — leave it blank with placeholder "Adviser name" — snapshot header, and the CPF summary's `firm` constant and the places it is printed).
3. In `<head>`: add `<meta name="robots" content="noindex,nofollow">`, the style `[hidden]:not([hidden=until-found i]){display:none!important}body{padding-top:22px}`, and `_build/shim.js` (makes the save buttons download files outside Claude).
4. After `<body>`: add the "← All tools" link (href `../`), same as the current pages.
5. Encrypt into `lock_tpl.html` with title "Retirement Calculator" and write to `retirement/index.html`. Reuse the existing salt (run `_build/recover.js` to get it) so one login keeps working across all three pages.
6. Test that the right password opens it and a wrong one is refused, then commit and push to `main`. GitHub Pages republishes in about a minute.

## Updating the simulator or landing page
Run `PVW_PW=... node _build/recover.js` to get the simulator's markup, script bundle and salt, make the change, re-encrypt the same way (payload is JSON `{html, js}` for the simulator), and push. Also republish Laura's simulator artifacts in Claude so both copies match.

## Updating the PRUApex Legacy Index II Simulator
Save the artifact's page source to `_work/legacy_src.html` (the file Claude publishes, without the viewer's wrapper), then run
`PVW_PW=... node _build/build_legacy.js`. It adds the head additions and "← All tools" link, encrypts with the shared salt,
writes `legacy/index.html` and checks that the password opens it and a wrong one is refused. Also rebuild the landing page
(`PVW_PW=... node _build/build_legacy.js --landing`) if the card text changed.
