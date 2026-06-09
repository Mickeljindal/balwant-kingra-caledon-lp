# Balwant Kingra · Caledon Homes — Landing Page

High-converting lead-gen landing page for paid Facebook/Instagram ads targeting
first-time GTA home buyers. Static HTML/CSS/JS — no build step, editable without a
developer.

Live URL target: `balwantkingra.com/caledon-homes`

## File structure

```
.
├── index.html              Main landing page (Sections 1–9)
├── thank-you/
│   └── index.html          /thank-you confirmation page
├── css/
│   └── styles.css          All styles (palette + responsive)
├── js/
│   └── script.js           Validation, smooth scroll, Calendly, form submit
├── assets/                 Drop image files here (see below)
└── README.md
```

## 1. Add the image assets

Place these files in the `assets/` folder. Use **WebP** for fast mobile loading.

| Filename                  | What it is                                            |
|---------------------------|-------------------------------------------------------|
| `hero.webp`               | CaledonClub or Mayfield & Gore render (hero background)|
| `caledonclub.webp`        | CaledonClub exterior render (Card 1)                  |
| `mayfield-gore.webp`      | Mayfield & Gore Road render (Card 2)                  |
| `balwant-headshot.webp`   | Balwant's professional headshot                       |
| `remax-logo-white.webp`   | REMAX Excellence logo, WHITE version (for dark bg)    |

Tip to convert to WebP (if you have `cwebp` installed):
`cwebp -q 80 input.jpg -o assets/hero.webp`

If you have a brand logo image, swap the text logo in the nav — search both HTML
files for `nav__logo` (a comment shows the `<img>` replacement).

## 2. Fill in the IDs / URLs

### `js/script.js` — top of file (CONFIG object)
```js
var CONFIG = {
  calendlyUrl: 'https://calendly.com/balwantkingra',   // <-- your Calendly link
  webhookUrl:  '',                                      // <-- POST endpoint for leads
  thankYouUrl: '/thank-you'                             // change if path differs
};
```
- **calendlyUrl** — your real Calendly booking link.
- **webhookUrl** — a Zapier/Make webhook, serverless function, or any endpoint that
  accepts a JSON POST. Leave blank to test the redirect flow without sending data.
  (Form data is sent as JSON: fullName, phone, email, property, firstTimeBuyer,
  timeline, source, page, submittedAt.)
- **thankYouUrl** — when hosted at `balwantkingra.com/caledon-homes`, set this to
  `/caledon-homes/thank-you/` (or wherever the thank-you page lives).

### Meta Pixel
Already installed with ID `849360980130589` in both pages. A `Lead` event fires on
successful form submit and on thank-you page load. Change the ID if needed.

### Google Tag Manager
Replace `GTM-XXXXXXX` with your real container ID in **both** `index.html` and
`thank-you/index.html` (appears twice per page — head script + body noscript).

### Google Analytics 4
Add your GA4 (`G-XXXXXXXXXX`) tag through GTM, or paste the gtag snippet into the
`<head>` of both pages.

### Mailchimp (alternative to webhook)
If you prefer Mailchimp over a webhook, you can replace the form's submit handler,
or embed Mailchimp's form. The current setup POSTs JSON to `webhookUrl`.

## 3. Phone / WhatsApp (already wired)

- Click-to-call: `tel:6472937008` and office `tel:9055074436`
- WhatsApp: `https://wa.me/16472937008`

## 4. Local preview

Open a terminal in this folder and run a static server, e.g.:
```
python3 -m http.server 8000
```
Then visit http://localhost:8000

Note: when previewing locally the thank-you redirect uses `/thank-you`. On the live
site under `/caledon-homes`, update `thankYouUrl` in `script.js` accordingly.

## Notes
- Mobile-first, responsive (tested layout for iPhone 14 / Android widths).
- Images below the fold use `loading="lazy"`.
- Mobile sticky call/WhatsApp bar shows under 768px; content has bottom padding so
  it never covers the form submit button.
- No cookie banner included (per spec).
```
