const largeImage = document.querySelector('.show-large');
const smallImages = document.querySelectorAll('.show-small');

smallImages.forEach((img) => {
  img.addEventListener('click', function () {
    const tempSrc = largeImage.src;

    largeImage.src = this.currentSrc;
    this.src = tempSrc;
  });
});
