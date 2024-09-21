"use server";
import * as z from "zod";
import { ResetSchema } from "../schemas";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";
import { getUserByEmail } from "../data/user";

export const reset = async (values: any) => {
  const { recaptcha_token, ...value } = values;
  const validatedFields = ResetSchema.safeParse(value);

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  // if (!recaptcha_token) {
  //   return { error: "reCAPTCHA token not found! Try again" };
  // }

  // const data = {
  //   "event": {
  //     "token": recaptcha_token,
  //     "siteKey": process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  //   }
  // }

  // const recaptchaResponse = await fetch(
  //      `https://recaptchaenterprise.googleapis.com/v1/projects/${process.env.RECAPTCHA_PROJECT}/assessments?key=${process.env.RECAPTCHA_API_KEY}`,
  //      {
  //       method: "POST",
  //       body: JSON.stringify(data),
  //      }
  //  );

  // // const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;

  // // // Verify reCAPTCHA token
  // // const recaptchaResponse = await fetch(
  // //   `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptcha_token}`,
  // //   { method: "POST" }
  // // );

  // const recaptchaResult = await recaptchaResponse.json();

  // console.log(recaptchaResult.riskAnalysis.score);
  // if (recaptchaResult.riskAnalysis.score < 0.7) {
  //   return { error: recaptchaResult["error-codes"] };
  // }
  
  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);

  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Reset email sent!" };
};
