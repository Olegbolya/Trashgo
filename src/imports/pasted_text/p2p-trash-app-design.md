Design a modern web application for a P2P trash removal marketplace in Kazan, Russia. The platform connects customers with verified workers for affordable waste disposal services.

BRAND IDENTITY:
- Name: "Вынос Мусора Казань"
- Tagline: "Первый P2P сервис выноса мусора в Татарстане"
- Target audience: Homemakers (customers, 40-50₽ budget) and students/workers (providers, 60-70₽ offers)
- Tone: Modern, trustworthy, accessible, community-driven

DESIGN SYSTEM:
- Color palette:
  * Primary: Purple gradient (#667eea → #764ba2) for hero sections and CTAs
  * Accent Red: #ff4757 for primary actions ("Create Order")
  * Accent Green: #2ed573 for worker features ("Become a Worker")
  * Gold: #ffd700 for pricing, ratings, premium badges
  * Neutral: #f8f9fa (backgrounds), white (cards), #2c3e50 (text)
- Typography: Inter or SF Pro Display
  * Headings: Bold, 700 weight
  * Body: Regular, 400 weight
  * UI elements: Medium, 500 weight
- Border radius: 15-25px for cards, 50px for buttons
- Shadows: Soft, layered (0 5px 20px rgba(0,0,0,0.1))

KEY PAGES TO DESIGN:

1. LANDING PAGE (Hero-driven conversion)
   - Hero section:
     * Large heading: "Вынос Мусора в Казани"
     * Subheading: "От 40₽ за мешок | Первый P2P сервис в Татарстане"
     * Dual CTAs: "Заказать вынос" (red) + "Стать исполнителем" (green)
     * Hero visual: Illustration/photo of friendly worker with trash bags
   - Features grid (6 cards with icons):
     * 💰 Дешево | ⚡ Быстро | 🔒 Безопасно | 📱 Удобно | 🌍 Экологично | 🎯 P2P модель
   - How it works (4 steps with numbers)
   - Districts served (Kazan map with highlighted zones)
   - Stats section (dark background): "1st in region | 0 competitors | 1.2M potential customers"
   - Social proof (testimonials when available)
   - Final CTA section

2. ORDER CREATION FLOW (Multi-step form)
   - Step 1: Waste type selection
     * Large icon buttons: Household | Construction | Bulky items
   - Step 2: Volume selection
     * Visual selector: 1-2 bags | 3-5 bags | Custom (slider)
   - Step 3: Date & time picker
     * Calendar interface + time slots
   - Step 4: Address input
     * Integrated Yandex Maps with geolocation
     * Autocomplete address field
   - Step 5: Review & submit
     * Summary card with all details
     * Price estimate range (40-70₽)
     * "Create Order" button

3. CUSTOMER DASHBOARD
   - Header: Welcome message + quick "New Order" button
   - Active orders section:
     * Cards showing order status, number of responses, time remaining
   - Order cards:
     * Trash bag icon, address snippet, price range
     * Status badges: "Waiting for responses" | "In progress" | "Completed"
     * Quick actions: View responses, message worker, cancel
   - Order history (collapsed by default)
   - Sidebar: Profile summary, stats (total orders, money saved)

4. WORKER RESPONSES VIEW
   - List of worker profiles responding to order:
     * Avatar (circular, 60px)
     * Name, rating (5-star gold), completed orders count
     * Offered price (large, bold)
     * Response time ("Responded 5 min ago")
     * Verification badges: ✓ Phone verified, ✓ License verified
     * "View Profile" + "Accept" buttons
   - Sorting controls: Highest rated | Lowest price | Fastest response
   - Filters: Verified only, Rating >4.5

5. WORKER DASHBOARD
   - Available orders feed:
     * Cards with order details, distance from worker, offered customer price
     * "Respond" button with quick price input
   - Active jobs section
   - Earnings summary:
     * Today | This week | This month
     * Charts showing earnings trend
   - Profile completion prompt (if incomplete)

6. ORDER DETAIL PAGE
   - Full order information:
     * Photos uploaded by customer
     * Detailed description
     * Address with map embed (Yandex Maps)
     * Customer rating and review history
   - Action buttons:
     * For workers: "Respond to Order" modal
     * For customers: "Edit" | "Cancel" | "Message Worker"
   - Timeline: Order created → Responses received → Worker selected → In progress → Completed

7. CHAT INTERFACE
   - Messenger-style layout:
     * Left sidebar: Conversation list with avatars
     * Main area: Message thread
     * Message bubbles (customer purple, worker green)
     * Photo/file upload
     * Quick replies for common phrases
   - Telegram integration notice: "Continue in Telegram" button

8. WORKER PROFILE PAGE
   - Header:
     * Large avatar, name, overall rating
     * Verification badges row
     * "Message" and "Report" buttons
   - Stats grid: Total jobs | Completion rate | Response time | Member since
   - Reviews section:
     * 5-star breakdown chart
     * Individual reviews with customer name, date, rating, text, photos
   - Portfolio: Before/after photo grid

9. RATING & REVIEW PAGE
   - Large 5-star selector
   - Text review field (optional)
   - Photo upload (before/after)
   - Pre-written tags: "On time" | "Professional" | "Careful" | "Friendly"
   - Submit button

10. REGISTRATION/LOGIN
    - Split screen:
      * Left: Branding visual
      * Right: Form
    - Phone number input with SMS verification
    - Role selection: "I want to order" | "I want to provide services"
    - For workers: Additional fields (ID verification, license upload)
    - Social login options: VK, Telegram

11. WORKER ONBOARDING
    - Multi-step wizard:
      * Personal info
      * License verification
      * Service areas (Kazan district selection on map)
      * Pricing preferences
      * Availability schedule
      * Bank details for payouts

12. DISTRICT MAP PAGE
    - Interactive Yandex Map:
      * Kazan districts highlighted (Vakhitovsky, Privolzhsky, Sovetsky)
      * Click district to see stats: "12 workers available | Avg response 15 min"
      * "Coming soon" overlay for non-serviced districts

UNIQUE VISUAL ELEMENTS:
- Trash bag/bin icons (friendly, modern style, not gross)
- District badges with Kazan architecture elements
- Before/after photo grids with slider comparison
- Verification check marks (green, circular)
- Rating stars (gold, filled/outlined)
- Status indicators (colored dots: green=active, yellow=pending, gray=completed)
- Progress bars for order completion
- Map pins (custom branded icons)
- Promotional banner: "Первые 100 заказов -50%!"

UI PATTERNS & COMPONENTS:
- Bottom sticky CTAs on mobile for quick actions
- Floating action button (FAB) for "Create Order" (always accessible)
- Toast notifications for real-time updates
- Modal overlays for quick actions (respond, message)
- Skeleton screens for loading states
- Empty states with friendly illustrations and CTAs
- Search bars with autocomplete
- Filter panels (slide-in on mobile, sidebar on desktop)
- Breadcrumbs for navigation
- Pagination or infinite scroll for listings
- Card hover effects (subtle lift + shadow)

RESPONSIVE DESIGN:
- Mobile-first approach (most users on phones)
- Desktop: 3-column layout (sidebar | main content | details)
- Tablet: 2-column (sidebar | main content)
- Mobile: Single column with bottom navigation
- Bottom tab bar (mobile): Orders | Search | Create (+) | Messages | Profile

ACCESSIBILITY:
- High contrast ratios (WCAG AA)
- Focus states for keyboard navigation
- Alt text for all images
- Aria labels for screen readers

TRUST & SAFETY INDICATORS:
- Security badges in footer (SSL, verified payments)
- License verification badges on worker profiles
- "How pricing works" transparency section
- "Safe payments via ЮKassa" badges
- "Money back guarantee" seal

ADDITIONAL FEATURES:
- Dark mode toggle (optional for MVP)
- Language switcher (Russian/Tatar)
- Cookie consent banner (GDPR-style)
- Footer: Links, contacts, social media, about

Create a complete design system with all these pages in a cohesive, modern aesthetic optimized for both desktop and mobile web browsers. Prioritize clarity, trust, and ease of use.
