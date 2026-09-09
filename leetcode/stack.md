# Stack

**Core idea:** Use LIFO (last-in, first-out) behavior to remember unresolved elements until something comes along that resolves them.

---

## Patterns

### 1. Monotonic stack

A stack kept in strictly increasing or strictly decreasing order (top to bottom). Before pushing a new element, pop off anything that violates the order — those popped elements just found their "answer" (usually the next greater/smaller value).

```python
def next_greater_demo(nums):
    stack = []  # indices, values decreasing from bottom to top
    result = [-1] * len(nums)
    for i, n in enumerate(nums):
        while stack and nums[stack[-1]] < n:
            idx = stack.pop()
            result[idx] = n  # n is the "next greater" for nums[idx]
        stack.append(i)
    return result

print(next_greater_demo([2, 1, 3, 4, 1]))  # [3, 3, 4, -1, -1]
```

### 2. Matching parentheses

Push opening symbols onto the stack. When a closing symbol appears, it must match whatever is currently on **top** of the stack — that's the most recently opened, still-unmatched symbol.

```python
def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in ")]}":
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

print(is_balanced("{[()]}"))  # True
print(is_balanced("{[(])}"))  # False
```

### 3. Expression evaluation

Use a stack to defer operations until you have enough information to apply them — e.g. push operands, and when an operator appears, pop the operands it needs, compute, and push the result back.

```python
def evaluate_postfix(tokens):
    stack = []
    for token in tokens:
        if token in "+-*/":
            b = stack.pop()
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            elif token == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(token))
    return stack[-1]

print(evaluate_postfix(["2", "1", "+", "3", "*"]))  # 9
```

### 4. Stack simulation

Step through a sequence one item at a time, letting each new item potentially **cancel out or interact with** whatever is already on top of the stack — instead of re-scanning the whole sequence.

```python
def remove_adjacent_duplicates(s):
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()   # cancels out with the previous character
        else:
            stack.append(ch)
    return "".join(stack)

print(remove_adjacent_duplicates("abbaca"))  # "ca"
```

---

## Practice Problems

### 1. Valid Parentheses

**Pattern:** Matching parentheses

**Problem:** Given a string containing only `(`, `)`, `{`, `}`, `[`, `]`, determine if it's valid — every opening bracket is closed by the same type, in the correct order.

**Approach:** Push every opening bracket. On a closing bracket, it must match whatever is popped off the top; if the stack is empty or the popped bracket doesn't match, the string is invalid. At the end, the stack must be empty (no unclosed brackets left).

```python
def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        else:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

print(is_valid("()[]{}"))  # True
print(is_valid("(]"))      # False
```

Time: O(n), Space: O(n)

---

### 2. Min Stack

**Pattern:** Stack simulation

**Problem:** Design a stack supporting `push`, `pop`, `top`, and retrieving the minimum element — all in O(1).

**Approach:** Alongside each value, store the **minimum seen so far up to and including that value**. Since each entry carries its own "running minimum" snapshot, popping automatically restores the correct previous minimum — no recomputation needed.

```python
class MinStack:
    def __init__(self):
        self.stack = []  # each entry: (value, min_so_far)

    def push(self, val):
        current_min = val if not self.stack else min(val, self.stack[-1][1])
        self.stack.append((val, current_min))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def get_min(self):
        return self.stack[-1][1]

ms = MinStack()
ms.push(3)
ms.push(5)
ms.push(2)
ms.push(1)
print(ms.get_min())  # 1
ms.pop()
print(ms.get_min())  # 2
```

Time: O(1) per operation, Space: O(n)

---

### 3. Evaluate Reverse Polish Notation

**Pattern:** Expression evaluation

**Problem:** Evaluate an arithmetic expression given in Reverse Polish (postfix) Notation, e.g. `["2","1","+","3","*"]` → `9`.

**Approach:** Scan left to right. Push numbers onto the stack. When an operator appears, pop the top two operands (the second-to-last popped is the left operand), apply the operator, and push the result back — it may itself become an operand for a later operator.

```python
def eval_rpn(tokens):
    stack = []
    for token in tokens:
        if token in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            elif token == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))  # truncate toward zero
        else:
            stack.append(int(token))
    return stack[-1]

print(eval_rpn(["2", "1", "+", "3", "*"]))   # 9
print(eval_rpn(["4", "13", "5", "/", "+"]))  # 6
```

Time: O(n), Space: O(n)

---

### 4. Daily Temperatures

**Pattern:** Monotonic stack

**Problem:** Given daily temperatures, return an array where `answer[i]` is the number of days until a warmer temperature; `0` if there isn't one.

**Approach:** Keep a monotonic **decreasing** stack of indices (temperatures decreasing from bottom to top). When the current temperature is warmer than the temperature at the stack's top index, that day finally has its answer — pop it and record the day gap.

```python
def daily_temperatures(temps):
    result = [0] * len(temps)
    stack = []  # indices, temps decreasing

    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            prev = stack.pop()
            result[prev] = i - prev
        stack.append(i)

    return result

print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
# [1, 1, 4, 2, 1, 1, 0, 0]
```

Time: O(n), Space: O(n)

---

### 5. Car Fleet

**Pattern:** Monotonic stack

**Problem:** Cars travel toward the same `target` position, each with a starting position and speed. Cars that catch up to a slower car ahead join it and travel at its pace (they can never pass). Return the number of distinct fleets that reach the target.

**Approach:** Process cars from **closest to target to farthest**, computing each car's time to reach the target alone. Use a stack of fleet arrival times: if the current car would arrive **later** than the fleet ahead of it (top of stack), it forms a new, slower fleet — push its time. Otherwise it catches up and merges into that fleet — push nothing.

```python
def car_fleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)  # closest to target first
    stack = []

    for pos, spd in cars:
        time = (target - pos) / spd
        if not stack or time > stack[-1]:
            stack.append(time)  # new, distinct fleet
        # else: catches up to the fleet ahead, merges (nothing to push)

    return len(stack)

print(car_fleet(12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]))  # 3
```

Time: O(n log n) for the sort, Space: O(n)

---

### 6. Largest Rectangle in Histogram

**Pattern:** Monotonic stack

**Problem:** Given the heights of histogram bars (each of width 1), find the area of the largest rectangle that fits within the histogram.

**Approach:** Keep a monotonic **increasing** stack of indices. When a shorter bar appears, it means every taller bar still on the stack can't extend any further right — pop each one and compute the rectangle it could form, using the current index (and the new stack top) as its boundaries. A sentinel `0` appended at the end forces the stack to flush out any bars still standing.

```python
def largest_rectangle_area(heights):
    extended = heights + [0]
    stack = []  # indices, heights increasing
    best = 0

    for i, h in enumerate(extended):
        while stack and extended[stack[-1]] >= h:
            height = extended[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            best = max(best, height * width)
        stack.append(i)

    return best

print(largest_rectangle_area([2, 1, 5, 6, 2, 3]))  # 10
```

Time: O(n) — each bar is pushed and popped at most once, Space: O(n)

---

### 7. Next Greater Element I

**Pattern:** Monotonic stack

**Problem:** Given `nums1` (a subset of `nums2`) and `nums2` (all unique values), for every element in `nums1`, find its next greater element to its right in `nums2`, or `-1` if none exists.

**Approach:** Run a monotonic decreasing stack over `nums2` **once** to build a map of `value -> next greater value` for every element in `nums2`. Then just look up each element of `nums1` in that map.

```python
def next_greater_element(nums1, nums2):
    next_greater = {}
    stack = []

    for n in nums2:
        while stack and stack[-1] < n:
            next_greater[stack.pop()] = n
        stack.append(n)

    return [next_greater.get(n, -1) for n in nums1]

print(next_greater_element([4, 1, 2], [1, 3, 4, 2]))  # [-1, 3, -1]
```

Time: O(n + m), Space: O(n)

---

### 8. Asteroid Collision

**Pattern:** Stack simulation

**Problem:** Given an array of integers representing asteroids (sign = direction: positive moves right, negative moves left; magnitude = size), simulate collisions — the smaller asteroid explodes, equal-size asteroids both explode — and return the state after all collisions resolve.

**Approach:** Use a stack. A collision only happens when a **left-moving** asteroid (`a < 0`) meets a **right-moving** one already on top of the stack (`stack[-1] > 0`). Resolve collisions in a loop: pop and destroy smaller asteroids on the stack, destroy the current asteroid if the top is bigger, or destroy both if equal. If the current asteroid survives every collision, push it.

```python
def asteroid_collision(asteroids):
    stack = []

    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.pop()      # top asteroid destroyed, current keeps going
            elif stack[-1] == -a:
                stack.pop()      # both destroyed
                alive = False
            else:
                alive = False    # current asteroid destroyed

        if alive:
            stack.append(a)

    return stack

print(asteroid_collision([5, 10, -5]))  # [5, 10]
print(asteroid_collision([8, -8]))      # []
print(asteroid_collision([10, 2, -5]))  # [10]
```

Time: O(n) — each asteroid is pushed and popped at most once, Space: O(n)

---

## Must Understand

**Why a stack is useful**
A stack naturally remembers "unresolved" items in exactly the order they'll need to be resolved: the *most recently* opened bracket must be the *next* one closed, the *most recently* seen cooler day is the *next* one to check against a warmer temperature, the *closest* car ahead is the one that matters for a fleet merge. Whenever a problem's next step only depends on "the most recent thing that hasn't been dealt with yet," that's a strong signal to reach for a stack.

**When to pop**
Pop whenever the current element **resolves or invalidates** whatever is sitting on top of the stack — a closing bracket matches the top opener, a warmer temperature finally answers a waiting day, a bigger/smaller element breaks a monotonic trend, or a collision destroys the top asteroid. Popping is how the stack discards state the moment it's no longer needed.

**Monotonic increasing vs decreasing stack**
- A **monotonic decreasing** stack (values shrink from bottom to top) is used to find the **next greater** element: you pop off smaller values whenever a bigger one arrives, because those smaller values just found their answer (Daily Temperatures, Next Greater Element I).
- A **monotonic increasing** stack (values grow from bottom to top) is used to find the **next smaller** element: you pop off larger values whenever a smaller one arrives (Largest Rectangle in Histogram — a shorter bar means every taller bar on the stack has found where its rectangle must end).

**How to identify the "next greater/smaller" pattern**
Watch for phrasing like *"next greater/smaller element,"* *"how many days until,"* *"how far until a taller/warmer value,"* or any question asking — for each element — about the nearest future (or past) element that beats it in size. If the brute-force solution would be a nested loop comparing every pair (O(n²)), a monotonic stack almost always reduces it to a single O(n) pass, because each element only ever gets pushed and popped once.
