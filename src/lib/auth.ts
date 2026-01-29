import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Admin credentials from environment variables
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
  
  // Fallback: use LOBSTA_API_KEY as password for admin@redlobsta.com
  const fallbackKey = process.env.LOBSTA_API_KEY || process.env.ADMIN_API_KEY;
  if (fallbackKey && !users.has('admin@redlobsta.com')) {
    users.set('admin@redlobsta.com', fallbackKey);
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
        
        if (!expectedPassword || password !== expectedPassword) {
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
