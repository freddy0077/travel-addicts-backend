const { createYoga } = require('graphql-yoga');
const { createServer } = require('http');
const { PrismaClient } = require('@prisma/client');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Simple GraphQL schema
const typeDefs = `
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
  }

  type Destination {
    id: ID!
    name: String!
    slug: String!
    description: String!
    image: String!
    priceFrom: Int!
    featured: Boolean!
  }

  type Tour {
    id: ID!
    title: String!
    slug: String!
    description: String!
    priceFrom: Int!
    featured: Boolean!
    destination: Destination!
  }

  type BlogPost {
    id: ID!
    title: String!
    slug: String!
    excerpt: String!
    content: String!
    featured: Boolean!
    status: String!
    author: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    destinations: [Destination!]!
    tours: [Tour!]!
    blogPosts: [BlogPost!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.user;
    },

    destinations: async () => {
      return await prisma.destination.findMany({
        include: {
          country: true
        }
      });
    },

    tours: async () => {
      return await prisma.tour.findMany({
        include: {
          destination: {
            include: {
              country: true
            }
          }
        }
      });
    },

    blogPosts: async () => {
      return await prisma.blogPost.findMany({
        include: {
          author: true,
          category: true
        }
      });
    }
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    }
  }
};

// Authentication context
const createContext = async ({ request }) => {
  let user = null;
  
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role
        };
      }
    }
  } catch (error) {
    console.log('Auth error:', error.message);
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
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
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
