import React from "react";
// import { useParams } from "react-router-dom";
import ProductDetails from "../components/ProductDetails/ProductDetails";
// import ReviewList from "../components/ProductDetails/ReviewList";

const ProductDetailsPage = () => {
  //   const { id } = useParams();

  return (
    <div className="mt-5">
      <ProductDetails />
      {/* <ReviewList productId={id} />  */}
    </div>
  );
};

export default ProductDetailsPage;
