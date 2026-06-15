---
title: OpenSpec Config
description: Project context, constraints, and conventions for spec-driven development.
schema: spec-driven
related:
  title: Getting Started
  description: Learn how to propose changes, write specs, and implement tasks.
  links:
    - openspec/changes
---

## Tech Stack

| Category | Tools |
|----------|-------|
| Core | TypeScript, Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| UI | shadcn/ui (Radix UI primitives), lucide-react icons |
| Data fetching | TanStack Query v5 + ky |
| API routes | openapi-fetch (types from `src/services/types/openapi.ts`) |
| State | immer (immutable updates), nuqs (URL state), ahooks (utilities) |
| Styling | clsx + tailwind-merge, tw-animate-css |
| Tooling | Yarn, Biome (`yarn lint` + `yarn format` — **not** ESLint/Prettier) |

## Project Structure

```
src/app/          → file-based routing (Next.js App Router)
src/components/   → shared UI components
src/hooks/        → custom React hooks
src/providers/    → context providers
src/services/     → API call functions
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) format.

## Constraints

> Never violate these rules.

- Place `"use client"` at the very top of client components — no imports above it
- Never use `useEffect` for data fetching — always use `useQuery`
- Never use ESLint or Prettier — Biome only
- All UI elements must use shadcn/ui components

## Conventions

### Conditional logic

Use `ts-pattern` for complex conditionals instead of `if/else` chains or `switch` statements.

```ts
import { match, P } from 'ts-pattern';

type Result =
  | { type: 'ok'; data: string }
  | { type: 'error'; error: Error }
  | { type: 'loading' };

const message = match(result)
  .with({ type: 'loading' }, () => 'Loading...')
  .with({ type: 'error' }, ({ error }) => `Error: ${error.message}`)
  .with({ type: 'ok', data: P.select() }, (data) => data)
  .exhaustive(); // compile-time exhaustiveness check
```

Use `.exhaustive()` whenever matching a discriminated union — it ensures all cases are handled at compile time. Use `.otherwise(() => ...)` when a fallback is intentional.

### Data fetching

Use `useQuery` / `useInfiniteQuery` with `ky` for HTTP calls; `queryKey` format: `["/api/path", payload]`.

```ts
const { data } = useQuery({
  queryKey: ["/api/path", payload],
  queryFn: () => ky.post("/api/path", { json: payload }).json<ResponseType>(),
});
```

### Modals

Use `nice-modal-react` (`NiceModal.show/hide`) for modals triggered imperatively (e.g. from buttons, actions, or outside the component tree). Use local state only for simple inline toggles that are tightly coupled to a single component.

**Defining a modal:**

```tsx
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ConfirmModal = NiceModal.create<{ message: string }>(({ message }) => {
  const modal = useModal();
  return (
    <Dialog open={modal.visible} onOpenChange={() => modal.hide()}>
      <DialogContent>
        <p>{message}</p>
        <button onClick={() => modal.resolve(true)}>Confirm</button>
        <button onClick={() => modal.hide()}>Cancel</button>
      </DialogContent>
    </Dialog>
  );
});
```

**Showing a modal (imperative):**

```ts
// By component reference — no registration needed
NiceModal.show(ConfirmModal, { message: 'Delete this item?' })
  .then(() => deleteItem())
  .catch(() => {/* cancelled */});

// By string ID — register first (e.g. in a modals.ts file)
NiceModal.register('confirm-modal', ConfirmModal);
NiceModal.show('confirm-modal', { message: 'Are you sure?' });
```

**Wrap the app with `NiceModal.Provider`** (done once at the root layout):

```tsx
import NiceModal from '@ebay/nice-modal-react';

export default function RootLayout({ children }) {
  return <NiceModal.Provider>{children}</NiceModal.Provider>;
}
```

### Search/filter pages

Manage API payload with `useState` + `useDebounceEffect` (ahooks) + `immer` produce:

```ts
const [keyword, setKeyword] = useState("")
const [payload, setPayload] = useState({ page: 1, pageSize: 20, keyword: "" })

useDebounceEffect(() => {
  setPayload(produce(payload, (draft) => { draft.keyword = keyword; draft.page = 1 }))
}, [keyword], { wait: 500 })
```

### Date formatting

Use `dayjs` to format dates. Import it directly — no global setup needed.

```ts
import dayjs from "dayjs";

dayjs("2024-01-15").format("YYYY-MM-DD")       // "2024-01-15"
dayjs("2024-01-15").format("YYYY/MM/DD HH:mm") // "2024/01/15 00:00"
dayjs().fromNow()                               // "a few seconds ago" (requires relativeTime plugin)
```

For relative time, register the plugin once at the app entry point:

```ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
```

For Unix timestamps (seconds), use `dayjs.unix()`:

```ts
dayjs.unix(1705276800).format("YYYY-MM-DD") // "2024-01-15"
```

To convert a `dayjs` object back to a Unix timestamp:

```ts
dayjs("2024-01-15").unix() // 1705276800
```

Guard with a ternary when the value may be `undefined`:

```ts
value ? dayjs(value).format("YYYY-MM-DD") : "-"
value ? dayjs.unix(value).format("YYYY-MM-DD") : "-"
```

### Number formatting

Use `numeral` to format numbers. Import it directly — no global setup needed.

```ts
import numeral from "numeral";

numeral(1500).format("0,0")        // "1,500"
numeral(1500000).format("0.[0]a")  // "1.5m"
numeral(0.25).format("0%")         // "25%"
```

Use `"0.[0]a"` for compact display in stats/badges (e.g. `1.5m`, `300k`). Guard with a ternary when the value may be `undefined` or `0`:

```ts
value ? numeral(value).format("0.[0]a") : undefined
```

### Mutations

Use `useMutation`; always call `queryClient.invalidateQueries` on success to keep data fresh.

```ts
const mutation = useMutation({
  mutationFn: (data) => ky.post("/api/path", { json: data }).json(),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/path"] }),
})
```

## Rules

### Proposals

- Keep proposals concise and focused on user-facing value
- Include a "Non-goals" section to scope the change

### Tasks

- Break tasks into small, independently testable chunks
- Each task should reference the relevant file(s) to modify
- After completing implementation, run `yarn lint` then `yarn format` to ensure code quality