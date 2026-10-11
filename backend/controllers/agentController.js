const mongoose = require("mongoose");
const Agent = require("../models/Agent");

const mockAgents = [
  {
    _id: "agent_1",
    name: "Suresh Reddy",
    email: "suresh.agent@househunt.com",
    phone: "+91 98765 43210",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    bio: "Senior Property Consultant in Gachibowli and Hitec City with 8+ years experience.",
    location: "Gachibowli, Hyderabad",
    experience: 8,
    rating: 4.9,
    totalListings: 15,
    activeLeads: 10,
    closedDeals: 42,
    commission: 320000
  },
  {
    _id: "agent_2",
    name: "Pooja Verma",
    email: "pooja.agent@househunt.com",
    phone: "+91 98765 12345",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    bio: "Specialist in luxury villas and modern apartments across Jubilee Hills & Banjara Hills.",
    location: "Jubilee Hills, Hyderabad",
    experience: 6,
    rating: 4.8,
    totalListings: 12,
    activeLeads: 7,
    closedDeals: 28,
    commission: 245000
  }
];

exports.getAgents = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const agents = await Agent.find();
      if (agents && agents.length > 0) {
        return res.json({ success: true, count: agents.length, data: agents });
      }
    }
    return res.json({ success: true, count: mockAgents.length, data: mockAgents });
  } catch (error) {
    return res.json({ success: true, count: mockAgents.length, data: mockAgents });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const agent = await Agent.findById(id);
      if (agent) {
        return res.json({ success: true, data: agent });
      }
    }
    const found = mockAgents.find((a) => a._id === id);
    if (found) {
      return res.json({ success: true, data: found });
    }
    return res.status(404).json({ success: false, message: "Agent not found" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const agentId = req.user?._id || req.user?.id;
    let agent = null;
    if (mongoose.connection.readyState === 1 && agentId && mongoose.Types.ObjectId.isValid(agentId)) {
      agent = await Agent.findById(agentId);
    }
    if (!agent) {
      agent = mockAgents[0];
    }
    return res.json({
      success: true,
      data: {
        totalListings: agent.totalListings,
        leads: agent.activeLeads,
        closedDeals: agent.closedDeals,
        commission: agent.commission
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};