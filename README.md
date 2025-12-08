# Shree Shree Vidya Astrology – Single Page Website

A modern, bilingual (Hindi + English) landing page for **Shree Shree Vidya Astrology – Pandit Shubham Sharma**.  
The site showcases astrology services, daily horoscope, testimonials, contact details, an intro video playlist, and an interactive AstroBot.

---

## 1. Tech Stack

- **HTML5** – semantic single-page layout
- **CSS3** – custom responsive styling
- **JavaScript (Vanilla JS)** – interactivity and animations
- **Google Fonts** – Cinzel & Inter
- **Google Translate Widget** – Hindi / English language switch

---

## 2. Features

### Branding & Navigation
- Fixed top navbar with:
  - Logo + Hindi / English text
  - Smooth-scroll navigation links (Home, About, Services, Daily Horoscope, Reviews, Contact)
  - Google Translate dropdown embedded directly in the nav
  - Light / Dark theme toggle
  - Mobile hamburger menu

### Hero Section (Home)
- Headline: “Guiding your destiny with ancient Vedic wisdom and modern insight”
- Highlight badge “Expert Vedic Astrologer”
- Call-to-action buttons:
  - **Book Consultation**
  - **Explore Services**

### About Section
- Title: **About Pandit Shubham Sharma**
- Bilingual subtitle and description (English + Hindi)
- **Left side media panel**:
  - Auto-playing **image slider** (5 images) of Pandit ji / logo
  - Side **video box** showing live ritual clips
- **Right side content**:
  - Bilingual paragraphs explaining experience, expertise, and credentials
  - Stats cards:
    - 15+ Years Experience / अनुभव  
    - 10K+ Happy Clients / संतुष्ट ग्राहक  
    - 4.9★ Rating / रेटिंग  

### Introduction Video Section
- Single large video player with **playlist controlled by JavaScript**:
  - Up to 5 videos under `videos/` folder
  - First video auto-plays (muted)
  - When one video ends, the next plays automatically

### Daily Horoscope Section
- Grid of 12 zodiac cards (Aries → Pisces)
- On click, shows an alert popup with a standard daily horoscope message for that sign

### Services Section
- Cards for primary services:
  - Kundali Analysis  
  - Vastu Consultation  
  - Numerology Reading  
  - Matchmaking  
  - Tarot Reading  
  - Muhurat Selection  
- Each card shows:
  - Icon emoji  
  - Service title  
  - Short description  
  - Starting price  
  - “Book Now” button leading to Contact section

### Testimonials
- Slider with 3 testimonials
- Auto-rotating text every 5 seconds
- Dots (indicators) to switch testimonial manually

### Contact & Booking
- **Contact info** block:
  - Phone: `+91 72238 79166`
  - WhatsApp: `+91 72238 79166`
  - Email: `shrishrividhyaastrology@gmail.com`
  - Location: Indore, Madhya Pradesh
- **Booking form** with:
  - Full Name
  - Phone Number
  - Service Required (dropdown)
  - Message
  - “Book Appointment” button
- On submit: JS alert confirmation + form reset

### Footer
- Brand description and social media icon placeholders
- Quick links (About, Services, Horoscope, Testimonials)
- Services links
- Contact links (phone, email, city)
- Dynamic year in copyright text (auto-updates from JS)

### WhatsApp Floating Button
- Fixed bottom-right chat icon linking to WhatsApp (`https://wa.me/+917223879166`)

### AstroBot (Mini Chat Widget)
- Floating 🤖 icon to open/close chatbot
- Simple pre-defined reply suggesting to call/whatsapp/book appointment
- Enter key or button triggers the chat reply

### UX Enhancements
- Smooth scrolling to sections
- IntersectionObserver-based fade-in animations for cards, zodiac items, and testimonials
- Light/Dark theme toggle

---

## 3. Project Structure

Recommended folder layout:

```text
project-root/
│
├─ index.html
├─ style.css
├─ script.js
│
├─ img/
│  ├─ logo.png
│  ├─ profile pic.jpeg
│  ├─ profilepic2.jpeg
│  ├─ profilepic3.jpeg
│  ├─ profilepic4.jpeg
│  └─ (any other images)
│
└─ videos/
   ├─ video1.mp4
   ├─ video2.mp4
   ├─ video3.mp4
   ├─ video4.mp4
   └─ video5.mp4
