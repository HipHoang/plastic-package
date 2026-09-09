import sys
import os

# ============================================================
# 1. FIX PATH
# ============================================================
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "../../"))

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)


# ============================================================
# 2. IMPORT APP + DATABASE + MODELS
# ============================================================
try:
    from app import create_app
    from app.configs.db import db

    # Import các model hiện đang được sử dụng
    from app.models import (
        User,
        Course,
        ProductCategory,
        Enrollment,
        Payment,
        Order,
        Review,
        Post,
        Comment,
        ChatMessage,
        Conversation,
        ConversationUser,
        Message,
    )

    print("--- Đã tìm thấy các Model và cấu hình hệ thống ---")

except ImportError as e:
    print(f"Lỗi Import: {e}")
    print("Kiểm tra lại cấu trúc thư mục app/ và app/models/")
    sys.exit(1)


# ============================================================
# 3. KHỞI TẠO DATABASE
# ============================================================
def initialize_database():
    app = create_app()

    with app.app_context():
        try:
            print("Đang kết nối tới MySQL và tạo bảng...")

            db.create_all()

            print("==========================================")
            print(" CHÚC MỪNG: ĐÃ TẠO CÁC BẢNG THÀNH CÔNG!")
            print("==========================================")
            print("Bạn có thể mở MySQL Workbench để kiểm tra.")

        except Exception as e:
            db.session.rollback()

            print("==========================================")
            print(" LỖI KHI TẠO DATABASE")
            print("==========================================")
            print(f"Lỗi: {e}")
            print("")
            print("Kiểm tra lại:")
            print("1. File .env có đúng thông tin MySQL không?")
            print("2. Database/Schema MySQL đã được tạo chưa?")
            print("3. MySQL Server đang chạy chưa?")


if __name__ == "__main__":
    initialize_database()