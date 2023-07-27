import {
  Elements,
  PaymentElement,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

const Subscription = () => {
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const userEmail = "nasir@user.com";
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const loadStripeKey = async () => {
      const stripeKey = await loadStripe(
        // for production, use environment variable
        "pk_test_51NXewiDUtY4bydyAI7jUNKkOOIe0bkBKgAFS9MADYjMpUiCHQV7aichlSZmzzCG9Z0t87Tlf3SgKgEc9E1AX6eKW00DmURIwbj"
      );
      setStripePromise(stripeKey);
    };

    loadStripeKey();

    fetch("http://localhost:8000/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: userEmail }),
    }).then(async (resp) => {
      const { clientSecret, status } = await resp.json();

      setClientSecret(clientSecret);
    });
  }, []);

  return (
    <>
      {stripePromise && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | undefined>("");
  const [isPaymentProcessing, setPaymentProcessing] = useState(false);

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setPaymentProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message);
    } else if (paymentIntent.status === "succeeded") {
      setMessage("Payment status: " + paymentIntent.status);
    } else {
      setMessage("Unexpected state");
    }

    setPaymentProcessing(false);
  };

  return (
    <form
      style={{
        display: "block",
        width: "100%",
      }}
      onSubmit={handleForm}
    >
      <div>
        <PaymentElement
          className="card"
          options={{
            fields: {
              billingDetails: { name: "auto", email: "auto", address: "auto" },
            },
          }}
        />
        <button className="pay-button" disabled={isPaymentProcessing}>
          {isPaymentProcessing ? "Loading..." : "Pay"}
        </button>

        {message && <span id="payment-message">{message}</span>}
      </div>
    </form>
  );
}

export default Subscription;
