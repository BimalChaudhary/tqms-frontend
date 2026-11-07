# API contract (implemented by the phase-2 mock backend)

Base URL: `NEXT_PUBLIC_API_BASE_URL` (default `/api`). JSON, cookie session (`credentials: include`).

**Envelopes**
- Single: `{ "data": T }` · List: `{ "data": T[], "meta": { page, pageSize, total, totalPages } }`
- Error: `{ "message": string, "errors"?: { [field]: string } }` with `401` (no session), `404`, `409`, `422` (field errors), `500`.
- List query params: `page, pageSize, q, sort, order=asc|desc` + endpoint filters. Uploads use `multipart/form-data` (any body containing a File).
- File fields return `<field>Url` and `<field>Name`; select fields on sub-resource rows also return `<field>Label` (e.g. `documentTypeIdLabel`).

| Method & path | Notes |
|---|---|
| POST `/auth/login` `{email,password,remember}` → `CheckpointProfile`; POST `/auth/logout`; GET `/auth/me`; POST `/auth/change-password` `{currentPassword,newPassword,confirmPassword}`; POST `/auth/forgot-password` `{email}` | 401 invalid credentials; 422 field errors |
| GET `/dashboard` | `{inQueue,inJob,pendingApprovals,paymentPending,todayEntries}` |
| GET `/lookup/:type?q&parentId` → `Option[]` | types: provinces, districts(parentId=province), vehicle-types, plate-colors, plate-types, zonal-codes, symbols, stations, card-types, banks, insurance-companies, policy-types, goods, bill-numbers, vehicle-numbers, vehicles(q), vehicle-owners(q), sanghs, entry-positions, document-types. Labels for zonal-codes/symbols/provinces include codes: `Bagmati (BA)`, `(JHA) Light vehicles`, `Bagmati Province (P3)` |
| GET/POST `/checkpoint-users`, GET/PATCH/DELETE `/checkpoint-users/:id`, PATCH `/checkpoint-users/:id/status` `{isActive}` | `q` searches name/contact/address; unique email → 422 |
| GET/PATCH `/narration` `{narration}` | |
| GET `/queues?status&vehicleId&cardType&vehicleType` | status: in_job, in_queue, unregistered, payment_pending |
| POST `/queues`; GET `/queues/:id`; POST `/queues/:id/check-in` `{grossWeight}`; POST `/queues/:id/end-journey`; GET `/queues/:id/receipt` | see `features/queue/types.ts` |
| GET `/queues/pending`; GET/DELETE `/queues/pending/:id`; POST `/queues/pending/:id/approve` | |
| GET/POST `/vehicles`; GET/PATCH `/vehicles/:id` (detail includes `general`, `form`, `labels`); GET `/vehicles/:id/audit-logs` | duplicate plate → 422 on `vehicleNumber` |
| GET/POST `/vehicles/:id/:resource`, PATCH/DELETE `/vehicles/:id/:resource/:rid` | resource: documents, owners, beneficiaries, check-passes, route-permits, insurances, type-cards, bluebooks |
| GET/PATCH `/vehicles/:id/tare-weight` `{tareWeight}` | |
| GET/POST `/vehicle-owners?verified=all|verified|unverified`, GET/PATCH `/vehicle-owners/:id`, GET/POST `/vehicle-owners/:id/banks`, GET `/vehicle-owners/:id/vehicles` | |
| GET/POST `/other-vehicles?kind=all|indian|unregistered` | |
| GET `/reports/checkpoint-entries?name&start&end`, GET `/reports/detail-entries?start&end&vehicleNo&goods&billNo` | export requests `pageSize=1000` |
| GET `/checkpoint/qr` → `{payload,label}` | |

Types for every request/response live in `src/features/*/types.ts`.
