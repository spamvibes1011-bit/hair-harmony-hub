# Hair Harmony Hub

Build , a premium, mobile-first post-purchase hair-care companion for Be Bodywise, focused initially on the Hair Growth Roll-On Serum. Keep the existing polished design: white backgrounds, deep blue and teal accents, rounded cards, clean typography, subtle shadows and realistic demo data.

PAGE 1 — Dashboard

Health Goal: Allow users to choose goals such as Hair Growth, Body Care and Skin Care. Connect each goal to relevant products.

My Products: Display purchased products in a compact grid with a small image, product name and today's application status: Applied / To Be Applied. Tapping a product opens its full product page.

Daily Consistency Tracker: Create a circular, pizza-style progress chart divided into daily slices. Each logged application fills the corresponding slice. Show daily completion and overall consistency.

Product Verification & Issue Status: Display reported product concerns with statuses: Pending, Under Review and Resolved. Tapping an issue opens its details.

Consultation Reminders: Show upcoming appointments with time, contact details and a location/directions link where applicable.

Include notifications and clear navigation to Home, My Products, My Hair Journey and Support.

PAGE 2 — Product Details

When a user taps a product, open a dedicated product-detail screen containing:

Product image and name.

Batch number, manufacturing date and expiry date.

Days remaining until expiry, calculated from the dates.

Product usage instructions and application frequency.

Today's application button, which updates the dashboard and consistency tracker.

Usage Journey: Show the number of days used, application history and consistency. Add a clickable button to open the full Hair Journey page.

Report a Concern: Let users report issues such as increased shedding, irritation, product discolouration or packaging problems. Save the report and display its follow-up status.

Keep product records, usage history and reports connected.

PAGE 3 — My Hair Journey

Build a detailed journey page that combines the original FitLoop progress-tracking concept with the dashboard's consistency information.

Journey Overview: Show the start date, days since starting, recorded application days and overall consistency.

Progress Timeline: Display dated check-ins, observations and milestones chronologically.

Hair Progress: Allow users to upload baseline and subsequent photos, compare them side by side, and record self-reported shedding, visible changes and scalp comfort.

Check-ins: Provide simple forms that save observations and update the timeline.

Insights: Summarise recorded changes over time without claiming to diagnose hair loss or prove product effectiveness.

Next Steps: Help users review their experience, seek professional advice when appropriate, or report concerns.- (if concern pressed-should open to concern and support page)

Link back to the relevant product page and its application history.

This should have an option for uploading pictures + updates everyday

PAGE 4 — Concerns & Support

Display all previously reported concerns, their submission dates and current status.

Allow users to open a concern, view its details and track updates.

Provide appropriate safety guidance and consultation options.

Concerning symptoms must take priority over routine reminders. Never encourage continued use despite warning signs.




CONNECTIONS & FUNCTIONALITY

The pages must work as one connected system:

Dashboard → Product Details → Application Logging → Updated Consistency Tracker.

Product Details → Usage Journey → My Hair Journey.

Check-in → Saved Timeline → Updated Insights.

Report a Concern → Product History → Support Status → Dashboard Follow-up.

Consultation booking demo → Appointment details → Dashboard Reminder.

Use persistent demo state so updates remain visible when navigating between pages. Implement working navigation, editable forms, interactive charts, date calculations, photo-upload controls and realistic empty states.

Priority: Make the Dashboard, Product Details and My Hair Journey especially polished and fully functional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e3b3350d-ebd1-5dc9-959b-98ba817f0c7d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
