import Image from "next/image";
import Link from "next/link";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useCart } from "../cart/CartContext";

type ProductNode = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  price: string;
  type: string;
};

type ProductProps = {
  product: {
    node: ProductNode;
  };
};

const Product: React.FC<ProductProps> = ({ product }) => {
  console.log("product::", product);

  const addToCart = useAddToCart();
  const { addItem, cartCount, setCartCount, cartItems, setCartItems } = useCart();

  const handleAddToCart = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    try {
      const productId = product.node.databaseId;
      if (!productId) {
        console.error('Product ID is null or undefined');
        return;
      }
      console.log('Product ID:', productId);
      const cartItem = await addToCart(productId, null);
      // console.log("Cart item from addToCart:", cartItem);
      // Use the addItem function from CartContext
      addItem(cartItem);
      // setCartCount((prevCount: number) => prevCount + cartItem.quantity);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  return (
    <div className="border border-slate-900 rounded-md overflow-hidden">
     {product.node?.image && <Link href={`/products/${product.node.slug}`} legacyBehavior>
        <a>
          <figure className="relative pt-[85%]">
            <Image
              src={product.node?.image?.sourceUrl ?? ""}
              alt="Image product"
              layout="fill"
              sizes="(max-width: 768px) 100%,
              (max-width: 1200px) 50%,
              33vw"
            />
          </figure>
        </a>
      </Link>}
      <div className="p-4">
        <h2 className="text-xl py-2">
          <Link href={`/products/${product.node.slug}`} legacyBehavior>
            {product.node.name}
          </Link>
        </h2>
        <p className="py-2">{product.node.price}</p>

        {product.node?.type !== "VARIABLE" ? (
          <button
            className="px-3 py-1 rounded-sm mr-3 text-sm border-solid border border-current hover:bg-slate-900 hover:text-white hover:border-slate-900"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        ) : (
          <Link href={`/products/${product.node?.slug}`} legacyBehavior>
            <a className="px-3 py-1 rounded-sm mr-3 text-sm border-solid border border-current hover:bg-slate-900 hover:text-white hover:border-slate-900">
              Select Option
            </a>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Product;
