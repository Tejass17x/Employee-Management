import React, { useEffect, useState } from "react";
import { getOverview } from "../../services/hrApi";

const Overview = () => {
  const [overview, setOverview] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const data = await getOverview();
      setOverview(data);
    } catch (error) {
      console.error("Overview Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>HR Overview</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            width: "220px",
          }}
        >
          <h3>Total Employees</h3>
          <h2>{overview.totalEmployees}</h2>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            width: "220px",
          }}
        >
          <h3>Pending Leaves</h3>
          <h2>{overview.pendingLeaves}</h2>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            width: "220px",
          }}
        >
          <h3>Approved Leaves</h3>
          <h2>{overview.approvedLeaves}</h2>
        </div>
      </div>
    </div>
  );
};

export default Overview;