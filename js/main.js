let test_words = [];
var selected_language = 'en';
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
  $(this).nextAll('.lesson-mass-selection-container').first().children('.lesson-selection-checkbox').attr('checked', $(this).is(':checked'));
});

/*var lesson_selection_content = '';
for (var word_count = 0; word_count < kanjis.length; word_count++) {
 if (word_count % 10 == 0) {
   if (word_count % 100 == 0) {
     if (lesson_selection_content.length > 0) {
       lesson_selection_content += '</div>';
     }
     lesson_selection_content += '<br /><input type="checkbox" class="lesson-mass-selection-checkbox" value="mass-' + word_count + '" /><span class="lesson-mass-selection-label">Kanji ' + (word_count + 1) + ' - ' + (((word_count + 100) < kanjis.length) ? (word_count + 100) : kanjis.length)  + '</span><div class="lesson-mass-selection-container">';
   }
   lesson_selection_content += '<input type="checkbox" class="lesson-selection-checkbox" value="' + word_count + '" />Kanji ' + (word_count + 1) + ' - ' + (((word_count + 10) < kanjis.length) ? (word_count + 10) : kanjis.length) + '<span class="learn-words"></span><br />';
 }
}
lesson_selection_content += '</div>';
$('.lesson-selection').append(lesson_selection_content);

$('.lesson-mass-selection-checkbox').change(function() {
  $(this).nextAll('.lesson-mass-selection-container').first().children('.lesson-selection-checkbox').attr('checked', $(this).is(':checked'));
});*/
 
$('#start-test-button').click(function() {
  var selected_boxes = $('.lesson-selection-checkbox:checked');
  if (selected_boxes.length === 0) {
    alert('Please select at least one lesson first.');
  }
  // Start the test.
  else {
    let selected_words = [];
    selected_boxes.each(function() {
      let start_id = parseInt($(this).val());
      selected_words = selected_words.concat(lessons[start_id].vocabulary);
    });
    test_words = shuffle(selected_words);

    // Clear the history.
    // $('.kanji-history-list').empty();

    // Update the Kanji-counts.
    $('.remaining-word-max, .remaining-word-count').text(test_words.length);

    // Unset the mistake count.
    /*mistake_count = 0;
    $('.remaining-word-mistakes-count').text(mistake_count);*/

    // Display the first item.
    setTranslationVisible(0);
    $('#word-display-container-de .word-display-content').html(test_words[0].de.replace(/%u/g, '&#x'));
    $('#word-display-container-jp .word-display-content').html(test_words[0].jp.replace(/%u/g, '&#x'));
    $('.word-display-container, .word-navigation').show();
  }
});

$('#next-word-button').click(function() {
  if (translation_visible) {
    test_words.shift();
    $('.remaining-word-count').text(test_words.length);

    if (test_words.length > 0) {
      $('#word-display-container-de .word-display-content').html(test_words[0].de.replace(/%u/g, '&#x'));
      $('#word-display-container-jp .word-display-content').html(test_words[0].jp.replace(/%u/g, '&#x'));
    }
    else {
      alert('Test done!');
      return;
    }
  }

  setTranslationVisible(!translation_visible);
});

let setTranslationVisible = function(visible) {
  translation_visible = visible;
  $('#word-display-container-jp .word-display-content').toggle(!!visible);
};

$('.lesson-selection-toggle').click(function() {
  $('.lesson-selection').slideToggle();
  $(this).text($(this).text() === 'Open lesson selection' ? 'Close lesson selection' : 'Open lesson selection')
});

/*$("#answer-textbox").on('keyup', function (e) {
   if (e.keyCode == 13 && test_words.length > 0) {
     var answer = $(this).val();
     $(this).val('');

     var old_kanji = test_words.shift();

     var answer_trimmed = $.trim(answer.toLowerCase());
     var history_item_class = '';
     var history_item_suffix = '';
     var answer_correct = ($.inArray(answer_trimmed, getAllowedValues(old_kanji.meaning)) !== -1 || $.inArray(answer_trimmed, getAllowedValues(unescape(old_kanji.kun.length > 0 ? old_kanji.kun : old_kanji.on))) !== -1);
     // Correct answer.
     if (answer_correct) {
       $('.remaining-word-count').text(test_words.length);
       history_item_class = 'kanji-history-item-correct';
     }
     // Wrong answer.
     else {
       history_item_class = 'kanji-history-item-wrong';
       // Add the wrong kanji again and shuffle the list.
       test_words.push(old_kanji);
       test_words = shuffle(test_words);

       // Check for which kanji the user mistook the current one.
       for (var word_count = 0; word_count < words_set.length; word_count++) {
         if ($.inArray(answer_trimmed, getAllowedValues(words_set[word_count].meaning)) !== -1 || $.inArray(answer_trimmed, getAllowedValues(unescape(words_set[word_count].kun.length > 0 ? words_set[word_count].kun : words_set[word_count].on))) !== -1) {
           history_item_suffix = '<br /><span class="kanji-history-item-mistake">(mistaken for ' + words_set[word_count].kanji.replace('%u', '&#x') + '; - ' + words_set[word_count].meaning + ' &rarr; ' + (words_set[word_count].kun.length > 0 ? words_set[word_count].kun.replace(/%u/g, '&#x') : '<span class="kanji-on">' + words_set[word_count].on.replace(/%u/g, '&#x') + '</span>') + ')</span>';
           break;
         }
       }

       // Update the mistake count.
       mistake_count++;
       $('.remaining-word-mistakes-count').text(mistake_count);
     }
     $('#answer-status').attr('class', history_item_class.replace('kanji-history-item-', 'answer-'));

     // Create a new item for the history.
     var new_item = '<div class="kanji-history-item ' + history_item_class + '">' + old_kanji.kanji.replace('%u', '&#x') + '; - ' + old_kanji.meaning + ' &rarr; ' + (old_kanji.kun.length > 0 ? old_kanji.kun.replace(/%u/g, '&#x') : '<span class="kanji-on">' + old_kanji.on.replace(/%u/g, '&#x') + '</span>') + history_item_suffix + '</div>';

     // Add the history item to the start of the list.
     var history_items = $('#kanji-history-list-all .kanji-history-item');
     if (history_items.length >= 10) {
       history_items.last().remove();
     }
     $('#kanji-history-list-all').prepend(new_item);

     // On errors also add it to the error list.
     if (!answer_correct) {
       history_items = $('#kanji-history-list-errors .kanji-history-item');
       if (history_items.length >= 10) {
         history_items.last().remove();
       }
       $('#kanji-history-list-errors').prepend(new_item);
     }

     if (test_words.length > 0) {
       $('.word-display').html(test_words[0].kanji.replace('%u', '&#x') + ';');
     }
     else {
       alert('Test done!');
     }
   }
});

$('.language-switcher-lang').click(function() {
 if (!$(this).hasClass('active')) {
   $('.language-switcher-lang').toggleClass('active');
   selected_language = $(this).data('lang');
   if (selected_language === 'en') {
     words_set = kanjis.map(a => Object.assign({}, a));
   }
   // German.
   else {
     words_set = kanjis_de.map(a => Object.assign({}, a));
   }
 }
});*/

$('.learn-words').click(function() {
 var learn_overlay = $('#learn-overlay');
 var lesson_id = parseInt($(this).prev().val());

 // Clear the table and add the new kanjis to the table.
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

/*$('.history-area-tabs').tabs({
  'classes': {
    "ui-tabs": "ui-corner-all",
    "ui-tabs-nav": "ui-corner-all",
    "ui-tabs-tab": "ui-corner-all",
    "ui-tabs-panel": "ui-corner-all"
  }
});*/

// Hide the overlay on click.
$('body').delegate('#learn-overlay', 'click', function() {
  $(this).hide();
});

