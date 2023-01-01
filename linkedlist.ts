export interface ListNode<E> {
  next: ListNode<E>;
  value: E;
}

export class LinkedList<E> {
  head: ListNode<E> | null = null;
  tail: ListNode<E> | null = null;

  public static fromArray = <T>(arr: T[]): LinkedList<T> => {
    const list = new LinkedList<T>();

    for (const val of arr) {
      list.append(val);
    }

    return list;
  };

  get length(): number {
    let count = 0;

    for (const _ of this.values()) {
      count++;
    }

    return count;
  }

  public values = (): Generator<E, undefined> => {
    const head = this.head;
    let node = head;

    return (function* () {
      while (node != null) {
        console.log(`node ${node.value} (${node.next.value})`);
        yield node.value;
        node = node.next;

        if (node === head) {
          break;
        }
      }

      return undefined;
    })();
  };

  public toArray = (): E[] => {
    const arr: E[] = [];

    for (const val of this.values()) {
      console.log(val);
      arr.push(val);
    }

    return arr;
  };

  public append = (value: E): ListNode<E> => {
    const node = { value, next: this.head } as ListNode<E>;

    if (!this.head || !this.tail) {
      this.head = node;
      node.next = node;
    } else {
      this.tail.next = node;
    }

    this.tail = node;

    return node;
  };

  public findNode = (test: (value: E) => boolean): ListNode<E> | null => {
    let node = this.head;

    while (node != null) {
      if (test(node.value)) {
        return node;
      }

      node = node.next;
      if (node === this.head) {
        break;
      }
    }

    return null;
  };
}
