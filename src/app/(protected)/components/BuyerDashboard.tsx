"use client";
import { useState } from "react";
import "./buyer.css";
import { toast } from "react-toastify";
interface FarmerDashboardProps {
  onSearchResults: (results: any[]) => void;
}
const BuyerDashboard: React.FC<FarmerDashboardProps> = ({
  onSearchResults,
}) => {
  const [formData, setFormData] = useState({
    category: "",
    paymentTerms: "", // Default to first enum value
    location: "",
  });

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const payload = {
    ...formData,
    userType: "buyer",
  };

  // console.log(payload);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await response.json();
      onSearchResults(data);
      console.log("Form submitted successfully:", data[0]);
      toast.success("Form submitted successfully!")

      // Optionally, reset form after successful submission
    } catch (error: any) {
      toast.error("Error submitting form:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="text-black">
        <div className="section" id="searchection">
          <h1 className="search-profile">Search Potential Farmers</h1>
          <div className="form-group text-black">
            <label htmlFor="category">Category:</label>
            {/* <select
              id="category"
              name="category" // Added name attribute
              className="select2"
              onChange={handleChange}
            >
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Wheat">Wheat</option>
            </select> */}
            <input
              type="text"
              id="category"
              onChange={handleChange}
              name="category" // Added name attribute
              placeholder="Search by Crop name"
            />
          </div>
          <div className="form-group  text-black">
            <label htmlFor="paymentTerms">Payment Terms:</label>
            <select
              id="paymentTerms"
              name="paymentTerms" // Added name attribute
              className="select2"
              onChange={handleChange}
              value={formData.paymentTerms}
            >
              <option value="Cash">Cash</option>
              <option value="Credit">UPI</option>
              <option value="Installments">Installments</option>
            </select>
          </div>
          <div className="form-group  text-black">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location" // Added name attribute
              onChange={handleChange}
              placeholder="Search by city"
            />
          </div>
          <div className="div text-center">
            <button id="searchBtn" type="submit">
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BuyerDashboard;
