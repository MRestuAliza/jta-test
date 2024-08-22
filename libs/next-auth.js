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
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        await connectMongoDB();
        const user = await User.findOne({ email: credentials.email });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user._id, name: user.name, email: user.email, role: user.role };
        } else {
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  secret: process.env.SECRET,
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    cookie: {
      secure: process.env.NODE === 'production',
      httpOnly: true,
      sameSite: 'lax', // or 'strict'
      path: '/',
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'Mahasiswa'; // Add role to token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        const { name, email } = user;
        try {
          await connectMongoDB();
          let userExists = await User.findOne({ email });

          if (!userExists) {
            userExists = await User.create({ name, email, role: 'Mahasiswa', loginProvider: 'google' });
          } else if (userExists.loginProvider === 'credentials') {
            throw new Error('AccountExistsWithCredentials');
          }

          user.id = userExists._id;
          user.role = userExists.role;
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
      return true;
    }
  }
};
