# False Success Investigation

*(Captured in `evidence/11-write-succeeded-logs.txt`, `12-database-rows.png`, and `13-write-failed-logs.txt`.)*

---

## 1. What the User Saw
When `DATABASE_URL` was deliberately broken (`.env` moved aside so `process.env.DATABASE_URL` became undefined), submitting the `/pickup` form (`src/app/pickup/PickupForm.tsx`) rendered a soft green confirmation box (`role="status"`):

> `"Our records show your pickup request was saved."`

To Amaka Obi on her phone, the booking appeared completely successful.

---

## 2. What Actually Happened
Behind the interface, **nothing was saved**:
- `POST /api/pickup-requests` executed `getDb()` (`src/lib/db.ts:15`), threw `DATABASE_URL environment variable is missing or empty.`, logged `[POST /api/pickup-requests] 500 Database Error`, and returned **HTTP `500 Internal Server Error`** (`13-write-failed-logs.txt`).
- Querying `sqlite3 freshfold.db "SELECT COUNT(*) FROM pickup_requests;"` confirmed **2 rows before** and **2 rows after**—zero new rows written.
- The frontend `handleSubmit` (`src/app/pickup/PickupForm.tsx:21-38`) ignored `response.ok` completely and unconditionally set the success banner inside both `try` and `catch`.

*(Note: During initial testing we also discovered Next.js auto-loads `.env` even when `env -u DATABASE_URL` is run in the shell; moving `.env` aside was required to actually break the connection.)*

---

## 3. How a Demo Reviewer Would Have Been Fooled
A stakeholder reviewing a screen-shared demo watches the user fill in `"Chisom Eze"`, click `"Record pickup request"`, and see a calm green confirmation message. Because no error toast appeared and the form cleared/settled cleanly, the reviewer assumes persistence works—never realizing there is **no `HTTP 201 Created`** in the server logs and **zero rows** in `freshfold.db`.

*(Fixed in `src/app/pickup/PickupForm.tsx` by checking `if (!response.ok)` and displaying `role="alert"` on non-2xx responses.)*

