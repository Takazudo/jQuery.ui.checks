/*!
 * checks collection
 *
 * @author    : Takeshi Takatsudo (takazudo[at]gmail.com)
 * @copyright : Takeshi Takatsudo
 * @license   : The MIT License
 * @link      : http://.....
 * @modified  : 2011/04/26 HH:MM:SS
 *
 * some comments here
 */
(function($, window, document, undefined){

/**
 * browser sinffing
 * http://james.padolsey.com/javascript/detect-ie-in-js-using-conditional-comments/
 */
(function(){
	var ie = (function(){
		var v = 3, div = document.createElement('div');
		function check(){
			div.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->';
			return div.getElementsByTagName('i')[0] ? true : false;
		}
		while (check()) { v++; }
		return v > 4 ? v : undefined;
	}());
	$.browser.ie = (ie !== undefined);
	$.browser.ie6 = (ie === 6);
	$.browser.ielt7 = (ie < 7);
	$.browser.ie7 = (ie === 7);
	$.browser.ielt8 = (ie < 8);
	$.browser.ie8 = (ie === 8);
	$.browser.ielt9 = (ie < 9);
	$.browser.ie9 = (ie === 9);
})();

/**
 * html element hadles
 */
(function(){
	var $html = $('html');
	if($.browser.ielt9){ $html.addClass('browser-ielt9'); }
})();

/**
 * ui.decochecker
 */
$.widget('ui.decochecker', {
	_checked: false,
	_disabled: false,
	_val: null,
	_create: function(){
		this.widgetEventPrefix = 'decochecker.';
		var $el = this._$el = this.element;
		this._$checkbox = $(':checkbox', $el);
		this._val = this._$checkbox.val();
		this._eventify();
		this._handleCheckChange(true); // handle initial stats
	},
	_eventify: function(){
		var self = this;
		if($.browser.ielt9){
			/* ie cant handle img click in the label... */
			self._$el.delegate('label img', 'click', function(){
				self._$checkbox.trigger('click');
				self._handleCheckChange(false);
			});
		}
		self._$checkbox.click(function(){
			self._handleCheckChange(false);
		});
	},
	_handleCheckChange: function(initialCheck){
		if(this._$checkbox.is(':checked')){
			this.check(initialCheck || false);
		}else{
			this.uncheck(initialCheck || false);
		}
		this._handleStateCls();
	},
	_handleStateCls: function(){
		if(this._checked){
			this._$el
				.addClass('ui-decochecker-state-checked')
				.removeClass('ui-decochecker-state-unchecked');
		}else{
			this._$el
				.addClass('ui-decochecker-state-unchecked')
				.removeClass('ui-decochecker-state-checked');
		}
	},
	check: function(noEventTrigger){
		if(this._checked){
			return;
		}
		this._checked = true;
		this._$checkbox.prop('checked', true);
		this._handleStateCls();
		if(!noEventTrigger){
			this._trigger('check');
		}
	},
	uncheck: function(noEventTrigger){
		if(!this._checked){
			return;
		}
		this._checked = false;
		this._$checkbox.prop('checked', false);
		this._handleStateCls();
		if(!noEventTrigger){
			this._trigger('uncheck');
		}
	},
	val: function(){
		return this._val;
	},
	isChecked: function(){
		return this._checked;
	},
	isDisabled: function(){
		return this._disabled;
	},
	disable: function(){
		this._$checkbox.prop('disabled', true);
		this._disabled = true;
		this._$el.addClass('ui-decochecker-state-disabled');
	},
	enable: function(){
		this._$checkbox.prop('disabled', false);
		this._disabled = false;
		this._$el.removeClass('ui-decochecker-state-disabled');
	}
});

/**
 * ui.allchecker
 */
$.widget('ui.allchecker', {
	_create: function(){
		var $el = this._$el = this.element.decochecker();
		var val = this._val = $el.attr('data-allchecker-value');
		var selector = '#' + $el.attr('data-allchecker-target');

		/* find my target inputs */
		var $checks = this._$checks = $(selector).find('.ui-decochecker', $el)
			.decochecker()
			.filter(function(){
				return ( $(this).decochecker('val') === val );
			});

		this._eventify();
		this._evalCheckStats();
	},
	_eventify: function(){
		var self = this;
		self._$checks
			.bind('decochecker.check decochecker.uncheck', function(){
				self._evalCheckStats();
			});
		self._$el
			.bind('decochecker.check', function(){
				self._$checks.decochecker('check');
			})
			.bind('decochecker.uncheck', function(){
				self._$checks.decochecker('uncheck');
			});
	},
	_evalCheckStats: function(){
		if(this._allChecked()){
			this._$el.decochecker('check', true);
		}else{
			this._$el.decochecker('uncheck', true);
		}
	},
	_allChecked: function(){
		var ret = true;
		this._$checks.each(function(){
			if( !$(this).decochecker('isChecked') ){
				ret = false;
				return false;
			}
		});
		return ret;
	},
	_allUnchecked: function(){
		var ret = true;
		this._$checks.each(function(){
			if( $(this).decochecker('isChecked') ){
				ret = false;
				return false;
			}
		});
		return ret;
	}
});

/**
 * ui.decoradio
 */
$.widget('ui.decoradio', {
	options: {
		clickrelease: false
	},
	_checked: false,
	_wrapperCheckedCheck: false,
	_create: function(){
		this.widgetEventPrefix = 'decoradio.';
		var $el = this._$el = this.element;
		this._$radio = $(':radio', $el);
		this._eventify();
		this._handleCheckChange(true); // handle initial stats
	},
	_eventify: function(){
		var self = this;
		self._$el.click(function(){
			self._wrapperCheckedCheck = self._$radio.is(':checked');
		});
		self._$radio.click(function(){
			self._handleCheckChange(false);
		});
	},
	_handleCheckChange: function(initialCheck){
		var self = this;
		if(initialCheck && self._$el.attr('data-decoradio-state')==='checked'){
			self._$radio.prop('checked', true);
		}
		if(self._$radio.is(':checked')){
			if(self.options.clickrelease && self._wrapperCheckedCheck){
				self.uncheck();
			}else{
				self._$el.addClass('ui-decoradio-state-checked');
				if(!initialCheck){
					self._trigger('check', {}, {
						val: self._$radio.val()
					});
				}
				self._checked = true;
			}
		}else{
			self._$el.removeClass('ui-decoradio-state-checked');
			if(!initialCheck){
				self._trigger('uncheck');
			}
			self._checked = false;
		}
	},
	uncheck: function(){
		if(this._checked){
			this._checked = false;
			this._$el.removeClass('ui-decoradio-state-checked');
			this._$radio.prop('checked', false);
			this._trigger('uncheck');
		}
	}
});

/**
 * ui.decoradioset
 */
$.widget('ui.decoradioset', {
	options: {
		clickrelease: false
	},
	_create: function(){
		this.widgetEventPrefix = 'decoradioset.';
		var $el = this._$el = this.element;
		this._$radios = $('.ui-decoradio', $el).decoradio({
			clickrelease: this.options.clickrelease
		});
		this._eventify();
	},
	_eventify: function(){
		var self = this;
		var $radios = self._$radios;
		$radios.bind('decoradio.check', function(){
			var $selected = $(this);
			$radios.not($selected).decoradio('uncheck');
		});
		this._$el.delegate('.ui-decoradioset-unchecker', 'click', function(e){
			e.preventDefault();
			self.uncheckall();
		}).delegate(':ui-decoradio', 'decoradio.check', function(e, data){
			self._trigger('check', e, data);
		}).delegate(':ui-decoradio', 'decoradio.uncheck', function(e){
			self._trigger('uncheck', e);
		})
	},
	uncheckall: function(){
		this._trigger('uncheckall');
		this._$radios.decoradio('uncheck');
	}
});

})(jQuery, this, this.document);
