# Content Script Modules

This folder contains the content script logic split by responsibility.

- `autofill.ts`: orchestrates form filling, profile reuse, OTP lookup, and final field updates.
- `button.ts`: renders the floating button, drag behavior, tooltip, and click/context actions.
- `address.ts`: resolves ZIP-based address data and renders ZIP suggestions.
- `mailinator.ts`: generates Mailinator inboxes and fetches OTP values through the extension runtime.
- `storage.ts`: reads and writes host-scoped localStorage state for inboxes, profile data, button position, and toggles.
- `profile.ts`: centralizes selectors, constants, storage keys, and validation patterns.
- `utils.ts`: DOM helpers, input setters, required-choice helpers, and data-format utilities.
- `types.ts`: shared types used across the content script modules.

Entry point:

- `../content.ts`: boots the content script, attaches observers, and mounts the floating button.

Guidelines:

- Keep DOM orchestration in `autofill.ts` or `button.ts`.
- Keep persistence concerns in `storage.ts`.
- Keep shared selectors/constants in `profile.ts`.
- Add new helpers to `utils.ts` only when they are reused by more than one module.