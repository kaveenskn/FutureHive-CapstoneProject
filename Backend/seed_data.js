const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedData() {
  console.log("🌱 Seeding sample data...\n");

  // Sample users
  const sampleUsers = [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "Admin",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      role: "User",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: "Carol White",
      email: "carol@example.com",
      role: "Moderator",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: "David Brown",
      email: "david@example.com",
      role: "User",
      status: "Unsupervised",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: "Emma Davis",
      email: "emma@example.com",
      role: "User",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  try {
    // Add users
    console.log("Adding users...");
    for (const user of sampleUsers) {
      const docRef = await db.collection("users").add(user);
      console.log(`✅ Added user: ${user.name} (ID: ${docRef.id})`);
    }

    // Add research entries
    console.log("\nAdding research entries...");
    const sampleResearch = [
      {
        title: "Machine Learning in Healthcare",
        description: "Exploring AI applications in medical diagnosis",
        author: "Dr. Sarah Chen",
        year: 2023,
        created_at: new Date().toISOString(),
      },
      {
        title: "Quantum Computing Advances",
        description: "Recent breakthroughs in quantum algorithms",
        author: "Prof. Michael Kumar",
        year: 2024,
        created_at: new Date().toISOString(),
      },
    ];

    for (const research of sampleResearch) {
      const docRef = await db.collection("research_entries").add(research);
      console.log(`✅ Added research: ${research.title} (ID: ${docRef.id})`);
    }

    console.log("\n✅ Sample data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
