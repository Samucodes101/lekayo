import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { adminAuth } from "@/lib/firebase-admin"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    CredentialsProvider({
      id: "firebase",
      name: "Firebase",
      credentials: {
        firebaseToken: { label: "Firebase Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.firebaseToken) return null
        try {
          // Verify the Firebase ID token using admin SDK
          const decoded = await adminAuth.verifyIdToken(credentials.firebaseToken)
          const { email, name, uid, phone_number } = decoded
          if (!email) throw new Error("Email not provided by Firebase")

          // Find or create user in Prisma
          let user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: name || email.split("@")[0],
                firebaseUid: uid,
                phone: phone_number || null,
                role: "CUSTOMER",
                emailVerified: new Date(), // since Firebase verified email
              },
            })
          } else if (!user.firebaseUid) {
            // Update firebaseUid if not set
            user = await prisma.user.update({
              where: { id: user.id },
              data: { firebaseUid: uid },
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Firebase auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}