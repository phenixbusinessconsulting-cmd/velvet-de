# COMPLIANCE CHECKLIST — VELVET Platform
## Germany Market · Last Updated: 2025-01-01

> ⚠️ **This checklist is a technical starting point. ALL items marked `[LEGAL REVIEW]` 
> require review and sign-off by a qualified German lawyer before going live.**

---

## 🔴 CRITICAL — Must be completed before any public launch

### Age Verification (Jugendschutzgesetz)
- [ ] `[LEGAL REVIEW]` Current cookie-based age gate complies with JuSchG §4 requirements
- [ ] `[LEGAL REVIEW]` Determine if certified age verification provider is required
      (Recommendation: integrate Verimi, IDnow, or WebID Solutions for robust verification)
- [ ] Cookie-based gate (`/api/age-verify`) is active and tested
- [ ] Age gate displayed before ANY content is accessible
- [ ] Age gate bypass routes confirmed (legal pages only: /impressum, /datenschutz, /agb)

### ProstSchG Compliance (Prostituiertenschutzgesetz 2017)
- [ ] `[LEGAL REVIEW]` Platform classification under ProstSchG — is this a "Prostitutionsstätte" 
      or a directory service? Different obligations apply
- [ ] `[LEGAL REVIEW]` KYC flow requires ProstSchG §3 registration certificate
- [ ] `[LEGAL REVIEW]` Determine notification obligations to local Behörden (varies by Bundesland)
- [ ] `[LEGAL REVIEW]` Review §16 ProstSchG — prohibition of advertising for illegal prostitution
- [ ] Admin verification workflow includes ProstSchG document check (KYCDocType.PROST_SCHG_REG)
- [ ] Document retention policy defined and implemented (how long, secure deletion)
- [ ] `[LEGAL REVIEW]` Health certificate requirements per §10 ProstSchG

### DSGVO / GDPR (EU 2016/679)
- [ ] `[LEGAL REVIEW]` Data Protection Impact Assessment (DPIA) — Art. 35 DSGVO required
      (processing of special category data: Art. 9 — sexual preferences/identity)
- [ ] `[LEGAL REVIEW]` Legal basis for each processing purpose documented (Art. 6, Art. 9)
- [ ] `[LEGAL REVIEW]` Data retention periods defined for each data type
- [ ] `[LEGAL REVIEW]` Determine if Data Protection Officer (DPO) required — Art. 37 DSGVO
      (likely YES given Art. 9 data processing at scale)
- [ ] Records of Processing Activities (RoPA) created — Art. 30 DSGVO
- [ ] Privacy Policy reviewed by legal counsel and published
- [ ] Cookie consent implemented (granular — essential / analytics / marketing)
- [ ] Data subject rights endpoints implemented (export, deletion, access)
- [ ] Data breach notification procedure documented (72h to DPA — Art. 33)
- [ ] Processor agreements (DPA) with all sub-processors (hosting, CDN, email)
- [ ] Data transfers outside EU documented and safeguarded (Art. 44-49)

### TMG / Impressum
- [ ] Impressum complete with real company data (§5 TMG)
- [ ] Impressum accessible within 2 clicks from homepage
- [ ] Responsible person for content named (§18 Abs. 2 MStV)

---

## 🟡 IMPORTANT — Complete before accepting first paying customers

### KYC / Document Verification
- [ ] Encryption at rest implemented (AES-256) for all KYC documents
- [ ] Access logs for document access implemented (AuditLog)
- [ ] Secure deletion procedure for rejected/expired documents
- [ ] `[LEGAL REVIEW]` Maximum document retention period defined and enforced
- [ ] Staff training on document handling and privacy

### Content Moderation
- [ ] Blocked words list comprehensive and actively maintained
- [ ] Photo moderation workflow active before CDN publication
- [ ] Review moderation before display
- [ ] CRITICAL report escalation (< 2 hour response for suspected minor)
- [ ] Automated + manual moderation combination
- [ ] `[LEGAL REVIEW]` NetzDG obligations (> 2M users) — not applicable yet, but plan ahead

### Security
- [ ] Penetration test completed by qualified firm
- [ ] Rate limiting on all public endpoints
- [ ] CAPTCHA on registration and login (implement before launch)
- [ ] SQL injection protection (Prisma ORM provides this — verify)
- [ ] XSS protection (Next.js CSP headers configured — review)
- [ ] Dependency vulnerability scanning automated (npm audit, Snyk)
- [ ] Incident response plan documented

### AGB / Terms of Service
- [ ] `[LEGAL REVIEW]` AGB reviewed under BGB §305ff
- [ ] `[LEGAL REVIEW]` Liability clauses reviewed
- [ ] `[LEGAL REVIEW]` Withdrawal/cancellation rights defined
- [ ] AGB clearly presented before registration (checkbox confirmation logged)

---

## 🟢 RECOMMENDED — Best practices for long-term operation

### Technical
- [ ] Monitoring & alerting configured (uptime, errors, security events)
- [ ] Automated backup with tested restore procedure
- [ ] CDR (Critical Data Records) backup policy documented
- [ ] Load testing completed
- [ ] Disaster recovery plan documented

### Legal Documentation
- [ ] Standard Contractual Clauses (SCCs) for any non-EU sub-processors
- [ ] Contract with ProstSchG compliance consultant for ongoing advice
- [ ] Insurance: cyber liability insurance
- [ ] `[LEGAL REVIEW]` German tax implications (Umsatzsteuer for digital services)

### Operational
- [ ] Admin team trained on DSGVO compliance
- [ ] Escalation procedure for law enforcement requests documented
- [ ] Annual compliance review scheduled

---

## German Regulatory Contacts (for reference)

- **Federal Commissioner for Data Protection**: www.bfdi.bund.de
- **BKA (Bundeskriminalamt)** — for reporting CSAM or exploitation
- **ProstSchG supervisory authorities**: vary by Bundesland (Ordnungsamt)
- **Consumer protection**: Verbraucherzentrale Bundesverband

---

## Legal Counsel TODO List

Priority order for lawyer engagement:

1. **ProstSchG classification** — is the platform a directory (Werbeplattform) or Prostitutionsstätte?
2. **DSGVO Art. 9 analysis** — legal basis for processing sensitive data
3. **DPO requirement** — Art. 37 DSGVO
4. **Age verification standard** — is cookie-gate sufficient or is certified provider required?
5. **Document retention policy** — KYC documents, audit logs
6. **AGB review** — BGB §305ff compliance
7. **Tax structure** — VAT/USt for adult platform services in Germany
8. **Liability insurance** requirements
9. **NetzDG readiness plan** (for when platform scales)

---

*This document must be reviewed quarterly and updated with actual compliance status.*
*Version: DRAFT-1.0 · Next review: 2025-04-01*
