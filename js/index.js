$(document).ready(function(){
  adjustLogo();
	$('#nav-icon2').click(function(){
		$(this).toggleClass('open');
    $( ".menu" ).slideToggle( "slow");
	});
  $( ".menu" ).hide();
});
$(window).on('resize', adjustLogo);
function adjustLogo(){
  var half = window.innerHeight/2;
  var margin = $("#nav-bar-wrapper").outerHeight() - 
			   $("#nav-bar-wrapper").innerHeight();
  margin /= 2;
  half = half - (document.getElementById("logo").height
			+ $("#nav-bar-wrapper").height()
			+ margin)/2;
  document.getElementById("logo").style.marginTop = half.toString() + "px";
  $(splash).height(window.innerHeight + 20);
}

$(document).ready(function(){
  $("a").on('click', function(event) {

    if (this.hash !== "") {
      event.preventDefault();

      var hash = this.hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 1000, function(){
        window.location.hash = hash;
      });
    }
  });
});

var backgroundArray = ["#1","#2","#3","#4","#5","#6"];

function doScroll() {
  var section = ($(document).height() - window.screen.height)/5;
  var index = Math.floor(document.body.scrollTop/section);
  for (var i = 0; i < index; i++) {
	$(backgroundArray[i]).css({'visibility': 'hidden'});
  }
  var opacity = Math.round((1-((document.body.scrollTop/section) - index))*100)/100;
  $(backgroundArray[index]).css({'opacity': opacity});
  $(backgroundArray[index]).css({'visibility': 'visible'});
  if (index + 1 < backgroundArray.length) {
	$(backgroundArray[index + 1]).css({'visibility': 'visible'});
	$(backgroundArray[index + 1]).css({'opacity': '1'});
  }
  
  for (var i = index + 2; i < backgroundArray.length; i++) {
	$(backgroundArray[i]).css({'visibility': 'hidden'});
  }
}

$(document).ready(doScroll);
window.onscroll = doScroll;
