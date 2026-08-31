# Database

This package owns the CRM schema, migrations, row-level tenant constraints,
transaction helpers, and audited data access.

Only trusted backend services import it. The web browser, Dharta Agent App,
produced Artifacts, and shared public packages must not receive direct database
access.
