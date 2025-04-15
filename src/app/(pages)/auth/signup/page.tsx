"use client";

import React from "react";
import { Button, Input, Checkbox, Link, Form } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { setDoc, doc, getDocs, collection } from "firebase/firestore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";

export default function Signup() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if there are any users in the "users" collection
      const usersSnapshot = await getDocs(collection(db, "users"));
      const isFirstUser = usersSnapshot.empty;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: isFirstUser ? "admin" : "user",
        createdAt: new Date(),
      });

      toast.success("Signup successful!");
      router.push("/home");
    } catch (error) {
      const err = error as FirebaseError;
      console.error("Signup error:", err.message);
      toast.error(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <p className="pb-4 text-left text-3xl font-semibold">
          Sign Up
          <span aria-label="emoji" className="ml-2" role="img">
            👋
          </span>
        </p>

        <Form
          className="flex flex-col gap-3"
          validationBehavior="native"
          onSubmit={handleSubmit}
        >
          <Input
            isRequired
            label="Name"
            labelPlacement="outside"
            name="name"
            placeholder="Enter your name"
            type="text"
            variant="bordered"
          />
          <Input
            isRequired
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleConfirmVisibility}>
                {isConfirmVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Confirm Password"
            labelPlacement="outside"
            name="confirmPassword"
            placeholder="Confirm your password"
            type={isConfirmVisible ? "text" : "password"}
            variant="bordered"
          />
          <Checkbox isRequired className="py-4" size="sm">
            I agree with the&nbsp;
            <Link className="relative z-[1]" href="#" size="sm">
              Terms
            </Link>
            &nbsp; and&nbsp;
            <Link className="relative z-[1]" href="#" size="sm">
              Privacy Policy
            </Link>
          </Checkbox>
          <Button
            isLoading={loading}
            className="w-full"
            color="primary"
            type="submit"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </Form>
        <p className="text-center text-small">
          Already have an account?&nbsp;
          <Link href="/auth/login" size="sm">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
