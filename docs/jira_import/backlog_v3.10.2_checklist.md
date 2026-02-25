# Jira Import Checklist — backlog_v3.10.2

## Pre-import checks
- [ ] File encoding is UTF-8
- [ ] Header columns are exactly:
  - [ ] `Issue Type`
  - [ ] `Summary`
  - [ ] `Description`
  - [ ] `Epic Name`
  - [ ] `Epic Link`
  - [ ] `Labels`
  - [ ] `Priority`
  - [ ] `Components`
  - [ ] `Fix Version`
- [ ] Epic count is 11 (E0~E10)
- [ ] Story count is 30
- [ ] Every Story row has `Epic Link`
- [ ] Every Epic row has `Epic Name`
- [ ] `Description` includes Goal/Acceptance Criteria/Dependencies/Source References

## Import wizard checks
- [ ] Field mapping follows `/Users/exem/DK/BathSommelier/docs/jira_import/backlog_v3.10.2_mapping.md`
- [ ] `Epic Link` mapped to Jira Epic Link field (not Parent)
- [ ] Components and Fix Version are mapped as multi-value fields

## Post-import checks
- [ ] Saved filter `labels = v3_10_2` returns all imported issues
- [ ] All Stories are linked to Epics (0 orphan stories)
- [ ] Priority distribution matches policy
- [ ] Components populated per domain
- [ ] Korean text and checklist formatting in Description render correctly

## Quick validation queries (JQL examples)
- [ ] `labels = v3_10_2 AND issuetype = Epic`
- [ ] `labels = v3_10_2 AND issuetype = Story AND "Epic Link" is EMPTY`
- [ ] `labels = v3_10_2 AND priority = Highest`
- [ ] `labels = v3_10_2 AND component = analytics`

## Rollback plan
- [ ] If mapping is wrong, bulk-delete imported set by label `v3_10_2` in test project
- [ ] Fix CSV/mapping and re-import before production project import
