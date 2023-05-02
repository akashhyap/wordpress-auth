// hooks/useAddToCart.ts
import { gql, useMutation } from '@apollo/client';
import { useCart } from '../components/cart/CartContext';
import { v4 } from "uuid";
import { Product, Variation } from "../pages/products/[slug]"
const ADD_TO_CART_MUTATION = gql`
mutation AddToCart($productId: Int!, $variationId: Int, $quantity: Int!) {
  addToCart(input: {productId: $productId, variationId: $variationId, quantity: $quantity}) {
    cartItem {
      key
      product {
        node {
          id
          databaseId
          name
          description
          type
          onSale
          slug
          averageRating
          reviewCount
          image {
            id
            sourceUrl
            altText
          }
          galleryImages {
            nodes {
              id
              sourceUrl
              altText
            }
          }
          ... on SimpleProduct {
            onSale
            stockStatus
            price
            regularPrice
            salePrice
          }
          ... on VariableProduct {
            onSale
            stockStatus
            price
            regularPrice
            salePrice
          }
        }
      }
      variation {
        node {
          id
          variationId: databaseId
          name
          description
          type
          onSale
          price
          regularPrice
          salePrice
          image {
            id
            sourceUrl
            altText
          }
        }
        attributes {
          id
          attributeId
          name
          value
        }
      }
      quantity
      total
      subtotal
      subtotalTax
    }
  }
}
`;

export const useAddToCart = () => {
  const [addToCartMutation] = useMutation(ADD_TO_CART_MUTATION);

  const addToCart = async (productId: number | null | undefined, selectedVariation: Variation | null | undefined, quantity = 1) => {
    if (!productId) {
      console.error("ProductId is null or undefined");
      return;
    }
    const productQryInput = {
      clientMutationId: v4(),
      productId: selectedVariation
        ? selectedVariation.databaseId
        : productId,
      variationId: selectedVariation ? selectedVariation.databaseId : null,
    };

    try {
      const { data } = await addToCartMutation({
        variables: {
          productId: productQryInput.productId,
          variationId: productQryInput.variationId,
          quantity,
        },
      });

      const cartItem = data.addToCart.cartItem;
      cartItem.quantity = quantity;
      return cartItem;
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      throw error;
    }
  };


  return addToCart;
};