# Sliding Window

**Core idea:** Maintain a running window over the array/string and update it incrementally as it slides, instead of recomputing every possible subarray/substring from scratch.

---

## Patterns

### 1. Fixed-size window

The window size `k` never changes. As it slides one step at a time, add the new element entering on the right and remove the one leaving on the left.

```python
def max_sum_fixed_window(nums, k):
    window_sum = sum(nums[:k])
    best = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]  # add new, drop old
        best = max(best, window_sum)
    return best

print(max_sum_fixed_window([2, 1, 5, 1, 3, 2], 3))  # 9 -> [5,1,3]
```

### 2. Variable-size window

The window **grows and shrinks** based on a condition. Expand the right edge to bring in new elements; when the window becomes invalid (or you want to try shrinking it further), pull the left edge forward until it's valid again.

```python
def smallest_subarray_ge(nums, target):
    left = 0
    total = 0
    best = float("inf")
    for right in range(len(nums)):
        total += nums[right]
        while total >= target:               # shrink while still valid
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return best if best != float("inf") else 0

print(smallest_subarray_ge([2, 3, 1, 2, 4, 3], 7))  # 2 -> [4,3]
```

### 3. Frequency-map window

Track character/element **counts** inside the window with a hash map, instead of just a running sum. Used whenever "validity" depends on the composition of the window (matching an anagram, satisfying required counts), not just a number.

```python
from collections import Counter

def contains_permutation(s, p):
    need = Counter(p)
    window = Counter()
    k = len(p)
    for i, ch in enumerate(s):
        window[ch] += 1
        if i >= k:
            left_char = s[i - k]
            window[left_char] -= 1
            if window[left_char] == 0:
                del window[left_char]
        if window == need:
            return True
    return False

print(contains_permutation("eidbaooo", "ab"))  # True - "ba" at index 3
```

### 4. Maximum/minimum window

Track the max or min value **inside the current window** efficiently as it slides, instead of rescanning the whole window each time. A **monotonic deque** (holding indices in increasing or decreasing value order) does this in amortized O(1) per step.

```python
from collections import deque

def window_min_demo(nums, k):
    dq = deque()  # indices, values kept in increasing order
    result = []
    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] > n:
            dq.pop()               # drop anything this new value beats
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()            # drop indices that fell out of the window
        if i >= k - 1:
            result.append(nums[dq[0]])
    return result

print(window_min_demo([4, 2, 5, 1, 3], 3))  # [2, 1, 1]
```

---

## Practice Problems

### 1. Longest Substring Without Repeating Characters

**Pattern:** Variable-size window + frequency map

**Problem:** Given a string `s`, find the length of the longest substring without repeating characters.

**Approach:** Expand `right` one character at a time. If the new character is already in the window (tracked with a set), shrink `left` — removing characters from the window — until the duplicate is gone. Track the best window length seen along the way.

```python
def length_of_longest_substring(s):
    seen = set()
    left = 0
    longest = 0

    for right, ch in enumerate(s):
        while ch in seen:
            seen.remove(s[left])
            left += 1
        seen.add(ch)
        longest = max(longest, right - left + 1)

    return longest

print(length_of_longest_substring("abcabcbb"))  # 3 ("abc")
```

Time: O(n), Space: O(min(n, charset size))

---

### 2. Longest Repeating Character Replacement

**Pattern:** Variable-size window + frequency map

**Problem:** Given a string `s` and integer `k`, you may replace up to `k` characters in any substring to make all its characters the same. Return the length of the longest substring achievable this way.

**Approach:** Track character counts in the window and `max_count`, the count of the most frequent character seen. A window is valid when `window_length - max_count <= k` (i.e. replacing the "non-majority" characters costs at most `k`). If it's ever invalid, shrink from the left. `max_count` is never decreased on shrink — that's safe because the answer can only grow when a *larger* `max_count` is found later, never by revisiting a smaller one.

```python
from collections import defaultdict

def character_replacement(s, k):
    count = defaultdict(int)
    left = 0
    max_count = 0
    best = 0

    for right, ch in enumerate(s):
        count[ch] += 1
        max_count = max(max_count, count[ch])

        window_len = right - left + 1
        if window_len - max_count > k:
            count[s[left]] -= 1
            left += 1

        best = max(best, right - left + 1)

    return best

print(character_replacement("AABABBA", 1))  # 4 -> "AABA" or "ABBA"
```

Time: O(n), Space: O(1) — at most 26 letters

---

### 3. Permutation in String

**Pattern:** Fixed-size window + frequency map

**Problem:** Given `s1` and `s2`, return `True` if `s2` contains a permutation (anagram) of `s1` as a substring.

**Approach:** Slide a **fixed-size** window of length `len(s1)` across `s2`, maintaining a frequency count of the window's characters. At each position, compare the window's counts against `s1`'s counts — a match means that window is a permutation of `s1`.

```python
from collections import Counter

def check_inclusion(s1, s2):
    k = len(s1)
    if k > len(s2):
        return False

    need = Counter(s1)
    window = Counter()

    for i, ch in enumerate(s2):
        window[ch] += 1
        if i >= k:
            left_char = s2[i - k]
            window[left_char] -= 1
            if window[left_char] == 0:
                del window[left_char]
        if window == need:
            return True

    return False

print(check_inclusion("ab", "eidbaooo"))  # True - "ba" is a permutation of "ab"
```

Time: O(n · 26) ≈ O(n), Space: O(1)

---

### 4. Minimum Window Substring

**Pattern:** Variable-size window + frequency map

**Problem:** Given strings `s` and `t`, find the smallest substring of `s` that contains **all** characters of `t` (including duplicates).

**Approach:** Expand `right`, updating window counts and a `formed` counter (how many of `t`'s distinct characters currently have *enough* copies in the window). Once `formed` equals the number of required characters, the window is valid — shrink `left` as far as possible while it stays valid, recording the smallest valid window found.

```python
from collections import Counter

def min_window(s, t):
    if not s or not t:
        return ""

    need = Counter(t)
    window = {}
    required = len(need)
    formed = 0
    left = 0
    best_len = float("inf")
    best_left = 0

    for right, ch in enumerate(s):
        window[ch] = window.get(ch, 0) + 1
        if ch in need and window[ch] == need[ch]:
            formed += 1

        while formed == required:
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_left = left

            left_char = s[left]
            window[left_char] -= 1
            if left_char in need and window[left_char] < need[left_char]:
                formed -= 1
            left += 1

    return "" if best_len == float("inf") else s[best_left:best_left + best_len]

print(min_window("ADOBECODEBANC", "ABC"))  # "BANC"
```

Time: O(n), Space: O(k) where k = distinct characters in `t`

---

### 5. Sliding Window Maximum

**Pattern:** Maximum/minimum window

**Problem:** Given an array `nums` and window size `k`, return an array of the maximum value in each window as it slides across `nums`.

**Approach:** Maintain a **monotonically decreasing deque of indices**. Before adding a new index, pop off any indices whose values are smaller than the new value — they can never be the max again while the new, larger value is still in the window. The front of the deque is always the current window's max; pop it if it has slid out of range.

```python
from collections import deque

def max_sliding_window(nums, k):
    dq = deque()  # indices, values in decreasing order
    result = []

    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] < n:
            dq.pop()
        dq.append(i)

        if dq[0] <= i - k:
            dq.popleft()

        if i >= k - 1:
            result.append(nums[dq[0]])

    return result

print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
# [3, 3, 5, 5, 6, 7]
```

Time: O(n) — each index is pushed and popped from the deque at most once, Space: O(k)

---

### 6. Find All Anagrams in a String

**Pattern:** Fixed-size window + frequency map

**Problem:** Given strings `s` and `p`, return the starting indices of all of `p`'s anagrams in `s`.

**Approach:** Same fixed-size window technique as Permutation in String, but instead of stopping at the first match, record every starting index where the window's character counts match `p`'s.

```python
from collections import Counter

def find_anagrams(s, p):
    k = len(p)
    if k > len(s):
        return []

    need = Counter(p)
    window = Counter()
    result = []

    for i, ch in enumerate(s):
        window[ch] += 1
        if i >= k:
            left_char = s[i - k]
            window[left_char] -= 1
            if window[left_char] == 0:
                del window[left_char]
        if window == need:
            result.append(i - k + 1)

    return result

print(find_anagrams("cbaebabacd", "abc"))  # [0, 6]
```

Time: O(n · 26) ≈ O(n), Space: O(1)

---

### 7. Maximum Average Subarray I

**Pattern:** Fixed-size window

**Problem:** Given an array `nums` and integer `k`, find the maximum average value of any contiguous subarray of length `k`.

**Approach:** Classic fixed-size window sum — compute the first window's sum directly, then slide by adding the new right element and subtracting the element that fell off the left. No need to re-sum the whole window each time.

```python
def find_max_average(nums, k):
    window_sum = sum(nums[:k])
    best = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        best = max(best, window_sum)

    return best / k

print(find_max_average([1, 12, -5, -6, 50, 3], 4))  # 12.75
```

Time: O(n), Space: O(1)

---

### 8. Longest Subarray of 1's After Deleting One Element

**Pattern:** Variable-size window

**Problem:** Given a binary array, return the length of the longest subarray containing only `1`s, after deleting **exactly one** element.

**Approach:** Allow the window to contain **at most one** `0`. Expand `right`; if the zero count exceeds `1`, shrink `left` until it's back to at most one zero. Since exactly one element must always be deleted (even from an all-`1`s window), the answer for a valid window is `window_length - 1`, i.e. `right - left` (not `right - left + 1`).

```python
def longest_subarray(nums):
    left = 0
    zero_count = 0
    best = 0

    for right, n in enumerate(nums):
        if n == 0:
            zero_count += 1

        while zero_count > 1:
            if nums[left] == 0:
                zero_count -= 1
            left += 1

        best = max(best, right - left)  # window length - 1 (one element must be deleted)

    return best

print(longest_subarray([1, 1, 0, 1]))        # 3
print(longest_subarray([0, 1, 1, 1, 0, 1, 1, 0, 1]))  # 5
```

Time: O(n), Space: O(1)

---

## Must Understand

**When to expand**
Almost always — the right pointer advances on **every** iteration of the main loop. Expanding is how the window sees new elements and tests new candidate windows; it's the "scanning" part of the algorithm.

**When to shrink**
Shrink the left pointer whenever the window has become **invalid** according to the problem's rule — too many zeroes, too many replacements needed, a duplicate character, or (in minimum-window problems) whenever the window is still valid and you're trying to make it *smaller*. Shrinking removes `nums[left]`/`s[left]` from the window's tracked state and moves `left` forward, then the validity check runs again.

**What makes a window valid**
This is entirely problem-specific, and figuring it out is usually the main challenge:
- No duplicate characters (Longest Substring Without Repeating Characters)
- `window_length - max_count <= k` (Longest Repeating Character Replacement)
- Frequency counts exactly match a target's (Permutation in String, Find All Anagrams)
- All required characters' counts are satisfied (Minimum Window Substring)
- At most one zero in the window (Longest Subarray of 1's After Deleting One Element)

**Why nested while loops can still be O(n)**
It looks like O(n²) because there's a `while` loop inside a `for` loop, but `left` only ever **moves forward** — it never resets or goes backward. Across the *entire* run of the algorithm, `left` can advance at most `n` times total (not `n` times per outer iteration). So the total work is `right` advancing n times plus `left` advancing at most n times — O(n) + O(n) = **O(n)** overall. This "each pointer moves forward at most n times, combined" argument is called amortized analysis, and it's the same reasoning that makes two-pointer solutions linear.
