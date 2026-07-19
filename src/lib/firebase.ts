import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)

export { auth, app }

// Email verification
export const sendVerificationEmail = async (email: string, actionCodeSettings: any) => {
  return sendSignInLinkToEmail(auth, email, actionCodeSettings)
}

export const confirmEmailVerification = async (email: string, link: string) => {
  if (isSignInWithEmailLink(auth, link)) {
    const result = await signInWithEmailLink(auth, email, link)
    const idToken = await result.user.getIdToken()
    return idToken
  }
  return null
}

// Phone verification
export const sendPhoneOTP = async (phoneNumber: string, recaptchaContainer: HTMLElement) => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, { size: "normal" })
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
  return confirmationResult
}

export const confirmPhoneOTP = async (confirmationResult: any, code: string) => {
  const result = await confirmationResult.confirm(code)
  const idToken = await result.user.getIdToken()
  return idToken
}

// Google Sign-In
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const idToken = await result.user.getIdToken()
  return idToken
}