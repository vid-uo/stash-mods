function main() {

	var project = location.pathname.replace(/^\/projects\/(\w+)\/repos\/([\w\-]+)(\/.*)?$/, '$1');
	var repo = location.pathname.replace(/^\/projects\/(\w+)\/repos\/([\w\-]+)(\/.*)?$/, '$2');
	var apibase = '/rest/api/1.0/projects/' + project + '/repos/' + repo;
	var $ = jQuery;

	/* Keep me logged in! */

	// Load the account page once every 2 minutes
	setInterval(function() {
		$.get('/account');
	}, 120000);

	function getTagData(start, callback) {
		$.get(apibase+'/tags?start=' + start, function(tagdata) {
			callback(tagdata);
		});
	}

	function getTags(callback) {
		var values = [],
			tags = [];

		getTagData(0, function _processTagData(callback, tagdata) {
			values = values.concat(tagdata.values);
			if (tagdata.isLastPage || !tagdata.nextPageStart) {
				for (var i=0,s=values.length; i<s; i++) {
					var sha = values[i].latestChangeset;
					tags[sha] = tags[sha] || [];
					tags[sha].push(values[i].displayId);
				}
				callback(tags);
			} else {
				getTagData(tagdata.nextPageStart, _processTagData.bind(this, callback));
			}
		}.bind(this, callback));
	}

	function addTags() {
		var tbl = $('table.commits-table');
		if (!tbl.length) return;
		var observer = new MutationObserver(modTable);
		getTags(modTable);

		function modTable(tags) {
			console.log('Stashmods Chrome extension: Modifying commit table with tags:', tags);
			observer.disconnect();
			$('.ft-tag').remove();
			tbl.find('.commit-row').each(function() {
				var sha = $(this).find('.changesetid').attr('href').replace(/^.*\/(\w+)\/?$/, '$1');
				if (tags[sha]) {
					var tagSpan = $(this).find('.message .tag');
					if (tagSpan && tagSpan.length) tagSpan = tagSpan[0];
					tagSpan.innerHTML = '';
					tags[sha].forEach(function _add(tag) {
						tagSpan.innerHTML += '<span class="aui-icon aui-icon-small aui-iconfont-devtools-tag-small"></span><a href="/projects/' + project + '/repos/' + repo + '/commits?until=' + tag + '" data-id="refs/tags/' + tag + '" data-csid="' + sha + '">' + tag + '</a>';
					});
				}
			});
			observer.observe(tbl.get(0), {subtree: true, childList: true});
		}
	}

	function addRedmineLinks() {
		var commitMsgs = document.querySelectorAll('.commit-message, .commit-row .message, h2.title, .branch .name');

		for (var i = 0, l = commitMsgs.length; i < l; i++) {
			var msg = commitMsgs[i];
			msg.innerHTML = msg.innerHTML.replace(/(redmine-?\s*#?(\d+))/ig, '<a href="https://redmine.labs.ft.com/issues/$2">$1</a>');
		}
	}

	function removeAuthorNames() {
		var observer = new MutationObserver(avatarOnly);
		avatarOnly();
		function avatarOnly() {
			observer.disconnect();
			$('th.author').empty();
			$('.avatar-with-name > .aui-avatar').each(function() {
				$(this).parent().find('.secondary-link').empty().append(this);
			});
			observer.observe(document.body, {subtree: true, childList: true});
		}
	}

	$(function() {

		// Add tags to commit view
		addTags();

		// Convert Redmine references to links
		addRedmineLinks();

		// Remove author names - avatars are sufficient
		removeAuthorNames();
	});
}

// Run the script in the main document context, not in the extension sandbox
var scriptNode = document.createElement('script');
var target = document.getElementsByTagName('head')[0] || document.body || document.documentElement;

scriptNode.type = "text/javascript";
scriptNode.textContent = '(' + main.toString() + ')()';

target.appendChild(scriptNode);
