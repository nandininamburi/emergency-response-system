const Emergency = require('./models/Emergency');

const sampleEmergencies = [
  {
    name: "Rahul Sharma",
    phone: "+919876543210",
    email: "rahul@email.com",
    bloodGroup: "O+",
    emergencyType: "Road Accident",
    description: "Car collided with bike at MG Road intersection. Two people injured.",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "Pending",
    priority: "High",
    address: "MG Road, Bangalore"
  },
  {
    name: "Priya Patel",
    phone: "+919876543211",
    email: "priya@email.com",
    bloodGroup: "B+",
    emergencyType: "Fire",
    description: "Building fire at Indiranagar. Smoke coming from 3rd floor.",
    latitude: 12.9812,
    longitude: 77.7200,
    status: "Assigned",
    priority: "Critical",
    assignedOfficer: "Officer Kumar",
    address: "Indiranagar, Bangalore"
  },
  {
    name: "Amit Kumar",
    phone: "+919876543212",
    email: "amit@email.com",
    bloodGroup: "A+",
    emergencyType: "Medical",
    description: "Elderly person unconscious at Koramangala.",
    latitude: 12.9550,
    longitude: 77.7400,
    status: "On Route",
    priority: "High",
    assignedOfficer: "Officer Singh",
    address: "Koramangala, Bangalore"
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  let count = 0;
  for (const data of sampleEmergencies) {
    const emergency = new Emergency({
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    await emergency.save();
    count++;
    console.log(`✅ ${count}. ${emergency.emergencyType} - ${emergency.complaintId}`);
  }
  
  console.log(`\n✅ Seeding complete! Added ${count} emergencies.`);
}

seedDatabase();