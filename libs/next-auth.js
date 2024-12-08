import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/userSchema';
import { connectMongoDB } from "@/libs/mongodb";
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          await connectMongoDB();
          const user = await User.findOne({ email: credentials.email });
    
          if (!user) {
            throw new Error('EmailNotFound');
          }
    
          if (user && !bcrypt.compareSync(credentials.password, user.password)) {
            throw new Error('InvalidPassword');
          }
    
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            departementId: user.departementId,
            departmentType: user.departmentType,
          };
        } catch (error) {
          console.error('Error in authorization:', error);
          if (error.message === 'EmailNotFound') {
            throw new Error('Email tidak ditemukan.');
          } else if (error.message === 'InvalidPassword') {
            throw new Error('Kata sandi salah.');
          } else {
            throw new Error('Otorisasi Gagal');
          }
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/',
  },
  secret: process.env.SECRET,
  session: {
    jwt: true,
    maxAge: 60 * 60,
    updateAge: 60 * 60,
    cookie: {
      secure: process.env.NODE === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userInDb = await User.findOne({ email: user.email });
        if (userInDb) {
          token.id = userInDb._id;
          token.role = userInDb.role;
          token.googleId = userInDb.googleId;
          token.departementId = userInDb.departementId;  // Add this line
          token.departmentType = userInDb.departmentType;  // Add this line
        }
      }
      console.log("Token after setting role and departementId in jwt:", token);
      return token;  // Changed from { ...token }
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.googleId = token.googleId;
      session.user.departementId = token.departementId;  // Add this line
      session.user.departmentType = token.departmentType;  // Add this line
      console.log("Session after setting role and departementId:", session);
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectMongoDB();
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            existingUser = await User.create({
              googleId: user.id,
              name: user.name,
              email: user.email,
              role: 'Mahasiswa',
              loginProvider: 'google'
            });
          } else {
            if (!existingUser.googleId) {
              existingUser.googleId = user.id;
              await existingUser.save();
            }
          }
          user.id = existingUser._id;
          user.role = existingUser.role;
          user.departementId = existingUser.departementId;
          user.departmentType = existingUser.departmentType;
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async redirect({ baseUrl }) {
      return baseUrl + '/dashboard';
    }
  }
};