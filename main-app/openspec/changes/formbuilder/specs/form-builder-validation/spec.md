## ADDED Requirements

### Requirement: Runtime validation MUST support cross-field rules
The system SHALL support declarative cross-field validation rules in the schema and evaluate them during form validation in addition to per-field Element Plus rules.

#### Scenario: Cross-field rule fails submission
- **WHEN** a cross-field rule is configured and the model violates the rule
- **THEN** the runtime renderer SHALL surface a validation error and prevent successful `validate()` completion until resolved

### Requirement: Required rules MUST respect visibility and required-when linkage
The system SHALL allow a field’s `required` state to depend on model conditions and MUST ensure hidden fields do not block submission with stale required errors.

#### Scenario: Hidden required field does not block submit
- **WHEN** a field becomes hidden due to `visibleWhen` conditions
- **THEN** the system SHALL clear validation errors for that field and SHALL NOT require it for successful validation while hidden

### Requirement: Date/time fields MUST support min/max constraints when configured
The system SHALL support min/max constraints for `date`, `datetime`, and `time` fields when specified in the schema, enforced at validation time.

#### Scenario: Date outside allowed range fails validation
- **WHEN** a date field has configured min/max and the selected value is outside the range
- **THEN** validation SHALL fail with a clear error message
