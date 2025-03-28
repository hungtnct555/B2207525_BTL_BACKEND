const Reader = require("../models/reader.model");
const BorrowingRecord = require("../models/borrowing.model");
const bcrypt = require("bcrypt");
class ReaderService {
  // Đăng ký tài khoản độc giả
  async register(payload) {
    const reader = new Reader(payload);

    try {
      const savedReader = await reader.save();
      return savedReader;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Email hoặc MADOCGIA đã tồn tại. Vui lòng sử dụng thông tin khác."
        );
      }
      throw error;
    }
  }
  // Lấy độc giả cuối cùng để tạo mã độc giả tự động
  async getLastReader() {
    return await Reader.findOne().sort({ MADOCGIA: -1 });
  }
  
  // Xác thực đăng nhập
  async authenticate(email, password) {
    const reader = await Reader.findOne({ Email: email });
    if (!reader) {
      throw new Error("Email không tồn tại.");
    }
    console.log("Reader:", reader);
    console.log("Password:", password);
    const isPasswordValid = await bcrypt.compare(password, reader.Password);
    console.log("isPasswordValid:", isPasswordValid);
    if (!isPasswordValid) {
      throw new Error("Mật khẩu không đúng.");
    }

    return reader;
  }

  // Lấy thông tin độc giả theo MADOCGIA
  async findById(madocgia) {
    const reader = await Reader.findOne({ MADOCGIA: madocgia }).select(
      "-Password"
    );
    if (!reader) {
      throw new Error(`Không tìm thấy độc giả với MADOCGIA=${madocgia}.`);
    }
    return reader;
  }

  // Cập nhật thông tin độc giả
  async update(madocgia, payload) {
    const updatedReader = await Reader.findOneAndUpdate(
      { MADOCGIA: madocgia },
      { $set: payload },
      { new: true }
    ).select("-Password");
    if (!updatedReader) {
      throw new Error(`Không tìm thấy độc giả với MADOCGIA=${madocgia}.`);
    }
    return updatedReader;
  }

  async updatePassword(madocgia, oldPassword, newPassword) {
    const reader = await Reader.findOne({ MADOCGIA: madocgia });
    if (!reader) {
      throw new Error(`Không tìm thấy độc giả với MADOCGIA=${madocgia}.`);
    }

    // Kiểm tra mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(oldPassword, reader.Password);
    if (!isPasswordValid) {
      throw new Error("Mật khẩu cũ không đúng.");
    }

    // Cập nhật mật khẩu mới
    reader.Password = newPassword;
    await reader.save();
    console.log("Mật khẩu đã được cập nhật.");
  }
  // Tìm kiếm sách (không yêu cầu đăng nhập)
  async searchBooks(keyword) {
    // Giả sử bạn có model SACH
    const books = await Book.find({ TenSach: new RegExp(keyword, "i") }).select(
      "-_id"
    );
    return books;
  }

  // Lấy danh sách tất cả độc giả
  async getAll() {
    try {
      // Lấy tất cả độc giả, loại bỏ trường Password để bảo mật
      const readers = await Reader.find({}, "-Password");
      return readers;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách độc giả:", error);
      throw new Error("Không thể lấy danh sách độc giả.");
    }
  }

  // Xóa độc giả
  async delete(MADOCGIA) {
    return await Reader.findOneAndDelete({ MADOCGIA });
  }
  // // Gửi yêu cầu mượn sách
  // async requestBorrowBook(madocgia, masach) {
  //     const book = await Book.findOne({ MASACH: masach });
  //     if (!book) {
  //         throw new Error(`Sách với MASACH=${masach} không tồn tại.`);
  //     }

  //     // Tạo yêu cầu mượn sách ở trạng thái "pending"
  //     const borrowingRecord = new BorrowingRecord({
  //         MADOCGIA: madocgia,
  //         MASACH: masach,
  //         NGAYMUON: new Date(),
  //         NGAYTRA: null,
  //         MSNV: null, // Sẽ được gán khi nhân viên xác nhận
  //         Status: "pending" // Trạng thái chờ xác nhận
  //     });

  //     try {
  //         const savedRecord = await borrowingRecord.save();
  //         return savedRecord; // Trả về bản ghi yêu cầu
  //     } catch (error) {
  //         throw new Error("Không thể yêu cầu mượn sách. Có thể bản ghi đã tồn tại.");
  //     }
  // }
}

module.exports = ReaderService;
