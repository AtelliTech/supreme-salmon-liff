main();

function main() {
  MicroModal.init({
    disableScroll: true,
  });

  document
    .getElementById("confirm-cancel-order")
    .addEventListener("click", () => {
      MicroModal.close("cancel-order-modal");
    });
}
