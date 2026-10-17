নিচে আপনার পুরো প্রজেক্টের শুরু থেকে শেষ পর্যন্ত করা সমস্ত কাজ, আর্কিটেকচার, ডেটাবেস স্কিমা, বিজনেস লজিক, সিকিউরিটি এবং এপিআই এন্ডপয়েন্টগুলোর একটি পূর্ণাঙ্গ ও এন্টারপ্রাইজ-গ্রেড **`backend.md`** ফাইল প্রস্তুত করে দেওয়া হলো।

আপনি সরাসরি এই পুরো টেক্সটটি কপি করে আপনার প্রজেক্টের রুটে **`backend.md`** নামে সেভ করে রাখতে পারেন।

---

```markdown
# 🎓 STARLIGHT COLLEGE ERP — BACKEND ARCHITECTURE & TECHNICAL MANUAL
**Document Version:** 1.0.0 (Production-Ready)  
**Framework:** Django 5.1+ & Django REST Framework (DRF) 3.15+  
**Architecture:** Modular Domain-Driven Monolith (Loosely Coupled)  
**Primary Database:** SQLite (WAL Mode for Local) ➔ PostgreSQL (Production)  
**Authentication:** Stateless JWT (Rotating Refresh Tokens with Blacklisting)

---

## 📑 সূচিপত্র (Table of Contents)
1. [প্রজেক্ট আর্কিটেকচার ও ডিরেক্টরি কাঠামো](#১-প্রজেক্ট-আর্কিটেকচার-ও-ডিরেক্টরি-কাঠামো)
2. [এনভায়রনমেন্ট ও পারফরম্যান্স কনফিগারেশন](#২-এনভায়রনমেন্ট-ও-পারফরম্যান্স-কনফিগারেশন)
3. [স্প্রিন্টভিত্তিক বিস্তারিত ফিচার ও বিজনেস লজিক](#৩-স্প্রিন্টভিত্তিক-বিস্তারিত-ফিচার-ও-বিজনেস-লজিক)
   - [Sprint 1: Core Architecture, Custom User & JWT Engine](#sprint-1-core-architecture-custom-user--jwt-engine)
   - [Sprint 2: Academic Core, Student ID Generation & Operations](#sprint-2-academic-core-student-id-generation--operations)
   - [Sprint 3: Class Routine, Daily Bulk Attendance & 2-Step Leave](#sprint-3-class-routine-daily-bulk-attendance--2-step-leave)
   - [Sprint 4: Finance, Accounts, Hybrid Payroll & Vehicle Net Billing](#sprint-4-finance-accounts-hybrid-payroll--vehicle-net-billing)
   - [Sprint 5: Exam Engine, 80-20 Conversion, 5.00 GPA & Merit List](#sprint-5-exam-engine-80-20-conversion-500-gpa--merit-list)
   - [Sprint 6: Fleet Breakdown Alert, Central Marker Stock, Library & Asset Tracker](#sprint-6-fleet-breakdown-alert-central-marker-stock-library--asset-tracker)
   - [Sprint 7: Smart Admit Card (Due-Lock), Seat Plan, Certificate & Protected Complaints](#sprint-7-smart-admit-card-due-lock-seat-plan-certificate--protected-complaints)
   - [Sprint 8: Advanced Cashbook, Audit Logs, Targeted WhatsApp Engine & Clubs](#sprint-8-advanced-cashbook-audit-logs-targeted-whatsapp-engine--clubs)
4. [হাই-পারফরম্যান্স ও সার্ভার মেমরি অপ্টিমাইজেশন](#৪-হাই-পারফরম্যান্স-ও-সার্ভার-মেমরি-অপ্টিমাইজেশন)
5. [রিয়েল-টাইম বেল ও অফলাইন পুশ নোটিফিকেশন ইঞ্জিন](#৫-রিয়েল-টাইম-বেল-ও-অফলাইন-পুশ-নোটিফিকেশন-ইঞ্জিন)
6. [PWA (Progressive Web App) কনফিগারেশন](#৬-pwa-progressive-web-app-কনফিগারেশন)
7. [মাস্টার এপিআই এন্ডপয়েন্ট ক্যাটালগ (Postman Reference)](#৭-মাস্টার-এপিআই-এন্ডপয়েন্ট-ক্যাটালগ)
8. [প্রোডাকশন ডেপ্লয়মেন্ট ও ডেটাবেস ব্যাকআপ গাইড](#৮-প্রোডাকশন-ডেপ্লয়মেন্ট-ও-ডেটাবেস-ব্যাকআপ-গাইড)

---

## ১. প্রজেক্ট আর্কিটেকচার ও ডিরেক্টরি কাঠামো

প্রজেক্টের প্রতিটি বিজনেস ডোমেইন আলাদা মডিউলার অ্যাপ হিসেবে `apps/` ফোল্ডারের অধীনে সংগঠিত:

```text
college_erp_backend/
├── config/                     # Django মূল সেটিংস ও প্রজেক্ট রাউটিং
│   ├── __init__.py
│   ├── settings.py             # ক্যাশিং, থ্রটলিং, কানেকশন পুলিং সহ সেটিংস
│   ├── urls.py                 # API v1 মাস্টার রাউটিং
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── common/                 # অ্যাবস্ট্রাক্ট BaseModel, রোল পারমিশন, সিকিউরিটি অডিট লগ
│   ├── users_auth/             # কাস্টম ইউজার (৪টি রোল), TeacherProfile, StudentProfile
│   ├── academics/              # শ্রেণি, শাখা, বিষয়, রুটিন, সিলেবাস, হোমওয়ার্ক, বাল্ক হাজিরা
│   ├── operations/             # শিক্ষক হাজিরা, নোটিশ, নোটস, অ্যালুমনি, ছুটি, মার্কার, অ্যাসেট, ক্লাব, হোয়াটসঅ্যাপ
│   ├── finance/                # ইনভয়েস, ফি আদায়, জরিমানা মওকুফ, ভাউচার খরচ, পে-রোল, গাড়ির বিল, ব্যাংক লেজার
│   ├── examination/            # পরীক্ষা কনফিগ, নম্বর এন্ট্রি, গ্রেডিং স্কেল, মেধা তালিকা, সিট প্ল্যান, অ্যাডমিট কার্ড
│   └── library/                # বই ক্যাটালগ, শিক্ষার্থী আবেদন, শিক্ষক অনুমোদন ও ইস্যু/রিটার্ন
├── staticfiles/
├── media/                      # ভাউচার ছবি, প্রফাইল ফটো, ব্যাংক স্লিপ ও প্রশ্নপত্র
├── manage.py
├── requirements.txt
├── gunicorn_config.py          # প্রোডাকশন থ্রেডেড সার্ভার কনফিগারেশন
└── .env
```

---

## ২. এনভায়রনমেন্ট ও পারফরম্যান্স কনফিগারেশন

### **requirements.txt**
```text
Django>=5.1,<5.2
djangorestframework>=3.15.2
djangorestframework-simplejwt>=5.3.1
django-cors-headers>=4.4.0
python-decouple>=3.8
Pillow>=10.4.0
```

### **প্রোডাকশন অপ্টিমাইজড `config/settings.py` (মূল অংশসমূহ)**
* **Timezone:** `Asia/Dhaka` (টাইমজোন সেফ এন্ট্রি ও কাট-অফ টাইম)।
* **JWT Expiry:** Access Token: ১ দিন, Refresh Token: ৭ দিন (Blacklist enabled on rotation)।
* **DB Connection Pooling:** `CONN_MAX_AGE = 300` (কানেকশন রিউজ হয়ে র‍্যাম বাঁচায়)।
* **Middleware Optimization:** `GZipMiddleware` (ব্যান্ডউইথ কমপ্রেশন) এবং `ConditionalGetMiddleware` (E-Tag ক্যাশিং)।
* **Throttling (Rate Limiting):** অ্যানোনিমাস ইউজারের জন্য ৩০ রিকোয়েস্ট/মিনিট, লগইন ইউজারের জন্য ১২০ রিকোয়েস্ট/মিনিট।
* **Global Pagination:** প্রতি পেজে ডিফল্ট ২০টি করে রেকর্ড (সার্ভার র‍্যাম ওভারফ্লো রোধ)।

---

## ৩. স্প্রিন্টভিত্তিক বিস্তারিত ফিচার ও বিজনেস লজিক

### SPRINT 1: Core Architecture, Custom User & JWT Engine
* **অ্যাবস্ট্রাক্ট BaseModel (`apps/common/models.py`):** প্রতিটি টেবিলে `UUID primary_key`, `created_at` এবং `updated_at` নিশ্চিত করা।
* **কাস্টম ইউজার মডেল (`apps/users_auth/models.py`):**
  * ৪টি প্রাথমিক রোল: `PRINCIPAL`, `TEACHER`, `ACCOUNTANT`, `STUDENT`।
  * অতিরিক্ত ফ্ল্যাগ: `is_library_manager`।
* **রোল পারমিশন ক্লাস (`apps/common/permissions.py`):** 
  * `IsPrincipal` (মাস্টার সুপার অ্যাডমিন ওভাররাইড)।
  * `IsTeacherOrPrincipal`, `IsAccountantOrPrincipal`, `IsStudentOrPrincipal`, `IsLibraryManagerOrPrincipal`।
* **কাস্টম JWT টোকেন সিরিয়ালাইজার:** টোকেন পে-লোড ও রেসপন্সে স্বয়ংক্রিয়ভাবে ইউজারের প্রোফাইল, রোল এবং ইনচার্জ সেকশন বাইন্ড করা।

---

### SPRINT 2: Academic Core, Student ID Generation & Operations
* **AcademicSection (`apps/academics/models.py`):** 
  * শ্রেণি (একাদশ `XI`, দ্বাদশ `XII`), গ্রুপ (`SCI`, `HUM`, `BUS`, `GEN`), শাখা এবং শিক্ষাবর্ষ।
  * `in_charge_teacher` (ForeignKey to User role TEACHER)।
* **স্ট্যান্ডার্ড ইউনিক স্টুডেন্ট আইডি ইঞ্জিন:**
  * ফরম্যাট: `[Session]-[Class]-[Group]-[Section]-[Roll]`  
  * উদাহরণ: `2025-XI-SCI-A-0101` (স্বয়ংক্রিয়ভাবে ডিফল্ট `username` হিসেবে সেট হয়)।
* **ইনচার্জ বাউন্ডারি সিকিউরিটি (`_verify_incharge_permission`):** শিক্ষক শুধুমাত্র তাঁর দায়িত্বপ্রাপ্ত সেকশনেই শিক্ষার্থী ভর্তি ও তথ্য পরিবর্তন করতে পারেন।
* **শিক্ষকের ডিজিটাল হাজিরা (`TeacherAttendance`):**
  * সকাল ৯:১৫-এর পরে চেক-ইন করলে অটোমেটিক `is_late = True` ফ্ল্যাগ।
  * দিনে একবারের বেশি চেক-ইন প্রতিরোধ ও প্রিন্সিপাল কর্তৃক ভেরিফিকেশন।
* **পাবলিক অ্যালুমনি ও পার্সোনাল স্টিকি নোট:**
  * প্রাক্তন শিক্ষার্থীদের উন্মুক্ত রেজিস্ট্রেশন ➔ প্রিন্সিপালের অ্যাপ্রুভাল গেট।
  * প্রত্যেক ইউজারের নিজস্ব আইসোলেটেড কালার-কোডেড নোটবুক (`PersonalNote`)।

---

### SPRINT 3: Class Routine, Daily Bulk Attendance & 2-Step Leave
* **কনফ্লিক্ট-ফ্রি ক্লাস রুটিন (`ClassRoutine`):**
  * একই সেকশনে একই সময়ে দুটি ক্লাস দেওয়া অসম্ভব।
  * একই সময়ে কোনো শিক্ষককে দুটি ভিন্ন ক্লাসে অ্যাসাইন করা ব্লক করা হয়।
  * শিক্ষকের জন্য `my-schedule` এপিআই (আজকে কোন রুমে কোন পিরিয়ড)।
* **দৈনিক বাল্ক স্টুডেন্ট হাজিরা (`StudentAttendance`):**
  * ইনচার্জ এক ক্লিকে পুরো ক্লাসের হাজিরার অ্যারে (`[{student_id, status}]`) সাবমিট করেন।
  * `update_or_create` এবং `@transaction.atomic` দিয়ে দ্রুতগতিতে সেভ হওয়া।
  * স্টুডেন্টের জন্য মাসিক উপস্থিতি পার্সেন্টেজ (%) ক্যালকুলেশন।
* **২-ধাপের স্টুডেন্ট ছুটির আবেদন ফ্লো (`StudentLeaveApplication`):**
  $$\text{Student আবেদন} \longrightarrow \text{শ্রেণি ইনচার্জ সুপারিশ (Recommend)} \longrightarrow \text{অধ্যক্ষ চূড়ান্ত অনুমোদন (Approve)}$$
  * অধ্যক্ষ অনুমোদন করার সাথে সাথে ওই তারিখগুলোর জন্য স্বয়ংক্রিয়ভাবে ডেটাবেসের হাজিরায় **`LEAVE`** স্ট্যাটাস এন্ট্রি হয়ে যায়।

---

### SPRINT 4: Finance, Accounts, Hybrid Payroll & Vehicle Net Billing
* **ইনভয়েসিং ও আংশিক পেমেন্ট (`StudentInvoice` & `PaymentTransaction`):**
  * মাল্টি-মান্থ বাল্ক ইনভয়েস তৈরি।
  * আংশিক পেমেন্ট (`PARTIAL`) এবং অবশিষ্ট বকেয়া (`due_amount`) ট্র্যাকিং।
  * ইউনিক মানি রিসিট (`REC-YYYYMMDD-XXXX`) জেনারেশন।
* **অনুপস্থিতির জরিমানা ও ২-ধাপের মওকুফ ফ্লো (`FineWaiverApplication`):**
  * সেমিস্টার বিলে পূর্বের অনুপস্থিতির ওপর ভিত্তি করে স্বয়ংক্রিয়ভাবে **দৈনিক ১০০ টাকা অনুপস্থিতি জরিমানা** যোগ হওয়া।
  * মওকুফ ফ্লো: স্টুডেন্ট আবেদন ➔ ইনচার্জ সুপারিশ ➔ অধ্যক্ষ অনুমোদন ➔ ইনভয়েসের মোট প্রদেয় ও বকেয়া থেকে ডিসকাউন্ট মাইনাস হওয়া।
* **খরচের ভাউচার অডিট (`CollegeExpense`):**
  * অ্যাকাউন্ট্যান্ট খরচের বিল/ভাউচারের ছবিসহ ড্রাফট (`PENDING`) এন্ট্রি দেন ➔ প্রিন্সিপাল অডিট করে `APPROVED` করেন।
  * ব্যালেন্স শিট সামারি এপিআই (`SUM`, `GROUP BY` ক্যাটাগরি খরচ)।
* **হাইব্রিড শিক্ষক পে-রোল ফ্লো:**
  * অ্যাকাউন্ট্যান্টের বাল্ক পে-রোল শিট জেনারেশন + শিক্ষকের ব্যক্তিগত স্যালারি রিকোয়েস্ট ফ্লো।
* **রুট-ভিত্তিক গাড়ির দৈনিক নিট বিলিং ইঞ্জিন (`VehicleMonthlyBill`):**
  $$\text{Net Payable Bill} = (\text{Total Days Run} \times \text{Daily Rate}) - \text{Driver Fuel/Cash Advances}$$

---

### SPRINT 5: Exam Engine, 80-20 Conversion, 5.00 GPA & Merit List
* **পরীক্ষা ও নম্বর বণ্টন কনফিগারেশন (`Exam` & `ExamSubjectConfig`):**
  * মডেল টেস্টের জন্য সরাসরি ১০০% মূল্যায়ন।
  * সেমিস্টার ও টার্ম পরীক্ষার জন্য ফ্লেক্সিবল কনভার্সন অপশন।
* **নম্বর এন্ট্রি টেবিল (`SubjectMarksEntry`):**
  * শিক্ষক একই টেবিলে এক ক্লিকে CQ, MCQ, Practical এবং Tutorial ইনপুট দেন।
  * **গাণিতিক কনভার্সন সূত্র:**
    $$\text{Obtained Marks} = \text{CQ} + \text{MCQ} + \text{Practical}$$
    $$\text{Converted Marks (80\%)} = \text{Obtained Marks} \times 0.80$$
    $$\text{Final Total Marks} = \text{Converted Marks} + \text{Tutorial (20\%)}$$
* **কো-কারিকুলার কার্যক্রম (পূর্ণমান ১২৪):**
  * ডিজিটাল হাজিরা থেকে স্বয়ংক্রিয়ভাবে **`Attn`** নম্বর গণনা + ইনচার্জের ইনপুটকৃত **`Ethics`** নম্বর।
* **স্বয়ংক্রিয় গ্রেডিং ও মেধা তালিকা অ্যালগরিদম (`StudentExamResult`):**
  * যেকোনো একটি বিষয়ে `F` পেলে শিক্ষার্থীর সামগ্রিক রেজাল্ট **`Grade: F`** এবং **`GPA: 0.00`** হবে।
  * পাস করলে কো-কারিকুলার সহ ৮টি বিষয়ের গ্রেড পয়েন্টের গড় জিপিএ (GPA 5.00 স্কেলে) নির্ণয়।
  * **টাই-ব্রেকিং মেধা তালিকা:** GPA ➔ Total Obtained Marks ➔ Roll Number অনুযায়ী **Section Position** ও **Class Position** নির্ধারণ।
* **অফিশিয়াল রিপোর্ট ও অ্যানালিটিক্স:**
  * প্রগ্রেস রিপোর্ট কার্ড (ডিজিটাল মার্কশিট)।
  * বিষয়ভিত্তিক পাশের হার ও ফেলের হার বিবরণী।
  * অকৃতকার্য বিবরণী (ছাত্র ও ছাত্রী আলাদা গ্রুপ অনুযায়ী)।

---

### SPRINT 6: Fleet Breakdown Alert, Central Marker Stock, Library & Asset Tracker
* **গাড়ির রুট, স্টপেজ ও ইমার্জেন্সি ব্রেকডাউন নোটিফিকেশন:**
  * রাস্তায় গাড়ি বিকল হলে ড্রাইভার কর্তৃপক্ষকে ফোন দেবে ➔ অ্যাকাউন্ট্যান্ট/প্রিন্সিপাল পোর্টাল থেকে "Emergency Breakdown Alert" জারি করবেন।
  * সিস্টেম স্বয়ংক্রিয়ভাবে শুধুমাত্র ওই গাড়ির নিবন্ধিত শিক্ষার্থী ও অভিভাবকদের কাছে জরুরি অ্যালার্ট পাঠাবে।
  * স্টুডেন্টদের জন্য `my-route` এপিআই।
* **সেন্ট্রাল মার্কার স্টক রেজিস্টার (`MarkerStock`):**
  * কেন্দ্রীয় স্টক ট্র্যাকিং (যেমন: ৫০টি মার্কার)।
  * শিক্ষক মার্কার বুঝে পেয়ে পোর্টালে "Acknowledge" চাপলে স্টক মাইনাস হওয়া ও শিক্ষকের ব্যবহৃত মার্কার লগ সেভ হওয়া।
* **৪-ধাপের লাইব্রেরি ম্যানেজমেন্ট সিস্টেম (`apps/library/`):**
  $$\text{Student আবেদন} \longrightarrow \text{বিষয় শিক্ষক অনুমোদন} \longrightarrow \text{লাইব্রেরিয়ান বই ইস্যু (স্টক মাইনাস)} \longrightarrow \text{বই ফেরত (স্টক বৃদ্ধি + লেট ফাইন)}$$
* **কলেজ অ্যাসেট ও ফার্নিচার ইনভেন্টরি ট্র্যাকার (`CollegeAsset`):**
  * ক্লাসরুম অনুযায়ী বেঞ্চ, হোয়াইটবোর্ড, ফ্যান ও ল্যাব সরঞ্জামের কন্ডিশন ও পরিমাণ ট্র্যাকিং।

---

### SPRINT 7: Smart Admit Card (Due-Lock), Seat Plan, Certificate & Protected Complaints
* **স্মার্ট অ্যাডমিট কার্ড (Due-Lock Engine):**
  * শিক্ষার্থীর যেকোনো বকেয়া (`due_amount > 0`) থাকলে অ্যাডমিট কার্ড সরাসরি লক থাকবে এবং বকেয়া পরিশোধের নোটিশ আসবে। বকেয়া ক্লিয়ার হলেই প্রিন্ট-রেডি কার্ড আনলক হবে।
* **অটোমেটিক সিট প্ল্যান জেনারেটর (`ExamSeatAssignment`):**
  * নির্বাচিত রুমগুলোর ধারণক্ষমতা (Capacity) অনুযায়ী শিক্ষার্থীদের রোল ক্রমানুসারে (Sequential) রুমে রুমে সিট ভাগ হয়ে যাওয়া।
* **ইনভিজিলেশন রোস্টার ও নিরাপদ প্রশ্নপত্র জমা:**
  * শিক্ষকদের পরীক্ষার হল গার্ডের দায়িত্ব বণ্টন।
  * শিক্ষকদের পাসওয়ার্ড-প্রটেক্টেড প্রশ্নপত্র আপলোড পোর্টাল।
* **প্রত্যয়নপত্র, প্রশংসাপত্র ও টিসি রিকোয়েস্ট (`CertificateRequest`):**
  * ফি সহ আবেদন ➔ প্রিন্সিপাল অনুমোদন ➔ স্বয়ংক্রিয় সনদ নম্বরসহ ডিজিটাল ডকুমেন্ট ডেটা।
* **সুরক্ষিত গোপন অভিযোগ ও পরামর্শ বক্স (`StudentComplaint`):**
  * সাধারণ শিক্ষার্থী বা শিক্ষকদের কাছে পরিচয় গোপন থাকবে, কিন্তু ভুয়া অভিযোগ রোধে **প্রিন্সিপাল ড্যাশবোর্ডে শিক্ষার্থীর আসল নাম, রোল ও ফোন দেখতে পাবেন**।
* **ইনচার্জের At-Risk স্টুডেন্ট ট্র্যাকার ও কল-ডায়েরি:**
  * উপস্থিতি < ৭০% বা পরীক্ষায় অকৃতকার্য শিক্ষার্থীদের ওয়াচলিস্ট।
  * অভিভাবকদের সাথে ফোনালাপের ডিজিটাল ডায়েরি (`ParentCommunicationLog`)।
* **শিক্ষকদের ছুটির আবেদন ও প্রক্সি ক্লাস নোটিফিকেশন (`TeacherLeave`):**
  * শিক্ষক ছুটি নিলে মনোনীত প্রক্সি শিক্ষকের কাছে ক্লাসের নোটিফিকেশন চলে যাওয়া।

---

### SPRINT 8: Advanced Cashbook, Audit Logs, Targeted WhatsApp Engine & Clubs
* **ইনচার্জ ক্যাশ হ্যান্ডওভার রিকনসিলিয়েশন (`InchargeCashHandover`):**
  * সারাদিনে ইনচার্জের আদায়কৃত ক্যাশ অ্যাকাউন্ট্যান্ট নগদ গুনে নিয়ে এক ক্লিকে `VERIFY & RECEIVE` করবেন।
* **ক্যাশ বনাম ব্যাংক লেজার ও দৈনিক ক্যাশ ক্লোজিং:**
  * ড্রয়ারের ক্যাশ এবং ব্যাংকে জমার রসিদের হিসাব।
  * **ডেইলি ক্লোজিং ফর্মুলা:** $\text{আজকের নগদ আদায়} - \text{অনুমোদিত খরচ} - \text{ব্যাংকে জমা} = \text{হাতে থাকা ব্যালেন্স}$।
* **ভেন্ডর/দোকানদারদের বকেয়া খতিয়ান (`SupplierPurchase` & `SupplierPayment`):**
  * প্রিন্টিং প্রেস বা ফার্নিচারের দোকানের কিস্তির হিসাব।
* **মাস্টার বকেয়া তালিকা (`MasterDefaulterList`):** পুরো কলেজের বকেয়া তালিকা।
* **সিস্টেম অ্যাক্টিভিটি ও সিকিউরিটি অডিট লগ (`SystemActivityLog`):**
  * কে কখন লগইন করল, কে মার্কস পরিবর্তন করল বা কে ফি আদায় করল—তার অপরিবর্তনযোগ্য লগ।
* **টার্গেটেড স্মার্ট বাল্ক হোয়াটসঅ্যাপ ইঞ্জিন (`WhatsAppTemplate` & `WhatsAppMessageLog`):**
  * আজকের অনুপস্থিতি, বেতন বকেয়া তাগাদা এবং কাস্টম নোটিশ স্বয়ংক্রিয়ভাবে হোয়াটসঅ্যাপে প্রেরণ।
* **একাডেমিক ছুটির ক্যালেন্ডার (`AcademicHoliday`):** ছুটির দিনে হাজিরা এন্ট্রি লক রাখা।
* **ক্লাব ও ইভেন্ট ম্যানেজমেন্ট (`Club` & `ClubEvent`):**
  * প্রিন্সিপাল কর্তৃক শিক্ষককে **ক্লাব মডারেটর** নিয়োগ ➔ মডারেটর কর্তৃক মেম্বারশিপ অনুমোদন ও বিজ্ঞান মেলা/অলিম্পিয়াড পরিচালনা।

---

## ৪. হাই-পারফরম্যান্স ও সার্ভার মেমরি অপ্টিমাইজেশন

১,০০০+ কনকারেন্ট রিকোয়েস্টে সার্ভার ক্র্যাশ ঠেকাতে এবং হোস্টিং খরচ কমাতে গৃহীত পদক্ষেপ:
1. **Connection Pooling:** `CONN_MAX_AGE = 300` (কানেকশন রিউজ হয়ে র‍্যাম বাঁচায়)।
2. **SQLite WAL Mode:** ডিস্ক লক সমস্যা চিরতরে বন্ধ করতে WAL (Write-Ahead Logging) সক্রিয়:
   ```bash
   python -c "import sqlite3; con = sqlite3.connect('db.sqlite3'); con.execute('PRAGMA journal_mode=WAL;'); con.close();"
   ```
3. **কম্পাউন্ড ডেটাবেস ইনডেক্সিং:** 
   - `StudentAttendance`: `(section, date)`, `(student, status)`
   - `StudentInvoice`: `(student, due_amount)`, `(year, month, status)`
   - `StudentExamResult`: `(exam, is_passed, -gpa)`
4. **স্মার্ট ক্যাশিং ডেকোরেটর:** রুটিন ও নোটিশে `@method_decorator(cache_page(60 * 15))` যাতে ডেটাবেস বাইপাস করে মেমরি থেকে সরাসরি ডেলিভারি হয়।
5. **Gunicorn থ্রেডেড আর্কিটেকচার (`gunicorn_config.py`):**
   ```python
   import multiprocessing
   bind = "0.0.0.0:8000"
   workers = multiprocessing.cpu_count() * 2 + 1
   worker_class = "gthread"
   threads = 4
   max_requests = 1000
   max_requests_jitter = 50
   ```
6. **Nginx Microcaching (১ সেকেন্ড ক্যাশ):** রেজাল্টের দিনে ১,০০০ জন একসাথে রিলোড দিলেও ব্যাকএন্ডে মাত্র ১টি রিকোয়েস্ট আসবে, বাকি ৯৯৯টি Nginx সরাসরি র‍্যাম থেকে সার্ভ করবে।

---

## ৫. রিয়েল-টাইম বেল ও অফলাইন পুশ নোটিফিকেশন ইঞ্জিন

* **ইন-অ্যাপ বেল নোটিফিকেশন (`InAppNotification`):** লগইন অবস্থায় উপরে বেল আইকনে লাল কাউন্টার এবং ড্রপডাউন হিস্ট্রি।
* **অফলাইন পুশ নোটিফিকেশন (`DevicePushSubscription`):** ব্রাউজার বন্ধ বা মোবাইল লক থাকলেও ব্যাকগ্রাউন্ডে অপারেটিং সিস্টেম নোটিফিকেশন পপ-আপ আসা।
* **ডিসপ্যাচার সার্ভিস (`NotificationDispatcher`):**
  ```python
  NotificationDispatcher.send_to_user(
      user=target_user,
      title="নোটিশ শিরোনাম",
      body="বিস্তারিত বার্তা...",
      notification_type="EXAM",
      action_url="/exams/routine/"
  )
  ```

---

## ৬. PWA (Progressive Web App) কনফিগারেশন

মোবাইলে কোনো প্লে-স্টোর ছাড়াই সরাসরি অ্যাপ হিসেবে ব্যবহারের কাঠামো:
* **`public/manifest.json`:** `display: standalone` কনফিগারেশন (ব্রাউজার বার থাকবে না, ফুল মোবাইল অ্যাপের মতো চলবে)।
* **`public/sw.js`:** ব্যাকগ্রাউন্ড সার্ভিস ওয়ার্কার (অফলাইন ক্যাশিং ও পুশ নোটিফিকেশন রিসিভার)।
* **`InstallPWA.jsx`:** ব্রাউজারে সাইট ওপেন করলেই স্ক্রিনে প্রিমিয়াম ব্যানার আসবে: *"📱 ফোনে অ্যাপ ইনস্টল করুন"*।

---

## ৭. মাস্টার এপিআই এন্ডপয়েন্ট ক্যাটালগ

### ১. অথেনটিকেশন ও প্রোফাইল (`/api/v1/auth/`)
* `POST /login/` — কাস্টম JWT লগইন (টোকেন + রোল ও প্রোফাইল ডেটা)
* `POST /token/refresh/` — রিফ্রেশ টোকেন দিয়ে নতুন এক্সেস টোকেন নেওয়া
* `GET /me/` — লগইন থাকা ব্যবহারকারীর নিজস্ব প্রোফাইল ও ইনচার্জ তথ্য
* `POST /logout/` — রিফ্রেশ টোকেন ব্ল্যাকলিস্ট করে লগআউট
* `GET, POST /staff/` — প্রিন্সিপাল কর্তৃক শিক্ষক ও অ্যাকাউন্ট্যান্ট নিয়োগ

### ২. একাডেমিক ও ক্লাস ম্যানেজমেন্ট (`/api/v1/academics/`)
* `GET, POST /sections/` — শ্রেণি/শাখা তৈরি ও তালিকা
* `PATCH /sections/<id>/assign-incharge/` — শিক্ষককে শ্রেণি ইনচার্জ নিয়োগ
* `GET, POST /students/` — ইনচার্জ কর্তৃক ইউনিক আইডি সহ শিক্ষার্থী এনরোলমেন্ট
* `GET /students/my-id-card/` — শিক্ষার্থীর ডিজিটাল আইডি কার্ড ডেটা
* `GET /students/at-risk-tracker/` — ইনচার্জের দুর্বল ও অনিয়মিত শিক্ষার্থী ওয়াচলিস্ট
* `GET, POST /subjects/` — পাঠ্য বিষয় কনফিগারেশন
* `GET, POST /routines/` — ক্লাস রুটিন তৈরি ও শিডিউল
* `GET /routines/my-schedule/` — শিক্ষকের আজকের পিরিয়ড শিডিউল
* `GET, POST /syllabi/` — সিলেবাস ফাইল আপলোড ও দেখা
* `GET, POST /homeworks/` — হোমওয়ার্ক পোস্ট ও দেখা
* `GET /attendance/section-sheet/` — পুরো সেকশনের হাজিরা এন্ট্রি শিট লোড
* `POST /attendance/bulk-mark/` — এক ক্লিকে পুরো ক্লাসের দৈনিক হাজিরা সংরক্ষণ
* `GET /attendance/my-attendance/` — শিক্ষার্থীর মাসিক উপস্থিতি অ্যানালিটিক্স
* `GET, POST /holidays/` — ছুটির ক্যালেন্ডার সেটআপ

### ৩. অপারেশনস ও কমিউনিকেশন (`/api/v1/operations/`)
* `POST /teacher-attendance/check-in/` — শিক্ষকের ডিজিটাল চেক-ইন
* `POST /teacher-attendance/check-out/` — শিক্ষকের চেক-আউট
* `PATCH /teacher-attendance/<id>/verify/` — প্রিন্সিপাল কর্তৃক শিক্ষক হাজিরা অনুমোদন
* `GET, POST /notices/` — গ্লোবাল ও সেকশনভিত্তিক নোটিশ বোর্ড
* `GET, POST /personal-notes/` — ব্যবহারকারীর নিজস্ব স্টিকি নোটস
* `GET, POST /alumni/` — প্রাক্তন শিক্ষার্থী রেজিস্ট্রেশন ও ভেরিফিকেশন
* `GET, POST /markers/` — শিক্ষকের মার্কার আবেদন
* `PATCH /markers/<id>/issue/` — প্রিন্সিপাল কর্তৃক মার্কার ইস্যু
* `PATCH /markers/<id>/acknowledge/` — শিক্ষকের মার্কার প্রাপ্তি নিশ্চিতকরণ (স্টক মাইনাস)
* `GET /markers/monthly-usage/` — শিক্ষকের মাসিক মার্কার ব্যবহারের রিপোর্ট
* `GET, POST /marker-stocks/` — কেন্দ্রীয় মার্কারের স্টক রেজিস্টার
* `GET, POST /leaves/` — স্টুডেন্ট ছুটির আবেদন
* `PATCH /leaves/<id>/incharge-review/` — ইনচার্জের ছুটির সুপারিশ
* `PATCH /leaves/<id>/principal-review/` — অধ্যক্ষের চূড়ান্ত অনুমোদন (অটো হাজিরায় LEAVE পড়বে)
* `GET, POST /certificates/` — প্রত্যয়নপত্র/প্রশংসাপত্র আবেদন ও অনুমোদন
* `GET, POST /complaints/` — সুরক্ষিত গোপন অভিযোগ বক্স
* `GET, POST /parent-calls/` — ইনচার্জের অভিভাবক কল-ডায়েরি
* `GET, POST /teacher-leaves/` — শিক্ষকের ছুটি ও প্রক্সি ক্লাস আবেদন
* `GET /teacher-leaves/my-proxy-classes/` — শিক্ষকের প্রক্সি ক্লাস দায়িত্ব দেখা
* `GET, POST /assets/` — কলেজ অ্যাসেট ও ফার্নিচার ইনভেন্টরি
* `GET, POST /clubs/` — ক্লাব তৈরি ও শিক্ষার্থী মেম্বারশিপ আবেদন
* `PATCH /club-memberships/<id>/review/` — ক্লাব ইনচার্জ শিক্ষক কর্তৃক সদস্যপদ অনুমোদন
* `GET, POST /club-events/` — বিজ্ঞান মেলা/অলিম্পিয়াড ইভেন্ট তৈরি ও রেজিস্ট্রেশন
* `POST /sms/dispatch/` — টার্গেটেড স্মার্ট বাল্ক SMS ডিসপ্যাচার
* `GET /whatsapp/templates/` — হোয়াটসঅ্যাপ মেসেজ টেমপ্লেট
* `POST /whatsapp/send-absent-alert/` — আজকের অনুপস্থিতদের হোয়াটসঅ্যাপ নোটিশ
* `POST /whatsapp/send-fee-reminder/` — বকেয়া ফি তাগাদা হোয়াটসঅ্যাপ নোটিশ
* `POST /whatsapp/send-custom/` — কাস্টম হোয়াটসঅ্যাপ মেসেজ প্রেরণ
* `GET /notifications/` — ব্যবহারকারীর ইন-অ্যাপ নোটিফিকেশন ফিড
* `GET /notifications/unread-count/` — অপঠিত নোটিফিকেশনের সংখ্যা
* `POST /notifications/subscribe-device/` — ব্রাউজারের অফলাইন পুশ সাবস্ক্রিপশন

### ৪. ফিন্যান্স ও অ্যাকাউন্টস (`/api/v1/finance/`)
* `GET /invoices/` — শিক্ষার্থী ফি ইনভয়েস তালিকা
* `POST /invoices/generate/` — এক বা একাধিক মাসের বাল্ক ইনভয়েস জেনারেট
* `POST /invoices/<id>/collect-payment/` — ফি আদায় ও মানি রিসিট প্রদান
* `GET, POST /waivers/` — জরিমানা ও ফি মওকুফের ২-ধাপের আবেদন ও অনুমোদন
* `GET, POST /categories/` — খরচের খাত তৈরি
* `GET, POST /expenses/` — ভাউচারের ছবিসহ খরচের ড্রাফট এন্ট্রি
* `PATCH /expenses/<id>/verify/` — প্রিন্সিপাল কর্তৃক ভাউচার অডিট ও অনুমোদন
* `GET /analytics/balance-sheet/` — মোট আদায়, খরচ ও নিট ব্যালেন্স শিট
* `POST /payrolls/bulk-generate/` — শিক্ষকদের মাসিক পে-রোল তৈরি
* `PATCH /payrolls/<id>/approve/` — প্রিন্সিপাল কর্তৃক বেতন অনুমোদন
* `PATCH /payrolls/<id>/disburse/` — অ্যাকাউন্ট্যান্ট কর্তৃক বেতন প্রদান
* `GET, POST /salary-claims/` — শিক্ষকের ব্যক্তিগত বেতন/অগ্রিম দাবি
* `GET, POST /vehicles/` — পরিবহন তালিকা ও রুট সেটআপ
* `GET /vehicles/my-route/` — শিক্ষার্থীর নির্ধারিত গাড়ির তথ্য ও স্টপেজ
* `POST /vehicles/<id>/emergency-breakdown/` — জরুরি গাড়ি বিকল নোটিশ জারি
* `GET, POST /vehicle-logs/` — গাড়ির দৈনিক চলাচল ট্র্যাকিং
* `GET, POST /driver-advances/` — ড্রাইভারের গ্যাস/তেল বাবদ অগ্রিম
* `POST /vehicle-bills/generate/` — গাড়ির মাসিক নিট প্রদেয় বিল তৈরি
* `GET, POST /cash-handovers/` — ইনচার্জ কর্তৃক আদায়কৃত ক্যাশ হস্তান্তর
* `PATCH /cash-handovers/<id>/verify-cash/` — অ্যাকাউন্ট্যান্ট কর্তৃক ক্যাশ ভেরিফিকেশন
* `GET, POST /bank-deposits/` — ব্যাংক ডিপোজিট স্লিপ ও নগদ জমার হিসাব
* `GET /analytics/daily-closing/` — দৈনিক ক্যাশ ক্লোজিং অডিট শিট
* `GET /analytics/defaulters/` — মাস্টার বকেয়া তালিকা
* `GET, POST /suppliers/` — ভেন্ডর তালিকা ও বকেয়া খতিয়ান
* `POST /supplier-purchases/<id>/pay/` — ভেন্ডরদের কিস্তি পরিশোধ

### ৫. পরীক্ষা ও ফলাফল (`/api/v1/examination/`)
* `GET, POST /exams/` — পরীক্ষা তৈরি ও কনফিগারেশন
* `GET, POST /configs/` — বিষয়ের পূর্ণমান ও পাশ নম্বর নির্ধারণ
* `GET /marks/mark-sheet/` — বিষয়ভিত্তিক ব্ল্যাঙ্ক মার্কশিট লোড
* `POST /marks/bulk-save/` — CQ, MCQ, Practical ও Tutorial বাল্ক এন্ট্রি
* `POST /marks/save-cocurricular/` — কো-কারিকুলার এন্ট্রি
* `POST /results/process/` — এক ক্লিকে পুরো ক্লাসের ফলাফল ও মেধা তালিকা প্রসেস
* `GET /results/my-result/` — শিক্ষার্থীর প্রকাশিত চূড়ান্ত ফলাফল
* `GET /exams/<id>/my-admit-card/` — স্মার্ট অ্যাডমিট কার্ড (বকেয়া থাকলে লক)
* `POST /exams/<id>/generate-seat-plan/` — অটোমেটিক সিট প্ল্যান তৈরি
* `GET, POST /rooms/` — পরীক্ষার হলের রুম ও আসন ক্ষমতা
* `GET, POST /invigilations/` — শিক্ষকদের হল গার্ড রোস্টার
* `GET, POST /questions/` — পাসওয়ার্ড-প্রটেক্টেড প্রশ্নপত্র জমা
* `GET /reports/progress-report/` — পূর্ণাঙ্গ ডিজিটাল প্রগ্রেস রিপোর্ট কার্ড
* `GET /reports/subject-analysis/` — বিষয়ভিত্তিক পাশের হার ও ফেলের হার
* `GET /reports/failed-statistics/` — অকৃতকার্য বিবরণী (ছাত্র/ছাত্রী আলাদা)
* `GET /reports/merit-list/` — অফিশিয়াল মেধা তালিকা

### ৬. লাইব্রেরি ম্যানেজমেন্ট (`/api/v1/library/`)
* `GET, POST /categories/` — বইয়ের ক্যাটাগরি
* `GET, POST /books/` — বই ক্যাটালগ ও সার্চ
* `GET, POST /borrow/` — শিক্ষার্থী কর্তৃক বইয়ের জন্য আবেদন
* `PATCH /borrow/<id>/teacher-review/` — বিষয় শিক্ষক কর্তৃক তদারকি ও অনুমোদন
* `PATCH /borrow/<id>/issue-book/` — লাইব্রেরিয়ান বই প্রদান (স্টক মাইনাস)
* `PATCH /borrow/<id>/return-book/` — বই ফেরত গ্রহণ (স্টক বৃদ্ধি + লেট ফাইন)

### ৭. সিকিউরিটি অডিট (`/api/v1/system/`)
* `GET /audit-logs/` — প্রিন্সিপালের জন্য অপরিবর্তনযোগ্য সিস্টেম অডিট ট্রেইল

---

## ৮. প্রোডাকশন ডেপ্লয়মেন্ট ও ডেটাবেস ব্যাকআপ গাইড

### ক. লাইভ সার্ভারে প্রথমবার চালুর নির্দেশিকা (Ubuntu VPS)
```bash
# ১. গিট ক্লোন ও ভার্চুয়াল এনভায়রনমেন্ট
git clone <repository_url> college_erp_backend
cd college_erp_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# ২. পরিবেশ পরিবর্তনশীল (.env) সেটআপ
nano .env  # DEBUG=False, SECRET_KEY, ALLOWED_HOSTS বসান

# ৩. ডেটাবেস মাইগ্রেশন ও স্ট্যাটিক ফাইল সংগ্রহ
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# ৪. সুপারইউজার তৈরি ও Gunicorn চালু
python manage.py createsuperuser
gunicorn --config gunicorn_config.py config.wsgi:application
```

### খ. অটোমেটিক ডেটাবেস ব্যাকআপ ক্রোন জব (Daily Backup at 12:00 AM)
টার্মিনালে `crontab -e` টাইপ করে নিচের লাইনটি যোগ করে দিন:
```bash
0 0 * * * /usr/bin/pg_dump -U postgres college_erp_db > /backups/db_backup_$(date +\%Y\%m\%d).sql
```
*(এটি প্রতিদিন রাত ১২টায় সম্পূর্ণ ডেটাবেসের একটি স্বয়ংক্রিয় ব্যাকআপ ফাইল তৈরি করে রাখবে, ফলে কোনো তথ্য কখনোই হারাবে না।)*

---
**Prepared By:** Senior Backend Architect  
**Project Status:** 100% Complete, Fully Integrated & Production-Ready 🚀
```