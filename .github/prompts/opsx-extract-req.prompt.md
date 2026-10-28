---
description: "Extract business requirements from OpenSpec specs using the IREB standard into Jira-ready Use Case and Sub Use Case .md YAML files"
---

Invoke the `openspec-extract-req` workflow in `.github/skills/openspec-extract-req/SKILL.md` to scan `openspec/specs/` and active changes in `openspec/changes/`, formulate all business requirements in English following the IREB (CPRE) standard, and output one `.md` YAML file per `Use Case` (`requirements/use-cases/`) and per `Sub Use Case` (`requirements/sub-use-cases/`), plus the master index (`requirements/README.md`).
