import Product from "./product";

interface ProductNode {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  price: string;
  type: string;
  // Other properties of the product go here.
}

interface ProductEdge {
  node: ProductNode;
}

interface ProductsProps {
  products: {
    edges: ProductEdge[];
  };
}

const Products = ({ products }: ProductsProps) => {
  // console.log("products page", products);

  return (
    <div className="px-4 py-10 lg:px-6 lg:py-14 mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 lg:mb-14">
        {products?.edges.map((product) => {
          return <Product key={product.node?.id} product={product} />;
        })}
      </div>
    </div>
  );
};

export default Products;
