import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";

import { client } from "../lib/apolloClient";
import { AuthProvider } from "../hooks/useAuth";
import { CartProvider } from "../components/cart/CartContext";
import { useEffect } from "react";

import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import("preline");
  }, []);
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
