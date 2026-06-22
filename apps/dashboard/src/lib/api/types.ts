// Domain types now live in the shared workspace package so the API and the
// dashboard can't drift. Re-exported here so existing `@/lib/api/types`
// imports keep working unchanged.
export * from '@laundry/shared'
