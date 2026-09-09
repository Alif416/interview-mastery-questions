# Two Pointers

**Core idea:** Use two indices moving through the data instead of nested loops — avoiding unnecessary repeated work by never re-scanning the same range twice.

---

## Patterns

### 1. Opposite-direction pointers

One pointer starts at the **left**, the other at the **right**, and they move **toward each other** based on a condition, until they meet or cross. Common on sorted arrays or when comparing from both ends (palindromes, pair sums, container problems).

```python
def is_palindrome_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        if arr[left] != arr[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome_array([1, 2, 3, 2, 1]))  # True
```

### 2. Same-direction pointers

Both pointers start at the beginning and move **forward**, but at different rates or under different conditions — typically a `fast` pointer that always scans forward, and a `slow` pointer that only advances when it needs to "keep" something. Used heavily for in-place array modification.

```python
def keep_only_positive(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] > 0:
            nums[slow] = nums[fast]
            slow += 1
    return nums[:slow]

print(keep_only_positive([-1, 3, -2, 5, 0, 8]))  # [3, 5, 8]
```

### 3. Fast and slow pointers

Both pointers start together, but `fast` moves **twice as far** per step as `slow`. When `fast` reaches the end, `slow` is sitting at the midpoint — the classic "tortoise and hare" setup, also used for cycle detection in linked lists.

```python
def find_middle(arr):
    slow, fast = 0, 0
    while fast < len(arr) - 1 and fast + 1 < len(arr) - 1:
        slow += 1
        fast += 2
    return arr[slow]

print(find_middle([1, 2, 3, 4, 5, 6, 7]))  # 4 - the middle element
```

### 4. Sorting + two pointers

Many problems don't start sorted but become much easier once they are — sorting first (O(n log n)) unlocks opposite-direction pointers to find pairs/triplets matching a target in linear time, instead of checking every combination.

```python
def has_pair_with_sum(nums, target):
    nums_sorted = sorted(nums)
    left, right = 0, len(nums_sorted) - 1
    while left < right:
        total = nums_sorted[left] + nums_sorted[right]
        if total == target:
            return True
        elif total < target:
            left += 1
        else:
            right -= 1
    return False

print(has_pair_with_sum([4, 1, 9, 2], 11))  # True (9 + 2)
```

---

## Practice Problems

### 1. Valid Palindrome

**Pattern:** Opposite-direction pointers

**Problem:** Given a string, determine if it's a palindrome, considering only alphanumeric characters and ignoring case.

**Approach:** Walk in from both ends. Skip any character that isn't alphanumeric. Compare the two characters (lowercased); if they ever differ, it's not a palindrome.

```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))                       # False
```

Time: O(n), Space: O(1)

---

### 2. Two Sum II (Input Array Is Sorted)

**Pattern:** Opposite-direction pointers (array is already sorted)

**Problem:** Given a 1-indexed array sorted in ascending order, return the indices of the two numbers that add up to `target`.

**Approach:** Because the array is sorted, moving `left` forward always increases the sum, and moving `right` backward always decreases it — so there's no need to check every pair. Nudge whichever pointer moves the sum toward the target.

```python
def two_sum_ii(numbers, target):
    left, right = 0, len(numbers) - 1
    while left < right:
        total = numbers[left] + numbers[right]
        if total == target:
            return [left + 1, right + 1]  # 1-indexed
        elif total < target:
            left += 1
        else:
            right -= 1
    return []

print(two_sum_ii([2, 7, 11, 15], 9))  # [1, 2]
```

Time: O(n), Space: O(1)

---

### 3. 3Sum

**Pattern:** Sorting + two pointers

**Problem:** Given an array, return all unique triplets `[a, b, c]` such that `a + b + c == 0`.

**Approach:** Sort first. Fix one number (`nums[i]`) with an outer loop, then use opposite-direction pointers on the rest of the array to find pairs that sum to `-nums[i]` — turning the O(n³) brute force into O(n²). Skip over duplicate values to avoid duplicate triplets.

```python
def three_sum(nums):
    nums.sort()
    result = []
    n = len(nums)

    for i in range(n):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # skip duplicate "fixed" values

        left, right = i + 1, n - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1

    return result

print(three_sum([-1, 0, 1, 2, -1, -4]))
# [[-1, -1, 2], [-1, 0, 1]]
```

Time: O(n²), Space: O(1) extra (excluding sort/output)

---

### 4. Container With Most Water

**Pattern:** Opposite-direction pointers

**Problem:** Given an array `height` where `height[i]` is the height of a vertical line at position `i`, find two lines that, together with the x-axis, form the container holding the most water.

**Approach:** Start with the widest possible container (both ends). The water held is limited by the **shorter** of the two lines, so the taller line can never help by itself — always move the pointer at the **shorter** line inward, since that's the only move that could possibly increase the area.

```python
def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        area = min(height[left], height[right]) * (right - left)
        best = max(best, area)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
```

Time: O(n), Space: O(1)

---

### 5. Trapping Rain Water

**Pattern:** Opposite-direction pointers

**Problem:** Given an array of elevation heights, compute how much rainwater it can trap.

**Approach:** Track the max height seen so far from the left (`left_max`) and from the right (`right_max`). The water trapped at a position is bounded by the **smaller** of those two maxes. Always advance the pointer on the side with the smaller max — its bound is already fully known, so it's safe to resolve that side now.

```python
def trap(height):
    if not height:
        return 0

    left, right = 0, len(height) - 1
    left_max, right_max = height[left], height[right]
    water = 0

    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += right_max - height[right]

    return water

print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))  # 6
```

Time: O(n), Space: O(1)

---

### 6. Remove Duplicates from Sorted Array

**Pattern:** Same-direction pointers

**Problem:** Given a sorted array, remove duplicates in place so each unique element appears once, and return the new length.

**Approach:** `slow` marks the last position of a confirmed-unique element. `fast` scans ahead; whenever it finds a value different from `nums[slow]`, that's a new unique value — advance `slow` and write it there.

```python
def remove_duplicates(nums):
    if not nums:
        return 0

    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]

    return slow + 1

nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
length = remove_duplicates(nums)
print(length, nums[:length])  # 5 [0, 1, 2, 3, 4]
```

Time: O(n), Space: O(1)

---

### 7. Move Zeroes

**Pattern:** Same-direction pointers

**Problem:** Given an array, move all `0`s to the end while keeping the relative order of the non-zero elements, in place.

**Approach:** `slow` marks where the next non-zero value should go. `fast` scans every element; whenever it finds a non-zero, swap it into `slow`'s position and advance `slow`. Every zero naturally gets swapped toward the back.

```python
def move_zeroes(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    return nums

print(move_zeroes([0, 1, 0, 3, 12]))  # [1, 3, 12, 0, 0]
```

Time: O(n), Space: O(1)

---

### 8. Squares of a Sorted Array

**Pattern:** Opposite-direction pointers

**Problem:** Given an array sorted in non-decreasing order (which may contain negative numbers), return an array of the squares of each number, also sorted.

**Approach:** The largest square must come from whichever end has the larger **absolute value** — negatives get large when squared too. Compare `abs` values at both ends, and fill the result array from the **back** (largest first).

```python
def sorted_squares(nums):
    n = len(nums)
    result = [0] * n
    left, right = 0, n - 1
    pos = n - 1

    while left <= right:
        left_sq = nums[left] ** 2
        right_sq = nums[right] ** 2
        if left_sq > right_sq:
            result[pos] = left_sq
            left += 1
        else:
            result[pos] = right_sq
            right -= 1
        pos -= 1

    return result

print(sorted_squares([-4, -1, 0, 3, 10]))  # [0, 1, 9, 16, 100]
```

Time: O(n), Space: O(n) for the output

---

## Must Understand

**When pointers move**
It depends on the pattern. With **opposite-direction pointers**, movement is driven by a comparison against a goal — e.g. in Two Sum II, if the sum is too small you move `left` forward (to increase it); if too large, move `right` backward (to decrease it). With **same-direction pointers**, `fast` moves every iteration (it's just scanning), while `slow` only moves when it needs to record/keep something — it lags behind on purpose.

**Why moving one pointer is safe**
Because the problem's structure (usually sortedness, or a proven bound) guarantees that the element being skipped past could never be part of a *better* answer given where the other pointer currently is. For example, in Container With Most Water, the shorter line's height caps the area no matter how far out the taller line goes — so keeping the shorter line in place and trying other widths can never beat moving it inward. The "safe" move is really a proof that an entire set of possibilities has been ruled out at once, which is exactly what makes two pointers faster than brute force.

**Why the solution is O(n) or O(n²)**
When two pointers start at opposite ends and only move toward each other, together they can take at most `n` total steps before meeting — giving **O(n)** (e.g. Two Sum II, Container With Most Water, Trapping Rain Water). When a two-pointer scan is nested inside an outer loop that fixes one element at a time (like 3Sum: fix `i`, then two-pointer scan the rest), you get O(n) work repeated for each of the `n` outer iterations — giving **O(n²)**, which is still a big improvement over the naive O(n³) triple-nested-loop approach.
