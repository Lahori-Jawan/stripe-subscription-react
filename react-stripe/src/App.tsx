import "./App.css";
import StripeSubscriptions from "./components/Subscriptions";

function App() {
  return (
    <>
      <div>
        <h3>
          Stripe Payment i.e. <code>One time</code>, <code>Subscription</code>
        </h3>
        <StripeSubscriptions />
      </div>
    </>
  );
}

export default App;
