import jQuery from "jquery";

// https://github.com/ghiculescu/jekyll-table-of-contents
(function($){
  $.fn.toc = function(options) {
    var defaults = {
      noBackToTopLinks: false,
      title: '<i>Jump to...</i>',
      minimumHeaders: 1,
      headers: 'h1, h2, h3, h4, h5, h6',
      listType: 'ol', // values: [ol|ul]
      showEffect: 'show', // values: [show|slideDown|fadeIn|none]
      showSpeed: 'slow', // set to 0 to deactivate effect
      classes: { list: '',
                 item: ''
               }
    },
    settings = $.extend(defaults, options);

    function fixedEncodeURIComponent (str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
    }

    function createLink (header) {
      var innerText = (header.textContent === undefined) ? header.innerText : header.textContent;
      return "<a href='#" + fixedEncodeURIComponent(header.id) + "'>" + innerText + "</a>";
    }

    var headers = $(settings.headers).filter(function() {
      // get all headers with an ID
      var previousSiblingName = $(this).prev().attr( "name" );
      if (!this.id && previousSiblingName) {
        this.id = $(this).attr( "id", previousSiblingName.replace(/\./g, "-") );
      }
      return this.id;
    }), output = $(this);
    if (!headers.length || headers.length < settings.minimumHeaders || !output.length) {
      $(this).hide();
      return;
    }

    if (0 === settings.showSpeed) {
      settings.showEffect = 'none';
    }

    var render = {
      show: function() { output.hide().html(html).show(settings.showSpeed); },
      slideDown: function() { output.hide().html(html).slideDown(settings.showSpeed); },
      fadeIn: function() { output.hide().html(html).fadeIn(settings.showSpeed); },
      none: function() { output.html(html); }
    };

    var get_level = function(ele) { return parseInt(ele.nodeName.replace("H", ""), 10); };
    var highest_level = headers.map(function(_, ele) { return get_level(ele); }).get().sort()[0];
    var return_to_top = '<i class="icon-arrow-up back-to-top"> </i>';

    var level = get_level(headers[0]),
      this_level,
      html = settings.title + " <" +settings.listType + " class=\"" + settings.classes.list +"\">";
    headers.on('click', function() {
      if (!settings.noBackToTopLinks) {
        window.location.hash = this.id;
      }
    })
    .addClass('clickable-header')
    .each(function(_, header) {
      this_level = get_level(header);
      if (!settings.noBackToTopLinks && this_level === highest_level) {
        $(header).addClass('top-level-header').after(return_to_top);
      }
      if (this_level === level) // same level as before; same indenting
        html += "<li class=\"" + settings.classes.item + "\">" + createLink(header);
      else if (this_level <= level){ // higher level than before; end parent ol
        for(var i = this_level; i < level; i++) {
          html += "</li></"+settings.listType+">"
        }
        html += "<li class=\"" + settings.classes.item + "\">" + createLink(header);
      }
      else if (this_level > level) { // lower level than before; expand the previous to contain a ol
        for(i = this_level; i > level; i--) {
          html += "<" + settings.listType + " class=\"" + settings.classes.list +"\">" +
                  "<li class=\"" + settings.classes.item + "\">"
        }
        html += createLink(header);
      }
      level = this_level; // update for the next one
    });
    html += "</"+settings.listType+">";
    if (!settings.noBackToTopLinks) {
      $(document).on('click', '.back-to-top', function() {
        $(window).scrollTop(0);
        window.location.hash = '';
      });
    }

    render[settings.showEffect]();
  };
})(jQuery);


MatestackUiCore.Vue.component('components-toc', {
  mixins: [MatestackUiCore.componentMixin],
  data: function(){
    return {
      offsetTop: undefined,
      sections: {},
    }
  },
  methods: {
    handleScroll (event){
      const self = this;
      // sticky navigation
      if (window.pageYOffset >= this.offsetTop){
        document.querySelector('.components-toc #toc').classList.add('sticky')
      }
      else {
        document.querySelector('.components-toc #toc').classList.remove('sticky')
      }
      // scroll spy
      var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop
      for(var i in self.sections) {
        if(self.sections[i] <= scrollPosition + 50) {
          if(document.querySelector('.components-toc .active')) {
            document.querySelector('.components-toc .active').classList.remove('active');
          }
          if(document.querySelector('.components-toc a[href*=' + i + ']')) {
            document.querySelector('.components-toc a[href*=' + i + ']').classList.add('active');
          }
        }
      }
    }
  },
  mounted(){
    const self = this;
    // setTimeout(function () {
      jQuery('#toc').toc({
        title: '<b class="toc-title">On this page: </b><br><br>',
        listType: 'ul',
        headers: 'h2, h3, h4',
        showEffect: 'none'
       });
    // }, 100);
    this.offsetTop = document.querySelector('.components-toc #toc').offsetTop;
    window.addEventListener('scroll', this.handleScroll);
    var section = document.querySelectorAll(
      '.markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6'
    )
    Array.prototype.forEach.call(section, function(e) {
      self.sections[e.id] = e.offsetTop;
    });
  },
});
