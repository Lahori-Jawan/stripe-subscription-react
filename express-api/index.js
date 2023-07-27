const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51NXewiDUtY4bydyAh46169Q7QhwWjjitSVqbpwITCZlAajmxYVfiFnXGy7gAIOJ9kFad4nrsWCjdSkysnya7Ltxp00gHZYPRB7"
);
// acct_1NXewiDUtY4bydyA
const port = 8000;

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

app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  const customer = await findOrCreateUser(email);
  const priceId = "price_1NXfPHDUtY4bydyA4coy5sBu"; // Influencer Product
  console.log({ priceId, customer });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    // items: [{ plan: "plan_G......" }],
    items: [
      {
        price: priceId,
      },
    ],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });

  const status = subscription.latest_invoice.payment_intent.status;
  const client_secret =
    subscription["latest_invoice"]["payment_intent"]["client_secret"];
  console.log({ status, client_secret });
  res.json({
    clientSecret: client_secret,
    status: status,
  });
});

async function findOrCreateUser(email) {
  const { data = [] } = await stripe.customers.list({ email });

  if (data.length > 0) return data[0];

  const customer = await stripe.customers.create({
    // payment_method: payment_method,
    email: email,
    // invoice_settings: {
    //   default_payment_method: payment_method,
    // },
  });

  return customer;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
