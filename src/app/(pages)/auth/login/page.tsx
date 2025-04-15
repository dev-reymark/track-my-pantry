"use client";

import React from "react";
import { Button, Input, Link, Form, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      router.push("/home");
    } catch (error) {
      const err = error as FirebaseError;
      console.error("Login error:", err.message);
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Check if this is the first user in the collection
        const usersSnapshot = await getDocs(collection(db, "users"));
        const isFirstUser = usersSnapshot.empty;

        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: isFirstUser ? "admin" : "user",
          createdAt: new Date(),
        });

        toast.success(`Welcome, ${isFirstUser ? "Admin" : "User"}!`);
      } else {
        toast.success("Welcome back!");
      }

      router.push("/home");
    } catch (error) {
      const err = error as FirebaseError;
      console.error("Google login error:", err.message);
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <div className="flex flex-col gap-1">
          <p className="pb-4 text-left text-3xl font-semibold">
            Log In
            <span aria-label="emoji" className="ml-2" role="img">
              👋
            </span>
          </p>
          <h1 className="text-large font-medium">Sign in to your account</h1>
          <p className="text-small text-default-500">to continue</p>
        </div>

        <Form
          className="flex flex-col gap-3"
          validationBehavior="native"
          onSubmit={handleSubmit}
        >
          <Input
            isRequired
            label="Email Address"
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
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
          />

          <Button
            className="w-full"
            color="primary"
            type="submit"
            isLoading={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Form>

        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OR</p>
          <Divider className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onPress={handleGoogleLogin}
            startContent={<Icon icon="flat-color-icons:google" width={24} />}
            variant="bordered"
            isLoading={loading}
          >
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-small">
          Need to create an account?&nbsp;
          <Link href="/auth/signup" size="sm">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
