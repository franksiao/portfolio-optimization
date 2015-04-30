define([
	"jquery",
	"underscore"
], function(
	$,
	_
) {
	'use strict';

	var __applyListItemTemplate = _.template(
 		'<li class="list-item-<%= id %>"><a href="#"><%= name %></a></li>'
 	);
	return function SideBar(params) {
		var _$root = $('<ul class="sidebar-nav">');
		var _items = params.items || [];
		var _$idMap = {};
		var _selectedId = _items.length ? _items[0].id : null;
		var _onItemSelected = params.onItemSelected;
		_render();


		function _render() {
			_items.forEach(function (item) {
				var id = item.id;
				var $listItem = $(__applyListItemTemplate(item));

				$listItem.on('click', function () {
					if (!$(this).hasClass('selected')) {
						_selectedId = id;
						_onItemSelected(id);
						_render();
					}
				}).data('id', id).appendTo(_$root);

				if (id === _selectedId) {
					$listItem.addClass('selected');
				}

				_$idMap[id] = $listItem;
			});
		}
		function _setItems(items, idToSet) {
			if (!Array.isArray(items)) {
				throw new Error('The `setItems` method only accepts an array.');
			}

			_items = items;
			if (items.length) {
				if (idToSet) {
					_selectedId = idToSet;
				} else {
					_selectedId = items[0].id;
					_$root.scrollTop(0);
				}
			} else {
				_selectedId = null;
			}
			_render();
		}

		function _setSelected(idToSet) {
			if (_$idMap[idToSet]) {
				_$root.find('li').removeClass('selected');
				_selectedId = idToSet;
				_$idMap[idToSet].addClass('selected');
			}
		}
		function _get$Root() {
			return _$root;
		}
		function _getSelected(type) {
			var type = type || 'id';
			if (type === 'id') {
				return _selectedId;
			} else if (type === 'name') {
				return _$idMap[_selectedId].html();
			}
		}
		function _reset() {
			_$root.empty();
			_items = [];
			_$idMap = {};
		}

		this.getSelected = _getSelected;
		this.get$Root = _get$Root;
		this.setItems = _setItems;
		this.setSelected = _setSelected;
	};
});