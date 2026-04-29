"""
Seed script — run once to populate the DB with:
  - 1 admin user    (admin@nagarsetu.in   / admin123)
  - 1 citizen user  (citizen@nagarsetu.in / citizen123)
  - 10 sample complaints

Run with:
    python seed.py
"""
import os
import sys

sys.path.append(os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.complaint import (
    Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory
)

Base.metadata.create_all(bind=engine)

db = SessionLocal()


def create_user(first, last, email, phone, password, role):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"  ⚠  User {email} already exists, skipping.")
        return existing
    user = User(
        first_name=first,
        last_name=last,
        email=email,
        phone=phone,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"  ✅ Created {role} → {email}")
    return user


def create_complaint(ref, title, desc, category, location, city,
                     status, priority, assigned_to, citizen, reject_reason=None):
    existing = db.query(Complaint).filter(Complaint.complaint_ref == ref).first()
    if existing:
        print(f"  ⚠  Complaint {ref} already exists, skipping.")
        return
    c = Complaint(
        complaint_ref=ref,
        title=title,
        description=desc,
        category=category,
        location=location,
        city=city,
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        citizen_id=citizen.id,
        reject_reason=reject_reason,
    )
    db.add(c)
    db.commit()
    print(f"  ✅ Complaint {ref} — {title[:40]}")


print("\n── Creating users ──────────────────────────────────────")
admin   = create_user("Super", "Admin",  "admin@nagarsetu.in",   "+91 00000 00000", "admin123",   UserRole.admin)
citizen = create_user("Riya",  "Sharma", "citizen@nagarsetu.in", "+91 98765 43210", "citizen123", UserRole.citizen)

print("\n── Creating complaints ──────────────────────────────────")
COMPLAINTS = [
    ("NS-001", "Large pothole near Rajwada Chowk",
     "A very large pothole causing accidents during rush hours.",
     ComplaintCategory.Pothole, "Rajwada, Indore", "Indore",
     ComplaintStatus.resolved, ComplaintPriority.High, "PWD Department"),

    ("NS-002", "Waterlogging near Bus Stand",
     "Severe waterlogging after every rain. Drainage completely blocked.",
     ComplaintCategory.Waterlogging, "Bus Stand, Indore", "Indore",
     ComplaintStatus.inprogress, ComplaintPriority.High, "Municipal Corporation"),

    ("NS-003", "Garbage not collected for 5 days",
     "Waste overflowing, creating a health hazard for residents.",
     ComplaintCategory.Garbage, "Vijay Nagar, Indore", "Indore",
     ComplaintStatus.pending, ComplaintPriority.Medium, None),

    ("NS-004", "Broken street light on main road",
     "Three consecutive street lights non-functional for two weeks.",
     ComplaintCategory.StreetLight, "Palasia, Indore", "Indore",
     ComplaintStatus.resolved, ComplaintPriority.Medium, "Electricity Dept"),

    ("NS-005", "Traffic signal not working at junction",
     "Signal malfunctioning for 3 days causing near-miss accidents.",
     ComplaintCategory.Traffic, "Rajwada, Indore", "Indore",
     ComplaintStatus.pending, ComplaintPriority.High, None),

    ("NS-006", "Damaged road divider on bypass",
     "Road divider destroyed after a truck accident.",
     ComplaintCategory.Infrastructure, "Bypass Road, Indore", "Indore",
     ComplaintStatus.rejected, ComplaintPriority.Low, "NHAI",
     "This road falls under NHAI jurisdiction. Please file directly with NHAI."),

    ("NS-007", "Open manhole on residential street",
     "Open manhole posing serious risk to pedestrians and children.",
     ComplaintCategory.Infrastructure, "Arera Colony, Bhopal", "Bhopal",
     ComplaintStatus.inprogress, ComplaintPriority.High, "PWD Department"),

    ("NS-008", "Illegal dumping near school premises",
     "Unauthorized dumping creating foul smell and health concerns.",
     ComplaintCategory.Garbage, "Civil Lines, Jabalpur", "Jabalpur",
     ComplaintStatus.pending, ComplaintPriority.Medium, None),

    ("NS-009", "Overflowing drainage canal",
     "Canal overflowing onto the main road after recent rain.",
     ComplaintCategory.Waterlogging, "Sadar, Nagpur", "Nagpur",
     ComplaintStatus.resolved, ComplaintPriority.High, "Municipal Corporation"),

    ("NS-010", "Park lights defunct for 3 weeks",
     "All park lights off for 3 weeks making the area unsafe at night.",
     ComplaintCategory.StreetLight, "Napier Town, Jabalpur", "Jabalpur",
     ComplaintStatus.pending, ComplaintPriority.Low, None),
]

for row in COMPLAINTS:
    reject = row[9] if len(row) > 9 else None
    create_complaint(*row[:9], citizen=citizen, reject_reason=reject)

db.close()
print("\n✅  Seed complete. Login credentials:")
print("   Admin   → admin@nagarsetu.in   / admin123")
print("   Citizen → citizen@nagarsetu.in / citizen123\n")