import multiprocessing

bind = "0.0.0.0:8000"
# সার্ভারের কোর সংখ্যা অনুযায়ী ওয়ার্কার নির্ধারণ: (2 * CPU Cores) + 1
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 4 # প্রতিটি ওয়ার্কারে ৪টি থ্রেড

# মেমরি লিক রোধে ১০০০ রিকোয়েস্ট পর পর ওয়ার্কার নীরবে রিস্টার্ট হবে
max_requests = 1000
max_requests_jitter = 50
timeout = 60
keepalive = 5