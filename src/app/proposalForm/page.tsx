"use client";
import generateContractPdf from "@/lib/clientUtils/generatePDF";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import "@/components/styles/contract.css"; // Assuming you're linking to the stylesheet
import { auth } from "../../../auth";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { getErrorMessage, fetchCsrfToken } from "@/lib/clientUtils/secure";
import { toast } from "react-toastify";
export default function Contract() {
  const [buyerId, setBuyerId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [token, setToken] = useState("");
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  const setTokenFunc = (getToken: string) => {
    setToken(getToken);
  };

  const onSubmitform = async (data: any) => {
    console.log(data);
    try {

      
      grecaptcha.enterprise.ready(async () => {
        const token = await grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
        setTokenFunc(token);
      });
  
      data.recaptcha_token = token;

    //   const res = await fetchCsrfToken();
    // if (res) {
    //   const details = await res.json();
    //   const csrftoken = details?.csrfToken;
    //   setCsrfToken(csrftoken);
    // } else {
    //   // Handle the case where data is null
    //   console.error("Data is null");
    // }
      const response = await fetch("/api/contract/createContract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Contract created successfully!");
      } else {
        toast.error(result.message || "Error creating contract");
      }
    } catch (err) {
      setRefreshReCaptcha(!refreshReCaptcha);
      console.error(err);
      toast.error("Error creating contract");
    }
  };

  
 
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      buyer: {
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        Account: "",
        ifsc: "",
      },
      seller: {
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        Account: "",
        ifsc: "",
      },
      product: {
        name: "",
        description: "",
        quantity: "",
        price: "",
        totalPrice: "",
      },
      terms: {
        paymentTerms:
          "Both parties agree to comply with all applicable local and federal laws.",
        deliveryDate: Date.now(),
        deliveryLocation: "",
        returnPolicy:
          "Returns are accepted within 30 days of delivery, provided the product is in its original condition and packaging.",
        additionalTerms:
          "Any disputes arising from this contract will be resolved through arbitration. Both parties agree to comply with all applicable local and federal laws.",
      },
    },
  });



 
  const [modal2, setModal2] = useState(false);

  const toggleModal2 = () => {
    setModal2(!modal2);
  };

  return (
    <>
      <div className="modal">
        <div className="modal-content">
          <h2>Contract Proposal</h2>
          <form id="modform" onSubmit={handleSubmit(onSubmitform)}>
            {!modal2 && (
              <>
                <div className="input-group">
                  <input
                    required
                    {...register("buyer.name", { required: true })}
                    type="text"
                    id="buy_name"
                    placeholder="Enter Buyer's name"
                  />
                  {errors.buyer?.name && (
                    <p className="text-red-500">{errors.buyer.name.message}</p>
                  )}
                  <input
                    required
                    {...register("buyer.email", { required: true })}
                    type="email"
                    id="buy_mail"
                    placeholder="Enter Buyer's email"
                  />
                  {errors.buyer?.email && (
                    <p className="text-red-500">{errors.buyer.email.message}</p>
                  )}
                </div>
                <div className="input-group">
                  <input
                    required
                    {...register("buyer.phoneNumber", { required: true })}
                    type="text"
                    id="buy_no"
                    placeholder="Enter Buyer's number"
                  />
                  {errors.buyer?.phoneNumber && (
                    <p className="text-red-500">
                      {errors.buyer.phoneNumber.message}
                    </p>
                  )}
                  <input
                    required
                    {...register("buyer.Account", { required: true })}
                    type="text"
                    id="buy_acc"
                    placeholder="Enter Buyer's account number"
                  />
                  {errors.buyer?.Account && (
                    <p className="text-red-500">
                      {errors.buyer.Account.message}
                    </p>
                  )}
                </div>

                <div className="input-group">
                  <input
                    required
                    {...register("buyer.address", { required: true })}
                    type="text"
                    placeholder="Enter Buyer's Address"
                  />
                  {errors.buyer?.address && (
                    <p className="text-red-500">
                      {errors.buyer.address.message}
                    </p>
                  )}
                  <input
                    required
                    {...register("seller.address", { required: true })}
                    type="text"
                    placeholder="Enter Farmer's Address"
                  />
                  {errors.seller?.address && (
                    <p className="text-red-500">
                      {errors.seller.address.message}
                    </p>
                  )}
                </div>

                <div className="input-group">
                  <input
                    required
                    {...register("seller.name", { required: true })}
                    type="text"
                    id="farm_name"
                    placeholder="Enter Farmer's name"
                  />
                  {errors.seller?.name && (
                    <p className="text-red-500">{errors.seller.name.message}</p>
                  )}
                  <input
                    required
                    {...register("seller.email", { required: true })}
                    type="email"
                    id="farm_mail"
                    placeholder="Enter Farmer's email"
                  />
                  {errors.seller?.email && (
                    <p className="text-red-500">
                      {errors.seller.email.message}
                    </p>
                  )}
                </div>
                <div className="input-group">
                  <input
                    required
                    {...register("seller.phoneNumber", { required: true })}
                    type="text"
                    id="farm_no"
                    placeholder="Enter Farmer's number"
                  />
                  {errors.seller?.phoneNumber && (
                    <p className="text-red-500">
                      {errors.seller.phoneNumber.message}
                    </p>
                  )}
                  <input
                    required
                    {...register("seller.Account", { required: true })}
                    type="text"
                    id="farm_acc"
                    placeholder="Enter Farmer's account number"
                  />
                  {errors.seller?.Account && (
                    <p className="text-red-500">
                      {errors.seller.Account.message}
                    </p>
                  )}
                </div>
                <div className="input-group">
                  <input
                    required
                    {...register("buyer.ifsc", { required: true })}
                    type="text"
                    id="buy_ifsc"
                    placeholder="Enter Buyer's IFSC code"
                  />
                  {errors.buyer?.ifsc && (
                    <p className="text-red-500">{errors.buyer.ifsc.message}</p>
                  )}
                  <input
                    required
                    {...register("seller.ifsc", { required: true })}
                    type="text"
                    id="farm_ifsc"
                    placeholder="Enter Farmer's IFSC code"
                  />
                  {errors.seller?.ifsc && (
                    <p className="text-red-500">{errors.seller.ifsc.message}</p>
                  )}
                </div>
              </>
            )}
            {modal2 && (
              <>
                <div className="input-group">
                  <input
                    required
                    {...register("product.name", { required: true })}
                    type="text"
                    id="crop_name"
                    placeholder="Enter crop name"
                  />
                  {errors.product?.name && (
                    <p className="text-red-500">
                      {errors.product.name.message}
                    </p>
                  )}
                  <input
                    required
                    {...register("product.quantity", { required: true })}
                    type="text"
                    id="crop_quant"
                    placeholder="Enter crop quantity (Qu)"
                  />
                  {errors.product?.quantity && (
                    <p className="text-red-500">
                      {errors.product.quantity.message}
                    </p>
                  )}
                </div>
                <div className="input-group">
                  <input
                    required
                    {...register("product.price", { required: true })}
                    type="text"
                    id="crop_rate"
                    placeholder="Enter rate/Qu"
                  />
                  {errors.product?.price && (
                    <p className="text-red-500">
                      {errors.product.price.message}
                    </p>
                  )}
                  <input
                    required
                    {...register("product.totalPrice", { required: true })}
                    type="price"
                    id="price"
                    placeholder="Total amount"
                  />
                  {errors.product?.totalPrice && (
                    <p className="text-red-500">
                      {errors.product.totalPrice.message}
                    </p>
                  )}
                </div>
                <div className="input-group">
                  <input
                    required
                    {...register("terms.deliveryLocation", { required: true })}
                    type="text"
                    id="del_loc"
                    placeholder="Enter delivery location"
                  />
                  {errors.terms?.deliveryLocation && (
                    <p className="text-red-500">
                      {errors.terms.deliveryLocation.message}
                    </p>
                  )}
                  <input
                    required
                    {...register("terms.additionalTerms")}
                    type="text"
                    id="spec_terms"
                    placeholder="Enter special terms"
                  />
                  {errors.terms?.additionalTerms && (
                    <p className="text-red-500">
                      {errors.terms.additionalTerms.message}
                    </p>
                  )}
                </div>
                
              </>
            )}

            {!modal2 && (
              <button className="next-modal" onClick={toggleModal2}>
                Next
              </button>
            )}
            {modal2 && (
              <>
                <button className="prev-modal" onClick={toggleModal2}>
                  &larr; Previous
                </button>
                <button form="modform" type="submit" className="submit-modal">
                  Create Contract
                </button>
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
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
