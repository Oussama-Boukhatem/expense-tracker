import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

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

  const filteredExpenses = expenses.filter(
    (exp) => exp.category === selectedCategory || selectedCategory === "All"
  );

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

app.post("/add-expense", (req, res) => {
  const { amount, category, description, date } = req.body;

  expenses.push({ amount, category, description, date });
  console.log(expenses);
  res.redirect("/");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
