/* ============================================================
   landing.js — "Request account" flow on index.html.
   Submits into the accountRequests table; an admin reviews it
   under Admin → Accounts and creates real credentials from it.
   ============================================================ */

function openRequestAccountForm() {
  openModal(
    "Request a student account",
    "Send your details to the admin. You'll be notified once your account is ready.",
    `
      <div class="field"><label>Full name</label><input class="form-control" id="ra-name" placeholder="e.g. Sara Ahmed"></div>
      <div class="field"><label>Email</label><input class="form-control" type="email" id="ra-email" placeholder="you@example.com"></div>
      <div class="field"><label>Note <span class="small-muted">(optional)</span></label><textarea class="form-control" id="ra-note" rows="2" placeholder="Department, group, or anything the admin should know"></textarea></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-gold" id="ra-submit">Send request</button>
      </div>
    `
  );
  document.getElementById("ra-submit").onclick = async () => {
    const name = document.getElementById("ra-name").value.trim();
    const email = document.getElementById("ra-email").value.trim();
    const note = document.getElementById("ra-note").value.trim();
    if (!name) return toast("Name is required.");
    if (!email) return toast("Email is required.");

    const btn = document.getElementById("ra-submit");
    btn.disabled = true; btn.textContent = "Sending…";
    await API.createAccountRequest({ name, email, note });
    closeModal();
    toast("Request sent — an admin will set up your account.");
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("requestAccountBtn");
  if (btn) btn.addEventListener("click", openRequestAccountForm);
});
