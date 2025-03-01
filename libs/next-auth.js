import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/userSchema';
import { connectMongoDB } from '@/libs/mongodb';
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

          if (!user) throw new Error('EmailNotFound');
          if (!bcrypt.compareSync(credentials.password, user.password)) throw new Error('InvalidPassword');

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
          throw new Error('Otorisasi Gagal');
        }
      },
        }),
      ],
      pages: { signIn: '/' },
      secret: process.env.ACCESS_TOKEN_SECRET,
      session: {
        strategy: 'jwt',
        maxAge: 60 * 60, 
        updateAge: 60 * 60,
      },
      callbacks: {
        async jwt({ token, user }) {
      if (user) {
        Object.assign(token, {
          id: user.id,
          role: user.role,
          departementId: user.departementId,
          departmentType: user.departmentType,
        });
      }
      console.log('JWT Callback:', token);
      return token;
        },
        async session({ session, token }) {
      Object.assign(session.user, {
        id: token.id,
        role: token.role,
        departementId: token.departementId,
        departmentType: token.departmentType,
      });
      console.log('Session Callback:', session);
      return session;
        },
      },
  async redirect({ baseUrl }) {
    return `${baseUrl}/dashboard`;
  },
};
