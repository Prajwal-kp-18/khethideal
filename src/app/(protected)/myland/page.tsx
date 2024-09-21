"use client";
import React, { useState, useEffect, FormEvent } from "react";
import LDash from "../components/LDash";
import "@/components/styles/p2a.css";
import "@/components/styles/p2b.css";
import "@/components/styles/p2c.css";
import Link from "next/link";
import { toast } from "react-toastify";
import { AnyArn } from "aws-sdk/clients/groundstation";

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

interface LandDetail {
  _id: string;
  mainId: string;
  name: string;
  email: string;
  areaOfLand: number;
  location: string;
  address: string;
  cropToGrow: string;
  soilType: string;
  startingMonth: string;
  endingMonth: string;
  pricePerDecimal: number;
}

interface WorkStatus {
  buyerName: string;
  area: number;
  location: string;
  statusOfWork: string;
}

const LandlordProfile: React.FC = () => {
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
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const signContract = async (fileId: string | undefined) => {
    try {
      const contractId = fileId;
      const response = await fetch(`/api/contract/signContract2`, {
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
      // Fetch the presigned URL from your backend API
      const response = await fetch(`/api/contract/download2/${fileName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();

      if (!res) {
        toast.error(res);
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
    fetch("/api/myland")
      .then((response) => response.json())
      .then((data) => {
        setLandDetails(data.document);
        setUserName(data.name);
        setUserEmail(data.email);
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
  }, []);

  // Placeholder for handling search (implement this later)
  const searchBuyers = (e: FormEvent) => {
    e.preventDefault();
    console.log("Search buyers triggered");
  };

  // Handle status change
  const handleStatusChange = (index: number, status: string) => {
    const updatedStatus = [...workStatus];
    updatedStatus[index].statusOfWork = status;
    setWorkStatus(updatedStatus);
  };

  //Function to delete a land detail
  const deleteLandDetail = async (landId: any) => {
    try {
      const response = await fetch(`/api/deleteLand?mainId=${landId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Contract deleted successfully:", data.message);
        // Optionally refresh the list of contracts or remove the deleted one from the UI
        setLandDetails((prevland) =>
          prevland.filter((land) => land._id !== landId)
        );
      } else {
        console.error("Error deleting contract:", data.message);
      }
    } catch (error) {
      console.error("Error in delete request:", error);

      toast.error("Error in submitting the form", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  return (
    <div className="container">
      <div className="sidebar">
        <h2 className="farmer-profile">Landlord Profile</h2>
        <LDash />
      </div>
      <div className="main-content">
        <div className="section" id="search-section">
          <h1 className="search-profile">My Lands</h1>

          <div className="plot-section" id="land-details-section">
            <div className="plot-container">
              {landDetails.length > 0 ? (
                landDetails.map((land, index) => (
                  <div className="plot-card" key={index}>
                    <div className="plot-card-header h-64 w-full">
                      <img
                        className="h-64 w-full object-cover"
                        src="https://t4.ftcdn.net/jpg/02/75/94/93/240_F_275949388_k1rVe1KTRLzPeQAfbxdTXvcTLbiHB95l.jpg"
                        alt="Icon"
                      />
                    </div>
                    <div className="plot-card-body">
                      <p className="plot-card-description">Name: {userName}</p>
                      <p className="plot-card-description">
                        Email : {userEmail}
                      </p>
                      <p className="plot-card-description">
                        Area of Land: {land.areaOfLand}
                      </p>
                      <p className="plot-card-description">
                        Location: {land.location}
                      </p>
                      <p className="plot-card-description">
                        Crop Type: {land.cropToGrow}
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
                      <button
                        className="but"
                        type="submit"
                        onClick={() => deleteLandDetail(land._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No land details available.</p>
              )}
            </div>
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
                        SharedCropper: {contract.sharecropper.name}
                      </h3>
                      <p className="mb-4">
                        Crop Type: {contract.landDetails.cropToGrow}
                      </p>
                      <p className="mb-4">
                        Price: ${contract.financialDetails.totalCost}
                      </p>
                      <p className="mb-4">Status: {contract.contract2Status}</p>
                      <Link href={`/contracts/${contract.contract2Id}`}>
                        <button className="btn purchase-card">
                          View Details
                        </button>
                      </Link>
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
                      <h3 className="mb-4">
                        Farmer: {contract.sharecropper.name}
                      </h3>
                      <p className="mb-4">
                        Email: {contract.sharecropper.email}
                      </p>
                      <p className="mb-4">
                        Amount: {contract.financialDetails.totalCost}{" "}
                      </p>
                      <p className="mb-4">
                        Location: {contract.landDetails.location}
                      </p>
                      <p className="mb-4">Status: {contract.contract2Status}</p>

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
                <p>No completed contracts.</p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;
