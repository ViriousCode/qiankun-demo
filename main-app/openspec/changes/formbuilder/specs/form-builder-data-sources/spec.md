## ADDED Requirements

### Requirement: Option fields MAY declare a remote data source
The system SHALL allow `select`, `radio`, `checkbox`, and `autocomplete` fields to declare a remote data source configuration that resolves to `options` at runtime.

#### Scenario: Remote options populate select
- **WHEN** a select field declares a valid remote data source and the request succeeds
- **THEN** the runtime renderer SHALL populate the field’s options and render the select with those options

### Requirement: Remote data sources MUST handle loading and failure states
The system SHALL show a loading state while fetching remote options and MUST show a recoverable error state when the fetch fails without crashing the form.

#### Scenario: Failed fetch shows error and allows retry
- **WHEN** remote option fetching fails due to network or HTTP error
- **THEN** the UI SHALL display an error indicator for that field and provide a retry path without losing other form edits

### Requirement: Remote data sources MUST support caching and invalidation
The system SHALL support a configurable cache TTL per data source and MUST invalidate/refetch when declared dependencies change.

#### Scenario: Dependency change refetches options
- **WHEN** a controlling field value changes and the data source declares a dependency on that field
- **THEN** the system SHALL invalidate cached options and refetch according to the configured policy
