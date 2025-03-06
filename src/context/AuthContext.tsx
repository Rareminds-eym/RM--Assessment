import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        try {
          // Fetch user data from Firestore
          const usersRef = collection(db, "users");
          const q = query(
            usersRef,
            where("email", "==", firebaseUser.email),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          const users = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
          }));

          if (users.length === 1) {
            setUser(users[0] as User);
            setIsAuthenticated(true);
          } else {
            console.error("User not found in database");
            await signOut(auth);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          await signOut(auth);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = userCredential.user;

      if (!userData.emailVerified) {
        throw new Error("Email not verified. Please check your inbox.");
      }

      // Auth state change listener will handle the rest
    } catch (error: any) {
      throw new Error(error.message || "Failed to log in.");
    }
  };

  const signup = async (
    nmId: string,
    email: string,
    password: string,
    username: string,
    sem: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await sendEmailVerification(newUser);

      const userData: User = {
        id: newUser.uid,
        nmId,
        email,
        username,
        sem,
      };

      await setDoc(doc(db, "users", nmId), userData);

      // Don't set user state here - wait for email verification
      return "Signup successful! Please verify your email before logging in.";
    } catch (error: any) {
      throw new Error(error.message || "Signup failed.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    // Auth state change listener will handle the rest
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
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