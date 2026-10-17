from datetime import timedelta
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from apps.common.models import BaseModel
from apps.users_auth.models import StudentProfile, User

class BookCategory(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Book Category'
        verbose_name_plural = 'Book Categories'

    def __str__(self):
        return self.name


class Book(BaseModel):
    """
    লাইব্রেরির বই ক্যাটালগ ও স্টক মডেল।
    """
    title = models.CharField(max_length=255, db_index=True)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=50, blank=True, unique=True, null=True)
    category = models.ForeignKey(BookCategory, on_delete=models.PROTECT, related_name='books')
    shelf_location = models.CharField(max_length=50, help_text="যেমন: আলমারি-৩, তাক-বি")
    
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = 'Book'
        verbose_name_plural = 'Books'
        ordering = ['title']

    def clean(self):
        if self.available_copies > self.total_copies:
            raise ValidationError("অবশিষ্ট বইয়ের সংখ্যা মোট কপির চেয়ে বেশি হতে পারে না।")

    def __str__(self):
        return f"{self.title} - {self.author} ({self.available_copies}/{self.total_copies} Copies Available)"


class BookBorrowRequest(BaseModel):
    """
    ৪-ধাপের লাইব্রেরি ফ্লো:
    ১. Student রিকোয়েস্ট করবে (REQUESTED)
    ২. শিক্ষক তদারকি করে অনুমোদন দেবেন (TEACHER_APPROVED)
    ৩. লাইব্রেরি ম্যানেজার বই ইস্যু করবেন ও স্টক কমবে (ISSUED)
    ৪. বই ফেরত দিলে স্টক বাড়বে (RETURNED)
    """
    class BorrowStatus(models.TextChoices):
        REQUESTED = 'REQUESTED', 'অনুরোধ করা হয়েছে (Requested by Student)'
        TEACHER_APPROVED = 'TEACHER_APPROVED', 'শিক্ষক কর্তৃক অনুমোদিত (Approved by Teacher)'
        TEACHER_REJECTED = 'TEACHER_REJECTED', 'শিক্ষক কর্তৃক বাতিল (Rejected)'
        ISSUED = 'ISSUED', 'বই প্রদান করা হয়েছে (Issued from Library)'
        RETURNED = 'RETURNED', 'ফেরত সম্পন্ন (Returned to Library)'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='borrowed_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrow_records')
    reason = models.CharField(max_length=255, blank=True, help_text="বই নেওয়ার উদ্দেশ্য বা কারণ")
    status = models.CharField(max_length=25, choices=BorrowStatus.choices, default=BorrowStatus.REQUESTED, db_index=True)

    # ধাপ ২: শিক্ষক তদারকি
    teacher_approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_book_requests')
    teacher_approved_at = models.DateTimeField(null=True, blank=True)
    teacher_remarks = models.CharField(max_length=255, blank=True)

    # ধাপ ৩ ও ৪: লাইব্রেরি ম্যানেজার ইস্যু ও রিটার্ন
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_library_books')
    issued_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    late_fine = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    class Meta:
        verbose_name = 'Book Borrow Request'
        verbose_name_plural = 'Book Borrow Requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.roll_number} - {self.book.title} ({self.status})"