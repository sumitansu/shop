import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => {
    throw new Error('AuthContext not initialized');
  },
  signOut: async () => {},
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // Initialize user document conforming to strict schema
            const newProfileData: Record<string, unknown> = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              createdAt: serverTimestamp(),
            };
            if (currentUser.displayName) {
              newProfileData.displayName = currentUser.displayName;
            }
            if (currentUser.photoURL) {
              newProfileData.photoURL = currentUser.photoURL;
            }

            try {
              await setDoc(userDocRef, newProfileData);
              setUserProfile({
                uid: currentUser.uid,
                email: currentUser.email || '',
                displayName: currentUser.displayName || undefined,
                photoURL: currentUser.photoURL || undefined,
                createdAt: new Date().toISOString(),
              });
            } catch (err) {
              console.warn('Could not initialize profile doc (non-fatal):', err);
            }
          }
        } catch (err) {
          console.warn('Profile read check:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      return await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      setError(msg);
      throw err;
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await logoutUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-out failed';
      setError(msg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signOut: handleSignOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
