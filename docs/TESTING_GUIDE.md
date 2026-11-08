# TQMS testing guide

This guide covers repeatable API checks and the manual browser flow for the checkpoint portal. Use the local seeded backend for testing. The smoke suite creates sample owners, vehicles and queues; it must not be pointed at your deployed API or a database containing real records.

## 1. Build and type checks

From `tqms-frontend`:

```bash
npm run typecheck
npm run build
```

From `tqms-backend`:

```bash
npm run build
```

## 2. Run the isolated API smoke suite

Open one terminal in `tqms-backend` and start the API without a database URL. This keeps the test data in memory:

```bash
DATABASE_URL= NODE_ENV=development SESSION_SECRET=local-test-secret PORT=4400 npm run start:dev
```

Wait for `TQMS backend running on http://localhost:4400/api`. Open a second terminal in `tqms-backend` and run:

```bash
TEST_API_BASE_URL=http://127.0.0.1:4400/api npm run test:smoke
```

The script exits with a nonzero status when a check fails. It verifies authentication and session handling, lookup data, field validation, duplicate email handling, checkpoint-user CRUD, owner and bank create/read/update, vehicle create/read/update and audit history, tare weight, vehicle sub-resource CRUD, queue lifecycle, receipts, reports, QR, narration and Other Vehicle list/create. It also confirms invalid file types are rejected before contacting Cloudinary.

The test creates disposable records and changes narration in the in-memory process. Stop the API with `Ctrl+C` after the run; a fresh process starts from the demo seed again. A valid Cloudinary upload is intentionally not attempted by this suite because it requires configured Cloudinary credentials and an external upload.

## 3. Run the frontend against the local API

Keep the backend running. In a terminal in `tqms-frontend`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4400/api npm run dev
```

Open `http://localhost:3000` and sign in with the local mock account documented in the root README. Confirm that the dashboard loads and the browser remains on the local API. Do not use the hosted production app for this checklist.

## 4. Manual browser checklist

1. **Login and session:** submit an incorrect password and confirm a single error message; sign in with the local demo account; refresh and confirm the session remains active; log out and confirm protected pages redirect or request sign-in.
2. **Checkpoint users:** open the list; search by a name; paginate; add a user with valid fields; open and edit it; toggle active status; delete the test user; verify it no longer appears. Try an invalid phone, malformed email and district from the wrong province and confirm field-level errors.
3. **Vehicle owners:** add an individual owner with valid location and contact details; open the profile; edit it; check bank details and linked-vehicle sections. Add and edit a bank account. Verify invalid contact, PAN and account-number messages. Owner deletion is not currently implemented.
4. **Vehicles:** create a vehicle with each supported plate format in separate trials; verify the formatted plate preview; open details; edit the record; update tare weight; add, edit and delete a beneficiary or another non-file sub-resource; inspect audit history. Vehicle deletion is not currently implemented.
5. **Documents and uploads:** with Cloudinary configured on a local backend, upload a harmless test PNG/JPG/PDF under 5 MB, wait for completion, and confirm the document is listed after reopening the record. Try an unsupported type and a file over 5 MB and confirm the API reports an error. Do not use real identity or banking documents in a demo account.
6. **Queues:** create a registered queue and an unregistered queue; check the receipt preview; save; check in with a weight; end the journey; reopen the receipt and verify its number and entered details. Confirm route validation rejects identical From and To values.
7. **Pending queues:** open the seeded pending record and approve it with a valid route and details. To test removal separately, restart the isolated in-memory backend to restore the seed, then remove the pending record. These operations mutate their selected records, so use only the local seeded environment.
8. **Other Vehicles:** create an Indian or unregistered vehicle; search for it and filter by kind. This area currently supports list/create only; edit and delete are not implemented.
9. **Reports and QR:** verify report rows, date/search filters, pagination, print preview and CSV export; compare the detail report receipt number with the queue receipt. Confirm the QR page loads and downloads/prints its payload.
10. **Feedback states:** use an invalid form, an empty search result and a temporary stopped API to check validation, empty and error states. Restore the API and use Retry. Confirm one toast appears per failed/successful action.

## 5. CRUD coverage and current limits

| Area | Implemented operations | CRUD status |
|---|---|---|
| Checkpoint users | List, detail, create, edit, status change, delete | Full CRUD tested |
| Vehicles | List, detail, create, edit, tare-weight update | No vehicle delete endpoint |
| Vehicle sub-resources | List, create, edit, delete | Full CRUD for supported sections; file sections also require Cloudinary |
| Vehicle owners | List, detail, create, edit | No owner delete endpoint |
| Owner bank accounts | List, create, edit | No bank delete endpoint |
| Queues | List, detail, create, check-in, end-journey, receipt | Workflow actions exist; general edit/delete are absent |
| Pending queues | List, detail, approve, remove | Approval/removal tested separately from normal queue CRUD |
| Other Vehicles | List, create, filter/search | Edit/delete are absent |
| Narration | Read, update | Single setting; create/delete do not apply |
| Reports and QR | Read/report filters/export, generate QR payload | Read-oriented features |

## 6. What this test does not prove

The smoke suite tests the local NestJS API contract and synthetic in-memory records. It does not verify Cloudinary credentials, Neon persistence, live Render/Vercel networking, cross-site cookies in a real browser, or the original production TQMS service. There is no automated browser end-to-end suite configured. Complete the manual checklist in a browser before treating a deployment as verified.
