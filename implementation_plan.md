# Implementation Plan

# Provide a flexible metadata form UI

The user wants a form‑style UI for editing metadata instead of showing raw JSON. The form should lay out input fields in a single row with **up to three fields per row**; any additional fields should automatically wrap to a new row. The layout must not rely on explicit column definitions – it should use a responsive flex‑ or grid‑based approach that naturally wraps.

## User Review Required

[!IMPORTANT] The exact shape of the metadata JSON is not fully specified. We need to know:
- Which keys should be included in the form (e.g., `isBrandLogoEnabled`, `searchBoxFixedPlaceholder`, etc.)?
- What input types are required for each key (boolean toggle, text input, select, multi‑select, etc.)?
- Should the form be part of the existing admin panel UI (e.g., alongside the existing field types) or a stand‑alone component?
- Any validation rules or defaults for the fields?

## Open Questions

[!WARNING] Without clarification on the field definitions and validation logic, we risk implementing a generic form that may not meet the user’s needs.

- **Fields & Types**: Provide a list of metadata keys and desired input types (e.g., `isBrandLogoEnabled` → boolean switch, `backgroundMediaValue` → URL text field, `overlayingTexts` → tags/multi‑line input).
- **Placement**: Should this form replace the current JSON textarea in the admin panel, or be added as a new tab/section?
- **Submission Flow**: Should changes be staged like other edits (pendingEdits) and only sent on “Publish”, or should this form trigger immediate saves?

## Proposed Changes

### Component Creation

#### [NEW] `MetadataForm.tsx`
- A reusable React component that receives a `metadata` object and a `onChange` callback.
- Renders each key/value pair as an appropriate input based on a **field definition map**.
- Layout uses a CSS flex container with `flex-wrap: wrap` and each child has `flex: 0 0 33.33%` to achieve **3 items per row**. Extra items automatically wrap.
- Includes minimal styling for premium look (rounded inputs, subtle shadows, hover effects).
- Provides a “Save” button that calls the supplied `onSubmit` handler.

#### [NEW] `metadataForm.css`
- Styles for the container, input groups, labels, and responsive behavior.
- Uses modern color palette (dark‑mode friendly) and micro‑animations on focus/hover.

### Integration

- Import `MetadataForm` into the admin panel page that currently shows the raw JSON (likely `RightPanel` or a dedicated settings view).
- Replace the raw JSON textarea with the new component, passing the current `configJson` for `HOME_HERO_CAROUSEL`.
- Hook the component into the existing **staged edit** flow: on change, update `builderStore.pendingEdits` rather than invoking the API directly.
- Ensure the `Publish` button still writes the final metadata to the API as before.

### Store Updates

- Extend `builderStore` with a `metadataEdits` map (similar to `pendingEdits`) if needed, or reuse the generic `pendingEdits` with a proper section key.

### Types

- Add a TypeScript interface `MetadataField` describing `key`, `label`, `type`, and optional `options` for selects.
- Create a mapping object `HOME_HERO_METADATA_FIELDS` that enumerates each field for the carousel.

### Testing

- Verify layout: three inputs per row, wrap correctly on window resize.
- Ensure values persist in the preview after editing but before publishing.
- Confirm that no API calls occur until “Publish” is pressed.

## Verification Plan

### Automated Tests
- Run `npm test` (if the repo includes tests) after adding a unit test for `MetadataForm` that checks correct rendering of fields and responsive layout.

### Manual Verification
- Open the admin panel, edit a few fields, observe the preview update instantly.
- Reload the page without publishing – changes should be lost (no API write).
- Click “Publish” and confirm the API receives the updated metadata.
- Check that the UI displays the “Unsaved changes” indicator from the earlier work.

---
*Implementation will be carried out after user approval of the plan.*
