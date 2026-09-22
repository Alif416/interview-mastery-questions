# Classes & OOP

You don't need to become an OOP expert specifically for React, but understanding TypeScript classes matters for backend work and for reading most real-world codebases.

*Note: the original list included a bare "access modifiers?" bullet alongside public/private/protected — folded into those three questions below rather than given its own separate heading.*

## 1. How do you type class properties?

Declare each property with a name and type annotation, optionally with a default value — similar to typing a variable, but as a member of the class.

```ts
class User {
  id: number;
  name: string;
}
```

---

## 2. How do you type a constructor?

Type each constructor parameter like a normal function parameter. In TypeScript, prefixing a constructor parameter with an access modifier (`public`, `private`, `protected`, or `readonly`) automatically declares it as a class property **and** assigns it, without needing a separate property declaration or assignment line.

```ts
class User {
  constructor(public id: number, public name: string) {}
  // equivalent to declaring id/name as properties AND writing this.id = id; this.name = name;
}

const u = new User(1, "Alex");
```

---

## 3. What does `public` mean?

`public` — the default access modifier, even if omitted — means a property or method can be accessed from anywhere: inside the class, from a subclass, or from outside code holding an instance. It's the least restrictive of the three access modifiers.

---

## 4. What does `private` mean?

`private` restricts a property or method so it can only be accessed from *within that exact class* — not from subclasses, and not from outside code. This is a compile-time-only restriction (there's a separate, true-runtime-private `#field` syntax in modern JavaScript, which TypeScript also supports).

```ts
class BankAccount {
  private balance = 0;

  deposit(amount: number) {
    this.balance += amount; // fine - accessed from within the class
  }
}

const acc = new BankAccount();
// acc.balance; // error - 'balance' is private
```

---

## 5. What does `protected` mean?

`protected` sits between `public` and `private` — accessible within the class itself and within any subclass that extends it, but not from outside code holding an instance.

```ts
class Animal {
  protected name: string;
  constructor(name: string) { this.name = name; }
}

class Dog extends Animal {
  bark() {
    return `${this.name} says Woof!`; // fine - protected is accessible in a subclass
  }
}

// new Dog("Rex").name; // error - 'name' is protected
```

---

## 6. What does `readonly` mean on a class property?

Same idea as on a plain object type — it prevents the property from being reassigned after it's initially set (in its declaration or the constructor), catching accidental mutation of a value meant to stay fixed for the lifetime of the instance.

```ts
class User {
  readonly id: number;
  constructor(id: number) { this.id = id; } // allowed - initial assignment
}

const u = new User(1);
// u.id = 2; // error - cannot assign to read-only property
```

---

## 7. What does `implements` do?

`implements` declares that a class must satisfy a particular interface's shape — TypeScript checks that the class actually provides every property and method the interface requires, functioning as an explicit contract check.

```ts
interface Printable {
  print(): void;
}

class Report implements Printable {
  print() { console.log("Printing report..."); } // required by Printable
}
```

---

## 8. What does `extends` do for classes?

`extends` sets up class inheritance — a subclass inherits all the properties and methods of its parent class, can override them, and can add new ones of its own.

```ts
class Animal {
  move() { return "Moving..."; }
}

class Dog extends Animal {
  bark() { return "Woof!"; }
}

const d = new Dog();
d.move(); // inherited from Animal
d.bark(); // defined on Dog
```

---

## 9. What is an `abstract` class?

An abstract class can't be instantiated directly — `new AbstractClass()` is an error — it exists only to be extended, and it can declare `abstract` methods that have no implementation, forcing every subclass to provide one.

```ts
abstract class Shape {
  abstract area(): number; // no implementation - subclasses must provide one
}

class Circle extends Shape {
  constructor(private radius: number) { super(); }
  area() { return Math.PI * this.radius ** 2; } // required implementation
}

// new Shape(); // error - cannot create an instance of an abstract class
```

---

## 10. What's the difference between an abstract class and an interface?

An interface is purely a compile-time shape check with zero runtime presence — it can't contain actual implementation code. An abstract class is a real class: it can hold actual implemented methods and shared state alongside abstract, unimplemented ones. Since JavaScript classes only support single inheritance, a class can `extend` only one abstract class, but can `implements` as many interfaces as needed.
