OUT OF WARRANTY SERVICE CENTRE — LIVE COMPLAINT SYSTEM V3

WHAT THIS VERSION ADDS
1. Online-style backend API
2. SQLite database (complaints.db is created automatically)
3. Customer complaint submission -> server/database
4. Unique OWS ticket ID
5. Customer tracking endpoint/page
6. Private admin panel at /admin
7. Admin status updates:
   New Request -> Contacted -> Technician Assigned -> In Progress -> Completed / Cancelled
8. WhatsApp handoff after ticket creation
9. Premium responsive frontend retained

RUN ON A COMPUTER/HOST
1. Install Node.js 20+.
2. Open this folder in terminal.
3. Run: npm install
4. Set a strong ADMIN_KEY environment variable.
5. Run: npm start
6. Open: http://localhost:3000
7. Admin: http://localhost:3000/admin

IMPORTANT
This is a deployable backend prototype, but it is NOT publicly live just by downloading the ZIP.
For public access, upload/deploy the folder to a Node.js-capable hosting provider and configure the ADMIN_KEY.
For a production system, add HTTPS, proper admin authentication, backups, rate limiting, CAPTCHA, and database backups.
