
const Publisher = require("../models/publisher.model"); // Import mô hình nhà xuất bản
const Book = require("../models/book.model"); // Import mô hình liên kết với bảng SACH

class PublisherService {
    // Thêm mới nhà xuất bản
   async create(payload) {
        // Kiểm tra nếu MANXB đã tồn tại
        const existingPublisher = await Publisher.findOne({ MANXB: payload.MANXB });
        if (existingPublisher) {
            throw new Error("MANXB đã tồn tại. Vui lòng sử dụng mã khác.");
        }
        // Tạo mới nếu không trùng lặp
        const publisher = new Publisher(payload);
        return await publisher.save();
    }

    // Lấy danh sách tất cả nhà xuất bản
    async find(filter) {
        return await Publisher.find(filter); // Trả về danh sách tất cả hoặc có lọc (filter)
    }

    // Lấy thông tin nhà xuất bản theo MANXB
    async findById(manxb) {
        return await Publisher.findOne({ MANXB: manxb }); // Tìm theo MANXB
    }

    // Cập nhật thông tin nhà xuất bản theo MANXB
    async update(manxb, payload) {
        const updatedPublisher = await Publisher.findOneAndUpdate(
            { MANXB: manxb }, // Điều kiện
            { $set: payload }, // Cập nhật nội dung
            { new: true } // Trả về tài liệu sau khi cập nhật
        );
        if (!updatedPublisher) {
            throw new Error(`Không tìm thấy nhà xuất bản với MANXB=${manxb}.`);
        }
        return updatedPublisher;
    }

    // Xóa nhà xuất bản theo MANXB
    async delete(manxb) {
        // Kiểm tra nếu có sách liên kết với nhà xuất bản
        const relatedBooks = await Book.find({ MANXB: manxb });
        if (relatedBooks.length > 0) {
            throw new Error("Không thể xóa nhà xuất bản vì có sách liên kết.");
        }

        // Xóa nhà xuất bản nếu không có sách liên kết
        const deletedPublisher = await Publisher.findOneAndDelete({ MANXB: manxb });
        if (!deletedPublisher) {
            throw new Error(`Không tìm thấy nhà xuất bản với MANXB=${manxb}.`);
        }
        return deletedPublisher;
    }
}

module.exports = PublisherService;