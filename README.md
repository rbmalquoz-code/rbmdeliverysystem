# Reality BM — Delivery Control: full setup, from zero

This gets you from nothing to a live site your team can log into. No coding
required — just following steps in two websites (Firebase and GitHub).

Order matters here: we set up Firebase first so we have real values to put
into `index.html` *before* we upload it to GitHub — that way you only
upload once.

---

## Part A — Firebase (the login system + shared database)

### A1. Create the project
1. Go to https://console.firebase.google.com and sign in with any Google
   account.
2. Click **Add project** → name it (e.g. `reality-bm-delivery`) → you can
   turn off Google Analytics for this (not needed) → **Create project**.

### A2. Turn on email/password login
1. Left menu → **Build → Authentication → Get started**.
2. Under **Sign-in method**, click **Email/Password** → toggle it **Enable**
   → **Save**.

### A3. Create the database
1. Left menu → **Build → Firestore Database → Create database**.
2. Choose **Start in production mode** → click Next.
3. Pick a location close to the UAE (e.g. `europe-west1` or
   `asia-south1`) — you can't change this later, but it only affects speed,
   not function. → **Enable**.

### A4. Get your config values
1. Click the gear icon next to **Project Overview** (top left) →
   **Project settings**.
2. Scroll to **Your apps** → click the `</>` icon (Web app).
3. Give it any nickname (e.g. "dashboard") → **Register app**. Skip the
   "Firebase Hosting" checkbox — you don't need it.
4. You'll see a code block with a `firebaseConfig = { ... }` object. Copy
   those six values (`apiKey`, `authDomain`, `projectId`, `storageBucket`,
   `messagingSenderId`, `appId`).

**At this point, you can paste those six values back to me in the chat and
I'll update `index.html` for you** — or you can do it yourself: open
`index.html`, find `const firebaseConfig = {` near the top of the script,
and replace the six `REPLACE_ME` placeholders with your real values.

### A5. Publish the security rules
1. Left menu → **Firestore Database → Rules** tab.
2. Delete what's there and paste in everything from `firestore.rules` (in
   this folder).
3. Click **Publish**.

### A6. Create your own Admin account (one-time, by hand)
The app needs one Admin to already exist before it can create anyone else's
login, so this first one is manual:

1. **Authentication → Users → Add user** → enter your email + a password →
   **Add user**.
2. Copy the **User UID** shown next to your new account.
3. **Firestore Database → Data** tab → **Start collection** → Collection
   ID: `users` → Document ID: paste that UID → add three fields:
   - `name` (string) → your name
   - `role` (string) → `admin`
   - `email` (string) → the email you signed up with
4. **Save**.

Firebase side is done.

---

## Part B — GitHub (hosting the site)

### B1. Create a GitHub account
If you don't have one: go to https://github.com/signup and create a free
account.

### B2. Create a new repository
1. Go to https://github.com/new
2. Repository name: e.g. `delivery-dashboard`
3. Keep it **Public** (Pages needs this on a free account)
4. Leave everything else as default → **Create repository**.

### B3. Upload the files
1. On your new (empty) repo page, click **uploading an existing file**
   (or **Add file → Upload files**).
2. Drag in `index.html` (with your real Firebase config already pasted
   in) — the other two files (`firestore.rules`, `README.md`) are optional
   to upload but fine to include.
3. Scroll down → **Commit changes**.

### B4. Turn on GitHub Pages
1. On the repo page, go to **Settings** (top tab) → **Pages** (left menu).
2. Under **Build and deployment → Source**, choose **Deploy from a
   branch**.
3. Under **Branch**, choose `main` and folder `/ (root)` → **Save**.
4. Wait about a minute, then refresh the page — GitHub shows you a live
   URL like `https://yourusername.github.io/delivery-dashboard/`.

### B5. Sign in
Open that URL, sign in with the Admin email/password you created in A6.
You should land on the Admin overview. From **Users & roles → Add user**
you can now create logins for your Warehouse team and customers — no more
manual Firebase steps needed for them.

---

## How the workflow maps to the app

- **Warehouse** creates an invoice from the physical copy: invoice number,
  DO number, customer, and total item count. As they check stock, they add
  a **pending item** row for any item number that isn't available (with an
  optional note), and tick it off later once it's restocked and sent. They
  assign a driver and move the status through *in transit* → *delivered*.
- **Admin** can correct or delete an invoice made by mistake, manages the
  Customers and Drivers lists, and creates/manages user logins and roles.
- **Customer** only sees their own orders: status, total items, and which
  item numbers are still pending.
- Every invoice has a **Share WhatsApp update** button that opens a
  pre-filled WhatsApp chat to the customer's saved number with the current
  status — no extra setup needed for that part.

## Notes / limits

- No password-reset flow yet — if someone forgets their password, an Admin
  deletes and recreates their login via Firebase Console → Authentication.
- Free-tier Firestore comfortably covers this volume of invoices.
