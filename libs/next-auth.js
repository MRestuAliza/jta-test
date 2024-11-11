import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/userSchema';
import Departement from '@/models/tes/departementSchema'; // Pastikan path sesuai
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
        try {
          await connectMongoDB();
          const user = await User.findOne({ email: credentials.email });
          let departementId = null;

          if (user && bcrypt.compareSync(credentials.password, user.password)) {
            if (user.role.startsWith('Admin')) {
              const departmentName = user.role.replace('Admin ', '').trim();
              const departement = await Departement.findOne({ name: departmentName });
              if (departement) {
                departementId = departement._id;
                type = departement.type;
              }
            }
            return { id: user._id, name: user.name, email: user.email, role: user.role, departementId };
          } else {
            throw new Error('InvalidCredentials');
          }
        } catch (error) {
          console.error('Error in authorization:', error);
          throw new Error('AuthorizationFailed');
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/', // Sesuaikan dengan halaman sign-in Anda, jika ada
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

          if (userInDb.role.startsWith('Admin')) {
            const departmentName = userInDb.role.replace('Admin ', '').trim();
            const departement = await Departement.findOne({ name: departmentName });
            if (departement) {
              token.departementId = departement._id;
              token.type = departement.type;
            }
          }
        }
      }
      console.log("Token after setting role and departementId in jwt:", token);
      return { ...token };
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.googleId = token.googleId;
      session.user.type = token.type;
      session.user.departementId = token.departementId;
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

          if (existingUser.role.startsWith('Admin')) {
            const departmentName = existingUser.role.replace('Admin ', '').trim();
            const departement = await Departement.findOne({ name: departmentName });
            if (departement) {
              user.departementId = departement._id;
              user.type = departement.type;
            }
          }
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
