import { useState, useEffect } from "react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [images, setImages] = useState([]); // ✅ Store up to 4 files
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from API
    fetch("https://www.thriftify.website/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Get all selected files
    if (files.length > 4) {
      alert("You can only upload up to 4 images.");
      return;
    }
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock_quantity", stockQuantity);

    // Append up to 4 images
    images.forEach((imageFile) => {
      formData.append("images[]", imageFile);
    });

    // Append categories
    selectedCategories.forEach((category) =>
      formData.append("categories[]", category)
    );

    try {
      const response = await fetch(
        "https://www.thriftify.website/api/products",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Product added successfully!");
        setName("");
        setDescription("");
        setPrice("");
        setStockQuantity("");
        setImages([]);
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
          <label className="form-label">Images (up to 4)</label>
          <input
            type="file"
            className="form-control"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          {images.length > 0 && (
            <p className="mt-2 text-muted">
              {images.length} image(s) selected.
            </p>
          )}
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
