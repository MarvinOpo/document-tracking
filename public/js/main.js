(function ($) {
  // USE STRICT
  "use strict";
  $(".animsition").animsition({
    inClass: 'fade-in',
    outClass: 'fade-out',
    inDuration: 900,
    outDuration: 900,
    linkElement: 'a:not([target="_blank"]):not([href^="#"]):not([class^="chosen-single"])',
    loading: true,
    loadingParentElement: 'html',
    loadingClass: 'page-loader',
    loadingInner: '<div class="page-loader__spin"></div>',
    timeout: false,
    timeoutCountdown: 5000,
    onLoadEvent: true,
    browser: ['animation-duration', '-webkit-animation-duration'],
    overlay: false,
    overlayClass: 'animsition-overlay-slide',
    overlayParentElement: 'html',
    transition: function (url) {
      window.location.href = url;
    }
  });

  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };


  $('#change_pass').click(function () {
    $('#modal_password').modal('show');
  })

  $('#modal_update_pass').click(function () {
    if (!$('#old_password').val() || !$('#new_password').val() ||
      !$('#confirm_password').val()) {

      const text_error = "<div class='input-error'>"
        + "<span class='error-text'>"
        + "Please fill all required fields (*)"
        + "</span>"
        + "</div>"

      $('#error_container').html(text_error);

      return;
    }

    if ($('#new_password').val().length < 4) {

      const text_error = "<div class='input-error'>"
        + "<span class='error-text'>"
        + "New Password must have atleast 4-characters"
        + "</span>"
        + "</div>"

      $('#error_container').html(text_error);

      return;
    }

    if ($('#new_password').val() != $('#confirm_password').val()) {

      const text_error = "<div class='input-error'>"
        + "<span class='error-text'>"
        + "New Password does not match"
        + "</span>"
        + "</div>"

      $('#error_container').html(text_error);

      return;
    }

    update_password();
  })
})(jQuery);

(function ($) {
  // USE STRICT
  "use strict";

  // Map
  try {

    var vmap = $('#vmap');
    if (vmap[0]) {
      vmap.vectorMap({
        map: 'world_en',
        backgroundColor: null,
        color: '#ffffff',
        hoverOpacity: 0.7,
        selectedColor: '#1de9b6',
        enableZoom: true,
        showTooltip: true,
        values: sample_data,
        scaleColors: ['#1de9b6', '#03a9f5'],
        normalizeFunction: 'polynomial'
      });
    }

  } catch (error) {
    console.log(error);
  }

  // Europe Map
  try {

    var vmap1 = $('#vmap1');
    if (vmap1[0]) {
      vmap1.vectorMap({
        map: 'europe_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        enableZoom: true,
        showTooltip: true
      });
    }

  } catch (error) {
    console.log(error);
  }

  // USA Map
  try {

    var vmap2 = $('#vmap2');

    if (vmap2[0]) {
      vmap2.vectorMap({
        map: 'usa_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        enableZoom: true,
        showTooltip: true,
        selectedColor: null,
        hoverColor: null,
        colors: {
          mo: '#001BFF',
          fl: '#001BFF',
          or: '#001BFF'
        },
        onRegionClick: function (event, code, region) {
          event.preventDefault();
        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  // Germany Map
  try {

    var vmap3 = $('#vmap3');
    if (vmap3[0]) {
      vmap3.vectorMap({
        map: 'germany_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        onRegionClick: function (element, code, region) {
          var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();

          alert(message);
        }
      });
    }

  } catch (error) {
    console.log(error);
  }

  // France Map
  try {

    var vmap4 = $('#vmap4');
    if (vmap4[0]) {
      vmap4.vectorMap({
        map: 'france_fr',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        enableZoom: true,
        showTooltip: true
      });
    }

  } catch (error) {
    console.log(error);
  }

  // Russia Map
  try {
    var vmap5 = $('#vmap5');
    if (vmap5[0]) {
      vmap5.vectorMap({
        map: 'russia_en',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        hoverOpacity: 0.7,
        selectedColor: '#999999',
        enableZoom: true,
        showTooltip: true,
        scaleColors: ['#C8EEFF', '#006491'],
        normalizeFunction: 'polynomial'
      });
    }


  } catch (error) {
    console.log(error);
  }

  // Brazil Map
  try {

    var vmap6 = $('#vmap6');
    if (vmap6[0]) {
      vmap6.vectorMap({
        map: 'brazil_br',
        color: '#007BFF',
        borderColor: '#fff',
        backgroundColor: '#fff',
        onRegionClick: function (element, code, region) {
          var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
          alert(message);
        }
      });
    }

  } catch (error) {
    console.log(error);
  }
})(jQuery);
(function ($) {
  // Use Strict
  "use strict";
  try {
    var progressbarSimple = $('.js-progressbar-simple');
    progressbarSimple.each(function () {
      var that = $(this);
      var executed = false;
      $(window).on('load', function () {

        that.waypoint(function () {
          if (!executed) {
            executed = true;
            /*progress bar*/
            that.progressbar({
              update: function (current_percentage, $this) {
                $this.find('.js-value').html(current_percentage + '%');
              }
            });
          }
        }, {
          offset: 'bottom-in-view'
        });

      });
    });
  } catch (err) {
    console.log(err);
  }
})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Scroll Bar
  try {
    var jscr1 = $('.js-scrollbar1');
    if (jscr1[0]) {
      const ps1 = new PerfectScrollbar('.js-scrollbar1');
    }

    var jscr2 = $('.js-scrollbar2');
    if (jscr2[0]) {
      const ps2 = new PerfectScrollbar('.js-scrollbar2');

    }

  } catch (error) {
    console.log(error);
  }

})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Select 2
  try {

    $(".js-select2").each(function () {
      $(this).select2({
        minimumResultsForSearch: 20,
        dropdownParent: $(this).next('.dropDownSelect2')
      });
    });

  } catch (error) {
    console.log(error);
  }


})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Dropdown 
  try {
    var menu = $('.js-item-menu');
    var sub_menu_is_showed = -1;

    for (var i = 0; i < menu.length; i++) {
      $(menu[i]).on('click', function (e) {
        e.preventDefault();
        $('.js-right-sidebar').removeClass("show-sidebar");
        if (jQuery.inArray(this, menu) == sub_menu_is_showed) {
          $(this).toggleClass('show-dropdown');
          sub_menu_is_showed = -1;
        }
        else {
          for (var i = 0; i < menu.length; i++) {
            $(menu[i]).removeClass("show-dropdown");
          }
          $(this).toggleClass('show-dropdown');
          sub_menu_is_showed = jQuery.inArray(this, menu);
        }
      });
    }
    $(".js-item-menu, .js-dropdown").click(function (event) {
      event.stopPropagation();
    });

    $("body,html").on("click", function () {
      for (var i = 0; i < menu.length; i++) {
        menu[i].classList.remove("show-dropdown");
      }
      sub_menu_is_showed = -1;
    });

  } catch (error) {
    console.log(error);
  }

  var wW = $(window).width();
  // Right Sidebar
  var right_sidebar = $('.js-right-sidebar');
  var sidebar_btn = $('.js-sidebar-btn');

  sidebar_btn.on('click', function (e) {
    e.preventDefault();
    for (var i = 0; i < menu.length; i++) {
      menu[i].classList.remove("show-dropdown");
    }
    sub_menu_is_showed = -1;
    right_sidebar.toggleClass("show-sidebar");
  });

  $(".js-right-sidebar, .js-sidebar-btn").click(function (event) {
    event.stopPropagation();
  });

  $("body,html").on("click", function () {
    right_sidebar.removeClass("show-sidebar");

  });


  // Sublist Sidebar
  try {
    var arrow = $('.js-arrow');
    arrow.each(function () {
      var that = $(this);
      that.on('click', function (e) {
        e.preventDefault();
        that.find(".arrow").toggleClass("up");
        that.toggleClass("open");
        that.parent().find('.js-sub-list').slideToggle("250");
      });
    });

  } catch (error) {
    console.log(error);
  }


  try {
    // Hamburger Menu
    $('.hamburger').on('click', function () {
      $(this).toggleClass('is-active');
      $('.navbar-mobile').slideToggle('500');
    });
    $('.navbar-mobile__list li.has-dropdown > a').on('click', function () {
      var dropdown = $(this).siblings('ul.navbar-mobile__dropdown');
      $(this).toggleClass('active');
      $(dropdown).slideToggle('500');
      return false;
    });
  } catch (error) {
    console.log(error);
  }
})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  // Load more
  try {
    var list_load = $('.js-list-load');
    if (list_load[0]) {
      list_load.each(function () {
        var that = $(this);
        that.find('.js-load-item').hide();
        var load_btn = that.find('.js-load-btn');
        load_btn.on('click', function (e) {
          $(this).text("Loading...").delay(1500).queue(function (next) {
            $(this).hide();
            that.find(".js-load-item").fadeToggle("slow", 'swing');
          });
          e.preventDefault();
        });
      })

    }
  } catch (error) {
    console.log(error);
  }

})(jQuery);
(function ($) {
  // USE STRICT
  "use strict";

  try {

    $('[data-toggle="tooltip"]').tooltip();

  } catch (error) {
    console.log(error);
  }

  // Chatbox
  try {
    var inbox_wrap = $('.js-inbox');
    var message = $('.au-message__item');
    message.each(function () {
      var that = $(this);

      that.on('click', function () {
        $(this).parent().parent().parent().toggleClass('show-chat-box');
      });
    });


  } catch (error) {
    console.log(error);
  }

})(jQuery);

function getDateDiff(startdate, enddate) {
  let mstart = moment(startdate);
  const mend = moment(enddate);

  let totalSecsDiff = 0;
  let hend;

  let hstart = moment(mstart.format('YYYY-MM-DD HH:mm:ss'));
  hstart.set('hour', 8);
  hstart.set('minute', 00);
  hstart.set('second', 00);

  if (mstart.isSame(mend, 'day')) {
    totalSecsDiff = mend.diff(mstart, 'seconds');
  } else {
    while (!mstart.isAfter(mend)) {
      if (mstart.isBefore(hstart)) {
        mstart = moment(hstart.format('YYYY-MM-DD HH:mm:ss'));
      }

      hend = moment(mstart.format('YYYY-MM-DD HH:mm:ss'));
      hend.set('hour', 17);
      hend.set('minute', 00);
      hend.set('second', 00);

      if (mstart.isSame(mend, 'day')) {
        if (mend.isBefore(hend)) {
          totalSecsDiff += mend.diff(mstart, 'seconds');
        } else {
          totalSecsDiff += hend.diff(mstart, 'seconds');
        }
      } else {
        let weekday = mstart.weekday();

        if (weekday != 0 && weekday != 6) {
          if (mstart.isBefore(hend)) {
            totalSecsDiff += hend.diff(mstart, 'seconds');
          }
        }
      }

      // console.log(mstart.format('YYYY-MM-DD HH:mm:ss') +
      //     " ----- " + hend.format('YYYY-MM-DD HH:mm:ss') +
      //     " ----- " + mend.format('YYYY-MM-DD HH:mm:ss'))
      // console.log(totalSecsDiff);

      mstart = mstart.add(1, 'day');
      mstart.set('hour', 8);
      mstart.set('minute', 00);
      mstart.set('second', 00);
    }
  }

  return totalSecsDiff;
}

function update_password() {
  const body = {
    old_pass: $('#old_password').val(),
    new_pass: $('#new_password').val()
  };

  fetch('/update_pass', {
    method: 'POST',
    credentials: "include",
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(data => {
      if (data.status == "success") {
        toastr.success("Successfully updated.<br>Please try it out.");
        $('#modal_password').modal('hide');
      } else {
        const text_error = "<div class='input-error'>"
          + "<span class='error-text'>"
          + "Failed to update.<br>Please try again."
          + "</span>"
          + "</div>"

        $('#error_container').html(text_error);
        $('#old_password').val('');
      }
    })
    .catch(err => {
      console.log(err);
    });
}
// function getDateDiff(startdate, enddate) {
//     let mstart = moment(startdate);
//     const mend = moment(enddate);

//     let totalSecsDiff = 0;
//     let hend;

//     if (mstart.isSame(mend, 'day')) {
//         totalSecsDiff = mend.diff(mstart, 'seconds');
//     } else {
//         while (!mstart.isAfter(mend)) {
//             if (mstart.isSame(mend, 'day')) {
//                 totalSecsDiff += mend.diff(mstart, 'seconds');
//             } else {
//                 let weekday = mstart.weekday();

//                 if (weekday != 0 && weekday != 6) {
//                     hend = moment(mstart.format('YYYY-MM-DD HH:mm:ss'));
//                     hend.set('hour', 17);
//                     hend.set('minute', 00);
//                     hend.set('second', 00);

//                     totalSecsDiff += hend.diff(mstart, 'seconds');
//                 }
//             }

//             mstart = mstart.add(1, 'day');
//             mstart.set('hour', 8);
//             mstart.set('minute', 00);
//             mstart.set('second', 00);
//         }
//     }

//     return totalSecsDiff;
// }