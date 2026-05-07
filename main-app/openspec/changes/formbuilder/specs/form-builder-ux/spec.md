## ADDED Requirements

### Requirement: Designer can quickly find and focus a field in the canvas
The system SHALL provide a field search and “jump to selection” capability in the form designer so operators can locate fields by label, field name, or component type when the schema is large.

#### Scenario: Jump to field from search
- **WHEN** the operator enters a search keyword in the designer search box
- **THEN** the system SHALL highlight matching fields in the canvas list and allow selecting a match to set the active field selection

### Requirement: Designer supports grouping and collapsing sections in the canvas
The system SHALL allow operators to organize fields into collapsible groups in the canvas view to reduce cognitive load for large forms.

#### Scenario: Collapse a group hides its children in canvas
- **WHEN** the operator collapses a group in the canvas
- **THEN** the system SHALL hide the group’s child fields from the canvas list while preserving their order in the underlying schema

### Requirement: Designer provides batch operations for common edits
The system SHALL support batch operations on multiple selected fields for at least: delete, enable/disable, and span adjustment.

#### Scenario: Batch delete removes multiple fields
- **WHEN** the operator selects multiple fields and chooses batch delete
- **THEN** the system SHALL remove all selected fields from the schema and clear selection if the active field was removed

### Requirement: Designer surfaces schema quality issues before save
The system SHALL run a non-blocking quality check that flags common problems (duplicate `field`, empty `label`, broken JSON in advanced editors) and blocks save when hard errors exist.

#### Scenario: Save blocked on duplicate field names
- **WHEN** the operator attempts to save a schema containing duplicate `field` values
- **THEN** the system SHALL prevent save and show an actionable error listing the conflicting fields
