# মাধ্যমিক ও উচ্চ মাধ্যমিক পরীক্ষার ফলাফল

GitHub Pages-এ রাখা একটি static site। পরীক্ষার তথ্য হাতে লিখে বা রেজিস্ট্রেশন কার্ডের ছবি/PDF থেকে পড়ে নিয়ে অনলাইন backend-এর মাধ্যমে official ফলাফল পৃষ্ঠায় যাওয়া যায়।

## ব্যবহার

1. Examination, Year, Board বেছে নিন এবং Roll (৬ অঙ্ক) ও Registration (১০ অঙ্ক) লিখুন।
2. অথবা "রেজিস্ট্রেশন কার্ড আপলোড করুন" চেপে কার্ডের JPG/PNG/BMP বা scanned PDF দিন। পাওয়া মানগুলো নিজে মিলিয়ে নিন।
3. Submit চাপুন। তথ্যসহ অনলাইন backend (`hsc-result-backend-covid-coder.onrender.com`) খুলবে। Official site-এর CAPTCHA/human verification নিজে পূরণ করুন।
4. Backend ব্যস্ত বা ঘুমন্ত থাকলে প্রথমবার খুলতে কিছুটা সময় লাগতে পারে; ব্যর্থ হলে `reconnect.html` থেকে আবার চেষ্টা করুন।

কার্ড পড়ার সীমা: PDF সর্বোচ্চ ৩ পৃষ্ঠা, ফাইল সর্বোচ্চ ১৫ MB, password ছাড়া PDF। OCR শুধু ইংরেজি ছাপা লেখা পড়ে; দুই মিনিটে শেষ না হলে ছোট ও পরিষ্কার ফাইল দিন। প্রথমবার OCR model download-এ ইন্টারনেট data লাগবে। Reset চাপলে সংরক্ষিত তথ্য মুছে যায়।

## Privacy / সীমা

- কার্ডের ছবি/PDF এই browser-এর ভেতরেই Tesseract.js ও PDF.js দিয়ে পড়া হয়; ফাইলটি কোনো server-এ upload হয় না।
- পাঁচটি মান (পরীক্ষা, সাল, বোর্ড, রোল, রেজিস্ট্রেশন) একই tab-এর sessionStorage-এ থাকে; Reset চাপলে বা tab বন্ধ করলে মুছে যায়।
- **Submit চাপলে এই পাঁচটি মান URL-এর `#draft=` অংশে রেখে backend পৃষ্ঠায় পাঠানো হয়।** `#`-এর পরের অংশ HTTP request-এ server-এ যায় না, তবে backend পৃষ্ঠার script সেটি পড়ে এবং browser history-তে থেকে যেতে পারে।
- CAPTCHA বা human verification স্বয়ংক্রিয়ভাবে সমাধান বা bypass করা হয় না।
- OCR অনিশ্চিত হলে মান অনুমান করে না; নিজে যাচাই করতে হবে। কোনো ফলাফল/GPA-র নিশ্চয়তা নেই।

## Hosting

GitHub Settings → Pages → Deploy from a branch → `main` / root বাছুন। `index.html` project root-এ এবং `.nojekyll` ও `vendor` folder রাখুন। কোনো server প্রয়োজন নেই।

## Third party

Tesseract.js 7.0.0, Tesseract.js-core এবং Mozilla PDF.js 5.6.205 bundled assets ব্যবহার করা হয়েছে; license files `vendor` folder-এ আছে। English OCR model tessdata.projectnaptha.com/4.0.0_fast থেকে নেওয়া। কোনো analytics নেই।
