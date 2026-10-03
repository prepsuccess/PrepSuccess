import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const DATA_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- dbms
  q(
    "dbms",
    "What is a DBMS and how is it better than a file system?",
    "Basics",
    "EASY",
    `
What is a Database Management System? Why would a company store its data in a DBMS instead of plain files (CSV or text files) on disk?
`,
    `
A DBMS is software that stores, retrieves and manages data while hiding how it is physically stored (MySQL, PostgreSQL, Oracle).

Advantages over a file system:
- Less redundancy and inconsistency: data is stored once and linked by keys.
- Query language (SQL) instead of writing custom code to search files.
- Concurrency control: many users can read and write safely at the same time.
- Integrity constraints (primary key, foreign key, NOT NULL, CHECK).
- Security: users, roles and permissions.
- Backup, recovery and crash safety through transactions and logs.
`,
    { company: "TCS" },
  ),
  q(
    "dbms",
    "What is the difference between DBMS and RDBMS?",
    "Basics",
    "EASY",
    `
Explain the difference between a DBMS and an RDBMS. Give an example of each.
`,
    `
- A DBMS is any system that manages data; data may be stored as files, hierarchies or key-value pairs.
- An RDBMS stores data in tables (relations) of rows and columns, and relates tables using keys.
- RDBMS enforces integrity constraints (primary and foreign keys) and supports normalization.
- RDBMS supports SQL, ACID transactions and multi-user access as standard.
- Examples: older file-based or hierarchical systems (IBM IMS), key-value stores are DBMS; MySQL, PostgreSQL, Oracle and SQL Server are RDBMS.
`,
  ),
  q(
    "dbms",
    "What are primary, candidate, super and unique keys?",
    "Keys",
    "EASY",
    `
In a Student table with columns (roll_no, email, aadhaar_no, name, branch), explain super key, candidate key, primary key, alternate key and unique key using this table.
`,
    `
- Super key: any set of columns that uniquely identifies a row, e.g. {roll_no}, {roll_no, name}, {email, branch}.
- Candidate key: a minimal super key (remove any column and it stops being unique): roll_no, email, aadhaar_no.
- Primary key: the one candidate key chosen to identify rows, e.g. roll_no. It cannot be NULL and there is only one per table.
- Alternate keys: the candidate keys not chosen (email, aadhaar_no).
- Unique key: a constraint that values must be unique, but (unlike a primary key) it usually allows NULL and a table can have many.
`,
  ),
  q(
    "dbms",
    "What is a foreign key?",
    "Keys",
    "EASY",
    `
What is a foreign key? What happens when you try to delete a parent row that is still referenced by child rows?
`,
    `
A foreign key is a column (or set of columns) in one table that refers to the primary key of another table, e.g. orders.customer_id references customers.id. It enforces referential integrity: you cannot insert an order for a customer that does not exist.

When deleting a referenced parent row, the behaviour depends on the ON DELETE rule:
- RESTRICT / NO ACTION (default): the delete fails.
- CASCADE: child rows are deleted too.
- SET NULL: the child foreign key becomes NULL.
- SET DEFAULT: the child foreign key gets its default value.
`,
  ),
  q(
    "dbms",
    "What are the ACID properties of a transaction?",
    "Transactions",
    "EASY",
    `
Explain the ACID properties using a bank transfer of Rs 500 from account A to account B.
`,
    `
- Atomicity: both steps (debit A, credit B) happen or neither does. If the system crashes after the debit, it is rolled back.
- Consistency: the transaction moves the database from one valid state to another; total money A + B stays the same and constraints hold.
- Isolation: concurrent transactions do not see each other's half-done work; another user never sees money "missing" in between.
- Durability: once committed, the transfer survives crashes or power failure (it is written to the log on disk).
`,
    { company: "Infosys" },
  ),
  q(
    "dbms",
    "What is normalization and why is it needed?",
    "Normalization",
    "EASY",
    `
What is normalization? What problems (anomalies) occur in a table that is not normalized?
`,
    `
Normalization is organising tables to reduce redundancy and avoid anomalies, by splitting data into related tables based on functional dependencies.

Anomalies in an unnormalized table like (student_id, student_name, course_id, course_name, faculty):
- Insertion anomaly: cannot add a new course until a student enrolls.
- Update anomaly: changing a course's faculty means updating many rows; missing one makes data inconsistent.
- Deletion anomaly: deleting the last student in a course also deletes the course information.

Normal forms (1NF, 2NF, 3NF, BCNF) are the step-by-step rules for removing these problems.
`,
  ),
  q(
    "dbms",
    "What is an ER model?",
    "ER Model",
    "EASY",
    `
What is an Entity-Relationship (ER) diagram? Explain entity, attribute and relationship with a college example.
`,
    `
An ER diagram is a high-level design of a database drawn before creating tables.

- Entity: a real-world object we store data about, e.g. Student, Course (drawn as rectangles).
- Attribute: a property of an entity, e.g. roll_no, name (ovals). Key attributes are underlined; multivalued attributes (phone numbers) use double ovals; derived attributes (age from DOB) use dashed ovals.
- Relationship: an association between entities, e.g. Student ENROLLS_IN Course (diamond).
- Cardinality: one-to-one, one-to-many, many-to-many. Student-Course is many-to-many, which becomes a separate enrollment table.
- Weak entity: depends on another entity for its key (e.g. Dependent of an Employee).
`,
  ),
  q(
    "dbms",
    "Explain 1NF, 2NF and 3NF with an example",
    "Normalization",
    "MEDIUM",
    `
Take this table and normalize it step by step to 3NF:

Enrollment(student_id, student_name, course_id, course_name, dept_id, dept_name, phone_numbers)

phone_numbers may contain values like "98xxxx, 97xxxx". Key = (student_id, course_id). course_id determines dept_id, and dept_id determines dept_name.
`,
    `
- 1NF: every column holds atomic values. Move phone numbers to StudentPhone(student_id, phone).
- 2NF: 1NF plus no partial dependency (non-key column depending on part of a composite key). student_name depends only on student_id, course_name and dept_id only on course_id. Split into Student(student_id, student_name), Course(course_id, course_name, dept_id), Enrollment(student_id, course_id).
- 3NF: 2NF plus no transitive dependency (non-key -> non-key). In Course, course_id -> dept_id -> dept_name, so move it out: Department(dept_id, dept_name), Course(course_id, course_name, dept_id).

Final tables: Student, StudentPhone, Department, Course, Enrollment.
`,
    { company: "TCS" },
  ),
  q(
    "dbms",
    "What is BCNF and how is it different from 3NF?",
    "Normalization",
    "MEDIUM",
    `
What is Boyce-Codd Normal Form? Give an example of a table that is in 3NF but not in BCNF.
`,
    `
BCNF: for every non-trivial functional dependency X -> Y, X must be a super key. 3NF is slightly weaker: it also allows X -> Y when Y is a prime attribute (part of some candidate key).

Example: Teaching(student, subject, teacher)
- Each teacher teaches one subject: teacher -> subject.
- A student has one teacher per subject: (student, subject) -> teacher.
- Candidate keys: (student, subject) and (student, teacher).

teacher -> subject: teacher is not a super key, but subject is prime, so the table is in 3NF but not BCNF.

Decompose into (teacher, subject) and (student, teacher). This is lossless, but the dependency (student, subject) -> teacher is no longer enforced in one table; BCNF can lose dependency preservation, 3NF never does.
`,
  ),
  q(
    "dbms",
    "What is the difference between clustered and non-clustered indexes?",
    "Indexing",
    "MEDIUM",
    `
Explain clustered vs non-clustered indexes. How many of each can a table have?
`,
    `
- Clustered index: the table rows themselves are stored in the order of the index key. The leaf level of the index is the data. Only one per table (data can be physically sorted one way). In MySQL InnoDB and SQL Server the primary key is clustered by default.
- Non-clustered (secondary) index: a separate structure holding the key plus a pointer (row id or primary key) to the row. A table can have many.
- Clustered is great for range queries on the key (BETWEEN dates); non-clustered needs an extra lookup unless the index covers all columns in the query.
- Analogy: a dictionary is clustered by word; the index at the back of a textbook is non-clustered.
`,
  ),
  q(
    "dbms",
    "What is an index and when can it hurt performance?",
    "Indexing",
    "MEDIUM",
    `
What is an index in a database? When should you create one, and when can adding indexes make things worse?
`,
    `
An index is a separate data structure (usually a B+ tree) that lets the database find rows by a column without scanning the whole table, like a book's index.

Create indexes on:
- Columns used in WHERE, JOIN and ORDER BY on large tables.
- Foreign keys and frequently searched columns (email, phone).

They can hurt when:
- The table is write-heavy: every INSERT, UPDATE and DELETE must also update each index.
- The column has low selectivity (gender, boolean flag); a full scan may be faster.
- The table is tiny.
- Queries wrap the column in a function (WHERE YEAR(created_at) = 2024), so the index is not used.
- They take extra disk space and memory.
`,
  ),
  q(
    "dbms",
    "What are dirty reads, non-repeatable reads and phantom reads?",
    "Concurrency",
    "MEDIUM",
    `
Explain the three classic read problems that occur when transactions run concurrently, with a short example for each.
`,
    `
- Dirty read: T1 reads data written by T2 that is not committed yet. If T2 rolls back, T1 used a value that never existed. Example: T2 sets balance = 0, T1 reads 0, T2 rolls back.
- Non-repeatable read: T1 reads a row twice and gets different values because T2 updated and committed it in between.
- Phantom read: T1 runs the same range query twice (WHERE salary > 50000) and gets a different set of rows because T2 inserted or deleted matching rows.

Other anomaly: lost update, where two transactions read the same value and the second write overwrites the first.
`,
  ),
  q(
    "dbms",
    "What are the transaction isolation levels?",
    "Concurrency",
    "MEDIUM",
    `
Name the four SQL standard isolation levels and which read problems each one prevents. Which is the default in MySQL and PostgreSQL?
`,
    `
- READ UNCOMMITTED: allows dirty, non-repeatable and phantom reads.
- READ COMMITTED: prevents dirty reads; non-repeatable and phantom reads possible.
- REPEATABLE READ: prevents dirty and non-repeatable reads; phantoms possible by the standard.
- SERIALIZABLE: prevents all three; transactions behave as if run one after another.

Defaults: MySQL InnoDB uses REPEATABLE READ (and its gap locks also block most phantoms); PostgreSQL and SQL Server default to READ COMMITTED.

Higher isolation means more locking or more aborted transactions, so lower throughput.
`,
    { role: "Backend Developer" },
  ),
  q(
    "dbms",
    "What is denormalization and when would you use it?",
    "Normalization",
    "MEDIUM",
    `
If normalization is good, why do some systems deliberately denormalize? Give a real example.
`,
    `
Denormalization is deliberately adding redundancy (duplicated columns or pre-computed tables) to speed up reads.

When it helps:
- Read-heavy systems and reports where joins across many tables are slow.
- Data warehouses (star schema: wide fact and dimension tables).
- Storing derived values, e.g. keeping order_total on the orders table instead of summing order_items every time, or keeping comment_count on a post.

Costs:
- More storage, and writes must update several places.
- Risk of inconsistency; you need triggers, application logic or batch jobs to keep copies in sync.

Normalize first, then denormalize specific hot paths after measuring.
`,
  ),
  q(
    "dbms",
    "What is a view? Can you update data through a view?",
    "Basics",
    "MEDIUM",
    `
What is a view in SQL? Why use one, and can you run INSERT or UPDATE on a view? What is a materialized view?
`,
    `
A view is a saved SELECT query that behaves like a virtual table; it stores no data itself.

Uses:
- Hide complex joins behind a simple name.
- Security: expose only some columns or rows (e.g. hide salary).
- Keep a stable interface if base tables change.

Updating: a simple view on one table without GROUP BY, DISTINCT, aggregates or joins is usually updatable; changes go to the base table. Views with aggregates, DISTINCT, UNION or most joins are not. WITH CHECK OPTION stops updates that would make the row leave the view.

A materialized view stores the query result physically, so reads are fast, but it must be refreshed when base data changes.
`,
  ),
  q(
    "dbms",
    "How does a B+ tree index work?",
    "Indexing",
    "HARD",
    `
Most databases use B+ trees for indexes. Explain the structure of a B+ tree, how a lookup works, and why it is preferred over a binary search tree or a hash index.
`,
    `
- A B+ tree is a balanced, multi-way search tree. Each node is one disk page and holds many keys (high fan-out, often hundreds).
- Internal nodes store only keys and child pointers to guide the search; all actual entries (key plus row or row pointer) are in the leaf nodes.
- Leaves are linked to each other, so range scans (BETWEEN, ORDER BY) just walk the leaf chain.
- All leaves are at the same depth, so lookup is O(log n) with a very small height: a tree of fan-out 100 and height 3 can index about a million rows with ~3 page reads.
- Inserts and deletes keep it balanced by splitting and merging nodes.

Why not a BST: height is much larger (one key per node), so many more disk reads, and it can become unbalanced.
Why not a hash index: hash is O(1) for equality but cannot do range queries, sorting or prefix matches.
`,
    { role: "Backend Developer" },
  ),
  q(
    "dbms",
    "What is a deadlock in DBMS and how is it handled?",
    "Concurrency",
    "HARD",
    `
Two transactions run at the same time:

T1: UPDATE accounts SET ... WHERE id = 1; then UPDATE accounts SET ... WHERE id = 2;
T2: UPDATE accounts SET ... WHERE id = 2; then UPDATE accounts SET ... WHERE id = 1;

Explain why this can deadlock and how databases detect, prevent or recover from deadlocks.
`,
    `
T1 locks row 1 and waits for row 2; T2 locks row 2 and waits for row 1. Each waits on the other forever: a deadlock (circular wait).

Handling:
- Detection: the DBMS builds a wait-for graph; a cycle means deadlock. It picks a victim (often the cheaper transaction), rolls it back and the application retries. MySQL and PostgreSQL do this.
- Prevention with timestamps: wait-die (older waits, younger aborts) or wound-wait (older preempts younger).
- Timeouts: abort a transaction that waits too long for a lock.

Application-level fixes:
- Always lock rows in the same order (e.g. ascending id).
- Keep transactions short.
- Use SELECT ... FOR UPDATE to take all needed locks up front.
- Retry on deadlock errors.
`,
  ),
  q(
    "dbms",
    "What is two-phase locking (2PL)?",
    "Concurrency",
    "HARD",
    `
Explain the two-phase locking protocol. What does it guarantee, what does it not prevent, and what is strict 2PL?
`,
    `
2PL: each transaction acquires and releases locks in two phases.
- Growing phase: it may acquire locks (shared for read, exclusive for write) but not release any.
- Shrinking phase: once it releases its first lock, it may not acquire any new lock.

Guarantee: every schedule produced is conflict serializable.

Not prevented:
- Deadlocks (two transactions in growing phase can wait on each other).
- Cascading rollbacks in basic 2PL: T2 might read a value T1 wrote and unlocked before T1 aborts.

Strict 2PL: exclusive (write) locks are held until commit or abort, which avoids cascading rollbacks and gives recoverable schedules. Rigorous 2PL holds all locks until commit. Most real databases use strict 2PL or MVCC.
`,
  ),
  q(
    "dbms",
    "Find the candidate key and normal form for a relation",
    "Normalization",
    "HARD",
    `
Relation R(A, B, C, D, E) with functional dependencies:

A -> B
B -> C
CD -> E

1. Find all candidate keys.
2. What is the highest normal form R satisfies?
3. Decompose R into 3NF.
`,
    `
1. A and D never appear on the right side of any FD, so every key must contain both. Closure of AD: AD -> B (A -> B) -> C (B -> C) -> E (CD -> E), so AD+ = ABCDE. AD is the only candidate key.

2. Prime attributes are A and D. A -> B is a partial dependency (B depends on part of the key), so R is not in 2NF. Highest normal form: 1NF.

3. 3NF synthesis from the minimal cover:
- R1(A, B) from A -> B
- R2(B, C) from B -> C
- R3(C, D, E) from CD -> E
- R4(A, D) to hold the candidate key, so the decomposition is lossless.

All FDs are preserved and each table is in 3NF (in fact BCNF).
`,
  ),
  q(
    "dbms",
    "How does a database guarantee atomicity and durability?",
    "Transactions",
    "HARD",
    `
The server crashes in the middle of a transaction, and another transaction had committed just before the crash. How does the database make sure the first is fully undone and the second is not lost?
`,
    `
Using a write-ahead log (WAL) and recovery:
- Every change is first written to a log record (transaction id, page, old value, new value) and the log is flushed to disk before the data page is written (write-ahead rule).
- On COMMIT the commit record is forced to disk. The data pages can be written later; durability comes from the log.
- Checkpoints periodically flush dirty pages and record which transactions are active, so recovery does not scan the whole log.

After a crash (ARIES-style recovery):
- Analysis: read the log from the last checkpoint to find committed and uncommitted transactions.
- Redo: replay committed changes that may not have reached the data files (durability).
- Undo: roll back changes from transactions with no commit record using old values (atomicity).

Shadow paging is an older alternative: write to copies of pages and switch a pointer on commit.
`,
  ),

  // ----------------------------------------------------------------- sql
  q(
    "sql",
    "What is the difference between DELETE, TRUNCATE and DROP?",
    "Basics",
    "EASY",
    `
Compare DELETE, TRUNCATE and DROP. Which can have a WHERE clause, which can be rolled back, and which removes the table structure?
`,
    `
- DELETE (DML): removes rows, can use WHERE, logs each row, fires triggers. Can be rolled back inside a transaction.
- TRUNCATE (DDL): removes all rows at once, no WHERE, much faster, usually resets identity/auto-increment counters, does not fire row triggers. Rollback depends on the database (allowed in PostgreSQL and SQL Server inside a transaction, auto-commits in MySQL and Oracle).
- DROP (DDL): removes the whole table: data, structure, indexes and constraints.

Example: DELETE FROM orders WHERE status = 'cancelled'; TRUNCATE TABLE staging_orders; DROP TABLE old_orders;
`,
    { company: "TCS" },
  ),
  q(
    "sql",
    "What is the difference between WHERE and HAVING?",
    "Aggregation",
    "EASY",
    `
Explain WHERE vs HAVING with an example query that uses both.
`,
    `
- WHERE filters individual rows before grouping; it cannot use aggregate functions.
- HAVING filters groups after GROUP BY; it can use aggregates like COUNT, SUM, AVG.

\`\`\`
SELECT dept_id, AVG(salary) AS avg_salary
FROM employees
WHERE status = 'active'        -- row filter
GROUP BY dept_id
HAVING AVG(salary) > 50000;    -- group filter
\`\`\`

Tip: put conditions that do not need aggregates in WHERE; it reduces rows early and is faster.
`,
  ),
  q(
    "sql",
    "What are the different types of joins?",
    "Joins",
    "EASY",
    `
Explain INNER, LEFT, RIGHT, FULL OUTER, CROSS and SELF joins. If table A has 5 rows and table B has 4 rows, how many rows does a CROSS JOIN return?
`,
    `
- INNER JOIN: only rows with a match in both tables.
- LEFT JOIN: all rows from the left table, matching rows from the right; NULLs where no match.
- RIGHT JOIN: all rows from the right table, matches from the left.
- FULL OUTER JOIN: all rows from both, NULLs where either side is missing (not supported directly in MySQL; use LEFT JOIN UNION RIGHT JOIN).
- CROSS JOIN: every combination (Cartesian product): 5 x 4 = 20 rows.
- SELF JOIN: a table joined to itself with aliases, e.g. employees with their managers.
`,
  ),
  q(
    "sql",
    "What is the difference between UNION and UNION ALL?",
    "Basics",
    "EASY",
    `
What is the difference between UNION and UNION ALL? What rules must the two SELECT statements follow?
`,
    `
- UNION combines results and removes duplicate rows (needs a sort or hash step, so slower).
- UNION ALL keeps all rows including duplicates; faster. Use it when you know there are no duplicates or you want them.

Rules:
- Both SELECTs must return the same number of columns.
- Corresponding columns must have compatible data types.
- Column names come from the first SELECT; ORDER BY goes at the end and applies to the combined result.
`,
  ),
  q(
    "sql",
    "What is the difference between COUNT(*), COUNT(col) and COUNT(DISTINCT col)?",
    "Aggregation",
    "EASY",
    `
A table has 6 rows. The column city has values: Pune, Delhi, NULL, Pune, Mumbai, NULL. What do COUNT(*), COUNT(city) and COUNT(DISTINCT city) return?
`,
    `
- COUNT(*) counts all rows, including those with NULLs: 6.
- COUNT(city) counts non-NULL values: 4.
- COUNT(DISTINCT city) counts unique non-NULL values (Pune, Delhi, Mumbai): 3.

Other aggregates (SUM, AVG, MIN, MAX) also ignore NULLs, so AVG(col) divides by the count of non-NULL values, not by all rows.
`,
  ),
  q(
    "sql",
    "How do you check for NULL values in SQL?",
    "Basics",
    "EASY",
    `
Why does WHERE manager_id = NULL return no rows? How do you correctly filter NULLs and replace them with a default value in output?
`,
    `
NULL means unknown, so any comparison with NULL (=, <>, <, >) gives UNKNOWN, not TRUE, and the row is filtered out.

Correct way:
\`\`\`
SELECT * FROM employees WHERE manager_id IS NULL;
SELECT * FROM employees WHERE manager_id IS NOT NULL;
\`\`\`

Replacing NULLs:
- COALESCE(phone, 'N/A') returns the first non-NULL argument (standard SQL).
- IFNULL (MySQL), ISNULL (SQL Server), NVL (Oracle) are vendor versions.

Watch out: NOT IN (subquery) returns no rows if the subquery contains a NULL; use NOT EXISTS instead.
`,
  ),
  q(
    "sql",
    "What is the difference between CHAR and VARCHAR?",
    "Basics",
    "EASY",
    `
When would you use CHAR(10) instead of VARCHAR(10)? What is stored if you insert 'abc' into each?
`,
    `
- CHAR(n) is fixed length: 'abc' in CHAR(10) is padded with spaces to 10 characters and always uses n characters of storage.
- VARCHAR(n) is variable length: 'abc' stores 3 characters plus 1-2 bytes for the length, up to n.
- CHAR suits values that are always the same length: country codes ('IN'), PIN codes, fixed-format IDs.
- VARCHAR suits names, emails, addresses.
- Trailing spaces: most databases pad or ignore trailing spaces when comparing CHAR values.
`,
  ),
  q(
    "sql",
    "Write a query to find the second highest salary",
    "Subqueries",
    "MEDIUM",
    `
Table: employees(id, name, salary)

Write a query to find the second highest distinct salary. Return NULL if there is no second highest. Then generalise it to the Nth highest.
`,
    `
Subquery approach (returns NULL automatically when none):
\`\`\`
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
\`\`\`

Nth highest with a window function:
\`\`\`
SELECT DISTINCT salary
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t
WHERE rnk = 2;   -- change 2 to N
\`\`\`

With LIMIT (MySQL/PostgreSQL): SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1; wrap it in SELECT (...) to get NULL instead of an empty result.

Use DENSE_RANK, not ROW_NUMBER, so ties in the top salary are handled.
`,
    { company: "TCS" },
  ),
  q(
    "sql",
    "What is the logical order of execution of a SQL query?",
    "Basics",
    "MEDIUM",
    `
In what order does the database logically process the clauses of a SELECT statement? Why can't you use a column alias defined in SELECT inside the WHERE clause?
`,
    `
Logical order:
1. FROM (and JOINs)
2. WHERE
3. GROUP BY
4. HAVING
5. SELECT (expressions, aliases, window functions)
6. DISTINCT
7. ORDER BY
8. LIMIT / OFFSET (TOP / FETCH)

Because WHERE runs before SELECT, an alias created in SELECT does not exist yet when WHERE is evaluated. ORDER BY runs after SELECT, so aliases work there. MySQL also allows aliases in HAVING as an extension.

The optimizer may physically execute steps differently, but the result must match this logical order.
`,
  ),
  q(
    "sql",
    "Find duplicate emails in a table",
    "Aggregation",
    "MEDIUM",
    `
Table: users(id, name, email)

Write a query to list every email that appears more than once, with how many times it appears. Then list the full rows of those duplicate users.
`,
    `
Duplicate emails:
\`\`\`
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
\`\`\`

Full rows:
\`\`\`
SELECT u.*
FROM users u
JOIN (
  SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1
) d ON d.email = u.email
ORDER BY u.email, u.id;
\`\`\`

If emails differ only in case or spaces, group by LOWER(TRIM(email)) instead.
`,
  ),
  q(
    "sql",
    "Find employees who earn more than their managers",
    "Joins",
    "MEDIUM",
    `
Table: employees(id, name, salary, manager_id)

manager_id refers to employees.id. Write a query that returns the names of employees whose salary is greater than their manager's salary.
`,
    `
Use a self join: one alias for the employee, one for the manager.

\`\`\`
SELECT e.name AS employee
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;
\`\`\`

- INNER JOIN drops employees with no manager (manager_id IS NULL), which is what we want here.
- To also show the manager's name and salary, add m.name and m.salary to the SELECT list.
`,
  ),
  q(
    "sql",
    "What is the difference between ROW_NUMBER, RANK and DENSE_RANK?",
    "Window Functions",
    "MEDIUM",
    `
Salaries ordered descending are: 9000, 8000, 8000, 7000. Show the output of ROW_NUMBER(), RANK() and DENSE_RANK() for each row and explain the difference.
`,
    `
| salary | ROW_NUMBER | RANK | DENSE_RANK |
| 9000 | 1 | 1 | 1 |
| 8000 | 2 | 2 | 2 |
| 8000 | 3 | 2 | 2 |
| 7000 | 4 | 4 | 3 |

- ROW_NUMBER: always unique, ties get an arbitrary order.
- RANK: ties share a rank and the next rank is skipped (gap).
- DENSE_RANK: ties share a rank with no gaps.

\`\`\`
SELECT name, salary,
       DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
FROM employees;
\`\`\`
Use ROW_NUMBER for de-duplication or "pick exactly one", DENSE_RANK for "Nth highest value".
`,
    { role: "Data Analyst" },
  ),
  q(
    "sql",
    "Delete duplicate rows but keep one copy",
    "Subqueries",
    "MEDIUM",
    `
Table: person(id, email)

Several rows have the same email. Delete the duplicates so that, for each email, only the row with the smallest id remains.
`,
    `
Standard SQL (PostgreSQL, SQL Server, Oracle):
\`\`\`
DELETE FROM person
WHERE id NOT IN (
  SELECT MIN(id) FROM person GROUP BY email
);
\`\`\`

MySQL does not allow selecting from the table being deleted in a subquery, so use a self join:
\`\`\`
DELETE p1
FROM person p1
JOIN person p2
  ON p1.email = p2.email AND p1.id > p2.id;
\`\`\`

Window function version: number rows with ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) in a CTE and delete where the number is greater than 1. Afterwards add a UNIQUE constraint on email to stop it happening again.
`,
  ),
  q(
    "sql",
    "Why does a filter in WHERE turn a LEFT JOIN into an INNER JOIN?",
    "Joins",
    "MEDIUM",
    `
You want all customers, with their orders from 2024 if any:

SELECT c.name, o.id
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.order_date >= '2024-01-01';

Customers with no 2024 orders disappear from the result. Why, and how do you fix it?
`,
    `
The LEFT JOIN gives customers without matching orders a row where o.* is NULL. The WHERE clause then evaluates NULL >= '2024-01-01' as UNKNOWN and removes those rows, so the result behaves like an INNER JOIN.

Fix: move the condition on the right table into the ON clause, so it only limits which orders match:
\`\`\`
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.id
 AND o.order_date >= '2024-01-01';
\`\`\`

Rule: filters on the left (preserved) table go in WHERE; filters on the right table of a LEFT JOIN go in ON, unless you deliberately want to drop non-matching rows.
`,
  ),
  q(
    "sql",
    "Find customers who have never placed an order",
    "Subqueries",
    "MEDIUM",
    `
Tables: customers(id, name), orders(id, customer_id, amount)

Write the query in two different ways. Which one is safer if orders.customer_id can contain NULLs?
`,
    `
LEFT JOIN with IS NULL:
\`\`\`
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
\`\`\`

NOT EXISTS:
\`\`\`
SELECT c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
\`\`\`

Avoid WHERE c.id NOT IN (SELECT customer_id FROM orders): if any customer_id is NULL, NOT IN returns no rows at all. NOT EXISTS and the LEFT JOIN version handle NULLs correctly.
`,
  ),
  q(
    "sql",
    "Find the top 3 earners in each department",
    "Window Functions",
    "HARD",
    `
Tables: employees(id, name, salary, dept_id), departments(id, name)

Return the department name, employee name and salary of everyone whose salary is among the top 3 distinct salaries in their department.
`,
    `
\`\`\`
WITH ranked AS (
  SELECT e.name, e.salary, e.dept_id,
         DENSE_RANK() OVER (
           PARTITION BY e.dept_id ORDER BY e.salary DESC
         ) AS rnk
  FROM employees e
)
SELECT d.name AS department, r.name AS employee, r.salary
FROM ranked r
JOIN departments d ON d.id = r.dept_id
WHERE r.rnk <= 3
ORDER BY d.name, r.salary DESC;
\`\`\`

- PARTITION BY restarts the ranking for each department.
- DENSE_RANK includes everyone tied on a top-3 salary; use ROW_NUMBER if exactly 3 people are needed.
- Window functions cannot be used in WHERE directly, hence the CTE.

Without window functions: keep e where (SELECT COUNT(DISTINCT e2.salary) FROM employees e2 WHERE e2.dept_id = e.dept_id AND e2.salary > e.salary) < 3.
`,
    { role: "Data Analyst" },
  ),
  q(
    "sql",
    "Calculate a running total and a 7-day moving average",
    "Window Functions",
    "HARD",
    `
Table: daily_sales(sale_date, amount), one row per day.

Write a query that returns each day with its cumulative revenue so far and the average revenue of the last 7 days (including the current day).
`,
    `
\`\`\`
SELECT sale_date,
       amount,
       SUM(amount) OVER (ORDER BY sale_date) AS running_total,
       AVG(amount) OVER (
         ORDER BY sale_date
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS avg_7d
FROM daily_sales
ORDER BY sale_date;
\`\`\`

- With ORDER BY and no frame, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which gives a running total (rows with the same date are added together).
- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW counts physical rows, so it assumes one row per day with no gaps. If days can be missing, first join to a calendar table, or use a date-based RANGE frame where supported.
- Add PARTITION BY store_id to compute it per store.
`,
    { role: "Data Analyst" },
  ),
  q(
    "sql",
    "Find users who logged in on 3 or more consecutive days",
    "Window Functions",
    "HARD",
    `
Table: logins(user_id, login_date)

A user may log in several times a day. Return the users who logged in on at least 3 consecutive calendar days.
`,
    `
Gaps-and-islands trick: for consecutive dates, login_date minus its row number is constant, so it identifies each streak.

\`\`\`
WITH d AS (
  SELECT DISTINCT user_id, login_date FROM logins
),
g AS (
  SELECT user_id, login_date,
         login_date - CAST(ROW_NUMBER() OVER (
           PARTITION BY user_id ORDER BY login_date
         ) AS INT) AS grp
  FROM d
)
SELECT DISTINCT user_id
FROM g
GROUP BY user_id, grp
HAVING COUNT(*) >= 3;
\`\`\`

(PostgreSQL syntax; in MySQL use DATE_SUB(login_date, INTERVAL rn DAY).)

Example: dates 1, 2, 3, 5 get row numbers 1, 2, 3, 4, so grp = 0, 0, 0, 1; the group with 0 has 3 days.
Alternative: compare each date with LAG(login_date, 2) and check the difference is 2 days.
`,
    { company: "Amazon", role: "Data Analyst" },
  ),
  q(
    "sql",
    "Calculate month-over-month revenue growth",
    "Window Functions",
    "HARD",
    `
Table: orders(id, order_date, amount)

Return each month, its total revenue, the previous month's revenue and the percentage growth over the previous month, rounded to 2 decimals.
`,
    `
\`\`\`
WITH monthly AS (
  SELECT DATE_TRUNC('month', order_date) AS month,
         SUM(amount) AS revenue
  FROM orders
  GROUP BY DATE_TRUNC('month', order_date)
)
SELECT month,
       revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
       ROUND(
         100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
         / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 2
       ) AS growth_pct
FROM monthly
ORDER BY month;
\`\`\`

- LAG reads the previous row's value; the first month gets NULL.
- NULLIF avoids division by zero.
- 100.0 forces decimal division (integer division would truncate).
- MySQL: use DATE_FORMAT(order_date, '%Y-%m-01') instead of DATE_TRUNC.
`,
    { role: "Business Analyst" },
  ),
  q(
    "sql",
    "A query on a large table is slow. How do you optimize it?",
    "Performance",
    "HARD",
    `
This query on a 50-million-row orders table takes 40 seconds:

SELECT * FROM orders WHERE YEAR(created_at) = 2024 AND LOWER(status) = 'shipped' ORDER BY created_at DESC;

How would you investigate and speed it up?
`,
    `
Investigate:
- Run EXPLAIN / EXPLAIN ANALYZE to see whether it does a full table scan and where time goes.

Fixes:
- Make conditions sargable: functions on columns block index use. Rewrite as created_at >= '2024-01-01' AND created_at < '2025-01-01', and store status in a consistent case so you can compare status = 'shipped'.
- Add a composite index such as (status, created_at): equality column first, then the range/sort column, so the index also serves ORDER BY.
- Select only needed columns instead of SELECT *, which may allow a covering index.
- Add LIMIT / pagination if the UI only shows a page.
- Keep table statistics up to date (ANALYZE).
- For very large tables, consider partitioning by date or a summary table for reports.
`,
    { role: "Backend Developer" },
  ),

  // --------------------------------------------------------------- excel
  q(
    "excel",
    "What is the difference between relative, absolute and mixed references?",
    "Formulas",
    "EASY",
    `
Explain A1, $A$1, $A1 and A$1. If cell C2 has =A2*$B$1 and you copy it to C5, what formula does C5 contain?
`,
    `
- A1 (relative): both row and column change when the formula is copied.
- $A$1 (absolute): neither changes; always points to A1. Toggle with F4.
- $A1 (mixed): column fixed, row changes.
- A$1 (mixed): row fixed, column changes.

C5 contains =A5*$B$1: the relative A2 moves down 3 rows, while $B$1 stays fixed. This is how you multiply a column by one fixed rate such as a tax or exchange rate.
`,
  ),
  q(
    "excel",
    "How does VLOOKUP work?",
    "Lookups",
    "EASY",
    `
You have an Orders sheet with a product_id in column A and a Products sheet with product_id, name, category, price in columns A to D (rows 2-100). Write a VLOOKUP to bring the price into Orders and explain each argument.
`,
    `
\`\`\`
=VLOOKUP(A2, Products!$A$2:$D$100, 4, FALSE)
\`\`\`

- A2: the value to look up.
- Products!$A$2:$D$100: the table; the lookup value must be in its first column. Absolute references keep it fixed when copying down.
- 4: return the 4th column of the table (price).
- FALSE: exact match. TRUE (or omitted) means approximate match and needs the first column sorted ascending.

If the value is not found it returns #N/A; wrap with IFERROR(..., "Not found") to show a friendly message.
`,
    { role: "Data Analyst" },
  ),
  q(
    "excel",
    "How do SUMIF and COUNTIF work?",
    "Formulas",
    "EASY",
    `
Column A has Region, column C has Sales (rows 2-500). Write formulas for: total sales of the North region, number of orders from North, and number of orders above 10,000.
`,
    `
\`\`\`
=SUMIF(A2:A500, "North", C2:C500)
=COUNTIF(A2:A500, "North")
=COUNTIF(C2:C500, ">10000")
\`\`\`

- SUMIF(range, criteria, sum_range): adds sum_range where range meets the criteria.
- COUNTIF(range, criteria): counts cells that meet the criteria.
- Criteria can be text, numbers, comparisons in quotes (">10000"), wildcards ("N*") or a cell reference: ">"&F1.
- For several conditions use SUMIFS and COUNTIFS.
`,
  ),
  q(
    "excel",
    "How do you remove duplicates in Excel?",
    "Data Cleaning",
    "EASY",
    `
A customer list of 5,000 rows has repeated entries. Describe two or three ways to find or remove duplicates.
`,
    `
- Data > Remove Duplicates: select the range, choose which columns define a duplicate (e.g. Email only, or Name + Phone). It deletes extra rows in place, so keep a backup copy.
- Conditional Formatting > Highlight Cells Rules > Duplicate Values: highlights duplicates so you can review before deleting.
- A helper column: =COUNTIF($B$2:B2, B2) gives 1 for the first occurrence and 2+ for repeats; filter on values > 1.
- Excel 365: =UNIQUE(A2:C5000) returns the distinct rows to a new location without changing the source.
- Clean the data first (TRIM spaces, consistent case), otherwise "Ravi " and "ravi" will not be seen as duplicates.
`,
  ),
  q(
    "excel",
    "What is a pivot table and when do you use it?",
    "Pivot Tables",
    "EASY",
    `
What is a pivot table? Using a sales dataset (Date, Region, Product, Salesperson, Amount), explain how you would show total sales by region and product.
`,
    `
A pivot table summarises a large table quickly by grouping and aggregating, without writing formulas.

Steps:
- Click inside the data (ideally formatted as a Table with Ctrl+T), then Insert > PivotTable.
- Drag Region to Rows, Product to Columns, Amount to Values (Sum of Amount).
- Optionally drag Date to Filters, or add Slicers for interactive filtering.

Useful features:
- Change aggregation (Sum, Count, Average) via Value Field Settings.
- Show Values As: % of grand total, % of row.
- Refresh after source data changes (it does not update automatically).
`,
    { role: "Business Analyst" },
  ),
  q(
    "excel",
    "How do you use conditional formatting?",
    "Formatting",
    "EASY",
    `
How would you highlight all students who scored below 40 in red, and the top 10 scores in green? How do you highlight an entire row based on one cell?
`,
    `
- Below 40: select the scores, Home > Conditional Formatting > Highlight Cells Rules > Less Than > 40, red fill.
- Top 10: Conditional Formatting > Top/Bottom Rules > Top 10 Items, green fill.
- Whole row: select the full data range (e.g. A2:F100), New Rule > Use a formula, enter =$E2<40. The $ fixes the column so every cell in the row checks column E, while the row stays relative.

Other options: data bars, color scales and icon sets for quick visual comparison. Manage Rules lets you edit or reorder rules.
`,
  ),
  q(
    "excel",
    "What is the difference between COUNT, COUNTA and COUNTBLANK?",
    "Formulas",
    "EASY",
    `
A range A1:A6 contains: 10, "Pune", (empty), 25, TRUE, (empty). What do COUNT, COUNTA and COUNTBLANK return?
`,
    `
- COUNT counts cells containing numbers: 10 and 25, so 2. (Logical values typed into cells are not counted.)
- COUNTA counts non-empty cells of any type: 10, "Pune", 25, TRUE, so 4.
- COUNTBLANK counts empty cells: 2. A formula returning "" also counts as blank for COUNTBLANK but as non-empty for COUNTA.
`,
  ),
  q(
    "excel",
    "What are the limitations of VLOOKUP and how does INDEX-MATCH solve them?",
    "Lookups",
    "MEDIUM",
    `
Your employee sheet has Name in column B and Employee ID in column D. You need to look up a name given an ID. Why does VLOOKUP struggle here, and how does INDEX-MATCH help?
`,
    `
VLOOKUP limitations:
- It can only look to the right: the lookup column must be the first column of the range (ID is to the right of Name here).
- The hard-coded column number breaks when columns are inserted or deleted.
- It defaults to approximate match if the last argument is omitted.

INDEX-MATCH:
\`\`\`
=INDEX($B$2:$B$500, MATCH(G2, $D$2:$D$500, 0))
\`\`\`
- MATCH finds the row position of the ID (0 = exact match).
- INDEX returns the value at that position from any column, left or right.
- Inserting columns does not break it, and it looks at only the two columns needed.

In Excel 365, XLOOKUP does the same in one function.
`,
    { role: "Data Analyst" },
  ),
  q(
    "excel",
    "How does XLOOKUP improve on VLOOKUP?",
    "Lookups",
    "MEDIUM",
    `
Write an XLOOKUP that finds an employee's department from their ID and shows "Not found" if the ID is missing. List what XLOOKUP can do that VLOOKUP cannot.
`,
    `
\`\`\`
=XLOOKUP(G2, $D$2:$D$500, $C$2:$C$500, "Not found")
\`\`\`
Arguments: lookup_value, lookup_array, return_array, if_not_found, match_mode, search_mode.

Advantages:
- Looks left or right; no column index number.
- Exact match is the default.
- Built-in if_not_found, so no IFERROR wrapper needed.
- search_mode -1 searches from the bottom, giving the last match (e.g. latest transaction).
- match_mode for next smaller/larger or wildcard matches.
- Can return several columns at once (return_array spanning multiple columns spills).

Available in Excel 2021 and Microsoft 365; older versions need INDEX-MATCH.
`,
  ),
  q(
    "excel",
    "How do you use SUMIFS with multiple conditions?",
    "Formulas",
    "MEDIUM",
    `
Columns: A Date, B Region, C Product, D Sales (rows 2-1000). Write a formula for total sales of "Laptop" in the "South" region during March 2024.
`,
    `
\`\`\`
=SUMIFS(D2:D1000, B2:B1000, "South", C2:C1000, "Laptop",
        A2:A1000, ">="&DATE(2024,3,1), A2:A1000, "<"&DATE(2024,4,1))
\`\`\`

- SUMIFS(sum_range, criteria_range1, criteria1, ...): the sum range comes first (unlike SUMIF).
- All conditions are combined with AND.
- Dates are compared with ">="&DATE(...) and "<"&DATE(...); this works for any month length.
- Better practice: put "South", "Laptop" and the dates in input cells and reference them, so the formula is reusable.
- For OR logic (South or East) add two SUMIFS, or use SUM(SUMIFS(..., B2:B1000, {"South","East"}, ...)).
`,
    { role: "Business Analyst" },
  ),
  q(
    "excel",
    "How do you split a full name into first and last name?",
    "Data Cleaning",
    "MEDIUM",
    `
Column A contains names like "Priya Sharma". Write formulas to get the first name and last name into columns B and C. What other ways can you do this without formulas?
`,
    `
\`\`\`
B2: =LEFT(A2, FIND(" ", A2) - 1)
C2: =MID(A2, FIND(" ", A2) + 1, LEN(A2))
\`\`\`
- FIND gives the position of the first space; LEFT takes everything before it.
- MID starts after the space; using LEN(A2) as the length simply takes the rest.
- Wrap with TRIM(A2) first to remove extra spaces, and IFERROR for single-word names.

Without formulas:
- Data > Text to Columns > Delimited > Space.
- Flash Fill (Ctrl+E): type the first name for one or two rows and Excel fills the rest.
- Excel 365: =TEXTSPLIT(A2, " ") or TEXTBEFORE / TEXTAFTER.
`,
  ),
  q(
    "excel",
    "How do you group dates by month and add a calculated field in a pivot table?",
    "Pivot Tables",
    "MEDIUM",
    `
Your pivot table shows sales by individual date, which is too detailed. How do you summarise it by month and quarter? How would you add a Profit Margin column calculated from Sales and Cost?
`,
    `
Grouping dates:
- Right-click any date in the pivot > Group > choose Months and Quarters (and Years if data spans several years, otherwise months from different years merge).
- If Group is greyed out, the column has text or blank values; convert them to real dates.

Calculated field:
- PivotTable Analyze > Fields, Items & Sets > Calculated Field.
- Name: Margin, Formula: =(Sales - Cost) / Sales, then format as percentage.
- Calculated fields work on the sums, so margin is computed correctly per group, not as an average of row margins.

Alternative: add a helper column in the source data, or use Power Pivot measures for more complex logic.
`,
    { role: "Data Analyst" },
  ),
  q(
    "excel",
    "How do you create a drop-down list with data validation?",
    "Data Validation",
    "MEDIUM",
    `
You are building an expense form. Create a drop-down for Category (Travel, Food, Stay), and stop users entering an amount above 50,000. How would you make the list update automatically when new categories are added?
`,
    `
Drop-down:
- Select the cells > Data > Data Validation > Allow: List.
- Source: type Travel,Food,Stay or point to a range such as =$H$2:$H$4.

Amount limit:
- Data Validation > Allow: Decimal, between 0 and 50000.
- Add an Input Message and an Error Alert (Stop) to explain the rule.

Auto-updating list:
- Put categories in an Excel Table (Ctrl+T) and use a named range =Categories that refers to the table column, or in 365 point to a spill range like =$H$2#.
- Dependent drop-downs (sub-category depends on category) can use INDIRECT with named ranges.
`,
  ),
  q(
    "excel",
    "What is Goal Seek and when would you use it?",
    "What-If Analysis",
    "MEDIUM",
    `
A loan EMI is calculated in B4 with =PMT(B2/12, B3, -B1), where B1 is the principal, B2 the annual rate and B3 the months. You can afford an EMI of 20,000. How do you find the maximum loan amount?
`,
    `
Use Goal Seek (Data > What-If Analysis > Goal Seek):
- Set cell: B4 (the EMI formula).
- To value: 20000.
- By changing cell: B1 (principal).

Excel changes B1 by trial until B4 equals 20,000.

Notes:
- Goal Seek changes only one input. For several inputs with constraints (e.g. maximise profit under budget limits) use Solver.
- Data Tables show results for many input values at once (e.g. EMI for rates 8% to 12%).
- Scenario Manager stores named sets of inputs (best/worst case).
- Here you could also solve directly with =PV(B2/12, B3, -20000).
`,
  ),
  q(
    "excel",
    "How do you clean messy text data in Excel?",
    "Data Cleaning",
    "MEDIUM",
    `
An imported customer file has names like "  rAVI   kumar ", city values with line breaks, and phone numbers stored as text with dashes. Which functions and tools would you use to clean it?
`,
    `
- TRIM removes leading/trailing spaces and reduces repeated spaces to one.
- CLEAN removes non-printable characters such as line breaks.
- PROPER, UPPER, LOWER fix case: =PROPER(TRIM(CLEAN(A2))) gives "Ravi Kumar".
- SUBSTITUTE removes or replaces characters: =SUBSTITUTE(C2, "-", ""). Non-breaking spaces from web data need SUBSTITUTE(A2, CHAR(160), " ").
- VALUE or Text to Columns converts numbers stored as text into real numbers.
- Find & Replace (Ctrl+H) for bulk fixes.
- After cleaning, Copy > Paste Special > Values to replace formulas with results.
- For a repeating import, record the steps in Power Query so they run again on refresh.
`,
  ),
  q(
    "excel",
    "How do you do a two-way lookup in Excel?",
    "Lookups",
    "HARD",
    `
A sheet has salespeople in A2:A50 and months Jan-Dec in B1:M1, with sales in B2:M50. Given a name in P2 and a month in Q2, write a formula to return the sales figure.
`,
    `
INDEX with two MATCH functions:
\`\`\`
=INDEX($B$2:$M$50, MATCH(P2, $A$2:$A$50, 0), MATCH(Q2, $B$1:$M$1, 0))
\`\`\`
- First MATCH gives the row number of the person.
- Second MATCH gives the column number of the month.
- INDEX returns the value at that row and column.

Excel 365 alternative with nested XLOOKUP:
\`\`\`
=XLOOKUP(P2, $A$2:$A$50, XLOOKUP(Q2, $B$1:$M$1, $B$2:$M$50))
\`\`\`
The inner XLOOKUP returns the whole month column; the outer one picks the person's row.

Make P2 and Q2 drop-downs with data validation to build a small interactive report.
`,
    { role: "Data Analyst" },
  ),
  q(
    "excel",
    "What are dynamic array functions like FILTER, UNIQUE and SORT?",
    "Formulas",
    "HARD",
    `
In Excel 365, write formulas to: list all orders from the North region with amount above 50,000, sorted by amount descending; and list the unique product names in alphabetical order. What is a spill range?
`,
    `
\`\`\`
=SORT(FILTER(A2:D500, (B2:B500="North") * (D2:D500>50000), "None"), 4, -1)
=SORT(UNIQUE(C2:C500))
\`\`\`

- FILTER(array, include, if_empty) returns rows where include is TRUE. Multiplying conditions gives AND; adding them gives OR.
- SORT(array, sort_index, sort_order): column 4, -1 for descending. SORTBY sorts by another range.
- UNIQUE returns distinct values (or rows).
- The result "spills" into neighbouring cells automatically. Refer to the whole result with the # operator, e.g. =COUNTA(F2#).
- #SPILL! means something is blocking the output cells.

These replace many helper columns and array formulas (Ctrl+Shift+Enter) from older Excel.
`,
    { role: "Data Analyst" },
  ),
  q(
    "excel",
    "What is Power Query and when would you use it?",
    "Power Query",
    "HARD",
    `
Every month you receive 12 regional sales CSV files with the same columns. You spend hours copying them into one sheet, removing blank rows and fixing date formats. How would Power Query help?
`,
    `
Power Query (Data > Get & Transform) is Excel's ETL tool: it records cleaning steps and re-runs them on refresh.

For this task:
- Get Data > From Folder, point to the folder, and Combine & Transform to append all files into one table.
- Remove blank rows, remove unwanted columns, set data types (Date, Decimal), trim text, replace values, split columns.
- Add a column with the source file name to know the region.
- Load the result to a sheet or the Data Model, and build a pivot on it.

Next month: drop the new files in the folder and click Refresh All.

Other features: Merge Queries (like SQL joins), Append, Group By, Unpivot (wide to long). Each step is saved in the Applied Steps list and written in the M language.
`,
    { role: "Data Analyst" },
  ),
  q(
    "excel",
    "How do you compare two lists to find missing records?",
    "Lookups",
    "HARD",
    `
Sheet1 has 8,000 invoice IDs from the billing system and Sheet2 has 7,950 IDs from the bank statement. Find which invoices are missing from the bank list, and which bank IDs do not exist in billing.
`,
    `
Helper column in Sheet1 (B2), copied down:
\`\`\`
=IF(COUNTIF(Sheet2!$A$2:$A$8000, A2) = 0, "Missing in bank", "OK")
\`\`\`
or =ISNA(MATCH(A2, Sheet2!$A$2:$A$8000, 0)), or =XLOOKUP(A2, Sheet2!A:A, Sheet2!A:A, "Missing").

Do the same in Sheet2 against Sheet1 for the reverse direction, then filter on "Missing".

Excel 365 single formula:
\`\`\`
=FILTER(Sheet1!A2:A8001, COUNTIF(Sheet2!A2:A7951, Sheet1!A2:A8001) = 0)
\`\`\`

Pitfalls:
- IDs stored as text in one sheet and numbers in the other never match; convert with VALUE or TEXT.
- Extra spaces: TRIM both sides.
- For large or repeated reconciliations, use Power Query Merge with a Left Anti join.
`,
    { role: "Business Analyst" },
  ),
  q(
    "excel",
    "How would you build an interactive sales dashboard in Excel?",
    "Dashboards",
    "HARD",
    `
Your manager wants a one-page Excel dashboard showing revenue, orders and top products, filterable by region and month. How would you design and build it?
`,
    `
- Prepare data: convert the raw data to an Excel Table (or load via Power Query) so new rows are picked up.
- Calculations: build pivot tables on a separate hidden sheet (revenue by month, by region, top 10 products using Value Filters > Top 10).
- Visuals: pivot charts (line for trend, bar for top products, avoid 3D and too many pies). KPI cards with formulas like =GETPIVOTDATA or SUMIFS.
- Interactivity: insert Slicers for Region and a Timeline for dates, and connect them to all pivots with Report Connections.
- Layout: one screen, KPIs at the top, consistent colors, clear titles, gridlines off.
- Maintenance: Refresh All updates everything; document data source and last refresh date.
- Protect the sheet so users can use slicers but not break formulas.
`,
    { role: "Data Analyst" },
  ),

  // ------------------------------------------------ data-analysis-python
  q(
    "data-analysis-python",
    "Why use a NumPy array instead of a Python list?",
    "NumPy",
    "EASY",
    `
What are the differences between a Python list and a NumPy array? Why is NumPy faster for numerical work?
`,
    `
- A NumPy array holds elements of one data type in a contiguous block of memory; a list holds references to Python objects of any type.
- Vectorized operations: arr * 2 multiplies every element in compiled C code; with a list you need a loop or comprehension.
- Much less memory per element and far faster for large numeric data.
- Supports multi-dimensional arrays, broadcasting, slicing views, and math/linear algebra functions.
- Note: [1, 2] * 2 gives [1, 2, 1, 2] for a list, but np.array([1, 2]) * 2 gives array([2, 4]).
- Lists are better for mixed types and frequent appends.
`,
  ),
  q(
    "data-analysis-python",
    "What is the difference between a pandas Series and a DataFrame?",
    "Pandas",
    "EASY",
    `
Explain Series and DataFrame in pandas, with how you would create each.
`,
    `
- Series: a one-dimensional labelled array (values plus an index), like a single column.
- DataFrame: a two-dimensional table with labelled rows (index) and columns; each column is a Series and columns can have different types.

\`\`\`
import pandas as pd
s = pd.Series([90, 85, 70], index=["Asha", "Ravi", "Neha"])
df = pd.DataFrame({"name": ["Asha", "Ravi"], "marks": [90, 85]})
df["marks"]      # a Series
df[["marks"]]    # a DataFrame with one column
\`\`\`
`,
  ),
  q(
    "data-analysis-python",
    "What is the difference between loc and iloc?",
    "Pandas",
    "EASY",
    `
Explain df.loc and df.iloc. For a DataFrame with the default integer index 0..9, how many rows do df.loc[2:4] and df.iloc[2:4] return?
`,
    `
- loc selects by label (index labels and column names). Slices include the end label.
- iloc selects by integer position. Slices exclude the end, like Python lists.

df.loc[2:4] returns rows with labels 2, 3, 4 (3 rows); df.iloc[2:4] returns positions 2 and 3 (2 rows).

\`\`\`
df.loc[df["city"] == "Pune", ["name", "salary"]]   # boolean filter + columns
df.iloc[0:5, 0:2]                                  # first 5 rows, first 2 columns
\`\`\`
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-analysis-python",
    "How do you handle missing values in pandas?",
    "Data Cleaning",
    "EASY",
    `
You load a dataset and some columns have missing values. How do you find them, and what are your options to handle them?
`,
    `
Find:
\`\`\`
df.isna().sum()                 # missing count per column
df.isna().mean() * 100          # missing percentage
\`\`\`

Options:
- Drop: df.dropna() for rows, or drop a column that is mostly empty (df.drop(columns=["col"])).
- Fill with a statistic: df["age"] = df["age"].fillna(df["age"].median()); mode for categories.
- Fill with a constant: fillna("Unknown") or 0 when missing means none.
- Forward/backward fill for time series: df["price"].ffill().
- Interpolate numeric series: df["temp"].interpolate().
- Add an indicator column (was_missing) if missingness itself is informative.

Choice depends on why values are missing and how many; always report what you did.
`,
  ),
  q(
    "data-analysis-python",
    "What are the first steps after loading a CSV in pandas?",
    "EDA",
    "EASY",
    `
You are given sales.csv and asked to analyse it. What commands do you run first to understand the data?
`,
    `
\`\`\`
df = pd.read_csv("sales.csv", parse_dates=["order_date"])
df.shape          # rows, columns
df.head()         # first rows
df.info()         # column types, non-null counts, memory
df.describe()     # count, mean, std, min, quartiles, max for numeric columns
df.isna().sum()   # missing values
df.duplicated().sum()
df["region"].value_counts()
\`\`\`

Then check: wrong data types (numbers stored as strings), impossible values (negative quantities), date ranges, and the grain of the data (one row per order or per item?).
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-analysis-python",
    "What does value_counts do?",
    "Pandas",
    "EASY",
    `
How do you find how many orders came from each city, the percentage share of each city, and include missing cities in the count?
`,
    `
\`\`\`
df["city"].value_counts()                       # counts, sorted descending
df["city"].value_counts(normalize=True) * 100   # percentage share
df["city"].value_counts(dropna=False)           # include NaN as a category
df["city"].value_counts().head(5)               # top 5 cities
\`\`\`

- It returns a Series indexed by the unique values.
- For counts across two columns, use df.value_counts(["city", "product"]) or pd.crosstab(df["city"], df["product"]).
- For numeric columns, bins=5 groups values into ranges.
`,
  ),
  q(
    "data-analysis-python",
    "What is exploratory data analysis (EDA)?",
    "EDA",
    "EASY",
    `
What is EDA and what steps do you follow? Which plots would you use for numeric and categorical columns?
`,
    `
EDA is examining a dataset to understand its structure, quality and patterns before modelling or reporting.

Steps:
- Understand columns, types, size and the meaning of each row.
- Check data quality: missing values, duplicates, outliers, wrong types.
- Univariate analysis: distribution of each column.
- Bivariate analysis: relationships between columns and with the target.
- Summarise insights and questions for stakeholders.

Plots:
- Numeric: histogram, box plot (outliers), KDE.
- Categorical: bar chart of counts.
- Numeric vs numeric: scatter plot, correlation heatmap.
- Category vs numeric: box plot per category, grouped bar.
- Over time: line chart.
`,
  ),
  q(
    "data-analysis-python",
    "How do groupby and agg work in pandas?",
    "Pandas",
    "MEDIUM",
    `
DataFrame orders has columns: order_id, region, customer_id, amount. Compute, for each region: total amount, average amount, number of orders and number of unique customers, sorted by total descending.
`,
    `
\`\`\`
summary = (
    orders.groupby("region")
    .agg(
        total=("amount", "sum"),
        avg_amount=("amount", "mean"),
        orders=("order_id", "count"),
        customers=("customer_id", "nunique"),
    )
    .sort_values("total", ascending=False)
    .reset_index()
)
\`\`\`

- groupby follows split-apply-combine: split rows by key, apply an aggregation, combine results.
- Named aggregation (new_name=(column, func)) gives clean column names.
- transform("sum") returns a value for every original row (e.g. each order's share of its region total), while agg returns one row per group.
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-analysis-python",
    "What is the difference between merge, join and concat?",
    "Pandas",
    "MEDIUM",
    `
You have orders(order_id, customer_id, amount) and customers(customer_id, name, city). When do you use pd.merge, df.join and pd.concat? Write the code to attach customer details to every order.
`,
    `
\`\`\`
result = orders.merge(customers, on="customer_id", how="left")
\`\`\`

- merge: SQL-style join on one or more columns. how = "inner" (default), "left", "right", "outer". Use left_on/right_on for different column names, and validate="many_to_one" to catch unexpected duplicates.
- join: convenience method that joins on the index by default (df1.join(df2)).
- concat: stacks DataFrames along an axis: pd.concat([jan, feb, mar]) appends rows; axis=1 places them side by side by index.

After a merge, check the row count: if it grows unexpectedly, the right table has duplicate keys. indicator=True adds a _merge column showing which rows matched.
`,
  ),
  q(
    "data-analysis-python",
    "Why is vectorization faster than apply or loops in pandas?",
    "Pandas",
    "MEDIUM",
    `
A colleague computes a column like this on 2 million rows and it is slow:

df["total"] = df.apply(lambda r: r["price"] * r["qty"] if r["qty"] > 0 else 0, axis=1)

Rewrite it and explain why your version is faster.
`,
    `
\`\`\`
import numpy as np
df["total"] = np.where(df["qty"] > 0, df["price"] * df["qty"], 0)
\`\`\`

- apply with axis=1 calls a Python function once per row, creating a Series for each row: slow Python-level work.
- Vectorized operations work on whole columns in optimized C code (NumPy), often 50-100x faster.
- For several conditions use np.select(conditions, choices, default).
- Other vectorized tools: .str methods for text, .dt for dates, .map with a dict for lookups, pd.cut for binning.
- Use apply only when no vectorized alternative exists.
`,
  ),
  q(
    "data-analysis-python",
    "How do you detect outliers using the IQR method?",
    "Data Cleaning",
    "MEDIUM",
    `
Explain the IQR method for outliers and write pandas code to flag outliers in a column called salary. What would you do with them?
`,
    `
IQR = Q3 - Q1. Values below Q1 - 1.5 x IQR or above Q3 + 1.5 x IQR are outliers (this is what a box plot's whiskers show).

\`\`\`
q1, q3 = df["salary"].quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
df["is_outlier"] = ~df["salary"].between(low, high)
\`\`\`

Example: Q1 = 30,000, Q3 = 60,000, IQR = 30,000, bounds = -15,000 and 105,000.

Handling:
- First check if it is an error (typo, wrong unit) or a real extreme value.
- Fix or remove errors; for real values consider capping (clip(low, high)), log transform, or robust statistics like median.
- Alternative: z-score (|z| > 3) for roughly normal data.
`,
    { role: "Data Scientist" },
  ),
  q(
    "data-analysis-python",
    "What is the difference between pivot_table and groupby?",
    "Pandas",
    "MEDIUM",
    `
Create a table of total sales with regions as rows and months as columns, using both groupby and pivot_table. When would you prefer each?
`,
    `
\`\`\`
# groupby + unstack
t1 = df.groupby(["region", "month"])["sales"].sum().unstack(fill_value=0)

# pivot_table
t2 = df.pivot_table(index="region", columns="month", values="sales",
                    aggfunc="sum", fill_value=0, margins=True)
\`\`\`

- Both give the same matrix; pivot_table is a convenience wrapper around groupby that produces a wide, Excel-like layout.
- pivot_table offers fill_value, margins (row and column totals) and multiple aggfuncs easily.
- groupby is more flexible for chained operations, custom aggregations and long-format output.
- pivot (without _table) only reshapes and fails if index/column pairs are duplicated, because it does not aggregate.
`,
  ),
  q(
    "data-analysis-python",
    "How do you work with dates and resample time series in pandas?",
    "Time Series",
    "MEDIUM",
    `
order_date is stored as text like "2024-03-15". Convert it, extract year/month/weekday, and compute monthly total sales.
`,
    `
\`\`\`
df["order_date"] = pd.to_datetime(df["order_date"], format="%Y-%m-%d")
df["year"] = df["order_date"].dt.year
df["month"] = df["order_date"].dt.month
df["weekday"] = df["order_date"].dt.day_name()

monthly = df.set_index("order_date")["sales"].resample("ME").sum()
\`\`\`

- resample works on a DatetimeIndex: "D" daily, "W" weekly, "ME" month end ("M" in pandas versions before 2.2), "QE" quarterly.
- Alternative without an index: df.groupby(df["order_date"].dt.to_period("M"))["sales"].sum().
- errors="coerce" turns unparseable dates into NaT instead of raising.
- Use parse_dates in read_csv to convert while loading.
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-analysis-python",
    "What causes SettingWithCopyWarning and how do you fix it?",
    "Pandas",
    "MEDIUM",
    `
This code raises SettingWithCopyWarning and sometimes does not change the data:

high = df[df["salary"] > 50000]
high["band"] = "High"

Why, and how do you fix it?
`,
    `
df[df["salary"] > 50000] may return a view or a copy of df; pandas cannot tell whether you meant to modify the original. Assigning to it is chained assignment, and the change may be lost.

Fixes:
- To modify the original DataFrame, use one .loc call:
\`\`\`
df.loc[df["salary"] > 50000, "band"] = "High"
\`\`\`
- To work on a separate subset, make an explicit copy:
\`\`\`
high = df[df["salary"] > 50000].copy()
high["band"] = "High"
\`\`\`
Avoid df["band"][mask] = ...; with Copy-on-Write (default in pandas 3.0) chained assignment never updates the original.
`,
  ),
  q(
    "data-analysis-python",
    "What is broadcasting in NumPy?",
    "NumPy",
    "MEDIUM",
    `
What is broadcasting? What are the shapes of the results (or errors) for:
1. shape (3, 4) + shape (4,)
2. shape (3, 1) + shape (1, 4)
3. shape (3,) + shape (4,)
`,
    `
Broadcasting lets NumPy do element-wise operations on arrays of different shapes without copying data. Shapes are compared from the right; two dimensions are compatible if they are equal or one of them is 1. Missing leading dimensions count as 1.

1. (3, 4) + (4,): (4,) is treated as (1, 4) and stretched over 3 rows: result (3, 4). Common for subtracting column means: X - X.mean(axis=0).
2. (3, 1) + (1, 4): both stretch: result (3, 4).
3. (3,) + (4,): 3 vs 4, neither is 1: ValueError (operands could not be broadcast).

To normalise rows instead, keep dims: X - X.mean(axis=1, keepdims=True).
`,
    { role: "Data Scientist" },
  ),
  q(
    "data-analysis-python",
    "How do you analyse a CSV that is too large for memory?",
    "Performance",
    "HARD",
    `
You have a 6 GB CSV of transactions and an 8 GB laptop. pd.read_csv crashes with a MemoryError. How do you analyse it?
`,
    `
Reduce what you load:
- usecols=["date", "store", "amount"] to read only needed columns.
- dtype={"store": "category", "amount": "float32"}; category for repeated strings saves a lot.
- Downcast integers with pd.to_numeric(..., downcast="integer").

Process in chunks:
\`\`\`
totals = None
for chunk in pd.read_csv("tx.csv", usecols=["store", "amount"], chunksize=1_000_000):
    part = chunk.groupby("store")["amount"].sum()
    totals = part if totals is None else totals.add(part, fill_value=0)
\`\`\`

Other options:
- Convert once to Parquet (columnar, compressed, typed) and read only needed columns.
- Use tools built for larger data: DuckDB or Polars (lazy, out-of-core), Dask, or load into a database and use SQL.
- Check memory with df.info(memory_usage="deep").
`,
    { role: "Data Scientist" },
  ),
  q(
    "data-analysis-python",
    "Find the top 3 products by sales in each region with pandas",
    "Pandas",
    "HARD",
    `
DataFrame sales has columns region, product, amount (many rows per product). Return the top 3 products by total amount for each region, with their rank.
`,
    `
\`\`\`
totals = sales.groupby(["region", "product"], as_index=False)["amount"].sum()

totals["rank"] = (
    totals.groupby("region")["amount"]
    .rank(method="dense", ascending=False)
    .astype(int)
)
top3 = totals[totals["rank"] <= 3].sort_values(["region", "rank"])
\`\`\`

Shorter alternative without ranks:
\`\`\`
top3 = (totals.sort_values("amount", ascending=False)
              .groupby("region").head(3))
\`\`\`

- First aggregate to one row per region and product, then rank within region.
- method="dense" keeps ties together (like SQL DENSE_RANK); head(3) returns exactly 3 rows.
- groupby(...).nlargest(3) on a Series also works but returns a MultiIndex.
`,
    { role: "Data Analyst" },
  ),
  q(
    "data-analysis-python",
    "Compute a 7-day rolling average per store",
    "Time Series",
    "HARD",
    `
DataFrame daily has columns store_id, date, sales, with one row per store per day. Add a column with the 7-day rolling average of sales for each store. What can go wrong if some days are missing?
`,
    `
\`\`\`
daily = daily.sort_values(["store_id", "date"])
daily["avg_7d"] = (
    daily.groupby("store_id")["sales"]
    .transform(lambda s: s.rolling(7, min_periods=1).mean())
)
\`\`\`

- Sort first: rolling works on row order.
- groupby + transform keeps the original row alignment and stops windows from crossing stores.
- min_periods=1 gives a value for the first 6 days instead of NaN.

Missing days: rolling(7) means 7 rows, not 7 days, so gaps stretch the window. Fix by using a time-based window on a DatetimeIndex:
\`\`\`
daily.set_index("date").groupby("store_id")["sales"].rolling("7D").mean()
\`\`\`
or reindex each store to a full date range and fill missing sales with 0 first.
`,
  ),
  q(
    "data-analysis-python",
    "How do you reshape data between wide and long format?",
    "Pandas",
    "HARD",
    `
You have marks in wide format:

student | maths | physics | chemistry
Asha    | 90    | 85      | 78

Convert it to long format (student, subject, marks), compute each subject's average, then convert back to wide. Why does long format matter for analysis and plotting?
`,
    `
\`\`\`
long = wide.melt(id_vars="student", var_name="subject", value_name="marks")
subject_avg = long.groupby("subject")["marks"].mean()
back = long.pivot(index="student", columns="subject", values="marks").reset_index()
\`\`\`

- melt turns columns into rows (wide to long); pivot does the reverse.
- pivot fails on duplicate student-subject pairs; use pivot_table with an aggfunc in that case.
- stack/unstack do the same with index levels.

Why long ("tidy") format: each row is one observation, so groupby, filtering and plotting libraries like seaborn (hue="subject") work naturally, and adding a new subject adds rows instead of changing the schema. Wide format is better for display and for models that need one row per entity.
`,
  ),
  q(
    "data-analysis-python",
    "Calculate the repeat purchase rate of customers",
    "EDA",
    "HARD",
    `
DataFrame orders has columns order_id, customer_id, order_date, amount. Find:
1. The percentage of customers who ordered more than once.
2. Each customer's first order date.
3. The average days between a customer's first and second order.
`,
    `
\`\`\`
orders = orders.sort_values(["customer_id", "order_date"])

counts = orders.groupby("customer_id")["order_id"].nunique()
repeat_rate = (counts > 1).mean() * 100

first_order = orders.groupby("customer_id")["order_date"].min()

orders["n"] = orders.groupby("customer_id").cumcount() + 1
two = orders[orders["n"] <= 2].pivot(index="customer_id", columns="n",
                                      values="order_date")
gap_days = (two[2] - two[1]).dt.days.mean()
\`\`\`

- (counts > 1) is a boolean Series; its mean is the share of True values.
- cumcount numbers each customer's orders in date order.
- Customers with only one order have NaT in column 2, and mean() skips them.
- Extend the first-order date to monthly cohorts to build a retention table.
`,
    { company: "Flipkart", role: "Data Analyst" },
  ),

  // --------------------------------------------------- machine-learning
  q(
    "machine-learning",
    "What is the difference between supervised and unsupervised learning?",
    "Basics",
    "EASY",
    `
Explain supervised, unsupervised and reinforcement learning with one real example of each.
`,
    `
- Supervised learning: trains on labelled data (input with the correct output) to predict labels for new data. Example: predicting house prices (regression) or spam vs not spam (classification).
- Unsupervised learning: finds structure in unlabelled data. Example: grouping customers into segments with k-means, or reducing dimensions with PCA.
- Reinforcement learning: an agent learns by acting in an environment and receiving rewards or penalties. Example: game-playing agents, robot navigation.
- Semi-supervised learning uses a small labelled set with a large unlabelled set.
`,
  ),
  q(
    "machine-learning",
    "What is the difference between classification and regression?",
    "Basics",
    "EASY",
    `
How do classification and regression problems differ? Which metrics are used for each? Is "predicting tomorrow's temperature" classification or regression?
`,
    `
- Classification predicts a discrete category: will the customer churn (yes/no), which digit is in an image (0-9).
- Regression predicts a continuous number: house price, sales next month.
- Temperature is a continuous value, so it is regression (it becomes classification if you predict "hot/mild/cold").

Metrics:
- Classification: accuracy, precision, recall, F1, ROC-AUC, confusion matrix.
- Regression: MAE, MSE, RMSE, R-squared.

Note: logistic regression is a classification algorithm despite its name.
`,
  ),
  q(
    "machine-learning",
    "Why do we split data into training and test sets?",
    "Model Evaluation",
    "EASY",
    `
Why can't we evaluate a model on the same data it was trained on? What are training, validation and test sets used for?
`,
    `
A model can memorise training data, so its score on that data is overly optimistic. We need unseen data to estimate real-world performance.

- Training set (~60-80%): used to fit model parameters.
- Validation set (~10-20%): used to tune hyperparameters and choose between models.
- Test set (~10-20%): used once at the end for an unbiased final estimate.

\`\`\`
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
\`\`\`
stratify keeps class proportions equal in both sets. For time series, split by time instead of randomly.
`,
  ),
  q(
    "machine-learning",
    "What are overfitting and underfitting?",
    "Overfitting",
    "EASY",
    `
Explain overfitting and underfitting. How do you recognise each from training and test scores, and how do you fix them?
`,
    `
- Overfitting: the model learns noise in the training data. High training accuracy, much lower test accuracy (e.g. 99% vs 75%).
- Underfitting: the model is too simple to capture the pattern. Low accuracy on both training and test data.

Fix overfitting:
- More training data, or data augmentation.
- Simpler model, fewer features, regularization (L1/L2), dropout.
- Pruning or limiting depth for trees; early stopping.
- Cross-validation to tune hyperparameters.

Fix underfitting:
- More complex model or more relevant features.
- Less regularization, train longer.
`,
  ),
  q(
    "machine-learning",
    "What is a confusion matrix?",
    "Model Evaluation",
    "EASY",
    `
Explain the confusion matrix for a binary classifier that detects fraud. What are TP, FP, FN and TN, and which is worse for a fraud model?
`,
    `
A confusion matrix compares predicted and actual classes:

| | Predicted fraud | Predicted normal |
| Actual fraud | TP | FN |
| Actual normal | FP | TN |

- TP: fraud correctly flagged.
- FP (Type I error): a normal transaction wrongly flagged.
- FN (Type II error): fraud missed.
- TN: normal transaction correctly passed.

For fraud, FN is usually costlier (money lost), so we care about recall; too many FP annoy customers, so precision also matters.
Accuracy = (TP + TN) / total, precision = TP / (TP + FP), recall = TP / (TP + FN).
`,
  ),
  q(
    "machine-learning",
    "How does linear regression work?",
    "Algorithms",
    "EASY",
    `
Explain linear regression: what it models, how the line is fitted, and the main assumptions.
`,
    `
Linear regression models the target as a weighted sum of features: y = b0 + b1*x1 + b2*x2 + ... + error.

Fitting:
- It chooses coefficients that minimise the sum of squared errors between predicted and actual values (Ordinary Least Squares).
- Solved directly with the normal equation or iteratively with gradient descent.
- Each coefficient is the expected change in y for a one-unit change in that feature, holding others constant.

Assumptions:
- Linear relationship between features and target.
- Independent errors with constant variance (homoscedasticity).
- Errors roughly normally distributed.
- Little multicollinearity among features.

Evaluate with R-squared, MAE and RMSE.
`,
  ),
  q(
    "machine-learning",
    "Why is feature scaling needed?",
    "Feature Engineering",
    "EASY",
    `
What is feature scaling? Explain standardization vs normalization (min-max), and which algorithms need scaling and which do not.
`,
    `
Features on very different ranges (age 20-60, salary 2,00,000-50,00,000) can dominate distance calculations and slow gradient descent.

- Standardization (z-score): (x - mean) / std, giving mean 0 and std 1. StandardScaler. Good default, handles outliers better than min-max.
- Normalization (min-max): (x - min) / (max - min), giving range 0-1. MinMaxScaler. Useful for bounded inputs such as neural network pixels.

Need scaling: KNN, k-means, SVM, PCA, linear/logistic regression with regularization, neural networks.
Do not need it: tree-based models (decision tree, random forest, XGBoost), since splits depend only on order.

Fit the scaler on training data only, then transform test data with it, to avoid leakage.
`,
    { role: "ML Engineer" },
  ),
  q(
    "machine-learning",
    "What is the bias-variance tradeoff?",
    "Overfitting",
    "MEDIUM",
    `
Explain bias and variance, how they relate to model complexity, and how they connect to underfitting and overfitting.
`,
    `
Expected prediction error = bias squared + variance + irreducible noise.

- Bias: error from wrong or too-simple assumptions. High bias models (linear model on curved data) underfit; they are consistently wrong.
- Variance: error from sensitivity to the particular training sample. High variance models (deep unpruned trees) overfit; predictions change a lot with different training data.
- As complexity increases, bias falls and variance rises. The best model balances them at the minimum total test error.

Controls:
- Reduce variance: more data, regularization, bagging (random forest), simpler models.
- Reduce bias: more features, more complex models, boosting.
- Learning curves (training vs validation error as data grows) show which problem you have.
`,
    { role: "Data Scientist" },
  ),
  q(
    "machine-learning",
    "Calculate precision, recall and F1 from a confusion matrix",
    "Model Evaluation",
    "MEDIUM",
    `
A disease test on 100 patients gives: TP = 40, FP = 10, FN = 20, TN = 30.

Calculate accuracy, precision, recall and F1 score. Which metric matters more for a disease screening test, and why?
`,
    `
- Accuracy = (40 + 30) / 100 = 0.70
- Precision = TP / (TP + FP) = 40 / 50 = 0.80
- Recall = TP / (TP + FN) = 40 / 60 = 0.667
- F1 = 2 x P x R / (P + R) = 2 x 0.8 x 0.667 / 1.467 = 0.727

For screening, recall matters more: missing a sick patient (FN) is worse than a false alarm that a follow-up test can clear. For a spam filter, precision matters more, because losing a real email (FP) is worse.

F1 is the harmonic mean, useful when you need a balance and classes are imbalanced. The decision threshold trades precision against recall.
`,
    { role: "Data Scientist" },
  ),
  q(
    "machine-learning",
    "What is the difference between L1 and L2 regularization?",
    "Overfitting",
    "MEDIUM",
    `
Explain L1 (Lasso) and L2 (Ridge) regularization. How do they change the loss function and the learned coefficients?
`,
    `
Regularization adds a penalty on coefficient size to the loss, discouraging complex models and reducing overfitting.

- L1 (Lasso): loss + lambda x sum of |w|. Pushes some coefficients exactly to zero, so it also performs feature selection. Useful with many irrelevant features.
- L2 (Ridge): loss + lambda x sum of w squared. Shrinks all coefficients towards zero but rarely to exactly zero. Handles multicollinearity well and is stable.
- Elastic Net combines both.
- lambda (alpha in sklearn; in LogisticRegression C = 1/lambda) controls strength: too high causes underfitting, too low does little. Tune it with cross-validation.
- Scale features first so the penalty treats them fairly.
`,
    { role: "ML Engineer" },
  ),
  q(
    "machine-learning",
    "What is k-fold cross-validation?",
    "Model Evaluation",
    "MEDIUM",
    `
What is k-fold cross-validation, why is it better than a single train/test split, and what are stratified and time-series variants?
`,
    `
- Split the data into k equal folds (commonly 5 or 10).
- Train on k-1 folds and validate on the remaining fold; repeat k times so each fold is the validation set once.
- Report the mean (and standard deviation) of the k scores.

\`\`\`
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5, scoring="f1")
print(scores.mean(), scores.std())
\`\`\`

Why better: every row is used for both training and validation, and the estimate is less dependent on one lucky or unlucky split. Cost: training k times.

Variants:
- Stratified k-fold keeps class proportions in each fold (default for classifiers in sklearn).
- TimeSeriesSplit always trains on the past and validates on the future.
- GridSearchCV uses cross-validation to tune hyperparameters.
`,
  ),
  q(
    "machine-learning",
    "How does a decision tree decide where to split?",
    "Algorithms",
    "MEDIUM",
    `
Explain how a decision tree chooses a split. What are Gini impurity and entropy? Compute the Gini impurity of a node with 6 positive and 4 negative samples.
`,
    `
At each node the tree tries candidate features and thresholds and picks the split that most reduces impurity (largest information gain) in the child nodes, weighted by their size. It repeats recursively until a stopping rule (max_depth, min_samples_leaf) is reached.

- Gini impurity = 1 - sum of p_i squared. Zero for a pure node.
- Entropy = - sum of p_i x log2(p_i). Information gain = parent entropy - weighted child entropy.

Node with 6 positive, 4 negative: p = 0.6 and 0.4.
Gini = 1 - (0.36 + 0.16) = 0.48.
Entropy = -(0.6 log2 0.6 + 0.4 log2 0.4) = about 0.971.

Trees overfit easily if grown fully, so limit depth or prune them. They need no feature scaling.
`,
  ),
  q(
    "machine-learning",
    "Why is a random forest usually better than a single decision tree?",
    "Algorithms",
    "MEDIUM",
    `
How does a random forest work, and why does it generalise better than one decision tree? What are its drawbacks?
`,
    `
Random forest is an ensemble of decision trees using bagging:
- Each tree is trained on a bootstrap sample (random rows drawn with replacement).
- At each split, only a random subset of features is considered (max_features), which makes the trees less correlated.
- Prediction: majority vote for classification, average for regression.

Why better: a single deep tree has high variance. Averaging many decorrelated trees reduces variance a lot while keeping bias low, so it overfits less.

Extras: out-of-bag (OOB) score gives a free validation estimate; feature importances.

Drawbacks: less interpretable than one tree, larger and slower to predict, and cannot extrapolate beyond the target range seen in training (regression).
`,
    { role: "Data Scientist" },
  ),
  q(
    "machine-learning",
    "How do you handle an imbalanced dataset?",
    "Model Evaluation",
    "MEDIUM",
    `
Only 1% of transactions in your dataset are fraud. A model gives 99% accuracy. Is it good? How would you handle the imbalance?
`,
    `
Not necessarily: predicting "not fraud" for everything also gives 99% accuracy while catching zero fraud. Accuracy is misleading here.

Better metrics: precision, recall, F1, PR-AUC, confusion matrix.

Techniques:
- Resampling the training set only: oversample the minority (random oversampling, SMOTE) or undersample the majority.
- Class weights: class_weight="balanced" in sklearn, or scale_pos_weight in XGBoost, to penalise minority mistakes more.
- Tune the decision threshold instead of using 0.5, based on the cost of FN vs FP.
- Stratified splits and cross-validation.
- Collect more minority examples, or treat it as anomaly detection.

Never resample before splitting, or test data leaks into training.
`,
    { role: "Data Scientist" },
  ),
  q(
    "machine-learning",
    "Why use logistic regression instead of linear regression for classification?",
    "Algorithms",
    "MEDIUM",
    `
Why can't we simply use linear regression to predict a 0/1 label? How does logistic regression work and what loss does it use?
`,
    `
Problems with linear regression for 0/1 labels:
- Predictions are unbounded (can be below 0 or above 1), so they are not probabilities.
- Outliers shift the line and the 0.5 threshold badly.
- Squared error is not a good fit for a binary outcome.

Logistic regression:
- Computes z = b0 + b1*x1 + ... and passes it through the sigmoid: p = 1 / (1 + e^(-z)), which lies between 0 and 1.
- Predict class 1 if p >= threshold (0.5 by default); the decision boundary is linear.
- Coefficients change the log-odds: log(p / (1 - p)) = z.
- Trained by minimising log loss (binary cross-entropy), which is convex, using gradient descent or similar solvers.
- Extends to multiple classes with softmax (multinomial) or one-vs-rest.
`,
  ),
  q(
    "machine-learning",
    "What is the difference between bagging and boosting?",
    "Algorithms",
    "HARD",
    `
Compare bagging and boosting. Explain how gradient boosting (as in XGBoost or LightGBM) builds its model, and which hyperparameters matter most.
`,
    `
Bagging (random forest):
- Trains many models independently and in parallel on bootstrap samples, then averages or votes.
- Mainly reduces variance; works best with strong, high-variance learners like deep trees.

Boosting:
- Trains models sequentially; each new model focuses on the errors of the ones before.
- Mainly reduces bias; uses weak learners like shallow trees. More prone to overfitting noisy data if not tuned.
- AdaBoost reweights misclassified samples.

Gradient boosting:
- Start with a constant prediction (e.g. the mean).
- Each round, fit a small tree to the negative gradient of the loss (the residuals for squared error).
- Add it scaled by the learning rate: F_new = F_old + eta x tree.

Key hyperparameters: n_estimators, learning_rate (lower needs more trees), max_depth, subsample, colsample_bytree, regularization (lambda, alpha). Use early stopping on a validation set.
`,
    { role: "Data Scientist" },
  ),
  q(
    "machine-learning",
    "What is data leakage and how do you prevent it?",
    "Model Evaluation",
    "HARD",
    `
A churn model scores 98% AUC in validation but performs poorly after deployment. One suspicion is data leakage. What is it, what are common causes, and how do you prevent it?
`,
    `
Data leakage is when information that would not be available at prediction time gets into training, so validation scores look unrealistically good.

Common causes:
- Target leakage: features created after the outcome, e.g. "account_closed_date" or "number of retention calls" in a churn model.
- Preprocessing on the full dataset before splitting: fitting a scaler, imputer, encoder or SMOTE on all data.
- Random splits on time-series data, so the model sees the future.
- Duplicate or related rows (same customer) in both train and test.

Prevention:
- Split first; fit every transformation on training data only. A sklearn Pipeline inside cross-validation does this automatically.
- For each feature, ask "would I know this at the moment of prediction?"
- Use time-based splits and group-based splits (GroupKFold) where needed.
- Be suspicious of near-perfect scores and inspect top feature importances.
`,
    { role: "ML Engineer" },
  ),
  q(
    "machine-learning",
    "When should you use ROC-AUC versus PR-AUC?",
    "Model Evaluation",
    "HARD",
    `
Explain the ROC curve and the precision-recall curve. On a dataset with 0.5% positives, why can ROC-AUC look excellent while the model is weak in practice?
`,
    `
- ROC curve plots true positive rate (recall) against false positive rate (FP / (FP + TN)) across thresholds. ROC-AUC is the probability that a random positive is ranked above a random negative; 0.5 is random, 1.0 perfect.
- PR curve plots precision against recall across thresholds. Its baseline equals the positive rate (0.005 here), not 0.5.

Why ROC can mislead with heavy imbalance: FPR divides by the huge number of negatives. With 1,000,000 negatives, 10,000 false positives is only a 1% FPR, so ROC looks great, but if there are only 5,000 positives, precision is at most 5,000 / 15,000 = 33%.

Use PR-AUC (average precision) when positives are rare and you care about the positive class (fraud, disease). ROC-AUC is fine for balanced data or when both classes matter equally. Both are threshold-free; pick the operating threshold separately based on business costs.
`,
    { role: "Data Scientist" },
  ),
  q(
    "machine-learning",
    "How does k-means clustering work and how do you choose k?",
    "Algorithms",
    "HARD",
    `
Explain the k-means algorithm step by step, how to choose the number of clusters, and its main limitations.
`,
    `
Algorithm:
1. Choose k and initialise k centroids (k-means++ spreads them out for better results).
2. Assign each point to the nearest centroid (usually Euclidean distance).
3. Move each centroid to the mean of its assigned points.
4. Repeat steps 2-3 until assignments stop changing or a max number of iterations.

It minimises the within-cluster sum of squares (inertia). It converges, but possibly to a local minimum, so run it several times (n_init).

Choosing k:
- Elbow method: plot inertia vs k and pick where the decrease flattens.
- Silhouette score: higher is better (range -1 to 1).
- Business meaning: are the segments actionable?

Limitations: needs k in advance; assumes roughly spherical, similar-size clusters; sensitive to outliers and feature scale (standardise first); works only on numeric features. Alternatives: DBSCAN for arbitrary shapes and noise, Gaussian mixtures, hierarchical clustering.
`,
  ),
  q(
    "machine-learning",
    "How does gradient descent work and how does learning rate affect it?",
    "Optimization",
    "HARD",
    `
Explain gradient descent for training a model. What happens with a learning rate that is too high or too low? Compare batch, stochastic and mini-batch gradient descent.
`,
    `
Gradient descent minimises a loss L(w) by repeatedly moving the weights opposite to the gradient:
w = w - learning_rate x dL/dw

Learning rate:
- Too low: very slow convergence; may stall on plateaus.
- Too high: overshoots the minimum, loss oscillates or diverges.
- Common fixes: learning rate schedules (decay), and adaptive optimizers like Adam or RMSProp; plot loss vs epochs to check.

Variants:
- Batch: gradient over the whole dataset per step; stable but slow and memory-heavy.
- Stochastic (SGD): one sample per step; fast, noisy updates that can escape shallow local minima.
- Mini-batch (e.g. 32-256 samples): the usual compromise, efficient on GPUs.

Feature scaling makes the loss surface better shaped, so gradient descent converges faster. Momentum smooths the updates by adding a fraction of the previous step.
`,
    { role: "ML Engineer" },
  ),
];
