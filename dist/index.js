"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_yoga_1 = require("graphql-yoga");
const node_http_1 = require("node:http");
const client_1 = require("@prisma/client");
const schema_1 = require("@graphql-tools/schema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schema_2 = require("./graphql/schema");
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const prisma = new client_1.PrismaClient();
// Authentication context
const createContext = async ({ request }) => {
    let user = null;
    try {
        const authHeader = request.headers.get('authorization');
        console.log('Auth header:', authHeader);
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('Extracted token:', token.substring(0, 20) + '...');
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
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
            }
            else {
                console.log('User not found in database for ID:', decoded.id);
            }
        }
        else {
            console.log('No valid authorization header found');
        }
    }
    catch (error) {
        // Invalid token, user remains null
        console.log('Invalid token error:', error);
    }
    return {
        prisma,
        user
    };
};
// Create GraphQL Yoga server
const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: schema_2.typeDefs, resolvers: resolvers_1.default });
const yoga = (0, graphql_yoga_1.createYoga)({
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
const server = (0, node_http_1.createServer)(yoga);
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
