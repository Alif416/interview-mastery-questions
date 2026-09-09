# Graphs

**Core idea:** Explore relationships between nodes — who's connected to whom, in what order, and at what cost.

---

## Patterns

### 1. DFS

Explore as deep as possible down one path before backtracking, using recursion (or an explicit stack). Good for reachability, exhaustive exploration, and processing an entire connected region without caring about visiting order.

```python
def dfs_demo(graph, start):
    visited = set()

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        for neighbor in graph[node]:
            dfs(neighbor)

    dfs(start)
    return visited
```

### 2. BFS

Explore level by level using a queue — everything at distance 1 from the start is visited before anything at distance 2. This guarantees the **shortest path** in an unweighted graph.

```python
from collections import deque

def bfs_demo(graph, start):
    visited = {start}
    queue = deque([start])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    return order
```

### 3. Connected components

Scan every node. Whenever an **unvisited** node is found, it's the start of a brand-new component — run a full DFS/BFS from it to mark everything reachable as visited, then move on.

```python
def count_components_demo(n, edges):
    graph = {i: [] for i in range(n)}
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)

    visited = set()
    count = 0

    def dfs(node):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)

    for node in range(n):
        if node not in visited:
            count += 1
            dfs(node)

    return count
```

### 4. Topological sort

Order the nodes of a **directed acyclic graph (DAG)** so every edge `u -> v` has `u` appearing before `v`. Kahn's algorithm does this with BFS: repeatedly process nodes whose prerequisites are all satisfied (in-degree `0`).

```python
from collections import deque

def topo_sort_kahn_demo(n, edges):
    graph = {i: [] for i in range(n)}
    indegree = [0] * n
    for u, v in edges:
        graph[u].append(v)
        indegree[v] += 1

    queue = deque([i for i in range(n) if indegree[i] == 0])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    return order if len(order) == n else []  # empty means a cycle exists
```

### 5. Union-Find

Maintain disjoint sets with near-O(1) `find` and `union`, using **path compression** and **union by rank**. The natural tool for "are these connected?" or "would adding this edge create a cycle?" questions on undirected graphs.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [1] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return False  # already connected - this edge would form a cycle
        if self.rank[root_a] < self.rank[root_b]:
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        self.rank[root_a] += self.rank[root_b]
        return True
```

### 6. Shortest path

Plain BFS gives shortest paths in an **unweighted** graph. For **weighted** graphs with non-negative weights, Dijkstra's algorithm uses a min-heap to always expand the currently-closest unfinalized node next.

```python
import heapq

def dijkstra_demo(graph, start):
    # graph: node -> list of (neighbor, weight)
    dist = {start: 0}
    heap = [(0, start)]

    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float("inf")):
            continue  # stale heap entry - a better distance was already found
        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist.get(neighbor, float("inf")):
                dist[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    return dist
```

---

## Practice Problems

### 1. Number of Islands

**Pattern:** DFS + Connected components

**Problem:** Given a 2D grid of `"1"` (land) and `"0"` (water), count the number of islands (land connected 4-directionally).

**Approach:** Scan every cell. Whenever an unvisited land cell is found, that's a new island — DFS outward from it, "sinking" every connected land cell (turning it to water) so it's never counted again.

```python
def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"  # mark visited by sinking it
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                dfs(r, c)
    return count
```

Time: O(rows · cols), Space: O(rows · cols) worst-case recursion depth

---

### 2. Clone Graph

**Pattern:** DFS

**Problem:** Given a reference node in a connected undirected graph, return a deep copy of the entire graph.

**Approach:** DFS from the given node, using a hash map of `original node -> cloned node`. Checking the map before recursing handles both avoiding duplicate clones and safely terminating on cycles.

```python
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors or []

def clone_graph(node):
    if not node:
        return None
    old_to_new = {}

    def dfs(n):
        if n in old_to_new:
            return old_to_new[n]
        copy = Node(n.val)
        old_to_new[n] = copy
        for neighbor in n.neighbors:
            copy.neighbors.append(dfs(neighbor))
        return copy

    return dfs(node)
```

Time: O(V + E), Space: O(V)

---

### 3. Max Area of Island

**Pattern:** DFS + Connected components

**Problem:** Given a grid of `0`s and `1`s, find the area (cell count) of the largest island.

**Approach:** Same DFS-sink technique as Number of Islands, but have `dfs` **return** the size of the region it just sank, and track the maximum across every starting cell.

```python
def max_area_of_island(grid):
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                best = max(best, dfs(r, c))
    return best
```

Time: O(rows · cols), Space: O(rows · cols) worst-case recursion depth

---

### 4. Pacific Atlantic Water Flow

**Pattern:** DFS (multi-source, run backward)

**Problem:** Water flows from a cell to a neighbor of equal or lower height. The Pacific touches the top/left edges, the Atlantic touches the bottom/right edges. Find every cell from which water can reach **both** oceans.

**Approach:** Instead of checking every cell's downhill flow to both oceans (slow), reverse the problem: DFS **outward from every border cell**, moving only to neighbors that are equal or **higher** (i.e., water could have flowed backward from there) — this marks every cell that can reach that ocean. Do this once for the Pacific border and once for the Atlantic border, then intersect the two reachable sets.

```python
def pacific_atlantic(heights):
    if not heights:
        return []
    rows, cols = len(heights), len(heights[0])
    pacific, atlantic = set(), set()

    def dfs(r, c, visited, prev_height):
        if (r, c) in visited or r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if heights[r][c] < prev_height:
            return  # can't have flowed "downhill" backward from a lower cell
        visited.add((r, c))
        dfs(r + 1, c, visited, heights[r][c])
        dfs(r - 1, c, visited, heights[r][c])
        dfs(r, c + 1, visited, heights[r][c])
        dfs(r, c - 1, visited, heights[r][c])

    for c in range(cols):
        dfs(0, c, pacific, heights[0][c])
        dfs(rows - 1, c, atlantic, heights[rows - 1][c])
    for r in range(rows):
        dfs(r, 0, pacific, heights[r][0])
        dfs(r, cols - 1, atlantic, heights[r][cols - 1])

    return [[r, c] for r in range(rows) for c in range(cols) if (r, c) in pacific and (r, c) in atlantic]
```

Time: O(rows · cols), Space: O(rows · cols)

---

### 5. Surrounded Regions

**Pattern:** DFS (multi-source, border-first)

**Problem:** Given a board of `'X'` and `'O'`, flip every region of `'O'`s to `'X'` **unless** it's connected to the border (those regions can't be "surrounded").

**Approach:** DFS from every `'O'` on the border first, marking it and everything connected to it as temporarily "safe." Afterward, any `'O'` left unmarked was never reachable from the border, so it's fully surrounded — flip it to `'X'`. Finally, restore the safe markers back to `'O'`.

```python
def solve(board):
    if not board:
        return
    rows, cols = len(board), len(board[0])

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != "O":
            return
        board[r][c] = "#"  # mark safe (connected to border)
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        dfs(r, 0)
        dfs(r, cols - 1)
    for c in range(cols):
        dfs(0, c)
        dfs(rows - 1, c)

    for r in range(rows):
        for c in range(cols):
            if board[r][c] == "O":
                board[r][c] = "X"   # fully surrounded - capture it
            elif board[r][c] == "#":
                board[r][c] = "O"   # restore safe cells
```

Time: O(rows · cols), Space: O(rows · cols)

---

### 6. Rotting Oranges

**Pattern:** BFS (multi-source)

**Problem:** A grid contains `0` (empty), `1` (fresh orange), `2` (rotten orange). Every minute, each rotten orange rots its fresh neighbors. Return the number of minutes until no fresh oranges remain, or `-1` if that's impossible.

**Approach:** Multi-source BFS — push **every** initially rotten orange into the queue at once, then process the queue **one full level at a time**, where each level corresponds to exactly one minute passing.

```python
from collections import deque

def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]

    while queue and fresh > 0:
        minutes += 1
        for _ in range(len(queue)):  # process exactly one full minute's worth
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))

    return minutes if fresh == 0 else -1
```

Time: O(rows · cols), Space: O(rows · cols)

---

### 7. Course Schedule

**Pattern:** Topological sort (cycle detection)

**Problem:** Given `numCourses` and prerequisite pairs `[a, b]` (must take `b` before `a`), determine whether it's possible to finish all courses.

**Approach:** Build the graph and in-degree counts, then run Kahn's algorithm. If every course can eventually be processed (in-degree reaches `0`), there's no cycle and finishing is possible; if some courses are stuck waiting forever, they're part of a cycle.

```python
from collections import deque

def can_finish(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    indegree = [0] * num_courses
    for a, b in prerequisites:
        graph[b].append(a)
        indegree[a] += 1

    queue = deque([i for i in range(num_courses) if indegree[i] == 0])
    processed = 0

    while queue:
        node = queue.popleft()
        processed += 1
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    return processed == num_courses
```

Time: O(V + E), Space: O(V + E)

---

### 8. Course Schedule II

**Pattern:** Topological sort

**Problem:** Same setup as Course Schedule, but return a **valid order** to complete all courses, or an empty array if impossible.

**Approach:** The exact same Kahn's algorithm — just collect the processing order as the result instead of only counting it.

```python
from collections import deque

def find_order(num_courses, prerequisites):
    graph = {i: [] for i in range(num_courses)}
    indegree = [0] * num_courses
    for a, b in prerequisites:
        graph[b].append(a)
        indegree[a] += 1

    queue = deque([i for i in range(num_courses) if indegree[i] == 0])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    return order if len(order) == num_courses else []
```

Time: O(V + E), Space: O(V + E)

---

### 9. Graph Valid Tree

**Pattern:** Union-Find

**Problem:** Given `n` nodes and a list of undirected edges, determine if they form a valid tree (fully connected, with no cycles).

**Approach:** A valid tree needs **exactly** `n - 1` edges — check that first as a cheap short-circuit. Then union every edge's endpoints: if `union()` ever fails (the endpoints are already connected), that edge closes a cycle, so it can't be a tree.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return False
        self.parent[root_b] = root_a
        return True

def valid_tree(n, edges):
    if len(edges) != n - 1:
        return False  # a tree with n nodes has exactly n-1 edges

    uf = UnionFind(n)
    for a, b in edges:
        if not uf.union(a, b):
            return False  # cycle detected

    return True
```

Time: O(n · α(n)) ≈ O(n), Space: O(n)

---

### 10. Number of Connected Components in an Undirected Graph

**Pattern:** Union-Find + Connected components

**Problem:** Given `n` nodes and a list of undirected edges, return the number of connected components.

**Approach:** Start with `n` separate components (every node isolated). Union every edge's endpoints — each **successful** union merges two components into one, so track a running component count that decrements on every successful merge.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.count = n  # number of components

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return
        self.parent[root_b] = root_a
        self.count -= 1  # two components merged into one

def count_components(n, edges):
    uf = UnionFind(n)
    for a, b in edges:
        uf.union(a, b)
    return uf.count
```

Time: O(n + E · α(n)) ≈ O(n + E), Space: O(n)

---

### 11. Redundant Connection

**Pattern:** Union-Find (cycle detection)

**Problem:** A graph started as a tree and had exactly one extra edge added, creating a single cycle. Find that redundant edge.

**Approach:** Process the edges **in order**, unioning each pair. The very first edge whose `union()` fails — because its two endpoints are already connected — is exactly the edge that closes the cycle, which makes it the redundant one.

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n + 1))

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return False
        self.parent[root_b] = root_a
        return True

def find_redundant_connection(edges):
    uf = UnionFind(len(edges))
    for a, b in edges:
        if not uf.union(a, b):
            return [a, b]  # this edge closes a cycle - it's redundant
    return []
```

Time: O(n · α(n)) ≈ O(n), Space: O(n)

---

### 12. Word Ladder

**Pattern:** BFS shortest path

**Problem:** Given `beginWord`, `endWord`, and a `wordList`, find the length of the shortest transformation sequence from `beginWord` to `endWord`, changing one letter at a time, where every intermediate word must exist in `wordList`. Return `0` if no such sequence exists.

**Approach:** Treat each word as a graph node, with an implicit edge between any two words that differ by exactly one letter. BFS from `beginWord` guarantees the shortest transformation count, since BFS explores in strict order of "number of transformations so far." Generate each word's neighbors on the fly by trying every letter at every position.

```python
from collections import deque

def ladder_length(begin_word, end_word, word_list):
    word_set = set(word_list)
    if end_word not in word_set:
        return 0

    queue = deque([(begin_word, 1)])
    visited = {begin_word}

    while queue:
        word, steps = queue.popleft()
        if word == end_word:
            return steps
        for i in range(len(word)):
            for ch in "abcdefghijklmnopqrstuvwxyz":
                candidate = word[:i] + ch + word[i + 1:]
                if candidate in word_set and candidate not in visited:
                    visited.add(candidate)
                    queue.append((candidate, steps + 1))

    return 0
```

Time: O(n · L² · 26) where n = words, L = word length, Space: O(n · L)

---

### 13. Network Delay Time

**Pattern:** Shortest path (Dijkstra's algorithm)

**Problem:** Given directed weighted edges `times[i] = [u, v, weight]`, a source node `k`, and `n` total nodes, find the time for a signal starting at `k` to reach every node. Return `-1` if some node is unreachable.

**Approach:** Run Dijkstra's algorithm from `k`. The answer is the **largest** shortest distance across all nodes (the last node to receive the signal is what determines total delay) — or `-1` if fewer than `n` nodes ever got reached.

```python
import heapq

def network_delay_time(times, n, k):
    graph = {i: [] for i in range(1, n + 1)}
    for u, v, w in times:
        graph[u].append((v, w))

    dist = {}
    heap = [(0, k)]

    while heap:
        d, node = heapq.heappop(heap)
        if node in dist:
            continue  # already finalized with a shorter or equal distance
        dist[node] = d
        for neighbor, weight in graph[node]:
            if neighbor not in dist:
                heapq.heappush(heap, (d + weight, neighbor))

    return max(dist.values()) if len(dist) == n else -1
```

Time: O(E log V), Space: O(V + E)

---

### 14. Cheapest Flights Within K Stops

**Pattern:** Shortest path (Bellman-Ford-style, with a stop limit)

**Problem:** Given flights `[u, v, price]`, a source `src`, destination `dst`, and `k` (maximum allowed stops), find the cheapest price from `src` to `dst` using at most `k` stops (`k + 1` edges). Return `-1` if impossible.

**Approach:** Plain Dijkstra can pick a path that's cheap but uses **too many** stops, since it only tracks "cheapest to reach this node" without a stop budget. Instead, relax all edges in **rounds**, capped at `k + 1` rounds (one round = one more allowed edge/flight) — this is a distance-limited Bellman-Ford, and using a fresh copy of distances each round prevents a single round from chaining multiple hops together.

```python
def find_cheapest_price(n, flights, src, dst, k):
    dist = [float("inf")] * n
    dist[src] = 0

    for _ in range(k + 1):  # k stops allowed = k+1 edges
        new_dist = dist[:]
        for u, v, price in flights:
            if dist[u] != float("inf") and dist[u] + price < new_dist[v]:
                new_dist[v] = dist[u] + price
        dist = new_dist

    return dist[dst] if dist[dst] != float("inf") else -1

print(find_cheapest_price(4, [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], 0, 3, 1))
# 700
```

Time: O(k · E), Space: O(n)

---

## Must Understand

**When to use BFS vs DFS**
Use **BFS** whenever you need the shortest path in an unweighted graph, or need to process nodes strictly in order of distance from a source — multi-source BFS is exactly this idea applied to several starting points at once (Rotting Oranges, Word Ladder). Use **DFS** when you only need to know reachability/connectivity, need to explore every possible path, or want to compute a property of an entire connected region (Number of Islands, Max Area of Island) — cases where *how* you traverse doesn't matter, only that every reachable node eventually gets visited.

**Visited sets**
They stop infinite loops (unlike trees, graphs can have cycles) and avoid redundant work. The critical detail: mark a node visited **the moment it's added to the frontier** (pushed to the queue/stack, or the instant `dfs()` is called on it) — not only once it's fully processed. Otherwise, especially in BFS, the same node can be discovered and enqueued multiple times by different neighbors before it's ever dequeued and marked.

**Connected components**
Found by scanning every node and, whenever an unvisited one is found, treating it as the seed of a **new** component — a full DFS/BFS from it marks every node in that component visited, so later scanning skips them. Union-Find offers the same information without an explicit traversal: two nodes belong to the same component exactly when `find()` returns the same root for both.

**Cycle detection**
On an **undirected** graph, Union-Find is the cleanest approach: if `union(a, b)` ever fails because `a` and `b` already share a root, the edge `(a, b)` closes a cycle. On a **directed** graph, Union-Find doesn't apply directly since it ignores edge direction — instead, run topological sort (Kahn's algorithm): if not every node can eventually reach in-degree `0` and get processed, the leftover nodes are stuck in a cycle, since a true DAG always has at least one "ready" node (in-degree `0`) to start from.

**Topological sorting**
Only defined for a Directed Acyclic Graph (DAG) — it's an ordering of all nodes where every edge `u -> v` places `u` before `v`. Kahn's algorithm builds it with BFS: repeatedly process nodes with in-degree `0` (no unmet prerequisites), decrementing the in-degree of their neighbors as if that node's edges were removed, and queuing any neighbor whose in-degree just hit `0`. If every node gets processed, the result is a valid ordering; if some are left over, they form a cycle.

**Dijkstra's algorithm**
Finds shortest paths from one source in a graph with **non-negative** edge weights. A min-heap always pops the currently-closest *unfinalized* node next (a greedy choice), and its neighbors' distances are relaxed (updated) if a shorter path through it is found. Once a node is popped, its distance is permanently final — which is exactly why the algorithm breaks with negative weights: a cheaper path discovered later could otherwise undercut a distance that's already been treated as settled.

**Union-Find**
(Also called Disjoint Set Union.) Maintains a collection of disjoint sets with near-O(1) `find(x)` (which set does `x` belong to?) and `union(a, b)` (merge two sets), thanks to **path compression** (every node touched during `find` gets re-pointed straight at the root) and **union by rank/size** (always attach the smaller tree under the larger one's root, keeping the structure shallow). It's the natural fit whenever a problem is fundamentally "are these two things connected?" or "would adding this edge create a cycle?" — without needing to know the actual path between them.
