const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51NXewiDUtY4bydyAh46169Q7QhwWjjitSVqbpwITCZlAajmxYVfiFnXGy7gAIOJ9kFad4nrsWCjdSkysnya7Ltxp00gHZYPRB7"
);
// acct_1NXewiDUtY4bydyA
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

app.get("/config", (req, res) => {
  res.json({
    publishableKey:
      "pk_test_51NXewiDUtY4bydyAI7jUNKkOOIe0bkBKgAFS9MADYjMpUiCHQV7aichlSZmzzCG9Z0t87Tlf3SgKgEc9E1AX6eKW00DmURIwbj",
  });
});

app.post("/pay", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 5000,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    // Verify your integration in this guide by including this parameter
    // metadata: { integration_check: "accept_a_payment" },
    // receipt_email: email,
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

app.post("/sub", async (req, res) => {
  const { email, payment_method } = req.body;

  const customer = await createUser(email);

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: "plan_G......" }],
    expand: ["latest_invoice.payment_intent"],
  });

  const status = subscription["latest_invoice"]["payment_intent"]["status"];
  const client_secret =
    subscription["latest_invoice"]["payment_intent"]["client_secret"];

  res.json({ client_secret: client_secret, status: status });
});

async function createUser(email) {
  const user = await stripe.customers.list({ email });
  console.log("create user", user);
  if (user) return user;

  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });
  console.log("create customer", customer);

  return customer;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
