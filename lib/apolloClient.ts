import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
  credentials: 'include',
});

const middleware = new ApolloLink((operation, forward) => {
  let session: any = null;

  if (typeof window !== "undefined") {
    session = localStorage.getItem("woo-session");
  }

  if (session) {
    operation.setContext(({ headers = {} }) => {
      return {
        headers: {
          ...headers,
          "woocommerce-session": `Session ${session}`,
        },
      };
    });
  }

  return forward(operation);
});

const afterware = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    if (typeof window === "undefined") {
      return response;
    }

    const context = operation.getContext();
    const { response: { headers } } = context;
    const session = headers.get("woocommerce-session");

    if (session) {
      if ("false" === session) {
        localStorage.removeItem("woo-session");
      } else if (localStorage.getItem("woo-session") !== session) {
        localStorage.setItem("woo-session", headers.get("woocommerce-session"));
      }
    }

    return response;
  });
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: middleware.concat(afterware.concat(httpLink)),
});
