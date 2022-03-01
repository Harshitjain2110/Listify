function fun(){
	document.querySelector("nav").classList.toggle("nav-mobile");
}

setTimeout(function(){
	document.querySelector(".home-page").style.display = "inline";
	document.querySelector(".loading-page").style.display = "none";
},500);


