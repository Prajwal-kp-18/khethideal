import Contract2 from "../../../../models/secondContract"; // Adjust path as needed
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import generateContract2Pdf from "@/lib/clientUtils/generatePDF2";
import { auth } from "../../../../../auth";
import {
  createCSRFToken,
  getSessionIdFromRequest,
  verifyCSRFToken,
} from "@/lib/serverUtils/csrf";

export async function POST(request: Request) {
  if (request.method === "POST") {
    try {
      const client = await clientPromise();
      if (!client) {
        return NextResponse.json(
          {
            message: "Error connecting to the database",
          },
          {
            status: 500,
            headers: {
              "Content-Type": "text/plain",
            },
          },
        );
      }

      const req = await request.json();
      const { landholder, sharecropper, landDetails, cropCycle, financialDetails } = req;

      const session = await auth();
     
      
      const { recaptcha_token, ...data } = req;


      const recaptchaToken = recaptcha_token;
           

  const details = {
    "event": {
      "token": recaptcha_token,
      "siteKey": process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    }
  }

 

  // const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

  // // Verify reCAPTCHA token
  // const recaptchaResponse = await fetch(
  //   `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptcha_token}`,
  //   { method: "POST" }
  // );

 

 
      if (!recaptchaToken) {
        return NextResponse.json(
          {
            message: "reCAPTCHA token not found! Try again",
            error: "reCAPTCHA token not found!",
          },
          {
            status: 500,
          }
        );
      }
      const recaptchaResponse = await fetch(
        `https://recaptchaenterprise.googleapis.com/v1/projects/${process.env.RECAPTCHA_PROJECT}/assessments?key=${process.env.RECAPTCHA_API_KEY}`,
        {
         method: "POST",
         body: JSON.stringify(details),
        }
    );

      const recaptchaResult = await recaptchaResponse.json();
      console.log(recaptchaResult.riskAnalysis.score);
      if (recaptchaResult.riskAnalysis.score < 0.7) {
        return NextResponse.json({
          message: "reCAPTCHA validation failed",
          error: recaptchaResult["error-codes"],
        });
      }

      // const sessionId = getSessionIdFromRequest(request);
      // const csrfToken = createCSRFToken(sessionId);
    
      // // Verify the CSRF token
      // if (!verifyCSRFToken(sessionId, csrfToken)) {
      //   return NextResponse.json(
      //     { message: "Invalid CSRF token" },
      //     {
      //       status: 403,
      //     }
      //   );
      // }
    

      // Generate a unique contract2 ID
      const contract2Id = `CONTRACT2-${Date.now()}`;

      const newContract = new Contract2({
        contract2Id,
        landholder,
        sharecropper,
        landDetails,
        cropCycle,
        financialDetails,
      });

      await newContract.save();

      const res: any = await generateContract2Pdf(newContract);
      if (res) {
        return NextResponse.json(
          {
            message: "Contract2 created successfully",
            contract2: newContract,
          },
          { status: 201 }
        );
      }

    } catch (error: any) {
      console.log(error);
      return NextResponse.json(
        {
          message: "Error creating contract2",
          error: error?.message,
        },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      {
        message: "Invalid request method",
        error: "Only POST requests are allowed",
      },
      { status: 405 }
    );
  }
}

export async function PUT(request: Request) {
  if (request.method === "PUT") {
    const req = await request.json();
    const contract2Id = req.contract2Id;
    const contract2Url = req.contract2Url;

    try {
      const client = await clientPromise();

      const result = await Contract2.findByIdAndUpdate(
        contract2Id,
        { contract2Url }, // Add new key-value pair here
        { new: true, runValidators: true }
      );

      return NextResponse.json(
        { message: "Contract2 updated successfully" },
        { status: 200 }
      );
    } catch (err: any) {
      console.log(err);
      return NextResponse.json(
        {
          message: "Error updating contract2",
          error: err?.message,
        },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      {
        message: "Invalid request method",
        error: "Only PUT requests are allowed",
      },
      { status: 405 }
    );
  }
}
