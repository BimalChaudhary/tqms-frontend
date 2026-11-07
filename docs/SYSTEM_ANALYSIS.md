# TQMS Checkpoint Portal: System Analysis

## Scope and source

This is a brief analysis of the checkpoint user's existing TQMS portal, based on an observation recording and the supplied screenshots. It describes the visible workflow and business rules; the visible portal is not treated as a complete backend API specification. No real production records were created, changed or deleted for this analysis or QA.

The implementation is a frontend reconstruction backed by a separate local NestJS mock API. The mock API is isolated from the production application and stores data in memory.

## Navigation and user journeys

The observed navigation includes Dashboard; Checkpoints (users and narration); Queue and Add New Queue; Vehicle (owners, vehicles and other vehicles); Reports (checkpoint entry and detail entry); Generate QR; and account/profile actions.

1. **Checkpoint staff management:** search the staff list, toggle active status, add or edit a user, and delete a user. The form includes name, province/district, address, mobile and email.
2. **Queue processing:** review pending and active queues, then filter the queue by vehicle, card type or vehicle type. A queue can be checked in, viewed, advanced through its journey and given a receipt. Pending QR entries can be reviewed, approved or removed.
3. **New queue entry:** choose Registered, Unregistered or Indian vehicle, enter route and weight details, and review the receipt preview. Registered entries select a vehicle; other entries provide vehicle details directly. Pending approval warns when it may replace an active queue's route or load details.
4. **Vehicle registration:** search by formatted plate number; add or edit a vehicle; choose Embossed, Provincial or Zonal plate type; and enter the matching plate details. The detail view groups general information, documents, owners, beneficiaries, check passes, route permits, insurance, type cards, bluebooks, tare weight and audit history.
5. **Vehicle owners:** filter the owner list by verification status and view, add or edit an owner. Individual owners provide citizenship details; company owners provide registration details. The owner detail view has Profile, Bank Details and Vehicle Details sections.
6. **Other vehicles:** add and list Indian or unregistered vehicles that are not in the registered vehicle list.
7. **Reports and QR:** view checkpoint and detail-entry reports, filter report rows, print or export a CSV; generate and download a QR image.

## Business rules observed

- Province selection precedes district selection; available districts depend on the selected province.
- Vehicle plate fields depend on plate type. Zonal plates use a zonal code, lot number, symbol and vehicle number; the formatted plate is previewed from those values.
- Owner form sections depend on whether the owner is an individual. Individual owners provide citizenship details; company owners provide registration details.
- Queue processing is modeled as explicit lifecycle actions (check-in and end journey), while pending approvals are handled separately.
- Checkpoint user status is changed independently from editing the user's profile.

These rules reflect observed interface behavior. Where the recording did not establish a backend rule, the local mock implementation makes the assumption explicit in its validators or API contract.

## Implementation decisions

- **Feature-based structure:** each feature keeps its API calls, hooks, types, schemas and components together. App Router pages remain thin.
- **Replaceable API boundary:** feature APIs call the shared `apiFetch` client. The frontend does not build backend URLs in presentation components; `NEXT_PUBLIC_API_BASE_URL` selects a compatible API.
- **Server and form state:** TanStack Query handles fetched data, caching and invalidation. React Hook Form and Zod handle field state and client-side validation.
- **Shared interaction patterns:** reusable tables, filters, field shells, dialogs, confirmation dialogs, pagination and loading/empty/error states keep screens consistent.
- **Queue transitions:** actions such as check-in and end-journey are separate mutations because they represent workflow transitions, not arbitrary record edits.
- **Mock data isolation:** the NestJS API uses seeded in-memory data, a local session and common response/error envelopes. It must not connect to or transact against the real TQMS database.
- **Date handling:** queue entry dates are stored as ISO/AD values by the mock and displayed as Bikram Sambat dates in the queue form and receipt preview.

## UX improvements

| Existing behavior observed | Implementation decision |
|---|---|
| Generic required-field errors and duplicate error lists | Use field-specific validation messages and map API field errors to their controls. |
| Browser-native confirmation for destructive actions | Use a reusable confirmation dialog that names the action or record. |
| Search without pagination state | Use shared list state, pagination and loading feedback. |
| Status toggle had little feedback | Show mutation state and a success/error toast. |
| District could be selected before province | Disable the district control until a province is selected. |
| From and To could be identical | Validate that queue route endpoints differ. |
| Inconsistent AD/BS date display | Keep API storage in ISO and convert queue entry display to BS. |

## Known implementation gaps

- The Checkpoint Entry report UI and API currently disagree on row fields. Its API also does not apply the displayed name/date filters or pagination.
- Vehicle, owner and bank deletion routes are absent; Other Vehicles currently support list/create only; queues have lifecycle actions but no general edit/delete route.
- Some backend endpoints accept invalid checkpoint-user and Other Vehicle records when called directly, although their frontend forms validate input.
- Owner uploads currently retain the filename but not the file contents.
- Mock data resets when the backend restarts. The mock does not simulate response delay or configured transient failures.
- Build and API smoke checks have been run, but there is no automated test suite or browser end-to-end suite yet.

For endpoint details and current request/response shapes, see [API_CONTRACT.md](API_CONTRACT.md). Project setup and architecture are summarized in the [root README](../../README.md).
