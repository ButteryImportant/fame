# Your FAME platform

This is a working, self-hosted learning platform for Manmath Biradar and FAME. It includes the complete frontend and backend source, a locked dependency list, and a compiled frontend. It is an LMS (learning management system), not an AI chatbot.

## Try it on your computer

1. Install **Node.js 24 LTS** from https://nodejs.org/ .
2. Extract the ZIP into a folder.
3. On Windows, double-click **start-demo.bat**. On macOS/Linux, run `sh start-demo.sh` from this folder.
4. Open **http://localhost:4173** after the server starts. Keep the terminal open.
5. Create a student account, open Food Business Blueprint, select “Start your journey”, and use “Try demo enrolment”. No payment is taken.
6. Open a lesson, mark it complete, return to My Learning and refresh. The progress is stored in the database.

The first setup downloads dependencies. This is a server application: double-clicking `index.html` does not run the backend.

## Open your owner dashboard

In a second terminal in this folder, run:

```sh
npm run admin
```

Enter your name, owner email and a unique password of at least 12 characters. The password input is hidden. There is no pre-installed owner account or shared default password.

Sign in with that account and select **Owner dashboard**. You can create/edit programmes, change prices, add lessons, enter video locations, choose free previews, and publish final content. There is also a business settings page for your support address and policies.

## What is already included

- Home and portfolio pages using your photograph and FAME positioning.
- Course catalogue and individual programme pages with curriculum and preview lessons.
- Registration, sign-in/out, email verification, password reset and account name changes.
- Secure server sessions, owner/student permissions and protected lessons.
- Razorpay Orders API, checkout callback verification, capture confirmation and signed webhooks.
- Student dashboard, lesson player, completion progress and order history.
- Owner course/lesson management, captured revenue and recent orders.
- Protected local video delivery with browser range requests.
- Durable SQLite storage, database backup command and Docker setup.
- Automated integration tests for accounts, payments and access control.

## Your information to add before launch

**Razorpay account:** add your key ID, key secret and webhook secret in the private `.env` file on your server. Start with Razorpay test keys. Never put secrets in the frontend or send them in a public message.

**Email:** configure your SMTP service and sender address. In local demo mode, emails are saved to `data/mail-preview.jsonl` instead of sent. That local file contains one-time verification/reset links; keep it private. Production requires SMTP.

**Your actual course content:** the supplied lessons are original starter examples, clearly labelled as sample material. They are not your existing recordings. Add your final lessons and recordings, review each programme and turn off “sample content” before publishing. L1 is prefilled at ₹7,499 and L3 at ₹65,000 from the supplied context. Confirm these prices and tax treatment. L2 has no invented price and remains upcoming.

**Business details:** add your real support email, business address and approved terms, privacy and refund policies in Owner dashboard. No refund promise has been invented. Live checkout stays closed until these details and the final course are ready.

**Hosting and domain:** use a server/container with Node.js 24, HTTPS and persistent disk. The website is not automatically deployed or connected to a domain by opening this ZIP. See `docs/DEPLOYMENT.md`.

## Common questions

**Can I test it without Razorpay?** Yes. The default demo mode creates clearly marked, unpaid demo enrolments. Demo enrolments never grant access in Razorpay mode. Production refuses to start in demo mode.

**Can students access lessons without paying?** Only lessons that you explicitly mark as public previews. The backend checks enrolment for each protected lesson and local media request.

**Where do I add videos?** Put an MP4 in `private-media`, then enter `media:your-filename.mp4` in the lesson editor. See the README in that directory for private streaming options.

**Can I change the website content?** Portfolio copy is in `src/main.jsx`. Visual styling is in `src/styles.css`. Programme and lesson content is managed in the owner dashboard and saved in the database.

**Does it guarantee sales or zero errors?** No software or design can promise those outcomes. The included test report describes what was verified. Conversion depends on your offer, traffic, proof, pricing and follow-up. The purchase flow is designed to be clear, short and usable across devices.

**Do I need to upload my customer list?** No. No private customer contact list, fee details or unapproved testimonials are included in the site or archive.
