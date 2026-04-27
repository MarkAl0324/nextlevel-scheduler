# Phase gates checklist (quick)

This is a human-friendly checklist to keep `PROJECT_WEB_DEV_STATE.md` moving forward with minimal thrash.

## Discover → Design_UX_IA

- [ ] Product section has **Goal**, **Primary users**, **MVP**, **Non-goals**, **Success metrics**
- [ ] MVP scope is explicit enough to list screens/modules

## Design_UX_IA → Architecture

- [ ] UX / IA includes **key flows**
- [ ] Navigation model is clear (sidebar/topnav/tabs/breadcrumbs)
- [ ] Screen/module inventory exists (what screens exist + what they contain)
- [ ] Loading/empty/error states called out for top surfaces

## Architecture → Scaffold

- [ ] Stack chosen (UI framework, API approach, data store)
- [ ] Hosting target chosen (where UI/API run)
- [ ] Auth approach chosen (SSO/IdP path, session/JWT)
- [ ] Env strategy chosen (what env vars, how managed locally/CI/prod)

## Scaffold → Implement

- [ ] Repo map filled (UI/API/tests paths)
- [ ] Important commands listed and work locally (at least `dev`)
- [ ] Basic lint/format/test baseline exists (even if minimal)

## Implement → Verify

- [ ] Quality bar filled (a11y/security/perf expectations)
- [ ] “Critical user paths” listed in Verification section

## Verify → Ship

- [ ] Automated commands pass
- [ ] Release-critical flows have an entry in “Browser MCP certified flows” (or a reason to skip)

## Ship

- [ ] Secrets/env vars documented
- [ ] Deploy + rollback steps documented (in handoff or linked doc)
