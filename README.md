# মাধ্যমিক ও উচ্চ মাধ্যমিক পরীক্ষার ফলাফল

Public static site: browser-only image/PDF OCR with an optional desktop official-session bridge.

## ব্যবহার

- Mobile: কার্ডের JPG/PNG/BMP বা scanned PDF বাছুন। Examination, Year, Board, roll ও registration পড়ার চেষ্টা করবে। পাওয়া মান নিজে মিলিয়ে নিন। Connect না হলে আলাদা reconnect পৃষ্ঠার official-site link দিয়ে CAPTCHA ও ফলের form নিজে সম্পন্ন করুন। সাধারণ mobile Chrome extension সমর্থন করে না; mobile-এ এই site সরাসরি official form autofill বা result fetch করে না।
- Desktop Chrome/Edge: hsc-web-extension.zip download ও Extract করুন। Extensions → Developer mode → Load unpacked দিয়ে extension folder বাছুন। পুরোনো localhost helper-এর বদলে এই public-site bridge ব্যবহার করুন। Website tab reload করে Connect চাপুন; official tab-এ human verification নিজে করুন। Actual dropdown এলে Connected দেখাবে। Submit তথ্য সেই একই native form-এ বসাবে। CAPTCHA official tab-এ নিজে লিখে ফলাফল দেখুন চাপুন। Native popup-এর OK চাপার পরে exact response website-এ আসবে।
- PDF সর্বোচ্চ ৩ পৃষ্ঠা, মোট file ১৫ MB। Password ছাড়া PDF দিন। OCR English printed text পড়ে; দুই মিনিটে শেষ না হলে ছোট পরিষ্কার file দিন। প্রথমবার OCR model ও engine download-এ mobile data লাগবে। Reset সংরক্ষিত draft মুছে দেয়।

## Privacy / সীমা

কার্ড browser-এর ভেতরে Tesseract.js/PDF.js দিয়ে process হয়; card bytes কোনো OCR server/GitHub-এ upload হয় না। Site assets hosting থেকে download হয়। পাঁচটি extracted value একই tab-এর sessionStorage-এ রাখা হয়; Reset/ট্যাব বন্ধে মুছে যায়। PII URL-এ পাঠানো হয় না। OCR uncertain/conflicting values অনুমান করে না; manual review লাগে। সংযোগ ছাড়া card-derived dropdown label-এ official যাচাই বাকি বলা হয়।

Extension শুধু এই Pages project এবং official educationboardresults.gov.bd origin-এ কাজ করে। Cookies permission নেই; official page-এর hidden/session data native form-এ থাকে। CAPTCHA/human verification স্বয়ংক্রিয় সমাধান বা bypass হয় না। Unknown official form/response হলে actual message দেখুন বা native site ব্যবহার করুন। No published result/GPA is guaranteed.

## Hosting

এই folder-এর public HTML/JS ও vendor assets GitHub Pages-এ static hosting করা যায়। Node/Python/Windows server প্রয়োজন নেই। index.html project root-এ রাখুন। Settings → Pages → Deploy from a branch → main / root বাছুন। .nojekyll রাখুন। Vendor files ও hsc-web-extension.zip-ও রাখতে হবে। .github/workflows/pages.yml optional Actions deployment path, তবে branch deployment বাছলে সেটি প্রয়োজন নেই।

## Third party

Tesseract.js 7.0.0, Tesseract.js-core এবং Mozilla PDF.js 5.6.205 bundled assets ব্যবহার করা হয়েছে। License files vendor folder-এ আছে। English OCR model official tessdata.projectnaptha.com/4.0.0_fast থেকে সংগৃহীত। কোনো third-party runtime CDN/analytics নেই।


মূল পৃষ্ঠায় একটি Connect to Site button আছে। সেটি সরাসরি browser extension-কে একই official tab খুলতে/সংযুক্ত করতে বলে; তিনটি live dropdown পাওয়া গেলে Connected দেখায়। ব্যর্থ বা verification প্রয়োজন হলে আলাদা reconnect পৃষ্ঠায় কারণ জানায়। মূল পৃষ্ঠার তথ্য কপি এবং আলাদা official-site button সরানো হয়েছে।
