import { gql, useMutation } from '@apollo/client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { FETCH_CART_ITEMS, MERGE_CART_MUTATION } from '../../lib/apiService';
import { client } from '../../lib/apolloClient';

export interface CartItem {
  key: string;
  product: {
    node: {
      id: string;
      name: string;
      type: string;
      onSale: boolean;
      stockStatus: string;
      price: any;
      simpleProduct?: {
        price: number;
        regularPrice: number;
        salePrice: number;
      };
      variableProduct?: {
        price: number;
        regularPrice: number;
        salePrice: number;
      };
    };
  };
  variation: {
    node: {
      id: string;
      variationId: number;
      name: string;
      description: string;
      type: string;
      onSale: boolean;
      price: number;
      regularPrice: number;
      salePrice: number;
    };
    attributes: {
      id: string;
      attributeId: string;
      name: string;
      value: string;
    }[];
  } | null;
  quantity: number;
  subtotal?: number;
}

interface CartContextData {
  cartCount: number;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addItem: (item: CartItem) => void;
  userLoggedIn: boolean;
  setUserLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  updateCartData: () => Promise<void>;
  removeItem: (itemKey: string) => void;
  cartTotal: number;
  setCartTotal: React.Dispatch<React.SetStateAction<number>>;
}

// Utility function to calculate the subtotal for an item
const calculateItemSubtotal = (item: CartItem): number => {
  if (item.product.node.type === "simple") {
    return parseFloat(item.product.node.simpleProduct?.price.toFixed(2) || "0") * item.quantity;
  } else if (item.product.node.type === "variable") {
    return parseFloat(item.variation?.node.price.toFixed(2) || "0") * item.quantity;
  }
  return 0;
};


const CartContext = createContext<CartContextData | undefined>(undefined);

async function fetchCartDataFromServer(): Promise<CartItem[]> {
  try {
    const { data } = await client.query({ query: FETCH_CART_ITEMS });
    const fetchedCartItems: CartItem[] = data.cart.contents.nodes.map((item: any) => ({
      key: item.key,
      product: {
        node: {
          id: item.product.node.id,
          name: item.product.node.name,
          type: item.product.node.__typename,
          simpleProduct: item.product.node.__typename === 'SimpleProduct'
            ? {
              price: parseFloat(item.product.node.price),
              regularPrice: parseFloat(item.product.node.regularPrice),
              salePrice: parseFloat(item.product.node.salePrice),
            }
            : undefined,
          variableProduct: item.product.node.__typename === 'VariableProduct'
            ? {
              price: parseFloat(item.product.node.price),
              regularPrice: parseFloat(item.product.node.regularPrice),
              salePrice: parseFloat(item.product.node.salePrice),
            }
            : undefined,
        },
      },
      quantity: item.quantity,
      subtotal: calculateItemSubtotal({
        ...item,
        quantity: item.quantity,
      }),
    }));
    return fetchedCartItems;
  } catch (error) {
    console.error('Failed to fetch cart items:', error);
    throw error;
  }
}

async function mergeCartData(localCartItems: CartItem[], fetchedCartItems: CartItem[]) {
  try {
    const mergedCartItems: CartItem[] = [...fetchedCartItems];

    localCartItems.forEach((localItem) => {
      const existingItemIndex = mergedCartItems.findIndex(
        (mergedItem) => mergedItem.product.node.id === localItem.product.node.id
      );

      if (existingItemIndex !== -1) {
        mergedCartItems[existingItemIndex].quantity += localItem.quantity;
        mergedCartItems[existingItemIndex].subtotal =
          (mergedCartItems[existingItemIndex]?.subtotal || 0) +
          (localItem.subtotal || 0);
      } else {
        mergedCartItems.push(localItem);
      }
    });

    return mergedCartItems;
  } catch (error) {
    console.error('Failed to merge cart items:', error);
    throw error;
  }
}

const initialCartItems = () => {
  if (typeof window !== "undefined") {
    const items = localStorage.getItem("cartItems");
    return items ? JSON.parse(items) : [];
  } else {
    return [];
  }
};

export const CartProvider: React.FC = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems") || "[]")
      : [];
    const storedCartCount = storedCartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    if (storedCartItems.length) setCartItems(storedCartItems);
    if (storedCartCount) setCartCount(storedCartCount);
  }, []);

  useEffect(() => {
    Cookies.set('cartItems', JSON.stringify(cartItems), { expires: 7 });
    Cookies.set('cartCount', JSON.stringify(cartCount), { expires: 7 });
  }, [cartItems, cartCount]);

  useEffect(() => {
    const updatedCartTotal = cartItems.reduce((total, item) => total + (item.subtotal || 0), 0);
    setCartTotal(updatedCartTotal);
  }, [cartItems]);

  useEffect(() => {
    if (typeof window !== "undefined" && !userLoggedIn) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, userLoggedIn]);

  const addItem = (item: CartItem) => {
    setCartItems((prevItems) => {

      const itemIndex = prevItems.findIndex(
        (existingItem) => existingItem.key === item.key
      );

      var itemSubtotal = 0;
      console.log("item node", item.product);

      if (item.product.node.type === "SIMPLE") {
        console.log("parseFloat(item.product.node.simpleProduct?.price.toFixed(2))", item.product.node?.price.replace('$', ''));
        itemSubtotal = parseFloat(item.product.node.price.replace('$', ''));
      } else if (item.product.node.type === "VARIABLE") {
        console.log("variable context", item.variation?.node.price);
        itemSubtotal = parseFloat(item.variation?.node.price.replace("$", ""));
      }

      if (itemIndex !== -1) {
        // Update the existing item's quantity and subtotal
        const updatedItems = [...prevItems];
        updatedItems[itemIndex].quantity += item.quantity;
        updatedItems[itemIndex].subtotal = itemSubtotal * Number(updatedItems[itemIndex].quantity);

        console.log("updatedItems ", updatedItems);
        console.log("updatedItems[itemIndex].subtotal ", updatedItems[itemIndex].subtotal);
        console.log("updatedItems[itemIndex] ", updatedItems[itemIndex]);
        console.log("Number(updatedItems[itemIndex].quantity ", Number(updatedItems[itemIndex].quantity));
        console.log("itemSubtotal ", itemSubtotal);

        // Update the cart count
        setCartCount((prevCount) => prevCount + item.quantity);
        return updatedItems;
      } else {
        // Add the new item to the cart
        const newItem = { ...item, subtotal: itemSubtotal };

        // Update the cart count
        setCartCount((prevCount) => prevCount + item.quantity);

        return [...prevItems, newItem];
      }
    });
  };

  const updateCartData = async () => {
    if (!userLoggedIn) return;

    try {
      // Fetch cart data from the server for the logged-in user.
      const fetchedCartItems = await fetchCartDataFromServer();

      // Merge it with the local cart data, and update the state and cookies.
      const mergedCartItems = await mergeCartData(cartItems, fetchedCartItems);

      // Update the state with the merged cart items.
      setCartItems(mergedCartItems);

      // Update the cart count.
      const updatedCartCount = mergedCartItems.reduce((total, item) => total + item.quantity, 0);
      setCartCount(updatedCartCount);

      Cookies.remove('cartItems');
      Cookies.remove('cartCount');

    } catch (error) {
      console.error("Failed to update cart data:", error);
    }
  };

  const removeItem = (itemKey: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.key !== itemKey));
  };

  useEffect(() => {
    const updatedCartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(updatedCartCount);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        cartItems,
        setCartItems,
        addItem,
        userLoggedIn,
        setUserLoggedIn,
        updateCartData,
        removeItem,
        cartTotal,
        setCartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
