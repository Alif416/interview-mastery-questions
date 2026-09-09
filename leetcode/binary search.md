# Binary Search

**Core idea:** Eliminate half the search space at every step, instead of checking candidates one at a time.

---

## Patterns

### 1. Classic binary search

Search a sorted array for an exact target. At each step, compare the target to the middle element — if it's not a match, the entire half that can't contain it is discarded.

```python
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(binary_search([-1, 0, 3, 5, 9, 12], 9))  # 4
```

### 2. Search in rotated sorted array

The array is sorted but rotated at some unknown pivot, so it's no longer fully sorted end-to-end. At each step, at least **one half** (`[left, mid]` or `[mid, right]`) is still properly sorted — figure out which one, then check if the target could be inside that sorted half's value range.

```python
def search_rotated_demo(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid

        if nums[left] <= nums[mid]:            # left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:                                    # right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1

print(search_rotated_demo([4, 5, 6, 7, 0, 1, 2], 0))  # 4
```

### 3. Binary search on answer

The search space isn't array indices at all — it's a **range of possible answers** (a speed, a capacity, a size). Binary search for the smallest (or largest) value for which a `feasible(x)` check passes, relying on the fact that feasibility flips at most once as `x` increases.

```python
def smallest_square_root(n):
    # smallest x such that x*x >= n
    low, high = 0, n
    while low < high:
        mid = (low + high) // 2
        if mid * mid >= n:
            high = mid       # mid works - it might still be the answer, keep it in range
        else:
            low = mid + 1    # mid doesn't work - rule it out entirely
    return low

print(smallest_square_root(17))  # 5, since 4*4=16 < 17 but 5*5=25 >= 17
```

### 4. Lower bound / upper bound

Instead of searching for an exact match, find the **first index** where a condition becomes true (lower bound) or the first index where it stops being satisfiable (upper bound) — the building block behind `bisect_left` / `bisect_right`.

```python
def lower_bound(nums, target):
    # first index where nums[index] >= target
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

def upper_bound(nums, target):
    # first index where nums[index] > target
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] <= target:
            left = mid + 1
        else:
            right = mid
    return left

nums = [1, 2, 2, 2, 5]
print(lower_bound(nums, 2))  # 1 - first 2
print(upper_bound(nums, 2))  # 4 - first index past the run of 2s
```

---

## Practice Problems

### 1. Binary Search

**Pattern:** Classic binary search

**Problem:** Given a sorted array `nums` and a `target`, return the index of `target`, or `-1` if it's not present.

**Approach:** Standard binary search — compare `nums[mid]` to `target` and discard the half that can't contain it.

```python
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(search([-1, 0, 3, 5, 9, 12], 9))  # 4
```

Time: O(log n), Space: O(1)

---

### 2. Search a 2D Matrix

**Pattern:** Classic binary search (applied to a flattened array)

**Problem:** Given an `m x n` matrix where each row is sorted ascending and each row's first element is greater than the previous row's last element, determine if `target` exists in the matrix.

**Approach:** The whole matrix behaves like one sorted 1D array of length `m * n`. Binary search over the flat index range `[0, m*n - 1]`, converting each `mid` back to `(row, col)` with `divmod`.

```python
def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False

    rows, cols = len(matrix), len(matrix[0])
    left, right = 0, rows * cols - 1

    while left <= right:
        mid = (left + right) // 2
        r, c = divmod(mid, cols)
        val = matrix[r][c]
        if val == target:
            return True
        elif val < target:
            left = mid + 1
        else:
            right = mid - 1

    return False

print(search_matrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3))  # True
```

Time: O(log(m·n)), Space: O(1)

---

### 3. Koko Eating Bananas

**Pattern:** Binary search on answer

**Problem:** Koko eats bananas from one pile per hour, at a constant speed of `k` bananas/hour. Find the minimum integer `k` so she can finish all piles within `h` hours.

**Approach:** Binary search over possible speeds `k`, from `1` to `max(piles)`. The feasibility check computes the total hours needed at speed `k` (`ceil(pile / k)` per pile) — if a speed works, every faster speed also works, so this is a valid binary-search-on-answer setup.

```python
import math

def min_eating_speed(piles, h):
    def hours_needed(k):
        return sum(math.ceil(pile / k) for pile in piles)

    low, high = 1, max(piles)
    while low < high:
        mid = (low + high) // 2
        if hours_needed(mid) <= h:
            high = mid
        else:
            low = mid + 1

    return low

print(min_eating_speed([3, 6, 7, 11], 8))  # 4
```

Time: O(n log(max(piles))), Space: O(1)

---

### 4. Find Minimum in Rotated Sorted Array

**Pattern:** Search in rotated sorted array

**Problem:** Given a rotated sorted array with unique elements, find the minimum element.

**Approach:** Compare `nums[mid]` to `nums[right]`. If `nums[mid] > nums[right]`, the rotation point (and the minimum) must be in the right half; otherwise the minimum is `mid` or somewhere to its left.

```python
def find_min(nums):
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1   # minimum is in the right half
        else:
            right = mid       # minimum is mid, or further left
    return nums[left]

print(find_min([4, 5, 6, 7, 0, 1, 2]))  # 0
```

Time: O(log n), Space: O(1)

---

### 5. Search in Rotated Sorted Array

**Pattern:** Search in rotated sorted array

**Problem:** Given a rotated sorted array with unique elements, search for `target` and return its index, or `-1`.

**Approach:** At each step, determine which half is properly sorted (`nums[left] <= nums[mid]` means the left half is sorted). Then check whether `target` falls inside that sorted half's value range to decide which side to continue searching.

```python
def search_in_rotated(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid

        if nums[left] <= nums[mid]:              # left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:                                       # right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return -1

print(search_in_rotated([4, 5, 6, 7, 0, 1, 2], 0))  # 4
```

Time: O(log n), Space: O(1)

---

### 6. Time Based Key-Value Store

**Pattern:** Lower bound / upper bound

**Problem:** Design `TimeMap` with `set(key, value, timestamp)` and `get(key, timestamp)`, where `get` returns the value associated with the **largest stored timestamp <= the queried timestamp**.

**Approach:** Store each key's `(timestamp, value)` pairs in a list — timestamps arrive in increasing order via `set`, so the list is naturally sorted. `get` is an **upper bound** search for the queried timestamp, then step back one to get the last timestamp that's `<=` it.

```python
class TimeMap:
    def __init__(self):
        self.store = {}  # key -> list of (timestamp, value)

    def set(self, key, value, timestamp):
        self.store.setdefault(key, []).append((timestamp, value))

    def get(self, key, timestamp):
        entries = self.store.get(key, [])
        left, right = 0, len(entries)
        while left < right:  # find first index with entries[index][0] > timestamp
            mid = (left + right) // 2
            if entries[mid][0] <= timestamp:
                left = mid + 1
            else:
                right = mid
        return entries[left - 1][1] if left > 0 else ""

tm = TimeMap()
tm.set("foo", "bar", 1)
print(tm.get("foo", 1))  # "bar"
print(tm.get("foo", 3))  # "bar" - most recent value at or before timestamp 3
```

Time: O(log n) per `get`, O(1) per `set`, Space: O(n)

---

### 7. Capacity To Ship Packages Within D Days

**Pattern:** Binary search on answer

**Problem:** Packages (given as weights, in order) must be shipped within `days` days, loading them onto a ship in order without reordering, where each day's total load can't exceed the ship's capacity. Find the minimum capacity that makes this possible.

**Approach:** Binary search over capacity, from `max(weights)` (must fit the heaviest single package) to `sum(weights)` (ship everything in one day). The feasibility check greedily simulates loading at a given capacity and counts the days needed — if a capacity works, every larger capacity also works.

```python
def ship_within_days(weights, days):
    def days_needed(capacity):
        total = 0
        count = 1
        for w in weights:
            if total + w > capacity:
                count += 1
                total = 0
            total += w
        return count

    low, high = max(weights), sum(weights)
    while low < high:
        mid = (low + high) // 2
        if days_needed(mid) <= days:
            high = mid
        else:
            low = mid + 1

    return low

print(ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))  # 15
```

Time: O(n log(sum(weights))), Space: O(1)

---

### 8. Median of Two Sorted Arrays

**Pattern:** Classic binary search (on a partition index, not a value)

**Problem:** Given two sorted arrays `nums1` and `nums2`, find the median of the combined sorted array, in O(log(min(m, n))) time.

**Approach:** Binary search on a **partition point** in the smaller array. For a candidate partition `cut1`, the matching partition `cut2` in the other array is forced (so the left side has exactly half the total elements). The partition is correct once every element on the combined left side is `<=` every element on the combined right side; otherwise shift the search based on which side is too large.

```python
def find_median_sorted_arrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1

    m, n = len(nums1), len(nums2)
    low, high = 0, m
    half = (m + n + 1) // 2

    while low <= high:
        cut1 = (low + high) // 2
        cut2 = half - cut1

        left1 = nums1[cut1 - 1] if cut1 > 0 else float("-inf")
        right1 = nums1[cut1] if cut1 < m else float("inf")
        left2 = nums2[cut2 - 1] if cut2 > 0 else float("-inf")
        right2 = nums2[cut2] if cut2 < n else float("inf")

        if left1 <= right2 and left2 <= right1:
            if (m + n) % 2 == 0:
                return (max(left1, left2) + min(right1, right2)) / 2
            return max(left1, left2)
        elif left1 > right2:
            high = cut1 - 1
        else:
            low = cut1 + 1

print(find_median_sorted_arrays([1, 3], [2]))    # 2.0
print(find_median_sorted_arrays([1, 2], [3, 4]))  # 2.5
```

Time: O(log(min(m, n))), Space: O(1)

---

## Must Understand

**What is the search space?**
It's the ordered set of candidates being narrowed down — and it's not always array indices. It can be literal indices (Binary Search, Search a 2D Matrix), a range of possible *values* that aren't stored anywhere (eating speeds `1..max(piles)` in Koko, capacities `max(weights)..sum(weights)` in the shipping problem), or even a partition *position* (Median of Two Sorted Arrays). Binary search works on any space where the candidates are ordered and a check can reliably rule out half of them.

**What is the condition?**
The condition (or "feasibility function") is what gets evaluated at `mid` to decide which half to keep — `nums[mid] == / < / > target`, "can Koko finish in `h` hours at speed `mid`?", "can all packages ship within `days` days at capacity `mid`?". The one hard requirement is that this condition must be **monotonic** across the search space (see below) — it can't flip back and forth.

**Why can half the space be eliminated?**
Because the space is sorted (or the condition is monotonic) with respect to what's being searched for. If speed `mid` finishes in time, every *faster* speed also finishes in time — so once `mid` is known to work, there's no need to individually test any value between `mid` and the fast end of the range; the whole half can be dropped as a block. That's what turns an O(n) scan into an O(log n) search — each comparison discards half the remaining candidates, not just one.

**How to avoid infinite loops**
- If a branch **eliminates `mid` entirely** (it's confirmed not the answer), move that bound strictly past it: `left = mid + 1` or `right = mid - 1`. Pair this style with `while left <= right`.
- If a branch **keeps `mid` as a still-possible answer** (binary search on answer, lower/upper bound), use `right = mid` (not `right = mid - 1`) so the answer isn't accidentally discarded, paired with `while left < right` and `left = mid + 1` on the other branch.
- Never write `left = mid` when `mid = (left + right) // 2` — with integer (floor) division, if `right == left + 1`, `mid` computes to `left`, so `left = mid` doesn't move `left` at all and the loop spins forever. Always make sure *every* branch strictly shrinks the range by at least one element per iteration.
