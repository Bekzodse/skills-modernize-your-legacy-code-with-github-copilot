'use strict';

const readline = require('node:readline');

const dataProgram = (() => {
  let storageBalance = 1000.00;

  return {
    call(operation, balance) {
      if (operation === 'READ') return storageBalance;
      if (operation === 'WRITE') storageBalance = balance;
      return balance;
    }
  };
})();

const formatBalance = balance => balance.toFixed(2).padStart(9, '0');

async function operations(operation, rl) {
  if (operation === 'TOTAL ') {
    console.log(`Current balance: ${formatBalance(dataProgram.call('READ'))}`);
    return;
  }

  if (operation !== 'CREDIT' && operation !== 'DEBIT ') return;

  const input = await rl.question(
    operation === 'CREDIT' ? 'Enter credit amount: ' : 'Enter debit amount: '
  );
  const amount = Number(input);

  if (!Number.isFinite(amount) || amount < 0 || amount > 999999.99) {
    console.log('Invalid amount.');
    return;
  }

  let balance = dataProgram.call('READ');

  if (operation === 'DEBIT ' && balance < amount) {
    console.log('Insufficient funds for this debit.');
    return;
  }

  balance = operation === 'CREDIT' ? balance + amount : balance - amount;
  dataProgram.call('WRITE', balance);

  console.log(
    operation === 'CREDIT'
      ? `Amount credited. New balance: ${formatBalance(balance)}`
      : `Amount debited. New balance: ${formatBalance(balance)}`
  );
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let running = true;

  while (running) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const choice = await rl.question('Enter your choice (1-4): ');

    switch (choice.trim()) {
      case '1':
        await operations('TOTAL ', rl);
        break;
      case '2':
        await operations('CREDIT', rl);
        break;
      case '3':
        await operations('DEBIT ', rl);
        break;
      case '4':
        running = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  console.log('Exiting the program. Goodbye!');
  rl.close();
}

main();
