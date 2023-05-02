import { gql, useQuery } from "@apollo/client";
import atob from "atob";
import Layout from "../components/Layout";
import AuthContent from "../components/AuthContent";
import { useEffect, useState } from "react";
import { client } from "../lib/apolloClient";


const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($customerId: Int) {
    customer(customerId: $customerId) {
      email
      id
      orders {
        nodes {
          id
          orderKey
          date
          total
          status
          billing {
            firstName
            lastName
            company
            address1
            address2
            city
            state
            postcode
            country
            email
            phone
          }
          customer {
            id
          }
        }
      }
    }
  }
`;

export default function MembersContent() {
  const [customerId, setCustomerId] = useState<any | null>(null);

  const decodeCustomerId = (encodedCustomerId: string | null) => {
    if (!encodedCustomerId) {
      return null;
    }
    try {
      const decodedCustomerId = atob(encodedCustomerId);
      return parseInt(decodedCustomerId.replace("customer:", ""), 10);
    } catch (error) {
      console.error("Failed to decode customerId:", error);
      return null;
    }
  };
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      const { data } = await client.query({ query: GET_CUSTOMER_ORDERS });
      console.log("data", data);

      const decodedCustomerId = decodeCustomerId(data?.customer?.id);

      // Set the decoded customerId to the state
      setCustomerId(decodedCustomerId);

    };

    fetchCustomerData();
  }, []);

  // const customerId = 15;
  const { loading, error, data } = useQuery(GET_CUSTOMER_ORDERS, {
    variables: { customerId },
    skip: !customerId,
  });

  console.log("customerId", customerId);

  return (
    <Layout>
      <h1>Members</h1>
      <AuthContent>
        <p>Here is some top-secret members-only content!</p>
        {data?.customer.orders.nodes.map((order: any) => (
          <div key={order.id}>
            <h2>Order ID: {order.id}</h2>
            <h3>Total: {order.total}</h3>

            <h2>Billing Address</h2>
            <p>Name: {order.billing.firstName} {order.billing.lastName}</p>
            <p>{order.billing.address1}</p>
            <p>{order.billing.address2}</p>
            {/* <ul>
              {order.lineItems.nodes.map((item) => (
                <li key={item.product.id}>
                  {item.product.name} (Qty: {item.quantity})
                </li>
              ))}
            </ul> */}
          </div>
        ))}
      </AuthContent>
    </Layout>
  );
}
