# How this site is built (for Claude)

The site is four password-locked pages that share one password and one salt:

| Path | What it is | Source of truth |
|---|---|---|
| `/` | Landing page with links to both tools | `_build/landing.html` |
| `/vantage/` | PRUVantage Plan Simulator | Laura's Claude artifact "PRUVantage Plan Simulator" |
| `/legacy/` | PRUApex Legacy Index II Simulator | Laura's Claude artifact "PRUApex Legacy Index II Simulator" (https://claude.ai/artifact/Lx1KphCK6A9H1bqpZ2L6bm) |
| `/prushield/` | PRUShield Premium & Claims Calculator | Laura's Claude artifact "PRUShield Premium & Claims Calculator" (https://claude.ai/artifact/AmciUL8CsuqEzFm3nufaEa) |
| `/retirement/` | Retirement Calculator | Laura's Claude artifact "Retirement Calculator v1.3" (https://claude.ai/artifact/TbdWP73FnkbUKtMQhNJn5g) |

Each page is `_build/lock_tpl.html` with its content encrypted inside (AES-GCM-256, key from PBKDF2-SHA256, 250,000 iterations, using the salt stored in each page's payload). The password is entered in lower case with spaces trimmed. **The password is never stored in this repo; ask Laura for it.** Never commit unencrypted tool content: this repo is public.

## Updating the Retirement Calculator after Laura changes her artifact
Save the artifact's page source to `_work/retirement_src.html` (the calculator's own `<!DOCTYPE html> ... </html>`, without the viewer's wrapper), then run
`PVW_PW=... node _build/build_retirement.js`. It makes the team version (removes "Isaac Chong & Associates" and Laura's adviser details; "Prepared by" is left blank
with placeholder "Adviser name"), adds the head additions, `_build/shim.js` and the "← All tools" link (inside the page and on the password screen), encrypts with the
shared salt, writes `retirement/index.html` and checks that the password opens it and a wrong one is refused. It stops if any firm or personal detail is left in.
The CPF summary and client snapshot have a Print button only (no PDF download): it opens the report in a new tab with a "press Ctrl+P / Cmd+P" bar; on this site the print window also opens by itself.
Then commit and push to `main`. GitHub Pages republishes in about a minute.

## Updating the simulator or landing page
Run `PVW_PW=... node _build/recover.js` to get the simulator's markup, script bundle and salt, make the change, re-encrypt the same way (payload is JSON `{html, js}` for the simulator), and push. Also republish Laura's simulator artifacts in Claude so both copies match.

## Updating the PRUApex Legacy Index II Simulator
Save the artifact's page source to `_work/legacy_src.html` (the file Claude publishes, without the viewer's wrapper), then run
`PVW_PW=... node _build/build_legacy.js`. It adds the head additions and "← All tools" link (inside the page and on the password screen), encrypts with the shared salt,
writes `legacy/index.html` and checks that the password opens it and a wrong one is refused. Also rebuild the landing page
(`PVW_PW=... node _build/build_legacy.js --landing`) if the card text changed.

## Updating the PRUShield Premium & Claims Calculator
Save the artifact's page source to `_work/prushield_src.html` (the file Claude publishes, without the viewer's wrapper), then run
`PVW_PW=... node _build/build_prushield.js` (add `--landing` if the landing page changed). It adds the head additions and "← All tools" link,
encrypts with the shared salt, writes `prushield/index.html` and checks that the password opens it and a wrong one is refused.
The page loads html2canvas and jsPDF from cdnjs for its PDF one-pager, and downloads the PDF directly outside Claude (no shim needed).
