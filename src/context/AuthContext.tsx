import React, { createContext, useState, useContext, ReactNode } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { User, AuthContextType } from "../types";
import { app } from "../firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Login Function
  const login = async (email: string, password: string) => {
    console.log(1)

    try {
      console.log("Email : ", email);
      console.log("Password : ", password);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(1)

      const userData = userCredential.user;

      if (!userData.emailVerified) {
        throw new Error("Email not verified. Please check your inbox.");
      }
      console.log(1)

      const usersRef = collection(db, "users"); // Reference to the "users" collection
      const q = query(usersRef, where("email", "==", email), limit(1));
      try {
        const querySnapshot = await getDocs(q); // Fetch all documents
        const users = querySnapshot.docs.map((doc) => ({
          // id: doc.id, // Include document ID
          ...doc.data(), // Merge document data
        }));

        console.log(users); // Logs an array of all users

        if (users.length == 1) {
          setUser(users[0] as User);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(users[0]));
        } else {
          throw new Error("User not found in database.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }

      // const userDoc = await getDoc(doc(db, "users", userData.uid));

      // if (userDoc.exists()) {
      //   setUser(userDoc.data() as User);
      //   setIsAuthenticated(true);
      //   localStorage.setItem("user", JSON.stringify(userDoc.data()));
      // } else {
      //   throw new Error("User not found in database.");
      // }
    } catch (error: any) {
      throw new Error(error.message || "Failed to log in.");
    }
  };

  // Signup Function
  const signup = async (
    nmId: string,
    email: string,
    password: string,
    username: string,
    sem: string
  ) => {
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Send email verification
      await sendEmailVerification(newUser);

      // Save user details to Firestore
      const userData: User = {
        id: newUser.uid,
        nmId,
        email,
        username,
        sem,
      };

      await setDoc(doc(db, "users", nmId), userData);

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));

      return "Signup successful! Please verify your email before logging in.";
    } catch (error: any) {
      throw new Error(error.message || "Signup failed.");
    }
  };

  // Logout Function
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
