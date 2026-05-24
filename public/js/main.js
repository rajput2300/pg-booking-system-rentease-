// Auto-dismiss alerts
document.addEventListener('DOMContentLoaded', () => {
  const alerts = document.querySelectorAll('.flash-alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

  // Image preview for thumbnail gallery
  const thumbs = document.querySelectorAll('.detail-thumb');
  const mainImg = document.querySelector('.detail-main-img');
  if (thumbs.length && mainImg) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        mainImg.src = thumb.src;
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
    thumbs[0]?.classList.add('active');
  }

  // Star rating input
  const stars = document.querySelectorAll('.star-input');
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      document.getElementById('ratingValue').value = index + 1;
      stars.forEach((s, i) => {
        s.textContent = i <= index ? '★' : '☆';
        s.style.color = i <= index ? '#f59e0b' : '#D1D5DB';
      });
    });
  });
});
