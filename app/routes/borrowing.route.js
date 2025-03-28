const express = require("express");
const borrowingController = require("../controllers/borrowing.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Gửi yêu cầu mượn sách (dành cho độc giả)
router.post("/request", verifyToken, borrowingController.createBorrowRequest);

// Nhân viên lấy danh sách yêu cầu chờ
router.get(
  "/requests/pending",
  verifyToken,
  authorize(["Nhân Viên", "Quản Lý"]),
  borrowingController.getPendingRequests
);

// Nhân viên xác nhận mượn sách
router.put(
  "/approve/:MaMuon",
  verifyToken,
  authorize(["Nhân Viên", "Quản Lý"]),
  borrowingController.approveBorrow
);

// Trả sách
router.put(
  "/return/:MaMuon",
  verifyToken,
  authorize(["Nhân Viên", "Quản Lý"]),
  borrowingController.returnBook
);

// Lấy tất cả các yêu cầu mượn sách (bao gồm cả trạng thái "pending" và "approved")
router.get(
  "/requests",
  verifyToken,
  authorize(["Nhân Viên", "Quản Lý"]),
  borrowingController.getAllBorrowings
);
// Lấy danh sách sách mà độc giả đang mượn
router.get(
  "/reader",
  verifyToken, // Xác thực token
  borrowingController.getReaderBorrowings
);

module.exports = router;