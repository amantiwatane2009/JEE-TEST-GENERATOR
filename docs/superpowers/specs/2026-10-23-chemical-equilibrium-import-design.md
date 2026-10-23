# Chemical Equilibrium chapter import

## Intent and goals

Add the supplied JEE Main Chemical Equilibrium PYQ PDF as a Class 11 Chemistry chapter available in the website's test generator. Preserve the source's question presentation and use its printed answer key.

## Non-goals and constraints

Do not update or remove existing question records, alter the schema, or deploy the website. Follow the current image-based chapter import and metadata conventions. Keep IDs unique, retain source page and question numbering, and flag ambiguous or unscored answers.

## Approaches

- Add individual question records with source image crops as a local question bank and insert matching rows into the existing `jee_questions` table. The local copy supports testing without Supabase, and the table sync makes the metadata available to the existing hosted reader; selected based on the user's request to test locally and subsequent request to sync.
- Attach the PDF as a downloadable reference. This would not make its questions available in the simulator, so it does not meet the request.

## Implementation outline

Inspect the supplied PDF and answer key, create one complete image crop per included question, assign collision-free IDs and metadata, load the local records alongside Supabase results, and add the same rows to the existing table without replacing records. If Supabase is unavailable, keep the local chapter usable for testing. Record counts and any uncertain keys in the import QA manifest and source registry. The static website still needs deployment before the hosted site can serve the new local image assets.

## Builder decisions

Use the existing Ionic Equilibrium import as the closest format and follow any source-specific details found in the PDF. Do not infer missing answers.
