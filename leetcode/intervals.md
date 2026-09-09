# Intervals

**Core idea:** Sort the intervals first, then reason about overlap with a single pass instead of comparing every pair.

---

## Patterns

### 1. Merge intervals

Sort by start time, then walk through: if the next interval starts before (or exactly when) the current merged interval ends, fold it in by extending the end to the max of both; otherwise start a new merged interval.

```python
def merge_intervals_demo(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)
        else:
            merged.append([start, end])
    return merged

print(merge_intervals_demo([[1, 3], [2, 6], [8, 10]]))
# [[1, 6], [8, 10]]
```

### 2. Overlap detection

Two intervals `[a1, a2]` and `[b1, b2]` overlap exactly when `a1 <= b2` **and** `b1 <= a2` — equivalently, they *don't* overlap only when one entirely finishes before the other starts.

```python
def overlaps(a, b):
    return a[0] <= b[1] and b[0] <= a[1]

print(overlaps([1, 5], [4, 8]))  # True
print(overlaps([1, 3], [5, 8]))  # False
```

### 3. Meeting scheduling

Sort by start time, then use a heap of end times to track how many resources (rooms, workers) are needed **at once** — reuse whichever one frees up soonest if it's already free by the time it's needed again.

```python
import heapq

def meeting_scheduling_demo(intervals):
    intervals.sort(key=lambda x: x[0])
    heap = []  # end times of ongoing meetings
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)

print(meeting_scheduling_demo([[0, 30], [5, 10], [15, 20]]))  # 2
```

### 4. Sweep line

Convert every interval into two **events** — a `+1` where it starts, a `-1` right where it ends — then sort all events by position and scan through, accumulating a running count. That count at any point tells you exactly how many intervals are active there.

```python
def sweep_line_demo(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    events.sort()  # ties: -1 (an ending) sorts before +1 (a start) at the same position

    count = 0
    max_count = 0
    for pos, delta in events:
        count += delta
        max_count = max(max_count, count)
    return max_count

print(sweep_line_demo([[0, 30], [5, 10], [15, 20]]))  # 2
```

---

## Practice Problems

### 1. Merge Intervals

**Pattern:** Merge intervals

**Problem:** Given a list of intervals, merge all overlapping intervals.

**Approach:** Sort by start. Walk through once, merging each interval into the last kept one whenever it overlaps (`start <= last_end`), and extending the end to `max(last_end, end)` — not just replacing it, since an earlier interval could already fully contain the current one.

```python
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)
        else:
            merged.append([start, end])
    return merged

print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))
# [[1, 6], [8, 10], [15, 18]]
```

Time: O(n log n), Space: O(n)

---

### 2. Insert Interval

**Pattern:** Merge intervals

**Problem:** Given a sorted, non-overlapping list of intervals and a new interval, insert it in order, merging as needed, and return the resulting sorted, non-overlapping list.

**Approach:** Three phases in one pass: (1) copy over every interval that ends entirely before the new one starts, unchanged; (2) merge every interval that overlaps the new one into it, growing its bounds; (3) copy over every remaining interval, unchanged.

```python
def insert(intervals, new_interval):
    result = []
    i, n = 0, len(intervals)

    while i < n and intervals[i][1] < new_interval[0]:
        result.append(intervals[i])
        i += 1

    while i < n and intervals[i][0] <= new_interval[1]:
        new_interval = [min(new_interval[0], intervals[i][0]), max(new_interval[1], intervals[i][1])]
        i += 1
    result.append(new_interval)

    while i < n:
        result.append(intervals[i])
        i += 1

    return result

print(insert([[1, 3], [6, 9]], [2, 5]))
# [[1, 5], [6, 9]]
```

Time: O(n), Space: O(n)

---

### 3. Non-overlapping Intervals

**Pattern:** Overlap detection

**Problem:** Given a list of intervals, find the minimum number that must be removed so the rest don't overlap. *(Also covered in [greedy.md](greedy.md), which walks through why sorting by end time is the safe greedy choice.)*

**Approach:** Sort by **end time**. Keep an interval only if it starts at or after the previously kept interval's end; every interval that overlaps the last kept one must be removed.

```python
def erase_overlap_intervals(intervals):
    if not intervals:
        return 0
    intervals.sort(key=lambda x: x[1])

    removed = 0
    last_end = intervals[0][1]
    for start, end in intervals[1:]:
        if start < last_end:
            removed += 1
        else:
            last_end = end

    return removed

print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))  # 1
```

Time: O(n log n), Space: O(1)

---

### 4. Meeting Rooms

**Pattern:** Overlap detection

**Problem:** Given a list of meeting time intervals, determine if a single person could attend all of them (i.e. none overlap).

**Approach:** Sort by start time, then check each meeting's start against the **immediately previous** meeting's end — if a meeting starts before the previous one has ended, there's a conflict.

```python
def can_attend_meetings(intervals):
    intervals.sort(key=lambda x: x[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True

print(can_attend_meetings([[0, 30], [5, 10], [15, 20]]))  # False
```

Time: O(n log n), Space: O(1)

---

### 5. Meeting Rooms II

**Pattern:** Meeting scheduling

**Problem:** Given meeting time intervals, find the minimum number of conference rooms required. *(Also covered in [Heap & Priority Queue](heap%20and%20priority%20queue.md), with the heap mechanics explained in more depth.)*

**Approach:** Sort by start time. Use a min-heap of end times representing rooms currently in use — if the room that frees up **soonest** (`heap[0]`) is already free by the current meeting's start, reuse it; otherwise a new room is needed.

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

### 6. Minimum Interval to Include Each Query

**Pattern:** Meeting scheduling + Sweep line

**Problem:** Given a list of intervals and a list of query points, for each query find the size of the **smallest** interval that contains it (or `-1` if none does).

**Approach:** Sort intervals by start, and process queries in **increasing order** (remembering their original positions for the final answer). As the sweep passes each query, push every interval whose start is now `<=` it onto a min-heap keyed by interval size. Pop off any interval whose end has already fallen behind the current query (it's expired — no longer contains it). The heap's top is always the smallest interval currently containing the query.

```python
import heapq

def min_interval(intervals, queries):
    intervals.sort()
    sorted_query_indices = sorted(range(len(queries)), key=lambda i: queries[i])

    result = [-1] * len(queries)
    heap = []  # (size, end)
    i = 0

    for q_idx in sorted_query_indices:
        q = queries[q_idx]
        while i < len(intervals) and intervals[i][0] <= q:
            start, end = intervals[i]
            heapq.heappush(heap, (end - start + 1, end))
            i += 1

        while heap and heap[0][1] < q:
            heapq.heappop(heap)  # expired - no longer contains q

        if heap:
            result[q_idx] = heap[0][0]

    return result

print(min_interval([[1, 4], [2, 4], [3, 6], [4, 4]], [2, 3, 4, 5]))
# [3, 3, 1, 4]
```

Time: O((n + q) log n), Space: O(n + q)

---

### 7. Employee Free Time

**Pattern:** Sweep line + Merge intervals

**Problem:** Given several employees' schedules (each a sorted list of non-overlapping working intervals), find all finite intervals representing time when **every** employee is free, sorted.

**Approach:** Flatten all employees' intervals into one list and sort by start — then merge overlapping intervals exactly like Merge Intervals. The **gaps** between consecutive merged intervals are exactly the stretches when nobody is working, i.e. company-wide free time.

```python
def employee_free_time(schedule):
    intervals = sorted((iv for employee in schedule for iv in employee), key=lambda x: x[0])

    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)
        else:
            merged.append([start, end])

    free_time = []
    for i in range(1, len(merged)):
        free_time.append([merged[i - 1][1], merged[i][0]])
    return free_time

# using plain [start, end] lists in place of Interval objects
schedule = [[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]
print(employee_free_time(schedule))
# [[5, 6], [7, 9]]
```

Time: O(n log n) where n = total intervals across all employees, Space: O(n)

---

## Must Understand

**Why sorting by start time helps**
Once intervals are sorted, every interval already processed necessarily started at or before every interval still to come — so overlap and merge decisions only ever need to compare the current interval against the **single most recently kept one**, never the whole remaining list. Without sorting, an interval could overlap with an arbitrary earlier one buried anywhere in the list, forcing an O(n²) comparison against everything seen so far.

**How to detect overlap**
Two intervals `[a1, a2]` and `[b1, b2]` overlap exactly when `a1 <= b2` **and** `b1 <= a2` — equivalently, they fail to overlap only when one entirely finishes before the other starts (`a2 < b1` or `b2 < a1`). Pay close attention to whether the problem treats touching endpoints (`a2 == b1`) as overlapping — that single `<` vs `<=` choice is the most common source of off-by-one bugs in interval problems.

**When to merge**
Merge two sorted-by-start intervals whenever the next one's start is `<=` the current merged interval's end. The merged end must be `max(current_end, next_end)`, never just `next_end` — an earlier interval can fully contain a later, shorter one, and taking the plain second value would silently shrink the merged interval.

**When to use a heap**
Reach for a heap when multiple intervals can be "in progress" **at the same time**, and you repeatedly need to know which one finishes soonest — Meeting Rooms II tracks room end times to find the earliest-freeing room; Minimum Interval to Include Each Query tracks candidate interval sizes so the smallest currently-valid one is always on top. If a problem only ever needs to compare against the single most recent interval (not several concurrent ones), a heap is unnecessary overhead — a plain running variable is enough, as in Merge Intervals or Meeting Rooms I.
