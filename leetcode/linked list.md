# Linked List

**Core idea:** Manipulate pointers directly instead of shifting elements — insertion and removal can be O(1) once you're at the right node.

All examples use this basic node definition unless noted otherwise:

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

---

## Patterns

### 1. Fast and slow pointers

`fast` moves two steps for every one step `slow` takes. When `fast` reaches the end, `slow` sits exactly at the midpoint — no need to count the length first.

```python
def find_middle_demo(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow  # middle node (the second middle, if the list has even length)
```

### 2. Reversal

Walk the list while rewiring each node's `.next` to point **backward** instead of forward, using three pointers so nothing gets lost.

```python
def reverse_demo(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next  # save the rest of the list before overwriting curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev  # new head
```

### 3. Dummy node

A placeholder node inserted **before** the real head removes the need for special-case code whenever the head itself might change (removal, merging, building a fresh list).

```python
def remove_value_demo(head, val):
    dummy = ListNode(0, head)
    prev = dummy
    curr = head
    while curr:
        if curr.val == val:
            prev.next = curr.next   # skip curr entirely
        else:
            prev = curr
        curr = curr.next
    return dummy.next  # true head, even if the original head was removed
```

### 4. Merge lists

Walk two lists side by side with a dummy head for the result. At each step, attach whichever node is smaller and advance only that list's pointer.

```python
def merge_demo(l1, l2):
    dummy = ListNode()
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 if l1 else l2  # attach whatever's left
    return dummy.next
```

### 5. Cycle detection

Floyd's algorithm: run fast/slow pointers through the list. If there's a cycle, `fast` will eventually lap `slow` and they'll meet inside the loop; if there's no cycle, `fast` simply reaches the end.

```python
def has_cycle_demo(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

---

## Practice Problems

### 1. Reverse Linked List

**Pattern:** Reversal

**Problem:** Reverse a singly linked list and return the new head.

**Approach:** Walk the list once, redirecting each node's `.next` pointer to point at the previous node instead of the next one, always saving a reference to the rest of the list first.

```python
def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev

# 1 -> 2 -> 3 -> None  becomes  3 -> 2 -> 1 -> None
```

Time: O(n), Space: O(1)

---

### 2. Merge Two Sorted Lists

**Pattern:** Merge lists + Dummy node

**Problem:** Merge two sorted linked lists into one sorted list.

**Approach:** Use a dummy head to avoid special-casing which list's node becomes the result's head. Walk both lists, always attaching the smaller current node and advancing only that list.

```python
def merge_two_lists(l1, l2):
    dummy = ListNode()
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 if l1 else l2
    return dummy.next
```

Time: O(m + n), Space: O(1) extra (reuses existing nodes)

---

### 3. Linked List Cycle

**Pattern:** Cycle detection

**Problem:** Given a linked list, determine if it has a cycle.

**Approach:** Floyd's fast/slow pointers. If `fast` and `slow` ever point to the same node, there's a cycle. If `fast` reaches `None`, the list is cycle-free.

```python
def has_cycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

Time: O(n), Space: O(1)

---

### 4. Reorder List

**Pattern:** Fast and slow pointers + Reversal + Merge lists

**Problem:** Given `L0 -> L1 -> ... -> Ln-1 -> Ln`, reorder it in place to `L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...`.

**Approach:** Three patterns chained together: (1) find the middle with fast/slow pointers, (2) reverse the second half, (3) merge the first half and reversed second half by alternating nodes.

```python
def reorder_list(head):
    if not head or not head.next:
        return

    # 1. find the middle
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    # 2. reverse the second half
    second = slow.next
    slow.next = None
    prev = None
    while second:
        next_node = second.next
        second.next = prev
        prev = second
        second = next_node
    second = prev

    # 3. merge the two halves, alternating
    first = head
    while second:
        first_next = first.next
        second_next = second.next
        first.next = second
        second.next = first_next
        first = first_next
        second = second_next
```

Time: O(n), Space: O(1)

---

### 5. Remove Nth Node From End of List

**Pattern:** Fast and slow pointers + Dummy node

**Problem:** Remove the `n`th node from the end of a linked list, and return the head.

**Approach:** Use a dummy node so removing the actual head needs no special case. Advance `fast` `n` steps ahead first, then move `fast` and `slow` together until `fast` hits the end — `slow` now sits right before the node to remove.

```python
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy

    for _ in range(n):
        fast = fast.next

    while fast.next:
        fast = fast.next
        slow = slow.next

    slow.next = slow.next.next
    return dummy.next
```

Time: O(n), Space: O(1)

---

### 6. Copy List With Random Pointer

**Pattern:** Dummy-node-style construction (build a brand-new list) + hashmap for pointer remapping

**Problem:** Given a linked list where each node has an extra `random` pointer to any node in the list (or `None`), return a deep copy of the list.

**Approach:** First pass: create a clone of every node and map `old node -> new node` in a hash map. Second pass: for every old node, use the map to wire up the clone's `.next` and `.random` to the *cloned* versions of the corresponding original targets.

```python
class Node:
    def __init__(self, val, next=None, random=None):
        self.val = val
        self.next = next
        self.random = random

def copy_random_list(head):
    if not head:
        return None

    old_to_new = {}
    curr = head
    while curr:
        old_to_new[curr] = Node(curr.val)
        curr = curr.next

    curr = head
    while curr:
        old_to_new[curr].next = old_to_new.get(curr.next)
        old_to_new[curr].random = old_to_new.get(curr.random)
        curr = curr.next

    return old_to_new[head]
```

Time: O(n), Space: O(n)

---

### 7. Add Two Numbers

**Pattern:** Dummy node + Merge-lists-style traversal

**Problem:** Two non-negative integers are represented as linked lists in reverse order (least significant digit first). Add the two numbers and return the sum as a linked list in the same format.

**Approach:** Use a dummy head for the result, same as merging two lists — walk both lists together, adding digits plus any carry, and appending a new node per digit of the result.

```python
def add_two_numbers(l1, l2):
    dummy = ListNode()
    tail = dummy
    carry = 0

    while l1 or l2 or carry:
        val1 = l1.val if l1 else 0
        val2 = l2.val if l2 else 0
        total = val1 + val2 + carry
        carry = total // 10
        tail.next = ListNode(total % 10)
        tail = tail.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None

    return dummy.next

# 2 -> 4 -> 3  (342)  +  5 -> 6 -> 4  (465)  =  7 -> 0 -> 8  (807)
```

Time: O(max(m, n)), Space: O(1) extra (excluding output)

---

### 8. LRU Cache

**Pattern:** Dummy node (doubly linked list sentinels) + hashmap

**Problem:** Design an LRU (Least Recently Used) cache with O(1) `get` and `put`.

**Approach:** A doubly linked list keeps nodes ordered from least- to most-recently used, with **two dummy sentinel nodes** (`left`/`right`) so insertion and removal never need to special-case the ends of the list. A hash map (`key -> node`) gives O(1) lookup. On every access, move the node to the most-recently-used end; when over capacity, evict the node next to the least-recently-used sentinel.

```python
class DListNode:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}                 # key -> DListNode
        self.left = DListNode()          # dummy - LRU side
        self.right = DListNode()         # dummy - MRU side
        self.left.next = self.right
        self.right.prev = self.left

    def _remove(self, node):
        prev, nxt = node.prev, node.next
        prev.next = nxt
        nxt.prev = prev

    def _insert(self, node):
        prev, nxt = self.right.prev, self.right
        prev.next = node
        node.prev = prev
        node.next = nxt
        nxt.prev = node

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._insert(node)          # mark as most recently used
        return node.val

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        node = DListNode(key, value)
        self.cache[key] = node
        self._insert(node)

        if len(self.cache) > self.capacity:
            lru = self.left.next     # node right after the LRU sentinel
            self._remove(lru)
            del self.cache[lru.key]
```

Time: O(1) per `get`/`put`, Space: O(capacity)

---

## Must Understand

**Pointer manipulation**
Linked list problems are solved by rewiring `.next` (and `.prev`) references directly, rather than moving values around like you would shift elements in an array. Once you're standing at the right node, insertion or removal is O(1) — the cost is entirely in *finding* that node, not in the update itself.

**Why dummy nodes help**
A dummy node placed just before the real head means the code never has to ask "is this the head?" as a special case — removing the head, building a brand-new list, or merging lists all become uniform operations on `dummy.next` instead of needing separate logic for "if the very first node is affected." At the end, `dummy.next` reliably holds the true head, even if the original head was removed or replaced.

**How fast/slow pointers work**
`fast` advances two nodes per step while `slow` advances one. Two consequences fall out of that gap: (1) when `fast` reaches the end, `slow` is mathematically guaranteed to be at the midpoint, since it's covered exactly half the distance; (2) if the list has a cycle, `fast` re-enters the loop before `slow` even finishes one lap and gains on `slow` by one node every step — so they're guaranteed to meet inside the cycle eventually, rather than fast just looping forever past slow.

**How to reverse a list without losing nodes**
Before you overwrite `curr.next`, you **must** save a reference to `curr.next` first (`next_node = curr.next`). If you set `curr.next = prev` before saving that reference, the rest of the original list becomes unreachable — nothing still points to it. The standard three-pointer walk (`prev`, `curr`, `next_node`) exists specifically so you always have a way to keep moving forward through the *original* list, even while you're busy rewiring links to point backward.
