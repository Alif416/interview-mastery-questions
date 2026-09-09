# Backtracking

**Core idea:** Build a solution step by step, and undo the last choice whenever it turns out not to lead anywhere useful.

---

## Patterns

### 1. Subsets

At each element, branch into two choices: **exclude it** or **include it**. This produces every possible subset (the power set), since every element independently is either in or out.

```python
def subsets_demo(nums):
    result = []
    path = []

    def backtrack(i):
        if i == len(nums):
            result.append(path[:])
            return
        backtrack(i + 1)          # choice 1: exclude nums[i]
        path.append(nums[i])
        backtrack(i + 1)          # choice 2: include nums[i]
        path.pop()                 # undo

    backtrack(0)
    return result

print(subsets_demo([1, 2]))  # [[], [2], [1], [1, 2]]
```

### 2. Permutations

At each step, choose **any not-yet-used** element to place next. Track which elements are already "claimed" so each one is only used once per permutation.

```python
def permutations_demo(nums):
    result = []
    path = []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()          # undo
            used[i] = False     # undo
    backtrack()
    return result

print(permutations_demo([1, 2, 3]))  # all 6 orderings of [1, 2, 3]
```

### 3. Combinations

Choose a fixed-size group where **order doesn't matter**. A `start` index ensures each recursive call only considers elements *after* the last one picked, so `[1, 2]` and `[2, 1]` are never both generated.

```python
def combinations_demo(n, k):
    result = []
    path = []

    def backtrack(start):
        if len(path) == k:
            result.append(path[:])
            return
        for i in range(start, n + 1):
            path.append(i)
            backtrack(i + 1)     # move start forward - never revisit earlier numbers
            path.pop()

    backtrack(1)
    return result

print(combinations_demo(4, 2))
# [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
```

### 4. Decision trees

The general shape underlying all backtracking: every recursive call is a **node**, every choice is a **branch**, and a complete path from root to a leaf is one full solution. Backtracking is simply a depth-first walk of this tree.

```python
def decision_tree_demo(options_per_step):
    result = []
    path = []

    def backtrack(step):
        if step == len(options_per_step):
            result.append(path[:])
            return
        for option in options_per_step[step]:
            path.append(option)
            backtrack(step + 1)
            path.pop()

    backtrack(0)
    return result

print(decision_tree_demo([["a", "b"], [1, 2]]))
# [['a',1], ['a',2], ['b',1], ['b',2]]
```

### 5. Constraint search

Same tree walk as above, but before recursing into a branch, **check whether the choice is even valid** — and skip it entirely if not. This "pruning" avoids wasting time exploring branches that could never lead to a valid solution.

```python
def constraint_search_demo(choices, size):
    result = []
    path = []

    def is_valid(candidate):
        return candidate not in path  # example rule: no repeats allowed

    def backtrack():
        if len(path) == size:
            result.append(path[:])
            return
        for c in choices:
            if not is_valid(c):
                continue           # prune - skip invalid choice entirely
            path.append(c)
            backtrack()
            path.pop()

    backtrack()
    return result

print(constraint_search_demo([1, 2, 3], 2))
# [[1,2],[1,3],[2,1],[2,3],[3,1],[3,2]]
```

---

## Practice Problems

### 1. Subsets

**Pattern:** Subsets

**Problem:** Given an array of distinct integers, return all possible subsets (the power set).

**Approach:** At each index, branch into "exclude this element" and "include this element." Every leaf of the resulting decision tree is a complete subset.

```python
def subsets(nums):
    result = []
    path = []

    def backtrack(i):
        if i == len(nums):
            result.append(path[:])
            return
        backtrack(i + 1)
        path.append(nums[i])
        backtrack(i + 1)
        path.pop()

    backtrack(0)
    return result

print(subsets([1, 2, 3]))
# [[], [3], [2], [2,3], [1], [1,3], [1,2], [1,2,3]]
```

Time: O(2ⁿ), Space: O(n) recursion depth (excluding output)

---

### 2. Combination Sum

**Pattern:** Combinations + Constraint search

**Problem:** Given distinct integers `candidates` and a `target`, return all unique combinations that sum to `target`. The same number may be reused unlimited times.

**Approach:** A `start` index prevents generating the same combination in a different order. To allow reusing a number, recurse with `i` (not `i + 1`). Prune immediately once the running total would overshoot the target.

```python
def combination_sum(candidates, target):
    result = []
    path = []

    def backtrack(start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        if remaining < 0:
            return  # prune - overshot the target

        for i in range(start, len(candidates)):
            path.append(candidates[i])
            backtrack(i, remaining - candidates[i])  # i, not i+1: allow reuse
            path.pop()

    backtrack(0, target)
    return result

print(combination_sum([2, 3, 6, 7], 7))
# [[2,2,3], [7]]
```

Time: O(2^target) worst case, Space: O(target) recursion depth

---

### 3. Permutations

**Pattern:** Permutations

**Problem:** Given an array of distinct integers, return all possible permutations.

**Approach:** Track which elements are already placed with a `used` array. At every level, try every not-yet-used element as the next position in the permutation.

```python
def permute(nums):
    result = []
    path = []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return result

print(permute([1, 2, 3]))
# [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

Time: O(n · n!), Space: O(n) recursion depth

---

### 4. Subsets II

**Pattern:** Subsets + duplicate avoidance

**Problem:** Given an array that may contain duplicates, return all possible **unique** subsets.

**Approach:** Sort first so equal values sit next to each other. At each recursion level, if the current candidate equals the previous one *and* the previous one was already considered at this same level, skip it — that combination was already fully explored by an earlier sibling branch.

```python
def subsets_with_dup(nums):
    nums.sort()
    result = []
    path = []

    def backtrack(start):
        result.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue  # skip duplicate at this level - already explored
            path.append(nums[i])
            backtrack(i + 1)
            path.pop()

    backtrack(0)
    return result

print(subsets_with_dup([1, 2, 2]))
# [[], [1], [1,2], [1,2,2], [2], [2,2]]
```

Time: O(2ⁿ), Space: O(n) recursion depth (excluding output)

---

### 5. Combination Sum II

**Pattern:** Combinations + Constraint search + duplicate avoidance

**Problem:** Given `candidates` (which may contain duplicates) and a `target`, return all unique combinations summing to `target`, where each number may be used **at most once**.

**Approach:** Sort first. Advance with `i + 1` (no reuse, unlike Combination Sum). Skip duplicate values at the same recursion level to avoid duplicate combinations. Since the array is sorted, once a candidate alone exceeds the remaining target, every candidate after it will too — `break` out of the loop entirely instead of just `continue`.

```python
def combination_sum2(candidates, target):
    candidates.sort()
    result = []
    path = []

    def backtrack(start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue  # skip duplicate at this level
            if candidates[i] > remaining:
                break      # prune - sorted, so nothing further can work either
            path.append(candidates[i])
            backtrack(i + 1, remaining - candidates[i])  # i+1: no reuse
            path.pop()

    backtrack(0, target)
    return result

print(combination_sum2([10, 1, 2, 7, 6, 1, 5], 8))
# [[1,1,6],[1,2,5],[1,7],[2,6]]
```

Time: O(2ⁿ) worst case, Space: O(n) recursion depth

---

### 6. Word Search

**Pattern:** Decision trees + Constraint search

**Problem:** Given a 2D board of letters and a `word`, determine if the word can be formed by moving to horizontally/vertically adjacent cells, without reusing a cell.

**Approach:** Try starting the search from every cell. At each step, the constraint check is: in bounds, matches the next needed letter, and not already used in this path. Mark a cell visited before recursing into its neighbors, then **undo** the mark afterward so it's free for other paths.

```python
def exist(board, word):
    rows, cols = len(board), len(board[0])

    def backtrack(r, c, i):
        if i == len(word):
            return True
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[i]:
            return False  # prune - out of bounds or letter mismatch

        temp = board[r][c]
        board[r][c] = "#"  # mark visited

        found = (
            backtrack(r + 1, c, i + 1)
            or backtrack(r - 1, c, i + 1)
            or backtrack(r, c + 1, i + 1)
            or backtrack(r, c - 1, i + 1)
        )

        board[r][c] = temp  # undo
        return found

    for r in range(rows):
        for c in range(cols):
            if backtrack(r, c, 0):
                return True
    return False

print(exist([["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCCED"))  # True
```

Time: O(rows · cols · 4^L) where L = length of word, Space: O(L) recursion depth

---

### 7. Palindrome Partitioning

**Pattern:** Decision trees + Constraint search

**Problem:** Given a string `s`, partition it so that every substring in the partition is a palindrome. Return all possible palindrome partitions.

**Approach:** At each starting position, try every possible end cut. The constraint check — is this piece a palindrome? — decides whether that branch is worth recursing into at all. Reaching the end of the string means the current path is a complete, valid partition.

```python
def partition(s):
    result = []
    path = []

    def is_palindrome(sub):
        return sub == sub[::-1]

    def backtrack(start):
        if start == len(s):
            result.append(path[:])
            return
        for end in range(start + 1, len(s) + 1):
            sub = s[start:end]
            if not is_palindrome(sub):
                continue  # prune - not a valid piece
            path.append(sub)
            backtrack(end)
            path.pop()

    backtrack(0)
    return result

print(partition("aab"))
# [["a","a","b"], ["aa","b"]]
```

Time: O(n · 2ⁿ) worst case, Space: O(n) recursion depth

---

### 8. N-Queens

**Pattern:** Constraint search

**Problem:** Place `n` queens on an `n x n` chessboard so no two queens attack each other (same row, column, or diagonal). Return all distinct board arrangements.

**Approach:** Place exactly one queen per row. At each row, try every column, but only recurse into it if the constraint check passes — the column and both diagonals must be currently unclaimed (tracked with sets for O(1) checks). Undo (release the column/diagonals, clear the cell) after exploring each column.

```python
def solve_n_queens(n):
    result = []
    cols = set()
    diag1 = set()  # r - c (identifies a "/" diagonal)
    diag2 = set()  # r + c (identifies a "\" diagonal)
    board = [["."] * n for _ in range(n)]

    def backtrack(row):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue  # prune - queen would be attacked

            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            board[row][col] = "Q"

            backtrack(row + 1)

            cols.remove(col)         # undo
            diag1.remove(row - col)
            diag2.remove(row + col)
            board[row][col] = "."

    backtrack(0)
    return result

print(len(solve_n_queens(4)))  # 2 solutions
```

Time: O(n!) worst case, Space: O(n) recursion depth

---

### 9. Letter Combinations of a Phone Number

**Pattern:** Decision trees

**Problem:** Given a string of digits `2-9`, return every possible letter combination the digits could represent (classic phone-keypad mapping).

**Approach:** At each digit's position, branch over every letter that digit maps to, and recurse to the next digit. There's no invalid state to prune here — every combination of choices is a valid result — so this is a pure decision-tree walk.

```python
def letter_combinations(digits):
    if not digits:
        return []

    mapping = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
    }
    result = []
    path = []

    def backtrack(index):
        if index == len(digits):
            result.append("".join(path))
            return
        for letter in mapping[digits[index]]:
            path.append(letter)
            backtrack(index + 1)
            path.pop()

    backtrack(0)
    return result

print(letter_combinations("23"))
# ["ad","ae","af","bd","be","bf","cd","ce","cf"]
```

Time: O(4ⁿ · n) worst case (some digits map to 4 letters), Space: O(n) recursion depth

---

## Must Understand

**Choice → explore → undo**
Every backtracking step follows the same three-part rhythm: **make a choice** (append to `path`, mark something used/placed), **explore** (recurse deeper, as if that choice were permanent), then **undo** (pop from `path`, unmark it) before trying the next choice at that same level. Undoing is what lets a single shared `path`/state variable be reused across every branch of the tree, instead of needing to copy it for each one — it's the mechanic that makes backtracking memory-efficient.

**What the recursion state represents**
It's the partial solution built so far, plus just enough bookkeeping to know what's still allowed next. That might be `path` (the choices already made), a `start` index (what hasn't been considered yet — and a way to prevent revisiting earlier options), a `used`/`visited` set (what's already claimed and can't be picked again), or `remaining` (how much target/budget is left). Each recursive call is exactly one node in the decision tree, and its parameters fully describe that node's position in the search.

**When to stop**
Stop — a base case — either on **success** (the partial solution is complete: `path` reached the required length, `remaining` hit exactly `0`, or the index reached the end of the input) or on **failure** (the constraint is already violated and no further choice can fix it: `remaining` went negative, a cell is out of bounds, a queen would be attacked). Recognizing failure cases early and returning immediately (pruning) is what keeps backtracking from wasting time fully building out branches that were doomed from the start.

**How to avoid duplicate solutions**
Sort the input first so identical values become neighbors. Then, at each recursion level, skip a candidate if it equals the *previous* candidate at that same level, when that previous one has already been fully explored: `if i > start and nums[i] == nums[i-1]: continue`. This is subtle but precise — it still allows the same value to be reused **deeper** in the tree (a different level), it only forbids two **sibling** branches at the same level from making the identical choice, which is exactly what would otherwise generate the same output combination twice.
