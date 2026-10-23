from django.db import migrations


def seed_homepage_content(apps, schema_editor):
    HomepageHero = apps.get_model('operations', 'HomepageHero')
    HomepageService = apps.get_model('operations', 'HomepageService')
    HomepageDepartment = apps.get_model('operations', 'HomepageDepartment')
    HomepageAbout = apps.get_model('operations', 'HomepageAbout')
    HomepageAdmission = apps.get_model('operations', 'HomepageAdmission')
    HomepageAdmissionStep = apps.get_model('operations', 'HomepageAdmissionStep')
    HomepageFAQ = apps.get_model('operations', 'HomepageFAQ')
    HomepageContact = apps.get_model('operations', 'HomepageContact')

    HomepageHero.objects.get_or_create(
        title='জ্ঞান, শৃঙ্খলা ও নেতৃত্বের',
        defaults={
            'badge': 'সিলেট বিভাগের শীর্ষ ডিজিটাল উচ্চমাধ্যমিক বিদ্যাপীঠ',
            'highlighted_title': 'ডিজিটাল উৎকর্ষতা',
            'description': 'স্টারলাইট কলেজ, সিলেট — একাদশ ও দ্বাদশ শ্রেণির বিশ্বাসযোগ্য পাঠদান, অভিজ্ঞ শিক্ষকমণ্ডলী, আধুনিক বিজ্ঞান ও আইসিটি ল্যাব এবং শতভাগ ডিজিটাল অটোমেশনের অনন্য বিদ্যাপীঠ।',
            'ticker_text': '২০২৬-২০২৭ শিক্ষাবর্ষে একাদশ শ্রেণিতে ভর্তি চলছে • দ্বাদশ শ্রেণির নির্বাচনী পরীক্ষার রুটিন প্রকাশিত হয়েছে',
        },
    )
    services = [
        ('idcard', 'ডিজিটাল আইডি কার্ড', 'স্মার্ট কার্ড ডাউনলোড ও গেট পাস প্রিভিউ', 'কিউআর ভেরিফিকেশন', 'আইডি কার্ড তথ্য'),
        ('fees', 'অনলাইন ফি প্রদান', 'মাসিক বেতন পরিশোধ ও ডিজিটাল রসিদ ডাউনলোড', 'বিকাশ / নগদ', 'পেমেন্ট গাইড'),
        ('transport', 'কলেজ বাস রুট', 'জিপিএস ট্র্যাকিং, শিডিউল ও পিক-আপ পয়েন্ট', '১০টি রুট', 'রুট ম্যাপ দেখুন'),
        ('routine', 'স্মার্ট ক্লাস রুটিন', 'শাখাভিত্তিক পিরিয়ড ও প্র্যাকটিক্যাল ল্যাব সময়', 'দৈনিক সূচি', 'রুটিন দেখুন'),
        ('library', 'সেন্ট্রাল লাইব্রেরি', 'বই ক্যাটালগ অনুসন্ধান ও ডিজিটাল বুক ইস্যু', '১৫,০০০+ বই', 'ক্যাটালগ দেখুন'),
    ]
    for index, (key, title, description, badge, action_label) in enumerate(services):
        HomepageService.objects.get_or_create(
            key=key,
            defaults={'title': title, 'description': description, 'badge': badge, 'action_label': action_label, 'display_order': index},
        )

    departments = [
        ('science', 'বিজ্ঞান বিভাগ (Science)', 'ভবিষ্যতের ডাক্তার, প্রকৌশলী ও বিজ্ঞানী তৈরির শ্রেষ্ঠ প্ল্যাটফর্ম।'),
        ('business', 'ব্যবসায় শিক্ষা (Business Studies)', 'করপোরেট লিডার, ব্যাংকার ও সফল উদ্যোক্তা গড়ার বিশেষায়িত পাঠক্রম।'),
        ('humanities', 'মানবিক বিভাগ (Humanities)', 'মানবিক মূল্যবোধ, সৃজনশীলতা ও নেতৃত্ব বিকাশের সমন্বিত পাঠক্রম।'),
    ]
    for index, (key, title, description) in enumerate(departments):
        HomepageDepartment.objects.get_or_create(
            key=key,
            defaults={'title': title, 'description': description, 'features': [], 'display_order': index},
        )

    HomepageAbout.objects.get_or_create(
        title='"আমরা শুধু পরীক্ষার্থী গড়ি না, নৈতিক ও প্রযুক্তিজ্ঞানসম্পন্ন আগামী দিনের বিশ্বনাগরিক গড়ি।"',
        defaults={
            'badge': 'অধ্যক্ষের বাণী ও দৃষ্টিভঙ্গি',
            'principal_name': 'প্রফেসর ড. মুহাম্মদ আব্দুল্লাহ',
            'principal_role': 'অধ্যক্ষ, স্টারলাইট কলেজ, সিলেট',
            'principal_credentials': 'পিএইচডি (ঢাকা বিশ্ববিদ্যালয়), সাবেক অধ্যাপক',
            'first_paragraph': 'বিসমিল্লাহির রাহমানির রাহিম। আধুনিক শিক্ষার মূল লক্ষ্য কেবল পাঠ্যপুস্তকের জ্ঞান অর্জন নয়, বরং আত্মমর্যাদাশীল, মানবিক ও প্রযুক্তিবিদ্যায় পারদর্শী ব্যক্তিত্বের বিকাশ।',
            'second_paragraph': 'আমাদের স্বয়ংক্রিয় ক্লাসরুম, ইনচার্জ শিক্ষক তত্ত্বাবধান এবং ডিজিটাল অভিভাবক যোগাযোগ ব্যবস্থার মাধ্যমে প্রতিটি শিক্ষার্থীর প্রতি ব্যক্তিগত নজর রাখা হয়।',
        },
    )

    admission, _ = HomepageAdmission.objects.get_or_create(
        title='ভর্তি নির্দেশিকা ও সাধারণ জিজ্ঞাসাসমূহ',
        defaults={
            'badge': 'ভর্তি ২০২৬-২০২৭',
            'description': 'একাদশ শ্রেণিতে ভর্তি সংক্রান্ত যেকোনো তথ্যের জন্য নিচের রোডম্যাপ ও প্রশ্নোত্তর পড়ুন',
        },
    )
    for index, (step, title, description, color) in enumerate([
        ('১', 'অনলাইন আবেদন', 'বোর্ড নিয়মে কলেজ চয়েস', 'bg-[#EA580C]'),
        ('২', 'মেধা তালিকা প্রকাশ', 'এসএমএস কনফার্মেশন', 'bg-[#0F2C59]'),
        ('৩', 'ডকুমেন্ট ভেরিফিকেশন', 'মার্কশিট ও সনদ যাচাই', 'bg-emerald-600'),
        ('৪', 'ডিজিটাল আইডি প্রাপ্তি', 'স্টুডেন্ট পোর্টাল পিন', 'bg-purple-600'),
    ]):
        HomepageAdmissionStep.objects.get_or_create(admission=admission, step=step, defaults={'title': title, 'description': description, 'color': color, 'display_order': index})
    HomepageFAQ.objects.get_or_create(
        admission=admission,
        question='একাদশ শ্রেণিতে ভর্তির ন্যূনতম যোগ্যতা কী?',
        defaults={'answer': 'বিজ্ঞান শাখায় GPA 4.00, ব্যবসায় শিক্ষা শাখায় GPA 3.00 এবং মানবিক শাখায় GPA 2.50 প্রয়োজন।', 'display_order': 0},
    )

    HomepageContact.objects.get_or_create(
        title='ক্যাম্পাস পরিদর্শন ও ভর্তি তথ্য সেল',
        defaults={
            'badge': 'যোগাযোগ ও দিকনির্দেশনা',
            'description': 'যেকোনো প্রশ্ন বা ভর্তি সংক্রান্ত পরামর্শের জন্য সরাসরি আমাদের ক্যাম্পাসে আসুন অথবা নিচের নম্বরে কল করুন।',
            'address': 'আম্বরখানা মেইন রোড, বিমানবন্দর সড়ক মোড়, সিলেট সদর, সিলেট-৩১০০।',
            'hotline': '+৮৮০১৭১২-৩৪৫৬৭৮, +৮৮০৮২১-৭৬৫৪৩২',
            'office_hours': 'শনিবার হতে বৃহস্পতিবার: সকাল ৮:০০ হতে বিকাল ৪:০০ পর্যন্ত',
            'form_title': 'ভর্তি সংক্রান্ত কোনো জিজ্ঞাসা আছে? আমাদের লিখুন',
            'form_description': 'আপনার তথ্য দিন, আমাদের ভর্তি অফিসার অতি দ্রুত আপনার সাথে ফোনে কথা বলবেন।',
        },
    )


class Migration(migrations.Migration):
    dependencies = [('operations', '0010_homepageabout_homepageadmission_homepagecontact_and_more')]
    operations = [migrations.RunPython(seed_homepage_content, migrations.RunPython.noop)]
