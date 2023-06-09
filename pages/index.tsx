import Head from 'next/head';
import { gql, useQuery } from "@apollo/client";

import styles from '../styles/Home.module.css';
import Layout from "../components/Layout";
import { client } from '../lib/apolloClient';

import Products from '../components/products';
import { GET_SITE_LOGO, PRODUCT_QUERY } from '../lib/graphql';

type Product = {
  id: string;
  slug: string;
  name: string;
  type: string;
  databaseId: number;
  shortDescription: string;
  image: {
    id: string;
    sourceUrl: string;
    altText: string;
  };
  onSale: boolean;
  stockStatus: string;
  price: string;
  regularPrice: string;
  salePrice: string;
};

type HomeProps = {
  products: {
    edges: {
      node: Product;
    }[];
  };
  siteLogo: string;
};
export default function Home({ products, siteLogo }: HomeProps) {
  // console.log("products",products);

  return (
    <Layout siteLogo={siteLogo}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Salvia Extract
        </h1>
        <Products products={products} />
      </main>
    </Layout>
  )
}


export async function getStaticProps() {
  // Execute both queries concurrently using Promise.all
  const [productsResponse, siteLogoResponse] = await Promise.all([
    client.query({ query: PRODUCT_QUERY }),
    client.query({ query: GET_SITE_LOGO }),
  ]);

  const products = { edges: productsResponse?.data?.products?.edges || [] };
  const siteLogo = siteLogoResponse?.data?.getHeader?.siteLogoUrl;

  return {
    props: {
      products,
      siteLogo,
    },
    revalidate: 1,
  };
}
