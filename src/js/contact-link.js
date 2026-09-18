(function () {
  var link = document.querySelector("[data-contact-link]");
  if (!link) return;

  var email = (link.getAttribute("href") || "").replace(/^mailto:/, "");
  if (!email) return;

  var toast;
  var hideTimer;

  function showToast(message) {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "contact-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    // Force reflow so re-triggering the class restarts the transition.
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2400);
  }

  link.addEventListener("click", function () {
    // The mailto: href still fires normally; this just guarantees visible
    // feedback for visitors whose browser has no mail client configured,
    // where a mailto click otherwise does nothing at all.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(email)
        .then(function () {
          showToast("Copied " + email + " to your clipboard");
        })
        .catch(function () {
          showToast(email);
        });
    } else {
      showToast(email);
    }
  });
})();
