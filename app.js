import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

let expenses = [];

app.get("/", (req, res) => {
  const formattedExpenses = expenses.map((exp) => {
    return {
      ...exp,
      formattedDate: new Date(exp.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  });

  const totalExpenses = expenses.map((exp) => Number(exp.amount));
  const sum = totalExpenses.reduce((acc, val) => acc + val, 0);

  res.render("index", {
    expenses: formattedExpenses,
    total: sum,
    selectedCategory: "All",
  });
});

app.get("/add-expense", (req, res) => {
  res.render("add-expense");
});

app.get("/filter", (req, res) => {
  const selectedCategory = req.query.category || "All";

  const filteredExpenses = expenses
    .filter(
      (exp) => exp.category === selectedCategory || selectedCategory === "All"
    )
    .map((exp) => ({
      ...exp,
      formattedDate: new Date(exp.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));

  const categoryTotal = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  res.render("index", {
    expenses: filteredExpenses,
    total: categoryTotal,
    selectedCategory: selectedCategory,
  });
});

app.get("/edit-expense/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const expense = expenses.find((exp) => exp.id === id);

  if (!expense) {
    return res.status(404).send("Expense not found");
  }

  res.render("edit-expense", { expense });
});

app.post("/add-expense", (req, res) => {
  const { amount, category, description, date } = req.body;

  const newExpense = {
    id: Date.now(), // Using timestamp as a simple unique ID
    amount,
    category,
    description,
    date,
  };

  expenses.push(newExpense);
  console.log(expenses);
  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  // Extract the ID from the URL parameter
  const id = parseInt(req.params.id); // Convert the id to an integer

  // Filter out the expense with the given ID
  const initialLength = expenses.length;
  expenses = expenses.filter((expense) => expense.id !== id);

  // If the expense was removed (length decreased), redirect back to the index
  if (expenses.length < initialLength) {
    res.redirect("/"); // Redirect to the home page or wherever you'd like
  } else {
    // If the expense wasn't found, send a 404 error
    res.status(404).send({ message: "Expense not found" });
  }
});

app.post("/update-expense/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { amount, category, description, date } = req.body;

  // Find the expense index
  const expenseIndex = expenses.findIndex((exp) => exp.id === id);

  if (expenseIndex === -1) {
    return res.status(404).send("Expense not found");
  }

  // Update the expense with new values
  expenses[expenseIndex] = {
    ...expenses[expenseIndex], // Keep the id and any other properties
    amount,
    category,
    description,
    date,
  };

  res.redirect("/");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
