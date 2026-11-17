# Primary Research: Operational Interview with Laundry Business Owner (`docs/interview-with-owner.md`)

**Business Interviewed:** CleanEdge Laundromat & Garment Care  
**Operator:** Chinedu Okafor (Founder & Managing Operator)  
**Location:** Adeniran Ogunsanya Street, Surulere, Lagos, Nigeria  
**Operation Scope:** 4 staff (2 wash/press operators, 1 counter clerk, 1 dispatch rider), 3 commercial washers, 2 gas dryers, ~180 active neighbourhood customer accounts  
**Interview Date:** November 2026  
**Duration:** 35 minutes (Conducted in person at the Surulere shop counter)  

---

## 1. Interview Transcript & Core Questions

### Question 1: How do you currently tag incoming laundry, and what is the biggest point of confusion between the customer and your intake clerk?
> **Chinedu Okafor:**  
> *"When a customer walks in, my clerk writes their name, phone number, and clothes count in a duplicate carbon receipt book. We tear out the pink slip for the customer and pin a numbered tag into the collar or waistband of each shirt or native wear.  
> 
> The biggest headache happens when someone drops off 8 shirts in a rush before work, but my clerk writes '7 shirts' by mistake, or when a customer sends their househelp or sibling to collect the clothes on Saturday without the paper slip. The sibling comes and says, 'My brother sent me to pick his clothes.' If we ask for the ticket, they say they lost it. If we release the clothes to the wrong person, it's a massive fight. A digital slip where both sides can see the exact item count and a private collection PIN saves us hours of arguments every single week."*

---

### Question 2: What percentage of your customers use smartphones, and what technical difficulties do they experience when trying to interact with online services?
> **Chinedu Okafor:**  
> *"Almost everyone has an Android phone—mostly Tecno, Infinix, or older Samsung phones. But people don't have patience for heavy apps. Their phone storage is completely full from WhatsApp videos and family photos. If you tell an auntie or bank worker standing at my counter to download a 60-megabyte mobile app from Google Play Store just to track 4 dry-cleaned suits, they will look at you like you are crazy.  
> 
> Also, data cuts off constantly. MTN or Airtel network will be strong right now, and two minutes later you are seeing 'Emergency Calls Only' or slow 2G. If a customer cannot open their receipt within 3 seconds because the screen is waiting for high-resolution graphics or slow scripts, they close the tab and demand a paper receipt."*

---

### Question 3: How do customers pay, and how frequently do payment disputes occur?
> **Chinedu Okafor:**  
> *"About 70% of our neighbourhood customers do NOT pay when dropping off their laundry. They say, 'Wash it first, let me see it clean, then I will pay on delivery or collection.' When they come to pick up, they pay via bank transfer or tap their debit card on our Moniepoint POS terminal.  
> 
> Disputes happen when a bank transfer has a delay. The customer shows a debit alert on their phone screen, but the money has not reflected in our business bank account. If we don't have a dated ledger that records payment attempts separately from confirmed receipts, we either offend an honest customer or lose money to fake transfer screenshots. We must keep confirmed bank transaction references for every single docket."*

---

### Question 4: How do you handle tax audits, business records, and customer privacy?
> **Chinedu Okafor:**  
> *"Lagos State Internal Revenue Service (LIRS) and federal tax auditors don't play. Every year, our accountant must present the complete sales ledger showing total revenue, payment receipts, and dates. If we told an auditor that we deleted past payment records because a customer requested account deletion, we would face severe audit fines and immediate business closure under CAMA accounting rules.  
> 
> At the same time, customers don't want other people knowing what they wear or seeing their phone numbers. Sometimes prominent neighbours drop off expensive designer agbada or suits. If another customer at the counter sees someone else's docket on a screen, that is a breach of trust. Privacy in a neighbourhood shop is about dignity and confidentiality."*

---

### Question 5: What happens when the public power grid (NEPA/PHCN) or shop internet drops during operations?
> **Chinedu Okafor:**  
> *"In Surulere, the national grid goes out 3 to 4 times a day. We switch to our diesel generator immediately, but in those 90 seconds while the generator is cranking, the shop Wi-Fi router restarts. If your software system locks up or crashes during a power transition, business grinds to a halt. The counter system must be lightweight, must reconnect automatically without logging staff out, and must never report a false success if the server did not actually save the transaction."*

---

## 2. Three Critical Assumptions Contradicted by Primary Research

The direct conversation with Chinedu Okafor fundamentally altered several initial engineering assumptions:

### Contradiction 1: The "Chatbot Assistance" Fallacy
- **Our Initial Assumption:** We assumed users would prefer an AI chatbot interface (e.g. "Ask our AI where your shirts are") to track garment status.
- **The Reality from Research:** Customers distrust chatbots during service transactions. When a customer is anxious about ₦45,000 worth of clothing, a conversational bot that generates polite prose causes frustration. Customers demand a **dated, unalterable receipt line ("Our records show: 7 items received, 2 pressed, balance ₦0")** that they can screenshot and present at the counter as legal proof.

### Contradiction 2: The "Prepaid E-Commerce" Assumption
- **Our Initial Assumption:** We designed earlier signup flows assuming customers pay upfront upon scheduling a pickup online.
- **The Reality from Research:** Over 70% of Nigerian neighbourhood laundry volume is settled **post-service upon physical counter inspection or curb delivery**. Our data model must support un-invoiced and pending-payment dockets without blocking customer account registration or order status tracking.

### Contradiction 3: The "Downloadable App & Authenticator 2FA" Trap
- **Our Initial Assumption:** We initially contemplated recommending an authenticator app (TOTP) or standalone mobile app wrapper for enhanced customer security.
- **The Reality from Research:** Storage constraints on budget Android Go devices and the complexity of authenticator apps cause instant user abandonment. Security must be enforced via **fast, zero-install Web SPAs, single-use email OTPs, and physical counter PINs** rather than requiring app store downloads or secondary security utilities.
