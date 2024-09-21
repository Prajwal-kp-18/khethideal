"use client";
import React, { useState, useEffect, FormEvent } from "react";
import SDash from "../components/SDash";
import "@/components/styles/p2a.css";
import "@/components/styles/p2b.css";
import "@/components/styles/p2c.css";
import Link from "next/link";
import { toast } from "react-toastify";

// Define types for Buyers, Land Details, and Work Status
interface Buyer {
  name: string;
  location: string;
  cropType: string;
  area: number;
  pricePerDecimal: number;
  startMonth: string;
  endMonth: string;
}
interface UserDetails {
  id: string;
  name: string | null;
  email: string | null;
  // Add other fields as needed
}

interface LandDetail {
  mainId: string;
  areaOfLand: number;
  location: string;
  address: string;
  cropToGrow: string;
  soilType: string;
  startingMonth: string;
  endingMonth: string;
  pricePerDecimal: number;
  userDetails?: UserDetails | null;
}

interface WorkStatus {
  buyerName: string;
  area: number;
  location: string;
  statusOfWork: string;
}
interface SearchResult {
  location: string;
  cropType: string;
  area: string;
  pricePerDecimal: string;
}

const ShareCropperDashboard: React.FC = () => {
  const [formData, setFormData] = useState({
    location: "",
    cropType: "",
    area: "",
    pricePerDecimal: "",
  });
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

  const [onSearchResults, setOnSearchResults] = useState<SearchResult[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [landDetails, setLandDetails] = useState<LandDetail[]>([]);
  const [workStatus, setWorkStatus] = useState<WorkStatus[]>([
    {
      buyerName: "Buyer 1",
      area: 5,
      location: "Location 1",
      statusOfWork: "Sowing",
    }, // Default value
    {
      buyerName: "Buyer 2",
      area: 10,
      location: "Location 2",
      statusOfWork: "Sowing",
    },
  ]);
  const [ongoingContracts, setOngoingContracts] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [completedContracts, setCompletedContracts] = useState([]);
  const [dloading, setDLoading] = useState(false);
  const [cloading, setCLoading] = useState(false);

  const signContract = async (fileId: string | undefined) => {
    try {
      const contractId = fileId;
      const response = await fetch(
        `/api/contract/signContract2/signContractS`,
        {
          method: "PUT",
          body: JSON.stringify({ contractId }),
        }
      );
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
    console.log(fileName);
    try {
      // Fetch the presigned URL from your backend API
      const response = await fetch(`/api/contract/download/${fileName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();

      if (!res) {
        toast.error(res.message);
        return;
      }

      const presignedUrl = res.presignedUrl;

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
    console.log(fileName);
    try {
      // Fetch the presigned URL from your backend API
      const response = await fetch(`/api/contract/cancel2/${fileName}`, {
        method: "POST",
      });

      const res = await response.json();

      toast.success("Contract cancelled successfully!");
    } catch (error: any) {
      toast.error("Error cancelling contract:", error);
    } finally {
      setCLoading(false);
    }
  };

  useEffect(() => {
    // Fetch landholder details from the backend
    fetch("/api/ShareCropperDashboard")
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          console.log("No data found");

          toast.warn("No sharecroppers found for the specified criteria", {
            position: "top-right",
          });
        }

        setLandDetails(data);
      })
      .catch((error) =>
        console.error("Error fetching landholder data:", error)
      );
    const fetchContracts = async () => {
      const response = await fetch("/api/contract/getContracts2", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      setOngoingContracts(data.contracts.ongoingContracts);
      setCompletedContracts(data.contracts.completedContracts);
      setContracts(data.contracts);
    };
    fetchContracts();
  }, [setLandDetails]);

  // const handleChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  //   >
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // };

  // Placeholder for handling search (implement this later)
  const searchBuyers = async (e: FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // post function
    try {
      const response = await fetch("/api/ShareCropperDashboard", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const data = await response.json();
      setLandDetails(data);
      console.log("Form submitted successfully:", data);

      // Optionally, reset form after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
    }
    console.log("Search buyers triggered");
  };

  // Handle status change
  const handleStatusChange = (index: number, status: string) => {
    const updatedStatus = [...workStatus];
    updatedStatus[index].statusOfWork = status;
    setWorkStatus(updatedStatus);
    console.log(updatedStatus);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2 className="farmer-profile">ShareCropper Profile</h2>
        <SDash />
      </div>

      <div className="main-content">
        {/* Search Section */}
        <div className="section" id="search-section">
          <h1 className="search-profile text-lg">Search LandLord's Plot</h1>

          <form onSubmit={searchBuyers}>
            <div className="form-group">
              <label htmlFor="CropType">Crop Type</label>
              <input
                type="text"
                id="CropType"
                name="CropType"
                placeholder="Enter the Crop..."
              />
            </div>
            <div className="form-group inline-group">
              <div className="form-group">
                <label htmlFor="landarea">Area of land</label>
                <input
                  type="number"
                  id="landarea"
                  name="area"
                  onChange={handleChange}
                  placeholder="Enter area of land in decimals..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="pricePerDecimal">Price per decimal</label>
                <input
                  type="number"
                  id="pricePerDecimal"
                  name="pricePerDecimal"
                  onChange={handleChange}
                  placeholder="Enter price per Decimals..."
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="location">City</label>
              <input
                type="text"
                id="location"
                name="location"
                onChange={handleChange}
                placeholder="Enter your city..."
              />
            </div>
            <div className="text-center">
              <button id="searchBtn" type="submit">
                Search
              </button>
            </div>
          </form>
          {/*  */}
        </div>

        {/* Land Details Section */}
        <div className="plot-section" id="land-details-section">
          {/* <h2 className="text-center text-xl">
            <strong>Landlord's Plots</strong>
          </h2> */}
          <div className="plot-container">
            {landDetails.length > 0 ? (
              landDetails.map((land, index) => (
                <div className="plot-card" key={index}>
                  <div className="plot-card-header ">
                    <img
                      src="https://t4.ftcdn.net/jpg/02/75/94/93/240_F_275949388_k1rVe1KTRLzPeQAfbxdTXvcTLbiHB95l.jpg"
                      alt="Icon"
                    />
                  </div>
                  <div className="plot-card-body">
                    <p className="Name">Name: {land?.userDetails?.name}</p>
                    <p className="plot-card-description">
                      Email: {land?.userDetails?.email}
                    </p>
                    <p className="plot-card-description">
                      Area of Land: {land.areaOfLand}
                    </p>
                    <p className="plot-card-description">
                      Location: {land.location}
                    </p>
                    <p className="plot-card-description">
                      Crop To Grow: {land.cropToGrow}
                    </p>
                    <p className="plot-card-description">
                      Address: {land.address}
                    </p>
                    <p className="plot-card-description">
                      Soil Type: {land.soilType}
                    </p>
                    <p className="plot-card-description">
                      Start Month: {land.startingMonth}
                    </p>
                    <p className="plot-card-description">
                      End Month: {land.endingMonth}
                    </p>
                    <p className="plot-card-description">
                      Price per Decimal: {land.pricePerDecimal}
                    </p>
                    <Link href={`/chat/${land.mainId}`}>
                      <button className="but text-xs" type="submit">
                        Chat with the landholder
                      </button>
                    </Link>
                    <Link href="/proposalForm2">
                      <button className="but text-xs" type="submit">
                        Make a Proposal for contract
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p>No land details available.</p>
            )}
          </div>
        </div>

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
                      <h3 className="mb-4">
                        Landlord: {contract.landholder.name}
                      </h3>
                      <p className="mb-4">Email: {contract.landholder.email}</p>
                      <p className="mb-4">
                        Location: {contract.landDetails.location}
                      </p>
                      <p className="mb-4">
                        Land Area: {contract.landDetails.landOfArea}
                      </p>
                      <p className="mb-4">
                        Amount: Rs.{contract.financialDetails.totalCost}
                      </p>
                      <p className="mb-4">Status: {contract.contract2Status}</p>
                      {!contract.isCropperSigned && (
                        <button
                          className="btn purchase-card"
                          onClick={() => signContract(contract.contract2Id)}
                        >
                          I Agree
                        </button>
                      )}
                      <button
                        className="btn purchase-card"
                        onClick={() => downloadPdf(contract.contract2Id)}
                        disabled={dloading}
                      >
                        {"Download PDF"}
                      </button>

                      <button
                        className="btn purchase-card"
                        onClick={() => cancelContract(contract.contract2Id)}
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
                      <h3 className="mb-4">
                        Landlord: {contract.landholder.name}
                      </h3>
                      <p className="mb-4">Email: {contract.landholder.email}</p>
                      <p className="mb-4">
                        Location: {contract.landDetails.location}
                      </p>
                      <p className="mb-4">
                        Land Area: {contract.landDetails.landOfArea}
                      </p>
                      <p className="mb-4">
                        Amount: Rs.{contract.finanacialDetails.totalCost}
                      </p>
                      <p className="mb-4">Status: {contract.contract2Status}</p>

                      <button
                        className="btn purchase-card"
                        onClick={() => downloadPdf(contract.contract2Id)}
                        disabled={dloading}
                      >
                        {dloading ? "Downloading..." : "Download PDF"}
                      </button>

                      <button
                        className="btn purchase-card"
                        onClick={() => cancelContract(contract.contract2Id)}
                        disabled={cloading}
                      >
                        {cloading ? "Canceling contract..." : "Cancel contract"}
                      </button>
                    </div>
                  )
                )
              ) : (
                <p>No completed contracts.</p>
              ))}
          </div>
        </div>

        {/* Status of Work Section */}
        <div className="section text-center mb-4 " id="work-status-section">
          <h2 className="mb-4" text-xl>
            <strong>Status of Work</strong>
          </h2>
          <div className="contracts-container">
            {workStatus.map((status, index) => (
              <div className="contract-card" key={index}>
                <h3>Landlord: {status.buyerName}</h3>
                <p>Area: {status.area} decimals</p>
                <p>Location: {status.location}</p>
                <p>Status Of Work:</p>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name={`status-${index}`}
                      value="Sowing"
                      checked={status.statusOfWork === "Sowing"}
                      onChange={() => handleStatusChange(index, "Sowing")}
                    />
                    Sowing
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`status-${index}`}
                      value="Growing"
                      checked={status.statusOfWork === "Growing"}
                      onChange={() => handleStatusChange(index, "Growing")}
                    />
                    Growing
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`status-${index}`}
                      value="Harvested"
                      checked={status.statusOfWork === "Harvested"}
                      onChange={() => handleStatusChange(index, "Harvested")}
                    />
                    Harvested
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCropperDashboard;
