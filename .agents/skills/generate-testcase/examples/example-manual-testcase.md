# Example Manual Test Case: Apply Discount to Order

**Summary:** Ensure that a valid percentage discount is applied correctly to an eligible order according to domain rules.

## 1. 5W1H
- **Who:** The Buyer
- **What:** Applying a 10% discount to their shopping cart.
- **When:** During checkout, before payment confirmation.
- **Where:** Checkout page / API `POST /api/v1/orders/{orderId}/apply-discount`.
- **Why:** To verify that the domain logic correctly reduces the total amount constraint, while keeping the shipping fee separate.
- **How:** Send a request with a valid `discountCode` and verify that the `totalAmount` is reduced by exactly 10%, whereas `shippingFee` remains unchanged.

## 2. Steps
1. Create an active discount in Seller Center with `code: "SAVE10"` and `percentage: 10`.
2. As a Buyer, place an item worth `100.00` in the cart.
3. Call `POST /api/v1/orders/{orderId}/apply-discount` with the `discountCode`.
4. Verify response returns `status: "SUCCESS"` and the total amount is `90.00`.
5. Verify the shipping fee is not affected by this discount algorithm.
