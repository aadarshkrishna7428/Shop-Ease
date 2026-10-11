"use strict";

// ===============================
// CONFIGURATION
// ===============================

const CONFIG = {
    currency: "USD",
    taxRate: 0.08
};

// ===============================
// PRODUCT CATALOG
// ===============================

const PRODUCTS = [
    {
        id: 1,
        name: "Wireless Headphones",
        description: "Comfortable headphones with rich sound.",
        price: 49.99,
        emoji: "🎧"
    },
    {
        id: 2,
        name: "Smart Watch",
        description: "Track your daily activities in style.",
        price: 79.99,
        emoji: "⌚"
    },
    {
        id: 3,
        name: "Laptop Backpack",
        description: "Carry your laptop and essentials.",
        price: 34.99,
        emoji: "🎒"
    },
    {
        id: 4,
        name: "Bluetooth Speaker",
        description: "Enjoy music wherever you go.",
        price: 29.99,
        emoji: "🔊"
    },
    {
        id: 5,
        name: "Wireless Mouse",
        description: "Smooth and comfortable control.",
        price: 19.99,
        emoji: "🖱️"
    },
    {
        id: 6,
        name: "Mechanical Keyboard",
        description: "A great keyboard for work and gaming.",
        price: 59.99,
        emoji: "⌨️"
    },
    {
        id: 7,
        name: "Phone Stand",
        description: "Keep your phone upright on your desk.",
        price: 12.99,
        emoji: "📱"
    },
    {
        id: 8,
        name: "USB-C Charger",
        description: "A compact charger for your devices.",
        price: 24.99,
        emoji: "🔌"
    }
];

// SAVE10: 10% discount
// EXTRA15: 15% discount on orders of $100 or more

const DISCOUNTS = {
    SAVE10: {
        percentage: 10,
        minimum: 0
    },
    EXTRA15: {
        percentage: 15,
        minimum: 100
    }
};

// ===============================
// APPLICATION STATE
// ===============================

let cart = loadCart();
let appliedDiscount = null;

// ===============================
// HELPER FUNCTIONS
// ===============================

function formatPrice(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: CONFIG.currency
    }).format(amount);
}

function findProduct(productId) {
    return PRODUCTS.find(function (product) {
        return product.id === Number(productId);
    });
}

function readOrders() {
    try {
        const saved = localStorage.getItem("shopEaseOrders");

        if (!saved) {
            return [];
        }

        const orders = JSON.parse(saved);

        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        console.error("Unable to load orders:", error);
        return [];
    }
}

// ===============================
// LOAD AND SAVE CART
// ===============================

function loadCart() {
    try {
        const saved = localStorage.getItem("shopEaseCart");

        if (!saved) {
            return {};
        }

        const parsed = JSON.parse(saved);

        if (
            parsed === null ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return {};
        }

        const validCart = {};

        Object.keys(parsed).forEach(function (id) {
            const product = findProduct(id);
            const quantity = Number(parsed[id]);

            if (
                product &&
                Number.isSafeInteger(quantity) &&
                quantity > 0
            ) {
                validCart[product.id] = quantity;
            }
        });

        return validCart;
    } catch (error) {
        console.error("Unable to load cart:", error);
        return {};
    }
}

function saveCart() {
    try {
        localStorage.setItem(
            "shopEaseCart",
            JSON.stringify(cart)
        );

        return true;
    } catch (error) {
        console.error("Unable to save cart:", error);
        return false;
    }
}

// ===============================
// DISPLAY PRODUCTS
// ===============================

function renderProducts() {
    const productList = document.getElementById("product-list");

    if (!productList) {
        console.error("Product catalog element is missing.");
        return;
    }

    productList.innerHTML = "";

    PRODUCTS.forEach(function (product) {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("div");
        image.className = "product-image";
        image.setAttribute("role", "img");
        image.setAttribute("aria-label", product.name);
        image.textContent = product.emoji;

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = product.description;

        const bottom = document.createElement("div");
        bottom.className = "product-bottom";

        const price = document.createElement("span");
        price.className = "product-price";
        price.textContent = formatPrice(product.price);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "add-button";
        button.textContent = "Add to Cart";

        button.addEventListener("click", function () {
            addToCart(product.id);
        });

        bottom.appendChild(price);
        bottom.appendChild(button);

        info.appendChild(name);
        info.appendChild(description);
        info.appendChild(bottom);

        card.appendChild(image);
        card.appendChild(info);

        productList.appendChild(card);
    });
}

// ===============================
// ADD PRODUCT TO CART
// ===============================

function addToCart(productId) {
    const product = findProduct(productId);

    if (!product) {
        return;
    }

    if (!cart[product.id]) {
        cart[product.id] = 0;
    }

    cart[product.id]++;

    saveCart();
    renderCart();
}

// ===============================
// CHANGE PRODUCT QUANTITY
// ===============================

function changeQuantity(productId, amount) {
    const id = Number(productId);

    if (!cart[id]) {
        return;
    }

    cart[id] += amount;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    saveCart();
    renderCart();
}

// ===============================
// REMOVE PRODUCT
// ===============================

function removeFromCart(productId) {
    delete cart[Number(productId)];

    saveCart();
    renderCart();
}

// ===============================
// GET CART ITEMS
// ===============================

function getCartItems() {
    return Object.keys(cart)
        .map(function (id) {
            const product = findProduct(id);

            if (!product) {
                return null;
            }

            return {
                ...product,
                quantity: cart[id]
            };
        })
        .filter(function (item) {
            return item !== null;
        });
}

// ===============================
// CALCULATE ORDER TOTALS
// ===============================

function calculateTotals() {
    const items = getCartItems();

    let subtotal = 0;
    let itemCount = 0;

    items.forEach(function (item) {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;
    });

    let discountAmount = 0;

    if (appliedDiscount && DISCOUNTS[appliedDiscount]) {
        const discount = DISCOUNTS[appliedDiscount];

        if (subtotal >= discount.minimum) {
            discountAmount =
                subtotal * discount.percentage / 100;
        }
    }

    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * CONFIG.taxRate;
    const total = discountedSubtotal + tax;

    return {
        subtotal: subtotal,
        discount: discountAmount,
        tax: tax,
        total: total,
        itemCount: itemCount
    };
}

// ===============================
// DISPLAY CART
// ===============================

function renderCart() {
    const cartContainer = document.getElementById("cart-items");

    if (!cartContainer) {
        console.error("Cart element is missing.");
        return;
    }

    cartContainer.innerHTML = "";

    const items = getCartItems();

    if (items.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent =
            "Your cart is empty. Start shopping!";

        cartContainer.appendChild(emptyMessage);
    }

    items.forEach(function (item) {
        const row = document.createElement("article");
        row.className = "cart-item";

        const details = document.createElement("div");

        const name = document.createElement("p");
        name.className = "cart-product-name";
        name.textContent = item.emoji + " " + item.name;

        const price = document.createElement("p");
        price.className = "cart-product-price";
        price.textContent = formatPrice(item.price) + " each";

        details.appendChild(name);
        details.appendChild(price);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.textContent = "−";
        decrease.setAttribute(
            "aria-label",
            "Decrease " + item.name + " quantity"
        );

        decrease.addEventListener("click", function () {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.className = "quantity-number";
        quantity.textContent = item.quantity;

        const increase = document.createElement("button");
        increase.type = "button";
        increase.textContent = "+";
        increase.setAttribute(
            "aria-label",
            "Increase " + item.name + " quantity"
        );

        increase.addEventListener("click", function () {
            changeQuantity(item.id, 1);
        });

        controls.appendChild(decrease);
        controls.appendChild(quantity);
        controls.appendChild(increase);

        const end = document.createElement("div");
        end.className = "cart-item-end";

        const lineTotal = document.createElement("p");
        lineTotal.className = "line-total";
        lineTotal.textContent = formatPrice(
            item.price * item.quantity
        );

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-button";
        remove.textContent = "Remove";

        remove.addEventListener("click", function () {
            removeFromCart(item.id);
        });

        end.appendChild(lineTotal);
        end.appendChild(remove);

        row.appendChild(details);
        row.appendChild(controls);
        row.appendChild(end);

        cartContainer.appendChild(row);
    });

    renderTotals();
}

// ===============================
// DISPLAY TOTALS
// ===============================

function renderTotals() {
    const totals = calculateTotals();

    const subtotal = document.getElementById("subtotal");
    const discount = document.getElementById("discount");
    const tax = document.getElementById("tax");
    const total = document.getElementById("total");
    const cartCount = document.getElementById("cart-count");

    if (subtotal) {
        subtotal.textContent = formatPrice(totals.subtotal);
    }

    if (discount) {
        discount.textContent = "-" + formatPrice(totals.discount);
    }

    if (tax) {
        tax.textContent = formatPrice(totals.tax);
    }

    if (total) {
        total.textContent = formatPrice(totals.total);
    }

    if (cartCount) {
        cartCount.textContent = totals.itemCount;
    }
}

// ===============================
// APPLY DISCOUNT CODE
// ===============================

function applyDiscount() {
    const input = document.getElementById("discount-code");
    const message = document.getElementById("discount-message");

    if (!input || !message) {
        return;
    }

    const code = input.value.trim().toUpperCase();
    const subtotal = calculateTotals().subtotal;

    if (code === "") {
        appliedDiscount = null;
        message.textContent = "Please enter a discount code.";
        renderTotals();
        return;
    }

    if (!DISCOUNTS[code]) {
        appliedDiscount = null;
        message.textContent = "Invalid code. Try SAVE10 or EXTRA15.";
        renderTotals();
        return;
    }

    if (subtotal < DISCOUNTS[code].minimum) {
        appliedDiscount = null;
        message.textContent =
            "Your subtotal must be at least " +
            formatPrice(DISCOUNTS[code].minimum) +
            " for this code.";

        renderTotals();
        return;
    }

    appliedDiscount = code;
    message.textContent = code + " applied successfully!";

    renderTotals();
}

// ===============================
// PLACE DEMO ORDER
// ===============================

function checkout() {
    const totals = calculateTotals();

    if (totals.itemCount === 0) {
        alert("Your cart is empty. Add a product first.");
        return;
    }

    const order = {
        id: "ORD-" + Date.now(),
        date: new Date().toLocaleString(),
        items: getCartItems().map(function (item) {
            return {
                id: item.id,
                name: item.name,
                emoji: item.emoji,
                price: item.price,
                quantity: item.quantity
            };
        }),
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        status: "Order Placed"
    };

    let orders = readOrders();
    orders.unshift(order);

    try {
        localStorage.setItem(
            "shopEaseOrders",
            JSON.stringify(orders)
        );
    } catch (error) {
        console.error("Unable to save order:", error);
        alert("Could not save your order. Please check browser storage.");
        return;
    }

    cart = {};
    appliedDiscount = null;

    if (!saveCart()) {
        alert(
            "Your order was saved, but the cart could not be cleared from browser storage."
        );
    }

    const discountInput = document.getElementById("discount-code");
    const discountMessage = document.getElementById("discount-message");

    if (discountInput) {
        discountInput.value = "";
    }

    if (discountMessage) {
        discountMessage.textContent = "";
    }

    renderCart();
    renderOrders();

    alert(
        "Demo order placed successfully!\nOrder ID: " + order.id
    );

    document.getElementById("orders").scrollIntoView({
        behavior: "smooth"
    });
}

// ===============================
// DISPLAY ORDER HISTORY
// ===============================

function renderOrders() {
    const ordersList = document.getElementById("orders-list");

    if (!ordersList) {
        return;
    }

    const orders = readOrders();

    ordersList.innerHTML = "";

    if (orders.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-cart";
        message.textContent = "You haven't placed any orders yet.";

        ordersList.appendChild(message);
        return;
    }

    orders.forEach(function (order) {
        const card = document.createElement("article");
        card.className = "order-card";

        const header = document.createElement("div");
        header.className = "order-card-header";

        const headingArea = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = "Order " + order.id;

        const date = document.createElement("p");
        date.textContent = "Placed on: " + order.date;

        headingArea.appendChild(heading);
        headingArea.appendChild(date);

        const status = document.createElement("span");
        status.className = "order-status";
        status.textContent = order.status || "Order Placed";

        header.appendChild(headingArea);
        header.appendChild(status);

        const productsHeading = document.createElement("p");
        productsHeading.textContent = "Products ordered:";

        const itemsList = document.createElement("ul");
        itemsList.className = "order-products";

        (order.items || []).forEach(function (item) {
            const listItem = document.createElement("li");

            listItem.textContent =
                (item.emoji || "🛍️") + " " +
                item.name + " × " + item.quantity +
                " — " +
                formatPrice(item.price * item.quantity);

            itemsList.appendChild(listItem);
        });

        const subtotal = document.createElement("p");
        subtotal.textContent =
            "Subtotal: " + formatPrice(Number(order.subtotal) || 0);

        const discount = document.createElement("p");
        discount.textContent =
            "Discount: -" + formatPrice(Number(order.discount) || 0);

        const tax = document.createElement("p");
        tax.textContent =
            "Tax: " + formatPrice(Number(order.tax) || 0);

        const total = document.createElement("p");
        total.className = "order-total";
        total.textContent =
            "Order Total: " + formatPrice(Number(order.total) || 0);

        card.appendChild(header);
        card.appendChild(productsHeading);
        card.appendChild(itemsList);
        card.appendChild(subtotal);
        card.appendChild(discount);
        card.appendChild(tax);
        card.appendChild(total);

        ordersList.appendChild(card);
    });
}

// ===============================
// INITIALIZE WEBSITE
// ===============================

document.addEventListener("DOMContentLoaded", function () {
    renderProducts();
    renderCart();
    renderOrders();

    const applyButton = document.getElementById("apply-discount");

    if (applyButton) {
        applyButton.addEventListener("click", applyDiscount);
    }

    const discountInput = document.getElementById("discount-code");

    if (discountInput) {
        discountInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                applyDiscount();
            }
        });
    }

    const checkoutButton = document.getElementById("checkout-button");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", checkout);
    }

    const ordersButton = document.getElementById("orders-button");

    if (ordersButton) {
        ordersButton.addEventListener("click", function () {
            renderOrders();

            document.getElementById("orders").scrollIntoView({
                behavior: "smooth"
            });
        });
    }
});