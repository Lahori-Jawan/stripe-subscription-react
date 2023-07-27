import "./App.css";
// import OneTimePay from "./components/OneTimePay";
import Subscription from "./components/Subscriptions";

function App() {
  return (
    <>
      <div>
        <h3>
          Stripe Payment i.e. <code>One time</code>, <code>Subscription</code>
        </h3>
        {/* <OneTimePay /> */}
        <Subscription />
      </div>
    </>
  );
}

export default App;
