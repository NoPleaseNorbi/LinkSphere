const { getProjectGraphFromDB } = require("../models/graphModel");

const getProjectGraph = async (req, res) => {
  try {
    const { projectKey } = req.params;

    if (!projectKey) {
      return res.status(400).json({
        error: "Project key is required",
      });
    }

    const graphData = await getProjectGraphFromDB(projectKey);

    res.json({
      success: true,
      projectKey,
      graph: graphData,
    });
  } catch (err) {
    console.error("Get project graph error:", err.message);
    res.status(500).json({ error: "Failed to get project graph" });
  }
};

module.exports = { 
  getProjectGraph 
};