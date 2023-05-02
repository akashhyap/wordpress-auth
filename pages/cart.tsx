import React from 'react';
import CartItems from '../components/cart/CartItems';
import Layout from '../components/Layout';

const CartPage = () => {
  return (
    <Layout>
      <h1>Cart</h1>
      <CartItems />
    </Layout>
  );
};

export default CartPage;