# PrivacyMap India V1.6 — Web Migration Package

This package is prepared to merge the V1.6 knowledge/intelligence layer into the Next.js `privacymap-india` repository.

## Important

This is **not** the old Streamlit application. The old Streamlit UI and Python runtime have deliberately been excluded.

### Included

- V1.6 legal intelligence and commencement data
- V1.6 core assessment vocabularies
- Risk rules and finding templates
- Generic assessment schema
- Existing Education/School catalogue
- Release/change governance metadata
- Next.js/TypeScript KB access layer
- Browser-build validation script
- V1.6 migration manifest

### Excluded

- `app/app.py`
- `requirements.txt`
- `render.yaml`
- Streamlit-specific runtime files

Those belong to the previous implementation and should not be copied into the Next.js project.

## GitHub merge

Extract this ZIP. From the GitHub `privacymap-india` repository, use **Add file → Upload files** and upload the extracted package contents so the folders merge into the repository.

Do not upload the ZIP file itself.

After the upload/commit, Vercel should automatically create a new deployment.

## Next step

After the V1.6 files are committed and the deployment succeeds, we will connect the landing page's **Start Privacy Assessment** button to the V1.6 knowledge base and build the first browser-only assessment flow.

## Privacy-by-design rule

No customer assessment response is included in this package. The application should keep assessment responses in browser memory/local client state and generate reports locally. We will not add a database unless that is explicitly designed and approved later.

## Legal boundary

PrivacyMap provides discovery, inventory, risk and legal-reference mapping. It is not legal advice, certification, audit evidence by itself, or a determination of DPDP compliance.
