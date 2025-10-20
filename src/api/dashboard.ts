export const getDashboardData = async (token: string) => {
  const res = await fetch("http://localhost:5000/api/dashboard", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement du tableau de bord");
  return res.json(); // { stats: {}, revenues: [] }
};
