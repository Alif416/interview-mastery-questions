# Heap / Priority Queue

**Core idea:** Efficiently access the smallest or largest element, without having to sort or scan everything.

All examples use Python's `heapq`, which only implements a **min-heap** — to simulate a max-heap, values are negated on push and pop.

---

## Patterns

### 1. Top K

Keep a heap of size `k` holding only the best candidates seen so far. Whenever the heap grows past size `k`, pop off the "worst" of the current top-k — what's left when you're done is exactly the top k.

```python
import heapq

def top_k_largest_demo(nums, k):
    heap = []  # min-heap - smallest of the current top-k sits at heap[0]
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)  # evict the smallest, keeping the k largest
    return heap

print(top_k_largest_demo([3, 1, 5, 8, 2], 3))  # contains [3, 5, 8]
```

### 2. K-way merge

Merge `k` already-sorted sequences by pushing each sequence's current head onto a heap, always popping the smallest, and pushing that same sequence's next element in its place.

```python
import heapq

def merge_k_sorted_demo(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))  # value, which list, index in that list

    result = []
    while heap:
        val, list_idx, elem_idx = heapq.heappop(heap)
        result.append(val)
        if elem_idx + 1 < len(lists[list_idx]):
            next_val = lists[list_idx][elem_idx + 1]
            heapq.heappush(heap, (next_val, list_idx, elem_idx + 1))

    return result

print(merge_k_sorted_demo([[1, 4, 7], [2, 5], [3, 6, 8]]))
# [1, 2, 3, 4, 5, 6, 7, 8]
```

### 3. Two heaps

Split the data into a **max-heap for the lower half** and a **min-heap for the upper half**, kept balanced in size. The boundary between them — the tops of both heaps — is always instantly available, which is exactly what's needed for a running median.

```python
import heapq

class TwoHeapsDemo:
    def __init__(self):
        self.small = []  # max-heap (negated) - lower half
        self.large = []  # min-heap - upper half

    def add(self, num):
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))
```

### 4. Scheduling

Use a heap to always know which task/resource needs attention next — the most urgent task (max-heap of frequency/priority), or the soonest-freed resource (min-heap of end times).

```python
import heapq

def min_meeting_rooms_demo(intervals):
    intervals.sort(key=lambda x: x[0])
    heap = []  # end times of rooms currently in use
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)  # earliest-ending room has freed up - reuse it
        heapq.heappush(heap, end)
    return len(heap)  # rooms needed at once

print(min_meeting_rooms_demo([[0, 30], [5, 10], [15, 20]]))  # 2
```

---

## Practice Problems

### 1. Kth Largest Element in an Array

**Pattern:** Top K

**Problem:** Given an unsorted array, find the `k`th largest element.

**Approach:** Maintain a min-heap of size `k`. Once every element has been pushed (evicting the smallest whenever the heap exceeds size `k`), the heap holds exactly the `k` largest elements — and its root is the smallest of them, i.e. the `k`th largest overall.

```python
import heapq

def find_kth_largest(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]

print(find_kth_largest([3, 2, 1, 5, 6, 4], 2))  # 5
```

Time: O(n log k), Space: O(k)

---

### 2. Last Stone Weight

**Pattern:** Top K (repeated max extraction)

**Problem:** Repeatedly smash the two heaviest stones together; if they're equal, both are destroyed, otherwise the lighter is destroyed and the heavier becomes `heavier - lighter`. Return the weight of the last stone left (or `0`).

**Approach:** Use a max-heap (negate values, since `heapq` is min-heap only) so the two heaviest stones are always at the front. Pop both, push back the difference if nonzero, and repeat until at most one stone remains.

```python
import heapq

def last_stone_weight(stones):
    heap = [-s for s in stones]
    heapq.heapify(heap)

    while len(heap) > 1:
        first = -heapq.heappop(heap)
        second = -heapq.heappop(heap)
        if first != second:
            heapq.heappush(heap, -(first - second))

    return -heap[0] if heap else 0

print(last_stone_weight([2, 7, 4, 1, 8, 1]))  # 1
```

Time: O(n log n), Space: O(n)

---

### 3. K Closest Points to Origin

**Pattern:** Top K

**Problem:** Given a list of points, return the `k` points closest to the origin `(0, 0)`.

**Approach:** Use a max-heap of size `k`, keyed by (negated) squared distance. Push every point; once the heap exceeds size `k`, pop the **farthest** point — leaving only the `k` closest.

```python
import heapq

def k_closest(points, k):
    heap = []
    for x, y in points:
        dist = x * x + y * y
        heapq.heappush(heap, (-dist, x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [(x, y) for _, x, y in heap]

print(k_closest([[1, 3], [-2, 2]], 1))  # [(-2, 2)]
```

Time: O(n log k), Space: O(k)

---

### 4. Task Scheduler

**Pattern:** Scheduling

**Problem:** Given a list of CPU tasks and a cooldown `n` (the same task type must wait `n` intervals before running again), find the minimum total time (including idle slots) to finish all tasks.

**Approach:** Use a max-heap of task frequencies. Each "tick," pop the most frequent remaining task type and run it; if it still has remaining count, it goes into a cooldown queue and re-enters the heap once `n` intervals have passed.

```python
import heapq
from collections import Counter, deque

def least_interval(tasks, n):
    counts = Counter(tasks)
    max_heap = [-c for c in counts.values()]
    heapq.heapify(max_heap)

    time = 0
    queue = deque()  # (remaining count, time it becomes available again)

    while max_heap or queue:
        time += 1
        if max_heap:
            count = 1 + heapq.heappop(max_heap)  # one instance executed (count stored negative)
            if count:
                queue.append((count, time + n))
        if queue and queue[0][1] == time:
            heapq.heappush(max_heap, queue.popleft()[0])

    return time

print(least_interval(["A", "A", "A", "B", "B", "B"], 2))  # 8
```

Time: O(n) where n = number of tasks (26 possible task types keeps the heap tiny), Space: O(1)

---

### 5. Find Median from Data Stream

**Pattern:** Two heaps

**Problem:** Design a structure that supports adding numbers one at a time and returning the median of all numbers seen so far, at any point.

**Approach:** Keep a max-heap for the smaller half of numbers and a min-heap for the larger half, rebalancing after every insert so their sizes never differ by more than 1. The median is then either the top of whichever heap has more elements, or the average of both tops.

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # max-heap (negated), lower half
        self.large = []  # min-heap, upper half

    def add_num(self, num):
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def find_median(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2

mf = MedianFinder()
mf.add_num(1)
mf.add_num(2)
print(mf.find_median())  # 1.5
mf.add_num(3)
print(mf.find_median())  # 2
```

Time: O(log n) per `add_num`, O(1) per `find_median`, Space: O(n)

---

### 6. Merge K Sorted Lists

**Pattern:** K-way merge

**Problem:** Given `k` sorted linked lists, merge them into a single sorted linked list.

**Approach:** Push the head of each list onto a min-heap. Repeatedly pop the overall smallest node, attach it to the result, and push that list's next node in its place — the heap always tells you which of the `k` candidates is smallest in O(log k).

```python
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    dummy = ListNode()
    tail = dummy
    while heap:
        val, i, node = heapq.heappop(heap)
        tail.next = node
        tail = tail.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next
```

Time: O(N log k) where N = total nodes across all lists, Space: O(k)

---

### 7. Top K Frequent Elements

**Pattern:** Top K

**Problem:** Given an array, return the `k` most frequent elements.

**Approach:** Count frequencies, then keep a min-heap of size `k` keyed by frequency — whenever it exceeds size `k`, pop the least frequent element. (This is the general-purpose heap approach; bucket sort — see [array and hashing .md](array%20and%20hashing%20.md) — achieves O(n) instead when frequencies are bounded by array length.)

```python
import heapq
from collections import Counter

def top_k_frequent(nums, k):
    counts = Counter(nums)
    heap = []
    for num, freq in counts.items():
        heapq.heappush(heap, (freq, num))
        if len(heap) > k:
            heapq.heappop(heap)
    return [num for freq, num in heap]

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))  # [2, 1] (order may vary)
```

Time: O(n log k), Space: O(n)

---

### 8. Meeting Rooms II

**Pattern:** Scheduling

**Problem:** Given meeting time intervals, find the minimum number of conference rooms required so no two overlapping meetings share a room.

**Approach:** Sort meetings by start time. Use a min-heap of end times to represent rooms currently occupied. For each meeting, if the room that frees up **earliest** (`heap[0]`) is already free by this meeting's start time, reuse it (pop it) before pushing the current meeting's end time — otherwise a new room is needed, growing the heap.

```python
import heapq

def min_meeting_rooms(intervals):
    if not intervals:
        return 0

    intervals.sort(key=lambda x: x[0])
    heap = []  # end times of rooms currently in use

    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)

    return len(heap)

print(min_meeting_rooms([[0, 30], [5, 10], [15, 20]]))  # 2
```

Time: O(n log n), Space: O(n)

---

## Must Understand

**Min-heap vs max-heap**
A min-heap always exposes the **smallest** element at the root in O(1); a max-heap exposes the **largest**. Python's `heapq` module only provides a min-heap — to get max-heap behavior, negate values on push and negate them back on pop. Reach for a min-heap when you repeatedly need to discard/inspect the smallest of a group (Top K largest — evict the smallest of the current top-k); reach for a max-heap when you repeatedly need the largest (Last Stone Weight, Task Scheduler's most-frequent task).

**Why heap operations are O(log n)**
A heap is a complete binary tree stored compactly in an array, so it always has height `log n` for `n` elements. Inserting or removing an element only requires "bubbling" it up or down along a single path from root to leaf (or vice versa) to restore the heap property — touching O(log n) elements, not the whole structure. That's what makes a heap so much cheaper than re-sorting from scratch on every update.

**When sorting is not enough**
Sorting the entire collection costs O(n log n) up front and produces a static, one-time result. That's wasteful (or outright impossible) when: you only need the top/bottom `k` out of a much larger `n` (a heap of size `k` costs O(n log k), cheaper than O(n log n) when `k` is small); the data arrives as a **stream** and you need an answer after every new element (Find Median from Data Stream — you can't re-sort from scratch on every insert); or you need to repeatedly extract-and-replace the extreme value as state changes (Task Scheduler, Meeting Rooms II) — a sorted array doesn't support cheap updates, but a heap does.

**Why top-K problems often use heaps**
A heap of size `k` naturally keeps track of only the best `k` candidates seen so far, discarding worse ones as it goes — each insertion/eviction costs O(log k) instead of needing a full O(n log n) sort of everything. Processing all `n` elements this way costs O(n log k), which beats sorting whenever `k` is meaningfully smaller than `n`, and it also works naturally on streaming or very large inputs where sorting everything up front isn't practical.
