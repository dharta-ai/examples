# Domain

This package holds CRM rules that must agree across the API, jobs, and MCP
server: stage transitions, task ownership, forecast calculations, consent, and
audit event construction.

Keep transport details and agent prompts out of this package. Domain operations
accept an authenticated actor and tenant scope explicitly.
