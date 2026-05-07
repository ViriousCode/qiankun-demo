## ADDED Requirements

### Requirement: Schema extensions MUST remain backward compatible
The system SHALL extend `FormFieldSchema` only with optional fields and MUST preserve rendering and saving for schemas that do not include the new fields.

#### Scenario: Legacy schema loads unchanged
- **WHEN** a form definition contains a legacy `schema` array without new extension fields
- **THEN** the designer and runtime renderer SHALL load and render the form without requiring migrations

### Requirement: Unknown field types MUST fail gracefully
The system SHALL treat unknown `type` values as non-fatal in the designer (show a warning + allow removal) and MUST NOT crash the runtime renderer.

#### Scenario: Unknown type shows warning in designer
- **WHEN** a schema contains a field with an unrecognized `type`
- **THEN** the designer SHALL display a visible warning for that field and allow the operator to delete or change the type

### Requirement: Extension fields MUST have documented defaults
The system SHALL define deterministic defaults for all new extension fields such that omitting them is equivalent to “disabled / not configured”.

#### Scenario: Missing extension config behaves as disabled
- **WHEN** a field omits optional extension configuration blocks
- **THEN** the runtime behavior SHALL match the legacy behavior prior to the extension (no remote fetch, no extra linkage rules)
