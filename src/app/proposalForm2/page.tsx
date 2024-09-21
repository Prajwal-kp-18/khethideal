"use client";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import "@/components/styles/contract.css"; // Assuming you're linking to the stylesheet
import { auth } from "../../../auth";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { getErrorMessage, fetchCsrfToken } from "@/lib/clientUtils/secure";
import { toast } from "react-toastify";


export default function ContractProposalForm() {
  const [token, setToken] = useState("");
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  const setTokenFunc = (getToken: string) => {
    setToken(getToken);
  };


  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      landholder: {
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        landholderId: "",
      },
      sharecropper: {
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        sharecropperId: "",
      },
      landDetails: {
        location: "",
        areaOfLand: "",
        soilType: "",
        cropToGrow: "",
      },
      cropCycle: {
        startingMonth: "",
        endingMonth: "",
      },
      financialDetails: {
        pricePerDecimal: "",
        totalCost: "",
        paymentTerms: "",
      },
    },
  });

  const onSubmit: SubmitHandler<any> = async (data) => {


    try {
      grecaptcha.enterprise.ready(async () => {
        const token = await grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {action: 'LOGIN'});
        setTokenFunc(token);
      });
  
      data.recaptcha_token = token;

      // const res = await fetchCsrfToken();
      // if (res) {
      //   const details = await res.json();
      //   const csrftoken = details?.csrfToken;
      //   setCsrfToken(csrftoken);
      // } else {
      //   // Handle the case where data is null
      //   console.error("Data is null");
      // }
      const response = await fetch("/api/contract/createContract2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Contract proposal created successfully!");
      } else {
        toast.error(result.message || "Error creating contract proposal");
      }
    } catch (err) {
      setRefreshReCaptcha(!refreshReCaptcha);
      console.error(err);
      toast.error("Error creating contract proposal");
    }
  };

  


  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Contract Proposal</h2>

        <form className="flex justify-center p-3" id="contractForm" onSubmit={handleSubmit(onSubmit)}>
      
          <div className="input-group flex-col w-full items-center">

            <h3>Landholder Details</h3>
            <input
              required
              {...register("landholder.name", { required: true })}
              type="text"
              placeholder="Enter Landholder's name"
            />
            {errors.landholder?.name && (
              <p className="text-red-500">{errors.landholder.name.message}</p>
            )}
            <input
              required
              {...register("landholder.email", { required: true })}
              type="email"
              placeholder="Enter Landholder's email"
            />
            {errors.landholder?.email && (
              <p className="text-red-500">{errors.landholder.email.message}</p>
            )}
            <input
              required
              {...register("landholder.phoneNumber", { required: true })}
              type="text"
              placeholder="Enter Landholder's phone number"
            />
            {errors.landholder?.phoneNumber && (
              <p className="text-red-500">{errors.landholder.phoneNumber.message}</p>
            )}
            <input
              required
              {...register("landholder.address", { required: true })}
              type="text"
              placeholder="Enter Landholder's address"
            />
            {errors.landholder?.address && (
              <p className="text-red-500">{errors.landholder.address.message}</p>
            )}
            
          </div>
            
          <div className="input-group flex-col w-full items-center">
            <h3>Sharecropper Details</h3>
            <input
              required
              {...register("sharecropper.name", { required: true })}
              type="text"
              placeholder="Enter Sharecropper's name"
            />
            {errors.sharecropper?.name && (
              <p className="text-red-500">{errors.sharecropper.name.message}</p>
            )}
            <input
              required
              {...register("sharecropper.email", { required: true })}
              type="email"
              placeholder="Enter Sharecropper's email"
            />
            {errors.sharecropper?.email && (
              <p className="text-red-500">{errors.sharecropper.email.message}</p>
            )}
            <input
              required
              {...register("sharecropper.phoneNumber", { required: true })}
              type="text"
              placeholder="Enter Sharecropper's phone number"
            />
            {errors.sharecropper?.phoneNumber && (
              <p className="text-red-500">{errors.sharecropper.phoneNumber.message}</p>
            )}
            <input
              required
              {...register("sharecropper.address", { required: true })}
              type="text"
              placeholder="Enter Sharecropper's address"
            />
            {errors.sharecropper?.address && (
              <p className="text-red-500">{errors.sharecropper.address.message}</p>
            )}
            
          </div>
          
          <div className="input-group flex-col  w-full items-center">
            <h3>Land Details</h3>
            <input
              required
              {...register("landDetails.location", { required: true })}
              type="text"
              placeholder="Enter land location"
            />
            {errors.landDetails?.location && (
              <p className="text-red-500">{errors.landDetails.location.message}</p>
            )}
            <input
              required
              {...register("landDetails.areaOfLand", { required: true })}
              type="number"
              placeholder="Enter area of land (in decimals)"
            />
            {errors.landDetails?.areaOfLand && (
              <p className="text-red-500">{errors.landDetails.areaOfLand.message}</p>
            )}
            <input
              required
              {...register("landDetails.soilType", { required: true })}
              type="text"
              placeholder="Enter soil type"
            />
            {errors.landDetails?.soilType && (
              <p className="text-red-500">{errors.landDetails.soilType.message}</p>
            )}
            <input
              required
              {...register("landDetails.cropToGrow", { required: true })}
              type="text"
              placeholder="Enter crop to grow"
            />
            {errors.landDetails?.cropToGrow && (
              <p className="text-red-500">{errors.landDetails.cropToGrow.message}</p>
            )}
          </div>
          <div className="input-group flex-col  w-full items-center">
            <h3>Crop Cycle</h3>
            <input
              required
              {...register("cropCycle.startingMonth", { required: true })}
              type="text"
              placeholder="Enter starting month"
            />
            {errors.cropCycle?.startingMonth && (
              <p className="text-red-500">{errors.cropCycle.startingMonth.message}</p>
            )}
            <input
              required
              {...register("cropCycle.endingMonth", { required: true })}
              type="text"
              placeholder="Enter ending month"
            />
            {errors.cropCycle?.endingMonth && (
              <p className="text-red-500">{errors.cropCycle.endingMonth.message}</p>
            )}
          </div>
          <div className="input-group flex-col  w-full items-center">
            <h3>Financial Details</h3>
            <input
              required
              {...register("financialDetails.pricePerDecimal", { required: true })}
              type="number"
              placeholder="Enter price per decimal"
            />
            {errors.financialDetails?.pricePerDecimal && (
              <p className="text-red-500">{errors.financialDetails.pricePerDecimal.message}</p>
            )}
            <input
              required
              {...register("financialDetails.totalCost", { required: true })}
              type="number"
              placeholder="Enter total cost"
            />
            {errors.financialDetails?.totalCost && (
              <p className="text-red-500">{errors.financialDetails.totalCost.message}</p>
            )}
            <input
              required
              {...register("financialDetails.paymentTerms", { required: true })}
              type="text"
              placeholder="Enter payment terms"
            />
            {errors.financialDetails?.paymentTerms && (
              <p className="text-red-500">{errors.financialDetails.paymentTerms.message}</p>
            )}
          </div>
         
          <button type="submit">Submit Proposal</button>
          <GoogleReCaptchaProvider
            reCaptchaKey={
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                : ""
            }
          >
            <GoogleReCaptcha
              onVerify={setTokenFunc}
              refreshReCaptcha={refreshReCaptcha}
            />
          </GoogleReCaptchaProvider>
        </form>
      </div>
    </div>
  );
}
