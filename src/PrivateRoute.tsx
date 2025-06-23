import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

interface Props {
  children: React.ReactElement;
  allowedEmails: string[]; // List of admin email addresses
}

function PrivateRoute({ children, allowedEmails }: Props) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [allowedEmails]);

  if (checking) return <p>Loading...</p>;

  if (userEmail && allowedEmails.includes(userEmail)) {
    return children;
  }

  return <Navigate to="/login" replace />;
}

export default PrivateRoute;
