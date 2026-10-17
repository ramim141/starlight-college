import uuid
from django.db import models

class BaseModel(models.Model):
    """
    সমস্ত অ্যাপের টেবিলের জন্য অ্যাবস্ট্রাক্ট বেস মডেল।
    স্বয়ংক্রিয়ভাবে টাইমস্ট্যাম্প ও ইউআইডি ট্র্যাক করবে।
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SystemActivityLog(BaseModel):
    """
    পুরো সিস্টেমের অপরিবর্তনযোগ্য (Immutable) সিকিউরিটি ও অ্যাক্টিভিটি অডিট লগ।
    """
    class ActionType(models.TextChoices):
        LOGIN = 'LOGIN', 'লগইন (User Login)'
        FEE_COLLECTION = 'FEE_COLLECTION', 'ফি আদায় (Fee Collection)'
        MARKS_ENTRY = 'MARKS_ENTRY', 'পরীক্ষার নম্বর এন্ট্রি/পরিবর্তন'
        RESULT_PUBLISH = 'RESULT_PUBLISH', 'ফলাফল প্রকাশ'
        VOUCHER_EXPENSE = 'VOUCHER_EXPENSE', 'খরচের ভাউচার অনুমোদন'
        SALARY_DISBURSE = 'SALARY_DISBURSE', 'বেতন ছাড়করণ'
        LEAVE_APPROVAL = 'LEAVE_APPROVAL', 'ছুটি অনুমোদন'
        SECURITY_ALERT = 'SECURITY_ALERT', 'নিরাপত্তা অ্যালার্ট'

    user = models.ForeignKey('users_auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=150)
    user_role = models.CharField(max_length=50)
    action = models.CharField(max_length=50, choices=ActionType.choices, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    description = models.TextField(help_text="কী পরিবর্তন করা হলো তার বিস্তারিত")

    class Meta:
        verbose_name = 'System Activity Log'
        verbose_name_plural = 'System Activity Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.action}] {self.username} ({self.user_role}) - {self.created_at.strftime('%Y-%m-%d %H:%M')}"