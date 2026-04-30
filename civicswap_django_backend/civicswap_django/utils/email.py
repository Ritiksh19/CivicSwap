"""
utils/email.py
Brevo REST API email utility — replaces civicswap-backend/utils/sendEmail.js
Uses the same Brevo REST API but via Python requests instead of Node Axios.
"""
import requests
from django.conf import settings


def send_email(to_email: str, to_name: str, subject: str, html_content: str) -> bool:
    """
    Send a transactional email via Brevo REST API.
    Returns True on success, False on failure.
    """
    if not settings.BREVO_API_KEY:
        # Development fallback — just print the email
        print(f"\n[EMAIL] To: {to_email} | Subject: {subject}\n{html_content}\n")
        return True

    payload = {
        "sender": {
            "name": settings.EMAIL_FROM_NAME,
            "email": settings.EMAIL_FROM_ADDRESS,
        },
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_content,
    }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": settings.BREVO_API_KEY,
    }
    try:
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            json=payload,
            headers=headers,
            timeout=10,
        )
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False


# ─── Email Templates ─────────────────────────────────────────────────────────

def send_borrow_request_email(owner_email, owner_name, borrower_name, item_title, start_date, end_date):
    """Notify lender of a new borrow request."""
    send_email(
        to_email=owner_email,
        to_name=owner_name,
        subject=f"New Borrow Request for '{item_title}' — CivicSwap",
        html_content=f"""
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#4f46e5;">New Borrow Request 📬</h2>
          <p>Hi <strong>{owner_name}</strong>,</p>
          <p><strong>{borrower_name}</strong> has requested to borrow your item:</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Item:</strong> {item_title}</p>
            <p><strong>From:</strong> {start_date}</p>
            <p><strong>To:</strong> {end_date}</p>
          </div>
          <p>Log in to CivicSwap to approve or reject this request.</p>
          <p style="color:#6b7280;font-size:12px;">CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱</p>
        </div>
        """,
    )


def send_request_approved_email(borrower_email, borrower_name, owner_name, item_title, start_date, end_date):
    """Notify borrower that their request was approved."""
    send_email(
        to_email=borrower_email,
        to_name=borrower_name,
        subject=f"Your Request for '{item_title}' was Approved ✅ — CivicSwap",
        html_content=f"""
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#16a34a;">Request Approved! ✅</h2>
          <p>Hi <strong>{borrower_name}</strong>,</p>
          <p>Great news! <strong>{owner_name}</strong> approved your borrow request.</p>
          <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Item:</strong> {item_title}</p>
            <p><strong>From:</strong> {start_date}</p>
            <p><strong>To:</strong> {end_date}</p>
          </div>
          <p>Please coordinate pickup with <strong>{owner_name}</strong>. Remember to return the item by <strong>{end_date}</strong>.</p>
          <p style="color:#6b7280;font-size:12px;">CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱</p>
        </div>
        """,
    )


def send_request_rejected_email(borrower_email, borrower_name, item_title):
    """Notify borrower that their request was rejected."""
    send_email(
        to_email=borrower_email,
        to_name=borrower_name,
        subject=f"Your Request for '{item_title}' was Declined — CivicSwap",
        html_content=f"""
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#dc2626;">Request Declined</h2>
          <p>Hi <strong>{borrower_name}</strong>,</p>
          <p>Unfortunately, the owner has declined your request for <strong>{item_title}</strong>.</p>
          <p>Don't worry — there are plenty of other items available in your neighborhood. Browse CivicSwap to find alternatives.</p>
          <p style="color:#6b7280;font-size:12px;">CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱</p>
        </div>
        """,
    )


def send_return_confirmation_email(owner_email, owner_name, borrower_name, item_title):
    """Notify lender that item has been marked as returned."""
    send_email(
        to_email=owner_email,
        to_name=owner_name,
        subject=f"'{item_title}' has been Returned — CivicSwap",
        html_content=f"""
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#4f46e5;">Item Returned 🎉</h2>
          <p>Hi <strong>{owner_name}</strong>,</p>
          <p><strong>{borrower_name}</strong> has marked <strong>{item_title}</strong> as returned.</p>
          <p>Please confirm the return and submit a rating for <strong>{borrower_name}</strong> on CivicSwap.</p>
          <p style="color:#6b7280;font-size:12px;">CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱</p>
        </div>
        """,
    )


def send_rating_prompt_email(user_email, user_name, other_name, item_title):
    """Prompt user to leave a rating after transaction closes."""
    send_email(
        to_email=user_email,
        to_name=user_name,
        subject=f"How was your experience with '{item_title}'? — CivicSwap",
        html_content=f"""
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#f59e0b;">Rate Your Experience ⭐</h2>
          <p>Hi <strong>{user_name}</strong>,</p>
          <p>Your transaction for <strong>{item_title}</strong> with <strong>{other_name}</strong> is complete!</p>
          <p>Please take a moment to rate your experience. Your rating helps build community trust on CivicSwap.</p>
          <p style="color:#6b7280;font-size:12px;">CivicSwap — Reducing unnecessary consumption, one neighborhood at a time. 🌱</p>
        </div>
        """,
    )
