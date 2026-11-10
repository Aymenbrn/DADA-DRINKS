import test from "node:test";
import assert from "node:assert/strict";
import {
  products,
  sanitizeCart,
  cartTotal,
  cartCount,
  formatMoney,
} from "../public/catalog.js";

test("catalog only includes seven verified pack prices and unique IDs", () => {
  assert.equal(products.length, 7);
  assert.equal(new Set(products.map((p) => p.id)).size, 7);
  assert.ok(products.every((p) => p.price === 3200));
});
test("cart totals use cents and count packs, including mixed flavors", () => {
  assert.equal(cartTotal({ mangue: 2, cola: 1 }), 9600);
  assert.equal(cartCount({ mangue: 2, cola: 1 }), 3);
  assert.equal(cartTotal({}), 0);
});
test("invalid stored carts, unknown products, and quantities cannot corrupt totals", () => {
  for (const value of [null, false, [], "invalid", 32])
    assert.deepEqual(sanitizeCart(value), {});
  assert.deepEqual(
    sanitizeCart({
      mangue: -1,
      cola: "2",
      unknown: 5,
      cerise: 2.5,
      lemon: Infinity,
    }),
    {},
  );
  assert.deepEqual(sanitizeCart({ mangue: 99, cola: 0, lemon: 2 }), {
    mangue: 24,
    lemon: 2,
  });
  assert.equal(cartTotal({ mangue: 99, unknown: 10 }), 76800);
});
test("French money formatting", () => {
  assert.match(formatMoney(3200), /32,00\s€/);
});
