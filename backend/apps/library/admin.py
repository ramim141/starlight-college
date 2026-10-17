from django.contrib import admin
from apps.library.models import Book, BookBorrowRequest, BookCategory

@admin.register(BookCategory)
class BookCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'shelf_location', 'available_copies', 'total_copies', 'isbn')
    list_filter = ('category', 'shelf_location')
    search_fields = ('title', 'author', 'isbn')
    ordering = ('title',)


@admin.register(BookBorrowRequest)
class BookBorrowRequestAdmin(admin.ModelAdmin):
    list_display = ('student', 'book', 'status', 'teacher_approver', 'due_date', 'returned_at', 'late_fine')
    list_filter = ('status', 'due_date', 'returned_at')
    search_fields = ('student__student_unique_id', 'student__roll_number', 'book__title', 'teacher_approver__username')
    date_hierarchy = 'created_at'