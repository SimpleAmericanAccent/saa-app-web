import express from "express";

const prismaRouter = express.Router();

// Add test route before returning router
prismaRouter.get("/test", async (req, res) => {
  try {
    // Test the prisma connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "success",
      message: "Prisma database connection successful",
    });
  } catch (error) {
    console.error("Database Connection Error:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Basic CRUD test routes for User model
prismaRouter.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

prismaRouter.post("/users", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.create({
      data: { email },
    });
    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

prismaRouter.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
});

prismaRouter.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});

export default prismaRouter;
