import { useState, useEffect } from 'react';
import { useCart, CartItem } from './CartContext';
import { client } from '../../lib/apolloClient';
import {
    FETCH_CART_ITEMS,
    UPDATE_CART_ITEM,
    REMOVE_CART_ITEM,
    CLEAR_CART,
} from '../../lib/apiService';

import { v4 } from "uuid";
import CheckoutButton from './CartButton';
import Cookies from 'js-cookie';

type CartProduct = {
    id: string;
    name: string;
    price: string;
};

const CartItems = () => {
    const { cartItems, setCartItems, userLoggedIn, updateCartData, cartCount, setCartCount, removeItem } = useCart();
    const [fetchedCartItems, setFetchedCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const fetchCartItems = async () => {
            const { data } = await client.query({ query: FETCH_CART_ITEMS });
            console.log("Server cart items:", data.cart.contents.nodes);
            if (userLoggedIn) {
                await updateCartData();
                setFetchedCartItems(data.cart.contents.nodes);
            } else {
                setFetchedCartItems(cartItems);
            }
        };
        if (userLoggedIn) {
            fetchCartItems();
        } else {
            setFetchedCartItems(cartItems);
        }
    }, [setFetchedCartItems, userLoggedIn, cartItems, updateCartData]);


    const handleIncrement = async (itemId: string) => {
        const item = fetchedCartItems.find((item) => item.key === itemId);
      
        if (!item) return;
        const { data } = await client.mutate({
          mutation: UPDATE_CART_ITEM,
          variables: { items: itemId, quantity: item.quantity + 1 },
        });
      
        const updatedItems = fetchedCartItems.map((item) =>
          item.key === itemId
            ? {
                ...item,
                quantity: data.updateItemQuantities.items[0].quantity,
                subtotal: data.updateItemQuantities.items[0].subtotal.replace("$", ""),
              }
            : item
        );
      
        setFetchedCartItems(updatedItems);
        if (!userLoggedIn) {
          setCartItems(updatedItems);
        }
      };
      
      const handleDecrement = async (itemId: string) => {
        const item = fetchedCartItems.find((item) => item.key === itemId);
        if (!item || item.quantity <= 1) return;
        const { data } = await client.mutate({
          mutation: UPDATE_CART_ITEM,
          variables: { items: itemId, quantity: item.quantity - 1 },
        });
      
        const updatedItems = fetchedCartItems.map((item) =>
          item.key === itemId
            ? {
                ...item,
                quantity: data.updateItemQuantities.items[0].quantity,
                subtotal: data.updateItemQuantities.items[0].subtotal.replace("$", ""),
              }
            : item
        );
      
        setFetchedCartItems(updatedItems);
        if (!userLoggedIn) {
          setCartItems(updatedItems);
        }
      };
      

    // const { removeItem } = useCart();

    const handleDelete = async (itemId: string) => {
        await client
            .mutate({
                mutation: REMOVE_CART_ITEM,
                variables: { cartKey: itemId },
            })
            .catch((error) => {
                console.error("Error while deleting item:", error);
            });
        setFetchedCartItems((prevItems) => prevItems.filter((item) => item.key !== itemId));
        removeItem(itemId);
    };


    // const { setCartCount } = useCart();

    const handleClearCart = async () => {
        if (userLoggedIn) {
            const cartItemKeys = fetchedCartItems.map((item) => item.key);

            // Debug logs
            console.log("fetchedCartItems:", fetchedCartItems);
            console.log("cartItemKeys:", cartItemKeys);

            if (cartItemKeys.length === 0) {
                console.log("No items in cart to remove.");
                return;
            }

            try {
                const { data } = await client.mutate({
                    mutation: CLEAR_CART,
                    variables: {
                        input: {
                            clientMutationId: v4(),
                            keys: cartItemKeys,
                        },
                    },
                });

                // Debug log
                console.log("Mutation response:", data);

                setFetchedCartItems([]);
                setCartCount(0);
            } catch (error) {
                console.error("Error clearing cart:", error);
            }
        } else {
            // Clear the local cart for non-logged-in users
            setFetchedCartItems([]);
            setCartItems([]);
            setCartCount(0);
        }
    };


    return (
        <div>
            {fetchedCartItems.length > 0 ? (<div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fetchedCartItems.map((item) => (
                            <tr key={item.key}>
                                <td>{item.product.node.name}</td>
                                <td>{item.quantity}</td>
                                <td>${item.subtotal}</td>
                                <td>
                                    <button onClick={() => handleIncrement(item.key)}>+</button>
                                    <button onClick={() => handleDecrement(item.key)}>-</button>
                                    <button onClick={() => handleDelete(item.key)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={handleClearCart}>Clear Cart</button>
                <CheckoutButton />
            </div>) : (
                <p>No items in the Cart</p>
            )}
        </div>
    );
};

export default CartItems;
