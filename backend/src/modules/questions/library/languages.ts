import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const LANGUAGES_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- python
  q(
    "python",
    "What is the difference between a list and a tuple?",
    "Data Types",
    "EASY",
    `
Python has both lists and tuples for storing sequences. How are they different, and when would you pick a tuple over a list?
`,
    `
- A list is mutable (you can append, remove, change items); a tuple is immutable once created.
- Syntax: lists use [1, 2, 3], tuples use (1, 2, 3). A one-item tuple needs a trailing comma: (1,).
- Tuples are hashable when all their items are hashable, so they can be dictionary keys or set members; lists cannot.
- Tuples are slightly smaller in memory and a little faster to create and iterate.
- Use a tuple for fixed records (a coordinate, a database row, multiple return values) and a list for a collection that grows or changes.
`,
    { company: "Infosys" },
  ),
  q(
    "python",
    "What is the difference between 'is' and '=='?",
    "Basics",
    "EASY",
    `
What does this print, and why?

\`\`\`
a = [1, 2, 3]
b = [1, 2, 3]
c = a
print(a == b, a is b, a is c)
\`\`\`
`,
    `
It prints True False True.

- == compares values (it calls __eq__). a and b hold equal contents, so a == b is True.
- is compares identity: whether both names point to the same object in memory (same id()). a and b are two separate list objects, so a is b is False; c = a binds c to the very same object, so a is c is True.
- Use is only for singletons such as None (if x is None), and == for comparing values.
- Small integers and some strings are cached by CPython, so "is" may appear to work for them, but you should never rely on that.
`,
  ),
  q(
    "python",
    "Which Python types are mutable and which are immutable?",
    "Data Types",
    "EASY",
    `
Classify the built-in types int, float, str, tuple, list, dict, set and frozenset as mutable or immutable. Why does this matter when you pass them to a function?
`,
    `
- Immutable: int, float, bool, str, tuple, frozenset, bytes.
- Mutable: list, dict, set, bytearray, and most user-defined objects.
- Python passes object references ("call by object reference"). If a function mutates a mutable argument (lst.append(x)), the caller sees the change. Rebinding the parameter (lst = [ ]) or "changing" an immutable value creates a new object and the caller is unaffected.
- Only immutable (hashable) values can be dict keys or set members.
`,
  ),
  q(
    "python",
    "What are *args and **kwargs?",
    "Functions",
    "EASY",
    `
Explain *args and **kwargs with an example. What does this print?

\`\`\`
def show(a, *args, **kwargs):
    print(a, args, kwargs)

show(1, 2, 3, x=4, y=5)
\`\`\`
`,
    `
It prints: 1 (2, 3) {'x': 4, 'y': 5}

- *args collects extra positional arguments into a tuple.
- **kwargs collects extra keyword arguments into a dict.
- The names are a convention; the * and ** are what matter.
- The same symbols unpack at a call site: f(*my_list, **my_dict).
- Typical use: wrappers and decorators that forward any arguments to another function.
`,
  ),
  q(
    "python",
    "Write a list comprehension for the squares of even numbers",
    "Basics",
    "EASY",
    `
Using a list comprehension, build a list of the squares of all even numbers from 1 to 20. Then explain how a list comprehension differs from a normal for loop.
`,
    `
\`\`\`
squares = [n * n for n in range(1, 21) if n % 2 == 0]
# [4, 16, 36, 64, 100, 144, 196, 256, 324, 400]
\`\`\`

- Form: [expression for item in iterable if condition].
- It is equivalent to a for loop that appends to an empty list, but shorter and usually a bit faster.
- Similar syntax exists for sets {...}, dicts {k: v for ...} and generators (...).
- Avoid deeply nested comprehensions; a plain loop is clearer once the logic gets complex.
`,
    { company: "TCS" },
  ),
  q(
    "python",
    "How does exception handling work with try, except, else and finally?",
    "Basics",
    "EASY",
    `
Explain the role of each block in try / except / else / finally, and write a small example that reads an integer from the user safely.
`,
    `
- try: code that might raise an exception.
- except SomeError: runs only if that exception is raised in try. Catch specific exceptions, not a bare except.
- else: runs only if try finished without an exception.
- finally: always runs (cleanup such as closing files), even after return or an unhandled error.

\`\`\`
try:
    n = int(input("Enter a number: "))
except ValueError:
    print("Not a valid integer")
else:
    print("Square is", n * n)
finally:
    print("Done")
\`\`\`
`,
  ),
  q(
    "python",
    "What is the difference between remove(), pop() and del on a list?",
    "Data Types",
    "EASY",
    `
Given nums = [10, 20, 30, 20], explain what nums.remove(20), nums.pop(1) and del nums[1] each do. Which of them return a value?
`,
    `
- remove(20): deletes the first item equal to 20 (by value). Returns None; raises ValueError if the value is absent. Result: [10, 30, 20].
- pop(1): deletes the item at index 1 and returns it (20). pop() with no index removes and returns the last item. Raises IndexError on a bad index.
- del nums[1]: a statement, not a method; deletes by index or slice (del nums[1:3]) and returns nothing. del nums deletes the name itself.
- pop() from the end is O(1); remove() and pop(i) from the middle are O(n) because items shift.
`,
  ),
  q(
    "python",
    "Why are mutable default arguments dangerous?",
    "Functions",
    "MEDIUM",
    `
What does this print, and how would you fix it?

\`\`\`
def add_item(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add_item(1))
print(add_item(2))
\`\`\`
`,
    `
It prints [1] and then [1, 2].

- Default values are evaluated once, when the def statement runs, not on every call. Every call that omits bucket shares the same list object, so items pile up.
- Fix: use None as a sentinel and create a new list inside the function.

\`\`\`
def add_item(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
\`\`\`

- The same trap applies to dicts, sets and any other mutable default.
`,
    { role: "SDE" },
  ),
  q(
    "python",
    "What is the difference between a shallow copy and a deep copy?",
    "Data Types",
    "MEDIUM",
    `
Explain shallow vs deep copy. What does this print?

\`\`\`
import copy
a = [[1, 2], [3, 4]]
b = copy.copy(a)
c = copy.deepcopy(a)
a[0].append(99)
print(b[0], c[0])
\`\`\`
`,
    `
It prints [1, 2, 99] [1, 2].

- A shallow copy (copy.copy, list(a), a[:], dict.copy()) creates a new outer container but fills it with references to the same inner objects. Changing a nested object is visible through both.
- A deep copy (copy.deepcopy) recursively copies every nested object, so the copy is fully independent.
- Plain assignment (b = a) copies nothing; it just adds a second name for the same object.
- Deep copy is slower and uses more memory; use it only when nested data must not be shared.
`,
  ),
  q(
    "python",
    "What is a decorator? Write one that times a function",
    "Functions",
    "MEDIUM",
    `
Explain what a decorator is in Python. Write a decorator @timer that prints how long the decorated function took to run, and keeps the original function's name and docstring.
`,
    `
A decorator is a function that takes a function and returns a new function that wraps it. @timer above def f is shorthand for f = timer(f). It works because functions are first-class objects and inner functions form closures.

\`\`\`
import functools, time

def timer(func):
    @functools.wraps(func)          # keeps __name__, __doc__
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(func.__name__, "took", time.perf_counter() - start, "s")
        return result
    return wrapper

@timer
def work(n):
    return sum(range(n))
\`\`\`

- Common uses: logging, caching (functools.lru_cache), authentication checks, retries.
`,
    { role: "Backend Developer" },
  ),
  q(
    "python",
    "What is a generator and how is it different from a list?",
    "Generators",
    "MEDIUM",
    `
Explain generators and the yield keyword. Why might sum(x * x for x in range(10**8)) be preferred over sum([x * x for x in range(10**8)])?
`,
    `
- A generator function contains yield. Calling it returns a generator object; values are produced lazily, one per next() call, and the function's state is paused between calls.
- A list builds every element in memory up front. The generator expression (x * x for x in ...) holds just one value at a time, so memory stays constant instead of holding 10^8 integers.
- Generators can be iterated only once; after StopIteration they are exhausted.
- They suit large files, streams and infinite sequences.

\`\`\`
def countdown(n):
    while n > 0:
        yield n
        n -= 1

list(countdown(3))   # [3, 2, 1]
\`\`\`
`,
  ),
  q(
    "python",
    "What is the difference between __init__ and __new__?",
    "OOP",
    "MEDIUM",
    `
When you write obj = MyClass(5), both __new__ and __init__ are involved. What does each one do, and when would you ever override __new__?
`,
    `
- __new__(cls, ...) is a static method that creates and returns the new instance. It runs first.
- __init__(self, ...) initialises the already-created instance and must return None.
- If __new__ returns an instance of cls, Python then calls __init__ on it; otherwise __init__ is skipped.
- Override __new__ when you control creation itself: subclassing immutable types (int, str, tuple) where the value must be set at creation, implementing singletons or instance caching, or metaclass work.
- In everyday classes you only write __init__.
`,
  ),
  q(
    "python",
    "What is the difference between @staticmethod and @classmethod?",
    "OOP",
    "MEDIUM",
    `
Explain instance methods, class methods and static methods in Python, and give a realistic use for @classmethod.
`,
    `
- Instance method: first parameter self (the instance). Can read and change instance and class state.
- @classmethod: first parameter cls (the class). Can read and change class state and create instances, and works correctly with subclasses.
- @staticmethod: receives neither self nor cls. It is a plain function kept in the class namespace for organisation.
- Typical classmethod use: alternative constructors.

\`\`\`
class Date:
    def __init__(self, d, m, y):
        self.d, self.m, self.y = d, m, y

    @classmethod
    def from_string(cls, s):        # "03-10-2026"
        d, m, y = map(int, s.split("-"))
        return cls(d, m, y)
\`\`\`
`,
  ),
  q(
    "python",
    "Why do lambdas in a loop all return the same value?",
    "Functions",
    "MEDIUM",
    `
What does this print, and how do you fix it so it prints [0, 1, 2]?

\`\`\`
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])
\`\`\`
`,
    `
It prints [2, 2, 2].

- Closures capture variables, not values. Each lambda looks up i when it is called; by then the loop has finished and i is 2. This is called late binding.
- Fix 1: bind the current value as a default argument, which is evaluated at definition time:

\`\`\`
funcs = [lambda i=i: i for i in range(3)]
\`\`\`

- Fix 2: use functools.partial or a factory function that takes i as a parameter.
`,
  ),
  q(
    "python",
    "Why does [[0]*3]*3 behave strangely when you change one cell?",
    "Data Types",
    "MEDIUM",
    `
What does this print? How would you create a 3x3 grid correctly?

\`\`\`
grid = [[0] * 3] * 3
grid[0][0] = 1
print(grid)
\`\`\`
`,
    `
It prints [[1, 0, 0], [1, 0, 0], [1, 0, 0]].

- [0] * 3 makes one inner list. Multiplying the outer list by 3 copies the reference three times, so all three rows are the same list object. Changing one row changes "all" of them.
- Correct way: build a new inner list per row.

\`\`\`
grid = [[0] * 3 for _ in range(3)]
\`\`\`

- [0] * 3 itself is safe because ints are immutable; the problem appears only when the repeated item is mutable.
`,
  ),
  q(
    "python",
    "What is the GIL and how does it affect multithreading?",
    "Internals",
    "HARD",
    `
Explain the Global Interpreter Lock in CPython. For a CPU-heavy task (e.g. computing primes) and an I/O-heavy task (e.g. downloading 100 URLs), would you use threads, processes or asyncio? Why?
`,
    `
- The GIL is a mutex in CPython that lets only one thread execute Python bytecode at a time. It simplifies memory management (reference counting) but stops threads from running Python code in parallel on multiple cores.
- CPU-bound work: threads give little or no speedup. Use multiprocessing / ProcessPoolExecutor (separate processes, each with its own GIL), or push work into C extensions like NumPy that release the GIL.
- I/O-bound work: threads work well because the GIL is released while a thread waits on network or disk. asyncio is another good choice for many concurrent connections in a single thread.
- The GIL does not make your code thread-safe: operations like counter += 1 are still not atomic, so shared state still needs locks.
- Recent CPython versions offer an optional free-threaded build without the GIL, but the default build still has it.
`,
    { role: "Backend Developer" },
  ),
  q(
    "python",
    "How does Python manage memory and garbage collection?",
    "Internals",
    "HARD",
    `
Explain how CPython frees objects that are no longer used. Why is reference counting alone not enough? Give an example.
`,
    `
- Every object has a reference count. Assigning, passing or storing it increments the count; deleting a name or leaving scope decrements it. At zero the object is freed immediately.
- Reference counting cannot free cycles: two objects that refer to each other keep each other's count above zero even when nothing else refers to them.

\`\`\`
a = []; b = []
a.append(b); b.append(a)
del a, b          # counts stay at 1 -> leaked without the GC
\`\`\`

- CPython adds a cyclic garbage collector (the gc module) that periodically finds unreachable groups of container objects and frees them. It is generational: new objects are checked often and survivors are checked less often.
- Small objects come from a private allocator (pymalloc) for speed.
- Tools: sys.getrefcount, gc.collect(), weakref for references that should not keep objects alive, tracemalloc for leak hunting.
`,
  ),
  q(
    "python",
    "What is the MRO and how does super() work with multiple inheritance?",
    "OOP",
    "HARD",
    `
Given the classes below, what is printed by D().hello(), and what is D.__mro__?

\`\`\`
class A:
    def hello(self): print("A")
class B(A):
    def hello(self): print("B"); super().hello()
class C(A):
    def hello(self): print("C"); super().hello()
class D(B, C):
    def hello(self): print("D"); super().hello()
\`\`\`
`,
    `
It prints D, B, C, A (one per line). D.__mro__ is (D, B, C, A, object).

- The Method Resolution Order is the order in which Python searches classes for an attribute. Python computes it with the C3 linearisation: a child comes before its parents, and parents keep the order they are listed in.
- super() does not mean "my parent"; it means "the next class after me in the MRO of the actual object". So inside B, super() points to C, not A.
- This is why A.hello runs only once even though both B and C inherit from A: the diamond is resolved cleanly.
- For cooperative multiple inheritance, every class in the chain should call super() and accept **kwargs it doesn't use.
`,
    { role: "SDE" },
  ),
  q(
    "python",
    "How do you write a context manager in Python?",
    "Generators",
    "HARD",
    `
Explain what the with statement does. Implement a context manager that measures and prints the time spent inside the block, first as a class and then with contextlib.
`,
    `
- with calls __enter__ on entry and __exit__ on exit, even if an exception is raised. __exit__ gets the exception details and can suppress the exception by returning True.

\`\`\`
import time
from contextlib import contextmanager

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        print("elapsed", time.perf_counter() - self.start)
        return False            # don't swallow exceptions

@contextmanager
def timer():
    start = time.perf_counter()
    try:
        yield
    finally:
        print("elapsed", time.perf_counter() - start)
\`\`\`

- Use cases: files, locks, DB transactions, temporary settings.
`,
  ),
  q(
    "python",
    "How does a Python dictionary work internally?",
    "Internals",
    "HARD",
    `
Explain how a dict stores and looks up keys, why lookups are O(1) on average, and why a list cannot be a dict key. Does a dict preserve insertion order?
`,
    `
- A dict is a hash table. For a key, Python computes hash(key) and uses it to pick a slot. CPython resolves collisions with open addressing (probing other slots), not linked lists.
- Lookup: hash the key, go to the slot, compare the stored hash and then the key with ==. With a good hash and a table kept under about two-thirds full (it resizes as it grows), this is O(1) on average, O(n) in the worst case.
- Keys must be hashable: their hash must never change. A list is mutable, so its hash could change after insertion and the entry would be lost; lists therefore define no hash. Tuples of immutable items are fine.
- Since CPython 3.6 dicts use a compact layout (a small index array plus a dense entries array), which saves memory. Insertion order is guaranteed by the language from Python 3.7.
- If you define __eq__ on a class, also define a consistent __hash__.
`,
    { role: "SDE" },
  ),

  // ------------------------------------------------------------------ java
  q(
    "java",
    "What is the difference between JDK, JRE and JVM?",
    "JVM",
    "EASY",
    `
Explain JDK, JRE and JVM and how they relate to each other. Why is Java called "platform independent"?
`,
    `
- JVM (Java Virtual Machine): runs compiled bytecode (.class files). It loads classes, verifies bytecode, interprets or JIT-compiles it to native code, and manages memory with the garbage collector. Each OS has its own JVM.
- JRE (Java Runtime Environment): the JVM plus the core class libraries needed to run Java programs.
- JDK (Java Development Kit): the JRE plus development tools such as javac (compiler), jar, javadoc and jdb.
- javac compiles source to bytecode once; the same bytecode runs on any platform that has a JVM ("write once, run anywhere"). The JVM itself is platform dependent; the bytecode is not.
`,
    { company: "TCS" },
  ),
  q(
    "java",
    "What is the difference between == and equals() for strings?",
    "Strings",
    "EASY",
    `
What does this print, and why?

\`\`\`
String s1 = "hello";
String s2 = "hello";
String s3 = new String("hello");
System.out.println(s1 == s2);
System.out.println(s1 == s3);
System.out.println(s1.equals(s3));
\`\`\`
`,
    `
It prints true, false, true.

- == compares references: whether both variables point to the same object.
- equals() compares contents (String overrides Object.equals).
- String literals are interned in the String constant pool, so s1 and s2 refer to the same pooled object and s1 == s2 is true.
- new String("hello") always creates a new object on the heap, so s1 == s3 is false, but the characters are equal, so equals() is true.
- Always compare strings with equals() (or equalsIgnoreCase()).
`,
    { company: "Infosys" },
  ),
  q(
    "java",
    "Why are strings immutable in Java?",
    "Strings",
    "EASY",
    `
String objects in Java cannot be changed after creation. Explain why the language designers made String immutable and what benefits that gives.
`,
    `
- String pool: literals are shared between many references. If one reference could change the shared object, every other user would see the change. Immutability makes pooling safe.
- Security: strings are used for class names, file paths, URLs and DB connection details. They can't be altered after a security check.
- Thread safety: immutable objects can be shared between threads without synchronisation.
- Hashing: the hash code can be cached, which makes String a fast and reliable HashMap key.
- Cost: every "modification" (concat, replace) creates a new object, so use StringBuilder for heavy string building in loops.
`,
  ),
  q(
    "java",
    "What is the difference between method overloading and overriding?",
    "OOP",
    "EASY",
    `
Explain method overloading and method overriding with an example of each. Which one is compile-time polymorphism and which is runtime polymorphism?
`,
    `
- Overloading: same method name, different parameter lists (number, type or order), usually in the same class. The compiler picks the version, so it is compile-time (static) polymorphism. Return type alone cannot distinguish overloads.
- Overriding: a subclass provides its own implementation of a parent method with the same signature. The JVM picks the version from the actual object type at runtime (dynamic dispatch), so it is runtime polymorphism.
- Overriding rules: same signature, return type the same or a subtype (covariant), access can't be more restrictive, can't throw broader checked exceptions. static, final and private methods can't be overridden.

\`\`\`
int add(int a, int b)          // overload 1
double add(double a, double b) // overload 2

class Animal { void sound() { System.out.println("..."); } }
class Dog extends Animal {
    @Override void sound() { System.out.println("Woof"); }
}
\`\`\`
`,
    { company: "Wipro" },
  ),
  q(
    "java",
    "What is the difference between an abstract class and an interface?",
    "OOP",
    "EASY",
    `
Compare abstract classes and interfaces in Java (assume Java 8 or later). When would you choose one over the other?
`,
    `
- A class can extend only one abstract class but implement many interfaces.
- An abstract class can have constructors, instance fields with state, and methods with any access modifier.
- An interface cannot hold instance state; its fields are implicitly public static final. Since Java 8 it can have default and static methods, and since Java 9 private methods.
- Abstract class: models an "is-a" relationship where subclasses share code and state (e.g. an abstract Shape with a common colour field).
- Interface: defines a capability or contract that unrelated classes can share (Comparable, Runnable, Serializable).
- Rule of thumb: program to interfaces; use an abstract class when you need shared state or a partial implementation.
`,
  ),
  q(
    "java",
    "What is the difference between final, finally and finalize?",
    "OOP",
    "EASY",
    `
These three look similar but are unrelated. Explain final, finally and finalize() in Java.
`,
    `
- final (keyword): a final variable can be assigned only once; a final method cannot be overridden; a final class cannot be extended (e.g. String).
- finally (block): follows try/catch and always runs, whether or not an exception occurred. Used for cleanup such as closing resources. (It is skipped only in cases like System.exit() or the JVM crashing.)
- finalize() (method): a method on Object that the garbage collector may call before reclaiming an object. It is unpredictable, deprecated since Java 9, and should not be used; prefer try-with-resources and AutoCloseable.
`,
    { company: "Cognizant" },
  ),
  q(
    "java",
    "What is the difference between checked and unchecked exceptions?",
    "Exceptions",
    "EASY",
    `
Explain checked and unchecked exceptions in Java with examples. How does the compiler treat them differently?
`,
    `
- Checked exceptions extend Exception (but not RuntimeException). The compiler forces you to catch them or declare them with throws. Examples: IOException, SQLException, FileNotFoundException. They represent recoverable conditions outside the program's control.
- Unchecked exceptions extend RuntimeException. The compiler does not force handling. Examples: NullPointerException, ArrayIndexOutOfBoundsException, ArithmeticException, IllegalArgumentException. They usually signal programming bugs.
- Errors (OutOfMemoryError, StackOverflowError) extend Error and are also unchecked; applications normally shouldn't catch them.
- Hierarchy: Throwable -> Exception / Error; Exception -> RuntimeException.
`,
  ),
  q(
    "java",
    "What is the difference between String, StringBuilder and StringBuffer?",
    "Strings",
    "MEDIUM",
    `
Compare String, StringBuilder and StringBuffer. Why is building a string with += inside a loop of 100,000 iterations a bad idea?
`,
    `
- String: immutable. Each += creates a new String and copies all the characters so far, so building in a loop is O(n^2) work and creates lots of garbage.
- StringBuilder: mutable, resizable character buffer. append() is amortised O(1). Not synchronized, so it is the fastest choice for single-threaded code.
- StringBuffer: same API as StringBuilder but its methods are synchronized, so it is thread-safe and slower. Rarely needed today.

\`\`\`
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 100000; i++) sb.append(i).append(',');
String result = sb.toString();
\`\`\`

- The compiler already turns a single expression like a + b + c into efficient code; the problem is concatenation across loop iterations.
`,
  ),
  q(
    "java",
    "How does HashMap work internally?",
    "Collections",
    "MEDIUM",
    `
Explain what happens inside a Java HashMap when you call put(key, value) and get(key). What are load factor and rehashing? What changed in Java 8?
`,
    `
- HashMap keeps an array of buckets (default capacity 16). put computes key.hashCode(), spreads the bits, and maps it to a bucket index with (n - 1) & hash.
- If the bucket is empty, a new node is stored. Otherwise the bucket's nodes are compared with equals(): a match replaces the value, otherwise the new node is added (a collision).
- get repeats the hash -> bucket -> equals() search. Average O(1).
- Load factor (default 0.75): when size exceeds capacity x load factor, the array doubles and entries are redistributed (rehashing).
- Java 8: a bucket with many collisions (8 or more entries, when capacity is at least 64) turns from a linked list into a red-black tree, so the worst case becomes O(log n) instead of O(n).
- One null key is allowed (it goes to bucket 0). HashMap is not thread-safe.
`,
    { role: "Backend Developer" },
  ),
  q(
    "java",
    "What is the contract between equals() and hashCode()?",
    "Collections",
    "MEDIUM",
    `
You create a class Employee with id and name, override equals() to compare id, but forget hashCode(). What goes wrong when you put Employee objects in a HashSet?
`,
    `
- Contract: if a.equals(b) is true, then a.hashCode() must equal b.hashCode(). Unequal objects may share a hash code (collisions), but equal ones must not differ.
- Without hashCode(), Object's default (usually based on identity) is used. Two Employees with the same id get different hash codes, land in different buckets, and HashSet never calls equals() on them. You end up with "duplicates" in the set, and map.get(new Employee(1, ...)) returns null.
- Fix: override both, using the same fields.

\`\`\`
@Override public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Employee)) return false;
    return id == ((Employee) o).id;
}
@Override public int hashCode() { return Integer.hashCode(id); }
\`\`\`

- Also keep fields used as keys immutable, or the object gets lost in its bucket.
`,
  ),
  q(
    "java",
    "When would you use ArrayList over LinkedList?",
    "Collections",
    "MEDIUM",
    `
Compare ArrayList and LinkedList in terms of internal structure and time complexity for get, add at end, add/remove in the middle and memory use. Which do you use by default?
`,
    `
- ArrayList is backed by a resizable array. LinkedList is a doubly linked list of nodes.
- get(i): ArrayList O(1); LinkedList O(n) (it walks from the nearer end).
- add at end: ArrayList amortised O(1) (occasionally grows by about 1.5x and copies); LinkedList O(1).
- insert/remove in the middle: both are O(n) overall. ArrayList shifts elements; LinkedList must first walk to the position (only removal through an iterator already at the spot is O(1)).
- Memory: LinkedList stores two extra pointers per element and has poor cache locality.
- Default to ArrayList. LinkedList only helps for frequent adds/removes at both ends, and even then ArrayDeque is usually better.
`,
  ),
  q(
    "java",
    "Can you override a static method in Java?",
    "OOP",
    "MEDIUM",
    `
What does this print? Explain static methods, method hiding, and whether static methods can be overridden.

\`\`\`
class Parent { static void show() { System.out.println("Parent"); } }
class Child extends Parent { static void show() { System.out.println("Child"); } }

Parent p = new Child();
p.show();
\`\`\`
`,
    `
It prints "Parent".

- static members belong to the class, not to an object. Calls to static methods are resolved at compile time from the declared type of the reference (Parent here), not the runtime object.
- Defining a static method with the same signature in a subclass is method hiding, not overriding. There is no runtime polymorphism; @Override on it would be a compile error.
- Calling static methods through an instance compiles but is misleading; call them as Parent.show().
- Related: a static method cannot use this or access instance fields directly, and static variables are shared by all instances.
`,
  ),
  q(
    "java",
    "What is ConcurrentModificationException and how do you avoid it?",
    "Collections",
    "MEDIUM",
    `
Why does this code throw ConcurrentModificationException? Show two correct ways to remove the even numbers.

\`\`\`
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
for (Integer x : list) {
    if (x % 2 == 0) list.remove(x);
}
\`\`\`
`,
    `
- The for-each loop uses an Iterator. ArrayList's iterator is fail-fast: it records the list's modCount and throws ConcurrentModificationException if the list is structurally modified other than through the iterator itself.
- Fix 1: remove through the iterator.

\`\`\`
Iterator<Integer> it = list.iterator();
while (it.hasNext()) if (it.next() % 2 == 0) it.remove();
\`\`\`

- Fix 2 (Java 8+): list.removeIf(x -> x % 2 == 0);
- Fail-safe alternatives such as CopyOnWriteArrayList and ConcurrentHashMap iterate over a snapshot or weakly consistent view and never throw this exception, at the cost of copying or weaker guarantees.
- Despite its name, this exception is about modification during iteration, not only multithreading.
`,
  ),
  q(
    "java",
    "What is the difference between calling start() and run() on a thread?",
    "Multithreading",
    "MEDIUM",
    `
What are the two ways to create a thread in Java, and which is preferred? What is the difference between calling t.start() and t.run()?
`,
    `
- Way 1: extend Thread and override run(). Way 2: implement Runnable (or pass a lambda) and give it to a Thread. Runnable is preferred: Java has single inheritance, and it separates the task from the thread mechanism. In real code, submit tasks to an ExecutorService.

\`\`\`
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));
t.start();
\`\`\`

- start() asks the JVM to create a new thread of execution, which then calls run() on that new thread.
- run() called directly is just an ordinary method call: it executes on the current thread, and no new thread is created.
- start() can be called only once per Thread object; a second call throws IllegalThreadStateException.
`,
    { company: "Accenture" },
  ),
  q(
    "java",
    "What does a return inside finally do?",
    "Exceptions",
    "MEDIUM",
    `
What do these two methods return?

\`\`\`
static int a() {
    try { return 1; }
    finally { return 2; }
}
static int b() {
    int x = 1;
    try { return x; }
    finally { x = 2; }
}
\`\`\`
`,
    `
a() returns 2 and b() returns 1.

- In a(), try evaluates "return 1", but finally always runs before the method actually returns. A return in finally replaces the pending return value (and would also swallow any exception thrown in try).
- In b(), "return x" evaluates x (1) and saves that value before finally runs. Changing the local x to 2 afterwards does not change the saved value. (If x were a reference to a mutable object, changes to the object itself would be visible.)
- Best practice: never return or throw from a finally block; use it only for cleanup.
`,
  ),
  q(
    "java",
    "What are synchronized and volatile, and how does deadlock happen?",
    "Multithreading",
    "HARD",
    `
Explain the synchronized keyword and the volatile keyword. Why is volatile not enough to make count++ thread-safe? Describe how a deadlock occurs and how to prevent it.
`,
    `
- synchronized: only one thread at a time can hold an object's monitor, so a synchronized method or block gives mutual exclusion. Entering and leaving it also makes changes visible to other threads (happens-before).
- volatile: guarantees visibility (reads always see the latest write, no caching in a register) and prevents certain reorderings, but gives no mutual exclusion.
- count++ is read-modify-write (three steps). Two threads can read the same value and both write value + 1, losing an update. Use synchronized, a Lock, or AtomicInteger.incrementAndGet().
- Deadlock: thread 1 holds lock A and waits for B while thread 2 holds B and waits for A. Conditions: mutual exclusion, hold-and-wait, no preemption, circular wait.
- Prevention: always acquire locks in a fixed global order, keep critical sections small, use tryLock with a timeout, or prefer higher-level concurrency utilities.
`,
    { role: "Backend Developer" },
  ),
  q(
    "java",
    "Explain JVM memory areas and how garbage collection works",
    "JVM",
    "HARD",
    `
Describe the main memory areas of the JVM (heap, stack, metaspace, etc.). How does the garbage collector decide which objects to free, and what is generational GC? What causes OutOfMemoryError vs StackOverflowError?
`,
    `
- Heap: shared by all threads; holds all objects and arrays. Managed by the GC.
- Stack: one per thread; holds frames with local variables, primitive values and references. Freed automatically when a method returns.
- Metaspace (Java 8+, replaced PermGen): class metadata, in native memory.
- Also: the PC register and native method stack per thread.
- GC reachability: starting from GC roots (local variables on stacks, static fields, active threads, JNI references), the collector marks every reachable object; anything unreachable is garbage, even reference cycles.
- Generational GC: most objects die young. New objects go into the young generation (Eden and survivor spaces) where minor GCs are frequent and cheap; long-lived objects get promoted to the old generation, collected less often. G1 is the default collector in modern JDKs.
- OutOfMemoryError: the heap (or metaspace) cannot satisfy an allocation even after GC. StackOverflowError: a thread's stack is exhausted, usually by deep or infinite recursion.
`,
  ),
  q(
    "java",
    "How do you write a thread-safe Singleton in Java?",
    "OOP",
    "HARD",
    `
Implement the Singleton pattern in Java so that it is lazy and thread-safe. Explain why the naive version fails with multiple threads and why volatile is needed in double-checked locking.
`,
    `
- Naive "if (instance == null) instance = new X();" is a race: two threads can both see null and create two instances.
- Double-checked locking:

\`\`\`
public final class Config {
    private static volatile Config instance;
    private Config() {}
    public static Config getInstance() {
        if (instance == null) {
            synchronized (Config.class) {
                if (instance == null) instance = new Config();
            }
        }
        return instance;
    }
}
\`\`\`

- volatile is required because "new Config()" can be reordered so that the reference is published before the constructor finishes; another thread could then see a half-built object.
- Simpler alternatives: the holder idiom (a private static inner class holding the instance, which the JVM initialises lazily and safely), or an enum with a single constant, which also resists reflection and serialization attacks.
`,
    { role: "SDE" },
  ),
  q(
    "java",
    "How is ConcurrentHashMap different from Hashtable and synchronizedMap?",
    "Multithreading",
    "HARD",
    `
All three of Hashtable, Collections.synchronizedMap(new HashMap<>()) and ConcurrentHashMap can be used from multiple threads. How do they differ in locking, performance and behaviour? Is "if (!map.containsKey(k)) map.put(k, v)" safe on them?
`,
    `
- Hashtable and synchronizedMap lock the whole map for every operation, so only one thread can read or write at a time. Their iterators are fail-fast, and you must manually synchronize on the map while iterating.
- ConcurrentHashMap (Java 8+) does not lock the whole table: reads are mostly lock-free, and writes use CAS or lock only a single bucket. Many threads can read and write in parallel, so it scales much better.
- Its iterators are weakly consistent: they never throw ConcurrentModificationException and may or may not show concurrent updates.
- It does not allow null keys or values (null would be ambiguous with "absent").
- Check-then-act (containsKey then put) is a race on all three, because two separate calls are not atomic together. Use the atomic methods: putIfAbsent, computeIfAbsent, merge, compute.
`,
    { role: "Backend Developer" },
  ),
  q(
    "java",
    "Implement producer-consumer in Java",
    "Multithreading",
    "HARD",
    `
Implement the producer-consumer problem: one thread produces integers into a bounded buffer of size 5 and another consumes them. The producer must wait when the buffer is full and the consumer must wait when it is empty.
`,
    `
Simplest correct answer: use a BlockingQueue, which handles waiting and signalling for you.

\`\`\`
BlockingQueue<Integer> q = new ArrayBlockingQueue<>(5);

Thread producer = new Thread(() -> {
    try { for (int i = 0; i < 20; i++) q.put(i); }      // blocks when full
    catch (InterruptedException e) { Thread.currentThread().interrupt(); }
});
Thread consumer = new Thread(() -> {
    try { for (int i = 0; i < 20; i++) System.out.println(q.take()); } // blocks when empty
    catch (InterruptedException e) { Thread.currentThread().interrupt(); }
});
producer.start(); consumer.start();
\`\`\`

- With wait/notify instead: guard a queue with synchronized; the producer loops "while (queue.size() == 5) wait();" then adds and calls notifyAll(); the consumer loops "while (queue.isEmpty()) wait();" then removes and calls notifyAll().
- Always call wait() inside a while loop (not if), to handle spurious wakeups and other threads taking the item first.
`,
    { role: "SDE" },
  ),

  // --------------------------------------------------------------------- c
  q(
    "c",
    "What is the difference between malloc() and calloc()?",
    "Memory",
    "EASY",
    `
Compare malloc() and calloc() in C. How would you allocate an array of 10 integers with each, and how do you release the memory?
`,
    `
- malloc(size) allocates size bytes and leaves them uninitialised (garbage values).
- calloc(n, size) allocates memory for n elements of size bytes each and sets every byte to zero. It also checks n * size for overflow.
- Both return void* (NULL on failure) and both are released with free().

\`\`\`
int *a = malloc(10 * sizeof(int));
int *b = calloc(10, sizeof(int));   // all zeros
if (a == NULL || b == NULL) { /* handle error */ }
free(a);
free(b);
\`\`\`

- realloc(p, new_size) resizes a block previously returned by malloc/calloc.
`,
    { company: "TCS" },
  ),
  q(
    "c",
    "What is a pointer and what do the & and * operators do?",
    "Pointers",
    "EASY",
    `
Explain pointers in C. What does this print (assume x is stored at some address)?

\`\`\`
int x = 10;
int *p = &x;
*p = 20;
printf("%d %d\\n", x, *p);
\`\`\`
`,
    `
It prints 20 20.

- A pointer is a variable that stores the memory address of another variable.
- & (address-of) gives the address of a variable: &x is the address of x.
- * in a declaration (int *p) declares a pointer; * in an expression dereferences it, meaning "the value at that address".
- p = &x makes p point to x, so *p = 20 writes 20 into x itself.
- Pointers enable call by reference, dynamic memory, arrays and strings, and data structures like linked lists.
`,
  ),
  q(
    "c",
    "Write a swap function: call by value vs call by reference",
    "Pointers",
    "EASY",
    `
Why does this swap function not work? Rewrite it so that it swaps the caller's variables.

\`\`\`
void swap(int a, int b) {
    int t = a; a = b; b = t;
}
\`\`\`
`,
    `
- C passes arguments by value. swap gets copies of the caller's variables, swaps the copies, and the copies are discarded on return; the originals are unchanged.
- To change the caller's variables, pass their addresses (call by reference using pointers):

\`\`\`
void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int x = 1, y = 2;
swap(&x, &y);     // now x = 2, y = 1
\`\`\`

- Strictly speaking C has only call by value; passing a pointer by value is how C simulates call by reference.
`,
    { company: "TCS" },
  ),
  q(
    "c",
    "What does the static keyword do in C?",
    "Storage Classes",
    "EASY",
    `
What does this print? Explain the meaning of static for a local variable, a global variable and a function.

\`\`\`
void counter(void) {
    static int count = 0;
    count++;
    printf("%d ", count);
}
// main calls counter() three times
\`\`\`
`,
    `
It prints 1 2 3.

- static local variable: initialised only once and keeps its value between calls (lifetime of the whole program), but is still visible only inside the function. Default value is 0.
- static global variable: visible only within its own source file (internal linkage), so other files can't access it with extern.
- static function: also limited to its own source file, which is useful for hiding helper functions.
- Without static, count would be an automatic variable recreated on each call, and the program would print 1 1 1.
`,
    { company: "Zoho" },
  ),
  q(
    "c",
    "What is the difference between a structure and a union?",
    "Structures",
    "EASY",
    `
Explain the difference between struct and union. What would sizeof print for these on a typical 64-bit system?

\`\`\`
struct S { int i; char c; double d; };
union  U { int i; char c; double d; };
\`\`\`
`,
    `
- In a struct every member has its own storage, so all members can hold values at the same time. Its size is at least the sum of member sizes, plus padding for alignment.
- In a union all members share the same memory; only one member holds a meaningful value at a time. Its size is the size of the largest member (rounded up for alignment).
- Typical sizes: sizeof(struct S) = 16 (int 4 + char 1 + 3 bytes padding + double 8); sizeof(union U) = 8.
- Unions save memory when only one of several types is needed at a time (e.g. a token value that is either an int or a float, usually paired with a tag field).
`,
  ),
  q(
    "c",
    "What is the difference between i++ and ++i?",
    "Basics",
    "EASY",
    `
What does this print?

\`\`\`
int i = 5;
int a = i++;
int b = ++i;
printf("%d %d %d\\n", a, b, i);
\`\`\`
`,
    `
It prints 5 7 7.

- i++ (post-increment) yields the current value, then increments. a gets 5, and i becomes 6.
- ++i (pre-increment) increments first, then yields the new value. i becomes 7, and b gets 7.
- When the result isn't used (e.g. in a for loop's update part), both behave the same.
- Never modify the same variable twice in one expression (like i = i++ + ++i); that is undefined behaviour.
`,
    { company: "Wipro" },
  ),
  q(
    "c",
    "Reverse a string in place without using library functions",
    "Strings",
    "EASY",
    `
Write a C function void reverse(char *s) that reverses a string in place without using strrev() or strlen().
`,
    `
Find the length by walking to the terminating '\\0', then swap characters from both ends moving inwards.

\`\`\`
void reverse(char *s) {
    int len = 0;
    while (s[len] != '\\0') len++;
    for (int i = 0, j = len - 1; i < j; i++, j--) {
        char t = s[i];
        s[i] = s[j];
        s[j] = t;
    }
}
\`\`\`

- Time O(n), extra space O(1).
- The string must be writable: char s[] = "hello" works, but char *s = "hello" points to a string literal, and modifying it is undefined behaviour.
`,
    { company: "Zoho" },
  ),
  q(
    "c",
    "What are dangling, wild and NULL pointers?",
    "Pointers",
    "MEDIUM",
    `
Define a dangling pointer, a wild pointer and a NULL pointer, with a short code example of how each one arises. How do you avoid the bugs they cause?
`,
    `
- Wild pointer: declared but never initialised, so it holds a garbage address. int *p; *p = 5; is undefined behaviour.
- Dangling pointer: points to memory that has been freed or has gone out of scope.

\`\`\`
int *p = malloc(sizeof(int));
free(p);          // p is now dangling
int *f(void) { int x = 5; return &x; }  // returns address of a dead local
\`\`\`

- NULL pointer: explicitly points to nothing (address 0 / NULL). Dereferencing it is undefined behaviour (usually a crash), but it can be safely checked with if (p != NULL).
- Avoid: initialise every pointer (to NULL if nothing else), set pointers to NULL after free(), never return addresses of local variables, and check malloc's return value.
`,
  ),
  q(
    "c",
    "Describe the memory layout of a C program",
    "Memory",
    "MEDIUM",
    `
A running C program's memory is divided into segments. Name them and say where each of these lives: a global initialised variable, a global uninitialised variable, a local variable, a malloc'd block, a string literal, and the program's code.
`,
    `
- Text (code) segment: compiled machine instructions; usually read-only. String literals are typically placed in a read-only data section nearby.
- Initialised data segment: globals and static variables with a non-zero initial value (int g = 5;).
- BSS segment: globals and statics that are uninitialised or zero-initialised (int g;). Zero-filled at program start.
- Heap: dynamic memory from malloc/calloc/realloc, released with free. Typically grows towards higher addresses.
- Stack: function call frames with local variables, parameters and return addresses. Grows towards lower addresses on most systems; freed automatically when a function returns.
- Too much recursion overflows the stack; forgetting free() leaks heap memory.
`,
    { company: "Zoho" },
  ),
  q(
    "c",
    "Why is a macro like #define SQUARE(x) x*x dangerous?",
    "Basics",
    "MEDIUM",
    `
What does this print, and how would you fix the macro? When would you prefer an inline function over a macro?

\`\`\`
#define SQUARE(x) x*x
printf("%d\\n", SQUARE(2 + 3));
\`\`\`
`,
    `
It prints 11, not 25.

- Macros are plain text substitution done by the preprocessor before compilation. SQUARE(2 + 3) becomes 2 + 3*2 + 3 = 11.
- Fix: parenthesise each argument and the whole body:

\`\`\`
#define SQUARE(x) ((x) * (x))
\`\`\`

- Still unsafe with side effects: SQUARE(i++) expands to ((i++) * (i++)), which is undefined behaviour.
- An inline function (static inline int square(int x)) evaluates its argument once, is type-checked and is easy to debug, so prefer it for function-like code. Use macros for things functions can't do, such as include guards and conditional compilation.
`,
  ),
  q(
    "c",
    "What is the difference between const int *p and int *const p?",
    "Pointers",
    "MEDIUM",
    `
Explain each of these declarations and which operations are allowed on them:

\`\`\`
const int *p1;
int *const p2 = &x;
const int *const p3 = &x;
\`\`\`
`,
    `
Read declarations right to left.

- const int *p1 (same as int const *p1): pointer to a constant int. You can change p1 to point elsewhere (p1 = &y), but you cannot change the value through it (*p1 = 5 is an error).
- int *const p2: constant pointer to an int. You can change the value (*p2 = 5) but not the pointer (p2 = &y is an error). It must be initialised.
- const int *const p3: constant pointer to a constant int. Neither the pointer nor the value can be changed through it.
- Typical use: const char *s in function parameters (e.g. strlen) promises the function won't modify the caller's string.
`,
  ),
  q(
    "c",
    "What is structure padding and how can you reduce it?",
    "Structures",
    "MEDIUM",
    `
On a typical system with 4-byte int alignment, what is sizeof for each structure, and why are they different?

\`\`\`
struct A { char a; int b; char c; };
struct B { int b; char a; char c; };
\`\`\`
`,
    `
sizeof(struct A) = 12 and sizeof(struct B) = 8.

- The CPU reads aligned data faster (and some CPUs require it), so the compiler inserts padding so each member starts at a multiple of its alignment, and pads the end so the struct's size is a multiple of its largest alignment (so arrays of it stay aligned).
- A: a (1) + 3 padding + b (4) + c (1) + 3 trailing padding = 12.
- B: b (4) + a (1) + c (1) + 2 trailing padding = 8.
- Reduce padding by ordering members from largest to smallest alignment.
- Compilers also offer packing (#pragma pack(1) or __attribute__((packed))), which removes padding at the cost of slower or unaligned access; it is used for binary file formats and network protocols.
`,
    { company: "Zoho" },
  ),
  q(
    "c",
    "What is the difference between sizeof and strlen for strings?",
    "Strings",
    "MEDIUM",
    `
What does this print on a 64-bit system?

\`\`\`
char s[] = "hello";
char *p = "hello";
printf("%zu %zu %zu %zu\\n", sizeof(s), strlen(s), sizeof(p), strlen(p));
\`\`\`
`,
    `
It prints 6 5 8 5.

- sizeof is a compile-time operator that gives the size in bytes of its operand's type. s is an array of 6 chars (5 letters plus '\\0'), so sizeof(s) is 6.
- strlen is a library function that counts characters at runtime up to (not including) the '\\0'. Both strings have length 5.
- p is a pointer, so sizeof(p) is the size of a pointer (8 bytes on 64-bit), not the string.
- Common bug: an array passed to a function decays to a pointer, so sizeof inside the function gives the pointer size. Pass the length as a separate parameter.
`,
  ),
  q(
    "c",
    "What is a memory leak and how do you find and prevent one?",
    "Memory",
    "MEDIUM",
    `
Explain what a memory leak is in C with an example. How would you detect leaks in a program, and what habits help prevent them?
`,
    `
- A memory leak happens when heap memory is allocated but never freed, and the program loses every pointer to it. The memory stays reserved until the process exits; long-running programs slowly run out of memory.

\`\`\`
void f(void) {
    char *buf = malloc(100);
    if (error) return;   // leak: buf is never freed
    free(buf);
}
p = malloc(10); p = malloc(20);   // first block leaked
\`\`\`

- Detect with tools such as Valgrind (valgrind --leak-check=full ./a.out) or AddressSanitizer (-fsanitize=address).
- Prevent: pair each malloc with exactly one free, use a single cleanup path (goto cleanup) in functions with many exits, free nested structures (each node of a linked list) before the container, and keep clear ownership rules for who frees what.
`,
  ),
  q(
    "c",
    "What are function pointers and where are they used?",
    "Pointers",
    "MEDIUM",
    `
Declare a pointer to a function that takes two ints and returns an int, use it to call add and sub, and explain a real use of function pointers in C.
`,
    `
\`\`\`
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }

int (*op)(int, int);   // pointer to function (int, int) -> int
op = add;
printf("%d\\n", op(5, 3));   // 8
op = sub;
printf("%d\\n", op(5, 3));   // 2
\`\`\`

- The parentheses matter: int *op(int, int) would declare a function returning int*.
- Uses: callbacks such as the comparator passed to qsort; tables of operations (an array of function pointers for a menu or calculator); simple state machines; plug-in style "virtual functions" in C structs.
- typedef makes them readable: typedef int (*BinOp)(int, int);
`,
  ),
  q(
    "c",
    "What is the output of i = i++ + ++i?",
    "Basics",
    "HARD",
    `
A common placement question asks for the output of this code. What is the correct answer, and why?

\`\`\`
int i = 5;
i = i++ + ++i;
printf("%d\\n", i);
\`\`\`
`,
    `
There is no single correct output: the behaviour is undefined.

- The C standard says that modifying the same object more than once without a sequence point between the modifications (or reading it for another purpose) is undefined behaviour. Here i is modified by i++, by ++i and by the assignment, all in one expression.
- Different compilers, or the same compiler with different optimisation levels, can print different values (12 or 13 are common), and the compiler is even allowed to do something entirely different.
- A good interview answer says "undefined behaviour" rather than guessing a number, and explains sequence points (the end of a full expression, &&, ||, the comma operator, ?:, and function calls).
- Compile with -Wall; GCC warns with "operation on 'i' may be undefined".
`,
    { company: "Zoho" },
  ),
  q(
    "c",
    "What is the difference between memcpy and memmove? Implement memmove",
    "Strings",
    "HARD",
    `
Explain the difference between memcpy() and memmove(). Write your own my_memmove(void *dst, const void *src, size_t n) that works even when the regions overlap.
`,
    `
- memcpy assumes the source and destination do not overlap; with overlap the result is undefined. It can be slightly faster.
- memmove handles overlap correctly, as if copying through a temporary buffer.
- Implementation idea: if dst is before src, copy forwards; if dst is after src, copy backwards so bytes aren't overwritten before they're read.

\`\`\`
void *my_memmove(void *dst, const void *src, size_t n) {
    unsigned char *d = dst;
    const unsigned char *s = src;
    if (d == s || n == 0) return dst;
    if (d < s) {
        for (size_t i = 0; i < n; i++) d[i] = s[i];
    } else {
        for (size_t i = n; i > 0; i--) d[i - 1] = s[i - 1];
    }
    return dst;
}
\`\`\`

- Example of overlap: shifting a string one place right inside the same array.
`,
    { role: "SDE" },
  ),
  q(
    "c",
    "How do you check whether a machine is little-endian or big-endian?",
    "Memory",
    "HARD",
    `
Explain endianness. Write a C program that detects whether the machine it runs on is little-endian or big-endian.
`,
    `
- Endianness is the byte order used to store multi-byte values. For the 4-byte int 0x12345678: little-endian stores the least significant byte first (78 56 34 12); big-endian stores the most significant byte first (12 34 56 78).
- x86 and most ARM systems are little-endian. Network byte order is big-endian (hence htonl/ntohl).

\`\`\`
#include <stdio.h>
int main(void) {
    unsigned int x = 1;
    unsigned char *c = (unsigned char *)&x;
    if (*c == 1) printf("Little-endian\\n");
    else         printf("Big-endian\\n");
    return 0;
}
\`\`\`

- Looking at the first byte through a char pointer is allowed in C. A union of an int and a char array is another common approach.
`,
    { role: "SDE" },
  ),
  q(
    "c",
    "Reverse a singly linked list in C",
    "Pointers",
    "HARD",
    `
Given struct Node { int data; struct Node *next; };, write a function struct Node *reverse(struct Node *head) that reverses the list in place and returns the new head. State the time and space complexity.
`,
    `
Walk the list once, turning each next pointer around. Keep three pointers: prev, curr and next.

\`\`\`
struct Node *reverse(struct Node *head) {
    struct Node *prev = NULL, *curr = head, *next = NULL;
    while (curr != NULL) {
        next = curr->next;   // save the rest of the list
        curr->next = prev;   // reverse the link
        prev = curr;         // move prev forward
        curr = next;         // move curr forward
    }
    return prev;             // new head
}
\`\`\`

- Time O(n), extra space O(1).
- Edge cases: empty list (returns NULL) and a single node (returned unchanged) work without special code.
- A recursive version is shorter but uses O(n) stack space and can overflow on very long lists.
`,
    { company: "Zoho", role: "SDE" },
  ),
  q(
    "c",
    "What does the volatile keyword do in C?",
    "Storage Classes",
    "HARD",
    `
Explain the volatile qualifier. Give two situations where a variable must be declared volatile, and say whether volatile makes a variable safe to share between threads.
`,
    `
- volatile tells the compiler that the variable's value can change in ways it cannot see, so every read must actually load it from memory and every write must actually store it. The compiler must not cache it in a register or optimise accesses away.
- Example without volatile: in "while (!flag) {}", the compiler may read flag once and turn this into an infinite loop.
- Typical uses:
- Memory-mapped hardware registers (a status register updated by a device).
- Variables changed by an interrupt service routine or a signal handler (volatile sig_atomic_t).
- Variables checked across setjmp/longjmp.
- volatile is not a thread-synchronisation tool: it does not make operations atomic and does not order memory between CPU cores. For threads use mutexes or C11 atomics (_Atomic, <stdatomic.h>).
- A variable can be both const and volatile, e.g. a read-only hardware status register.
`,
  ),

  // ------------------------------------------------------------------- cpp
  q(
    "cpp",
    "What is the difference between a struct and a class in C++?",
    "OOP",
    "EASY",
    `
In C++ both struct and class can have member functions, constructors and inheritance. What is actually different between them, and how do programmers usually choose?
`,
    `
- The only language difference is the default access: struct members and base classes are public by default; class members and base classes are private by default.
- Everything else (methods, constructors, virtual functions, templates, inheritance) works the same for both.
- Convention: use struct for simple passive data with public fields (a Point { int x, y; }), and class for types that hide state behind an interface and maintain invariants.
- In C, by contrast, a struct can hold only data, with no member functions or access control.
`,
  ),
  q(
    "cpp",
    "What is the difference between a pointer and a reference?",
    "Memory",
    "EASY",
    `
Compare pointers and references in C++. Show how a swap function looks with each.
`,
    `
- A reference is an alias for an existing object. It must be initialised when declared, cannot be null and cannot be re-seated to refer to another object.
- A pointer holds an address. It can be null, can be uninitialised, can be reassigned, supports arithmetic, and can point to pointers.
- Syntax: references are used like the object itself; pointers need * to dereference and -> for members.

\`\`\`
void swapRef(int &a, int &b) { int t = a; a = b; b = t; }
void swapPtr(int *a, int *b) { int t = *a; *a = *b; *b = t; }

int x = 1, y = 2;
swapRef(x, y);
swapPtr(&x, &y);
\`\`\`

- Prefer references for parameters that must refer to a valid object (const T& to avoid copies); use pointers when "no object" (nullptr) is a valid value or when re-seating is needed.
`,
    { company: "TCS" },
  ),
  q(
    "cpp",
    "What is the difference between new/delete and malloc/free?",
    "Memory",
    "EASY",
    `
C++ supports both new/delete and C's malloc/free. How do they differ, and why should C++ code use new/delete (or better, smart pointers)?
`,
    `
- new is an operator that allocates memory and calls the constructor; delete calls the destructor and then frees the memory. malloc/free only allocate and free raw bytes, with no constructors or destructors.
- new returns a correctly typed pointer; malloc returns void* that must be cast in C++.
- On failure new throws std::bad_alloc; malloc returns NULL.
- new computes the size from the type; malloc needs an explicit byte count.
- Arrays: new[] must be paired with delete[]. Never mix the families (don't free() memory from new, or delete memory from malloc).
- Modern C++ rarely uses raw new/delete: prefer std::vector, std::make_unique and std::make_shared.
`,
  ),
  q(
    "cpp",
    "What are constructors and destructors?",
    "OOP",
    "EASY",
    `
Explain constructors and destructors in C++. What is a default constructor, and in what order are constructors and destructors called for an object of a derived class?
`,
    `
- A constructor has the same name as the class, no return type, and runs automatically when an object is created to initialise it. Constructors can be overloaded.
- A default constructor can be called with no arguments. The compiler generates one only if you declare no constructors at all.
- A destructor (~ClassName) takes no arguments, cannot be overloaded, and runs automatically when the object is destroyed (goes out of scope, or delete is called). It releases resources.
- Order for class Derived : public Base: Base constructor, then member constructors, then Derived constructor body. Destruction is the exact reverse: Derived destructor, members, then Base destructor.
- Prefer a member initialiser list (Point(int x) : x_(x) {}) over assigning in the body.
`,
    { company: "Infosys" },
  ),
  q(
    "cpp",
    "Why can't functions be overloaded by return type alone?",
    "Polymorphism",
    "EASY",
    `
Explain function overloading in C++ with an example. Why does the following fail to compile?

\`\`\`
int    getValue();
double getValue();
\`\`\`
`,
    `
- Overloading means several functions share a name but have different parameter lists (number, types or order of parameters, or const-qualification for member functions). The compiler picks one at compile time from the arguments.

\`\`\`
int    area(int side);
int    area(int l, int b);
double area(double r);
\`\`\`

- The return type is not part of overload resolution. In a call like getValue(); or auto v = getValue(); the compiler has no arguments to tell the two apart, and the result may be discarded, so the declarations are ambiguous and rejected.
- Overloading is resolved at compile time (static polymorphism) using name mangling: each overload gets a distinct internal symbol name.
`,
  ),
  q(
    "cpp",
    "What is the difference between std::vector and a plain array?",
    "STL",
    "EASY",
    `
Compare a C-style array (int a[10]), std::array and std::vector. When would you use each?
`,
    `
- C-style array: fixed size known at compile time, decays to a pointer when passed to functions (losing its size), no bounds checking, can't be copied or assigned as a whole.
- std::array<int, 10>: also fixed size and stored inline (no heap), but knows its size (.size()), can be copied and compared, works with STL algorithms, and offers .at() with bounds checking.
- std::vector<int>: dynamic size on the heap, grows with push_back (amortised O(1)), manages its own memory, and supports insert/erase/resize.
- Use std::vector by default; std::array for small fixed-size collections; raw arrays mainly for C interop.
- vector.size() is the element count; capacity() is the allocated space, which can be larger.
`,
  ),
  q(
    "cpp",
    "What are access specifiers and friend functions?",
    "OOP",
    "EASY",
    `
Explain public, private and protected in C++. What is a friend function, and doesn't it break encapsulation?
`,
    `
- public: accessible from anywhere.
- private: accessible only inside the class (and its friends). Default for class.
- protected: like private, but also accessible in derived classes.
- With inheritance, public/protected/private inheritance limits how the base's public and protected members appear in the derived class.
- A friend function (or friend class) is declared inside a class with the friend keyword and gets access to that class's private and protected members, though it is not a member.
- Typical use: operator<< for printing, which must be a non-member because its left operand is std::ostream.
- It does not really break encapsulation: the class itself chooses its friends, much like choosing its member functions. Friendship is not inherited and not transitive.
`,
  ),
  q(
    "cpp",
    "How do virtual functions and the vtable work?",
    "Polymorphism",
    "MEDIUM",
    `
What does this print, and how does C++ decide which function to call? What would change if speak() were not virtual?

\`\`\`
struct Animal { virtual void speak() { cout << "Animal\\n"; } };
struct Dog : Animal { void speak() override { cout << "Dog\\n"; } };

Animal *a = new Dog();
a->speak();
\`\`\`
`,
    `
It prints "Dog".

- A virtual function is resolved at runtime based on the actual (dynamic) type of the object, not the type of the pointer. This is runtime polymorphism.
- Typical implementation: each class with virtual functions has a vtable, a table of pointers to its versions of the virtual functions. Each object carries a hidden vptr pointing to its class's vtable. a->speak() loads the vptr, looks up the slot for speak, and calls Dog::speak.
- Without virtual, the call is bound at compile time from the pointer type (Animal), so it would print "Animal".
- Cost: one pointer per object and an indirect call, which also prevents inlining in most cases.
- Use override so the compiler checks you really are overriding something.
`,
    { role: "SDE" },
  ),
  q(
    "cpp",
    "Why should a base class have a virtual destructor?",
    "Polymorphism",
    "MEDIUM",
    `
What goes wrong in this code, and how do you fix it?

\`\`\`
class Base { public: ~Base() { cout << "~Base\\n"; } };
class Derived : public Base {
    int *data = new int[100];
public:
    ~Derived() { delete[] data; cout << "~Derived\\n"; }
};

Base *p = new Derived();
delete p;
\`\`\`
`,
    `
- Deleting a derived object through a base pointer whose destructor is not virtual is undefined behaviour. In practice only ~Base runs: it prints "~Base", ~Derived never runs, and the 100-int array leaks.
- Fix: make the base destructor virtual.

\`\`\`
class Base { public: virtual ~Base() { cout << "~Base\\n"; } };
\`\`\`

- Now delete p calls ~Derived first and then ~Base, printing "~Derived" then "~Base".
- Rule: any class meant to be used polymorphically (it has virtual functions and may be deleted through a base pointer) needs a public virtual destructor. Classes not meant as bases can be marked final.
`,
  ),
  q(
    "cpp",
    "What is a copy constructor and what is the rule of three?",
    "OOP",
    "MEDIUM",
    `
A class String stores a char* allocated with new[]. What goes wrong if you rely on the compiler-generated copy constructor? Explain shallow vs deep copy and the rule of three.
`,
    `
- The compiler-generated copy constructor copies members one by one (a shallow copy). Both objects end up pointing to the same char buffer. When both are destroyed, the buffer is deleted twice (undefined behaviour), and changing one string changes the other.
- A deep copy allocates a new buffer and copies the characters:

\`\`\`
String(const String &o) : len(o.len), s(new char[o.len + 1]) {
    std::memcpy(s, o.s, len + 1);
}
\`\`\`

- Rule of three: if a class needs a user-defined destructor, copy constructor or copy assignment operator, it almost certainly needs all three, because all of them deal with the same owned resource.
- C++11 extends this to the rule of five (adding the move constructor and move assignment). Better still, the rule of zero: hold resources in std::string, std::vector or smart pointers and write none of them.
- The copy constructor takes const T& - taking T by value would require a copy to make a copy and recurse forever.
`,
  ),
  q(
    "cpp",
    "What is the difference between map and unordered_map?",
    "STL",
    "MEDIUM",
    `
Compare std::map and std::unordered_map in terms of internal data structure, time complexity, ordering and key requirements. Which would you use for counting word frequencies?
`,
    `
- std::map: a self-balancing binary search tree (usually red-black). Keys are kept sorted. insert, find and erase are O(log n) in all cases. Keys need operator< (or a comparator). Supports ordered traversal and lower_bound/upper_bound.
- std::unordered_map: a hash table. No ordering. Average O(1) insert/find/erase, worst case O(n) with many collisions. Keys need std::hash and operator==. Rehashing can invalidate iterators.
- Memory: unordered_map typically uses more because of the bucket array.
- Word frequencies: unordered_map<string, int> is usually faster, since order doesn't matter. Use map if you need to print words in sorted order or run range queries.
- In competitive programming, unordered_map can be attacked with crafted inputs that cause many collisions; a custom hash avoids that.
`,
    { role: "SDE" },
  ),
  q(
    "cpp",
    "What are unique_ptr, shared_ptr and weak_ptr?",
    "Modern C++",
    "MEDIUM",
    `
Explain the three standard smart pointers. When would you use each, and what problem does weak_ptr solve?
`,
    `
- unique_ptr: sole ownership. It cannot be copied, only moved; the object is deleted when the unique_ptr is destroyed. Zero overhead compared to a raw pointer. Default choice. Create with std::make_unique<T>(...).
- shared_ptr: shared ownership with a reference count stored in a control block. The object is deleted when the last shared_ptr to it is destroyed. Copying increments the count (atomically, so there is some cost). Create with std::make_shared<T>(...).
- weak_ptr: a non-owning observer of an object managed by shared_ptr. It doesn't increase the count. Call lock() to get a shared_ptr, which is empty if the object is already gone.
- weak_ptr breaks reference cycles: if a parent and child hold shared_ptrs to each other, their counts never reach zero and both leak. Make the back-pointer (child to parent) a weak_ptr.
- Smart pointers apply RAII to heap memory, so you rarely write delete yourself.
`,
  ),
  q(
    "cpp",
    "Write a function template that returns the maximum of two values",
    "Templates",
    "MEDIUM",
    `
Write a function template myMax that works for int, double and std::string. What happens with myMax(3, 4.5), and how could you make it work?
`,
    `
\`\`\`
template <typename T>
T myMax(const T &a, const T &b) {
    return (a < b) ? b : a;
}

myMax(3, 7);                                  // T = int
myMax(2.5, 1.5);                              // T = double
myMax(std::string("a"), std::string("b"));    // T = std::string
\`\`\`

- The compiler generates (instantiates) a separate function for each type used, at compile time. The type only needs to support operator<.
- myMax(3, 4.5) fails: T is deduced as int from the first argument and double from the second, a conflict.
- Fixes: specify the type explicitly, myMax<double>(3, 4.5); or use two template parameters with a common return type, e.g. template <typename A, typename B> auto myMax(A a, B b) -> std::common_type_t<A, B>.
- Template definitions usually go in headers, since the compiler needs the full definition to instantiate them.
`,
  ),
  q(
    "cpp",
    "What is iterator invalidation in std::vector?",
    "STL",
    "MEDIUM",
    `
Why is this code buggy? How would you correctly remove all even numbers from a vector?

\`\`\`
std::vector<int> v = {1, 2, 3, 4, 5, 6};
for (auto it = v.begin(); it != v.end(); ++it) {
    if (*it % 2 == 0) v.erase(it);
}
\`\`\`
`,
    `
- erase(it) invalidates it and all iterators after it; incrementing an invalidated iterator is undefined behaviour. The loop can also skip elements or run past end().
- Fix 1: use the iterator returned by erase, which points to the next element.

\`\`\`
for (auto it = v.begin(); it != v.end(); ) {
    if (*it % 2 == 0) it = v.erase(it);
    else ++it;
}
\`\`\`

- Fix 2 (preferred, O(n)): the erase-remove idiom, or std::erase_if in C++20.

\`\`\`
v.erase(std::remove_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; }), v.end());
\`\`\`

- push_back/insert also invalidate all iterators, pointers and references if the vector reallocates (size exceeds capacity).
`,
  ),
  q(
    "cpp",
    "What is a pure virtual function and an abstract class?",
    "Polymorphism",
    "MEDIUM",
    `
Define a pure virtual function and an abstract class in C++. Write an abstract Shape class with an area() method and two concrete subclasses. Can an abstract class have a constructor?
`,
    `
- A pure virtual function is declared with = 0 and has no required implementation in the base class. A class with at least one pure virtual function is abstract: you cannot create objects of it, only pointers or references to it.
- A derived class must override every pure virtual function to become concrete.

\`\`\`
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};
class Circle : public Shape {
    double r;
public:
    explicit Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};
class Rect : public Shape {
    double w, h;
public:
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
};
\`\`\`

- Yes, an abstract class can have constructors and data members; they run when a derived object is created. C++ uses abstract classes the way Java uses interfaces.
`,
  ),
  q(
    "cpp",
    "What are move semantics and rvalue references?",
    "Modern C++",
    "HARD",
    `
Explain lvalues, rvalues and rvalue references (T&&). What do a move constructor and std::move do, and why does returning a large std::vector from a function stay cheap in modern C++?
`,
    `
- An lvalue has a name and an address (a variable). An rvalue is a temporary (the result of a + b, or a function returning by value).
- T&& binds to rvalues. A move constructor T(T&& other) "steals" other's resources (e.g. its heap pointer) instead of copying them, then leaves other in a valid but unspecified state (often empty).

\`\`\`
Buffer(Buffer &&o) noexcept : data(o.data), size(o.size) {
    o.data = nullptr;
    o.size = 0;
}
\`\`\`

- std::move doesn't move anything; it is a cast to an rvalue reference that lets the move constructor be chosen. Don't use an object after moving from it except to assign or destroy it.
- Returning a local vector: the compiler usually elides the copy entirely (RVO/NRVO, guaranteed for unnamed temporaries since C++17); otherwise the return value is moved, which is O(1).
- Mark move operations noexcept so std::vector can move elements instead of copying them when it grows.
`,
    { role: "SDE" },
  ),
  q(
    "cpp",
    "What is the diamond problem and how does virtual inheritance solve it?",
    "OOP",
    "HARD",
    `
Given the hierarchy below, why does d.value fail to compile, and how does virtual inheritance fix it?

\`\`\`
struct A { int value = 0; };
struct B : A {};
struct C : A {};
struct D : B, C {};

D d;
d.value = 5;   // error
\`\`\`
`,
    `
- D inherits A twice, once through B and once through C, so a D object contains two separate A subobjects. d.value is ambiguous (B::A::value or C::A::value?), and converting a D* to an A* is ambiguous too.
- Workaround without changing the design: qualify it, d.B::value = 5, but there are still two copies.
- Real fix: virtual inheritance, so B and C share a single A subobject.

\`\`\`
struct B : virtual A {};
struct C : virtual A {};
struct D : B, C {};   // one A; d.value works
\`\`\`

- With virtual bases, the most-derived class (D) is responsible for constructing A directly; B's and C's calls to A's constructor are ignored.
- Cost: an extra indirection (a pointer or offset to the shared base). Many designs avoid diamonds by using interface-like abstract classes without data.
`,
  ),
  q(
    "cpp",
    "What is RAII and why is it important in C++?",
    "Memory",
    "HARD",
    `
Explain RAII (Resource Acquisition Is Initialization). Rewrite the function below so it cannot leak the mutex lock or the file handle, even if process() throws.

\`\`\`
void work(std::mutex &m) {
    m.lock();
    FILE *f = fopen("data.txt", "r");
    process(f);
    fclose(f);
    m.unlock();
}
\`\`\`
`,
    `
- RAII ties a resource's lifetime to an object's lifetime: acquire it in the constructor, release it in the destructor. C++ guarantees destructors of local objects run when scope exits, whether normally or through an exception (stack unwinding), so release can't be forgotten.
- In the original code, an exception from process() skips fclose and unlock: the file leaks and the mutex stays locked forever (a likely deadlock).

\`\`\`
void work(std::mutex &m) {
    std::lock_guard<std::mutex> lock(m);
    std::ifstream f("data.txt");
    process(f);
}   // f closed, then m unlocked, automatically
\`\`\`

- Standard RAII types: std::lock_guard / std::unique_lock / std::scoped_lock, std::fstream, std::unique_ptr / std::shared_ptr, std::vector, std::string.
- RAII is why idiomatic C++ needs no finally block and almost never calls delete directly.
`,
    { role: "Backend Developer" },
  ),
  q(
    "cpp",
    "What is template specialization?",
    "Templates",
    "HARD",
    `
Explain full and partial template specialization. Write a class template TypeName<T> with a static name() method that returns "unknown" by default, "int" for int, and "pointer" for any pointer type.
`,
    `
- Full (explicit) specialization provides a separate implementation for one exact set of template arguments.
- Partial specialization (class templates only) provides an implementation for a family of arguments, such as all pointer types. Function templates can't be partially specialized; use overloading instead.

\`\`\`
template <typename T>
struct TypeName { static const char *name() { return "unknown"; } };

template <>                     // full specialization
struct TypeName<int> { static const char *name() { return "int"; } };

template <typename T>           // partial specialization
struct TypeName<T *> { static const char *name() { return "pointer"; } };

TypeName<double>::name();   // "unknown"
TypeName<int>::name();      // "int"
TypeName<char *>::name();   // "pointer"
\`\`\`

- The compiler picks the most specialised matching version.
- This is the basis of type traits such as std::is_pointer and of specialisations like std::hash for custom key types.
`,
  ),
  q(
    "cpp",
    "What happens when you call a virtual function in a constructor?",
    "Polymorphism",
    "HARD",
    `
What does this print, and why? What happens if init() is pure virtual in Base?

\`\`\`
struct Base {
    Base() { init(); }
    virtual void init() { cout << "Base::init\\n"; }
};
struct Derived : Base {
    void init() override { cout << "Derived::init\\n"; }
};

Derived d;
\`\`\`
`,
    `
It prints "Base::init".

- While Base's constructor runs, the Derived part of the object has not been constructed yet. C++ therefore treats the object as a Base during that time: its vptr points to Base's vtable, and virtual calls resolve to Base's versions. This prevents calling Derived code that would use uninitialised Derived members.
- The same rule applies in destructors: by the time ~Base runs, the Derived part is already destroyed, so virtual calls resolve to Base.
- If init() were pure virtual in Base, calling it (directly or indirectly) from the constructor is undefined behaviour; typically the program aborts with "pure virtual function called". A direct call is usually caught by the compiler.
- Java behaves differently: it does dispatch to the subclass override from a constructor, which is its own source of bugs.
- Fix: do the polymorphic setup after construction (a separate init call or a factory function).
`,
    { role: "SDE" },
  ),
];
