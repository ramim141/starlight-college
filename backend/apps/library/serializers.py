from rest_framework import serializers
from apps.library.models import Book, BookCategory, BookBorrowRequest

class BookCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCategory
        fields = '__all__'


class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'category', 'category_name', 'shelf_location', 'total_copies', 'available_copies', 'created_at']


class BookBorrowRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_unique_id = serializers.CharField(source='student.student_unique_id', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()

    class Meta:
        model = BookBorrowRequest
        fields = [
            'id', 'student', 'student_unique_id', 'roll_number', 'student_name', 
            'book', 'book_title', 'reason', 'status', 'status_display', 
            'teacher_approver', 'teacher_name', 'teacher_approved_at', 'teacher_remarks',
            'issued_by', 'issued_by_name', 'issued_at', 'due_date', 'returned_at', 'late_fine', 'created_at'
        ]
        read_only_fields = [
            'id', 'student', 'status', 'teacher_approver', 'teacher_approved_at', 
            'issued_by', 'issued_at', 'due_date', 'returned_at', 'late_fine', 'created_at'
        ]

    def get_teacher_name(self, obj) -> str | None:
        if obj.teacher_approver:
            return obj.teacher_approver.get_full_name() or obj.teacher_approver.username
        return None

    def get_issued_by_name(self, obj) -> str | None:
        if obj.issued_by:
            return obj.issued_by.get_full_name() or obj.issued_by.username
        return None