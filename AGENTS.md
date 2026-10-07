# Architecture rules
- Shop theme previews resolve saved `theme_data` first and use built-in styles only as fallbacks, so owner-created themes preview without code changes.
- Server cards and landing pages share a cached shop theme catalog and prioritize its styles below custom overrides, so newly added themes render without hardcoded theme keys.