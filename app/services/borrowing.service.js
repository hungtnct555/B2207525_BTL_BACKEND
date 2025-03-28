const BorrowingRecord = require("../models/borrowing.model");
const Book = require("../models/book.model");
const Reader = require("../models/reader.model");
const Employee = require("../models/employee.model");
// Thêm thư viện uuid để tạo mã duy nhất
class BorrowingService {
  // Kiểm tra liên kết (Sách, Độc giả, Nhân viên)
  async validateRelationships(MASACH, MADOCGIA, MSNV) {
    const book = await Book.findOne({ MASACH });
    if (!book) throw new Error(`Sách với MASACH=${MASACH} không tồn tại.`);

    const reader = await Reader.findOne({ MADOCGIA });
    if (!reader)
      throw new Error(`Độc giả với MADOCGIA=${MADOCGIA} không tồn tại.`);

    if (MSNV) {
      const employee = await Employee.findOne({ MSNV });
      if (!employee)
        throw new Error(`Nhân viên với MSNV=${MSNV} không tồn tại.`);
    }
  }

  // Tạo yêu cầu mượn sách
  async createBorrowRequest({ MADOCGIA, MASACH }) {
    // Kiểm tra liên kết giữa sách và độc giả
    await this.validateRelationships(MASACH, MADOCGIA, null);

    // Kiểm tra số lượng sách còn lại
    const book = await Book.findOne({ MASACH });
    if (!book || book.SOQUYEN <= 0) {
      throw new Error(`Sách với MASACH=${MASACH} đã hết số lượng.`);
    }

    // Tạo bản ghi mượn sách
    const borrowing = new BorrowingRecord({
      MaMuon: `${MADOCGIA}-${MASACH}-${Date.now()}`, // Tạo mã mượn sách duy nhất
      MADOCGIA,
      MASACH,
      TrangThai: "pending", // Trạng thái mặc định là chờ xác nhận
      NGAYMUON: new Date(),
      NGAYTRA: null,
      MSNV: null,
    });

    try {
      // Lưu bản ghi mượn sách
      const savedBorrowing = await borrowing.save();

      // Giảm số lượng sách còn lại
      await Book.findOneAndUpdate(
        { MASACH },
        { $inc: { SOQUYEN: -1 } }, // Giảm SOQUYEN đi 1
        { new: true } // Trả về document đã cập nhật
      );

      return savedBorrowing;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error("Bản ghi mượn sách đã tồn tại.");
      }
      throw error;
    }
  }

  // Lấy danh sách yêu cầu mượn sách (trạng thái "pending")
  async getPendingRequests() {
    return await BorrowingRecord.find({ TrangThai: "pending" })
      .select("-_id") // Không hiển thị trường _id
      .lean(); // Tối ưu cho hiển thị
  }

  // Xác nhận mượn sách
  async approveBorrow(MaMuon, MSNV) {
    const borrowing = await BorrowingRecord.findOne({
      MaMuon,
      TrangThai: "pending",
    });
    if (!borrowing) {
      throw new Error("Không tìm thấy yêu cầu mượn sách cần xác nhận.");
    }

    // Cập nhật trạng thái và ghi nhận nhân viên xử lý
    borrowing.TrangThai = "approved";
    borrowing.MSNV = MSNV;
    await borrowing.save();
    return borrowing;
  }

  // Trả sách
  async returnBook(MaMuon, MSNV) {
    // Tìm bản ghi mượn sách với trạng thái "approved"
    const borrowing = await BorrowingRecord.findOne({
      MaMuon,
      TrangThai: "approved",
    });
    if (!borrowing) {
      throw new Error("Không tìm thấy bản ghi đã xác nhận để trả sách.");
    }

    // Cập nhật ngày trả và trạng thái
    borrowing.NGAYTRA = new Date();
    borrowing.TrangThai = "returned";
    borrowing.MSNV = MSNV; // Ghi nhận nhân viên xử lý trả sách
    await borrowing.save();

    // Tăng số lượng sách (SOQUYEN) lên 1
    const book = await Book.findOne({ MASACH: borrowing.MASACH });
    if (!book) {
      throw new Error(`Không tìm thấy sách với MASACH=${borrowing.MASACH}.`);
    }

    book.SOQUYEN += 1; // Tăng số lượng sách
    await book.save();

    return borrowing;
  }

  // Lấy tất cả các yêu cầu mượn sách (bao gồm cả trạng thái "pending" và "approved")
  async getAllBorrowings() {
    return await BorrowingRecord.find({
      TrangThai: { $in: ["pending", "approved"] },
    });
  }
  // Lấy danh sách sách mà độc giả đang mượn
  async getReaderBorrowings(MADOCGIA) {
    return await BorrowingRecord.find({
      MADOCGIA,
      TrangThai: "approved", // Chỉ lấy sách đang mượn
    }).populate("MASACH", "TENSACH TACGIA"); // Populate để lấy thông tin sách
  }
}

module.exports = BorrowingService;