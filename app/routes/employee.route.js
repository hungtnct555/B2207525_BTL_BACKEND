const express = require("express");
const employeeController = require("../controllers/employee.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Đăng nhập bằng Email và Password
router.post("/login", employeeController.login);

// Thêm nhân viên mới (Chỉ Quản Lý có quyền)
router.post(
  "/",
  verifyToken,
  authorize(["Quản Lý"]),
  employeeController.create
);

// Lấy danh sách nhân viên (Chỉ Quản Lý có quyền)
router.get(
  "/",
  verifyToken,
  authorize(["Quản Lý"]),
  employeeController.findAll
);

// Lấy thông tin nhân viên cụ thể theo MSNV (Chỉ Quản Lý có quyền)
router.get(
  "/:MSNV",
  verifyToken,
  authorize(["Quản Lý"]),
  employeeController.findById
);

// Cập nhật thông tin nhân viên (Chỉ Quản Lý có quyền)
router.put(
  "/:MSNV",
  verifyToken,
  authorize(["Quản Lý"]),
  employeeController.update
);

// Xóa nhân viên (Chỉ Quản Lý có quyền)
router.delete(
  "/:MSNV",
  verifyToken,
  authorize(["Quản Lý"]),
  employeeController.delete
);

module.exports = router;
