import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import { PrismaClient } from '@prisma/client';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';

const prisma = new PrismaClient();

// Authentication context
const createContext = async ({ request }: { request: Request }) => {
  let user: { id: string; email: string; role: string } | null = null;
  
  try {
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Extracted token:', token.substring(0, 20) + '...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      console.log('Decoded token:', decoded);
      
      // Verify user still exists and is active
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role
        };
        console.log('Context user set:', user);
      } else {
        console.log('User not found in database for ID:', decoded.id);
      }
    } else {
      console.log('No valid authorization header found');
    }
  } catch (error) {
    // Invalid token, user remains null
    console.log('Invalid token error:', error);
  }

  return {
    prisma,
    user
  };
};

// Create GraphQL Yoga server
const schema = makeExecutableSchema({ typeDefs, resolvers });
const yoga = createYoga({
  schema,
  context: createContext,
  cors: {
    origin: [
      // Local development
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:3002',
      // Production domains
      'http://traveladdicts.org',
      'https://traveladdicts.org',
      'http://www.traveladdicts.org',
      'https://www.traveladdicts.org',
      // Backend server (for testing)
      'http://13.36.178.239:4000'
    ],
    credentials: true
  },
  graphqlEndpoint: '/graphql',
  landingPage: false
});

// Create HTTP server
const server = createServer(yoga);

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`🚀 Travel Addict GraphQL Server ready at http://localhost:${port}/graphql`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Using fallback'}`);
  console.log(`💳 Paystack: ${process.env.PAYSTACK_SECRET_KEY ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
