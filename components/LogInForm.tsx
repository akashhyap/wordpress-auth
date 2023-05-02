import Link from "next/link";
import { useMutation, gql } from "@apollo/client";
import Cookies from 'js-cookie';
import { GET_USER } from "../hooks/useAuth";
import { useCart, CartItem } from "./cart/CartContext";
import { useAddToCart } from "../hooks/useAddToCart";

const LOG_IN = gql`
  mutation logIn($login: String!, $password: String!) {
    loginWithCookies(input: {
      login: $login
      password: $password
    }) {
      status
    }
  }
`;

export default function LogInForm() {
  const { updateCartData, setUserLoggedIn, setCartItems } = useCart();
  const addToCart = useAddToCart();
  // LogInForm component

  const [logIn, { loading, error }] = useMutation(LOG_IN, {
    refetchQueries: [
      { query: GET_USER }
    ],
    async onCompleted() {
      // Merge local storage cart items with server-side cart items
      const localCartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      if (localCartItems.length) {
        await Promise.all(
          localCartItems.map(async (item: CartItem) => {
            await addToCart(parseInt(item.product.node.id), item.quantity);
          })
        );
        // Clear local storage cart items after merging
        localStorage.removeItem("cartItems");
      }

      // Update cart data after login
      await updateCartData();
    },
  });


  const errorMessage = error?.message || '';
  const isEmailValid =
    !errorMessage.includes('empty_email') &&
    !errorMessage.includes('empty_username') &&
    !errorMessage.includes('invalid_email') &&
    !errorMessage.includes('invalid_username');
  const isPasswordValid =
    !errorMessage.includes('empty_password') &&
    !errorMessage.includes('incorrect_password');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const { email, password } = Object.fromEntries(data);
    logIn({
      variables: {
        login: email,
        password,
      }
    }).catch(error => {
      console.error(error);
    });
  }

  return (
    <form method="post" onSubmit={handleSubmit}>
      <fieldset disabled={loading}>
        <label htmlFor="log-in-email">Email</label>
        <input
          id="log-in-email"
          type="email"
          name="email"
          autoComplete="username"
          required
        />
        <label htmlFor="log-in-password">Password</label>
        <input
          id="log-in-password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
        <Link href="/forgot-password">
          <a className="forgot-password-link">Forgot password?</a>
        </Link>
        {!isEmailValid ? (
          <p className="error-message">Invalid email. Please try again.</p>
        ) : null}
        {!isPasswordValid ? (
          <p className="error-message">Invalid password. Please try again.</p>
        ) : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </fieldset>
      <p className="account-sign-up-message">
        Don&#39;t have an account yet?{' '}
        <Link href="/sign-up">
          <a>Sign up</a>
        </Link>
      </p>
    </form>
  );
}
