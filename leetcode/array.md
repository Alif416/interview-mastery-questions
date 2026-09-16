# Arrays & Hashing

**Core idea:** Use extra space (usually a hash map or hash set) to trade memory for speed — turning a slow linear search into a fast, usually O(1), lookup.

---

## Patterns

### 1. HashMap / HashSet

A hash map (`dict` in Python) stores **key → value** pairs; a hash set (`set`) stores **unique keys only**, with no associated value. Both use a hash function to jump almost directly to a key's location, giving average **O(1)** insert/lookup/delete — instead of scanning the whole array (**O(n)**).

```python
# HashSet - "have I seen this before?"
seen = set()
seen.add(5)
print(5 in seen)   # True  - O(1) lookup
print(9 in seen)   # False

# HashMap - "what value/index/count goes with this key?"
index_of = {}
nums = [10, 20, 30]
for i, n in enumerate(nums):
    index_of[n] = i
print(index_of[20])  # 1
```

### 2. Frequency counting

Count how many times each element appears using a `dict` (or `collections.Counter`). This is the backbone of anagram, duplicate, and "most common element" problems.

```python
from collections import Counter

s = "aabbbc"
freq = Counter(s)
print(freq)          # Counter({'b': 3, 'a': 2, 'c': 1})
print(freq['b'])      # 3
print(freq['z'])       # 0 - missing keys default to 0 with Counter
```

### 3. Prefix sum

A prefix sum array stores the **running total** up to each index, so the sum of any range `[i, j]` can be computed in O(1) as `prefix[j] - prefix[i-1]`, after an O(n) one-time setup — instead of re-summing the range every time.

```python
nums = [3, 1, 4, 1, 5]
prefix = [0] * (len(nums) + 1)
for i, n in enumerate(nums):
    prefix[i + 1] = prefix[i] + n
# prefix = [0, 3, 4, 8, 9, 14]

def range_sum(i, j):  # sum of nums[i..j] inclusive
    return prefix[j + 1] - prefix[i]

print(range_sum(1, 3))  # 1 + 4 + 1 = 6
```

### 4. Difference array

The reverse trick of prefix sum: to apply the **same update to an entire range** in O(1) instead of O(n), only mark the *change* at the boundaries (`+val` at the start, `-val` just after the end). Taking the prefix sum of that difference array afterward reconstructs the final values.

```python
def range_add(length, updates):
    # updates: list of (start, end, val) - add val to nums[start..end] inclusive
    diff = [0] * (length + 1)
    for start, end, val in updates:
        diff[start] += val
        diff[end + 1] -= val

    result = [0] * length
    running = 0
    for i in range(length):
        running += diff[i]
        result[i] = running
    return result

print(range_add(5, [(1, 3, 2), (0, 1, 3)]))
# [3, 5, 2, 2, 0] - range [1,3] got +2, range [0,1] got +3
```

### 5. Sorting + hashing

Sometimes the fastest way to compare or group items is to **sort each item into a canonical form**, then use that canonical form as a hash map key (e.g. two words are anagrams if their sorted letters match).

```python
def canonical_form(word):
    return "".join(sorted(word))

print(canonical_form("eat"))  # "aet"
print(canonical_form("tea"))  # "aet" - same canonical form -> anagrams
```

---

## Practice Problems

### 1. Two Sum

**Problem:** Given an array `nums` and a `target`, return the indices of the two numbers that add up to `target`.

**Pattern:** HashMap

**Approach:** As you scan, store each number's index in a hash map. Before adding the current number, check if its *complement* (`target - num`) is already in the map — if so, you've found the pair in a single O(n) pass.

```python
def two_sum(nums, target):
    seen = {}  # value -> index
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
```

Time: O(n), Space: O(n)

---

### 2. Contains Duplicate

**Problem:** Given an array, return `True` if any value appears at least twice.

**Pattern:** HashSet

**Approach:** Put every element into a set. If the set ends up smaller than the array, some value was inserted more than once (a duplicate).

```python
def contains_duplicate(nums):
    return len(set(nums)) != len(nums)

print(contains_duplicate([1, 2, 3, 1]))  # True
print(contains_duplicate([1, 2, 3, 4]))  # False
```

Time: O(n), Space: O(n)

---

### 3. Valid Anagram

**Problem:** Given strings `s` and `t`, return `True` if `t` is an anagram of `s` (same letters, same counts).

**Pattern:** Frequency counting

**Approach:** Count the letter frequencies of `s`, then walk `t` subtracting from those counts. If any count goes missing/negative, or leftover counts remain, it's not an anagram.

```python
def is_anagram(s, t):
    if len(s) != len(t):
        return False

    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1

    for ch in t:
        if ch not in count:
            return False
        count[ch] -= 1
        if count[ch] == 0:
            del count[ch]

    return len(count) == 0

print(is_anagram("anagram", "nagaram"))  # True
print(is_anagram("rat", "car"))          # False
```

Time: O(n), Space: O(1) — at most 26 letters in the map

---

### 4. Group Anagrams

**Problem:** Given a list of strings, group the ones that are anagrams of each other.

**Pattern:** Sorting + hashing

**Approach:** Every anagram shares the same **sorted** form. Use that sorted string as a hash map key and bucket the originals under it.

```python
def group_anagrams(strs):
    groups = {}
    for s in strs:
        key = "".join(sorted(s))
        groups.setdefault(key, []).append(s)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
# [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]
```

Time: O(n · k log k) where k = max word length, Space: O(n · k)

---

### 5. Top K Frequent Elements

**Problem:** Given an array, return the `k` most frequent elements.

**Pattern:** Frequency counting

**Approach:** Count frequencies, then use **bucket sort**: bucket index = frequency, so bucket `i` holds every number that appeared exactly `i` times. Walk the buckets from highest frequency down, collecting numbers until you have `k`. This avoids a full O(n log n) sort.

```python
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)

    result = []
    for freq in range(len(buckets) - 1, 0, -1):
        for num in buckets[freq]:
            result.append(num)
            if len(result) == k:
                return result
    return result

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))  # [1, 2]
```

Time: O(n), Space: O(n)

---

### 6. Product of Array Except Self

**Problem:** Given an array `nums`, return an array where `result[i]` is the product of every element except `nums[i]` — without using division.

**Pattern:** Prefix sum (prefix/postfix product variant)

**Approach:** For each index, the answer is `(product of everything to the left) * (product of everything to the right)`. Compute the left-products in one pass, then multiply in the right-products in a second pass, using a running total instead of a full second array.

```python
def product_except_self(nums):
    n = len(nums)
    result = [1] * n

    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]

    postfix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= postfix
        postfix *= nums[i]

    return result

print(product_except_self([1, 2, 3, 4]))  # [24, 12, 8, 6]
```

Time: O(n), Space: O(1) extra (excluding the output array)

---

### 7. Longest Consecutive Sequence

**Problem:** Given an unsorted array of integers, find the length of the longest run of consecutive integers (e.g. `[100, 4, 200, 1, 3, 2]` → `4`, for `1, 2, 3, 4`).

**Pattern:** HashSet

**Approach:** Put everything in a set for O(1) lookups. Only start counting a sequence from a number that is the **start** of one (i.e. `n - 1` is not in the set) — that guarantees each sequence is only walked once, keeping the whole thing O(n) instead of O(n²).

```python
def longest_consecutive(nums):
    num_set = set(nums)
    longest = 0

    for n in num_set:
        if n - 1 not in num_set:  # n is the start of a sequence
            length = 1
            while n + length in num_set:
                length += 1
            longest = max(longest, length)

    return longest

print(longest_consecutive([100, 4, 200, 1, 3, 2]))  # 4
```

Time: O(n), Space: O(n)

---

### 8. Subarray Sum Equals K

**Problem:** Given an array `nums` and integer `k`, count how many contiguous subarrays sum to exactly `k`.

**Pattern:** Prefix sum + HashMap

**Approach:** Combine **prefix sum** with a **hash map**. While scanning, track the running prefix sum and how many times each prefix sum value has occurred. A subarray ending at the current index sums to `k` exactly when `(current prefix sum - k)` was seen before — each such occurrence marks one valid subarray.

```python
def subarray_sum(nums, k):
    count = 0
    prefix_sum = 0
    seen = {0: 1}  # prefix sum 0 occurs once before we start

    for n in nums:
        prefix_sum += n
        count += seen.get(prefix_sum - k, 0)
        seen[prefix_sum] = seen.get(prefix_sum, 0) + 1

    return count

print(subarray_sum([1, 1, 1], 2))  # 2  -> [1,1] (indices 0-1) and [1,1] (indices 1-2)
```

Time: O(n), Space: O(n)

---

### 9. Longest Substring Without Repeating Characters

**Problem:** Given a string `s`, find the length of the longest substring without repeating characters.

**Pattern:** HashMap (combined with sliding window)

**Approach:** Sliding window + hash map. Track the **last seen index** of each character. As the window's right edge moves forward, if the current character was seen inside the current window, jump the window's left edge past that previous occurrence.

```python
def length_of_longest_substring(s):
    last_seen = {}
    left = 0
    longest = 0

    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        longest = max(longest, right - left + 1)

    return longest

print(length_of_longest_substring("abcabcbb"))  # 3 ("abc")
print(length_of_longest_substring("bbbbb"))     # 1 ("b")
```

Time: O(n), Space: O(min(n, charset size))

---

## Must Understand

**When to use a set vs a hashmap**
Use a **set** when you only need to know *whether* something exists (membership check, deduplication) — e.g. Contains Duplicate, Longest Consecutive Sequence. Use a **hashmap** when you need to associate a key with extra information — a count (frequency counting), an index (Two Sum), a running total (Subarray Sum Equals K), or a list of items (Group Anagrams).

**Why lookup is usually O(1)**
A hash table applies a hash function to the key to compute *directly* which bucket it belongs in, so checking or inserting a key doesn't require scanning other entries — unlike an array (O(n) linear scan) or a sorted structure (O(log n) binary search). This is "amortized" O(1): a *specific* lookup can be O(n) in the rare worst case of many hash collisions, but on average, across normal inputs, it behaves like O(1).

**Prefix sum intuition**
If you precompute running totals once, the sum of any range becomes a single subtraction: `sum(i, j) = prefix[j] - prefix[i-1]`. You pay O(n) once up front so that every future range-sum query costs O(1) instead of O(n) — a classic time/space tradeoff, and it's what makes Subarray Sum Equals K solvable in one pass.

**How to identify a frequency-counting problem**
Look for language like: *duplicate*, *anagram*, *permutation of a substring*, *most/least common*, *same characters*, *count of X*, or *how many times does Y appear*. If the question is fundamentally about **counting occurrences** or **comparing the makeup** of two collections rather than their order, a hash map/`Counter` is almost always the right first tool to reach for.
