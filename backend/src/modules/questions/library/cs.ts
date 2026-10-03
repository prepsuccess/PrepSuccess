import { q, type CatalogueQuestion } from "./helpers.js";

/** Interview questions for this topic group (see helpers.ts for the format). */
export const CS_QUESTIONS: CatalogueQuestion[] = [
  // ---------------------------------------------------------------- DSA
  q(
    "dsa",
    "Find the second largest element in an array",
    "Arrays",
    "EASY",
    `
Given an integer array, return the second largest distinct value. Do it in a single pass, without sorting.

Example: [12, 35, 1, 10, 34, 1] -> 34
`,
    `
Track the largest and second largest while scanning once. Skip values equal to the largest so duplicates don't count twice.

\`\`\`python
def second_largest(a):
    first = second = None
    for x in a:
        if first is None or x > first:
            first, second = x, first
        elif x != first and (second is None or x > second):
            second = x
    return second  # None if no second distinct value
\`\`\`

- Time O(n), space O(1).
- Sorting works too, but costs O(n log n), and you still have to skip duplicates.
`,
    { company: "TCS" },
  ),
  q(
    "dsa",
    "Reverse a string without using built-in reverse functions",
    "Strings",
    "EASY",
    `
Write a function that reverses a string in place (or into a new buffer) without calling any library reverse method.

Example: "placement" -> "tnemecalp"
`,
    `
Use two pointers from both ends and swap until they meet.

\`\`\`java
static String reverse(String s) {
    char[] c = s.toCharArray();
    int i = 0, j = c.length - 1;
    while (i < j) {
        char t = c[i];
        c[i++] = c[j];
        c[j--] = t;
    }
    return new String(c);
}
\`\`\`

- Time O(n), extra space O(n) for the char array, since Java strings are immutable.
- Follow-up: reverse the words in a sentence. Reverse the whole string, then reverse each word.
`,
    { company: "Zoho" },
  ),
  q(
    "dsa",
    "Check whether a string is a palindrome",
    "Strings",
    "EASY",
    `
Return true if a string reads the same forwards and backwards. Variant: ignore case and non-alphanumeric characters, so "A man, a plan, a canal: Panama" is a palindrome.
`,
    `
Compare characters from both ends, moving inwards.

\`\`\`python
def is_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        if not s[i].isalnum():
            i += 1
        elif not s[j].isalnum():
            j -= 1
        elif s[i].lower() != s[j].lower():
            return False
        else:
            i, j = i + 1, j - 1
    return True
\`\`\`

- Time O(n), space O(1).
- s == s[::-1] is fine for a quick answer, but it uses O(n) extra space, and interviewers usually want the two-pointer version.
`,
  ),
  q(
    "dsa",
    "What is the difference between an array and a linked list?",
    "Linked Lists",
    "EASY",
    `
Compare arrays and linked lists in terms of memory layout, access time, insertion/deletion cost and when you would choose each.
`,
    `
- Memory: an array is one contiguous block. Linked list nodes are scattered, and each one holds a pointer to the next.
- Access: an array gives O(1) random access by index. A list needs O(n) traversal.
- Insert/delete: an array costs O(n), because elements shift. A list costs O(1) once you have the node, with no shifting.
- Size: a static array is fixed size (dynamic arrays resize by copying). A list grows one node at a time.
- Cache: arrays are cache-friendly. Lists have poor locality and extra pointer overhead.

Choose an array when you mostly read by index. Choose a list when you frequently insert or remove in the middle, or to build stacks, queues and LRU caches.
`,
  ),
  q(
    "dsa",
    "What is Big-O notation, and why is binary search O(log n)?",
    "Complexity",
    "EASY",
    `
Explain Big-O notation in simple terms. Then explain why binary search on a sorted array of n elements takes O(log n) time.
`,
    `
- Big-O describes how running time (or space) grows as the input grows, as an upper bound that ignores constants and lower-order terms. For example, 3n^2 + 5n is O(n^2).
- Common orders: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n).
- Binary search compares the target with the middle element and discards half the array each step. After k steps, n/2^k elements remain. It stops when that reaches 1, so k = log2(n).
- Example: 1,000,000 elements need about 20 comparisons.
- Precondition: the array must be sorted and support random access.
`,
  ),
  q(
    "dsa",
    "What is the difference between a stack and a queue?",
    "Stacks & Queues",
    "EASY",
    `
Explain stacks and queues, their core operations and complexity, and give real-world or programming uses of each.
`,
    `
- Stack: LIFO (last in, first out). Operations are push, pop and peek, each O(1).
- Queue: FIFO (first in, first out). Operations are enqueue (rear), dequeue (front) and peek, each O(1).
- Stack uses: function call stack, undo/redo, expression evaluation, balanced brackets, DFS, browser back button.
- Queue uses: BFS, printer or job scheduling, request buffers, producer-consumer pipelines.
- Variants: a deque (both ends), a circular queue (reuses array slots) and a priority queue (served by priority, usually a heap).
`,
  ),
  q(
    "dsa",
    "Find the missing number in an array of 1 to n",
    "Arrays",
    "EASY",
    `
An array contains n-1 distinct numbers from the range 1..n, so exactly one number is missing. Find it in O(n) time and O(1) space.

Example: [1, 2, 4, 5, 6] (n = 6) -> 3
`,
    `
- Sum method: the expected sum is n(n+1)/2. Subtract the actual sum. For the example, 21 - 18 = 3.
- XOR method: XOR every number from 1..n with every array element. Pairs cancel and the missing number remains. This avoids overflow for large n.

\`\`\`python
def missing(a, n):
    x = 0
    for i in range(1, n + 1):
        x ^= i
    for v in a:
        x ^= v
    return x
\`\`\`

Time O(n), space O(1).
`,
  ),
  q(
    "dsa",
    "Detect a cycle in a linked list",
    "Linked Lists",
    "MEDIUM",
    `
Given the head of a singly linked list, determine whether it contains a cycle. Can you do it with O(1) extra space? Follow-up: return the node where the cycle starts.
`,
    `
Use Floyd's tortoise and hare: a slow pointer moves 1 step and a fast pointer moves 2. If there is a cycle they must meet. If fast reaches null, there is no cycle.

\`\`\`python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False
\`\`\`

- Cycle start: after they meet, move one pointer back to head and advance both 1 step at a time. They meet at the start of the cycle.
- Time O(n), space O(1). A hash set of visited nodes also works, but uses O(n) space.
`,
  ),
  q(
    "dsa",
    "Reverse a singly linked list",
    "Linked Lists",
    "MEDIUM",
    `
Reverse a singly linked list and return the new head. Write the iterative version, then explain the recursive one.

1 -> 2 -> 3 -> 4 -> null   becomes   4 -> 3 -> 2 -> 1 -> null
`,
    `
Iteratively, keep three references: prev, current and next.

\`\`\`python
def reverse(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev, head = head, nxt
    return prev
\`\`\`

- Time O(n), space O(1).
- Recursive version: reverse the rest of the list, then set head.next.next = head and head.next = None, and return the new head. It uses O(n) stack space.
- Common mistake: losing the rest of the list by overwriting head.next before saving it.
`,
  ),
  q(
    "dsa",
    "Two Sum: find two indices whose values add up to a target",
    "Hashing",
    "MEDIUM",
    `
Given an array nums and an integer target, return the indices of the two numbers that add up to target. Assume exactly one solution exists.

Example: nums = [2, 7, 11, 15], target = 9 -> [0, 1]
`,
    `
Brute force checks every pair in O(n^2). Better: store each value's index in a hash map and look up the complement.

\`\`\`python
def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
\`\`\`

- Time O(n), space O(n).
- If the array is sorted (or you only need the values), two pointers from both ends give O(1) extra space.
`,
    { company: "Amazon" },
  ),
  q(
    "dsa",
    "Find the maximum subarray sum (Kadane's algorithm)",
    "Dynamic Programming",
    "MEDIUM",
    `
Find the contiguous subarray with the largest sum and return that sum.

Example: [-2, 1, -3, 4, -1, 2, 1, -5, 4] -> 6 (subarray [4, -1, 2, 1])
`,
    `
Kadane's algorithm: at each element, either extend the current subarray or start a new one there.

\`\`\`python
def max_subarray(a):
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best
\`\`\`

- Time O(n), space O(1).
- Starting from a[0] (not 0) handles arrays where every value is negative.
- To return the subarray itself, record the start index whenever cur restarts at x.
`,
  ),
  q(
    "dsa",
    "Check if a string of brackets is balanced",
    "Stacks & Queues",
    "MEDIUM",
    `
Given a string containing only ()[]{} characters, return true if every bracket is closed by the same type in the correct order.

Examples: "{[()]}" -> true, "([)]" -> false, "((" -> false
`,
    `
Push opening brackets onto a stack. On a closing bracket, the top of the stack must be its matching opener.

\`\`\`python
def balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False
    return not stack
\`\`\`

- Time O(n), space O(n).
- Don't forget the final check: an empty stack at the end means nothing was left open.
`,
  ),
  q(
    "dsa",
    "Print the level order traversal of a binary tree",
    "Trees",
    "MEDIUM",
    `
Given the root of a binary tree, return its nodes level by level, left to right, as a list of lists.

      3
     / \\
    9   20
       /  \\
      15   7
Output: [[3], [9, 20], [15, 7]]
`,
    `
Run a BFS with a queue, processing one level at a time by taking the queue's size first.

\`\`\`python
from collections import deque

def level_order(root):
    if not root:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        out.append(level)
    return out
\`\`\`

- Time O(n), and space O(w), where w is the maximum width of the tree.
- Variants: zigzag order, right-side view and the average of each level all follow the same pattern.
`,
  ),
  q(
    "dsa",
    "Compare merge sort and quick sort",
    "Sorting & Searching",
    "MEDIUM",
    `
Explain how merge sort and quick sort work, and compare their time complexity, space usage and stability. Which would you use when, and why?
`,
    `
- Merge sort splits the array in half, sorts each half recursively and merges them. It is always O(n log n), needs O(n) extra space and is stable.
- Quick sort picks a pivot, partitions smaller elements to the left and larger to the right, then recurses. It averages O(n log n) but hits O(n^2) in the worst case (for example, a sorted input with a first-element pivot). It sorts in place with O(log n) stack space and is not stable.
- Quick sort is usually faster in practice because of cache-friendly in-place partitioning. Random or median-of-three pivots avoid the worst case.
- Use merge sort for linked lists, external sorting or when stability matters. Java sorts objects with TimSort (merge-based) and primitives with dual-pivot quick sort.
`,
  ),
  q(
    "dsa",
    "Check whether two strings are anagrams",
    "Strings",
    "MEDIUM",
    `
Two strings are anagrams if they contain the same characters with the same counts. Write an O(n) solution for lowercase English letters.

Examples: "listen", "silent" -> true; "rat", "car" -> false
`,
    `
Count characters in an array of 26: increment for the first string and decrement for the second.

\`\`\`python
def is_anagram(a, b):
    if len(a) != len(b):
        return False
    count = [0] * 26
    for x, y in zip(a, b):
        count[ord(x) - 97] += 1
        count[ord(y) - 97] -= 1
    return all(c == 0 for c in count)
\`\`\`

- Time O(n), space O(1), since the alphabet size is fixed.
- Alternative: sort both strings and compare, in O(n log n).
- For Unicode, use a hash map instead of a fixed array.
`,
  ),
  q(
    "dsa",
    "Find the longest substring without repeating characters",
    "Sliding Window",
    "HARD",
    `
Given a string s, find the length of the longest substring that contains no repeated characters.

Examples: "abcabcbb" -> 3 ("abc"), "bbbbb" -> 1, "pwwkew" -> 3 ("wke")
`,
    `
Use a sliding window with a map from each character to its last index. When a repeat falls inside the window, move the window's start just past it.

\`\`\`python
def longest(s):
    last = {}
    start = best = 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1
        last[ch] = i
        best = max(best, i - start + 1)
    return best
\`\`\`

- Time O(n), and space O(min(n, alphabet)).
- Checking last[ch] >= start matters: an old occurrence outside the window must not shrink it.
`,
    { role: "SDE" },
  ),
  q(
    "dsa",
    "Design an LRU cache with O(1) get and put",
    "Hashing",
    "HARD",
    `
Design a Least Recently Used cache with a fixed capacity:
- get(key) returns the value, or -1 if missing.
- put(key, value) inserts or updates. When the cache is full, it evicts the least recently used key.
Both operations must run in O(1).
`,
    `
Combine a hash map (key -> node) with a doubly linked list ordered by recency. The head holds the most recent entry and the tail the least recent.

- get: look up the node, move it to the head and return its value.
- put: update and move to the head, or insert a new node at the head. If over capacity, remove the tail node and its map entry.
- Sentinel head and tail nodes avoid null checks.

In Python, OrderedDict provides this structure:

\`\`\`python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap, self.d = capacity, OrderedDict()
    def get(self, key):
        if key not in self.d:
            return -1
        self.d.move_to_end(key)
        return self.d[key]
    def put(self, key, value):
        self.d[key] = value
        self.d.move_to_end(key)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)
\`\`\`
`,
    { role: "SDE" },
  ),
  q(
    "dsa",
    "Find the lowest common ancestor of two nodes in a binary tree",
    "Trees",
    "HARD",
    `
Given a binary tree (not necessarily a BST) and two nodes p and q that both exist in it, return their lowest common ancestor: the deepest node that has both p and q as descendants. A node counts as a descendant of itself.
`,
    `
Recurse. If the current node is p or q, return it. Otherwise search both subtrees: if both sides return a node, the current node is the LCA. If only one side does, pass that result up.

\`\`\`python
def lca(root, p, q):
    if root is None or root is p or root is q:
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root
    return left or right
\`\`\`

- Time O(n), and space O(h) for recursion, where h is the tree's height.
- For a BST it is simpler: if both values are smaller go left, if both are larger go right, otherwise the current node is the LCA (O(h)).
`,
  ),
  q(
    "dsa",
    "Solve the 0/1 knapsack problem",
    "Dynamic Programming",
    "HARD",
    `
You have n items with weights wt[] and values val[], and a bag of capacity W. Each item can be taken at most once. Maximise the total value.

Example: wt = [1, 3, 4, 5], val = [1, 4, 5, 7], W = 7 -> 9
`,
    `
- Let dp[c] be the best value achievable with capacity c. For each item, either skip it or take it: dp[c] = max(dp[c], dp[c - w] + v).
- Loop capacity downwards so each item is used at most once.

\`\`\`python
def knapsack(wt, val, W):
    dp = [0] * (W + 1)
    for w, v in zip(wt, val):
        for c in range(W, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[W]
\`\`\`

- Example: taking the weight-3 and weight-4 items gives value 4 + 5 = 9 at weight 7. That beats weights 5 + 1, which give 7 + 1 = 8.
- Time O(n * W), space O(W). A greedy pick by value/weight ratio does not work for 0/1 knapsack.
`,
  ),
  q(
    "dsa",
    "Count the number of islands in a grid",
    "Graphs",
    "HARD",
    `
Given an m x n grid of '1' (land) and '0' (water), count the islands. An island is a group of land cells connected horizontally or vertically.

11000
11000
00100
00011   -> 3 islands
`,
    `
Treat the grid as a graph. Scan every cell, and when you find unvisited land, count one island and flood-fill (DFS or BFS) to mark its whole island as visited.

\`\`\`python
def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):
        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == "1":
            grid[r][c] = "0"
            sink(r + 1, c); sink(r - 1, c)
            sink(r, c + 1); sink(r, c - 1)
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count
\`\`\`

- Time O(m * n), and O(m * n) worst-case recursion depth. Use an explicit BFS queue for very large grids.
- Union-Find is an alternative approach.
`,
    { company: "Amazon" },
  ),

  // ---------------------------------------------------------------- OOP
  q(
    "oop",
    "What are the four pillars of object-oriented programming?",
    "Pillars",
    "EASY",
    `
Name and explain the four pillars of OOP, with a one-line real-world example for each.
`,
    `
- Encapsulation: bundle data and the methods that act on it, and hide internal state behind an interface. Example: a BankAccount's balance is private and changes only through deposit() and withdraw().
- Abstraction: expose what an object does, not how it does it. Example: you call car.start() without knowing the engine internals.
- Inheritance: a class reuses and extends another class (an is-a relationship). Example: a SavingsAccount extends Account.
- Polymorphism: one interface, many forms. Through overloading (compile time) or overriding (runtime), the same call behaves differently. Example: shape.area() on a Circle or a Square.
`,
    { company: "TCS" },
  ),
  q(
    "oop",
    "What is the difference between a class and an object?",
    "Classes & Objects",
    "EASY",
    `
Explain the difference between a class and an object with an example. When is memory allocated?
`,
    `
- A class is a blueprint or template. It defines fields (state) and methods (behaviour), but is not itself a concrete thing.
- An object is an instance of a class, with its own copy of the instance fields.
- Example: Car is a class. A red Swift with registration MH12AB1234 is an object.
- Memory: declaring a class doesn't allocate memory for instance data. Each object gets memory when it is created (with new, on the heap in Java).
- One class can have many objects, and each object has its own state but shares the class's methods.
`,
  ),
  q(
    "oop",
    "What is a constructor, and what types of constructors exist?",
    "Classes & Objects",
    "EASY",
    `
What is a constructor? How is it different from a normal method? Explain the default, parameterised and copy constructors.
`,
    `
- A constructor is a special method that runs automatically when an object is created, to initialise it.
- Differences from a method: it has the same name as the class, has no return type (not even void) and is called implicitly at creation.
- Default (no-arg): the compiler provides one only if you define no constructor at all.
- Parameterised: it takes arguments to set the initial state, for example new Student("Asha", 21).
- Copy constructor: it builds a new object from an existing one. C++ supports this natively; in Java you write it yourself.
- Constructors can be overloaded and can chain with this(...) or super(...). They are not inherited.
`,
  ),
  q(
    "oop",
    "What is the difference between method overloading and method overriding?",
    "Polymorphism",
    "EASY",
    `
Explain method overloading and method overriding with short Java examples, and say which kind of polymorphism each represents.
`,
    `
- Overloading: the same method name in the same class with different parameter lists (number, type or order). The compiler resolves it at compile time, so it is compile-time (static) polymorphism. A different return type alone is not enough.
- Overriding: a subclass redefines a parent method with the same signature. The call is resolved at runtime by the object's actual type, so it is runtime (dynamic) polymorphism.

\`\`\`java
int add(int a, int b) { return a + b; }           // overloads
double add(double a, double b) { return a + b; }

class Animal { void sound() { System.out.println("..."); } }
class Dog extends Animal {
    @Override void sound() { System.out.println("Bark"); }
}
\`\`\`

Static, private and final methods cannot be overridden.
`,
  ),
  q(
    "oop",
    "What is encapsulation? Explain with an example",
    "Pillars",
    "EASY",
    `
Define encapsulation and show how you would implement it in Java. Why is it useful?
`,
    `
Encapsulation means keeping fields private and exposing controlled access through methods, so an object guards its own invariants.

\`\`\`java
class Account {
    private double balance;
    public double getBalance() { return balance; }
    public void deposit(double amt) {
        if (amt <= 0) throw new IllegalArgumentException("Invalid amount");
        balance += amt;
    }
}
\`\`\`

- Validation lives in one place, so balance can never go negative from outside.
- The internal representation can change without breaking callers.
- It is easier to debug and test, and a class can be made read-only by providing only getters.
`,
  ),
  q(
    "oop",
    "Explain access modifiers in Java",
    "Pillars",
    "EASY",
    `
List Java's access modifiers and describe where a member with each modifier can be accessed from.
`,
    `
| Modifier | Same class | Same package | Subclass (other package) | Everywhere |
|---|---|---|---|---|
| private | Yes | No | No | No |
| default (none) | Yes | Yes | No | No |
| protected | Yes | Yes | Yes | No |
| public | Yes | Yes | Yes | Yes |

- Top-level classes can only be public or default.
- A good rule: make fields private and expose the minimum needed. This is how encapsulation is enforced.
- C++ has public, private and protected, with private as the default for class members.
`,
  ),
  q(
    "oop",
    "What is inheritance, and what are its types?",
    "Inheritance",
    "EASY",
    `
What is inheritance? Describe the types of inheritance, and say which ones Java supports with classes.
`,
    `
Inheritance lets a child class acquire the fields and methods of a parent class. It enables code reuse and an is-a relationship (Dog is an Animal).

- Single: B extends A.
- Multilevel: C extends B, which extends A.
- Hierarchical: B and C both extend A.
- Multiple: C extends both A and B. Java doesn't allow this with classes, but a class can implement multiple interfaces. C++ allows it.
- Hybrid: a combination of the above.

In Java, super calls the parent's constructor or methods. Every class implicitly extends Object.
`,
  ),
  q(
    "oop",
    "What is the difference between an abstract class and an interface?",
    "Abstraction",
    "MEDIUM",
    `
Compare abstract classes and interfaces in Java (Java 8 and later). When would you choose one over the other?
`,
    `
- Methods: an abstract class can have abstract and concrete methods. An interface has abstract methods, plus default and static methods (Java 8+) and private methods (Java 9+).
- State: an abstract class can have instance fields and constructors. An interface has only public static final constants.
- Inheritance: a class extends one abstract class but can implement many interfaces.
- Access: abstract class members can have any access modifier. Interface methods are public by default.
- Choose an abstract class for closely related classes that share state or code (a base Vehicle with common fields).
- Choose an interface for a capability that unrelated classes can share (Comparable, Runnable), or to get multiple inheritance of type.
`,
    { company: "Infosys" },
  ),
  q(
    "oop",
    "What is the difference between compile-time and runtime polymorphism?",
    "Polymorphism",
    "MEDIUM",
    `
Explain static versus dynamic polymorphism. How does the JVM decide which overridden method to call? What is upcasting?
`,
    `
- Compile-time (static binding): method overloading (and operator overloading in C++). The compiler picks the method from the reference type and the argument types.
- Runtime (dynamic dispatch): method overriding. The JVM picks the method from the actual object type at runtime, using the class's method table.
- Upcasting: a parent reference points to a child object, as in Animal a = new Dog(). Calling a.sound() runs Dog's version.
- Only methods are polymorphic, not fields. a.name reads the field declared in Animal.
- Static, private and final methods are bound at compile time.
- Benefit: code is written against the parent type and works with any subclass (the open/closed principle).
`,
  ),
  q(
    "oop",
    "Why doesn't Java support multiple inheritance with classes?",
    "Inheritance",
    "MEDIUM",
    `
Explain the diamond problem and how Java avoids it. Java 8 interfaces can have default methods, so what happens when two interfaces define the same default method?
`,
    `
- Diamond problem: B and C both extend A and override foo(). If D extended both B and C, it would be unclear which foo() D inherits, and A's state would be duplicated.
- Java avoids this by allowing only one superclass while a class can implement many interfaces, which originally had no implementation.
- With default methods, if interfaces X and Y both define default void hello(), a class implementing both gets a compile error unless it overrides hello(). It can then call a specific version:

\`\`\`java
class Z implements X, Y {
    public void hello() { X.super.hello(); }
}
\`\`\`

- C++ allows multiple inheritance and solves the diamond with virtual inheritance.
`,
  ),
  q(
    "oop",
    "When would you prefer composition over inheritance?",
    "Inheritance",
    "MEDIUM",
    `
Explain composition versus inheritance with an example. Why do many design guides say "favour composition over inheritance"?
`,
    `
- Inheritance is an is-a relationship: Car extends Vehicle. Composition is a has-a relationship: Car has an Engine.
- Inheritance couples the child tightly to the parent, so changes in the parent can break children (the fragile base class problem). It is also fixed at compile time.
- Composition delegates to member objects, which can be swapped at runtime (for example new Car(new ElectricEngine())). This keeps classes small and testable.
- Use inheritance only for a true is-a relationship where the subclass can substitute for the parent everywhere (Liskov).
- Classic misuse: Stack extends Vector in Java exposes unwanted methods like insertElementAt. A Stack that holds a list is cleaner.
`,
  ),
  q(
    "oop",
    "What is a virtual function in C++, and how does a vtable work?",
    "Polymorphism",
    "MEDIUM",
    `
What is a virtual function? Explain how the vtable and vptr enable runtime polymorphism in C++. Why should a base class destructor be virtual?
`,
    `
- A virtual function is a member function declared with virtual in the base class. A call through a base pointer or reference runs the derived class's override.
- Each class with virtual functions has a vtable, a table of function pointers. Each object holds a hidden vptr that points to its class's vtable.
- A call such as base_ptr->draw() follows vptr to the vtable to the correct function at runtime.
- A pure virtual function (virtual void draw() = 0;) makes the class abstract.
- Virtual destructor: without one, delete base_ptr on a derived object calls only the base destructor, which leaks the derived class's resources (formally undefined behaviour).
- Cost: one pointer per object and an indirect call.
`,
  ),
  q(
    "oop",
    "What is the difference between a shallow copy and a deep copy?",
    "Classes & Objects",
    "MEDIUM",
    `
Explain shallow copy versus deep copy with an example of an object that contains a list or array. How do you implement a deep copy in Java?
`,
    `
- A shallow copy copies field values as they are. Reference fields still point to the same nested objects, so changing the copy's list also changes the original's.
- A deep copy recursively copies nested objects too, so the copy is fully independent.

\`\`\`java
class Team {
    List<String> members;
    Team(Team other) {                 // deep-copy constructor
        this.members = new ArrayList<>(other.members);
    }
}
\`\`\`

- Object.clone() is shallow by default. You must clone the nested fields manually.
- Other options: copy constructors, serialisation, or immutable objects, which can be shared safely.
`,
  ),
  q(
    "oop",
    "What does the static keyword mean in Java?",
    "Classes & Objects",
    "MEDIUM",
    `
Explain static variables, static methods, static blocks and static nested classes in Java. Can a static method access instance variables?
`,
    `
- Static variable: one copy belongs to the class and is shared by all objects. It is used for counters and constants.
- Static method: called on the class (Math.max). It has no this, so it cannot directly access instance variables or methods. It needs an object reference to reach them.
- Static block: runs once when the class is loaded. It is used to initialise static data.
- Static nested class: does not hold a reference to an outer instance, so it can be created without one.
- Static methods are hidden, not overridden: a subclass's static method with the same signature does not take part in dynamic dispatch.
- main is static so the JVM can call it without creating an object.
`,
  ),
  q(
    "oop",
    "Implement a thread-safe Singleton class",
    "Design Patterns",
    "MEDIUM",
    `
What is the Singleton pattern? Write a thread-safe, lazily initialised Singleton in Java, and mention its drawbacks.
`,
    `
Singleton guarantees a class has exactly one instance and provides a global access point to it (for example a config or a logger).

\`\`\`java
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

- volatile prevents another thread from seeing a partly constructed object.
- Simpler options: the holder-class idiom, a private static nested class holding the instance (lazy and thread-safe through class loading), or an enum Singleton, which is also safe against serialisation and reflection.
- Drawbacks: it is hidden global state, hard to mock in tests and couples callers to it. Dependency injection is often better.
`,
    { role: "Backend Developer" },
  ),
  q(
    "oop",
    "Explain the SOLID principles",
    "SOLID",
    "HARD",
    `
Explain each of the five SOLID principles with a short example, and say why they matter in a real codebase.
`,
    `
- S, Single Responsibility: a class has one reason to change. An InvoicePrinter shouldn't also save invoices to the database.
- O, Open/Closed: code is open for extension and closed for modification. Add a new PaymentMethod class instead of editing an if-else chain.
- L, Liskov Substitution: subtypes must be usable wherever the base type is expected, without surprises. A Square that breaks Rectangle's setWidth behaviour violates it.
- I, Interface Segregation: many small interfaces beat one fat one. A Printer shouldn't be forced to implement fax().
- D, Dependency Inversion: depend on abstractions, not concrete classes. An OrderService takes a PaymentGateway interface, injected from outside.

Why they matter: they give loose coupling, easier testing with mocks, and changes that stay local instead of rippling through the codebase.
`,
    { role: "SDE" },
  ),
  q(
    "oop",
    "Why does a Square extending Rectangle violate the Liskov Substitution Principle?",
    "SOLID",
    "HARD",
    `
Mathematically a square is a rectangle. Yet modelling class Square extends Rectangle is the textbook LSP violation. Explain why, and show how you would fix the design.
`,
    `
Rectangle has setWidth and setHeight, which change independently. To stay square, Square must override both to set the width and the height together.

\`\`\`java
void resize(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    assert r.area() == 20;   // fails for a Square: area is 16
}
\`\`\`

- Client code that is correct for Rectangle breaks when given a Square, so a Square is not substitutable. The subclass weakened the parent's postcondition (width is unchanged when you set the height).
- Fixes: make both shapes immutable (a Square can then safely be a kind of Shape), or have both implement a Shape interface with area() and give no setter contract that a Square can't honour.
- Lesson: is-a in the real world isn't enough. Subtypes must honour the parent's behavioural contract.
`,
  ),
  q(
    "oop",
    "Design the classes for a parking lot system",
    "Design Patterns",
    "HARD",
    `
Design the classes for a multi-level parking lot. It has spots for bikes, cars and trucks, issues a ticket on entry and charges by duration on exit. Identify the classes, their relationships and the key methods.
`,
    `
Core classes:
- ParkingLot (a Singleton or a single instance) holds a List<Level> and the entry and exit gates.
- Level has a list of ParkingSpots and findFreeSpot(VehicleType).
- ParkingSpot has an id, a SpotType (SMALL, MEDIUM, LARGE), isFree and park/unpark methods.
- Vehicle is abstract, with the subclasses Bike, Car and Truck. Each has a plate number and getRequiredSpotType().
- Ticket has an id, the vehicle, the spot and the entry time.
- FeeStrategy is an interface (HourlyFee, FlatFee) and is used at exit.

Flow: at entry, the gate finds a free spot of the right size, marks it occupied and issues a Ticket. At exit, the strategy computes the fee from the duration, and the spot is freed.

Talking points: use the Strategy pattern for pricing, a Factory for vehicles, synchronised spot allocation so two cars can't get the same spot, and keep the counts of free spots per type for O(1) availability checks.
`,
    { company: "Amazon", role: "SDE" },
  ),
  q(
    "oop",
    "Explain the Observer design pattern with an example",
    "Design Patterns",
    "HARD",
    `
What problem does the Observer pattern solve? Sketch an implementation in which several displays are notified whenever a stock price changes.
`,
    `
Observer defines a one-to-many dependency: when the subject's state changes, all registered observers are notified automatically, and the subject knows them only through an interface.

\`\`\`java
interface PriceObserver { void onPrice(String symbol, double price); }

class Stock {
    private final List<PriceObserver> observers = new ArrayList<>();
    void subscribe(PriceObserver o) { observers.add(o); }
    void unsubscribe(PriceObserver o) { observers.remove(o); }
    void setPrice(String sym, double p) {
        for (PriceObserver o : observers) o.onPrice(sym, p);
    }
}
\`\`\`

- Benefit: loose coupling, since new displays need no change to Stock (the open/closed principle).
- Real uses: UI event listeners, pub/sub systems, React state subscriptions.
- Pitfalls: memory leaks when observers forget to unsubscribe, unclear notification order and cascading updates.
`,
  ),
  q(
    "oop",
    "Why must equals() and hashCode() be overridden together?",
    "Classes & Objects",
    "HARD",
    `
In Java, what is the contract between equals() and hashCode()? What goes wrong if a class used as a HashMap key overrides equals() but not hashCode()?
`,
    `
- Contract: if a.equals(b) is true, then a.hashCode() == b.hashCode() must hold. The reverse need not be true, since collisions are allowed.
- A HashMap first uses hashCode() to pick a bucket, then equals() within that bucket.
- If only equals() is overridden, two equal objects get different default (identity-based) hash codes, land in different buckets and are never compared. map.get(new Emp(1)) returns null even after map.put(new Emp(1), ...), and a HashSet stores duplicates.
- Fix: compute both from the same fields.

\`\`\`java
@Override public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Emp)) return false;
    return id == ((Emp) o).id;
}
@Override public int hashCode() { return Objects.hash(id); }
\`\`\`

- Keys should be immutable. Changing a field after insertion makes the entry unreachable.
`,
    { role: "Backend Developer" },
  ),

  // ---------------------------------------------------- Operating systems
  q(
    "operating-systems",
    "What is the difference between a process and a thread?",
    "Processes & Threads",
    "EASY",
    `
Explain the difference between a process and a thread, covering memory, communication, creation cost and failure isolation.
`,
    `
- A process is a program in execution with its own address space (code, data, heap, stack) and its own resources, such as open files.
- A thread is a unit of execution inside a process. Threads share the process's code, data, heap and files, but each has its own stack, registers and program counter.
- Creating and context-switching threads is cheaper than for processes.
- Communication: threads share memory directly, which needs synchronisation. Processes need IPC (pipes, sockets, shared memory).
- Isolation: a crashing process doesn't affect others, but a bad thread can bring down its whole process.
- Example: Chrome uses a process per tab for isolation, and a single tab uses many threads.
`,
    { company: "TCS" },
  ),
  q(
    "operating-systems",
    "What is a kernel? Compare monolithic and microkernels",
    "Basics",
    "EASY",
    `
What is the kernel of an operating system? Explain user mode versus kernel mode, and compare monolithic kernels with microkernels.
`,
    `
- The kernel is the core of the OS. It manages the CPU, memory and devices, and provides system calls to programs.
- User mode versus kernel mode: applications run with restricted privileges. A system call (read, fork) switches into kernel mode, where privileged instructions are allowed.
- A monolithic kernel runs all services (file system, drivers, networking) in kernel space. It is fast, but a buggy driver can crash the whole system. Example: Linux.
- A microkernel keeps only the essentials (IPC, scheduling, basic memory) in the kernel and runs other services as user-space processes. It is more modular and fault-tolerant, but slower because of the message passing. Examples: QNX, Minix.
- Hybrid kernels mix both approaches. Examples: Windows NT, macOS XNU.
`,
  ),
  q(
    "operating-systems",
    "Explain the states of a process",
    "Processes & Threads",
    "EASY",
    `
Draw or describe the process state diagram. What causes each transition between states?
`,
    `
States: New -> Ready -> Running -> Terminated, plus Waiting (Blocked).

- New -> Ready: the process is created and admitted into the ready queue.
- Ready -> Running: the scheduler dispatches it to the CPU.
- Running -> Ready: it is preempted (time slice expired, or a higher-priority process arrived).
- Running -> Waiting: it requests I/O or waits for an event or lock.
- Waiting -> Ready: the I/O completes or the event occurs. It does not go straight to Running.
- Running -> Terminated: it exits or is killed.

The OS tracks each process in a PCB (Process Control Block). It holds the PID, state, program counter, registers, memory information and open files.
`,
  ),
  q(
    "operating-systems",
    "What is virtual memory?",
    "Memory Management",
    "EASY",
    `
What is virtual memory, and what problems does it solve? What is demand paging?
`,
    `
- Virtual memory gives each process its own large, contiguous logical address space. The MMU maps it to physical frames through page tables.
- Programs larger than RAM can run, because only the pages in use need to be in memory. The rest stay on disk (in swap).
- It isolates processes, since one cannot touch another's memory, and it simplifies loading and sharing (for example, shared libraries).
- Demand paging: a page is loaded only when first accessed. Accessing a page that isn't resident causes a page fault. The OS loads the page from disk, updates the page table and restarts the instruction.
- The cost: page faults are very slow (disk access), so too many of them causes thrashing.
`,
  ),
  q(
    "operating-systems",
    "What is a context switch?",
    "Processes & Threads",
    "EASY",
    `
What happens during a context switch? Why is it considered overhead, and why is a thread switch cheaper than a process switch?
`,
    `
- A context switch is when the CPU stops running one process or thread and starts another. It is triggered by a timer interrupt, a blocking I/O call or a higher-priority task.
- Steps: save the current task's CPU state (program counter, registers, stack pointer) into its PCB or TCB, pick the next task, then load its saved state.
- It is pure overhead, because no useful work happens during the switch, and caches and the TLB go cold afterwards.
- A thread switch within the same process is cheaper. The address space stays the same, so there is no page-table switch and no TLB flush.
- Too short a time quantum means too many switches and poor throughput.
`,
  ),
  q(
    "operating-systems",
    "What is the difference between preemptive and non-preemptive scheduling?",
    "CPU Scheduling",
    "EASY",
    `
Explain preemptive and non-preemptive CPU scheduling, and give examples of algorithms in each category.
`,
    `
- Non-preemptive: once a process gets the CPU, it keeps it until it finishes or blocks for I/O. This is simple and has low overhead, but a long job makes the others wait (the convoy effect). Examples: FCFS, non-preemptive SJF, non-preemptive priority.
- Preemptive: the OS can take the CPU away, on a timer or when a higher-priority process arrives. This gives better responsiveness, but more context switches and a need for synchronisation. Examples: Round Robin, SRTF (preemptive SJF), preemptive priority.
- Starvation: SJF and priority scheduling can starve long or low-priority jobs. Aging (gradually raising the priority of waiting processes) fixes this.
- Modern general-purpose OSes (Linux CFS, Windows) are preemptive.
`,
  ),
  q(
    "operating-systems",
    "What is a deadlock, and what are its four necessary conditions?",
    "Deadlocks",
    "EASY",
    `
Define deadlock with an example, and state the four conditions that must all hold for a deadlock to occur.
`,
    `
A deadlock is a set of processes each waiting for a resource held by another process in the set, so none can proceed.

Example: P1 holds lock A and wants B, while P2 holds lock B and wants A.

The four Coffman conditions must all hold simultaneously:
- Mutual exclusion: at least one resource can be held by only one process at a time.
- Hold and wait: a process holds resources while waiting for more.
- No preemption: resources can't be forcibly taken away.
- Circular wait: a cycle of processes, each waiting on the next.

Breaking any one condition prevents deadlock. For example, always acquire locks in a fixed global order to prevent circular wait.
`,
    { company: "TCS" },
  ),
  q(
    "operating-systems",
    "What is the difference between paging and segmentation?",
    "Memory Management",
    "MEDIUM",
    `
Compare paging and segmentation: how addresses are translated, what kind of fragmentation each causes, and how they are combined in practice.
`,
    `
- Paging splits memory into fixed-size pages (logical) and frames (physical). An address is (page number, offset), translated through the page table. It causes no external fragmentation, but some internal fragmentation in the last page. It is invisible to the programmer.
- Segmentation splits memory into variable-size logical units such as code, stack and heap. An address is (segment, offset), checked against the segment's base and limit. It matches the program's logical structure and supports per-segment protection and sharing, but suffers external fragmentation.
- Paged segmentation (segments made of pages) combines both and was used on x86. Modern 64-bit OSes rely almost entirely on paging, with multi-level page tables.
`,
  ),
  q(
    "operating-systems",
    "What is the difference between a mutex and a semaphore?",
    "Synchronization",
    "MEDIUM",
    `
Explain mutexes, binary semaphores and counting semaphores. When would you use each? Can a semaphore be released by a thread that didn't acquire it?
`,
    `
- A mutex is a lock with ownership. Only the thread that locked it can unlock it. It protects a critical section so that one thread at a time enters.
- A semaphore is an integer counter with atomic wait() (P, decrement and block if it would go below 0) and signal() (V, increment and wake a waiter). It has no ownership, so any thread can signal it.
- A counting semaphore initialised to N limits concurrent access to N identical resources, such as a pool of 10 database connections.
- A binary semaphore (0 or 1) can act like a lock, but it is also used for signalling between threads, such as "data is ready".
- Use a mutex for mutual exclusion, and a semaphore for resource counting or event signalling (as in producer-consumer).
`,
    { company: "Infosys" },
  ),
  q(
    "operating-systems",
    "Calculate the average waiting time under Round Robin scheduling",
    "CPU Scheduling",
    "MEDIUM",
    `
Three processes all arrive at time 0. Burst times: P1 = 5, P2 = 3, P3 = 1. The time quantum is 2.

Draw the Gantt chart and compute the average waiting time and the average turnaround time.
`,
    `
Gantt chart:
| P1 0-2 | P2 2-4 | P3 4-5 | P1 5-7 | P2 7-8 | P1 8-9 |

- Completion times: P1 = 9, P2 = 8, P3 = 5.
- Turnaround = completion - arrival: 9, 8, 5. The average is 22/3, about 7.33.
- Waiting = turnaround - burst: P1 = 9 - 5 = 4, P2 = 8 - 3 = 5, P3 = 5 - 1 = 4. The average is 13/3, about 4.33.

Notes: RR is fair and gives good response time. A very large quantum turns it into FCFS, and a very small one causes excessive context switching.
`,
    { company: "TCS" },
  ),
  q(
    "operating-systems",
    "What is thrashing, and how can it be prevented?",
    "Memory Management",
    "MEDIUM",
    `
What is thrashing in an operating system? Why does adding more processes eventually make CPU utilisation drop? How can the OS detect and prevent it?
`,
    `
- Thrashing happens when processes don't have enough frames for their active pages, so they page-fault continuously. The system spends more time swapping pages than executing.
- The vicious cycle: CPU utilisation drops, so the scheduler admits more processes, which leaves even fewer frames per process, so there are more faults.
- Working set model: give each process enough frames for the pages it used in the last delta references. If the total demand exceeds the available frames, suspend some processes.
- Page-fault frequency: if a process's fault rate goes above an upper bound, give it more frames. Below a lower bound, take some away.
- Other fixes: add RAM, reduce the degree of multiprogramming, use local page replacement.
`,
  ),
  q(
    "operating-systems",
    "Count page faults with FIFO, LRU and Optimal page replacement",
    "Memory Management",
    "MEDIUM",
    `
Reference string: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1
There are 3 frames, initially empty. How many page faults occur with FIFO, LRU and Optimal replacement?
`,
    `
- FIFO evicts the page that has been in memory the longest: 15 faults.
- LRU evicts the page unused for the longest time in the past: 12 faults.
- Optimal (OPT) evicts the page that won't be used for the longest time in the future: 9 faults.

How to work it: write the frames column by column, mark each miss, and at every replacement apply the rule. For LRU, look backwards to the least recently used page. For OPT, look forwards to the page needed furthest away (or never).

Optimal gives the minimum possible number of faults, but it needs knowledge of the future, so it is only a benchmark. LRU is a good practical approximation, often implemented as the Clock (second-chance) algorithm.
`,
  ),
  q(
    "operating-systems",
    "Explain the producer-consumer problem and its solution",
    "Synchronization",
    "MEDIUM",
    `
A producer puts items into a bounded buffer of size N, and a consumer removes them. Explain the synchronisation issues and give a solution using semaphores.
`,
    `
Issues: the producer must wait when the buffer is full, the consumer must wait when it is empty, and access to the buffer must be mutually exclusive.

Semaphores: mutex = 1, empty = N (free slots), full = 0 (filled slots).

\`\`\`c
// producer                 // consumer
wait(empty);                wait(full);
wait(mutex);                wait(mutex);
buffer_add(item);           item = buffer_remove();
signal(mutex);              signal(mutex);
signal(full);               signal(empty);
\`\`\`

- Order matters. If the producer did wait(mutex) before wait(empty) on a full buffer, it would block while holding the mutex, and the consumer could never free a slot. That is a deadlock.
- In Java, a BlockingQueue implements this pattern for you.
`,
  ),
  q(
    "operating-systems",
    "What are zombie and orphan processes?",
    "Processes & Threads",
    "MEDIUM",
    `
In Unix/Linux, what is a zombie process and what is an orphan process? How is each one created, and how is it cleaned up?
`,
    `
- Zombie: a child that has exited, but whose parent hasn't yet called wait() or waitpid() to read its exit status. Its memory is freed, but its process-table entry (PID and exit code) remains. It shows as a "Z" (defunct) in ps.
- Cleanup: the parent calls wait(), or handles SIGCHLD. Many zombies can exhaust the PIDs available.
- Orphan: a child whose parent exited first. It is re-parented to init (PID 1, or systemd or a subreaper), which waits on it when it finishes, so orphans don't become permanent zombies.
- Orphans are created deliberately when daemonising: fork, let the parent exit, then call setsid().
- You can't kill a zombie, since it is already dead. You fix or kill its parent.
`,
    { role: "DevOps Engineer" },
  ),
  q(
    "operating-systems",
    "What is the difference between internal and external fragmentation?",
    "Memory Management",
    "MEDIUM",
    `
Explain internal and external fragmentation with examples. Which memory allocation schemes suffer from each, and how can they be reduced?
`,
    `
- Internal fragmentation: wasted space inside an allocated block, because the block is bigger than the request. Example: with 4 KB pages, a 9 KB process gets 3 pages (12 KB) and wastes 3 KB. It happens with paging and fixed partitions.
- External fragmentation: total free memory is enough, but it is split into non-contiguous holes too small for a request. Example: free holes of 3, 4 and 5 KB can't fit a 10 KB process. It happens with segmentation and variable partitioning.
- Reducing external fragmentation: compaction (moving processes together, which is costly), paging (non-contiguous allocation), and best-fit or buddy allocators.
- Reducing internal fragmentation: smaller pages or block sizes. These mean larger page tables, so it is a trade-off.
`,
  ),
  q(
    "operating-systems",
    "Use the Banker's algorithm to find a safe sequence",
    "Deadlocks",
    "HARD",
    `
There are 5 processes and resource types A, B and C. Available = (3, 3, 2).

| Proc | Allocation | Max |
|---|---|---|
| P0 | 0 1 0 | 7 5 3 |
| P1 | 2 0 0 | 3 2 2 |
| P2 | 3 0 2 | 9 0 2 |
| P3 | 2 1 1 | 2 2 2 |
| P4 | 0 0 2 | 4 3 3 |

Is the system in a safe state? If so, give a safe sequence.
`,
    `
Need = Max - Allocation: P0 (7,4,3), P1 (1,2,2), P2 (6,0,0), P3 (0,1,1), P4 (4,3,1).

Starting from Work = (3,3,2):
- P1 needs (1,2,2), which is <= Work. It runs and releases its allocation, so Work = (5,3,2).
- P3 needs (0,1,1), which is <= Work, so Work = (7,4,3).
- P4 needs (4,3,1), which is <= Work, so Work = (7,4,5).
- P2 needs (6,0,0), which is <= Work, so Work = (10,4,7).
- P0 needs (7,4,3), which is <= Work, so Work = (10,5,7).

All processes finish, so the state is safe. One safe sequence is <P1, P3, P4, P2, P0>. Others exist.

The Banker's algorithm grants a request only if the resulting state is still safe (deadlock avoidance). It needs each process's maximum demand in advance, so real general-purpose OSes rarely use it.
`,
  ),
  q(
    "operating-systems",
    "Explain the dining philosophers problem and how to avoid deadlock",
    "Synchronization",
    "HARD",
    `
Five philosophers sit around a table with one fork between each pair. A philosopher needs both adjacent forks to eat. Explain how the naive solution deadlocks, and give at least two correct solutions.
`,
    `
Naive solution: each philosopher picks up the left fork, then the right. If all five pick up their left fork at the same moment, each waits forever for the right one. That is circular wait, so it deadlocks.

Fixes:
- Resource ordering: number the forks and always pick up the lower-numbered one first. The last philosopher then picks up the right fork first, which breaks the cycle.
- Limit the diners: a counting semaphore initialised to 4 lets at most four philosophers try at once, so at least one can always get both forks.
- Atomic pickup: pick up both forks only if both are free (using a monitor with a state per philosopher), otherwise wait.
- Asymmetry: odd-numbered philosophers pick up left first, even-numbered ones pick up right first.

Also mention starvation. A deadlock-free solution can still starve one philosopher unless it is fair, for example with FIFO queuing.
`,
  ),
  q(
    "operating-systems",
    "How many processes does calling fork() three times create?",
    "Processes & Threads",
    "HARD",
    `
\`\`\`c
int main() {
    fork();
    fork();
    fork();
    printf("hello ");
    return 0;
}
\`\`\`
How many times is "hello" printed? How many child processes are created? What does fork() return in the parent and in the child?
`,
    `
- Each fork() doubles the number of running processes: 1 -> 2 -> 4 -> 8.
- "hello" is printed 8 times, and 2^3 - 1 = 7 child processes are created. In general, n forks give 2^n processes.
- fork() returns the child's PID (> 0) in the parent, 0 in the child and -1 on failure.
- The child gets a copy of the parent's address space. Modern kernels use copy-on-write, so pages are copied only when written.
- Variant: in fork() && fork() || fork(), short-circuit evaluation decides which processes call the later forks. Trace it with a tree.
- Gotcha: without a newline, stdout is buffered, and a buffer copied by fork can print duplicate output.
`,
    { role: "SDE" },
  ),
  q(
    "operating-systems",
    "What is Belady's anomaly?",
    "Memory Management",
    "HARD",
    `
What is Belady's anomaly? Demonstrate it with the reference string 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 using FIFO with 3 and with 4 frames. Which algorithms are immune to it, and why?
`,
    `
Belady's anomaly: with some page replacement algorithms, adding more frames can increase the number of page faults.

For the string 1,2,3,4,1,2,5,1,2,3,4,5 with FIFO:
- 3 frames give 9 page faults.
- 4 frames give 10 page faults.

Immune algorithms: LRU and Optimal. These are stack algorithms: the set of pages in memory with n frames is always a subset of the set with n + 1 frames, so more frames can never cause more faults.

FIFO isn't a stack algorithm, because its eviction order depends on load time, not usage.
`,
  ),
  q(
    "operating-systems",
    "Calculate the effective memory access time with a TLB",
    "Memory Management",
    "HARD",
    `
A system uses paging with a TLB. A TLB lookup takes 20 ns and a main-memory access takes 100 ns. The TLB hit ratio is 80%, and the page table is single-level and in memory.

What is the effective memory access time (EAT)? What would it be without a TLB?
`,
    `
- TLB hit: the TLB lookup plus one memory access, 20 + 100 = 120 ns.
- TLB miss: the TLB lookup, one access to the page table and one to the data, 20 + 100 + 100 = 220 ns.
- EAT = 0.8 x 120 + 0.2 x 220 = 96 + 44 = 140 ns.
- Without a TLB, every access needs 2 memory accesses, so 200 ns. The TLB saves 30%.
- With a 98% hit ratio: 0.98 x 120 + 0.02 x 220 = 117.6 + 4.4 = 122 ns.

The TLB is a small, fast associative cache of recent page-to-frame translations. It works because of locality of reference. Some textbooks treat the TLB lookup time as negligible, so state your assumption.
`,
  ),

  // ---------------------------------------------------- Computer networks
  q(
    "computer-networks",
    "Explain the seven layers of the OSI model",
    "OSI & TCP/IP",
    "EASY",
    `
Name the seven layers of the OSI model from bottom to top, with the main job of each and an example protocol or device. How does the OSI model map to the TCP/IP model?
`,
    `
1. Physical: bits on the wire, covering cables, signals and hubs.
2. Data Link: frames, MAC addresses and error detection. Examples: Ethernet, switches.
3. Network: packets and logical addressing and routing. Examples: IP, ICMP, routers.
4. Transport: end-to-end delivery and ports. Examples: TCP, UDP.
5. Session: setting up and managing sessions.
6. Presentation: encoding, encryption and compression (for example TLS, JPEG).
7. Application: user-facing protocols such as HTTP, DNS, SMTP and FTP.

Mnemonic: "Please Do Not Throw Sausage Pizza Away".

The TCP/IP model has 4 layers: Link (OSI 1-2), Internet (OSI 3), Transport (OSI 4) and Application (OSI 5-7).
`,
    { company: "TCS" },
  ),
  q(
    "computer-networks",
    "What is the difference between TCP and UDP?",
    "Transport Layer",
    "EASY",
    `
Compare TCP and UDP and give examples of applications that use each. Why would anyone choose UDP?
`,
    `
- Connection: TCP is connection-oriented (a 3-way handshake). UDP is connectionless.
- Reliability: TCP guarantees delivery, ordering and no duplicates through ACKs and retransmission. UDP gives best-effort delivery only.
- Control: TCP has flow and congestion control. UDP has none.
- Overhead: TCP has a 20-byte minimum header and is slower. UDP has an 8-byte header and is lightweight and fast.
- Data model: TCP is a byte stream. UDP sends individual datagrams, with message boundaries preserved.
- TCP uses: HTTP/1.1 and HTTP/2, email (SMTP), file transfer, SSH.
- UDP uses: DNS queries, video calls, live streaming, online games and VoIP, where a late packet is useless. QUIC (HTTP/3) is built on UDP.
`,
  ),
  q(
    "computer-networks",
    "What is DNS, and how does a DNS lookup work?",
    "Application Layer",
    "EASY",
    `
What does DNS do? Walk through the steps that resolve www.example.com to an IP address for the first time.
`,
    `
DNS (Domain Name System) translates human-readable names into IP addresses. It is a distributed, hierarchical database.

Resolution steps:
1. Check the browser cache, the OS cache and the hosts file.
2. Ask the recursive resolver (from your ISP, or a public one such as 8.8.8.8). If it has the answer cached, it returns it.
3. Otherwise, the resolver asks a root server, which refers it to the .com TLD servers.
4. The TLD server refers it to example.com's authoritative name server.
5. The authoritative server returns the A (IPv4) or AAAA (IPv6) record.
6. The resolver caches the answer for its TTL and returns it to the client.

DNS mainly uses UDP port 53, with TCP for large responses and zone transfers. Common record types: A, AAAA, CNAME, MX, NS, TXT.
`,
  ),
  q(
    "computer-networks",
    "What is the difference between HTTP and HTTPS?",
    "Security",
    "EASY",
    `
What is the difference between HTTP and HTTPS? What does HTTPS protect against, and what role do certificates play?
`,
    `
- HTTP sends data in plain text over TCP (port 80). Anyone on the network path can read or modify it.
- HTTPS is HTTP over TLS (port 443). It provides:
  - Confidentiality: data is encrypted, so eavesdroppers on Wi-Fi can't read passwords.
  - Integrity: tampering is detected, using MACs or AEAD ciphers.
  - Authentication: the server proves its identity with a certificate signed by a trusted Certificate Authority, which prevents man-in-the-middle attacks.
- The TLS handshake uses asymmetric cryptography to agree on keys. Bulk data then uses fast symmetric encryption (AES or ChaCha20).
- HTTPS does not hide the destination IP, and may not hide the domain name (SNI). It also doesn't make the website itself trustworthy.
`,
  ),
  q(
    "computer-networks",
    "What is the difference between IPv4 and IPv6?",
    "IP Addressing",
    "EASY",
    `
Compare IPv4 and IPv6: address size and notation, header, configuration and why IPv6 was needed.
`,
    `
- Address size: IPv4 uses 32 bits (about 4.3 billion addresses), written in dotted decimal as 192.168.1.1. IPv6 uses 128 bits, written in hexadecimal groups as 2001:db8::1.
- Why IPv6: IPv4 addresses ran out. NAT has been a workaround, but it breaks end-to-end connectivity.
- Header: IPv6 has a simpler fixed 40-byte header with no header checksum. Fragmentation happens only at the source.
- Configuration: IPv6 supports SLAAC (stateless auto-configuration) as well as DHCPv6.
- Broadcast: IPv6 has no broadcast. It uses multicast and anycast.
- Security: IPsec support was mandatory in the original IPv6 specification, but optional in IPv4.
- The two coexist through dual-stack hosts, tunnelling and translation.
`,
  ),
  q(
    "computer-networks",
    "What is the difference between a MAC address and an IP address?",
    "IP Addressing",
    "EASY",
    `
Explain the difference between a MAC address and an IP address. Why does a network need both?
`,
    `
- MAC address: a 48-bit hardware address burned into the network card (for example 00:1A:2B:3C:4D:5E). It works at the Data Link layer (layer 2) and is used for delivery within the local network segment.
- IP address: a logical, assignable address (manually or through DHCP). It works at the Network layer (layer 3), is hierarchical and routable, and is used for delivery across networks.
- An analogy: the IP address is like your postal address, which can change when you move, and the MAC address is like your name on the door.
- Both are needed: routers forward packets by IP across networks, and on each hop the frame is delivered to the next device by MAC. ARP maps an IP address to a MAC address on the local network.
- The IP address stays the same end to end, but the source and destination MACs change at every hop.
`,
  ),
  q(
    "computer-networks",
    "What is the difference between a hub, a switch and a router?",
    "Network Devices",
    "EASY",
    `
Compare a hub, a switch and a router: which OSI layer each works at, how each forwards traffic, and where each is used.
`,
    `
- A hub works at layer 1 (Physical). It repeats every incoming signal to all ports. It has one collision domain, a half-duplex shared bandwidth and no intelligence, so it is largely obsolete.
- A switch works at layer 2 (Data Link). It learns which MAC address sits on which port (its MAC table) and forwards each frame only to the right port. Every port is its own collision domain, with full duplex. It connects devices within a LAN.
- A router works at layer 3 (Network). It forwards packets between different networks using IP addresses and a routing table. It separates broadcast domains, and often does NAT and DHCP, and acts as a firewall.
- A home "Wi-Fi router" combines a router, a switch, a wireless access point and often a modem.
`,
  ),
  q(
    "computer-networks",
    "Explain the TCP three-way handshake",
    "Transport Layer",
    "MEDIUM",
    `
Describe the TCP three-way handshake, including the flags and sequence numbers exchanged. Why are three steps needed instead of two?
`,
    `
1. The client sends SYN with seq = x (a random initial sequence number). Client state: SYN_SENT.
2. The server replies SYN-ACK with seq = y and ack = x + 1. Server state: SYN_RECEIVED.
3. The client sends ACK with ack = y + 1. Both sides are now ESTABLISHED.

Why three steps:
- Both sides must announce their own initial sequence number and have it acknowledged. Two messages would confirm only one direction.
- It prevents old, delayed duplicate SYNs from opening bogus connections.

Related: a SYN flood attack sends many SYNs without completing the handshake, which fills the server's backlog. SYN cookies mitigate this. Options such as MSS and the window scale are negotiated during the handshake.
`,
  ),
  q(
    "computer-networks",
    "What happens when you type a URL into a browser and press Enter?",
    "Application Layer",
    "MEDIUM",
    `
Walk through everything that happens, end to end, from typing https://www.google.com into the browser to the page appearing on the screen.
`,
    `
1. The browser parses the URL (scheme, host, path) and checks HSTS and its caches.
2. DNS resolution: the browser cache, the OS cache, the resolver, then root, TLD and authoritative servers, returning the IP address.
3. A TCP connection to IP:443 with the 3-way handshake (or QUIC over UDP for HTTP/3).
4. A TLS handshake: the certificate is verified and session keys are agreed.
5. The browser sends an HTTP request: GET / with headers such as Host, cookies and Accept.
6. On the server side: a load balancer, then a web or app server, which may query caches or databases and returns a response (200 with HTML, or a redirect).
7. The browser renders the page: it parses the HTML into the DOM and the CSS into the CSSOM, runs JavaScript, builds the render tree, then does layout and paint. Further requests fetch images, CSS and JS.
8. The connection is kept alive for reuse.

Mention ARP and routing to the gateway if asked to go deeper.
`,
    { company: "Google" },
  ),
  q(
    "computer-networks",
    "How many usable hosts does a /26 subnet have?",
    "Subnetting",
    "MEDIUM",
    `
For the network 192.168.1.0/26, find:
- the subnet mask in dotted decimal
- the total number of addresses and the number of usable hosts
- the network address, the broadcast address and the usable range
`,
    `
- /26 means 26 network bits and 32 - 26 = 6 host bits.
- Mask: 255.255.255.192 (the last octet is 11000000 = 192).
- Total addresses: 2^6 = 64. Usable hosts: 64 - 2 = 62, excluding the network and broadcast addresses.
- Network address: 192.168.1.0.
- Broadcast address: 192.168.1.63.
- Usable range: 192.168.1.1 to 192.168.1.62.

Shortcut: block size = 256 - 192 = 64, so the subnets start at .0, .64, .128 and .192.
`,
    { role: "DevOps Engineer" },
  ),
  q(
    "computer-networks",
    "What is ARP, and how does it work?",
    "Network Devices",
    "MEDIUM",
    `
What is the Address Resolution Protocol? Explain what happens when host A wants to send a packet to host B on the same LAN but doesn't know B's MAC address. What is ARP spoofing?
`,
    `
ARP maps a known IPv4 address to a MAC address on the local network.

1. A checks its ARP cache. On a miss, it broadcasts an ARP request to FF:FF:FF:FF:FF:FF: "Who has 192.168.1.20? Tell 192.168.1.10."
2. Every host on the LAN receives it. Only B replies, by unicast: "192.168.1.20 is at aa:bb:cc:dd:ee:ff."
3. A caches the mapping (with a timeout) and sends the frame.

- If B is on another network, A ARPs for its default gateway's MAC instead.
- ARP spoofing: an attacker sends fake ARP replies so that traffic for the gateway is sent to them, giving a man-in-the-middle position. Mitigations: dynamic ARP inspection, static entries, encryption (TLS).
- IPv6 replaces ARP with the Neighbor Discovery Protocol (NDP).
`,
  ),
  q(
    "computer-networks",
    "What is the difference between GET and POST, and what do common HTTP status codes mean?",
    "Application Layer",
    "MEDIUM",
    `
Compare HTTP GET and POST, and mention PUT, PATCH and DELETE. What do the status-code classes 2xx, 3xx, 4xx and 5xx mean? Give common examples.
`,
    `
- GET reads data. Its parameters go in the URL. It should be safe and idempotent, and can be cached and bookmarked.
- POST creates or submits data, sent in the request body. It is not idempotent: repeating it may create duplicates.
- PUT replaces a resource and is idempotent. PATCH partially updates a resource. DELETE removes one and is idempotent.
- GET isn't "less secure" because of encryption, since HTTPS encrypts the URL path too. But URLs end up in logs and history, so don't put secrets in them.

Status codes:
- 2xx success: 200 OK, 201 Created, 204 No Content.
- 3xx redirect: 301 Moved Permanently, 302 Found, 304 Not Modified.
- 4xx client error: 400 Bad Request, 401 Unauthorized (not authenticated), 403 Forbidden (no permission), 404 Not Found, 429 Too Many Requests.
- 5xx server error: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.
`,
    { role: "Backend Developer" },
  ),
  q(
    "computer-networks",
    "What is NAT, and why is it used?",
    "IP Addressing",
    "MEDIUM",
    `
Explain Network Address Translation. How do many devices at home share one public IP address? What are NAT's drawbacks?
`,
    `
- NAT rewrites IP addresses (and usually ports) in packet headers as they pass through a router.
- Home devices get private addresses (10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16), which aren't routable on the internet.
- PAT (NAT overload): for outgoing packets, the router replaces the private source IP and port with its public IP and a unique port, and records the mapping in a table. Replies to that port are translated back to the right device.
- Why it's used: it conserves scarce IPv4 addresses, and incidentally hides the internal structure.
- Drawbacks: it breaks end-to-end connectivity, so inbound connections need port forwarding. It complicates peer-to-peer, VoIP and gaming (which need STUN/TURN traversal) and adds per-connection state to the router. Carrier-grade NAT adds another layer.
`,
  ),
  q(
    "computer-networks",
    "How does DHCP assign an IP address?",
    "Application Layer",
    "MEDIUM",
    `
Explain how a new laptop joining a network gets its IP address automatically. Describe the DHCP message exchange and what information is handed out.
`,
    `
DHCP uses the four-step DORA exchange over UDP (server port 67, client port 68):
1. Discover: the client broadcasts "Is there a DHCP server?" It has no IP yet, so its source is 0.0.0.0.
2. Offer: a server offers an IP address and the lease details.
3. Request: the client broadcasts that it accepts that offer. Broadcasting it also tells other servers that their offers were declined.
4. Acknowledge: the server confirms, and the client configures the address.

What it hands out: an IP address, a subnet mask, the default gateway, DNS servers and the lease time.

- Leases: the client tries to renew at 50% of the lease time (T1).
- A DHCP relay agent forwards the broadcasts when the server is on another subnet.
- Without a DHCP server, the client falls back to a link-local 169.254.x.x address.
`,
  ),
  q(
    "computer-networks",
    "What is the difference between flow control and congestion control?",
    "Transport Layer",
    "MEDIUM",
    `
TCP has both flow control and congestion control. What problem does each solve, and which mechanism or variable implements each?
`,
    `
- Flow control protects the receiver: the sender must not overflow the receiver's buffer. The receiver advertises its free buffer space in the TCP header's window field (rwnd). A zero window pauses the sender, which then sends window probes.
- Congestion control protects the network: the sender must not overload the routers between the two hosts. The sender keeps its own congestion window (cwnd) and adjusts it based on loss signals (timeouts and duplicate ACKs) or on delay.
- The sender's effective window is min(rwnd, cwnd).
- Flow control is end-to-end between two hosts. Congestion control reacts to the shared state of the network.
- Algorithms: slow start, congestion avoidance (AIMD), fast retransmit and fast recovery (Reno). Modern variants are CUBIC and BBR.
`,
  ),
  q(
    "computer-networks",
    "Explain the TLS handshake",
    "Security",
    "HARD",
    `
Explain the steps of a TLS handshake when a browser connects to an HTTPS site. How do the client and server agree on a key without an eavesdropper learning it? How does TLS 1.3 differ from TLS 1.2?
`,
    `
TLS 1.3, with a single round trip:
1. ClientHello: the supported cipher suites, a random value and a key share (an ephemeral Diffie-Hellman public value, ECDHE).
2. ServerHello: the chosen cipher and the server's key share. Both sides now compute the same shared secret using Diffie-Hellman. An eavesdropper sees only the public values and can't derive it.
3. The server sends its certificate, a CertificateVerify (a signature proving it owns the private key) and Finished, all already encrypted.
4. The client validates the certificate chain up to a trusted CA, checks the hostname and expiry, and sends Finished. Application data then flows under symmetric keys (AES-GCM or ChaCha20).

Differences from TLS 1.2:
- TLS 1.2 needs 2 round trips. TLS 1.3 needs 1, and 0-RTT resumption is possible.
- TLS 1.3 removes RSA key exchange and weak ciphers, so forward secrecy is always on.
- More of the handshake is encrypted in TLS 1.3.
`,
    { role: "Backend Developer" },
  ),
  q(
    "computer-networks",
    "Divide 192.168.10.0/24 into four equal subnets",
    "Subnetting",
    "HARD",
    `
An office has the network 192.168.10.0/24 and needs four equal subnets, one per department. Give the new prefix and mask, and for each subnet the network address, the usable host range and the broadcast address.
`,
    `
- 4 subnets need 2 borrowed bits (2^2 = 4), so the new prefix is /26 and the mask is 255.255.255.192.
- Each subnet has 2^6 = 64 addresses and 62 usable hosts. The block size is 64.

| Subnet | Network | Usable range | Broadcast |
|---|---|---|---|
| 1 | 192.168.10.0 | .1 - .62 | .63 |
| 2 | 192.168.10.64 | .65 - .126 | .127 |
| 3 | 192.168.10.128 | .129 - .190 | .191 |
| 4 | 192.168.10.192 | .193 - .254 | .255 |

Follow-up: if one department needs 100 hosts and the others need 50, use VLSM. Allocate a /25 (126 hosts) first, then /26s, sizing the largest subnets first.
`,
    { role: "DevOps Engineer" },
  ),
  q(
    "computer-networks",
    "How does TCP congestion control work?",
    "Transport Layer",
    "HARD",
    `
Explain slow start, congestion avoidance, fast retransmit and fast recovery in TCP (Reno). What happens to cwnd and ssthresh on a timeout compared with three duplicate ACKs?
`,
    `
- Slow start: cwnd starts small (1 MSS in classic TCP, about 10 MSS today) and grows by 1 MSS per ACK, which doubles it every RTT. This exponential growth continues until cwnd reaches ssthresh.
- Congestion avoidance: once cwnd reaches ssthresh, it grows by about 1 MSS per RTT (additive increase).
- On a timeout (a severe signal): ssthresh = cwnd / 2, cwnd = 1 MSS, and slow start begins again.
- On 3 duplicate ACKs (a single segment was lost, but later segments arrived): fast retransmit resends the missing segment immediately without waiting for the timer. Fast recovery then sets ssthresh = cwnd / 2 and cwnd = ssthresh (plus 3 MSS for inflation) and continues in congestion avoidance.
- Together this is AIMD (Additive Increase, Multiplicative Decrease), which makes competing flows converge to a fair share.
- Linux now defaults to CUBIC (cubic window growth). Google's BBR models bandwidth and RTT instead of reacting to loss.
`,
  ),
  q(
    "computer-networks",
    "Why does TCP connection termination need four steps, and what is TIME_WAIT?",
    "Transport Layer",
    "HARD",
    `
Explain how a TCP connection is closed. Why are there four segments instead of three? What is the TIME_WAIT state, why does it last 2 x MSL, and why can many TIME_WAIT sockets be a problem on a busy server?
`,
    `
1. The active closer sends FIN and enters FIN_WAIT_1.
2. The peer ACKs it and enters CLOSE_WAIT. The closer moves to FIN_WAIT_2.
3. The peer finishes sending its remaining data, then sends its own FIN and enters LAST_ACK.
4. The closer ACKs it and enters TIME_WAIT. The peer closes on receiving the ACK.

- Four steps: TCP is full-duplex, so each direction closes independently. The peer may still have data to send after ACKing the first FIN. Steps 2 and 3 can be combined into one segment if it has nothing left to send.
- TIME_WAIT lasts 2 x MSL (Maximum Segment Lifetime). This lets the final ACK be retransmitted if it was lost, and lets old delayed segments die out so they can't corrupt a new connection that reuses the same port pair.
- Problem: a server that actively closes many short connections accumulates TIME_WAIT sockets and can run out of ephemeral ports. Fixes: connection reuse (keep-alive or pooling), SO_REUSEADDR, letting clients close first, and tcp_tw_reuse on Linux.
`,
  ),
  q(
    "computer-networks",
    "What is the difference between Go-Back-N and Selective Repeat?",
    "Data Link Layer",
    "HARD",
    `
Compare the Go-Back-N and Selective Repeat sliding window protocols: their sender and receiver windows, what happens on a lost frame, and the maximum window size for m-bit sequence numbers.
`,
    `
- Go-Back-N (GBN): the sender window is N and the receiver window is 1. The receiver accepts frames only in order, discards out-of-order frames and sends cumulative ACKs. On a lost frame or a timeout, the sender retransmits that frame and every frame after it.
- Selective Repeat (SR): the sender and receiver windows are both N. The receiver buffers out-of-order frames and ACKs each one individually. Only the lost frame is retransmitted.
- Maximum window with m-bit sequence numbers: GBN allows 2^m - 1. SR allows 2^(m-1), so that new frames can't be confused with retransmitted old ones.
- Example with m = 3: GBN allows a window of 7, and SR allows 4.
- Trade-off: GBN keeps the receiver simple but wastes bandwidth on noisy links. SR is efficient but needs buffering and more complex logic.
- Stop-and-Wait is the special case where the window is 1. TCP's behaviour is a hybrid of the two (cumulative ACKs plus SACK).
`,
  ),

  // ---------------------------------------------------- System design
  q(
    "system-design",
    "What is the difference between vertical and horizontal scaling?",
    "Scalability",
    "EASY",
    `
Your app's traffic grew 10x. Explain vertical and horizontal scaling, with the pros and cons of each, and say which you would choose.
`,
    `
- Vertical scaling (scale up) means a bigger machine, with more CPU, RAM and faster disks. It is simple and needs no code changes. But it has a hardware ceiling, gets expensive at the top end, is a single point of failure and often needs downtime to upgrade.
- Horizontal scaling (scale out) means more machines behind a load balancer. Capacity is nearly unlimited, it is fault-tolerant and uses cheap commodity hardware. But the app must be stateless (sessions go in Redis or a database), and it brings distributed-systems complexity in data consistency, deployment and monitoring.
- In practice: scale the stateless application tier horizontally. Databases are often scaled vertically first, then with read replicas and sharding.
- Auto-scaling groups in the cloud add or remove instances based on load.
`,
  ),
  q(
    "system-design",
    "What is a load balancer, and what algorithms does it use?",
    "Load Balancing",
    "EASY",
    `
What does a load balancer do? Name common load-balancing algorithms, and explain the difference between layer 4 and layer 7 load balancing.
`,
    `
A load balancer distributes incoming requests across several servers. This improves throughput and availability, since unhealthy servers are removed using health checks.

Algorithms:
- Round robin, or weighted round robin for servers of different sizes.
- Least connections, which suits long-lived or uneven requests.
- IP hash or consistent hashing, which gives sticky routing so a client keeps reaching the same server.
- Random, or "power of two choices".

- Layer 4 balancing routes by IP and port (TCP/UDP) without reading the content. It is very fast.
- Layer 7 balancing understands HTTP. It can route by path or header (/api to one service, /static to another), terminate TLS and add caching.
- Examples: Nginx, HAProxy, AWS ALB (layer 7) and NLB (layer 4).
- Avoid making the load balancer a single point of failure: run it in an active-passive pair, or use a managed service.
`,
  ),
  q(
    "system-design",
    "What is caching, and where can you add a cache?",
    "Caching",
    "EASY",
    `
Why do systems use caches? List the places in a typical web application where data can be cached, and explain the risks.
`,
    `
A cache stores frequently read data in fast storage (memory) so that repeated reads skip slow work, such as database queries, remote calls or computation. This reduces latency and load.

Where to cache:
- In the browser, controlled by Cache-Control and ETag headers.
- In a CDN, for static assets and cacheable API responses at the edge.
- In a reverse proxy or API gateway, such as Nginx or Varnish.
- In the application: in-process (an LRU map) or distributed (Redis, Memcached).
- In the database's own buffer pool and query cache.

Risks: stale data (invalidation is hard), cache stampedes when a popular key expires, extra memory cost and inconsistency between nodes.

Metrics to watch: hit ratio, eviction rate and latency.
`,
  ),
  q(
    "system-design",
    "What is the difference between a monolith and microservices?",
    "Architecture",
    "EASY",
    `
Compare monolithic and microservice architectures. When would you recommend each for a new product?
`,
    `
- A monolith is one deployable unit containing all the modules, usually with one database. It is simple to build, test, debug and deploy, with fast in-process calls and easy transactions. But it gets hard to change as it grows, it scales only as a whole, and one bug can take everything down.
- Microservices are small services, each owning one business capability and its own data, communicating over HTTP, gRPC or a message queue. They can be deployed and scaled independently, and teams work autonomously. But they bring network latency and failures, distributed transactions, complex DevOps and monitoring, and harder debugging.
- Recommendation: start with a well-modularised monolith for a new product or a small team. Extract services when the team or the scaling needs justify it.
- Microservices are an organisational choice as much as a technical one.
`,
    { role: "Backend Developer" },
  ),
  q(
    "system-design",
    "When would you choose SQL over NoSQL, or NoSQL over SQL?",
    "Databases",
    "EASY",
    `
Compare relational (SQL) and NoSQL databases. Give examples of each, and say which you would choose for an e-commerce order system and for a product catalogue or activity feed.
`,
    `
- SQL databases (PostgreSQL, MySQL) use a fixed schema of tables with relations and joins. They provide ACID transactions and a powerful query language, and they usually scale vertically or with read replicas.
- NoSQL databases come in several types: document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra) and graph (Neo4j). They have flexible schemas, are built to scale horizontally and are often eventually consistent, with limited joins.
- Orders and payments need SQL: strong consistency, multi-row transactions and relational integrity.
- A product catalogue with varying attributes fits a document database. A high-write activity feed or event log fits Cassandra or DynamoDB.
- Many systems use both (polyglot persistence). Modern SQL databases also support JSON columns, so the line between them has blurred.
`,
  ),
  q(
    "system-design",
    "What is a CDN, and how does it work?",
    "Caching",
    "EASY",
    `
What is a Content Delivery Network? How does it make a website faster for users in different cities, and what kind of content should it serve?
`,
    `
- A CDN is a network of edge servers (points of presence) spread across many locations. They cache content close to users.
- How it works: DNS or anycast routes a user to the nearest edge. On a cache hit, the edge serves the content immediately. On a miss, it fetches from the origin server, caches the result (respecting Cache-Control and TTL) and serves it.
- Benefits: lower latency (a user in Chennai is served from a nearby edge instead of a US origin), less origin load and bandwidth, protection against DDoS and traffic spikes, and TLS terminated at the edge.
- Best for static assets such as images, JS, CSS, video segments and downloads. It can also cache API responses with short TTLs.
- Invalidation: use versioned file names (app.3f2a.js) or purge APIs.
- Examples: Cloudflare, Akamai, AWS CloudFront.
`,
  ),
  q(
    "system-design",
    "What is the difference between stateless and stateful services?",
    "Scalability",
    "EASY",
    `
What does it mean for a web service to be stateless? Why does statelessness make horizontal scaling easier, and where does the state go instead?
`,
    `
- A stateless service keeps no client-specific data in memory between requests. Each request carries everything needed, such as an auth token, or the service fetches it from a shared store.
- A stateful service remembers sessions or connections locally, so the client must keep returning to the same instance.
- Why stateless helps: any instance can serve any request, so you can add or remove instances freely, the load balancer can use simple round robin, and a crashed instance loses nothing.
- Where state goes: databases, a distributed cache (Redis) for sessions, object storage for files, and JWTs or cookies on the client.
- Some components are stateful by nature: databases, WebSocket gateways and streaming consumers. Scale these with partitioning, sticky sessions or connection registries.
`,
  ),
  q(
    "system-design",
    "Explain the CAP theorem",
    "Databases",
    "MEDIUM",
    `
State the CAP theorem. Why can't a distributed database guarantee all three properties at once? Give examples of CP and AP systems, and explain what PACELC adds.
`,
    `
- Consistency (C): every read sees the latest write.
- Availability (A): every request to a working node gets a non-error response.
- Partition tolerance (P): the system keeps working despite network splits between nodes.
- Partitions do happen in real networks, so the real choice during a partition is C or A. Either refuse or block some requests to stay consistent (CP), or answer with possibly stale data (AP).
- CP examples: HBase, ZooKeeper, etcd, and MongoDB with majority writes. Use these for bank balances and leader election.
- AP examples: Cassandra and DynamoDB (tunable), and DNS. Use these for shopping carts, likes and feeds.
- PACELC: if there is a Partition, choose A or C. Else (normal operation), choose Latency or Consistency. Even without partitions, strong consistency costs latency.
`,
    { role: "Backend Developer" },
  ),
  q(
    "system-design",
    "What are the common caching strategies, and how do you invalidate a cache?",
    "Caching",
    "MEDIUM",
    `
Explain cache-aside, write-through and write-back (write-behind) caching. How do you keep a cache consistent with the database, and what is a cache stampede?
`,
    `
- Cache-aside (lazy loading): the app reads the cache, and on a miss reads the database and fills the cache. On a write, it updates the database and then deletes the cache key. This is the most common strategy.
- Write-through: writes go to the cache and the database synchronously. The cache is always fresh, but writes are slower.
- Write-back: writes go to the cache only, and are flushed to the database asynchronously. Writes are fast, but data is lost if the cache dies before flushing.
- Invalidation: set TTLs as a safety net, delete keys on update rather than updating them (to avoid race conditions), and use event-driven invalidation (change data capture or pub/sub).
- Eviction policies: LRU, LFU, TTL.
- Cache stampede: a hot key expires and thousands of requests hit the database at once. Mitigations: a per-key lock so only one request recomputes it, random jitter on TTLs, and refreshing early in the background.
`,
    { role: "Backend Developer" },
  ),
  q(
    "system-design",
    "What is the difference between database replication and sharding?",
    "Databases",
    "MEDIUM",
    `
Your database can't keep up. Explain replication and sharding, what problem each solves, and the challenges each introduces.
`,
    `
- Replication copies the same data to several nodes. The usual setup is a leader with followers: writes go to the leader, and reads can go to the replicas.
  - It solves read scaling and high availability (failover).
  - Challenges: replication lag (a user may not see their own write, so read your own writes from the leader), failover complexity and split-brain.
- Sharding (partitioning) splits the data across nodes by a shard key, by range, hash or directory. Each shard holds a subset.
  - It solves write scaling and storage beyond one machine.
  - Challenges: choosing a key that avoids hot spots (sharding by celebrity user ID creates hot shards), slow cross-shard joins and transactions, rebalancing when adding shards (consistent hashing helps) and more operational complexity.
- Production systems use both: each shard is itself replicated.
`,
  ),
  q(
    "system-design",
    "When should services communicate synchronously, and when asynchronously?",
    "Messaging",
    "MEDIUM",
    `
When should one service call another synchronously (REST or gRPC), and when should it go through a message queue (RabbitMQ, Kafka)? Use a food-ordering example.
`,
    `
- Synchronous calls (REST, gRPC): the caller waits for a response. Use them when the user needs the answer now, such as checking restaurant availability or validating a coupon. The downside is temporal coupling: if the downstream service is slow or down, so is the caller. Mitigate with timeouts, retries with backoff and circuit breakers.
- Asynchronous messaging: publish an event (for example OrderPlaced) and consumers process it later. Use it for side effects that can happen after the response, such as notifications, sending the order to the restaurant, analytics and invoices.
- Benefits of async: it decouples services, absorbs traffic spikes (the queue acts as a buffer) and retries automatically. A failed consumer doesn't block the user.
- Costs of async: eventual consistency, consumers that must be idempotent (messages can arrive twice), dead-letter queues, and harder tracing.
- Kafka is a durable, replayable log with high throughput. RabbitMQ is a traditional broker with flexible routing.
`,
  ),
  q(
    "system-design",
    "What is consistent hashing, and why is it used?",
    "Scalability",
    "MEDIUM",
    `
Explain consistent hashing. Why is hash(key) % N a bad way to distribute keys across cache servers when N changes? What are virtual nodes?
`,
    `
- With hash(key) % N, changing N from 4 to 5 remaps almost every key, because a key keeps its server only if hash % 4 == hash % 5. That causes a cache-miss storm, or a huge data migration.
- Consistent hashing maps both servers and keys onto a hash ring (for example 0 to 2^32 - 1). Each key belongs to the first server clockwise from it.
- Adding or removing a server moves only the keys between that server and its predecessor, about K/N keys on average.
- Virtual nodes: each physical server is placed at many points on the ring (say 100 to 200). This evens out the load, and a removed server's keys spread across many servers instead of overloading one neighbour. Stronger machines can be given more virtual nodes.
- Used in DynamoDB, Cassandra, Memcached client libraries and load balancers with sticky routing.
`,
  ),
  q(
    "system-design",
    "Design a URL shortener like bit.ly",
    "Case Studies",
    "MEDIUM",
    `
Design a URL shortening service. Users submit a long URL and get a short link such as sho.rt/aZ3x9Q, and visiting the link redirects to the original URL. Assume 100M new URLs per month and a 100:1 read-to-write ratio.
`,
    `
- APIs: POST /urls returns a short code. GET /{code} returns a 301 or 302 redirect. (Use 302 if you need click analytics.)
- Code generation: a 7-character base62 code gives 62^7, about 3.5 trillion codes. Options:
  - Base62-encode an ID from a distributed counter or ticket server, or from pre-allocated ranges per app server. This avoids collisions.
  - Hash the URL (MD5) and take 7 characters. This needs collision checks.
- Storage: a key-value table mapping code to (long URL, created, expiry, user). 100M per month for 5 years is 6B rows of about 500 bytes, roughly 3 TB, so use a sharded key-value or NoSQL store.
- Reads are about 4,000 per second on average, so put a Redis cache in front (hot links dominate) and a CDN or edge redirect for viral links.
- Extras: custom aliases, expiry, rate limiting to stop spam, and asynchronous click analytics through a queue.
`,
    { role: "SDE" },
  ),
  q(
    "system-design",
    "Should an API use offset pagination or cursor pagination?",
    "API Design",
    "MEDIUM",
    `
An API returns a list of orders that can grow to millions of rows. Compare offset/limit pagination with cursor (keyset) pagination, and say which you would use for an infinite-scroll feed.
`,
    `
- Offset pagination (?page=50&limit=20, or OFFSET 980 LIMIT 20):
  - It is simple and supports jumping to page N and showing total pages.
  - But the database still scans and discards all the offset rows, so deep pages get slow. If rows are inserted or deleted between requests, items repeat or are skipped.
- Cursor (keyset) pagination (?after=<cursor>&limit=20):
  - The cursor encodes the last item's sort key, such as (created_at, id). The query is WHERE (created_at, id) < (:c, :id) ORDER BY created_at DESC, id DESC LIMIT 20.
  - An index serves this in roughly constant time at any depth, and results stay stable under inserts.
  - But it can't jump to an arbitrary page, and needs a unique, deterministic sort order (add id as a tie-breaker).
- For an infinite-scroll feed, use cursor pagination. Use offset pagination for small admin tables that need page numbers.
- Return an opaque nextCursor (for example base64) and hasMore in the response.
`,
    { role: "Backend Developer" },
  ),
  q(
    "system-design",
    "Why use a message queue, and what delivery guarantees can it offer?",
    "Messaging",
    "MEDIUM",
    `
What problems does a message queue solve? Explain at-most-once, at-least-once and exactly-once delivery, and how consumers handle duplicate messages.
`,
    `
Why use a queue:
- It decouples producers from consumers.
- It smooths traffic spikes through load levelling.
- It allows retries and asynchronous processing.
- It lets one event fan out to many consumers.

Delivery guarantees:
- At-most-once: the consumer acknowledges before processing. Messages may be lost but are never duplicated. Fine for metrics.
- At-least-once: the consumer acknowledges after processing. Nothing is lost, but a crash before the acknowledgement means redelivery, so duplicates are possible. This is the most common choice.
- Exactly-once: very hard end to end. It is achieved in practice as at-least-once plus idempotent processing, or with transactional systems such as Kafka transactions (within Kafka).

Handling duplicates:
- Give each message a unique ID and store processed IDs (or use a unique constraint) so repeats are ignored.
- Design operations to be idempotent ("set status = PAID", not "add 100").
- Send messages that keep failing to a dead-letter queue after N retries.
`,
  ),
  q(
    "system-design",
    "Design a rate limiter for an API",
    "API Design",
    "HARD",
    `
Design a rate limiter that allows each user at most 100 requests per minute across a fleet of API servers. Compare algorithms, explain where the limiter lives, and show how it behaves when the limit is exceeded.
`,
    `
Algorithms:
- Fixed window counter: simple, but allows bursts of up to 2x at window edges.
- Sliding window log: exact, but stores a timestamp per request, which costs memory.
- Sliding window counter: weights the previous window's count. A good approximation that uses little memory.
- Token bucket: tokens refill at a steady rate, and each request spends one. Allows controlled bursts. Widely used (AWS, Stripe).
- Leaky bucket: processes requests at a constant output rate.

Design:
- Put the limiter in the API gateway or as middleware, keyed by user ID or API key (by IP for anonymous users).
- Keep the state in Redis so every server shares it. Use INCR plus EXPIRE for windows, or a Lua script for an atomic token-bucket update.
- When the limit is exceeded, return 429 Too Many Requests with Retry-After and X-RateLimit-Remaining headers.
- Failure mode: if Redis is down, decide whether to fail open (allow requests) or fail closed. A local in-memory fallback is another option.
- Allow different limits per plan or endpoint, held in configuration.
`,
    { role: "Backend Developer" },
  ),
  q(
    "system-design",
    "Design a chat application like WhatsApp",
    "Case Studies",
    "HARD",
    `
Design a one-to-one and group chat system with online/offline presence, delivery and read receipts, and message history. Assume 50M daily active users.
`,
    `
- Connections: clients keep a persistent WebSocket (or MQTT) connection to chat gateway servers. A session registry (Redis) maps each user to their gateway server.
- Sending: the sender's gateway passes the message to the chat service, which assigns an ID and timestamp, persists it, then looks up the recipient's gateway and pushes it there. If the recipient is offline, the message is queued and a push notification (FCM or APNs) is sent.
- Receipts: sent (the server persisted it), delivered (the recipient's device acknowledged it) and read (the client reports it). These are small status events on the same channel.
- Storage: a write-heavy store such as Cassandra or HBase, partitioned by conversation ID and clustered by message time, gives fast history paging.
- Groups: fan-out on write to members' inboxes for small groups. Large groups need a different approach.
- Presence: heartbeats update a last-seen TTL key, and changes are published only to the user's contacts.
- Ordering: order by a per-conversation sequence number. Clients deduplicate by message ID to handle retries.
- Also mention end-to-end encryption and media via object storage plus a CDN.
`,
    { role: "SDE" },
  ),
  q(
    "system-design",
    "Design a social media news feed",
    "Case Studies",
    "HARD",
    `
Design the home feed of a social network: users follow others and see a reverse-chronological (or ranked) feed of posts from accounts they follow. Discuss the trade-offs between fan-out on write and fan-out on read, including for celebrities with millions of followers.
`,
    `
- Fan-out on write (push): when a user posts, the post ID is inserted into every follower's precomputed feed (a Redis list or feed table). Reads are very fast, but writes are expensive, especially for celebrities with 10M followers, and work is wasted on inactive users.
- Fan-out on read (pull): at read time, fetch recent posts from everyone the user follows and merge them. Writes are cheap, but reads are slow and expensive when a user follows many accounts.
- Hybrid (the usual answer): push for normal users. For celebrities, pull their posts at read time and merge them into the precomputed feed. Skip precomputing feeds for inactive users.
- Components: a post service (posts in a database, media in object storage plus a CDN), a social-graph service, a fan-out workers queue, a feed cache, and an optional ranking service (engagement, recency).
- Pagination: cursor-based on (score, post ID).
- Scale: shard feeds by user ID, and cap stored feed length (for example the latest 500 IDs).
`,
    { role: "SDE" },
  ),
  q(
    "system-design",
    "Make a payment API idempotent so retries never charge twice",
    "API Design",
    "HARD",
    `
A mobile client calls POST /payments. The network times out, so the client doesn't know whether the charge succeeded, and it retries. Design the API and server logic so the customer is never charged twice.
`,
    `
- The client generates a unique Idempotency-Key (a UUID) per logical payment and sends the same key on every retry.
- The server keeps an idempotency table: key, user, a hash of the request, status (IN_PROGRESS or COMPLETED) and the stored response. A unique constraint goes on (user, key).

Flow:
1. Insert the key with status IN_PROGRESS. If the insert fails because the key exists:
   - If it is COMPLETED, return the stored response. Don't charge again.
   - If it is IN_PROGRESS, return 409 or ask the client to retry later.
   - If the request hash differs, return 422 (the key was reused for a different payment).
2. Call the payment gateway, passing the same key downstream if it supports one.
3. In one transaction, save the payment and mark the key COMPLETED with the response.

- Expire keys after about 24 hours.
- Handle a crash mid-way with a reconciliation job that checks the gateway's status for stuck IN_PROGRESS keys.
- Retries should use exponential backoff with jitter.
- The same idea applies to consumers reading from a queue.
`,
    { role: "Backend Developer" },
  ),
  q(
    "system-design",
    "Design a movie ticket booking system that prevents double booking",
    "Case Studies",
    "HARD",
    `
Design a BookMyShow-style system: users browse shows, pick seats on a seat map and pay. Thousands of users may try to book the same seats for a popular release. How do you guarantee that a seat is never sold twice?
`,
    `
- Data: Movie, Theatre, Screen, Show and ShowSeat (show ID, seat ID, status AVAILABLE, LOCKED or BOOKED, locked_by, lock_expires_at), plus Booking and Payment.
- Seat hold: when a user selects seats, atomically lock them for about 10 minutes, all or none:

\`\`\`sql
UPDATE show_seat SET status='LOCKED', locked_by=:u, lock_expires_at=now()+interval '10 min'
WHERE show_id=:s AND seat_id IN (:ids)
  AND (status='AVAILABLE' OR (status='LOCKED' AND lock_expires_at < now()));
\`\`\`

  If the updated row count is lower than the number requested, roll back and tell the user the seats were just taken.
- Payment: on success, change the status from LOCKED to BOOKED and create the Booking in one transaction. On failure or timeout, the lock expires and a sweeper job (or the expiry check above) releases the seats.
- Alternatives: a Redis SET NX with TTL per seat as a fast lock, with the database as the source of truth. Or optimistic locking with a version column.
- Scale: browsing is read-heavy, so cache show listings and seat maps with short TTLs. A virtual waiting-room queue protects the system during blockbuster openings.
- Payments must be idempotent, so retries never charge twice.
`,
    { role: "SDE" },
  ),
];
