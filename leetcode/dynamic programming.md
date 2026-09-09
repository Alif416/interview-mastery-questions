# Dynamic Programming

**Core idea:** Solve overlapping subproblems once, and reuse their results instead of recomputing them.

---

## Patterns

### 1. 1D DP

State is indexed by a single variable — usually a position in an array/string, or a running total. The recurrence typically combines a couple of previous states.

```python
def climbing_demo(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

print(climbing_demo(5))  # 8
```

### 2. 2D DP

State depends on **two** indices — commonly a position in each of two strings, or an item index plus a remaining capacity. The DP table is a grid, `dp[i][j]`.

```python
def two_d_demo(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]

print(two_d_demo("abcde", "ace"))  # 3
```

### 3. Knapsack

For each item, decide whether to **include or skip** it, subject to a capacity constraint. The classic 0/1 recurrence: `dp[i][cap] = max(skip item i, take item i if it fits)`.

```python
def knapsack_demo(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for cap in range(capacity + 1):
            dp[i][cap] = dp[i - 1][cap]  # skip item i-1
            if weights[i - 1] <= cap:
                dp[i][cap] = max(dp[i][cap], dp[i - 1][cap - weights[i - 1]] + values[i - 1])
    return dp[n][capacity]

print(knapsack_demo([1, 3, 4], [15, 20, 30], 4))  # 35
```

### 4. Subsequence DP

Build up a relationship over a sequence by deciding, at each position, whether to **extend** the current subsequence or **skip** an element — without requiring elements to be contiguous.

```python
def lis_demo(nums):
    n = len(nums)
    dp = [1] * n  # dp[i] = length of the longest increasing subsequence ending at i
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp) if dp else 0

print(lis_demo([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
```

### 5. Grid DP

State is a cell `(row, col)` in a 2D grid; the recurrence combines results from adjacent cells (usually the cell above and the cell to the left).

```python
def grid_paths_demo(rows, cols):
    dp = [[1] * cols for _ in range(rows)]
    for r in range(1, rows):
        for c in range(1, cols):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[rows - 1][cols - 1]

print(grid_paths_demo(3, 7))  # 28
```

### 6. State-machine DP

Track **multiple states per position**, each representing a different "situation" you could be in (e.g. currently holding a stock vs. not), and define how each state transitions into the next.

```python
def state_machine_demo(prices):
    hold, sold = float("-inf"), 0
    for price in prices:
        hold, sold = max(hold, sold - price), max(sold, hold + price)
    return sold

print(state_machine_demo([7, 1, 5, 3, 6, 4]))  # 5
```

---

## Practice Problems

### 1. Climbing Stairs

**Pattern:** 1D DP

**Problem:** You can climb 1 or 2 steps at a time. Given `n` steps, count the distinct number of ways to reach the top.

**Approach:** The number of ways to reach step `i` is the sum of the ways to reach the two steps you could have jumped from: `dp[i] = dp[i-1] + dp[i-2]`. Only the last two values are ever needed, so two rolling variables replace a full array.

```python
def climb_stairs(n):
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1

print(climb_stairs(5))  # 8
```

Time: O(n), Space: O(1)

---

### 2. House Robber

**Pattern:** 1D DP

**Problem:** Given house values in a row, maximize total value robbed without robbing two **adjacent** houses.

**Approach:** At each house, either skip it (`dp[i-1]`) or rob it plus whatever the best was two houses back (`dp[i-2] + nums[i]`). Take the max of those two choices.

```python
def rob(nums):
    prev2, prev1 = 0, 0
    for n in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + n)
    return prev1

print(rob([2, 7, 9, 3, 1]))  # 12
```

Time: O(n), Space: O(1)

---

### 3. House Robber II

**Pattern:** 1D DP (circular variant)

**Problem:** Same as House Robber, but houses are arranged in a **circle** — the first and last houses are also adjacent.

**Approach:** The circular constraint only ever couples the first and last house. So run the linear House Robber twice — once over all houses **except the last**, once over all houses **except the first** — and take the max. This guarantees the first and last are never both robbed in the same run.

```python
def rob_circular(nums):
    if len(nums) == 1:
        return nums[0]

    def rob_linear(houses):
        prev2, prev1 = 0, 0
        for n in houses:
            prev2, prev1 = prev1, max(prev1, prev2 + n)
        return prev1

    return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))

print(rob_circular([2, 3, 2]))  # 3
```

Time: O(n), Space: O(1)

---

### 4. Coin Change

**Pattern:** 1D DP (unbounded — coins can repeat)

**Problem:** Given coin denominations and a target `amount`, find the fewest coins needed to make that amount exactly, or `-1` if it's impossible.

**Approach:** `dp[a]` = minimum coins to make amount `a`. For every amount from `1` up to the target, try every coin: if the coin fits (`coin <= a`), see if using it improves on the current best (`dp[a - coin] + 1`). Base case: `dp[0] = 0` (zero coins needed for zero amount).

```python
def coin_change(coins, amount):
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1

print(coin_change([1, 2, 5], 11))  # 3  -> 5 + 5 + 1
```

Time: O(amount · len(coins)), Space: O(amount)

---

### 5. Longest Increasing Subsequence

**Pattern:** Subsequence DP

**Problem:** Given an array, find the length of the longest **strictly increasing** subsequence (elements don't need to be contiguous).

**Approach:** `dp[i]` = length of the longest increasing subsequence that *ends exactly at index i*. For each `i`, look back at every earlier index `j` where `nums[j] < nums[i]`, and see if extending that subsequence beats the current best for `i`.

```python
def length_of_lis(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

print(length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
```

Time: O(n²) (an O(n log n) patience-sorting method also exists), Space: O(n)

---

### 6. Longest Common Subsequence

**Pattern:** 2D DP + Subsequence DP

**Problem:** Given two strings, find the length of their longest common subsequence.

**Approach:** `dp[i][j]` = LCS length of `s1[:i]` and `s2[:j]`. If the last characters match, extend the diagonal match (`dp[i-1][j-1] + 1`); otherwise take the best result from dropping a character off either string (`max(dp[i-1][j], dp[i][j-1])`).

```python
def longest_common_subsequence(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]

print(longest_common_subsequence("abcde", "ace"))  # 3
```

Time: O(m · n), Space: O(m · n)

---

### 7. Word Break

**Pattern:** 1D DP

**Problem:** Given a string `s` and a dictionary of words, determine if `s` can be segmented into a sequence of one or more dictionary words.

**Approach:** `dp[i]` = `True` if `s[:i]` can be fully segmented. Base case `dp[0] = True` (an empty prefix trivially "breaks"). For each end position `i`, check every earlier split point `j` — if `dp[j]` is `True` and `s[j:i]` is a valid dictionary word, then `dp[i]` is also `True`.

```python
def word_break(s, word_dict):
    words = set(word_dict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[n]

print(word_break("leetcode", ["leet", "code"]))  # True
```

Time: O(n²), Space: O(n)

---

### 8. Decode Ways

**Pattern:** 1D DP

**Problem:** A string of digits encodes `'A'`-`'Z'` as `'1'`-`'26'`. Count the number of ways to decode it.

**Approach:** `dp[i]` = number of ways to decode `s[:i]`. The last **single** digit contributes `dp[i-1]` ways if it's nonzero (`1`-`9`); the last **two** digits contribute `dp[i-2]` ways if they form a valid value (`10`-`26`). Sum whichever of these are valid.

```python
def num_decodings(s):
    if not s or s[0] == "0":
        return 0
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1
    for i in range(2, n + 1):
        one_digit = int(s[i - 1:i])
        two_digit = int(s[i - 2:i])
        if one_digit >= 1:
            dp[i] += dp[i - 1]
        if 10 <= two_digit <= 26:
            dp[i] += dp[i - 2]
    return dp[n]

print(num_decodings("226"))  # 3  -> "2,2,6" / "22,6" / "2,26"
```

Time: O(n), Space: O(n)

---

### 9. Unique Paths

**Pattern:** Grid DP

**Problem:** In an `m x n` grid, count the number of unique paths from the top-left to the bottom-right corner, moving only right or down.

**Approach:** `dp[r][c] = dp[r-1][c] + dp[r][c-1]` — the number of ways to reach a cell is the sum of the ways to reach the cell above it and the cell to its left. The entire first row and first column each have exactly 1 path, since only one direction of movement is possible there.

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]

print(unique_paths(3, 7))  # 28
```

Time: O(m · n), Space: O(m · n)

---

### 10. Partition Equal Subset Sum

**Pattern:** Knapsack (0/1 subset sum)

**Problem:** Given an array of positive integers, determine if it can be split into two subsets with equal sum.

**Approach:** This is equivalent to asking: can some subset sum to exactly `total / 2`? `dp[s]` = `True` if some subset sums to `s`. Process each number once, iterating the sum range **backward** — this ensures each number is only used once per pass (the 0/1 knapsack trick for a 1D-optimized table).

```python
def can_partition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2

    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for s in range(target, num - 1, -1):  # backward - each number used once
            dp[s] = dp[s] or dp[s - num]

    return dp[target]

print(can_partition([1, 5, 11, 5]))  # True -> [1,5,5] and [11]
```

Time: O(n · target), Space: O(target)

---

### 11. Target Sum

**Pattern:** Knapsack (subset-sum counting)

**Problem:** Assign a `+` or `-` sign to each number in `nums` so the resulting expression evaluates to `target`. Count how many ways this can be done.

**Approach:** If `P` is the sum of positively-signed numbers and `N` the sum of negatively-signed ones, then `P - N = target` and `P + N = total`, so `P = (target + total) / 2`. The problem becomes: count the subsets that sum to exactly `P` — a knapsack-style **counting** DP (accumulate ways, don't just track feasibility).

```python
def find_target_sum_ways(nums, target):
    total = sum(nums)
    if (total + target) % 2 != 0 or total < abs(target):
        return 0
    p = (total + target) // 2

    dp = [0] * (p + 1)
    dp[0] = 1
    for num in nums:
        for s in range(p, num - 1, -1):
            dp[s] += dp[s - num]

    return dp[p]

print(find_target_sum_ways([1, 1, 1, 1, 1], 3))  # 5
```

Time: O(n · P), Space: O(P)

---

### 12. Edit Distance

**Pattern:** 2D DP

**Problem:** Given two strings, find the minimum number of insert/delete/replace operations to turn one into the other.

**Approach:** `dp[i][j]` = minimum edits to turn `s1[:i]` into `s2[:j]`. If the last characters already match, no new edit is needed (`dp[i-1][j-1]`). Otherwise, take `1 +` the best of the three possible single operations: delete (`dp[i-1][j]`), insert (`dp[i][j-1]`), or replace (`dp[i-1][j-1]`). The base row/column represent converting to/from an empty string, which costs pure insertions/deletions.

```python
def min_distance(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],       # delete
                    dp[i][j - 1],       # insert
                    dp[i - 1][j - 1],   # replace
                )

    return dp[m][n]

print(min_distance("horse", "ros"))  # 3
```

Time: O(m · n), Space: O(m · n)

---

### 13. Best Time to Buy and Sell Stock

**Pattern:** State-machine DP (simplified to a single transaction)

**Problem:** Given daily prices, maximize profit from **one** buy followed by **one** sell (buy must happen before sell).

**Approach:** Track the minimum price seen so far while scanning left to right. At each day, the best profit *if selling today* is `price - min_price_so_far`; keep a running maximum of that. This is a simplified, single-transaction version of the hold/sold state machine from the pattern tutorial.

```python
def max_profit(prices):
    min_price = float("inf")
    best_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        best_profit = max(best_profit, price - min_price)
    return best_profit

print(max_profit([7, 1, 5, 3, 6, 4]))  # 5
```

Time: O(n), Space: O(1)

---

### 14. Interleaving String

**Pattern:** 2D DP

**Problem:** Given `s1`, `s2`, and `s3`, determine if `s3` can be formed by interleaving `s1` and `s2` while preserving the relative order of characters within each.

**Approach:** `dp[i][j]` = `True` if `s3[:i+j]` can be formed by interleaving `s1[:i]` and `s2[:j]`. It's `True` if either the **last character came from `s1`** (`dp[i-1][j]` is `True` and `s1[i-1] == s3[i+j-1]`) or the **last character came from `s2`** (`dp[i][j-1]` is `True` and `s2[j-1] == s3[i+j-1]`).

```python
def is_interleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False

    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True

    for i in range(m + 1):
        for j in range(n + 1):
            if i > 0 and dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]:
                dp[i][j] = True
            if j > 0 and dp[i][j - 1] and s2[j - 1] == s3[i + j - 1]:
                dp[i][j] = True

    return dp[m][n]

print(is_interleave("aabcc", "dbbca", "aadbbcbcac"))  # True
```

Time: O(m · n), Space: O(m · n)

---

## Must Understand

**What is the state?**
The state is the minimal set of information needed to fully describe one subproblem — usually exactly the parameters written inside `dp[...]`. It might be a single index (a position in an array, "money remaining" in Coin Change), a pair of indices (two string positions, as in LCS and Edit Distance), an index plus a flag (holding a stock or not, in state-machine DP), or an index plus a remaining capacity (Knapsack, Partition Equal Subset Sum). Choosing the right state is the hardest and most important part of solving a DP problem — every other piece follows naturally once it's right.

**What is the recurrence?**
The recurrence expresses the answer for the current state in terms of answers to smaller, already-solved states — e.g. `dp[i] = dp[i-1] + dp[i-2]` (Climbing Stairs), or "if characters match extend the diagonal, else take the best of two neighbors" (LCS, Edit Distance). It's essentially the answer to: *what choices are available at this step, and how does each choice reduce to a smaller version of the same problem?*

**What are the base cases?**
The base cases are the smallest subproblems — simple enough to state directly, without needing the recurrence at all: `dp[0] = 0` or `1` for an empty input, a single house/step/coin, or the first row/column of a grid (where only one path is geometrically possible). Every recurrence has to bottom out at values that are given outright, or the chain of "smaller subproblem" references never terminates.

**Why does memoization work?**
Because many DP problems have **overlapping subproblems** — a naive recursive solution ends up recomputing the exact same state many times (plain recursive Fibonacci recomputes `fib(3)` repeatedly while computing `fib(6)`, for instance). Memoization (top-down) or tabulation (bottom-up, the style used throughout this file) caches each state's answer the first time it's computed, so every distinct state is solved **exactly once** — collapsing what would be exponential work down to a cost bounded by the number of distinct states.

**When can you optimize space?**
Whenever the recurrence for `dp[i]` (or `dp[i][j]`) only ever looks back a **fixed, small** number of previous states. Climbing Stairs and House Robber only need `dp[i-1]` and `dp[i-2]`, so two rolling variables replace the whole array. A 2D table where `dp[i][j]` only depends on row `i-1` can often collapse to just one or two 1D rows (the knapsack examples' backward-iteration trick is exactly this, done in-place on a single row). The one time you *can't* collapse the table is when you need to reconstruct the actual solution path/sequence afterward, rather than just its final length or value — then the full table (or extra parent pointers) has to be kept around.
