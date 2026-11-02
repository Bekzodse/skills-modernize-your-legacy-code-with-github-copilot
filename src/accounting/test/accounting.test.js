cat > test/accounting.test.js <<'EOF'
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const app = path.join(__dirname, "..", "index.js");

function run(input) {
  return spawnSync(process.execPath, [app], {
    input,
    encoding: "utf8",
  }).stdout;
}

test("view balance displays the initial balance", () => {
  expect(run("1\n4\n")).toContain("Current balance: 1000.00");
});

test("credit increases the balance", () => {
  const output = run("2\n100.00\n1\n4\n");

  expect(output).toContain("Amount credited. New balance: 1100.00");
  expect(output).toContain("Current balance: 1100.00");
});

test("debit decreases the balance when sufficient funds exist", () => {
  const output = run("3\n100.00\n1\n4\n");

  expect(output).toContain("Amount debited. New balance: 900.00");
  expect(output).toContain("Current balance: 900.00");
});

test("debit is rejected when funds are insufficient", () => {
  const output = run("3\n1100.00\n1\n4\n");

  expect(output).toContain("Insufficient funds for this debit.");
  expect(output).toContain("Current balance: 1000.00");
});

test("invalid menu choices are rejected", () => {
  expect(run("9\n4\n")).toContain("Invalid choice, please select 1-4.");
});

test("exit terminates the application", () => {
  expect(run("4\n")).toContain("Exiting the program. Goodbye!");
});
EOF