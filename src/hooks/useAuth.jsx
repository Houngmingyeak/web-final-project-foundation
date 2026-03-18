// src/hooks/useAuth.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // Changed from '@/lib/firebase'

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user, displayName) => {
    const userRef = doc(db, 'users', user.uid);
    const newProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      role: 'user',
      bio: '',
      createdAt: Timestamp.now(),
      achievements: {
        solved: 0,
        helpful: 0,
        contributions: 0,
      },
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  };

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);
      return snapshot.data() || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Sign up function
  const signup = async (email, password, displayName) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await createUserProfile(user, displayName);
    setUserProfile(profile);
  };

  // Login function
  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  };

  // Logout function
  const logout = async () => {
    setUserProfile(null);
    await signOut(auth);
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}