# VIPER AI rebuild — race engineering plan

## Current deployment and repository

- The project is a static HTML/CSS/JavaScript site published through GitHub Pages; there is no `package.json` or application build pipeline in the inspected repository.
- Pages use the Supabase JavaScript client from a CDN.
- The current site connects to the existing Supabase project using a publishable client key. The publishable key is not an admin credential; table access must continue to be enforced by Supabase Auth and Row Level Security (RLS).
- The existing `main` branch remains the live source. The rebuild is isolated on `rebuild/race-engineering` until it has been reviewed and verified.

## Existing feature inventory

| Feature | Existing page | Main data dependencies |
| --- | --- | --- |
| Member sign-in, registration and approval state | `index.html` | Supabase Auth, `profiles`, invitation code metadata |
| Main dashboard and race summaries | `index.html` | `race_records`, `rider_stats`, `lap_records` |
| Race calendar, details, roster and file submissions | `race-days.html` | `profiles`, `race_days`, `roster_entries`, race-file storage |
| Rider and lap records | `rider-data.html` | `race_records`, `rider_stats`, `race_days`, `roster_entries`, `lap_records` |
| Team data analysis | `team-analysis.html` | `profiles`, `race_records`, `rider_stats`, `lap_records` |
| Performance trends | `performance-dashboard.html` | `profiles`, `race_records`, `rider_stats` |
| Captain controls, invitations and submissions review | `captain.html` | `profiles`, `invite_codes`, `race_records`, `rider_stats`, `submissions`, private race-file storage, review RPC |
| Rider directory and member management | `riders.html` | `profiles`, `rider_stats`, `race_days`, `race_attendance`, `race_records` |
| Roll call | `attendance.html` | `race_attendance`, `profiles`, `race_days` |
| Race-day command centre | `race-command.html` | `race_days`, `race_day_checklist`, roster and attendance data, race updates/results |
| Rider availability (restricted) | `rider-availability.html` | `profiles`, `race_days`, `rider_availability` |
| Team announcements | `announcements.html` | `team_announcements`, `profiles` |
| Training planner | `training.html` | Existing page-specific Supabase tables/policies; audit before moving |
| Database policies/import references | `database/*.sql` | Existing schema and RLS policy definitions; reference only, do not auto-run |

## Identity and authorization contract

1. Reuse the existing Supabase Auth identities and `profiles`; do not migrate or recreate accounts as part of the UI redesign.
2. Registration continues to pass `full_name` and `invite_code` as signup metadata. Invitation validation and profile creation must remain enforced by the existing database/server-side logic.
3. A signed-in user must have a matching `profiles` row with `status = 'approved'` before member dashboard data is requested.
4. Leadership views are shown only for approved `captain` or `leadership` roles; captain-only controls are shown only for the captain role. These UI checks are navigation aids, not security boundaries.
5. Every page, RPC and storage bucket must retain its own Supabase RLS / authorization enforcement. Never rely on hidden links or client-side role checks to secure private data.
6. Never place a service-role key, database password, invite secret, or admin token in browser code.

## Rebuild phases

### Phase 1 — isolated shell and dependency check
- Add `engineering-preview.html` on this branch only.
- Establish a race-engineering visual system, grouped navigation, responsive rail, member gate and read-only dashboard.
- Read only the existing race and rider tables; do not add, update, delete, or import race data.
- Link to existing features while their individual redesigns are prepared.

### Phase 2 — feature-by-feature replacement
- Inventory each page's queries, forms, RPCs, storage calls and RLS assumptions before replacing its interface.
- Rebuild one feature at a time while keeping the existing tables and column contracts.
- Test normal member, pending member, approved leadership and captain flows.
- Validate uploads, invitation approval, race editing, lap logging, roll call, submissions review and private storage access before retiring old pages.

### Phase 3 — verification and cutover
- Check desktop/mobile layout, browser console, network responses, sign-in/sign-out, pending and declined states, and data rendering with authorized accounts.
- Verify Supabase RLS policies and storage policies independently of the UI.
- Keep the existing `main` branch and database unchanged until the preview is accepted and the critical workflows pass.
- Cut over only after a backup/export plan for database data and a tested rollback path are in place.

## Current verification limits

The repository can be inspected and the preview source can be checked, but this integration cannot sign in as a real team member, inspect live Supabase RLS configuration, or run an authenticated browser session. Those checks remain required before deployment. No schema migrations or production data changes are part of Phase 1.
