// services/apiService.ts

import { gql } from '@apollo/client';
import { client } from './apolloClient';

// Fetch cart items
export const FETCH_CART_ITEMS = gql`
    query GetCartItems {
        cart {
        contents {
            nodes {
            key
            product {
                node {
                id
                name
                ... on SimpleProduct {
                    databaseId
                    price
                    name   
                }
                ... on VariableProduct {
                    databaseId
                    price           
                    name
                }
                }
            }
            quantity
            subtotal
            }
        }
        }
    }
`;

// Update cart item quantity
export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItemQuantities($items: ID!,  $quantity: Int!) {
    updateItemQuantities(input: {items: {key: $items, quantity: $quantity}}) {
      items {
        key
        quantity
        subtotal
      }
    }
  }
`;


// Remove cart item
export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($cartKey: [ID]) {
    removeItemsFromCart(input: { keys: $cartKey}) {
      cartItems {
        key
      }
    }
  }
`;

// Clear cart
export const CLEAR_CART = gql`
  mutation CLEAR_CART_MUTATION( $input: RemoveItemsFromCartInput! ) {
    removeItemsFromCart(input: $input) {
      cartItems {
        quantity
      }
    }
  }
`;

// Define the MERGE_CART_MUTATION

const MERGE_CART_MUTATION = gql`
  mutation MergeCart($cartItems: [CartItemInput!]!) {
    mergeCart(input: { cartItems: $cartItems }) {
      cartItems {
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

