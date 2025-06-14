import { useState, useEffect } from "react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from API
    fetch("https://www.thriftify.website:8000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]); // Store file object
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock_quantity", stockQuantity);
    formData.append("image", image); // Append image file
    selectedCategories.forEach((category) =>
      formData.append("categories[]", category)
    );

    try {
      const response = await fetch("http://127.0.0.1:8000/api/products", {
        method: "POST",
        headers: {
          Accept: "application/json", // ✅ This ensures Laravel returns JSON
        },
        body: formData, // Send form data
      });

      const data = await response.json();
      if (response.ok) {
        alert("Product added successfully!");
        setName("");
        setDescription("");
        setPrice("");
        setStockQuantity("");
        setImage(null);
        setSelectedCategories([]);
      } else {
        alert(`Error: ${data.message || "Failed to add product"}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Stock Quantity</label>
          <input
            type="number"
            className="form-control"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Categories</label>
          <select
            className="form-control"
            multiple
            value={selectedCategories}
            onChange={(e) =>
              setSelectedCategories(
                [...e.target.selectedOptions].map((option) => option.value)
              )
            }
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Add Product
        </button>
      </form>
    </div>
  );
}
