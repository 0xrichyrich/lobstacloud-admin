import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import crypto from 'crypto';

// H-2 FIX: Admin credentials from ADMIN_PASSWORD env var (NOT the API key)
// Format: ADMIN_USERS=email1:password1,email2:password2
const parseAdminUsers = (): Map<string, string> => {
  const users = new Map<string, string>();
  const adminUsersEnv = process.env.ADMIN_USERS || '';
  
  if (adminUsersEnv) {
    adminUsersEnv.split(',').forEach(pair => {
      const [email, password] = pair.split(':');
      if (email && password) {
        users.set(email.trim(), password.trim());
      }
    });
  }
  
  // H-2 FIX: Use ADMIN_PASSWORD (NOT LOBSTA_API_KEY) as fallback
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && !users.has('admin@redlobsta.com')) {
    users.set('admin@redlobsta.com', adminPassword);
  }
  
  // If no ADMIN_PASSWORD set and no ADMIN_USERS, log a warning
  if (users.size === 0) {
    console.error('⚠️ SECURITY: No ADMIN_PASSWORD or ADMIN_USERS configured. Admin login disabled.');
  }
  
  return users;
};

const adminUsers = parseAdminUsers();

const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        
        // Check against admin users
        const expectedPassword = adminUsers.get(email);
        
        if (!expectedPassword) {
          return null;
        }
        
        // M-6 FIX: Timing-safe password comparison
        const expected = Buffer.from(expectedPassword);
        const provided = Buffer.from(password);
        if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
          return null;
        }

        // Return user object
        return {
          id: email,
          email: email,
          name: email.split('@')[0],
          role: 'admin',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

export { handlers, auth, signIn, signOut };
