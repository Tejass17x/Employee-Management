const BASE_URL = "http://localhost:5000/api/hr";

export const getOverview = async () => {
  const res = await fetch(`${BASE_URL}/overview`);
  return await res.json();
};

export const getEmployees = async () => {
  const res = await fetch(`${BASE_URL}/employees`);
  return await res.json();
};

export const getPendingLeaves = async () => {
  const res = await fetch(`${BASE_URL}/leave`);
  return await res.json();
};

export const approveLeave = async (id) => {
  const res = await fetch(`${BASE_URL}/leave/${id}`, {
    method: "PUT",
  });

  return await res.json();
};