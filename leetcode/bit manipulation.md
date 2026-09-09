# Bit Manipulation

**Core idea:** Use a number's binary representation directly to solve certain problems in less time or space than the "obvious" approach would need.

---

## Patterns

### 1. XOR

`a ^ a = 0` and `a ^ 0 = a`, and XOR is commutative and associative — so XOR-ing a whole collection together makes every value that appears an **even** number of times cancel out entirely, leaving only what's left unpaired.

```python
def xor_demo(nums):
    result = 0
    for n in nums:
        result ^= n  # pairs cancel out to 0, leaving only the unpaired value
    return result

print(xor_demo([4, 1, 2, 1, 2]))  # 4
```

### 2. Bit counting

Count how many bits are set (`1`) in a number. `n & (n - 1)` clears the **lowest** set bit, so repeating it counts set bits in O(number of set bits) — never needing to check every one of the (up to 32 or 64) bit positions individually.

```python
def count_bits_demo(n):
    count = 0
    while n:
        n &= (n - 1)  # clears the lowest set bit
        count += 1
    return count

print(count_bits_demo(11))  # 3  (11 is 1011 in binary)
```

### 3. Bit masking

Treat an integer's individual bits as a compact array of independent boolean flags — test, set, or clear one specific bit without touching any of the others.

```python
def bit_masking_demo():
    mask = 0
    mask |= (1 << 3)    # set bit 3
    mask |= (1 << 5)    # set bit 5

    is_bit3_set = bool(mask & (1 << 3))  # test bit 3
    mask &= ~(1 << 3)                     # clear bit 3

    return mask, is_bit3_set

print(bit_masking_demo())  # (32, True) - bit 5 remains set (32 = 0b100000)
```

### 4. Shifting

Left shift (`<<`) moves every bit left, equivalent to multiplying by `2` per shift. Right shift (`>>`) moves every bit right, equivalent to a floor division by `2` per shift. Used to build up or peel apart bit patterns one position at a time.

```python
def shifting_demo(n):
    doubled = n << 1   # multiply by 2
    halved = n >> 1     # divide by 2 (floor)
    return doubled, halved

print(shifting_demo(6))  # (12, 3)
```

---

## Practice Problems

### 1. Single Number

**Pattern:** XOR

**Problem:** Given a non-empty array where every element appears twice except one, find the one that appears only once.

**Approach:** XOR every element together. Every value that appears twice cancels itself out (`a ^ a = 0`), and XOR-ing with `0` changes nothing (`a ^ 0 = a`) — so what's left after the whole array is processed is exactly the unpaired value.

```python
def single_number(nums):
    result = 0
    for n in nums:
        result ^= n
    return result

print(single_number([4, 1, 2, 1, 2]))  # 4
```

Time: O(n), Space: O(1)

---

### 2. Number of 1 Bits

**Pattern:** Bit counting

**Problem:** Given an unsigned integer, return the number of `1` bits it has (its Hamming weight).

**Approach:** Repeatedly clear the lowest set bit with `n & (n - 1)`, counting how many times this can be done before `n` reaches `0`.

```python
def hamming_weight(n):
    count = 0
    while n:
        n &= (n - 1)
        count += 1
    return count

print(hamming_weight(11))  # 3  (1011)
```

Time: O(number of set bits), Space: O(1)

---

### 3. Counting Bits

**Pattern:** Bit counting + 1D DP

**Problem:** Given `n`, return an array `ans` where `ans[i]` is the number of `1` bits in `i`, for every `i` from `0` to `n`.

**Approach:** Reuse previous answers instead of recounting from scratch: `ans[i] = ans[i >> 1] + (i & 1)`. Dropping `i`'s lowest bit (`i >> 1`) gives a smaller number whose bit count is already computed; the lowest bit itself just adds `0` or `1` back on top.

```python
def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans

print(count_bits(5))  # [0, 1, 1, 2, 1, 2]
```

Time: O(n), Space: O(n)

---

### 4. Reverse Bits

**Pattern:** Shifting

**Problem:** Reverse the bits of a given 32-bit unsigned integer.

**Approach:** Build the result one bit at a time: take `n`'s lowest bit (`n & 1`) and place it into the result's lowest position, then shift the *result* left to make room for the next bit, and shift `n` right to expose its next bit. After 32 rounds, the bit that started at position 0 has moved to position 31, and vice versa.

```python
def reverse_bits(n):
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)  # place n's lowest bit into result's lowest slot
        n >>= 1
    return result

print(reverse_bits(0b00000010100101000001111010011100))
# 964176192  (0b00111001011110000010100101000000)
```

Time: O(1) — always exactly 32 iterations, Space: O(1)

---

### 5. Missing Number

**Pattern:** XOR

**Problem:** Given an array containing `n` distinct numbers from the range `[0, n]`, find the one number missing from that range.

**Approach:** XOR together every index `0..n` **and** every value in the array. Every number that's actually present cancels with its matching index (`a ^ a = 0`); the one index in `[0, n]` that has no matching array value is exactly what's left over.

```python
def missing_number(nums):
    result = len(nums)  # accounts for index n, which has no corresponding array position
    for i, n in enumerate(nums):
        result ^= i ^ n
    return result

print(missing_number([3, 0, 1]))  # 2
```

Time: O(n), Space: O(1)

---

### 6. Sum of Two Integers

**Pattern:** Bit masking + Shifting

**Problem:** Calculate the sum of two integers `a` and `b` without using the `+` or `-` operators.

**Approach:** XOR gives the sum of two bits **ignoring carries** (`1 ^ 1 = 0`, dropping the carry). AND identifies exactly where a carry is generated, and shifting that left by 1 moves each carry into the correct next position. Repeat `sum = a ^ b`, `carry = (a & b) << 1` — updating `a = sum`, `b = carry` — until there's no carry left. A mask keeps the values within 32-bit bounds, since Python integers don't naturally wrap like they do in other languages.

```python
def get_sum(a, b):
    mask = 0xFFFFFFFF
    while b != 0:
        a, b = (a ^ b) & mask, ((a & b) << 1) & mask
    return a if a <= 0x7FFFFFFF else ~(a ^ mask)

print(get_sum(2, 3))    # 5
print(get_sum(-2, 3))   # 1
```

Time: O(1) — bounded by 32 bit positions, Space: O(1)

---

### 7. Subsets

**Pattern:** Bit masking

**Problem:** Given an array of distinct integers, return all possible subsets. *(Also solved via backtracking in [backtracking.md](backtracking.md) — this is the bitmask-enumeration alternative.)*

**Approach:** Every subset of `n` elements corresponds to a unique `n`-bit number, where bit `i` being `1` means "include `nums[i]`." Iterate every value from `0` to `2^n - 1`, and for each one, check which bits are set to build that particular subset.

```python
def subsets(nums):
    n = len(nums)
    result = []
    for mask in range(1 << n):  # 2^n possible subsets
        subset = [nums[i] for i in range(n) if mask & (1 << i)]
        result.append(subset)
    return result

print(subsets([1, 2, 3]))
# [[], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]]
```

Time: O(n · 2ⁿ), Space: O(n · 2ⁿ)

---

## Must Understand

**XOR properties**
XOR (`^`) is `1` exactly when its two bits **differ**, `0` when they match. The identities that matter most: `a ^ a = 0` (anything XORed with itself cancels completely), `a ^ 0 = a` (identity element, changes nothing), and XOR is both **commutative and associative** (order and grouping don't matter). That last property is exactly why XOR-ing an entire array works regardless of what order duplicate values appear in, and why it can be used to cancel out every paired value and isolate whatever's left unpaired (Single Number, Missing Number).

**AND / OR / XOR**
`AND (&)` is `1` only when **both** bits are `1` — used to test whether a specific bit is set, or to clear bits (combined with a negated mask). `OR (|)` is `1` when **either** bit is `1` — used to set a specific bit without disturbing any others. `XOR (^)` is `1` when **exactly one** bit is `1` — used to toggle a bit, or to find where two values differ. Together, these three operators let any individual bit be tested, set, cleared, or flipped completely independently of every other bit in the same number.

**Left and right shifts**
`n << k` shifts every bit left by `k` positions, filling in zeros on the right — equivalent to multiplying by `2^k`, and it's how `1 << i` becomes a quick way to compute `2^i` directly. `n >> k` shifts every bit right by `k` positions — equivalent to an integer (floor) division by `2^k`, and it's how the lowest bits of a number get peeled off one at a time (Number of 1 Bits, Counting Bits).

**Bit masking**
Using an integer's individual bits as a compact set of independent boolean flags: test bit `i` with `n & (1 << i)`, set bit `i` with `n |= (1 << i)`, clear bit `i` with `n &= ~(1 << i)`. This is exactly what makes bitmask subset enumeration possible — each of the `2^n` numbers from `0` to `2^n - 1` naturally represents one unique combination of "included/excluded" flags across `n` items — and it's also what keeps results within a fixed bit width (like 32 bits) in problems like Sum of Two Integers and Reverse Bits, by ANDing against a fixed mask such as `0xFFFFFFFF`.
