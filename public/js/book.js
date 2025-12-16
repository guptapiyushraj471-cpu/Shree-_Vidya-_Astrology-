// public/js/book.js
(function(){
  const formEl = document.getElementById("bookForm");
  const result = document.getElementById("result");
  const submitBtn = document.getElementById("submitBtn");

  if (!formEl || !result || !submitBtn) {
    console.warn('Booking form elements missing - script not attached');
    return;
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      service: document.getElementById("service").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      message: document.getElementById("message").value.trim()
    };

    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    result.style.color = "green";
    result.textContent = "Submitting...";
    result.classList.add('show');
    result.classList.remove('error');

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      // If the server did not return JSON or returned non-2xx the .json() may throw — handle that
      const json = await res.json().catch(() => null);

      if (res.ok && json && json.ok) {
        result.style.color = "green";
        result.textContent = "Booking received successfully! Reference ID: " + (json.id || 'unknown');
        result.classList.add('show');
        result.classList.remove('error');
        formEl.reset();
      } else {
        const serverMsg = (json && json.error) ? json.error : (json && json.message) ? json.message : `Server returned ${res.status}`;
        result.style.color = "red";
        result.textContent = serverMsg || "Failed to submit. Please try again.";
        result.classList.add('show', 'error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      result.style.color = "red";
      result.textContent = "Network error. Please try again.";
      result.classList.add('show', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
})();
