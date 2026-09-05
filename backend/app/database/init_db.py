import sys
import os

# =================================================================
# 1. FIX PATH LỖI "ModuleNotFoundError: No module named 'app'"
# =================================================================
# Lấy đường dẫn tuyệt đối đến thư mục chứa file hiện tại (database/)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Lấy đường dẫn thư mục gốc của project (backend/) bằng cách lùi lại 2 cấp
root_dir = os.path.abspath(os.path.join(current_dir, '../../'))
# Thêm thư mục gốc vào danh sách tìm kiếm của Python
sys.path.append(root_dir)

# =================================================================
# 2. IMPORT CÁC THÀNH PHẦN CỦA APP
# =================================================================
try:
    # Import create_app từ file app/__init__.py
    from app import create_app
    # Import đối tượng db từ configs
    from app.configs.db import db
    # Import TẤT CẢ models để SQLAlchemy biết các bảng cần tạo
    from app.models import User, Course, Lesson, Enrollment, Payment, Quiz, Question, Answer, Post, Comment, Document, CourseProgress, LessonProgress

    print("--- Đã tìm thấy các Model và cấu hình hệ thống ---")
except ImportError as e:
    print(f"Lỗi Import: {e}")
    print("Mẹo: Đảm bảo bạn đã có file __init__.py trong các thư mục app/ và app/models/")
    sys.exit(1)


# =================================================================
# 3. KHỞI TẠO DATABASE
# =================================================================
def initialize_database():
    app = create_app()

    with app.app_context():
        try:
            print("Đang kết nối tới MySQL và tạo bảng...")
            # Lệnh quan trọng nhất để tạo các bảng thực tế trong MySQL Workbench
            db.create_all()
            print("==========================================")
            print(" CHÚC MỪNG: ĐÃ TẠO CÁC BẢNG THÀNH CÔNG! ")
            print("==========================================")
            print("Bây giờ bạn có thể mở MySQL Workbench để kiểm tra.")
        except Exception as e:
            print(f"Lỗi khi tạo bảng: {e}")
            print("Kiểm tra lại:")
            print("1. File .env đã đúng thông tin user/password MySQL chưa?")
            print("2. Bạn đã tạo Schema (Database) trong Workbench chưa?")


if __name__ == "__main__":
    initialize_database()