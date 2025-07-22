const { GraphQLClient } = require('graphql-request');

const client = new GraphQLClient('http://localhost:4000/graphql');

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login credentials...');
    console.log('Email: admin@traveladdict.com');
    console.log('Password: admin123');
    console.log('');
    
    const result = await client.request(LOGIN_MUTATION, {
      email: 'admin@traveladdict.com',
      password: 'admin123'
    });
    
    if (result.login) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('');
      console.log('User Details:');
      console.log(`- ID: ${result.login.user.id}`);
      console.log(`- Email: ${result.login.user.email}`);
      console.log(`- Name: ${result.login.user.name}`);
      console.log(`- Role: ${result.login.user.role}`);
      console.log('');
      console.log('Token (first 50 chars):', result.login.token.substring(0, 50) + '...');
      console.log('');
      console.log('🎉 Admin credentials are VALID and working!');
    } else {
      console.log('❌ LOGIN FAILED: No login result returned');
    }
  } catch (error) {
    console.log('❌ LOGIN FAILED:');
    console.error('Error:', error.message);
    
    if (error.response?.errors) {
      console.log('GraphQL Errors:');
      error.response.errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.message}`);
      });
    }
  }
}

testAdminLogin();
