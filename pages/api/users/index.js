// pages/api/users/index.js
import { getAllUsers } from "../../../lib/db";
import { requireAuth } from "../../../lib/auth";

export default requireAuth(function handler(req, res) {
  res.json(getAllUsers());
});
