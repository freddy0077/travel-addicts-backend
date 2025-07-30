export const typeDefs = `
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    image: String
    phone: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum UserRole {
    SUPER_ADMIN
    CONTENT_MANAGER
    CUSTOMER_SERVICE
    MARKETING
    EDITOR
    CUSTOMER
  }

  type Country {
    id: ID!
    name: String!
    code: String!
    continent: String!
  }

  type Destination {
    id: ID!
    name: String!
    slug: String!
    country: Country!
    type: String!
    season: String!
    description: String!
    highlights: [String!]!
    image: String!
    gallery: [String!]!
    rating: Float!
    reviewCount: Int!
    priceFrom: Int!
    duration: String!
    bestTime: String!
    climate: String!
    activities: [String!]!
    featured: Boolean!
    tours: [Tour!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Tour {
    id: ID!
    title: String!
    slug: String!
    destination: Destination!
    description: String!
    highlights: [String!]!
    inclusions: [String!]!
    exclusions: [String!]!
    duration: Int!
    groupSizeMax: Int!
    difficulty: DifficultyLevel!
    priceFrom: Int!
    images: [String!]!
    featured: Boolean!
    status: TourStatus!
    category: String!
    features: [String!]!
    season: String!
    rating: Float!
    reviewCount: Int!
    itinerary: [TourItinerary!]!
    pricing: [TourPricing!]!
    reviews: [Review!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum TourStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum DifficultyLevel {
    EASY
    MODERATE
    CHALLENGING
    EXTREME
  }

  type TourItinerary {
    id: ID!
    dayNumber: Int!
    title: String!
    description: String!
    meals: [String!]!
    accommodation: String
    activities: [String!]!
  }

  type TourPricing {
    id: ID!
    season: String!
    priceAdult: Int!
    priceChild: Int!
    availableDates: [String!]!
    maxCapacity: Int!
  }

  type BlogCategory {
    id: ID!
    name: String!
    slug: String!
    description: String!
  }

  type BlogPost {
    id: ID!
    title: String!
    slug: String!
    excerpt: String!
    content: String!
    author: User!
    publishedAt: DateTime
    category: BlogCategory!
    tags: [String!]!
    image: String!
    featured: Boolean!
    status: PostStatus!
    seoTitle: String
    seoDescription: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
  }

  enum PaymentStatus {
    PENDING
    PAID
    PARTIALLY_PAID
    REFUNDED
    FAILED
  }

  enum PaymentMethod {
    CREDIT_CARD
    DEBIT_CARD
    PAYPAL
    BANK_TRANSFER
    MOBILE_MONEY
    PAYSTACK
    CARD
    USSD
    CASH
    CHEQUE
    OTHER
  }

  type Customer {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String!
    dateOfBirth: DateTime
    nationality: String
    passportNumber: String
    emergencyContact: String
    dietaryRequirements: String
    medicalConditions: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Booking {
    id: ID!
    bookingReference: String!
    tour: Tour!
    customer: Customer!
    user: User
    startDate: DateTime!
    endDate: DateTime!
    adultsCount: Int!
    childrenCount: Int!
    totalPrice: Int!
    status: BookingStatus!
    paymentStatus: PaymentStatus!
    specialRequests: String
    travelers: [BookingTraveler!]!
    payments: [Payment!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BookingTraveler {
    id: ID!
    firstName: String!
    lastName: String!
    age: Int!
    passportNumber: String
    dietaryRequirements: String
  }

  type Payment {
    id: ID!
    bookingId: String!
    amount: Int!
    currency: String!
    paymentMethod: String!
    status: PaymentStatus!
    paystackReference: String
    transactionId: String
    paidAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Review {
    id: ID!
    tour: Tour!
    customer: Customer
    user: User
    rating: Int!
    title: String!
    content: String!
    verifiedBooking: Boolean!
    status: ReviewStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type Analytics {
    totalBookings: Int!
    totalRevenue: Int!
    totalCustomers: Int!
    conversionRate: Float!
    averageBookingValue: Int!
    monthlyGrowth: MonthlyGrowth!
    popularDestinations: [PopularDestination!]!
    recentBookings: [RecentBooking!]!
    monthlyStats: [MonthlyStats!]!
    topPerformingTours: [TopPerformingTour!]!
    customerInsights: CustomerInsights!
  }

  type MonthlyGrowth {
    bookings: Float!
    revenue: Float!
    customers: Float!
  }

  type PopularDestination {
    id: ID!
    name: String!
    bookings: Int!
    revenue: Int!
    growth: Float!
  }

  type RecentBooking {
    id: ID!
    customerName: String!
    tour: Tour!
    createdAt: DateTime!
    status: BookingStatus!
    totalPrice: Int!
  }

  type MonthlyStats {
    month: String!
    bookings: Int!
    revenue: Int!
    customers: Int!
  }

  type TopPerformingTour {
    id: ID!
    title: String!
    bookings: Int!
    revenue: Int!
    averageRating: Float!
  }

  type CustomerInsights {
    totalCustomers: Int!
    newCustomersThisMonth: Int!
    returningCustomers: Int!
    averageCustomerValue: Int!
    topNationalities: [CustomerNationality!]!
  }

  type CustomerNationality {
    nationality: String!
    count: Int!
    percentage: Float!
  }

  type AdminStats {
    totalUsers: Int!
    totalBookings: Int!
    totalRevenue: Int!
    totalCustomers: Int!
  }

  type SystemHealth {
    serverStatus: String!
    databaseStatus: String!
    storageStatus: String!
  }

  type UserActivity {
    id: ID!
    userId: ID!
    action: String!
    timestamp: DateTime!
  }

  type ContentStats {
    totalTours: Int!
    totalDestinations: Int!
    totalBlogPosts: Int!
  }

  type FinancialSummary {
    totalRevenue: Int!
    totalBookings: Int!
    averageBookingValue: Int!
    conversionRate: Float!
  }

  type PerformanceMetrics {
    serverResponseTime: Float!
    databaseQueryTime: Float!
    storageUsage: Float!
  }

  type UserStats {
    totalBookings: Int!
    totalSpent: Int!
    joinDate: DateTime!
    lastActivity: DateTime!
  }

  type RecentContent {
    recentTours: [Tour!]!
    recentDestinations: [Destination!]!
    recentBlogPosts: [BlogPost!]!
  }

  type ContentByStatus {
    published: Int!
    draft: Int!
    archived: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type SearchToursResult {
    tours: [Tour!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type SearchDestinationsResult {
    destinations: [Destination!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type PaystackInitializeResponse {
    success: Boolean!
    message: String!
    data: PaystackInitializeData
  }

  type PaystackInitializeData {
    authorization_url: String!
    access_code: String!
    reference: String!
  }

  type PaystackVerifyResponse {
    success: Boolean!
    message: String!
    data: PaystackVerifyData
  }

  type PaystackVerifyData {
    reference: String!
    amount: Int!
    status: String!
    gateway_response: String!
    paid_at: String
    created_at: String!
    channel: String!
    currency: String!
    customer: PaystackCustomer!
  }

  type PaystackCustomer {
    id: Int!
    first_name: String
    last_name: String
    email: String!
    phone: String
  }

  input PaystackInitializeInput {
    email: String!
    amount: Int!
    currency: String!
    reference: String
    callback_url: String
    metadata: String
  }

  type CustomBookingResponse {
    success: Boolean!
    message: String!
  }

  input CustomBookingInput {
    name: String!
    email: String!
    phone: String
    destination: String!
    travelDates: String!
    travelers: Int!
    budget: Int!
    message: String!
  }

  # Media Upload Types
  type MediaFile {
    id: ID!
    filename: String!
    originalName: String!
    url: String!
    key: String!
    size: Int!
    contentType: String!
    folder: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PresignedUploadUrl {
    uploadUrl: String!
    key: String!
    publicUrl: String!
  }

  input GeneratePresignedUrlInput {
    filename: String!
    contentType: String!
    folder: String
  }

  input CreateMediaFileInput {
    filename: String!
    originalName: String!
    url: String!
    key: String!
    size: Int!
    contentType: String!
    folder: String!
  }

  input ServerUploadInput {
    filename: String!
    contentType: String!
    folder: String
    fileData: String! # Base64 encoded file data
  }

  enum GalleryCategory {
    DESTINATIONS
    TOURS
    CULTURE
    WILDLIFE
    LANDSCAPES
    PEOPLE
    FOOD
    ACTIVITIES
  }

  type GalleryImage {
    id: ID!
    title: String!
    description: String
    imageUrl: String!
    thumbnailUrl: String
    altText: String!
    location: String
    category: GalleryCategory!
    tags: [String!]!
    photographer: String
    featured: Boolean!
    published: Boolean!
    sortOrder: Int
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
    uploadedBy: User
  }

  input CreateGalleryImageInput {
    title: String!
    description: String
    imageUrl: String!
    thumbnailUrl: String
    altText: String!
    location: String
    category: GalleryCategory!
    tags: [String!]!
    photographer: String
    featured: Boolean
    published: Boolean
    sortOrder: Int
    metadata: JSON
  }

  input UpdateGalleryImageInput {
    title: String
    description: String
    imageUrl: String
    thumbnailUrl: String
    altText: String
    location: String
    category: GalleryCategory
    tags: [String!]
    photographer: String
    featured: Boolean
    published: Boolean
    sortOrder: Int
    metadata: JSON
  }

  input GalleryImageFilters {
    category: GalleryCategory
    featured: Boolean
    published: Boolean
    tags: [String!]
    search: String
  }

  type Query {
    # Authentication
    me: User

    # Destinations
    destinations(featured: Boolean): [Destination!]!
    destination(id: ID!): Destination
    destinationBySlug(slug: String!): Destination
    searchDestinations(
      query: String
      continent: String
      country: String
      type: String
      season: String
      minPrice: Int
      maxPrice: Int
      duration: String
      minRating: Float
      features: [String]
      startDate: String
      endDate: String
      limit: Int
      offset: Int
    ): SearchDestinationsResult!

    # Tours
    tours(destinationId: ID, featured: Boolean): [Tour!]!
    tour(id: ID!): Tour
    tourBySlug(slug: String!): Tour
    tourPricing(tourId: ID!): [TourPricing!]!
    searchTours(
      query: String
      continent: String
      country: String
      destination: String
      category: String
      minPrice: Int
      maxPrice: Int
      duration: String
      minRating: Float
      features: [String]
      season: String
      startDate: String
      endDate: String
      adults: Int
      children: Int
      limit: Int
      offset: Int
    ): SearchToursResult!

    # Blog
    blogPosts(status: PostStatus, featured: Boolean): [BlogPost!]!
    blogPost(id: ID!): BlogPost

    # Bookings
    bookings(status: BookingStatus): [Booking!]!
    booking(id: ID!): Booking

    # Analytics
    analytics: Analytics!
    adminStats: AdminStats!
    systemHealth: SystemHealth!
    userActivity: [UserActivity!]!
    contentStats: ContentStats!
    financialSummary: FinancialSummary!
    performanceMetrics: PerformanceMetrics!

    # Paystack
    paystackInitialize(input: PaystackInitializeInput!): PaystackInitializeResponse!
    paystackVerify(reference: String!): PaystackVerifyResponse!

    # Media
    generatePresignedUploadUrl(input: GeneratePresignedUrlInput!): PresignedUploadUrl!
    createMediaFile(input: CreateMediaFileInput!): MediaFile!
    deleteMediaFile(id: ID!): Boolean!

    # Gallery Images
    galleryImages(filters: GalleryImageFilters, limit: Int, offset: Int): [GalleryImage!]!
    galleryImage(id: ID!): GalleryImage

    # User Management APIs
    allUsers(limit: Int, offset: Int): [User!]!
    userById(id: ID!): User
    userStats(userId: ID!): UserStats!

    # Content Management APIs
    recentContent: RecentContent!
    contentByStatus(status: String!): ContentByStatus!
    mediaFiles(limit: Int, offset: Int): [MediaFile!]!
  }

  type Mutation {
    # Authentication
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!

    # Destinations
    createDestination(input: CreateDestinationInput!): Destination!
    updateDestination(id: ID!, input: UpdateDestinationInput!): Destination!
    deleteDestination(id: ID!): Boolean!

    # Tours
    createTour(input: CreateTourInput!): Tour!
    updateTour(id: ID!, input: UpdateTourInput!): Tour!
    deleteTour(id: ID!): Boolean!

    # Itinerary
    createTourItinerary(input: CreateTourItineraryInput!): TourItinerary!
    updateTourItinerary(id: ID!, input: UpdateTourItineraryInput!): TourItinerary!
    deleteTourItinerary(id: ID!): Boolean!

    # Blog
    createBlogPost(input: CreateBlogPostInput!): BlogPost!
    updateBlogPost(id: ID!, input: UpdateBlogPostInput!): BlogPost!
    deleteBlogPost(id: ID!): Boolean!

    # Bookings
    updateBookingStatus(id: ID!, status: BookingStatus!): Booking!
    createBooking(input: CreateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!
    createManualBooking(input: CreateManualBookingInput!): Booking!

    # Payments
    paystackInitialize(input: PaystackInitializeInput!): PaystackInitializeResponse!
    paystackVerify(reference: String!): PaystackVerifyResponse!

    # Media
    generatePresignedUploadUrl(input: GeneratePresignedUrlInput!): PresignedUploadUrl!
    createMediaFile(input: CreateMediaFileInput!): MediaFile!
    deleteMediaFile(id: ID!): Boolean!
    serverUploadFile(input: ServerUploadInput!): MediaFile!

    # Tour Pricing
    createTourPricing(input: CreateTourPricingInput!): TourPricing!
    updateTourPricing(id: ID!, input: UpdateTourPricingInput!): TourPricing!
    deleteTourPricing(id: ID!): Boolean!

    # Record Payment
    recordPayment(input: RecordPaymentInput!): Payment!

    # Gallery Images
    createGalleryImage(input: CreateGalleryImageInput!): GalleryImage!
    updateGalleryImage(id: ID!, input: UpdateGalleryImageInput!): GalleryImage!
    deleteGalleryImage(id: ID!): Boolean!

    # Custom Booking
    submitCustomBooking(input: CustomBookingInput!): CustomBookingResponse!
  }

  input CreateDestinationInput {
    name: String!
    country: String!
    continent: String!
    type: String!
    season: String!
    image: String!
    gallery: [String!]!
    description: String!
    highlights: [String!]!
    priceFrom: Float!
    duration: String!
    bestTime: String!
    climate: String!
    activities: [String!]!
    featured: Boolean
  }

  input UpdateDestinationInput {
    name: String
    country: String
    continent: String
    type: String
    season: String
    image: String
    gallery: [String!]
    description: String
    highlights: [String!]
    priceFrom: Float
    duration: String
    bestTime: String
    climate: String
    activities: [String!]
    featured: Boolean
  }

  input CreateTourInput {
    title: String!
    destinationId: ID!
    description: String!
    highlights: [String!]!
    inclusions: [String!]!
    exclusions: [String!]!
    duration: Int!
    groupSizeMax: Int!
    difficulty: DifficultyLevel!
    priceFrom: Float!
    images: [String!]!
    featured: Boolean
    itinerary: [ItineraryDayInput!]
  }

  input UpdateTourInput {
    title: String
    description: String
    highlights: [String!]
    inclusions: [String!]
    exclusions: [String!]
    duration: Int
    groupSizeMax: Int
    difficulty: String
    priceFrom: Int
    images: [String!]
    featured: Boolean
    category: String
    features: [String!]
    season: String
    destinationId: ID
  }

  input ItineraryDayInput {
    title: String!
    description: String!
    meals: [String!]!
    accommodation: String
    activities: [String!]!
  }

  input CreateTourItineraryInput {
    tourId: ID!
    dayNumber: Int!
    title: String!
    description: String!
    meals: [String!]!
    accommodation: String
    activities: [String!]!
  }

  input UpdateTourItineraryInput {
    dayNumber: Int
    title: String
    description: String
    meals: [String!]
    accommodation: String
    activities: [String!]
  }

  input CreateBlogPostInput {
    title: String!
    excerpt: String!
    content: String!
    categoryId: ID!
    tags: [String!]!
    image: String!
    featured: Boolean
    status: PostStatus
    seoTitle: String
    seoDescription: String
  }

  input UpdateBlogPostInput {
    title: String
    excerpt: String
    content: String
    categoryId: ID
    tags: [String!]
    image: String
    featured: Boolean
    status: PostStatus
    seoTitle: String
    seoDescription: String
  }

  input CreateBookingInput {
    tourId: ID!
    startDate: DateTime!
    endDate: DateTime!
    adultsCount: Int!
    childrenCount: Int!
    totalPrice: Int!
    customer: CreateCustomerInput!
    travelers: [CreateBookingTravelerInput!]!
    paymentMethod: PaymentMethod!
  }

  input CreateManualBookingInput {
    tourId: ID!
    startDate: DateTime!
    endDate: DateTime!
    adultsCount: Int!
    childrenCount: Int!
    totalPrice: Int!
    customerDetails: ManualBookingCustomerInput!
    specialRequests: String
    paymentStatus: PaymentStatus
    status: BookingStatus
    paymentMethod: String
    paidAmount: Int
    paymentReference: String
    paymentDate: DateTime
    paymentNotes: String
  }

  input ManualBookingCustomerInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
  }

  input CreateCustomerInput {
    email: String!
    firstName: String!
    lastName: String!
    phone: String!
    dateOfBirth: DateTime
    nationality: String
    passportNumber: String
    emergencyContact: String
    dietaryRequirements: String
    medicalConditions: String
  }

  input CreateBookingTravelerInput {
    firstName: String!
    lastName: String!
    age: Int!
    passportNumber: String
    dietaryRequirements: String
  }

  input CreateTourPricingInput {
    tourId: ID!
    season: String!
    priceAdult: Int!
    priceChild: Int!
    availableDates: [String!]!
    maxCapacity: Int!
  }

  input UpdateTourPricingInput {
    season: String
    priceAdult: Int
    priceChild: Int
    availableDates: [String!]
    maxCapacity: Int
  }

  input RecordPaymentInput {
    bookingId: ID!
    amount: Int!
    paymentMethod: String!
    reference: String
    paymentDate: String
    notes: String
  }
`;
