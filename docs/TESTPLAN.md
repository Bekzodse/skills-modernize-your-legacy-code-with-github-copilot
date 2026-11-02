# COBOL Student Account System Test Plan

## Purpose and scope

This plan validates the current behavior of the COBOL account-management
application before it is transformed into a Node.js application. It covers
the menu controller in `main.cob`, transaction rules in `operations.cob`, and
balance storage behavior in `data.cob`.

Each test starts a new application run unless the preconditions say otherwise.
The application has one in-memory account, initialized to `1,000.00`; it does
not persist data after termination.

## Test cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Application starts with the default balance | Compile the three COBOL programs successfully. | 1. Start the application.<br>2. Select `1` (View Balance). | The application displays `Current balance: 001000.00`. |  |  |  |
| TC-002 | Main menu displays all supported options | Application is running. | 1. Observe the first menu.<br>2. Select an option.<br>3. Observe the next menu. | The menu displays View Balance, Credit Account, Debit Account, and Exit, and is redisplayed after every non-exit action. |  |  |  |
| TC-003 | View the current balance | Application is running with balance `1,000.00`. | 1. Select `1`. | `Operations` performs a balance read and displays the current balance without changing it. |  |  |  |
| TC-004 | Credit an account with a positive amount | Application is running with balance `1,000.00`. | 1. Select `2`.<br>2. Enter `50.00`.<br>3. Select `1`. | The application displays `Amount credited. New balance: 001050.00`; a subsequent view also shows `001050.00`. |  |  |  |
| TC-005 | Credit an account with a decimal amount | Application is running with balance `1,000.00`. | 1. Select `2`.<br>2. Enter `12.34`.<br>3. Select `1`. | The balance increases by exactly `12.34` and displays `001012.34`. |  |  |  |
| TC-006 | Debit an amount less than the current balance | Application is running with balance `1,000.00`. | 1. Select `3`.<br>2. Enter `25.00`.<br>3. Select `1`. | The application displays `Amount debited. New balance: 000975.00`; a subsequent view shows `000975.00`. |  |  |  |
| TC-007 | Debit an amount equal to the current balance | Application is running with balance `1,000.00`. | 1. Select `3`.<br>2. Enter `1000.00`.<br>3. Select `1`. | The debit is accepted because the balance is greater than or equal to the amount. The new balance is `000000.00`. |  |  |  |
| TC-008 | Reject a debit greater than the current balance | Application is running with balance `1,000.00`. | 1. Select `3`.<br>2. Enter `1000.01`.<br>3. Select `1`. | The application displays `Insufficient funds for this debit.` and the balance remains `001000.00`. |  |  |  |
| TC-009 | Preserve the balance after a rejected debit | Application is running with balance `1,000.00`. | 1. Attempt a debit of `1500.00`.<br>2. Credit `25.00`.<br>3. View the balance. | The rejected debit does not write a new value. The credit is applied to the original balance, resulting in `001025.00`. |  |  |  |
| TC-010 | Apply multiple transactions in sequence | Application is running with balance `1,000.00`. | 1. Credit `100.00`.<br>2. Debit `40.50`.<br>3. View the balance. | Each successful transaction is based on the latest stored balance. The final balance is `001059.50`. |  |  |  |
| TC-011 | Reject an invalid menu choice | Application is running. | 1. Enter a value outside `1`-`4`, such as `5`.<br>2. View the menu. | The application displays `Invalid choice, please select 1-4.` and continues running without changing the balance. |  |  |  |
| TC-012 | Exit the application | Application is running. | 1. Select `4`. | The menu loop ends and the application displays `Exiting the program. Goodbye!`. |  |  |  |
| TC-013 | Exit without performing a transaction | Application is running with balance `1,000.00`. | 1. Select `4` immediately.<br>2. Confirm the process has terminated. | No operation is sent to `Operations`; the application exits normally and does not display a transaction result. |  |  |  |
| TC-014 | Verify balance is not persisted between runs | Complete TC-004 and exit after reaching a balance other than `1,000.00`. | 1. Start the application again.<br>2. Select `1`. | The balance is reset to `001000.00`, confirming storage is in working memory rather than persistent storage. |  |  |  |
| TC-015 | Credit a zero amount | Application is running with balance `1,000.00`. | 1. Select `2`.<br>2. Enter `0.00`.<br>3. View the balance. | Document the observed behavior. Based on the current code, the credit operation completes and the balance remains unchanged at `001000.00`. |  |  |  |
| TC-016 | Debit a zero amount | Application is running with balance `1,000.00`. | 1. Select `3`.<br>2. Enter `0.00`.<br>3. View the balance. | Document the observed behavior. Based on the current code, the debit passes the sufficient-funds check and the balance remains `001000.00`. |  |  |  |
| TC-017 | Enter a negative transaction amount | Application is running with balance `1,000.00`. | 1. Select Credit or Debit.<br>2. Enter a negative value, such as `-10.00`.<br>3. Record the output and final balance. | Document the compiler/runtime behavior. The current source has no explicit negative-amount validation; this is a known gap for the Node.js implementation to define. |  |  |  |
| TC-018 | Enter an amount at the numeric field limit | Application is running with balance `1,000.00`. | 1. Select Credit.<br>2. Enter the largest supported value for `PIC 9(6)V99`.<br>3. Record the output and final balance. | Document whether the input is accepted, rejected, or causes numeric overflow. The Node.js implementation must define an equivalent range policy. |  |  |  |
| TC-019 | Enter malformed or non-numeric transaction input | Application is running. | 1. Select Credit or Debit.<br>2. Enter non-numeric input, such as `ABC`.<br>3. Record the output and whether the menu remains usable. | Document the observed COBOL runtime behavior. The current source does not provide an explicit validation or user-facing error path for malformed amounts. |  |  |  |
| TC-020 | Verify operation dispatch does not alter the balance for an unsupported operation | A component-level harness can invoke `Operations` directly. | 1. Call `Operations` with an unsupported six-character code.<br>2. Read the balance through `DataProgram`. | No transaction branch executes and the stored balance remains unchanged. This validates the default behavior of the conditional operation dispatch. |  |  |  |
| TC-021 | Verify data read returns the stored balance | A component-level harness can invoke `DataProgram`. | 1. Initialize the data module.<br>2. Call `DataProgram` with `READ` and a balance field.<br>3. Inspect the returned field. | The caller’s balance field receives the current stored balance. |  |  |  |
| TC-022 | Verify data write updates the stored balance | A component-level harness can invoke `DataProgram`. | 1. Set a caller balance to `1234.56`.<br>2. Call `DataProgram` with `WRITE`.<br>3. Call it again with `READ`. | The subsequent read returns `1234.56`, confirming that the write updates in-memory storage. |  |  |  |

## Coverage and execution notes

- **Unit/component coverage:** TC-020 through TC-022 target the COBOL program
  boundaries and are candidates for isolated tests in the future Node.js
  implementation.
- **Integration coverage:** TC-001 through TC-019 exercise the complete
  interactive flow from `MainProgram` through `Operations` and `DataProgram`.
- **Regression priority:** TC-001, TC-003, TC-004, TC-006, TC-007, TC-008,
  TC-009, TC-010, TC-011, and TC-012 are the minimum regression set for every
  implementation change.
- Record observed output in **Actual Result**, mark **Status (Pass/Fail)** only
  after execution, and use **Comments** for environment details, deviations,
  or stakeholder decisions.
- TC-015 through TC-019 intentionally expose unspecified input-validation
  behavior. They should be reviewed with business stakeholders before the
  Node.js migration locks in new validation rules.
