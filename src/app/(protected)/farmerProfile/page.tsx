"use client";

import React, { useState, useEffect } from "react";
// import "../components/buyer.css";
import "@/components/styles/p1b.css";
import "@/components/styles/p1a.css";
import "@/components/styles/p1c.css";
import FDash from "../components/FDash";
import Link from "next/link";
import { toast } from "react-toastify";

const BuyerProfile = () => {
  const [formData, setFormData] = useState({
    profilePic:
      "https://img.freepik.com/premium-vector/silver-membership-icon-default-avatar-profile-icon-membership-icon-social-media-user-image-vector-illustration_561158-4215.jpg?size=626&ext=jpg&ga=GA1.1.1974988790.1724696296&semt=ais_hybrid",

    username: "John Doe",
    email: "john.doe@example.com",
    category: "",
    paymentTerms: "Cash",
    location: "",
    address: "",
    startingMonth: "january",
    endingMonth: "january",

    description: "",
  });

  const [error, setError] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [ongoingContracts, setOngoingContracts] = useState([]);

  const [completedContracts, setCompletedContracts] = useState([]);
  const [dloading, setDLoading] = useState(false);
  const [cloading, setCLoading] = useState(false);

  const signContract = async (fileId: string | undefined) => {
    try {
      const contractId = fileId;
      const response = await fetch(`/api/contract/signContract`, {
        method: "PUT",
        body: JSON.stringify({ contractId }),
      });


      if (!response.ok) {
        throw new Error("Error signing contract");
      }

      toast.success("Contract signed successfully!");
    } catch (error: any) {
      toast.error("Error signing contract:", error);
    } finally {
    }
  };

  const downloadPdf = async (fileName: string) => {
    setDLoading(true);
    try {
      console.log(`Downloading ${fileName}`);
      // Fetch the presigned URL from your backend API
      const response = await fetch(`/api/contract/download/${fileName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();

      const presignedUrl = JSON.parse(JSON.stringify(res)).presignedUrl;

      console.log(presignedUrl);
      if (presignedUrl) {
        // Create a temporary link to trigger the download
        const link = document.createElement("a");
        link.href = presignedUrl;
        link.setAttribute("download", fileName); // Set the 'download' attribute for the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up
      }
    } catch (error: any) {
      toast.error("Error downloading PDF:", error);
    } finally {
      setDLoading(false);
    }
  };
  const cancelContract = async (fileName: string) => {
    setCLoading(true);
    try {
      // Fetch the presigned URL from your backend API
      const response = await fetch(`/api/contract/cancel/${fileName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      });

      const res = await response.json();

      toast.success("Contract cancelled successfully!");
    } catch (error: any) {
      toast.error("Error canceling contract:", error);
    } finally {
      setCLoading(false);
    }
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch("/api/farmerProfile");
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        const data = await response.json();
        console.log(data.document);
        setFormData({
          profilePic:
            "https://img.freepik.com/premium-vector/silver-membership-icon-default-avatar-profile-icon-membership-icon-social-media-user-image-vector-illustration_561158-4215.jpg?size=626&ext=jpg&ga=GA1.1.1974988790.1724696296&semt=ais_hybrid",

          username: data.name,
          email: data.email,
          category: data.document.category || "",
          paymentTerms: data.document.paymentTerms || "Cash",
          location: data.document.location || "",
          address: data.document.address || "",
          startingMonth: data.document.startingMonth || "january",
          endingMonth: data.document.endingMonth || "january",

          description: data.document.description || "",
        });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchContracts = async () => {
      const response = await fetch("/api/contract/getContracts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }

      const data = await response.json();

      setOngoingContracts(data.contracts.ongoingContracts);
      setCompletedContracts(data.contracts.completedContracts);
      setContracts(data.contracts);

    };

    fetchDocument();
    fetchContracts();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/updateBuyerProfile", {
        method: "PUT",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await response.json();
      console.log("Form submitted successfully:", data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center text-center">
        Loading...
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <div className="sidebar">
        <FDash />
      </div>

      <div className="main-content form-background">
        {/* Profile Section */}
        <div className="profile-card">
          <div className="profile-picc">
            <img src={formData.profilePic} alt="Profile Pic" />
          </div>

          <div className="profile-detailss">
            <h2>{formData.username}</h2>
            <h3>{formData.email}</h3>
          </div>
        </div>

        {/* Display other fetched details */}
        <div className="details-group  text-center mb-4">
          <p className="mb-6">
            <strong>Category:</strong> {formData.category}
          </p>
          <p className="mb-6">
            <strong>Payment Terms:</strong> {formData.paymentTerms}
          </p>
          <p className="mb-6">
            <strong>Address:</strong> {formData.address}
          </p>
          <p className="mb-6">
            <strong>City:</strong> {formData.location}
          </p>{" "}
          {/* Display location */}
          <p className="mb-6">
            <strong>Start Month:</strong> {formData.startingMonth}
          </p>
          <p className="mb-6">
            <strong>End Month:</strong> {formData.endingMonth}
          </p>
          <p className="mb-6">
            <strong>Description:</strong> {formData.description}
          </p>
        </div>

        {/* Ongoing Contracts Section */}
        <div
          className="contracts-section text-center"
          id="ongoing-contracts-section"
        >
          <h2>
            <strong>Ongoing Contracts</strong>
          </h2>
          <div className="contracts-container">
            {ongoingContracts &&
              (ongoingContracts.length > 0 ? (
                ongoingContracts.map(
                  (contract: any, index: React.Key | null | undefined) => (
                    <div className="contract-card" key={index}>
                      <h3 className="mb-4">Buyer: {contract.buyer.name}</h3>
                      <p className="mb-4">Crop Type: {contract.product.name}</p>
                      <p className="mb-4">
                        Quantity: {contract.product.quantity} kg
                      </p>
                      <p className="mb-4">
                        Price: ${contract.product.totalPrice}
                      </p>
                      <p className="mb-4">Status: {contract.contractStatus}</p>
                      {/*  <Link href={`/contracts/${contract.contractId}`}>
                  <button className="btn purchase-card">View Details</button>
                  </Link> */}
                      {!contract.isFarmerSigned && (
                        <button
                          className="btn purchase-card"
                          onClick={() => signContract(contract.contractId)}
                        >
                          I Agree
                        </button>
                      )}
                      <button
                        className="btn purchase-card"
                        onClick={() => downloadPdf(contract.contractId)}
                        disabled={dloading}
                      >
                        {"Download PDF"}
                      </button>

                      <button
                        className="btn purchase-card"
                        onClick={() => cancelContract(contract.contractId)}
                        disabled={cloading}
                      >
                        {"Cancel contract"}
                      </button>
                    </div>
                  )
                )
              ) : (
                <p>No ongoing contracts.</p>
              ))}
          </div>
        </div>

        {/* Completed Contracts Section */}
        <div
          className="contracts-section text-center"
          id="completed-contracts-section"
        >
          <h2>
            <strong>Completed Contracts</strong>
          </h2>
          <div className="contracts-container">
            {completedContracts &&
              (completedContracts.length > 0 ? (
                completedContracts.map(
                  (contract: any, index: React.Key | null | undefined) => (
                    <div className="contract-card" key={index}>
                      <h3 className="mb-4">Buyer: {contract.buyer.name}</h3>
                      <p className="mb-4">Crop Type: {contract.product.name}</p>
                      <p className="mb-4">
                        Quantity: {contract.product.quantity} kg
                      </p>
                      <p className="mb-4">
                        Price: ${contract.product.totalPrice}
                      </p>
                      <p className="mb-4">Status: {contract.contractStatus}</p>
                      <Link href={`/contracts/${contract.contractId}`}>
                        <button className="btn purchase-card">
                          View Details
                        </button>
                      </Link>
                      <button
                        className="btn purchase-card"
                        onClick={() => {
                          downloadPdf(contract.contractId);
                        }}
                        disabled={dloading}
                      >
                        {"Download PDF"}
                      </button>

                      <button
                        className="btn purchase-card"
                        onClick={() => cancelContract(contract.contractId)}
                        disabled={cloading}
                      >
                        {"Cancel contract"}
                      </button>
                    </div>
                  )
                )
              ) : (
                <p>No completed contracts.</p>
              ))}
          </div>
        </div>
        <Link href="/updateFarmerProfile">
          <div className="form-group text-center">
            <button type="submit" className="text-white">
              Edit
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BuyerProfile;
