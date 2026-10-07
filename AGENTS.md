# Architecture rules
- Shop theme previews resolve saved `theme_data` first and use built-in styles only as fallbacks, so owner-created themes preview without code changes.
- Server cards and landing pages share a cached shop theme catalog and prioritize its styles below custom overrides, so newly added themes render without hardcoded theme keys.
- Owner credit reporting uses current server balances and paginated purchase records; a database insert trigger snapshots purchase costs and distinguishes site-owner grants, while legacy costs remain unknown to avoid invented spending totals.