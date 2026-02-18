# LinguaAid — Test Documents

A set of realistic sample documents to test the LinguaAid translation and simplification features.
Each document is written in complex English legalese/medical language — exactly the kind of text
that immigrants and refugees struggle to understand.

---

## How to Use

1. Open **http://localhost:3000** and sign in (or create an account)
2. Go to **Translate** → click **Paste Text**
3. Open any `.txt` file below, copy all the text, paste it into LinguaAid
4. Select the matching **Document Type** and your **Target Language**
5. Click **Translate & Explain**

---

## Documents Included

### 1. `hospital-discharge-instructions.txt`
**Type:** Healthcare
**What it is:** A hospital discharge summary after treatment for pneumonia, including:
- Medication names, dosages, and schedules (Amoxicillin, Prednisone, Albuterol)
- Activity and diet restrictions
- Follow-up appointment instructions
- Emergency warning signs

**Good for testing:** Medical jargon simplification, medication instructions

---

### 2. `eviction-court-summons.txt`
**Type:** Legal
**What it is:** A California Superior Court unlawful detainer (eviction) summons, including:
- Court date, time, and location
- Legal grounds for eviction (non-payment of rent)
- Tenant rights and deadlines to respond
- Free legal aid resources

**Good for testing:** Legal terminology, urgent deadlines, rights explanation

---

### 3. `housing-lease-section8.txt`
**Type:** Housing
**What it is:** A Section 8 Housing Choice Voucher residential lease agreement, including:
- Rent breakdown (tenant portion vs. housing authority subsidy)
- Tenant and landlord responsibilities
- Pet, guest, and alteration policies
- Lease termination and renewal terms

**Good for testing:** Contract language, financial obligations, housing rights

---

### 4. `uscis-i485-receipt-notice.txt`
**Type:** Civic / Immigration
**What it is:** A USCIS Notice of Action for an I-485 (Green Card application), including:
- Receipt number and case status
- Biometrics appointment details
- Travel warning (Advance Parole)
- Address change requirements
- Immigration scam warnings

**Good for testing:** Immigration jargon, critical deadlines, bureaucratic language

---

### 5. `ssi-benefits-approval.txt`
**Type:** Civic / Benefits
**What it is:** A Social Security Administration SSI benefit approval letter, including:
- Monthly benefit amount and calculation
- Payment schedule
- Reporting obligations (what changes must be reported)
- Appeal rights and process

**Good for testing:** Government benefits language, reporting requirements, appeal process

---

## Suggested Test Languages

Try translating into these languages to see how well LinguaAid handles them:
- **Hindi** — Large South Asian immigrant population
- **Spanish** — Largest non-English speaking group in the US
- **Arabic** — Common refugee language
- **Somali** — Common refugee language, complex grammar
- **Haitian Creole** — Common in Florida/New York
- **Amharic** — Ethiopian community

---

## Notes

- If you haven't added API keys to `.env.local`, you'll see **demo/mock** translations.
- To get real translations, add your `OPENAI_API_KEY` and `LINGODOTDEV_API_KEY` to `.env.local`.
- PDF upload is also supported — you can find free sample PDFs from government websites
  (uscis.gov, ssa.gov, hud.gov) to test the PDF extraction feature.
