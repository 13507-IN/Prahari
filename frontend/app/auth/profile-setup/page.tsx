"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, MapPin, User } from "lucide-react";

const profileSetupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.enum(["volunteer", "ngo", "govt", "admin"]),
  area: z.string().min(2, "Area is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  pincode: z.string().regex(/^\d{5,10}$/, "Invalid pincode format"),
});

type ProfileSetupFormData = z.infer<typeof profileSetupSchema>;

const roleOptions = [
  { value: "volunteer", label: "VOLUNTEER", description: "Help the community" },
  { value: "ngo", label: "NGO", description: "Non-governmental organization" },
  { value: "govt", label: "GOVT", description: "Government representative" },
  { value: "admin", label: "ADMIN", description: "Administrator" },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      role: "volunteer",
      area: "",
      city: "",
      country: "",
      pincode: "",
    },
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Pre-fill names from Clerk user data
    if (user.firstName) setValue("firstName", user.firstName);
    if (user.lastName) setValue("lastName", user.lastName);
  }, [isLoaded, user, router, setValue]);

  const selectedRole = watch("role");

  async function onSubmit(data: ProfileSetupFormData) {
    setIsSubmitting(true);
    try {
      // Get Clerk token
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");

      // Call backend API to save profile
      const response = await fetch("http://localhost:5000/api/users/profile-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: user?.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: user?.primaryEmailAddress?.emailAddress,
          role: data.role,
          location: {
            area: data.area,
            city: data.city,
            country: data.country,
            pincode: data.pincode,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save profile");
      }

      toast({
        title: "Success!",
        description: "Your profile has been completed. Welcome to CommunitySync!",
      });

      // Reload Clerk user to fetch updated publicMetadata (role)
      await user?.reload();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Profile setup error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-swiss-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-swiss-red mx-auto mb-4" />
          <p className="text-swiss-fg/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-swiss-bg font-swiss flex items-center justify-center py-12 px-4 selection:bg-swiss-red selection:text-swiss-bg overflow-hidden relative">
      {/* Background Texture */}
      <div className="absolute inset-0 swiss-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 swiss-dots opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[50vw] h-full bg-swiss-fg swiss-diagonal opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="bg-swiss-bg border-2 border-swiss-fg/20 p-8 lg:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-swiss-red flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-display text-swiss-fg">Complete Your Profile</h1>
            </div>
            <p className="text-swiss-fg/60">
              Help us know more about you to better serve the community
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="text-lg font-semibold text-swiss-fg mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-swiss-fg font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="e.g., Saikat"
                    className="border-swiss-fg/20 bg-white/50"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-swiss-fg font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="e.g., Bera"
                    className="border-swiss-fg/20 bg-white/50"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Role Selection */}
            <section>
              <h2 className="text-lg font-semibold text-swiss-fg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Select Your Role
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === option.value
                        ? "border-swiss-red bg-swiss-red/5"
                        : "border-swiss-fg/20 hover:border-swiss-fg/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("role")}
                      className="hidden"
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-swiss-fg">{option.label}</div>
                        <div className="text-sm text-swiss-fg/60">{option.description}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedRole === option.value
                            ? "border-swiss-red bg-swiss-red"
                            : "border-swiss-fg/30"
                        }`}
                      >
                        {selectedRole === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="text-sm text-red-500 mt-2">{errors.role.message}</p>
              )}
            </section>

            {/* Location Information */}
            <section>
              <h2 className="text-lg font-semibold text-swiss-fg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-swiss-fg font-medium">
                    Area
                  </Label>
                  <Input
                    id="area"
                    placeholder="e.g., Downtown, Suburbs"
                    className="border-swiss-fg/20 bg-white/50"
                    {...register("area")}
                  />
                  {errors.area && (
                    <p className="text-sm text-red-500">{errors.area.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-swiss-fg font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., New York"
                    className="border-swiss-fg/20 bg-white/50"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-swiss-fg font-medium">
                    Country
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g., United States"
                    className="border-swiss-fg/20 bg-white/50"
                    {...register("country")}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-swiss-fg font-medium">
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    placeholder="e.g., 10001"
                    className="border-swiss-fg/20 bg-white/50"
                    {...register("pincode")}
                  />
                  {errors.pincode && (
                    <p className="text-sm text-red-500">{errors.pincode.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-swiss-red hover:bg-swiss-red/90 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {isSubmitting ? "Saving..." : "Complete Profile"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-swiss-fg/5 border border-swiss-fg/20 rounded-lg p-4 text-sm text-swiss-fg/70">
          <p>
            💡 Your information will be used to match you with relevant volunteer opportunities and
            connect you with the community.
          </p>
        </div>
      </div>
    </div>
  );
}
