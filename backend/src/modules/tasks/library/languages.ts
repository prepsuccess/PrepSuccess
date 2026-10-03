import { c, task, type CatalogueTask } from "./helpers.js";

/** More practical tasks for this topic group (see helpers.ts for the format). */
export const LANGUAGES_TASKS: CatalogueTask[] = [
  // Python
  task(
    "python",
    "Count word frequencies in a sentence",
    "EASY",
    `
Write a Python function word_freq(text) that returns a dict mapping each word to how many times it appears.

- Ignore case ("The" and "the" are the same word).
- Strip the punctuation characters . , ! ? from words.

Example: word_freq("The cat and the hat.") → {"the": 2, "cat": 1, "and": 1, "hat": 1}

Then print the 2 most common words.
`,
    [
      c("normalise", "Lower-cases text and strips the listed punctuation", 3),
      c("counting", "Counts correctly with a dict, get() or collections.Counter", 3),
      c("top", "Prints the 2 most common words (e.g. most_common(2) or sorted)", 2),
      c("pythonic", "Clean, idiomatic Python with a working example call", 2),
    ],
    `
def word_freq(text):
    # your code here
    pass


print(word_freq("The cat and the hat."))
# {'the': 2, 'cat': 1, 'and': 1, 'hat': 1}
`,
  ),
  task(
    "python",
    "Filter and sort student records",
    "EASY",
    `
You have a list of student dicts:

\`\`\`
students = [
    {"name": "Asha", "branch": "CSE", "cgpa": 8.7},
    {"name": "Ravi", "branch": "ECE", "cgpa": 7.2},
    {"name": "Meena", "branch": "CSE", "cgpa": 9.1},
    {"name": "Karan", "branch": "ME", "cgpa": 6.4},
    {"name": "Divya", "branch": "ECE", "cgpa": 8.0},
]
\`\`\`

- Using a list comprehension, get the names of students with CGPA >= 7.5.
- Sort all students by CGPA, highest first, using sorted() with a key.
- Compute the average CGPA per branch as a dict.
`,
    [
      c("comprehension", "Correct list comprehension: Asha, Meena, Divya", 3),
      c("sorting", "sorted() with key=lambda and reverse=True (Meena first, Karan last)", 3),
      c("grouping", "Correct per-branch averages (CSE 8.9, ECE 7.6, ME 6.4)", 3),
      c("style", "Readable, idiomatic code", 1),
    ],
    `
students = [
    {"name": "Asha", "branch": "CSE", "cgpa": 8.7},
    {"name": "Ravi", "branch": "ECE", "cgpa": 7.2},
    {"name": "Meena", "branch": "CSE", "cgpa": 9.1},
    {"name": "Karan", "branch": "ME", "cgpa": 6.4},
    {"name": "Divya", "branch": "ECE", "cgpa": 8.0},
]

# 1. names with cgpa >= 7.5

# 2. sorted by cgpa, highest first

# 3. average cgpa per branch
`,
  ),
  task(
    "python",
    "Build an LRU cache class",
    "HARD",
    `
Implement a class LRUCache(capacity) with two methods, both O(1):

- get(key): return the value if present (and mark it as recently used), else -1.
- put(key, value): insert or update; if the cache exceeds capacity, evict the least recently used key.

Do not use functools.lru_cache. You may use collections.OrderedDict, or (for full marks on the approach) a dict plus your own doubly linked list.

Show a short test sequence with capacity 2 and the expected outputs, and explain why each operation is O(1).
`,
    [
      c("get", "get returns the value, updates recency, returns -1 when missing", 2),
      c("put", "put inserts/updates and evicts the least recently used key at capacity", 3),
      c("o1", "Both operations are genuinely O(1) (hash map + linked list or OrderedDict)", 2),
      c("tests", "A test sequence with correct expected outputs", 2),
      c("explain", "Clear explanation of the O(1) reasoning", 1),
    ],
    `
class LRUCache:
    def __init__(self, capacity):
        # your code here
        pass

    def get(self, key):
        # your code here
        pass

    def put(self, key, value):
        # your code here
        pass


cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))  # 1
cache.put(3, 3)      # evicts key 2
print(cache.get(2))  # -1
`,
  ),
  task(
    "python",
    "Write a retry decorator",
    "MEDIUM",
    `
Write a decorator retry(times) that re-runs the decorated function if it raises an exception, up to times attempts in total. If every attempt fails, re-raise the last exception.

- Print the attempt number on each failure.
- Use functools.wraps so the function keeps its name.
- Demonstrate it on a function that fails the first 2 times and succeeds on the 3rd.
`,
    [
      c("decorator", "Correct decorator factory (three levels: retry -> decorator -> wrapper)", 3),
      c("retry", "Retries the right number of times and returns the result on success", 3),
      c("reraise", "Re-raises the last exception when all attempts fail", 2),
      c("wraps", "Uses functools.wraps and passes *args, **kwargs through", 2),
    ],
    `
import functools


def retry(times):
    # your code here
    pass


calls = {"n": 0}


@retry(times=3)
def flaky():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ValueError("not yet")
    return "ok"


print(flaky())  # ok (after 2 failed attempts)
`,
  ),

  // Java
  task(
    "java",
    "Check for a palindrome ignoring case",
    "EASY",
    `
Write a Java method static boolean isPalindrome(String s) that ignores case and every character that is not a letter or digit.

Examples:
- "A man, a plan, a canal: Panama" → true
- "race a car" → false
- "" → true

Use two pointers; do not build a reversed copy of the string. Test it from main().
`,
    [
      c("two-pointer", "Two indices moving inwards, no reversed copy", 4),
      c("skip", "Skips non-alphanumeric characters (Character.isLetterOrDigit)", 2),
      c("case", "Compares case-insensitively", 2),
      c("tests", "main() prints results for the three examples", 2),
    ],
    `
public class Main {
    static boolean isPalindrome(String s) {
        // your code here
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // true
        System.out.println(isPalindrome("race a car")); // false
        System.out.println(isPalindrome("")); // true
    }
}
`,
  ),
  task(
    "java",
    "Shapes with an abstract class",
    "MEDIUM",
    `
Model shapes in Java:

- An abstract class Shape with an abstract method double area() and a concrete method describe() that returns e.g. "Circle with area 78.54".
- Subclasses Circle(radius) and Rectangle(width, height).
- Implement Comparable<Shape> so shapes compare by area.

In main(), put a Circle(5), a Rectangle(4, 6) and a Rectangle(3, 3) in a List<Shape>, sort it, and print describe() for each (smallest area first).
`,
    [
      c("abstract", "Abstract class with an abstract area() and shared describe()", 3),
      c("subclasses", "Circle and Rectangle override area() correctly", 2),
      c("comparable", "Implements Comparable<Shape> using Double.compare on area", 3),
      c("main", "Sorts the list and prints in order: 9.00, 24.00, 78.54", 2),
    ],
    `
import java.util.*;

abstract class Shape implements Comparable<Shape> {
    // your code here
}

public class Main {
    public static void main(String[] args) {
        List<Shape> shapes = new ArrayList<>();
        // add Circle(5), Rectangle(4, 6), Rectangle(3, 3), sort, print
    }
}
`,
  ),
  task(
    "java",
    "First non-repeating character with a HashMap",
    "MEDIUM",
    `
Write static char firstUnique(String s) that returns the first character that appears exactly once, or '_' if there is none.

Examples:
- "swiss" → 'w'
- "aabbcc" → '_'
- "placement" → 'p'

Use a LinkedHashMap<Character, Integer> (or a count array) and keep it O(n). In a comment, explain why a plain HashMap alone would need a second pass over the string.
`,
    [
      c("counting", "Counts characters in one pass with a map or int[256]", 3),
      c("order", "Finds the first unique character in original order", 3),
      c("edge", "Returns '_' when no character is unique", 2),
      c("explain", "Correct O(n) reasoning and the HashMap ordering point", 2),
    ],
    `
import java.util.*;

public class Main {
    static char firstUnique(String s) {
        // your code here
        return '_';
    }

    public static void main(String[] args) {
        System.out.println(firstUnique("swiss")); // w
        System.out.println(firstUnique("aabbcc")); // _
        System.out.println(firstUnique("placement")); // p
    }
}
`,
  ),
  task(
    "java",
    "Bounded buffer with producer and consumer",
    "HARD",
    `
Write a Java program with a bounded buffer of capacity 5 shared by one producer thread and one consumer thread.

- The producer puts the numbers 1 to 20 into the buffer.
- The consumer takes 20 numbers and keeps a running sum, then prints it (expected 210).
- The producer must wait when the buffer is full; the consumer must wait when it is empty.

Implement the buffer yourself with synchronized, wait() and notifyAll() (not BlockingQueue). Then add a 2-3 line comment explaining why wait() must be called inside a while loop, not an if.
`,
    [
      c("sync", "put/take are synchronized and use wait/notifyAll correctly", 3),
      c("bounds", "Producer blocks when full, consumer blocks when empty", 2),
      c("threads", "Starts both threads and join()s them before printing", 2),
      c("result", "Prints the correct sum 210 with no lost or duplicated items", 1),
      c("explain", "Explains spurious wakeups / re-checking the condition in a while loop", 2),
    ],
    `
class BoundedBuffer {
    private final int[] items = new int[5];
    private int count = 0, putIdx = 0, takeIdx = 0;

    public synchronized void put(int x) throws InterruptedException {
        // your code here
    }

    public synchronized int take() throws InterruptedException {
        // your code here
        return 0;
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BoundedBuffer buf = new BoundedBuffer();
        // create producer and consumer threads, start, join, print sum
    }
}
`,
  ),

  // C
  task(
    "c",
    "Second largest element of an array",
    "EASY",
    `
Write int secondLargest(int arr[], int n) in C that returns the second largest distinct value in a single pass, or -1 if it does not exist.

Examples:
- {12, 35, 1, 10, 34, 1} → 34
- {10, 10, 10} → -1
- {5, 9} → 5

Do not sort the array. Test it from main().
`,
    [
      c("single-pass", "Tracks largest and second largest in one loop, no sorting", 4),
      c("duplicates", "Handles duplicates of the maximum correctly", 2),
      c("edge", "Returns -1 when there is no second distinct value", 2),
      c("test", "main() prints results for the examples", 2),
    ],
    `
#include <stdio.h>

int secondLargest(int arr[], int n) {
    // your code here
    return -1;
}

int main(void) {
    int a[] = {12, 35, 1, 10, 34, 1};
    printf("%d\\n", secondLargest(a, 6)); /* 34 */
    return 0;
}
`,
  ),
  task(
    "c",
    "Singly linked list: insert, delete, print",
    "MEDIUM",
    `
Implement a singly linked list of ints in C:

- struct Node { int data; struct Node *next; };
- void insertEnd(struct Node **head, int value)
- void deleteValue(struct Node **head, int value) – removes the first node with that value (it may be the head)
- void printList(struct Node *head) – prints like 10 -> 20 -> 30 -> NULL
- void freeList(struct Node **head)

In main(): insert 10, 20, 30, delete 10, print, then free the list.
`,
    [
      c("malloc", "Allocates nodes with malloc and checks for NULL", 2),
      c("double-ptr", "Uses struct Node ** so head updates are visible to the caller", 3),
      c("delete", "Deletes head, middle and missing values correctly", 3),
      c("free", "Frees every node with no leaks or use-after-free", 2),
    ],
    `
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node *next;
};

void insertEnd(struct Node **head, int value) {
    // your code here
}

void deleteValue(struct Node **head, int value) {
    // your code here
}

void printList(struct Node *head) {
    // your code here
}

void freeList(struct Node **head) {
    // your code here
}

int main(void) {
    struct Node *head = NULL;
    // insert 10, 20, 30; delete 10; print; free
    return 0;
}
`,
  ),
  task(
    "c",
    "Student records with structs and qsort",
    "MEDIUM",
    `
Define struct Student { char name[30]; int roll; float marks; }.

- Read n students from stdin.
- Sort them by marks, highest first, using qsort() with your own comparator. If marks tie, the smaller roll number comes first.
- Print each student on one line: roll, name, marks with 2 decimals.
- Print the class average.
`,
    [
      c("struct", "Correct struct definition and reading into an array of structs", 2),
      c("comparator", "Valid qsort comparator (const void *, casts, returns <0/0/>0)", 3),
      c("tiebreak", "Breaks ties on marks by smaller roll number", 2),
      c("output", "Formatted output with %.2f and a correct average", 2),
      c("compiles", "Valid, clean C", 1),
    ],
    `
#include <stdio.h>
#include <stdlib.h>

struct Student {
    char name[30];
    int roll;
    float marks;
};

int cmp(const void *a, const void *b) {
    // your code here
    return 0;
}

int main(void) {
    int n;
    scanf("%d", &n);
    // read, sort, print, average
    return 0;
}
`,
  ),
  task(
    "c",
    "Write your own dynamic array",
    "HARD",
    `
Implement a growable int array in C (like a tiny vector):

- typedef struct { int *data; int size; int capacity; } Vec;
- void vecInit(Vec *v) – starts with capacity 2
- void vecPush(Vec *v, int x) – doubles the capacity with realloc when full
- int vecGet(Vec *v, int i) – bounds-checked (print an error and exit on bad index)
- void vecRemoveAt(Vec *v, int i) – shifts later elements left
- void vecFree(Vec *v)

In main(), push 1 to 10, remove index 0, print size, capacity and contents. Explain in a comment why push is amortised O(1).
`,
    [
      c("realloc", "Grows by doubling with realloc and handles a NULL return safely", 3),
      c("ops", "Push, get and removeAt behave correctly (size 9, capacity 16, 2..10)", 3),
      c("bounds", "Bounds checking on get/removeAt", 1),
      c("memory", "vecFree releases memory; no leaks or dangling pointers", 1),
      c("amortised", "Correct amortised O(1) explanation", 2),
    ],
    `
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    int size;
    int capacity;
} Vec;

void vecInit(Vec *v) {
    // your code here
}

void vecPush(Vec *v, int x) {
    // your code here
}

int vecGet(Vec *v, int i) {
    // your code here
    return 0;
}

void vecRemoveAt(Vec *v, int i) {
    // your code here
}

void vecFree(Vec *v) {
    // your code here
}

int main(void) {
    Vec v;
    vecInit(&v);
    // push 1..10, remove index 0, print size, capacity, contents
    vecFree(&v);
    return 0;
}
`,
  ),

  // C++
  task(
    "cpp",
    "Remove duplicates from a sorted vector",
    "EASY",
    `
Write a C++ function int removeDuplicates(std::vector<int>& nums) for a sorted vector. It rearranges nums in place so the first k elements are the distinct values in order, and returns k.

Example: {1, 1, 2, 3, 3, 3, 4} → returns 4, first 4 elements are 1 2 3 4.

Do it with two indices in O(n) time and O(1) extra space. Then show the one-line STL alternative using std::unique and erase.
`,
    [
      c("two-pointer", "Correct slow/fast index approach", 4),
      c("result", "Returns k = 4 and the right first k elements", 2),
      c("stl", "Correct nums.erase(std::unique(...), nums.end()) alternative", 2),
      c("modern", "Clean C++ with a small main() test", 2),
    ],
    `
#include <iostream>
#include <vector>

int removeDuplicates(std::vector<int>& nums) {
    // your code here
    return 0;
}

int main() {
    std::vector<int> nums = {1, 1, 2, 3, 3, 3, 4};
    int k = removeDuplicates(nums);
    std::cout << k << "\\n"; // 4
    return 0;
}
`,
  ),
  task(
    "cpp",
    "A Fraction class with operator overloading",
    "MEDIUM",
    `
Write a C++ class Fraction with an integer numerator and denominator.

- The constructor always stores the fraction in lowest terms (use std::gcd) with a positive denominator; throw std::invalid_argument for denominator 0.
- Overload +, *, == and << (prints like 3/4).

In main(): print Fraction(1, 2) + Fraction(1, 4) (3/4), Fraction(2, -6) * Fraction(3, 1) (-1/1), and Fraction(2, 4) == Fraction(1, 2) (1).
`,
    [
      c("normalise", "Reduces with gcd and keeps the denominator positive", 3),
      c("operators", "Correct +, * and == as members or friends with const refs", 3),
      c("stream", "operator<< returns std::ostream& and prints n/d", 2),
      c("errors", "Throws on a zero denominator", 2),
    ],
    `
#include <iostream>
#include <numeric>
#include <stdexcept>

class Fraction {
    // your code here
};

int main() {
    std::cout << Fraction(1, 2) + Fraction(1, 4) << "\\n"; // 3/4
    std::cout << Fraction(2, -6) * Fraction(3, 1) << "\\n"; // -1/1
    std::cout << (Fraction(2, 4) == Fraction(1, 2)) << "\\n"; // 1
    return 0;
}
`,
  ),
  task(
    "cpp",
    "Top K frequent words with a priority queue",
    "MEDIUM",
    `
Given a vector of words and k, return the k most frequent words. Sort by frequency (highest first); for equal frequency, alphabetical order.

Example: {"i", "love", "code", "i", "love", "coding"}, k = 2 → {"i", "love"}

Use std::unordered_map for counting and a std::priority_queue (min-heap of size k) with a custom comparator. State the time complexity.
`,
    [
      c("count", "Counts with unordered_map", 2),
      c("heap", "Size-k heap with a correct custom comparator (lambda or struct)", 4),
      c("ties", "Breaks frequency ties alphabetically and returns the right order", 2),
      c("complexity", "States O(n log k) (plus counting) correctly", 2),
    ],
    `
#include <iostream>
#include <queue>
#include <string>
#include <unordered_map>
#include <vector>

std::vector<std::string> topKFrequent(const std::vector<std::string>& words, int k) {
    // your code here
    return {};
}

int main() {
    std::vector<std::string> words = {"i", "love", "code", "i", "love", "coding"};
    for (const auto& w : topKFrequent(words, 2)) std::cout << w << " "; // i love
    return 0;
}
`,
  ),
  task(
    "cpp",
    "A simple unique_ptr-style smart pointer",
    "HARD",
    `
Write a class template UniquePtr<T> that owns a heap object and deletes it exactly once.

- Constructor from T*, destructor that deletes.
- Copy constructor and copy assignment deleted.
- Move constructor and move assignment that transfer ownership and leave the source null (handle self-assignment).
- operator*, operator->, get(), release() and reset(T* p = nullptr).

In main(), use a struct that prints in its constructor and destructor to show that moving does not double-delete and that reset() destroys the old object. In 3-4 lines, explain RAII and why copying must be disabled.
`,
    [
      c("ownership", "Destructor deletes once; copy operations are = delete", 3),
      c("move", "Move ctor/assignment transfer ownership, null the source, handle self-move", 3),
      c("api", "operator*, operator->, get, release and reset behave correctly", 2),
      c("demo", "main() shows construction/destruction order with no double delete", 1),
      c("explain", "Clear explanation of RAII and why copying is disabled", 1),
    ],
    `
#include <iostream>
#include <utility>

template <typename T>
class UniquePtr {
    T* ptr_ = nullptr;

public:
    explicit UniquePtr(T* p = nullptr) : ptr_(p) {}
    // your code here
};

struct Tracer {
    Tracer() { std::cout << "Tracer created\\n"; }
    ~Tracer() { std::cout << "Tracer destroyed\\n"; }
};

int main() {
    UniquePtr<Tracer> a(new Tracer());
    UniquePtr<Tracer> b(std::move(a));
    // reset, check get(), etc.
    return 0;
}
`,
  ),
];
