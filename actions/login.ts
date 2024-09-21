"use server";
import * as z from "zod";
import { LoginSchema } from "../schemas";
import { db } from "@/lib/db";
import { signIn } from "../auth";
import { DEFAULT_LOGIN_REDIRECT } from "../routes";
import { AuthError } from "next-auth";
import { getTwoFactorTokenByEmail } from "../data/two-factor-token";
import { getUserByEmail } from "../data/user";
import {
  sendVerificationEmail,
  sendTwoFactorTokenEmail,
} from "../src/lib/mail";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";
import { NextResponse } from "next/server";

export const login = async (values: any) => {
  const { recaptcha_token, ...value } = values;
  const validatedFields = LoginSchema.safeParse(value);

  if (!validatedFields.success) {
    return { error: "Invalid Fields" };
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

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = generateVerificationToken(existingUser.email);

    await sendVerificationEmail(
      (
        await verificationToken
      ).email,
      (
        await verificationToken
      ).token
    );
    return { success: "Confirmation email sent" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) {
        return { error: "Invalid  code" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: "Code expired" };
      }

      // Delete two factor token for new sign in
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(
        (
          await twoFactorToken
        ).email,
        (
          await twoFactorToken
        ).token
      );
      return { twoFactor: true };
    }
  }
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials " };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};
