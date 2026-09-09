# Tries

**Core idea:** Store many strings by their shared prefixes, so common prefixes are only stored once.

---

## Patterns

### 1. Prefix search

Each node is reached by a path of edges spelling out a prefix from the root. Walking the trie character by character checks whether that prefix exists at all.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def insert_demo(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = TrieNode()
        node = node.children[ch]
    node.is_end = True

def starts_with_demo(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return True  # every character had a path - the prefix exists
```

### 2. Word search

The same trie also answers "is this a *complete* word?" — not just "does this prefix exist?" — by checking the `is_end` flag at the final node, instead of only checking that the path exists.

```python
def search_demo(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return node.is_end  # path exists AND it's marked as a complete word
```

### 3. Trie + DFS

Combine a trie with a DFS over a grid, string, or set of branching choices. The trie lets the DFS **prune early**: the moment the current path stops matching any word in the trie, that whole branch can be abandoned.

```python
def trie_dfs_demo(root, board):
    rows, cols = len(board), len(board[0])
    found = set()

    def dfs(r, c, node, path):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        ch = board[r][c]
        if ch not in node.children:
            return  # prune - no word in the trie continues with this letter

        next_node = node.children[ch]
        path += ch
        if next_node.is_end:
            found.add(path)

        temp = board[r][c]
        board[r][c] = "#"
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            dfs(r + dr, c + dc, next_node, path)
        board[r][c] = temp

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root, "")
    return found
```

---

## Practice Problems

### 1. Implement Trie (Prefix Tree)

**Pattern:** Prefix search

**Problem:** Implement a trie with `insert(word)`, `search(word)`, and `startsWith(prefix)`.

**Approach:** Each node holds a dictionary of children and an `is_end` flag. `insert` walks/creates a path of nodes per character. `search` requires the full path to exist **and** `is_end` to be `True` at the end. `startsWith` only requires the path to exist.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True

trie = Trie()
trie.insert("apple")
print(trie.search("apple"))     # True
print(trie.search("app"))       # False - "app" was never inserted as a complete word
print(trie.starts_with("app"))  # True - "app" is a valid prefix
```

Time: O(L) per operation (L = word/prefix length), Space: O(total characters inserted)

---

### 2. Design Add and Search Words Data Structure

**Pattern:** Trie + DFS

**Problem:** Implement `addWord(word)` and `search(word)`, where `search` may contain `.` as a wildcard matching any single letter.

**Approach:** Insertion is identical to a normal trie. For `search`, DFS through the trie: on a regular letter, follow that one specific child; on `.`, branch into **every** child at that level, since the wildcard could match any of them.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def add_word(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.is_end
            ch = word[i]
            if ch == ".":
                return any(dfs(child, i + 1) for child in node.children.values())
            if ch not in node.children:
                return False
            return dfs(node.children[ch], i + 1)

        return dfs(self.root, 0)

wd = WordDictionary()
wd.add_word("bad")
wd.add_word("dad")
wd.add_word("mad")
print(wd.search("pad"))  # False
print(wd.search(".ad"))  # True
print(wd.search("b.."))  # True
```

Time: O(L) best case, O(26^L) worst case (all wildcards), Space: O(total characters inserted)

---

### 3. Word Search II

**Pattern:** Trie + DFS

**Problem:** Given a board of letters and a list of words, return every word that can be formed by moving to adjacent cells (as in Word Search), without reusing a cell.

**Approach:** Build **one** trie containing all the target words, then run a single DFS pass over the board (from every starting cell), walking the trie in lockstep with the board path. This shares work across all words at once, and the moment the current path isn't a prefix of *any* word, that branch is pruned immediately.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None  # holds the complete word at the node where it ends

def find_words(board, words):
    root = TrieNode()
    for word in words:
        node = root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.word = word

    rows, cols = len(board), len(board[0])
    result = set()

    def dfs(r, c, node):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        ch = board[r][c]
        if ch == "#" or ch not in node.children:
            return  # prune - out of bounds, visited, or no word continues this way

        next_node = node.children[ch]
        if next_node.word:
            result.add(next_node.word)

        board[r][c] = "#"
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            dfs(r + dr, c + dc, next_node)
        board[r][c] = ch

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)

    return list(result)

print(find_words(
    [["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]],
    ["oath", "pea", "eat", "rain"],
))
# ["oath", "eat"]
```

Time: O(rows · cols · 4^L), Space: O(total characters across words)

---

### 4. Replace Words

**Pattern:** Prefix search

**Problem:** Given a dictionary of word "roots" and a sentence, replace every word in the sentence with the **shortest** root that is a prefix of it (if one exists). Return the modified sentence.

**Approach:** Insert every root into a trie. For each word in the sentence, walk the trie one character at a time — stop and return the prefix seen so far the **instant** a node marked `is_end` is reached (that's guaranteed to be the shortest matching root, since it's the first one hit while walking down). If the trie path runs out with no `is_end` found, no root matches — keep the original word.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def replace_words(roots, sentence):
    root = TrieNode()
    for r in roots:
        node = root
        for ch in r:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def find_root(word):
        node = root
        for i, ch in enumerate(word):
            if ch not in node.children:
                return word          # no matching root - keep original word
            node = node.children[ch]
            if node.is_end:
                return word[:i + 1]  # shortest matching root found
        return word

    return " ".join(find_root(w) for w in sentence.split())

print(replace_words(["cat", "bat", "rat"], "the cattle was rattled by the battery"))
# "the cat was rat by the bat"
```

Time: O(total characters in sentence), Space: O(total characters in roots)

---

### 5. Longest Word in Dictionary

**Pattern:** Prefix search

**Problem:** Given a list of words, find the longest word that can be built one character at a time, where **every prefix** of it (of every length) is also a complete word in the list. Return the lexicographically smallest word if there's a tie.

**Approach:** Insert every word into a trie, marking `is_end`. Then DFS the trie, but only step into a child if that child is **itself** marked `is_end` — this directly enforces "every prefix along the way must also be a real word." Visiting children in sorted order naturally produces the lexicographically smallest result on ties.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

def longest_word(words):
    root = TrieNode()
    for w in words:
        node = root
        for ch in w:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    best = ""

    def dfs(node, path):
        nonlocal best
        if len(path) > len(best) or (len(path) == len(best) and path < best):
            best = path
        for ch in sorted(node.children):
            child = node.children[ch]
            if child.is_end:  # only continue if this prefix is itself a complete word
                dfs(child, path + ch)

    dfs(root, "")
    return best

print(longest_word(["w", "wo", "wor", "worl", "world"]))  # "world"
```

Time: O(total characters across all words), Space: O(total characters across all words)

---

## Must Understand

**Why tries are useful**
A trie stores many strings by their **shared prefixes**, so a common prefix used by many words only exists once in the structure instead of being duplicated in every one of them. This makes prefix-related questions — *does any word start with X? what's the shortest/longest matching root?* — far cheaper than scanning a plain list of strings, and it lets many words be searched for **simultaneously in a single traversal** (Word Search II), instead of one full board scan per word.

**How nodes represent characters**
Technically, it's the **edges** that represent characters — a node is reached by following a specific path of edges from the root, and that path spells out a prefix. A node also carries a marker (commonly `is_end`, or a stored value like the completed word itself) recording whether the prefix leading to it is also a **complete word** in the set. Without that marker, there'd be no way to tell "this is a real, complete word" apart from "this is merely a prefix that some longer word happens to pass through."

**Prefix lookup complexity**
Checking whether a prefix (or word) of length `L` exists takes **O(L)** — completely independent of how many words are stored — because each character requires exactly one dictionary/array lookup to move to the next node. This beats scanning a list of `n` words directly (O(n · L) in the worst case) whenever many prefix queries are run against the same fixed set of words: the trie costs O(total characters across all words) to build once, and then answers each individual query in O(L).
