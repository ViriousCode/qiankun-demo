## ADDED Requirements

### Requirement: Operators can export a form definition as JSON
The system SHALL allow exporting a form definition (including `schema`) to a downloadable JSON file from the form builder UI.

#### Scenario: Export downloads JSON
- **WHEN** the operator chooses export on an existing form definition
- **THEN** the browser SHALL download a JSON file containing at least `name`, `code`, `status`, and `schema`

### Requirement: Operators can import a JSON schema into a form definition
The system SHALL allow importing JSON to create or overwrite a draft form definition subject to validation and explicit confirmation when overwriting.

#### Scenario: Import validates before applying
- **WHEN** the operator imports JSON
- **THEN** the system SHALL validate the payload against schema rules and SHALL refuse to apply invalid payloads with actionable errors

### Requirement: Form definitions support draft vs published workflow
The system SHALL support a draft/published lifecycle for form definitions such that publishing creates an immutable published snapshot while editing continues on draft.

#### Scenario: Published snapshot remains stable while draft edits continue
- **WHEN** a form is published and subsequent edits are saved as draft
- **THEN** runtime consumers bound to the published snapshot SHALL continue to see the published schema until republish occurs

### Requirement: Operators can diff draft vs published schema
The system SHALL provide a basic structural diff view between draft and published schemas at the field level (`field` as key) including added/removed/changed fields.

#### Scenario: Diff highlights changed field labels
- **WHEN** a field exists in both draft and published schemas but `label` differs
- **THEN** the diff view SHALL classify the field as changed and show before/after values
