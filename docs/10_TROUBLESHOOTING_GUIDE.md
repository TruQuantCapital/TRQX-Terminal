# TRQX Troubleshooting Guide

## Build Cannot Resolve a File

1. Read the first error line.
2. Note the exact file and import.
3. Confirm the target exists.
4. Confirm the file is not zero bytes.
5. Confirm capitalization matches.
6. Run the build again.

## Duplicate Export

1. Open the barrel `index.js`.
2. Find the repeated exported name.
3. Export either the named function or the default alias, not both under the same name.
4. Run the build again.

## Local Storage Quota Error

1. Confirm the v2 storage refactor is installed.
2. Reload the application.
3. Remove the old oversized key if migration did not remove it.
4. Confirm only compact completed sessions are saved.
5. Check storage diagnostics.

## Scenario Missing From Selector

1. Confirm its folder exists under `src/trqxEngine/scenarios`.
2. Confirm `metadata.js`, `generator.js`, and `index.js` have content.
3. Confirm the scenario is imported in `src/trqxEngine/index.js`.
4. Confirm it is registered.
5. Restart Vite.
