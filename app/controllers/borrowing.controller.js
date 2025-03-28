const BorrowingService = require("../services/borrowing.service");
const borrowingService = new BorrowingService();

// Tạo yêu cầu mượn sách
exports.createBorrowRequest = async (req, res, next) => {
  try {
    console.log("Request body:", req.body);
    const MADOCGIA = req.user.MADOCGIA; // Lấy MADOCGIA từ token
    const { MASACH } = req.body; // Lấy MASACH từ request body

    const result = await borrowingService.createBorrowRequest({
      MADOCGIA,
      MASACH,
    });
    res.status(201).json({
      message: "Yêu cầu mượn sách đã được tạo thành công!",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu mượn sách:", error);
    next(error);
  }
};

// Xác nhận mượn sách
exports.approveBorrow = async (req, res, next) => {
  const { MaMuon } = req.params;
  const { MSNV } = req.user;

  try {
    const result = await borrowingService.approveBorrow(MaMuon, MSNV);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Trả sách
exports.returnBook = async (req, res, next) => {
  const { MaMuon } = req.params;
  const { MSNV } = req.user;

  try {
    const result = await borrowingService.returnBook(MaMuon, MSNV);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// lấy danh sách yêu cầu chờ
exports.getPendingRequests = async (req, res, next) => {
  try {
    const pendingRequests = await borrowingService.getPendingRequests();
    res.json(pendingRequests);
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả các yêu cầu mượn sách (bao gồm cả trạng thái "pending" và "approved")
exports.getAllBorrowings = async (req, res, next) => {
  try {
    const borrowings = await borrowingService.getAllBorrowings();
    res.status(200).json(borrowings);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu mượn sách:", error);
    next(error);
  }
};
// Lấy danh sách sách mà độc giả đang mượn
exports.getReaderBorrowings = async (req, res, next) => {
  try {
    const { MADOCGIA } = req.user; // Lấy MADOCGIA từ token

    // Gọi service để lấy danh sách sách đang mượn
    const borrowings = await borrowingService.getReaderBorrowings(MADOCGIA);

    // Trả về danh sách sách đang mượn
    res.status(200).json(borrowings);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sách đang mượn:", error);
    next(error);
  }
};