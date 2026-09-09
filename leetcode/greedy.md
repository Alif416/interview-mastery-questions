# Greedy

**Core idea:** Make the best-looking choice available right now, relying on a proof that this locally best choice can never prevent reaching the globally best solution.

---

## Patterns

### 1. Sorting + greedy

Sort the input by some key first, so that a simple left-to-right pass afterward becomes correct — the hard comparison work gets done once, up front, by the sort.

```python
def assign_cookies_demo(children, cookies):
    children.sort()
    cookies.sort()
    child_i = 0
    for cookie in cookies:
        if child_i < len(children) and children[child_i] <= cookie:
            child_i += 1  # this child's need is satisfied by this cookie
    return child_i

print(assign_cookies_demo([1, 2, 3], [1, 1]))  # 1
```

### 2. Interval scheduling

Sort intervals by start or end time, then greedily accept, merge, or remove intervals by comparing each one only to the **previous decision** — never needing to look back further than that.

```python
def interval_scheduling_demo(intervals):
    intervals.sort(key=lambda x: x[1])  # sort by end time
    count = 0
    last_end = float("-inf")
    for start, end in intervals:
        if start >= last_end:
            count += 1     # doesn't conflict with the last one kept - take it
            last_end = end
    return count

print(interval_scheduling_demo([[1, 2], [2, 3], [3, 4], [1, 3]]))  # 3
```

### 3. Reachability

While scanning, track the **farthest point reachable so far**, and greedily extend that frontier at every step — used whenever a problem is about whether (or how) you can progress forward.

```python
def reachability_demo(nums):
    farthest = 0
    for i, n in enumerate(nums):
        if i > farthest:
            return False  # this index itself is unreachable
        farthest = max(farthest, i + n)
    return True

print(reachability_demo([2, 3, 1, 1, 4]))  # True
```

### 4. Local optimization

At each step, make whichever choice looks best **right now**, without looking ahead — valid only when a correctness proof shows no future information could ever make a different current choice better in hindsight.

```python
def local_optimization_demo(nums):
    best = nums[0]
    current = nums[0]
    for n in nums[1:]:
        current = max(n, current + n)  # extend the running subarray, or start fresh here
        best = max(best, current)
    return best

print(local_optimization_demo([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # 6
```

---

## Practice Problems

### 1. Maximum Subarray

**Pattern:** Local optimization (Kadane's algorithm)

**Problem:** Given an array, find the contiguous subarray with the largest sum.

**Approach:** At each position, decide whether to extend the running subarray or abandon it and start fresh at the current element — extending is only ever worth it if the running sum is still positive. Track the best sum seen across every position.

```python
def max_subarray(nums):
    best = nums[0]
    current = nums[0]
    for n in nums[1:]:
        current = max(n, current + n)
        best = max(best, current)
    return best

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # 6 -> [4,-1,2,1]
```

Time: O(n), Space: O(1)

---

### 2. Jump Game

**Pattern:** Reachability

**Problem:** Given `nums` where `nums[i]` is the maximum jump length from index `i`, determine if you can reach the last index starting from index `0`.

**Approach:** Track the farthest index reachable so far while scanning left to right. If the current index ever exceeds that farthest boundary, it means no earlier jump could get you here — unreachable. Otherwise, extend the boundary.

```python
def can_jump(nums):
    farthest = 0
    for i, n in enumerate(nums):
        if i > farthest:
            return False
        farthest = max(farthest, i + n)
    return True

print(can_jump([2, 3, 1, 1, 4]))  # True
print(can_jump([3, 2, 1, 0, 4]))  # False
```

Time: O(n), Space: O(1)

---

### 3. Jump Game II

**Pattern:** Reachability

**Problem:** Same setup as Jump Game, but find the **minimum number of jumps** needed to reach the last index (guaranteed reachable).

**Approach:** A BFS-like "level expansion" done greedily: track the current jump's boundary (`current_end`) and the farthest position reachable within the *next* jump (`farthest`). Once the scan reaches `current_end`, that means every option within the current jump has been explored — a new jump is required, so increment the count and push the boundary out to `farthest`.

```python
def jump(nums):
    jumps = 0
    current_end = 0
    farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps

print(jump([2, 3, 1, 1, 4]))  # 2
```

Time: O(n), Space: O(1)

---

### 4. Gas Station

**Pattern:** Local optimization + Reachability

**Problem:** Given `gas[i]` and `cost[i]` for a circular route of gas stations, find the starting station from which a full circuit is possible (guaranteed unique if `sum(gas) >= sum(cost)`), or `-1` if it's impossible.

**Approach:** If total gas is less than total cost, no start works — impossible outright. Otherwise, scan while tracking a running tank total. Whenever the tank goes negative from the current candidate start, **no station between that start and here could have worked either** (you'd have even less accumulated gas trying to reach here from any point after start) — so reset the candidate start to the next station and reset the tank.

```python
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1

    total_tank = 0
    start = 0
    for i in range(len(gas)):
        total_tank += gas[i] - cost[i]
        if total_tank < 0:
            start = i + 1   # no station between old start and i could work either
            total_tank = 0

    return start

print(can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]))  # 3
```

Time: O(n), Space: O(1)

---

### 5. Partition Labels

**Pattern:** Interval scheduling + Local optimization

**Problem:** Given a string, partition it into as many parts as possible so that each letter appears in at most one part. Return the size of each part.

**Approach:** First record the **last occurrence index** of every letter. Scan the string, extending a running `end` boundary to the last occurrence of every letter seen in the current partition so far. Once the scan position reaches `end`, every letter in this stretch has no more occurrences ahead — the partition is complete and can be closed.

```python
def partition_labels(s):
    last_index = {ch: i for i, ch in enumerate(s)}
    result = []
    start = 0
    end = 0
    for i, ch in enumerate(s):
        end = max(end, last_index[ch])
        if i == end:
            result.append(end - start + 1)
            start = i + 1
    return result

print(partition_labels("ababcbacadfegdehijhklij"))  # [9, 7, 8]
```

Time: O(n), Space: O(1) — at most 26 letters tracked

---

### 6. Merge Triplets to Form Target Triplet

**Pattern:** Local optimization (filtering)

**Problem:** Given a list of triplets and a `target` triplet, "merging" two triplets takes the elementwise max. Determine if some subset of the given triplets can be merged to produce exactly `target`.

**Approach:** Any triplet with a component **greater** than the corresponding target component can never be used — merging only ever takes the max, so including it would permanently overshoot that position. Among the remaining (safe) triplets, greedily track which target positions get hit exactly; success means all three positions were eventually matched by some safe triplet.

```python
def merge_triplets(triplets, target):
    achieved = set()
    for t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue  # this triplet would overshoot - can never be used
        for i in range(3):
            if t[i] == target[i]:
                achieved.add(i)
    return len(achieved) == 3

print(merge_triplets([[2, 5, 3], [1, 8, 4], [1, 7, 5]], [2, 7, 5]))  # True
```

Time: O(n), Space: O(1)

---

### 7. Non-overlapping Intervals

**Pattern:** Interval scheduling

**Problem:** Given a list of intervals, find the minimum number that must be removed so the rest are non-overlapping.

**Approach:** Sort by **end time**. Greedily keep an interval only if it starts at or after the previously *kept* interval's end; every interval that overlaps must be removed. Always keeping the interval with the earlier end is what leaves the most room for intervals still to come.

```python
def erase_overlap_intervals(intervals):
    if not intervals:
        return 0
    intervals.sort(key=lambda x: x[1])

    removed = 0
    last_end = intervals[0][1]
    for start, end in intervals[1:]:
        if start < last_end:
            removed += 1   # overlaps - remove this one, keep the earlier-ending interval
        else:
            last_end = end

    return removed

print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))  # 1
```

Time: O(n log n), Space: O(1)

---

### 8. Minimum Number of Arrows to Burst Balloons

**Pattern:** Interval scheduling

**Problem:** Balloons are given as intervals `[xstart, xend]`. An arrow shot straight up at some `x` bursts every balloon whose interval contains `x`. Find the minimum number of arrows needed to burst all balloons.

**Approach:** Sort by **end coordinate**. Shoot the first arrow at the end of the earliest-ending unburst balloon — that single shot also bursts every other balloon whose start is `<=` that position. Skip past every balloon hit by the current arrow; the first balloon whose start is beyond the current arrow needs a brand-new one.

```python
def find_min_arrow_shots(points):
    if not points:
        return 0
    points.sort(key=lambda x: x[1])

    arrows = 1
    arrow_pos = points[0][1]
    for start, end in points[1:]:
        if start > arrow_pos:
            arrows += 1        # this balloon needs a new arrow
            arrow_pos = end

    return arrows

print(find_min_arrow_shots([[10, 16], [2, 8], [1, 6], [7, 12]]))  # 2
```

Time: O(n log n), Space: O(1)

---

### 9. Task Scheduler

**Pattern:** Sorting + greedy (closed-form counting, as an alternative to the heap-based simulation)

**Problem:** Given CPU tasks and a cooldown `n` between repeats of the same task type, find the minimum total time (including idle slots) to complete them all. *(Also solved with a max-heap simulation in [Heap and priority queue . md](Heap%20and%20priority%20queue%20%20.md) — this is the greedy formula version of the same problem.)*

**Approach:** The **most frequent** task type dictates the "skeleton" of the schedule: it needs `max_count - 1` full cooldown gaps of size `n + 1` after it, plus one slot for each task type that's tied for that max frequency. If there are enough *other*, less-frequent tasks to fully pack every idle gap in that skeleton, the answer is simply `len(tasks)`; otherwise it's the skeleton length itself — so the greedy answer is the larger of the two.

```python
from collections import Counter

def least_interval(tasks, n):
    counts = Counter(tasks)
    max_count = max(counts.values())
    max_count_tasks = sum(1 for c in counts.values() if c == max_count)

    skeleton_length = (max_count - 1) * (n + 1) + max_count_tasks
    return max(len(tasks), skeleton_length)

print(least_interval(["A", "A", "A", "B", "B", "B"], 2))  # 8
```

Time: O(n), Space: O(1) — at most 26 task types

---

## Must Understand

**Why the greedy choice is safe**
A greedy algorithm is only correct when the locally best choice at each step can **never** rule out a better overall solution. This is usually shown with an *exchange argument*: take any hypothetical optimal solution that didn't make the greedy choice, and show it can always be transformed to make that choice instead without getting worse. For interval scheduling, picking whichever remaining interval ends **earliest** never hurts, because no other choice could leave *more* room for future intervals than the earliest-ending one does.

**When sorting helps**
Sorting exposes an ordering under which a single left-to-right scan becomes provably correct — sorting intervals by end time turns "pick the maximum non-overlapping set" into "just keep an interval if it starts after the last kept one ends"; sorting by start time supports merging/counting overlaps directly. Sorting essentially front-loads all the comparison work, so the pass that follows only ever needs to compare against the *immediately preceding* decision, never the whole remaining set.

**Difference between greedy and DP**
Both build a solution incrementally, but they differ in how much they trust each step. **DP** explores (or memoizes) every relevant choice at each step, because the locally-best option isn't provably always part of the global optimum — it needs actual subproblem comparisons to be sure. **Greedy** commits to a single choice at each step and never revisits it, relying entirely on a correctness proof that this choice can't be wrong. When that proof holds, greedy is usually far faster (often O(n log n) for a sort plus an O(n) pass) than the equivalent DP (often O(n²) or worse) — but applying greedy logic to a problem where it *isn't* actually safe silently produces a wrong answer rather than erroring, which is exactly why the proof step isn't optional.

**How to prove correctness**
Three common techniques: (1) the **exchange argument** — show any optimal solution can be rewritten to match the greedy choice without getting worse; (2) **"greedy stays ahead"** — show that after every step, the greedy partial solution is at least as good as any other valid partial solution reaching the same point; (3) **induction** — show the base case is optimal, and that each greedy step preserves optimality going forward. If none of these can be constructed, and a small handmade counterexample seems easy to imagine, that's a strong signal the problem actually needs dynamic programming or backtracking instead of a greedy approach.
