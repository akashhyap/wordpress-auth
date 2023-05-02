import { gql } from '@apollo/client';

export const GET_SITE_LOGO = gql`
  query GetSiteLogo {
    getHeader {
      siteLogoUrl
    }
  }
`;

export const PRODUCT_QUERY = gql`
  query {
    products(first: 10) {
      edges {
        node {
          id
          slug
          name
          type
          databaseId
          shortDescription
          image {
            id
            sourceUrl
            altText
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
    }
  }
`;