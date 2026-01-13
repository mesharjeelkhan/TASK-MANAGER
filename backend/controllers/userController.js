const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "member" }).select("-password");

        // Add task counts
        const usersWithTaskCounts = await Promise.all(
            users.map(async (user) => {
                const pendingTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "Pending",
                });

                const inProgressTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "InProgress",
                });

                const completeTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "Completed",
                });

                return {
                    ...user._doc,
                    pendingTasks,
                    inProgressTasks,
                    completeTasks,
                };
            })
        );

        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
            const user = await User.findById(req.params.id).select("-password");
            if(!user) return res.status(404).json ({ message: "User not found" });
            res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// const deleteUser = async (req, res) => {
//     try {

//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

module.exports = { getUsers, getUserById };
