import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const CS_TASKS: CatalogueTask[] = [
  // DSA
  task(
    "dsa",
    "Check a palindrome with two pointers",
    "EASY",
    `
Write isPalindrome(s) that returns true if the string reads the same forwards and backwards, ignoring case and any character that is not a letter or digit.

- Use two pointers (one from each end), not reverse-and-compare.
- Do it in O(n) time and O(1) extra space.
- In a comment, state the time and space complexity.
`,
    [
      c("pointers", "Uses two pointers moving inward from both ends", 3),
      c("skip", "Skips non-alphanumeric characters and ignores case", 3),
      c("correct", "Correct output for all sample calls, including the empty string", 3),
      c("complexity", "States O(n) time and O(1) space", 1),
    ],
    `
function isPalindrome(s) {
  // your code here
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // false
console.log(isPalindrome("")); // true
console.log(isPalindrome("No 'x' in Nixon")); // true
`,
  ),
  task(
    "dsa",
    "Find the first non-repeating character",
    "EASY",
    `
Write firstUnique(s) that returns the first character in the string that appears exactly once. Return null if every character repeats.

- Aim for O(n) time using a frequency map (an object or Map).
- In a comment, explain why two passes over the string are enough.
`,
    [
      c("count", "Builds a frequency count in one pass", 3),
      c("order", "Second pass returns the first character with count 1", 3),
      c("edge", "Returns null when no unique character exists", 2),
      c("explain", "Explains the O(n) two-pass idea", 2),
    ],
    `
function firstUnique(s) {
  // your code here
}

console.log(firstUnique("leetcode")); // "l"
console.log(firstUnique("loveleetcode")); // "v"
console.log(firstUnique("aabb")); // null
`,
  ),
  task(
    "dsa",
    "Longest substring without repeats",
    "MEDIUM",
    `
Write longestUniqueSubstring(s) that returns the length of the longest substring with no repeated characters.

- Use a sliding window: grow the right end, and move the left end past the last seen copy of a repeated character.
- The solution must be O(n). A brute force that checks every substring scores low.
- In a comment, explain how the window moves on "abba".
`,
    [
      c("window", "Correct sliding-window approach with a map or set", 4),
      c("correct", "Correct output for all sample calls", 3),
      c("complexity", "Runs in O(n) and states the complexity", 2),
      c("trace", "Explains the window on 'abba' (left pointer never moves back)", 1),
    ],
    `
function longestUniqueSubstring(s) {
  // your code here
}

console.log(longestUniqueSubstring("abcabcbb")); // 3
console.log(longestUniqueSubstring("bbbbb")); // 1
console.log(longestUniqueSubstring("pwwkew")); // 3
console.log(longestUniqueSubstring("abba")); // 2
`,
  ),
  task(
    "dsa",
    "Merge k sorted arrays with a min-heap",
    "HARD",
    `
Write mergeKSorted(arrays) that merges k sorted arrays of numbers into one sorted array.

- Implement your own small min-heap (push and pop) – JavaScript has no built-in one.
- Keep at most k items in the heap at a time: push the first item of each array, then after each pop push the next item from the same array.
- Handle empty input and empty inner arrays.
- In a comment, give the time complexity in terms of N (total items) and k, and say why it beats concatenating and sorting when k is small.
`,
    [
      c("heap", "Working min-heap with correct sift-up and sift-down", 3),
      c("merge", "Heap holds at most k items and tracks array and index", 3),
      c("correct", "Correct output for all sample calls, including empty cases", 2),
      c("complexity", "States O(N log k) and compares with O(N log N)", 2),
    ],
    `
class MinHeap {
  constructor() {
    this.items = [];
  }
  push(item) {
    // your code here
  }
  pop() {
    // your code here
  }
  get size() {
    return this.items.length;
  }
}

function mergeKSorted(arrays) {
  // your code here
}

console.log(mergeKSorted([[1, 4, 5], [1, 3, 4], [2, 6]])); // [1, 1, 2, 3, 4, 4, 5, 6]
console.log(mergeKSorted([])); // []
console.log(mergeKSorted([[], [0]])); // [0]
`,
  ),

  // OOP
  task(
    "oop",
    "Encapsulate a bank account",
    "EASY",
    `
Write a Java class BankAccount that protects its data properly.

- Private fields: accountNumber, holderName and balance.
- A constructor that sets the account number and holder name, with balance starting at 0.
- deposit(amount) and withdraw(amount) that reject zero or negative amounts, and withdraw must not let the balance go below 0 (throw an exception or return false).
- A getter for balance but no setter.

In two lines, explain why there is no setBalance method.
`,
    [
      c("private", "Fields are private and exposed only through getters", 3),
      c("validate", "deposit and withdraw reject invalid amounts", 3),
      c("overdraw", "withdraw prevents a negative balance", 2),
      c("explain", "Explains why balance has no setter (invariants, controlled access)", 2),
    ],
    `
public class BankAccount {
    // private fields

    public BankAccount(String accountNumber, String holderName) {
        // your code here
    }

    public void deposit(double amount) {
        // your code here
    }

    public boolean withdraw(double amount) {
        // your code here
        return false;
    }

    public double getBalance() {
        return 0;
    }
}
`,
  ),
  task(
    "oop",
    "Show polymorphism with shapes",
    "EASY",
    `
Write an abstract class Shape with an abstract method area() and a concrete method describe() that prints the shape's name and area.

- Add Circle (radius) and Rectangle (width, height) subclasses that override area().
- In main, put one of each in a Shape[] array and call describe() on every element in a loop.
- In a comment, explain which call is decided at runtime and what that is called.
`,
    [
      c("abstract", "Abstract Shape with abstract area() and concrete describe()", 3),
      c("override", "Both subclasses override area() correctly", 3),
      c("loop", "Uses a Shape[] array and a single loop of describe() calls", 2),
      c("explain", "Explains runtime polymorphism / dynamic method dispatch", 2),
    ],
    `
abstract class Shape {
    abstract double area();

    void describe() {
        // print name and area
    }
}

class Circle extends Shape {
    // your code here
}

class Rectangle extends Shape {
    // your code here
}

public class Main {
    public static void main(String[] args) {
        // your code here
    }
}
`,
  ),
  task(
    "oop",
    "Override equals and hashCode correctly",
    "MEDIUM",
    `
A Student class has rollNo (String) and name (String). Two students are the same if their rollNo matches.

- Override equals(Object o) and hashCode() correctly (null check, type check, compare rollNo).
- In main, add two Student objects with the same rollNo but different names to a HashSet and print its size (it should be 1).
- Explain what goes wrong if you override only equals and not hashCode, and state the equals/hashCode contract in your own words.
`,
    [
      c("equals", "equals handles same reference, null and type, compares rollNo", 3),
      c("hash", "hashCode uses only rollNo (consistent with equals)", 3),
      c("demo", "HashSet demo prints size 1", 2),
      c("contract", "Explains the contract and the bug when hashCode is missing", 2),
    ],
    `
import java.util.*;

class Student {
    private final String rollNo;
    private final String name;

    Student(String rollNo, String name) {
        this.rollNo = rollNo;
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        // your code here
        return false;
    }

    @Override
    public int hashCode() {
        // your code here
        return 0;
    }
}

public class Main {
    public static void main(String[] args) {
        // your code here
    }
}
`,
  ),
  task(
    "oop",
    "Design a library management system",
    "HARD",
    `
Design and code (in Java) the core of a college library system.

- Books have an ISBN, title and author; the library can hold several copies of one book.
- Members are Students (max 3 books, 14 days) or Faculty (max 10 books, 30 days).
- Members can borrow and return copies. A late return costs Rs 2 per day for students and Rs 1 per day for faculty.
- Borrowing must fail if no copy is free or the member is at their limit.

Write the classes with key fields and methods, and the borrow and return logic. Then, in a short note, point out where you used encapsulation, inheritance or interfaces, and one SOLID principle your design follows.
`,
    [
      c("model", "Sensible classes: Book, BookCopy, Member subtypes, Loan, Library", 3),
      c("rules", "Member limits and loan periods handled via polymorphism, not if-chains", 2),
      c("logic", "Borrow and return logic correct, including the fail cases", 2),
      c("fine", "Correct late-fine calculation per member type", 2),
      c("solid", "Note identifies OOP pillars used and a SOLID principle", 1),
    ],
    `
import java.time.LocalDate;
import java.util.*;

abstract class Member {
    // id, name, current loans
    abstract int maxBooks();
    abstract int loanDays();
    abstract int finePerDay();
}

class Book {
    // isbn, title, author
}

class BookCopy {
    // copy id, book, available?
}

class Loan {
    // copy, member, borrowDate, dueDate
}

class Library {
    // borrow(member, isbn), returnCopy(loan, returnDate)
}
`,
  ),

  // Operating systems
  task(
    "operating-systems",
    "Process vs thread",
    "EASY",
    `
Explain the difference between a process and a thread.

- What does each thread have of its own, and what do threads of the same process share?
- Why is a context switch between threads usually cheaper than between processes?
- Give one real example where you would use multiple threads and one where you would use separate processes (for example, Chrome tabs).
`,
    [
      c("define", "Correct definitions of process and thread", 2),
      c("share", "Own: stack, registers, PC; shared: code, heap, open files", 3),
      c("switch", "Explains cheaper switch (no address-space change, TLB/cache)", 3),
      c("examples", "One sensible example for threads and one for processes", 2),
    ],
    `
Process:

Thread:

Own vs shared:

Context switch:

Examples:
`,
  ),
  task(
    "operating-systems",
    "Compare FCFS and SJF scheduling",
    "EASY",
    `
Four processes arrive at time 0 with these CPU burst times (ms):

- P1: 6
- P2: 8
- P3: 7
- P4: 3

For both FCFS (order P1, P2, P3, P4) and non-preemptive SJF:

- Draw the Gantt chart (as text, e.g. P1 0–6 | P2 6–14 ...).
- Compute the waiting time and turnaround time of each process, and the averages.
- Say which is better here and name one drawback of SJF.
`,
    [
      c("gantt", "Correct Gantt charts for both algorithms", 2),
      c("fcfs", "FCFS: average waiting 10.25 ms, average turnaround 16.25 ms", 3),
      c("sjf", "SJF: average waiting 7 ms, average turnaround 13 ms", 3),
      c("drawback", "Picks SJF and names a drawback (starvation, burst unknown)", 2),
    ],
    `
FCFS Gantt chart:
Waiting times:
Turnaround times:

SJF Gantt chart:
Waiting times:
Turnaround times:

Conclusion:
`,
  ),
  task(
    "operating-systems",
    "Count page faults: FIFO, LRU, Optimal",
    "MEDIUM",
    `
A process has 3 page frames (all empty at the start) and this page reference string:

7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1

- Trace FIFO, LRU and Optimal replacement, showing the frame contents after each fault.
- Give the total number of page faults for each.
- Explain why Optimal can't be used in a real OS, and what Belady's anomaly is (which of these algorithms can suffer from it).
`,
    [
      c("fifo", "FIFO trace with 15 page faults", 3),
      c("lru", "LRU trace with 12 page faults", 3),
      c("opt", "Optimal trace with 9 page faults", 2),
      c("theory", "Optimal needs the future; Belady's anomaly explained (FIFO)", 2),
    ],
    `
FIFO trace:
Faults:

LRU trace:
Faults:

Optimal trace:
Faults:

Why not Optimal / Belady's anomaly:
`,
  ),
  task(
    "operating-systems",
    "Solve producer-consumer with semaphores",
    "HARD",
    `
A producer puts items into a shared buffer of size N, and a consumer takes them out. Both run at the same time.

- Explain what goes wrong (race condition) if they share the buffer and a count variable with no synchronisation.
- Write pseudocode for the producer and consumer using three semaphores: mutex, empty and full. Give their initial values.
- Explain what happens if the producer calls wait(mutex) before wait(empty) when the buffer is full.
- Say how your solution changes with several producers and consumers, if at all.
`,
    [
      c("race", "Clear race-condition example on count/buffer", 2),
      c("init", "Correct initial values: mutex=1, empty=N, full=0", 2),
      c("code", "Correct wait/signal order in producer and consumer", 3),
      c("deadlock", "Explains the deadlock from swapping wait(mutex) and wait(empty)", 2),
      c("multi", "Correct answer on multiple producers/consumers", 1),
    ],
    `
Race condition:

Semaphores and initial values:

Producer:
  while (true) {
  }

Consumer:
  while (true) {
  }

Swapped wait order:

Multiple producers/consumers:
`,
  ),

  // Computer networks
  task(
    "computer-networks",
    "TCP vs UDP with real examples",
    "EASY",
    `
Compare TCP and UDP.

- Give at least four differences (connection, reliability, ordering, speed/overhead, header size).
- For each of these apps, say which protocol fits and why: a video call, a file download, DNS lookups, online multiplayer games, sending email.
`,
    [
      c("diffs", "At least four correct differences", 4),
      c("apps", "Correct protocol for each of the five apps", 4),
      c("why", "Reasons tie the choice to reliability vs latency", 2),
    ],
    `
Differences:
-

Video call:
File download:
DNS:
Multiplayer game:
Email:
`,
  ),
  task(
    "computer-networks",
    "Walk through the OSI model",
    "EASY",
    `
List the seven OSI layers from bottom to top. For each layer give:

- Its job in one line.
- One protocol or standard that works there (e.g. HTTP, TCP, IP, Ethernet).
- The data unit name where it applies (bit, frame, packet, segment).

Then say at which layer a switch, a router and a hub work, and how the OSI layers map to the four TCP/IP layers.
`,
    [
      c("order", "All seven layers in the correct order", 3),
      c("detail", "Correct job and an example protocol for each layer", 3),
      c("devices", "Hub L1, switch L2, router L3", 2),
      c("tcpip", "Correct mapping to the TCP/IP model", 2),
    ],
    `
7.
6.
5.
4.
3.
2.
1.

Devices:

TCP/IP mapping:
`,
  ),
  task(
    "computer-networks",
    "Subnet a /24 network",
    "MEDIUM",
    `
Your college lab has the network 192.168.10.0/24 and needs it split into 4 equal subnets.

- What is the new prefix length and subnet mask?
- For each subnet, give the network address, the first and last usable host, and the broadcast address.
- How many usable hosts does each subnet have? Show the formula.
- Which subnet does the host 192.168.10.150 belong to?
`,
    [
      c("mask", "Prefix /26 and mask 255.255.255.192", 2),
      c("ranges", "Correct network, host range and broadcast for all four subnets", 4),
      c("hosts", "62 usable hosts per subnet using 2^6 - 2", 2),
      c("lookup", "192.168.10.150 is in 192.168.10.128/26", 2),
    ],
    `
Prefix and mask:

Subnet 1:
Subnet 2:
Subnet 3:
Subnet 4:

Usable hosts:

192.168.10.150 belongs to:
`,
  ),
  task(
    "computer-networks",
    "Explain how TCP stays reliable",
    "HARD",
    `
Explain in detail how TCP delivers data reliably over an unreliable network. Cover:

- The three-way handshake and why the initial sequence numbers are exchanged.
- Sequence numbers, acknowledgements and retransmission (timeouts and 3 duplicate ACKs).
- Flow control with the receiver window, and how it differs from congestion control.
- Congestion control: slow start, congestion avoidance (AIMD) and what happens on packet loss.
- Connection teardown with FIN and why the TIME_WAIT state exists.

Diagrams in text (arrows between Client and Server) are welcome.
`,
    [
      c("handshake", "Correct SYN, SYN-ACK, ACK with sequence numbers", 2),
      c("reliability", "ACKs, retransmission on timeout and fast retransmit", 2),
      c("flow", "Receiver window flow control, distinguished from congestion control", 2),
      c("congestion", "Slow start, AIMD and the reaction to loss", 2),
      c("teardown", "FIN/ACK teardown and the purpose of TIME_WAIT", 2),
    ],
    `
Handshake:

Sequence numbers, ACKs, retransmission:

Flow control:

Congestion control:

Teardown and TIME_WAIT:
`,
  ),

  // System design
  task(
    "system-design",
    "Vertical vs horizontal scaling",
    "EASY",
    `
Your college fest website crashes every year when registrations open. It runs on a single server with the app and database together.

- Explain vertical and horizontal scaling, with one pro and one con each.
- Explain what a load balancer does and name two ways it can pick a server (e.g. round robin).
- Why must the app servers be stateless (where do sessions go) for horizontal scaling to work?
- Suggest a simple first fix for the fest site.
`,
    [
      c("scaling", "Correct explanation of both with a pro and con each", 3),
      c("lb", "Load balancer role and two balancing strategies", 3),
      c("stateless", "Explains stateless servers with shared session store or tokens", 2),
      c("fix", "A sensible, concrete first fix (separate DB, add LB + servers, CDN)", 2),
    ],
    `
Vertical scaling:

Horizontal scaling:

Load balancer:

Stateless servers:

First fix:
`,
  ),
  task(
    "system-design",
    "Add a cache to a product page",
    "EASY",
    `
An e-commerce product page reads from the database on every request, and the database is overloaded. Most products change price only a few times a day.

- Explain the cache-aside pattern step by step for reading a product.
- What happens when a product's price is updated? Describe how you keep the cache fresh (invalidate vs update, TTL).
- Which data should you not cache here, and why (e.g. live stock count)?
- Name one tool you would use (e.g. Redis) and one eviction policy.
`,
    [
      c("aside", "Correct cache-aside read flow (check cache, miss, load, store)", 3),
      c("fresh", "Sensible invalidation on update plus a TTL", 3),
      c("avoid", "Identifies data that should not be cached with a reason", 2),
      c("tool", "Names a cache tool and an eviction policy such as LRU", 2),
    ],
    `
Read flow:

On price update:

Do not cache:

Tool and eviction:
`,
  ),
  task(
    "system-design",
    "Design an API rate limiter",
    "MEDIUM",
    `
Design a rate limiter for a public API: each user may make at most 100 requests per minute. The API runs on several servers behind a load balancer.

- Compare two algorithms (e.g. fixed window, sliding window, token bucket) and pick one.
- Where does the limiter run, and where are the counters stored so all servers share them?
- What does the API return when a user is over the limit (status code and headers)?
- How do you avoid race conditions when two servers update the same counter?
`,
    [
      c("algo", "Two algorithms compared, with a justified choice", 3),
      c("store", "Shared counter store (e.g. Redis) and limiter placement", 3),
      c("response", "Returns 429 with Retry-After or rate-limit headers", 2),
      c("atomic", "Atomic updates (INCR with expiry, Lua script)", 2),
    ],
    `
Algorithms compared:

Chosen algorithm:

Where it runs / counter storage:

Over-limit response:

Race conditions:
`,
  ),
  task(
    "system-design",
    "Design a notification service",
    "MEDIUM",
    `
A placement portal must notify 20,000 students by email, SMS and app push when a new company drive is posted. Students choose which channels they want.

- Draw the main components (as a text diagram): API, message queue, workers per channel, third-party providers.
- Why use a queue instead of sending directly in the API request?
- How do you handle a provider failing (retries with backoff, dead-letter queue)?
- How do you avoid sending the same notification twice (idempotency)?
- What would you store about each notification?
`,
    [
      c("design", "Clear components with a queue and per-channel workers", 3),
      c("queue", "Explains async benefits: fast API, buffering, independent scaling", 2),
      c("retry", "Retries with backoff and a dead-letter queue", 2),
      c("idempotent", "Idempotency key or dedupe check before sending", 2),
      c("data", "Sensible notification record (user, channel, status, timestamps)", 1),
    ],
    `
Components:

Why a queue:

Failures:

Duplicates:

Stored data:
`,
  ),
];
