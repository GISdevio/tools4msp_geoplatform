function textExpandFunction(el) {

    var dots = $(el).parent().find('.text-expand-dots')[0];
    var moreText = $(el).parent().find('.text-expand-more')[0];
    var btnText = el;

    if (dots.style.display === "none") {
        dots.style.display = "inline";
        btnText.innerHTML = "<i class='fa fa-chevron-right'></i>";
        moreText.style.display = "none";
    } else {
        dots.style.display = "none";
        btnText.innerHTML = "<i class='fa fa-chevron-left'></i>";
        moreText.style.display = "inline";
    }
}

window.textExpandFunction = textExpandFunction;
