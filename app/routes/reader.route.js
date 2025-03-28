const express = require("express");
const readerController = require("../controllers/reader.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Đăng ký tài khoản
router.post("/register", readerController.register);

// Đăng nhập
router.post("/login", readerController.login);

// Tìm kiếm sách (không yêu cầu đăng nhập)
router.get("/search", readerController.searchBooks);

// Lấy thông tin tài khoản (yêu cầu đăng nhập)
router.get("/:MADOCGIA", verifyToken, readerController.getInfo);

// Cập nhật thông tin tài khoản (yêu cầu đăng nhập)
router.put("/:MADOCGIA", verifyToken, readerController.updateInfo);

router.put("/:MADOCGIA/password", verifyToken, readerController.updatePassword);
// Gửi yêu cầu mượn sách (nếu cần kích hoạt lại)
// router.post("/borrow/request", verifyToken, readerController.requestBorrowBook);

// Lấy danh sách độc giả (yêu cầu đăng nhập)
router.get("/", verifyToken, readerController.getAllReaders);
// Xóa độc giả
router.delete("/:MADOCGIA", readerController.deleteReader);
module.exports = router;
