const express = require("express");
const publisherController = require("../controllers/publisher.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Các route bảo vệ với phân quyền
router.post(
  "/",
  verifyToken,
  authorize(["Quản Lý", "Nhân Viên"]),
  publisherController.create
); // Thêm nhà xuất bản (chỉ Quản Lý)
router.put(
  "/:MANXB",
  verifyToken,
  authorize(["Quản Lý", "Nhân Viên"]),
  publisherController.update
); // Sửa nhà xuất bản (chỉ Quản Lý)
router.delete(
  "/:MANXB",
  verifyToken,
  authorize(["Quản Lý", "Nhân Viên"]),
  publisherController.delete
); // Xóa nhà xuất bản (chỉ Quản Lý)

// Các route công khai
router.get("/", publisherController.findAll); // Lấy danh sách nhà xuất bản
router.get("/:MANXB", publisherController.findById); // Lấy thông tin nhà xuất bản

module.exports = router;
