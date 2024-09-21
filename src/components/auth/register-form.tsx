"use client";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { RegisterSchema } from "../../../schemas";
import CardWrapper from "./card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import {
  GoogleReCaptchaProvider,
  GoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { getErrorMessage, fetchCsrfToken } from "@/lib/clientUtils/secure";


import { register } from "../../../actions/register";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [token, setToken] = useState("");
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // set reCAPTCHA token
  const setTokenFunc = (getToken: string) => {
    setToken(getToken);
  };


  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      number: "",
      role: "",
      latitude: "",
      longitude: "",
    },
  });
  


  useEffect(() => {
    const onLocationFound = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLatitude(latitude.toString());
      setLongitude(longitude.toString());
    };

    const onLocationError = (error: GeolocationPositionError) => {
      console.error(error);
      alert("Unable to retrieve your location.");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        onLocationFound,
        onLocationError
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  const onSubmit = async(values: any) => {
    setError("");
    setSuccess("");
    grecaptcha.enterprise.ready(async () => {
      const token = await grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
      setTokenFunc(token);
    });

    const recaptcha_token = token;

  //  const data = await fetchCsrfToken();
  //   if (data) {
  //     const details = await data.json();
  //     const csrftoken = details?.csrfToken;
  //     setCsrfToken(csrftoken);
  //   } else {
  //     // Handle the case where data is null
  //     console.error("Data is null");
  //   }

    startTransition(() => {
      register({...values, recaptcha_token}).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className=" space-y-4 ">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder="Abcd" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="abcd.18@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-3">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="9878987690"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Farmer | Buyer"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-row gap-10">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter this value {latitude}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder=""
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter this value {longitude}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder=""
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Create an account
          </Button>
          {/* <GoogleReCaptchaProvider
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
          </GoogleReCaptchaProvider> */}
        </form>
      </Form>
    </CardWrapper>
  );
};
