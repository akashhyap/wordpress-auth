import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import atob from "atob";
import Cookies from 'js-cookie';

const GET_CUSTOMER_DATA = gql`
  query GetCustomerData {
    customer {
      id
    }
  }
`;

const CheckoutButton: React.FC = () => {
  const [session, setSession] = useState<string | null>(null);
  const { loading, error, data } = useQuery(GET_CUSTOMER_DATA);

  useEffect(() => {
    if (!loading && !error && data?.customer?.id) {
      // Check if the customer ID is in the correct format
      if (/^data:customer/.test(data.customer.id)) {
        try {
          const decodedCustomerId = atob(data.customer.id);
          const customerId = parseInt(decodedCustomerId.replace("customer:", ""), 10);
          setSession(customerId.toString());
        } catch (error) {
          console.error("Error decoding customer ID:", error);
        }
      } else {
        console.error("Invalid customer ID format:", data.customer.id);
      }
    }
  }, [loading, error, data]);
  

  const loggedInCookieName = `wordpress_logged_in_${process.env.NEXT_PUBLIC_COOKIE_HASH}`;
  const loggedInCookieValue = Cookies.get(loggedInCookieName);

  const checkoutLink = () => {
    console.log("session id:", session);
    console.log("authToken:", loggedInCookieValue);

    window.open(`https://woocommerce-186938-3327038.cloudwaysapps.com/checkout?session_id=${session}`);
  };

  return <button onClick={() => checkoutLink()}>Checkout</button>;
};

export default CheckoutButton;
