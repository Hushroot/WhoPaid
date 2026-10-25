let editingExpense = null;
let currentGroupName = "";
let expenses = [];
let groupMembers = [];
const form = document.getElementById("group-form");
const groupInfo = document.getElementById("group-info");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const groupName = document.getElementById("group-name").value.trim();
  const peopleInput = document.getElementById("people").value;
  const people = peopleInput
    .split(",")
    .map(function (name) {
      return name.trim();
    })
    .filter(function (name) {
      return name !== "";
    });
  if (groupName === "" || people.length < 2) {
    alert("Enter a group name and at least two people.");
    return;
  }
  if (new Set(people).size !== people.length) {
    alert("Use a different name for each person.");
    return;
  }

  if (
    expenses.length > 0 &&
    !confirm(
      "Creating a group will replace your current group and expenses. Continue?",
    )
  ) {
    return;
  }
  groupMembers = people;
  currentGroupName = groupName;

  displayGroup();

  expenses = [];
  renderExpenses();
  resetExpenseForm();
  updateTotal();
});

const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("expense-name").value.trim();
  const amountInput = document.getElementById("expense-amount").value;
  const paidBy = document.getElementById("paid-by").value;
  const amount = Math.round(Number(amountInput) * 100);
  const category = document.getElementById("expense-category").value;

  if (name === "" || !Number.isSafeInteger(amount) || amount <= 0) {
    alert("Enter a description and a valid amount.");
    return;
  }
  const expense = {
    name: name,
    amount: amount,
    paidBy: paidBy,
    category: category,
  };
  if (editingExpense === null) {
    expenses.push(expense);
  } else {
    editingExpense.name = name;
    editingExpense.amount = amount;
    editingExpense.paidBy = paidBy;
    editingExpense.category = category;
  }
  updateTotal();
  renderExpenses();
  resetExpenseForm();
});
function updateTotal() {
  let total = 0;
  expenses.forEach(function (expense) {
    total = total + expense.amount;
  });
  document.getElementById("total-spent").textContent = (total / 100).toFixed(2);
  updateBalances();
  updateCategoryTotals();
  saveData();
}

function updateBalances() {
  const list = document.getElementById("balances-list");
  list.replaceChildren();
  const balances = [];

  groupMembers.forEach(function (person, index) {
    let balance = 0;

    expenses.forEach(function (expense) {
      if (expense.paidBy === person) {
        balance = balance + expense.amount;
      }
      let share = Math.floor(expense.amount / groupMembers.length);
      const extraCents = expense.amount % groupMembers.length;

      if (index < extraCents) {
        share = share + 1;
      }
      balance = balance - share;
    });

    balances.push({
      name: person,
      balance: balance,
    })
    const item = document.createElement("li");
    const amount = (Math.abs(balance) / 100).toFixed(2);

    if (balance > 0) {
      item.textContent = person + " should receive " + amount;
    } else if (balance < 0) {
      item.textContent = person + " owes " + amount;
    } else {
      item.textContent = person + " is settled";
    }
    list.appendChild(item);
  });
  updatePayments(balances);
}

function saveData() {
  const data = {
    groupName: currentGroupName,
    people: groupMembers,
    expenses: expenses,
  };
  try {
    localStorage.setItem("whopaid", JSON.stringify(data));
  } catch (error) {
    alert("Could not save your data in this browser.");
  }
}
function renderExpenses() {
  expenseList.replaceChildren();
  const selectedCategory = document.getElementById("category-filter").value;
  const searchText = document
    .getElementById("expense-search")
    .value.trim()
    .toLowerCase();

  const sortBy = document.getElementById("expense-sort").value;
  const sortedExpenses = expenses.slice();

  if (sortBy === "highest") {
    sortedExpenses.sort(function (a, b) {
      return b.amount - a.amount;
    });
  } else if (sortBy === "lowest") {
    sortedExpenses.sort(function (a, b) {
      return a.amount - b.amount;
    });
  }
  sortedExpenses.forEach(function (expense) {
    const category = expense.category || "Other";

    if (selectedCategory !== "All" && category !== selectedCategory) {
      return;
    }

    const searchableText = (expense.name + " " + expense.paidBy).toLowerCase();

    if (!searchableText.includes(searchText)) {
      return;
    }

    const item = document.createElement("li");

    item.textContent =
      expense.name +
      " - " +
      (expense.amount / 100).toFixed(2) +
      " | " +
      category +
      " | paid by " +
      expense.paidBy;

    const deleteButton = document.createElement("button");
    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "edit-button";

    editButton.addEventListener("click", function () {
      editingExpense = expense;
      document.getElementById("expense-name").value = expense.name;
      document.getElementById("expense-amount").value = (
        expense.amount / 100
      ).toFixed(2);
      document.getElementById("paid-by").value = expense.paidBy;
      document.getElementById("expense-category").value =
        expense.category || "Other";

      expenseForm.querySelector('button[type="submit"]').textContent =
        "Save changes";
      document.getElementById("cancel-edit").hidden = false;
      document.getElementById("expense-name").focus();
    });
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function () {
      const index = expenses.indexOf(expense);

      if (index !== -1) {
        expenses.splice(index, 1);
      }
      if (editingExpense === expense) {
        resetExpenseForm();
      }
      renderExpenses();
      updateTotal();
    });
    item.appendChild(editButton);
    item.appendChild(deleteButton);
    expenseList.appendChild(item);
  });

  const message = document.getElementById("expenses-message");

  if (expenses.length === 0) {
    message.textContent = "No expenses yet.";
  } else if (expenseList.children.length === 0) {
    message.textContent = "No matching expenses.";
  } else {
    message.textContent = "";
  }
}
function displayGroup() {
  groupInfo.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = currentGroupName;
  groupInfo.appendChild(heading);

  const names = document.createElement("p");
  names.textContent = groupMembers.join(", ");
  groupInfo.appendChild(names);

  const paidBy = document.getElementById("paid-by");
  paidBy.replaceChildren();

  groupMembers.forEach(function (person) {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    paidBy.appendChild(option);
  });
  document.getElementById("expenses-section").hidden = false;
}

function validateGroupData(data) {
  if (
    !data ||
    typeof data.groupName !== "string" ||
    data.groupName.trim() === "" ||
    !Array.isArray(data.people) ||
    data.people.length < 2 ||
    !data.people.every(function (person) {
      return typeof person === "string" && person.trim() !== "";
    }) ||
    new Set(data.people).size !== data.people.length ||
    !Array.isArray(data.expenses)
  ) {
    throw new Error("This file doesn't contain a group");
  }
  const validExpenses = data.expenses.every(function (expense) {
    return (
      expense &&
      typeof expense.name === "string" &&
      expense.name.trim() !== "" &&
      Number.isSafeInteger(expense.amount) &&
      expense.amount > 0 &&
      data.people.includes(expense.paidBy)
    );
  });
  if (!validExpenses) {
    throw new Error("This backup contains invalid expenses");
  }
}

function loadData() {
  try {
    const saved = localStorage.getItem("whopaid");
    if (saved === null) {
      return;
    }
    const data = JSON.parse(saved);

    validateGroupData(data);

    currentGroupName = data.groupName;
    groupMembers = data.people;
    expenses = data.expenses;

    document.getElementById("group-name").value = currentGroupName;
    document.getElementById("people").value = groupMembers.join(", ");

    displayGroup();
    renderExpenses();
    updateTotal();
  } catch (error) {
    alert("Could not load your saved data.");
  }
}

function resetExpenseForm() {
  editingExpense = null;
  expenseForm.reset();

  expenseForm.querySelector('button[type="submit"]').textContent =
    "Add expense";

  document.getElementById("cancel-edit").hidden = true;
}
document
  .getElementById("category-filter")
  .addEventListener("change", renderExpenses);

document
  .getElementById("expense-search")
  .addEventListener("input", renderExpenses);

document
  .getElementById("expense-sort")
  .addEventListener("change", renderExpenses);

document
  .getElementById("cancel-edit")
  .addEventListener("click", resetExpenseForm);

function downloadBackup() {
  const data = {
    groupName: currentGroupName,
    people: groupMembers,
    expenses: expenses,
  };
  const file = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = "whopaid-backup.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);
}

document
  .getElementById("download-backup")
  .addEventListener("click", downloadBackup);

async function restoreBackup(event) {
  const input = event.target;
  const file = input.files[0];
  const message = document.getElementById("backup-message");

  if (!file) {
    return;
  }
  message.textContent = "";

  try {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Choose a backup smaller than 10MB");
    }
    const text = await file.text();
    const data = JSON.parse(text);

    validateGroupData(data);

    if (!confirm("Replace your current group with this backup?")) {
      message.textContent = "Restore cancelled";
      return;
    }
    currentGroupName = data.groupName;
    groupMembers = data.people;
    expenses = data.expenses;

    document.getElementById("group-name").value = currentGroupName;
    document.getElementById("people").value = groupMembers.join(", ");
    document.getElementById("expense-search").value = "";
    document.getElementById("category-filter").value = "All";
    document.getElementById("expense-sort").value = "added";

    displayGroup();
    resetExpenseForm();
    renderExpenses();
    updateTotal();

    message.textContent = "Backup restored";
  } catch (error) {
    if (error instanceof SyntaxError) {
      message.textContent = "This file is not working";
    } else {
      message.textContent = error.message;
    }
  } finally {
    input.value = "";
  }
}

function updateCategoryTotals() {
  const list = document.getElementById("category-totals");
  const categories = ["Food", "Transport", "Stay", "Shopping", "Other"];

  list.replaceChildren();
  categories.forEach(function (category) {
    let total = 0;

    expenses.forEach(function (expense) {
      const expenseCategory = categories.includes(expense.category)
        ? expense.category
        : "Other";
      
      if (expenseCategory === category) {
        total = total + expense.amount;
      }
    });
    const item = document.createElement("li");
    item.textContent = category + ": " + (total / 100).toFixed(2);
    list.appendChild(item);
  });
}

document
  .getElementById("restore-backup")
  .addEventListener("change", restoreBackup);


function updatePayments(balances) {
  const list = document.getElementById("payments-list");
  list.replaceChildren();

  const receivers = balances.filter(function (person) {
    return person.balance > 0;
  });
  const payers = balances.filter(function (person) {
    return person.balance < 0;
  });

  let receiverIndex = 0;

  payers.forEach(function (payer) {
    let owed = -payer.balance;

    while (owed > 0 && receiverIndex < receivers.length) {
      const receiver = receivers[receiverIndex];
      const amount = Math.min(owed, receiver.balance);
      const item = document.createElement("li");

      item.textContent =
        payer.name +
        " pays " +
        receiver.name +
        " " +
        (amount / 100).toFixed(2);
      list.appendChild(item);

      owed = owed - amount;
      receiver.balance = receiver.balance - amount;

      if (receiver.balance === 0) {
        receiverIndex = receiverIndex + 1;
      }
    }
  });
  if (list.children.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Everyone is settled.";
    list.appendChild(item);
  }
}
loadData();
