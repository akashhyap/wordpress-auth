import Cookies from 'js-cookie';

export const getCartData = () => {
  const cartData = Cookies.get('cartData');

  if (!cartData) {
    return null;
  }

  try {
    return JSON.parse(cartData);
  } catch (error) {
    console.error('Error parsing cart data from cookies:', error);
    return null;
  }
};

export const saveCartData = (data: any) => {
  try {
    Cookies.set('cartData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cart data to cookies:', error);
  }
};
