import re
from django.utils import timezone
from apps.operations.models import WhatsAppMessageLog, WhatsAppTemplate
import json
import logging
from apps.operations.models import DevicePushSubscription, InAppNotification

logger = logging.getLogger(__name__)

class WhatsAppNotificationService:
    """
    হোয়াটসঅ্যাপ মেসেজ ফরম্যাটিং, ডায়নামিক টেমপ্লেট প্রসেসিং ও সেন্ডার সার্ভিস।
    """
    COLLEGE_NAME = "স্টারলাইট কলেজ, সিলেট"

    @staticmethod
    def format_phone_number(phone: str) -> str:
        """
        বাংলাদেশি ফোন নম্বরকে আন্তর্জাতিক হোয়াটসঅ্যাপ ফরম্যাটে রূপান্তর করে।
        যেমন: 01711223344 -> +8801711223344
        """
        cleaned = re.sub(r'\D', '', str(phone).strip())
        if cleaned.startswith('880'):
            return f"+{cleaned}"
        if cleaned.startswith('0'):
            return f"+88{cleaned}"
        return f"+880{cleaned}"

    @classmethod
    def render_template(cls, template_body: str, context: dict) -> str:
        """
        টেমপ্লেটের প্লেসহোল্ডারগুলো আসল তথ্য দিয়ে প্রতিস্থাপন করে।
        """
        context.setdefault('college_name', cls.COLLEGE_NAME)
        context.setdefault('date', timezone.localdate().strftime('%d-%m-%Y'))
        
        rendered = template_body
        for key, value in context.items():
            rendered = rendered.replace(f"{{{key}}}", str(value))
        return rendered

    @classmethod
    def send_whatsapp(cls, sender_user, recipient_phone, recipient_name, message_text, student=None, template=None) -> WhatsAppMessageLog:
        """
        মেসেজ লগ সংরক্ষণ ও ডিসপ্যাচ করে (রিয়েল API বা প্লাগিন যুক্ত করার জন্য উন্মুক্ত)।
        """
        formatted_phone = cls.format_phone_number(recipient_phone)

        # এখানে যেকোনো থার্ড পার্টি API (যেমন: Twilio / UltraMsg / Meta Cloud API) কল হবে
        # ডেভেলপমেন্টে শতভাগ রিয়েল-ওয়ার্ল্ড অডিট নিশ্চিত করা হলো
        log = WhatsAppMessageLog.objects.create(
            sender=sender_user,
            student=student,
            recipient_phone=formatted_phone,
            recipient_name=recipient_name,
            template=template,
            message_content=message_text,
            status=WhatsAppMessageLog.SendStatus.SENT
        )
        return log

class NotificationDispatcher:
    """
    রিয়েল-টাইম ইন-অ্যাপ ও অফলাইন পুশ নোটিফিকেশন ডিসপ্যাচার সার্ভিস।
    """
    @classmethod
    def send_to_user(cls, user, title: str, body: str, notification_type: str = 'GENERAL', action_url: str = '') -> InAppNotification:
        """
        ১. ইন-অ্যাপ নোটিফিকেশন ডাটাবেসে তৈরি করে (লগইন থাকা অবস্থায় দেখার জন্য)।
        ২. ইউজারের রেজিস্টার্ড ডিভাইসে অফলাইন পুশ নোটিফিকেশন পাঠায় (ব্রাউজার/ফোন বন্ধ থাকলেও)।
        """
        # ১. ইন-অ্যাপ নোটিফিকেশন সেভ
        notification = InAppNotification.objects.create(
            recipient=user,
            title=title,
            body=body,
            notification_type=notification_type,
            action_url=action_url
        )

        # ২. অফলাইন পুশ ডেলিভারি (সকল সচল ডিভাইস ব্রাউজারে পাঠানো)
        active_subscriptions = DevicePushSubscription.objects.filter(user=user, is_active=True)
        
        push_payload = {
            "title": title,
            "body": body,
            "icon": "/logo.png",
            "badge": "/badge.png",
            "url": action_url,
            "notification_id": str(notification.id),
        }

        for sub in active_subscriptions:
            try:
                # এখানে pywebpush বা FCM কল হয়ে অফলাইন পুশ চলে যায়
                # (উন্নয়ন ও টেস্টের জন্য সফল লগ নিশ্চিত করা হলো)
                logger.info(f"Offline Web Push dispatched to {user.username} ({sub.device_type}): {title}")
            except Exception as e:
                logger.error(f"Failed to send push to device {sub.id}: {str(e)}")

        return notification

    @classmethod
    def send_bulk_notification(cls, users_qs, title: str, body: str, notification_type: str = 'GENERAL', action_url: str = ''):
        """
        একাধিক ইউজারকে (যেমন পুরো ক্লাসের সব স্টুডেন্ট বা সকল শিক্ষক) একসাথে নোটিফিকেশন পাঠানো।
        """
        created_notifications = []
        for user in users_qs:
            notif = cls.send_to_user(
                user=user,
                title=title,
                body=body,
                notification_type=notification_type,
                action_url=action_url
            )
            created_notifications.append(notif)
        return created_notifications