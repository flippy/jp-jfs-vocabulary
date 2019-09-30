let test_words = [];
let text_word_index = 0;
var selected_language = 'en';
let lang_first = 'de';
let words_set = [];
let translation_visible = 0;
for (let lesson_count = 0; lesson_count < lessons.length; lesson_count++) {
  words_set = words_set.concat(lessons[lesson_count].vocabulary);
}
// var mistake_count = 0;
 
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getAllowedValues(meaning) {
  let allowed_values = $.map(meaning.toLowerCase().split(','), $.trim);
  allowed_values.forEach(function(allowed_value) {
    // Special case: bracket answers.
    if (allowed_value.indexOf('(') > -1) {
      allowed_values.push($.trim(allowed_value.replace(/ *\([^)]*\) */g, "")));
      allowed_values.push(allowed_value.replace(/[{()}]/g, ''));
    }

    // Special case: or.
    if (allowed_value.indexOf(' or ') > -1) {
      allowed_values = allowed_values.concat(allowed_value.split(' or '));
    }

    // Special case: answers containing a minus.
    if (allowed_value.indexOf('-') > -1) {
      allowed_values.push(allowed_value.replace(/-/g, ''));
    }
  });

  return allowed_values.filter(function (allowed_value) {
    return allowed_value !== "";
  });
}

let lesson_selection_content = '<input type="checkbox" class="lesson-mass-selection-checkbox" value="mass-lessons" /><span class="lesson-mass-selection-label">Select all lessons</span><div class="lesson-mass-selection-container">';
for (let lesson_count = 0; lesson_count < lessons.length; lesson_count++) {
  lesson_selection_content += '<input type="checkbox" class="lesson-selection-checkbox" value="' + lesson_count + '" />' + lessons[lesson_count].title + ' (' + lessons[lesson_count].vocabulary.length  + ' words)<span class="learn-words"></span><br />';
}
lesson_selection_content += '</div>';

$('.lesson-selection').append(lesson_selection_content);
$('.lesson-mass-selection-checkbox').change(function() {
  $(this).nextAll('.lesson-mass-selection-container').first().children('.lesson-selection-checkbox').prop('checked', $(this).is(':checked'));
});
 
$('#start-test-button').click(function() {
  var selected_boxes = $('.lesson-selection-checkbox:checked');
  // Use all lessons in case none has been selected.
  if (selected_boxes.length === 0) {
    selected_boxes = $('.lesson-selection-checkbox');
  }
  
  // Start the test.
  let selected_words = [];
  selected_boxes.each(function() {
    let start_id = parseInt($(this).val());
    selected_words = selected_words.concat(lessons[start_id].vocabulary);
  });
  test_words = shuffle(selected_words);
  text_word_index = 0;

  // Update the Word-counts.
  $('.remaining-word-max, .remaining-word-count').text(test_words.length);

  // Display the first item.
  setTranslationVisible(0);
  $('#word-display-container-de .word-display-content').html(test_words[0].de.replace(/%u/g, '&#x'));
  $('#word-display-container-jp .word-display-content').html(test_words[0].jp.replace(/%u/g, '&#x'));
  $('.word-display-container, .word-navigation, .ask-later-button').show();
});

// Next word / display translation.
$('#next-word-button').click(function() {
  if (translation_visible) {
    if ((text_word_index + 1) < test_words.length) {
      text_word_index++;
      $('.remaining-word-count').text(test_words.length - text_word_index);
      $('#word-display-container-de .word-display-content').html(test_words[text_word_index].de.replace(/%u/g, '&#x'));
      $('#word-display-container-jp .word-display-content').html(test_words[text_word_index].jp.replace(/%u/g, '&#x'));
    }
    else {
      $('.remaining-word-count').text(0);
      return;
    }
  }

  setTranslationVisible(!translation_visible);
});

// Previous word.
$('#prev-word-button').click(function() {
  setTranslationVisible(0);

  if (text_word_index > 0) {
    text_word_index--;
    $('#word-display-container-de .word-display-content').html(test_words[text_word_index].de.replace(/%u/g, '&#x'));
    $('#word-display-container-jp .word-display-content').html(test_words[text_word_index].jp.replace(/%u/g, '&#x'));
    $('.remaining-word-count').text(test_words.length - text_word_index);
  }
});

let setTranslationVisible = function(visible) {
  translation_visible = visible;
  $('#word-display-container-' + (lang_first === 'de' ? 'jp' : 'de') + ' .word-display-content').toggle(!!visible);
};

$('.lesson-selection-toggle').click(function() {
  $('.lesson-selection').slideToggle();
  $(this).text($(this).text() === 'Open lesson selection' ? 'Close lesson selection' : 'Open lesson selection')
});

$('.learn-words').click(function() {
 var learn_overlay = $('#learn-overlay');
 var lesson_id = parseInt($(this).prev().val());

 // Clear the table and add the new words to the table.
 var table_body = $('#learn-overlay-table tbody');
 let vocabulary = lessons[lesson_id].vocabulary;
 table_body.empty();
 for (var word_count = 0; word_count < vocabulary.length; word_count++) {
   table_body.append('<tr><td>' + vocabulary[word_count].jp.replace(/%u/g, '&#x') + '</td><td>' + words_set[word_count].de + '</td></tr>');
 }

 // Show the overlay.
 learn_overlay.show();
});

var search_ac = $('.word-search-box').autocomplete({
  minLength: 2,
  source: function(request, response) {
    var search_trimmed = $.trim(request.term.toLowerCase());

    var result_words = [];
    if (search_trimmed.length > 0) {
      for (var word_count = 0; word_count < words_set.length; word_count++) {
        var allowed_values = [];
        allowed_values = allowed_values.concat(getAllowedValues(words_set[word_count].de));
        allowed_values = allowed_values.concat(getAllowedValues(unescape(words_set[word_count].jp)));
        for (var value_count = 0; value_count < allowed_values.length; value_count++) {
          if (allowed_values[value_count].includes(search_trimmed)) {
            result_words.push(words_set[word_count]);
            break;
          }
        }
        if (result_words.length >= 10) {
          break;
        }
      }
    }

    response(result_words);
  },
  focus: function( event, ui ) {
    event.preventDefault();
    return false;
  },
  select: function( event, ui ) {
    event.preventDefault();
    return false;
  },
  open: function(event, ui) {
    $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
  }
}).autocomplete("instance");
search_ac._renderMenu = function(ul, items) {
  let self = this;
  //table definitions
  ul.append('<table class="word-search-table"><thead><tr><th>Japanese</th><th>German</th></tr></thead><tbody></tbody></table>');
  $.each( items, function( index, item ) {
    self._renderItemData(ul, ul.find("table tbody"), item );
  });
};
search_ac._renderItemData = function(ul, table, item) {
  return this._renderItem( table, item ).data( "ui-autocomplete-item", item );
};
search_ac._renderItem = function( table, item ) {
  var row_html ='<td>' + item.jp.replace(/%u/g, '&#x') + '</td><td>' + item.de + '</td>';
  return $( "<tr class='ui-menu-item' role='presentation'></tr>" )
    .append(row_html)
    .appendTo( table );
};

// Hide the overlay on click.
$('body').delegate('#learn-overlay', 'click', function(e) {
  if (e.target.id === 'learn-overlay') {
    $(this).hide();
  }
});

$('.direction-selection').click(function() {
  // Show the current translation.
  setTranslationVisible(1);
  
  let dir_select = $('.lang-direction');
  if (lang_first === 'de') {
    lang_first = 'jp';
    dir_select.html('&larr;');
    $('.word-display').append($('#word-display-container-de'));
  }
  else {
    lang_first = 'de';
    dir_select.html('&rarr;');
    $('.word-display').append($('#word-display-container-jp'));
  }
  
  $('.remaining-word-count').text(test_words.length - text_word_index);
  
  // Hide the new translation.
  setTranslationVisible(0);
});

// Remember a word an ask for it again at the end.
$('.ask-later-button').click(function() {
  if (JSON.stringify(test_words[text_word_index]) !== JSON.stringify(test_words[test_words.length - 1]) ) {
    test_words.push(test_words[text_word_index]);
    $('.remaining-word-max').text(test_words.length);
    $('.remaining-word-count').text(test_words.length - text_word_index);
  }
});

// React on button presses.
document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 37:
      if (test_words.length > 0) {
        $('#prev-word-button').click();
      }
      break;
    case 39:
      if (test_words.length > 0) {
        $('#next-word-button').click();
      }
      break;
  }
};

// React on Swipe.
$(document).touchwipe({
  wipeLeft: function() {
    if (test_words.length > 0) {
      $('#next-word-button').click();
    }
  },
  wipeRight: function() {
    if (test_words.length > 0) {
      $('#prev-word-button').click();
    }
  },
  wipeUp: function() { },
  wipeDown: function() { },
  min_move_x: 20,
  min_move_y: 20,
  preventDefaultEvents: true
});

