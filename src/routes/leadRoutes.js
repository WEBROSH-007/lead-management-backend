const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createLead,
  getLeads,
  updateStatus
} = require("../controllers/leadController");

router.post("/", createLead);
router.get("/", auth, getLeads);
router.put("/:id", auth, updateStatus);

module.exports = router;