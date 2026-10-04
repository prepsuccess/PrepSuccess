import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const DATA_TASKS: CatalogueTask[] = [
  // DBMS
  task(
    "dbms",
    "Write a safe bank transfer transaction",
    "EASY",
    `
A table accounts(id, holder, balance) stores bank balances. Write a SQL transaction that moves Rs 2,000 from account 101 to account 202, and rolls back if account 101 does not have enough money.

Then, in SQL comments, explain each letter of ACID using this transfer as the example (one line each).
`,
    [
      c("txn", "Wraps both updates in BEGIN/START TRANSACTION and COMMIT", 3),
      c("check", "Checks the balance and uses ROLLBACK when funds are short", 2),
      c("acid", "Explains Atomicity, Consistency, Isolation and Durability correctly", 4),
      c("syntax", "Valid SQL", 1),
    ],
    `
CREATE TABLE accounts (
  id INT PRIMARY KEY,
  holder VARCHAR(50),
  balance DECIMAL(10, 2) CHECK (balance >= 0)
);

-- Your transaction here


-- A:
-- C:
-- I:
-- D:
`,
  ),
  task(
    "dbms",
    "Identify keys in a relation",
    "EASY",
    `
Consider these tables:

\`\`\`
Student(roll_no, email, aadhaar_no, name, branch)
Course(course_code, title, credits)
Registration(roll_no, course_code, semester, grade)
\`\`\`

roll_no, email and aadhaar_no are each unique per student. A student can take a course again in a later semester. Answer in SQL comments:

- List the candidate keys of Student and pick a primary key, with a reason.
- What is the primary key of Registration? Explain why roll_no + course_code alone is not enough.
- Name the foreign keys and what they reference.
- Define super key, candidate key and alternate key in one line each.
`,
    [
      c(
        "candidate",
        "Lists every candidate key with a sensible primary key choice",
        3,
        "Lists roll_no, email and aadhaar_no as candidate keys with a sensible PK choice",
      ),
      c(
        "composite",
        "Correct primary key for Registration, with the reason",
        3,
        "Registration PK is (roll_no, course_code, semester) with the repeat-course reason",
      ),
      c("fk", "Identifies both foreign keys correctly", 2),
      c("defs", "Correct definitions of super, candidate and alternate keys", 2),
    ],
    `
-- Student candidate keys:
-- Primary key and reason:

-- Registration primary key:

-- Foreign keys:

-- Definitions:
`,
  ),
  task(
    "dbms",
    "Turn an ER model into tables",
    "MEDIUM",
    `
Design the database for a college library:

- A member (student or staff) has an id, name and phone.
- A book has an ISBN, title and publisher; a book can have many authors and an author can write many books.
- The library owns many copies of each book; each copy has its own copy_id and shelf.
- A member borrows a copy on a date and returns it later (return date may be empty). A copy can be borrowed many times over the years.

First list the entities, relationships and their cardinalities in SQL comments. Then write CREATE TABLE statements with primary keys, foreign keys and sensible NOT NULL constraints.
`,
    [
      c("er", "Correct entities, relationships and cardinalities (1:N, M:N)", 3),
      c("mn", "Book-Author M:N handled with a junction table", 2),
      c("loans", "Loan table links member and copy with borrow and nullable return dates", 2),
      c("keys", "Correct primary keys, foreign keys and constraints", 2),
      c("syntax", "Valid CREATE TABLE SQL", 1),
    ],
    `
-- Entities:
-- Relationships and cardinalities:

CREATE TABLE member (
  -- your columns here
);
`,
  ),
  task(
    "dbms",
    "Analyse a schedule for serializability",
    "HARD",
    `
Two transactions run concurrently on data items A and B:

\`\`\`
T1: R(A) W(A) R(B) W(B)
T2: R(A) W(A) R(B) W(B)

Schedule S:
R1(A) W1(A) R2(A) W2(A) R2(B) W2(B) R1(B) W1(B)
\`\`\`

Answer in SQL comments:

- List all conflicting operation pairs in S and draw the precedence graph (as edges like T1 -> T2).
- Is S conflict serializable? Justify.
- Show how strict two-phase locking (2PL) would change the execution of S, and explain how a deadlock could arise under 2PL.
- Name the four SQL isolation levels and which of dirty read, non-repeatable read and phantom read each one allows.
`,
    [
      c("conflicts", "Lists the conflicting pairs on A and B correctly", 2),
      c(
        "graph",
        "Correct precedence graph",
        2,
        "Precedence graph has T1 -> T2 (on A) and T2 -> T1 (on B)",
      ),
      c(
        "verdict",
        "Correct verdict on conflict serializability, with the reason",
        2,
        "Concludes not conflict serializable because of the cycle",
      ),
      c("locking", "Correct strict 2PL behaviour and a valid deadlock example", 2),
      c("isolation", "Four isolation levels with the correct anomalies for each", 2),
    ],
    `
-- Conflicting pairs:

-- Precedence graph edges:

-- Conflict serializable? Why:

-- Under strict 2PL:

-- Deadlock example:

-- Isolation levels:
`,
  ),

  // SQL
  task(
    "sql",
    "Filter and sort student records",
    "EASY",
    `
Using the students table below, write one query for each:

- All students from the CSE branch with CGPA above 8, highest CGPA first.
- Names of students whose name starts with "A" and who live in Pune or Mumbai.
- The number of students in each branch, only for branches with more than 20 students.
- The top 5 students by CGPA (ties may be in any order).
`,
    [
      c("where", "Correct WHERE with AND and ORDER BY ... DESC", 2),
      c("like", "Uses LIKE 'A%' with IN (or OR) for the cities", 2),
      c("having", "GROUP BY branch with COUNT and HAVING > 20", 4),
      c("limit", "LIMIT 5 (or TOP / FETCH FIRST) with ORDER BY", 2),
    ],
    `
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  branch VARCHAR(10),
  cgpa DECIMAL(3, 2),
  city VARCHAR(30)
);

-- 1.

-- 2.

-- 3.

-- 4.
`,
  ),
  task(
    "sql",
    "Find customers with no orders",
    "EASY",
    `
Given customers(id, name, city) and orders(id, customer_id, amount, order_date), write queries for:

- Customers who have never placed an order.
- Every customer with their number of orders and total amount spent, showing 0 for customers with no orders.
- Explain in a comment why an INNER JOIN would give the wrong answer for the second query.
`,
    [
      c("anti", "LEFT JOIN ... IS NULL or NOT EXISTS for customers without orders", 3),
      c("left", "LEFT JOIN with GROUP BY for per-customer counts", 3),
      c("zero", "COUNT(o.id) and COALESCE(SUM, 0) so zeros show correctly", 2),
      c("explain", "Explains that INNER JOIN drops customers without orders", 2),
    ],
    `
CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(50), city VARCHAR(30));
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  amount DECIMAL(10, 2),
  order_date DATE
);

-- 1.

-- 2.

-- 3. Why not INNER JOIN?
`,
  ),
  task(
    "sql",
    "Second-highest salary and duplicates",
    "MEDIUM",
    `
These are classic interview questions. Using employees(id, name, email, salary), write queries for:

- The second-highest distinct salary (return NULL if there is none).
- The Nth highest salary for N = 3, using a window function (DENSE_RANK).
- All email addresses that appear more than once, with their count.
- Delete duplicate rows by email, keeping only the row with the smallest id.
`,
    [
      c("second", "Correct second-highest query (subquery or OFFSET with DISTINCT)", 2),
      c("nth", "DENSE_RANK window query for the 3rd highest", 3),
      c("dupes", "GROUP BY email HAVING COUNT(*) > 1", 2),
      c("delete", "DELETE that keeps the smallest id per email", 3),
    ],
    `
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100),
  salary INT
);

-- 1. Second-highest salary

-- 2. 3rd highest salary

-- 3. Duplicate emails

-- 4. Delete duplicates
`,
  ),
  task(
    "sql",
    "Monthly revenue report with window functions",
    "HARD",
    `
An online store has orders(id, customer_id, order_date) and order_items(order_id, product_id, qty, price), and products(id, name, category). Write queries for:

- Revenue (qty × price) per month, with a running total across months.
- Month-over-month growth % for each month (use LAG), rounded to 2 decimals.
- The top 3 products by revenue in each category.
- Each customer's first order date and the number of customers who ordered again within 30 days of that first order.

Use CTEs to keep the queries readable.
`,
    [
      c("monthly", "Correct monthly revenue with a SUM() OVER running total", 2),
      c(
        "growth",
        "LAG-based growth percentage with correct rounding and NULL for the first month",
        2,
      ),
      c("topn", "ROW_NUMBER/RANK partitioned by category, filtered to top 3", 3),
      c("repeat", "Correct first-order and 30-day repeat customer logic", 2),
      c("style", "Readable CTEs and valid SQL", 1),
    ],
    `
CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(50), category VARCHAR(30));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, order_date DATE);
CREATE TABLE order_items (
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  qty INT,
  price DECIMAL(10, 2)
);

-- 1. Monthly revenue + running total
WITH monthly AS (
  -- your query here
)
SELECT * FROM monthly;
`,
  ),

  // Excel
  task(
    "excel",
    "Grade students with IF and COUNTIF",
    "EASY",
    `
A sheet has student names in A2:A51 and total marks (out of 100) in B2:B51. Write formulas for:

- Grade in column C: A for 90+, B for 75-89, C for 60-74, D for 40-59, F below 40.
- Pass/Fail in column D (pass is 40 or more).
- The class average, the highest mark, and the number of students who failed.
- The number of students who got grade A.

Also say how you would highlight every failing row in red using Conditional Formatting.
`,
    [
      c("grade", "Correct nested IF or IFS for the grades", 3),
      c("pass", "Correct IF for Pass/Fail", 1),
      c("stats", "AVERAGE, MAX and COUNTIF for the class stats", 3),
      c("countif", "COUNTIF on the grade column for A grades", 1),
      c("format", "Conditional formatting rule with a formula like =$B2<40", 2),
    ],
    `
C2 (Grade):
D2 (Pass/Fail):
Average:
Highest:
Failed count:
A-grade count:
Conditional formatting steps:
`,
  ),
  task(
    "excel",
    "Clean messy contact data with formulas",
    "MEDIUM",
    `
You received a contact list with problems. Column A has full names like "  rahul   SHARMA " and column B has emails like "Rahul.Sharma@Gmail.COM". Column C has phone numbers like "+91-98765-43210".

Write formulas (say which column each goes in) to:

- Clean the name: remove extra spaces and use proper case.
- Split the cleaned name into first name and last name.
- Make every email lowercase and extract the domain (text after @).
- Convert the phone to just the 10 digits (9876543210).
- Flag rows where the email is a duplicate of an earlier row.

Finally, name two built-in Excel features (not formulas) that also help with this kind of cleanup.
`,
    [
      c("name", "TRIM with PROPER for the name", 2),
      c("split", "LEFT/RIGHT/MID with FIND (or TEXTSPLIT) for first and last name", 2),
      c("email", "LOWER and MID/RIGHT with FIND for the domain", 2),
      c("phone", "SUBSTITUTE/RIGHT logic giving exactly 10 digits", 2),
      c(
        "dupes",
        "COUNTIF with an expanding range for duplicates, plus valid features (Flash Fill, Remove Duplicates, Text to Columns, Power Query)",
        2,
      ),
    ],
    `
D (clean name):
E (first name):
F (last name):
G (email lowercase):
H (domain):
I (phone):
J (duplicate flag):
Built-in features:
`,
  ),
  task(
    "excel",
    "Build a pivot table sales report",
    "MEDIUM",
    `
A sheet named Sales has 5,000 rows with columns: Date, Region, Salesperson, Product, Units, Revenue. Your manager wants a one-page report. Explain step by step how you would:

- Turn the data into an Excel Table and why that helps.
- Create a PivotTable showing Revenue by Region (rows) and Product (columns), with grand totals.
- Group the dates by month and quarter.
- Show each region's revenue as a % of the grand total.
- Add a slicer for Salesperson and a PivotChart.
- Find the top 3 salespeople by revenue using the PivotTable.

Also write the GETPIVOTDATA (or SUMIFS) formula to fetch North region revenue for Product "Laptop".
`,
    [
      c("table", "Formats as a Table and explains the auto-expanding range", 2),
      c("pivot", "Correct PivotTable layout with rows, columns and values", 2),
      c("group", "Groups dates by months/quarters and uses Show Values As % of Grand Total", 2),
      c("slicer", "Adds a slicer and PivotChart and uses a Top 10 value filter for top 3", 2),
      c("formula", "Correct GETPIVOTDATA or SUMIFS formula", 2),
    ],
    `
1. Excel Table:
2. PivotTable layout:
3. Date grouping:
4. % of total:
5. Slicer and chart:
6. Top 3 salespeople:
Formula:
`,
  ),
  task(
    "excel",
    "Build an EMI loan calculator",
    "HARD",
    `
Build a loan calculator sheet. Inputs: Loan amount (B1) = 500000, Annual interest rate (B2) = 12%, Tenure in years (B3) = 2.

- Write the EMI formula using PMT (check: the EMI is about Rs 23,537).
- Build a month-by-month amortization schedule (columns: Month, Opening balance, EMI, Interest, Principal, Closing balance) and write the formulas for row 1 and row 2 so they can be dragged down. Use absolute references correctly.
- Write formulas for total interest paid and total amount paid.
- Use IPMT and PPMT to get the interest and principal parts of month 6 directly.
- Explain how you would use Goal Seek to find the loan amount that keeps EMI at Rs 20,000, and how a Data Table could show EMI for rates 10%-14% and tenures 1-5 years.
`,
    [
      c("pmt", "Correct PMT with monthly rate and months, sign handled", 2),
      c("schedule", "Correct amortization formulas with proper $ references", 3),
      c("totals", "Correct total interest and total paid formulas", 1),
      c("ipmt", "Correct IPMT and PPMT for month 6", 2),
      c("whatif", "Correct Goal Seek setup and two-variable Data Table explanation", 2),
    ],
    `
EMI (B5):
Schedule row 1 (A8:F8):
Schedule row 2 (A9:F9):
Total interest:
Total paid:
Month 6 interest (IPMT):
Month 6 principal (PPMT):
Goal Seek:
Data Table:
`,
  ),

  // Data analysis with Python
  task(
    "data-analysis-python",
    "Explore a small DataFrame",
    "EASY",
    `
Create this DataFrame with pandas and answer each question with code:

\`\`\`
name    branch  cgpa  backlogs  city
Asha    CSE     8.6   0         Pune
Ravi    ECE     7.2   1         Delhi
Meena   CSE     9.1   0         Chennai
Arjun   ME      6.8   2         Pune
Divya   ECE     8.0   0         Delhi
Kiran   CSE     7.5   1         Mumbai
\`\`\`

- Print the shape, column dtypes and summary statistics.
- Count students per branch.
- Show students with CGPA of 8 or more and no backlogs.
- Print the average CGPA per branch, rounded to 2 decimals.
- Add a column eligible that is True when cgpa >= 7 and backlogs == 0.
`,
    [
      c("create", "Builds the DataFrame correctly", 2),
      c("explore", "Uses shape, dtypes/info and describe", 2),
      c("filter", "Boolean filter with & and parentheses", 2),
      c("group", "value_counts and groupby mean with round", 2),
      c("column", "Correct vectorised eligible column", 2),
    ],
    `
import pandas as pd

data = {
    "name": ["Asha", "Ravi", "Meena", "Arjun", "Divya", "Kiran"],
    # add the other columns here
}
df = pd.DataFrame(data)

# your code here
`,
  ),
  task(
    "data-analysis-python",
    "Handle missing values and duplicates",
    "EASY",
    `
A DataFrame df loaded from survey.csv has columns: id, age, gender, city, monthly_spend. Write pandas code to:

- Print the number of missing values in each column and the % of rows with any missing value.
- Fill missing age with the median age and missing city with the most common city.
- Drop rows where monthly_spend is missing.
- Remove duplicate rows based on id, keeping the first.
- Standardise gender values like "M", "male", " Male " to "Male" (and similarly for Female).

In a comment, explain why median is often better than mean for filling age.
`,
    [
      c("detect", "isna().sum() and the % of rows with missing values", 2),
      c("fill", "fillna with median and mode()[0]", 3),
      c("drop", "dropna(subset=...) and drop_duplicates(subset='id')", 2),
      c("clean", "str.strip/str.lower plus map/replace for gender", 2),
      c("why", "Explains median is robust to outliers", 1),
    ],
    `
import pandas as pd

df = pd.read_csv("survey.csv")

# 1. Missing values report

# 2. Fill age and city

# 3. Drop missing spend

# 4. Remove duplicates

# 5. Standardise gender

# Why median?
`,
  ),
  task(
    "data-analysis-python",
    "Merge and pivot orders with customers",
    "MEDIUM",
    `
You have two DataFrames:

- customers: customer_id, name, city, signup_date
- orders: order_id, customer_id, order_date, category, amount

Write pandas code to:

- Merge them so every order has the customer's city (orders with unknown customers must be kept and counted).
- Build a pivot table of total amount with city as rows and category as columns, filling blanks with 0.
- Find the top-spending customer in each city.
- Compute each customer's number of days between signup and first order.
- Find the share (%) of revenue that comes from the top 10% of customers.
`,
    [
      c("merge", "Left merge from orders and counts unmatched customer_ids", 2),
      c("pivot", "pivot_table with aggfunc sum and fill_value=0", 2),
      c("top", "groupby + idxmax/sort + head(1) for top customer per city", 2),
      c("dates", "Correct datetime conversion and first-order gap", 2),
      c("share", "Correct top-10% revenue share calculation", 2),
    ],
    `
import pandas as pd

customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")

# your code here
`,
  ),
  task(
    "data-analysis-python",
    "Analyse campus placement data",
    "HARD",
    `
placements.csv has columns: student_id, gender, branch, cgpa, internships, backlogs, placed (Yes/No), salary_lpa (empty if not placed).

Do a complete analysis:

- Clean the data: check dtypes, missing values and impossible values (cgpa outside 0-10, negative salary). Convert placed to 1/0.
- Placement rate (%) by branch and by number of internships.
- Average and median salary by branch for placed students only.
- Detect salary outliers using the IQR rule and report how many there are.
- Correlation between cgpa, internships, backlogs and placed.
- One matplotlib chart: placement rate by branch (bar chart with labels and title).

End with three written insights (as comments) that a placement officer could act on.
`,
    [
      c("clean", "Thorough cleaning and validation of values", 2),
      c("rates", "Correct placement rates with groupby mean on the 1/0 column", 2),
      c("salary", "Salary stats filtered to placed students", 1),
      c("outliers", "Correct IQR bounds and outlier count", 2),
      c("viz", "Correlation and a labelled bar chart", 1),
      c("insights", "Three specific, data-backed insights", 2),
    ],
    `
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("placements.csv")

# 1. Clean

# 2. Placement rates

# 3. Salary stats

# 4. Outliers (IQR)

# 5. Correlation and chart

# Insights:
# 1.
# 2.
# 3.
`,
  ),

  // Machine learning
  task(
    "machine-learning",
    "Compute metrics from a confusion matrix",
    "EASY",
    `
A spam classifier was tested on 200 emails:

\`\`\`
                Predicted spam   Predicted not spam
Actual spam          40                 20
Actual not spam      10                130
\`\`\`

- Write a Python function metrics(tp, fp, fn, tn) that returns accuracy, precision, recall and F1, and print the values for this matrix (round to 3 decimals).
- In comments, explain why accuracy alone can be misleading when classes are imbalanced.
- Give one example where recall matters more than precision, and one where precision matters more.
`,
    [
      c("values", "Correct TP/FP/FN/TN read from the matrix", 2),
      c(
        "formulas",
        "Correct formulas and values for accuracy, precision, recall and F1",
        4,
        "Correct formulas: accuracy 0.85, precision 0.8, recall 0.667, F1 0.727",
      ),
      c("imbalance", "Explains the accuracy paradox with imbalance", 2),
      c("tradeoff", "Sensible recall-first and precision-first examples", 2),
    ],
    `
def metrics(tp, fp, fn, tn):
    # your code here
    pass


print(metrics(tp=40, fp=10, fn=20, tn=130))

# Why accuracy can mislead:

# Recall matters more when:
# Precision matters more when:
`,
  ),
  task(
    "machine-learning",
    "Fit a linear regression by hand",
    "EASY",
    `
Without scikit-learn, fit a straight line y = m·x + b to this data using the least-squares formulas:

\`\`\`
x: 1  2  3  4  5
y: 2  4  5  4  5
\`\`\`

- Compute the slope m and intercept b with numpy (check: m = 0.6, b = 2.2).
- Predict y for x = 6.
- Compute the mean squared error (MSE) on the five points.
- In comments, explain what the slope means here and what MSE tells you.
`,
    [
      c("slope", "Correct least-squares slope and intercept", 4),
      c("predict", "Correct prediction for x = 6", 2, "Correct prediction 5.8 for x = 6"),
      c("mse", "Correct MSE", 2, "Correct MSE of 0.48"),
      c("explain", "Clear explanation of slope and MSE", 2),
    ],
    `
import numpy as np

x = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 5])

# slope and intercept
m = None
b = None

# prediction for x = 6

# MSE
`,
  ),
  task(
    "machine-learning",
    "Build a preprocessing pipeline",
    "MEDIUM",
    `
A DataFrame df for loan approval has columns: age (some missing), income, city (text), employment_type (text), approved (0/1).

With scikit-learn, write code that:

- Splits into train and test sets (stratified on approved).
- Builds a ColumnTransformer: impute + scale numeric columns, impute + one-hot encode text columns (ignore unknown categories).
- Puts it in a Pipeline with LogisticRegression.
- Reports 5-fold cross-validation accuracy on the training set, then the test F1 score.

In comments, explain what data leakage is and why fitting the scaler inside the pipeline prevents it.
`,
    [
      c("split", "Stratified train_test_split", 1),
      c(
        "columns",
        "ColumnTransformer with SimpleImputer, StandardScaler and OneHotEncoder(handle_unknown='ignore')",
        3,
      ),
      c("pipeline", "Pipeline combining preprocessing and the model", 2),
      c("eval", "cross_val_score on train and F1 on test", 2),
      c("leakage", "Correct explanation of data leakage", 2),
    ],
    `
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score

df = pd.read_csv("loans.csv")

# your code here

# Data leakage:
`,
  ),
  task(
    "machine-learning",
    "Tune and compare models",
    "HARD",
    `
Use scikit-learn's built-in breast cancer dataset (load_breast_cancer). Write code that:

- Holds out a stratified 20% test set.
- Compares Logistic Regression (with scaling), a Decision Tree and a Random Forest using StratifiedKFold 5-fold cross-validation on ROC-AUC.
- Tunes the Random Forest with GridSearchCV (n_estimators, max_depth, min_samples_leaf).
- Evaluates the best model on the test set: classification report, confusion matrix and ROC-AUC.
- Prints the 5 most important features.

In comments, explain bias vs variance using the Decision Tree and Random Forest results, and why recall for the malignant class matters here.
`,
    [
      c("cv", "Stratified split and StratifiedKFold CV for all three models", 2),
      c("grid", "Correct GridSearchCV with a sensible grid and scoring", 2),
      c("test", "Test-set report, confusion matrix and ROC-AUC on the best model", 2),
      c("features", "Top 5 feature importances with names", 2),
      c("theory", "Clear bias/variance and recall explanation", 2),
    ],
    `
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score, GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

data = load_breast_cancer()
X, y = data.data, data.target

# your code here

# Bias vs variance:
# Why recall matters:
`,
  ),
];
