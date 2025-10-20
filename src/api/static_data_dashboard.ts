// src/api/dashboard.ts

export const getDashboardData = async () => {
  // Simulation d'un délai (comme un vrai appel API)
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    stats: {
      totalRevenue: 12500,
      activeUsers: 1240,
      orders: 342,
    },
    revenues: [
      { month: "Jan", revenue: 4000 },
      { month: "Feb", revenue: 3000 },
      { month: "Mar", revenue: 5000 },
      { month: "Apr", revenue: 2500 },
      { month: "May", revenue: 3200 },
      { month: "Jun", revenue: 4200 },
    ],
  };
};
