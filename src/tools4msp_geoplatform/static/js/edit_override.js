document.addEventListener("DOMContentLoaded", function () {
    function updateTopbar() {
        const hash = window.location.hash;
        // Corrisponde sia a pagine con ID numerico sia a pagine "new"
        const singleResourceRegex = /^#\/(dashboard|geostory|map|dataset|document)\/(\d+|new)$/;
        if (singleResourceRegex.test(hash)) {
            document.body.classList.add('hide-topbar');
        } else {
            document.body.classList.remove('hide-topbar');
        }
    }

    updateTopbar();
    window.addEventListener('hashchange', updateTopbar);
});


