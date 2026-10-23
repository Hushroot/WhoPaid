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
  groupMembers = people;
  currentGroupName = groupName;

  displayGroup();

  expenses = [];
  expenseList.replaceChildren();
  expenseForm.reset();
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
  expenses.push(expense);
  updateTotal();
  renderExpenses();
  expenseForm.reset();
});
function updateTotal() {
  let total = 0;
  expenses.forEach(function (expense) {
    total = total + expense.amount;
  });
  document.getElementById("total-spent").textContent = (total / 100).toFixed(2);
  updateBalances();
  saveData();
}

function updateBalances() {
  const list = document.getElementById("balances-list");
  list.replaceChildren();

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
  expenses.forEach(function (expense) {
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
      (expense.category || "Other") +
      " | paid by " +
      expense.paidBy;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function () {
      const index = expenses.indexOf(expense);

      if (index !== -1) {
        expenses.splice(index, 1);
      }
      renderExpenses();
      updateTotal();
    });
    item.appendChild(deleteButton);
    expenseList.appendChild(item);
  });
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

function loadData() {
  try {
    const saved = localStorage.getItem("whopaid");
    if (saved === null) {
      return;
    }
    const data = JSON.parse(saved);

    if (
      !data ||
      typeof data.groupName !== "string" ||
      !Array.isArray(data.people) ||
      data.people.length < 2 ||
      !data.people.every(function (person) {
        return typeof person === "string" && person.trim() !== "";
      }) ||
      new Set(data.people).size !== data.people.length ||
      !Array.isArray(data.expenses)
    ) {
      throw new Error("Invalid saved group");
    }
    const validExpenses = data.expenses.every(function (expense) {
      return (
        expense &&
        typeof expense.name === "string" &&
        Number.isSafeInteger(expense.amount) &&
        expense.amount > 0 &&
        data.people.includes(expense.paidBy)
      );
    });
    if (!validExpenses) {
      throw new Error("Invalid saved expenses");
    }
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
document
  .getElementById("category-filter")
  .addEventListener("change", renderExpenses);

document
  .getElementById("expense-search")
  .addEventListener("input", renderExpenses);
loadData();
