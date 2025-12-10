1) Install & Run (local)
   - node >=14 recommended
   - npm install
   - set env variables (ADMIN_USER, ADMIN_PASS, SMTP_* optional, NOTIFY_TO)
   - npm start
   - browse http://localhost:3000/book.html and /admin.html

2) Deploy
   - VPS: copy files, install node, run with PM2/systemd.
   - Render/Heroku: set environment variables in dashboard and deploy. Expose PORT env variable.
   - For static-only hosts (Netlify/GitHub Pages) you need serverless functions or external form services.

3) Email notifications
   - Recommended: use SendGrid/Mailgun/SES. Configure SMTP_* env.
   - If using Gmail, create App Password and use smtp.gmail.com with port 587.

4) Payments
   - This code simulates payments at /api/payment.
   - To integrate Stripe: create a Stripe account, implement server route to create Checkout Session, return session id, redirect client to Stripe Checkout. Add webhook endpoint to confirm payment and update records.
   - To integrate Razorpay: create order on server, return order details to client to open Razorpay Checkout. Verify webhook signature server-side.

5) Security
   - Serve behind HTTPS.
   - Use strong ADMIN_PASS.
   - Consider moving data from JSON to a database (Postgres, MongoDB) for scale and reliability.

6) File locations
   - public/*.html — front-end pages (book/enquire/payment/admin)
   - data/*.json — persisted records
   - server.js — main server
