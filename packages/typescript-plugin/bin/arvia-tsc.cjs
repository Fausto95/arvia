#!/usr/bin/env node
// Committed shim: pnpm links bins at install time, before dist/ exists on a
// fresh clone. This file always exists, so the link is always created.
require("../dist/cli.cjs");
