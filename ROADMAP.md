# Snapcode Roadmap

This roadmap tracks planned Snapcode product, storage, publishing, and monetization work. Items are plans, not claims that features are already implemented.

## 1. Core editor and experience
- [ ] Continue improving the editor experience, navigation, accessibility, and responsive layouts.
- [ ] Add and refine Snapcode-specific tools and extensions.
- [ ] Keep the starter project and onboarding experience approachable.

## 2. Local project library
- [ ] Implement local project saving in IndexedDB.
- [ ] Build a My Projects view for local projects.
- [ ] Support reopening, renaming, deleting, and exporting/importing local projects.
- [ ] Save locally by default; local projects should not consume published-project slots.
- [ ] Explain that browser storage is subject to device/browser limits and may be cleared.

## 3. Cloud publishing and Explore
- [ ] Connect project saving and publishing to Supabase.
- [ ] Add project descriptions, thumbnails, and creator attribution.
- [ ] Publish projects to Explore and creator profiles.
- [ ] Add unpublish, edit, and delete controls.
- [ ] Enforce publishing limits on the server/database, not just in the client.
- [ ] Create a publishing workflow: save locally first, then publish when the creator chooses.

## 4. Free publishing tier
- [ ] Provide 3 published-project slots per free account.
- [ ] Allow unlimited local projects, subject to browser/device storage capacity.
- [ ] Let users unpublish a project to free a publishing slot.
- [ ] Clearly explain the difference between local and published projects.

## 5. Paid publishing capacity (monetization)
- [ ] Offer paid plans or one-time upgrades that increase published-project capacity.
- [ ] Proposed tiers, with pricing and exact limits to be decided:
  - Free: 3 published projects.
  - Creator: 10 published projects.
  - Studio: 25 published projects.
  - Unlimited: unlimited published-project slots, subject to fair-use and infrastructure policies.
- [ ] Decide whether upgrades are subscriptions, one-time slot packs, or a combination.
- [ ] Build a billing and entitlement system and connect account status to server-enforced publishing limits.
- [ ] Show the current slot usage and plan allowance in the account/project library UI.
- [ ] Handle downgrades gracefully: do not delete or hide already-published projects solely because a user downgrades; prevent new publishing until the account is within its allowance, or the user otherwise resolves the over-limit state.
- [ ] Ensure users can unpublish projects and manage their portfolio regardless of plan.
- [ ] Choose pricing only after estimating hosting, storage, bandwidth, and support costs.

## 6. Profiles and community
- [ ] Build creator profiles with published projects.
- [ ] Improve discovery, search, filters, and project cards in Explore.
- [ ] Add community features only after moderation, reporting, and safety systems are planned.

## 7. Security, reliability, and launch readiness
- [ ] Verify Supabase Row Level Security and storage policies.
- [ ] Securely enforce per-account published-project limits, including concurrent publish attempts.
- [ ] Test signup, login, session management, publishing, unpublishing, deletion, and downgrade scenarios.
- [ ] Add backups/export paths and user-facing storage explanations.
- [ ] Review privacy, moderation, abuse prevention, and legal requirements before launch.

