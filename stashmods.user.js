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

	function addTags() {
		var tbl = $('table.commits-table');
		if (!tbl.length) return;
		$.get(apibase+'/tags', function(tagdata) {
			var lookup = {};
			for (var i=0,s=tagdata.values.length; i<s; i++) {
				var sha = tagdata.values[i].latestChangeset;
				lookup[sha] = lookup[sha] || [];
				lookup[sha].push(tagdata.values[i].displayId);
			}
			var observer = new MutationObserver(modTable);
			modTable();

			function modTable() {
				console.log('Stashmods Chrome extension: Modifying commit table');
				observer.disconnect();
				$('.ft-tag').remove();
				tbl.find('.commit-row').each(function() {
					var sha = $(this).find('.changesetid').attr('href').replace(/^.*\/(\w+)\/?$/, '$1');
				console.log('Stashmods Chrome extension: sha: ' + sha);
					if (lookup[sha]) {
						var tagSpan = $(this).find('.message .tag');
						if (tagSpan && tagSpan.length) tagSpan = tagSpan[0];
				console.log('Stashmods Chrome extension: tagSpan: ' + tagSpan.outerHTML);
						tagSpan.innerHTML = '<span class="aui-icon aui-icon-small aui-iconfont-devtools-tag-small"></span>';
						lookup[sha].forEach(function _add(tag) {
							tagSpan.innerHTML += '<a href="/projects/' + project + '/repos/' + repo + '/commits?until=' + tag + '" data-id="refs/tags/' + tag + '" data-csid="' + sha + '">' + tag + '</a>';
						});
					}
				});
				observer.observe(tbl.get(0), {subtree: true, childList: true});
			}
		});
	}

	function addRedmineLinks() {
		var commitMsgs = document.querySelectorAll('.commit-message, .commit-row .message, h2.title, .branch .name');

		for (var i = 0, l = commitMsgs.length; i < l; i++) {
			var msg = commitMsgs[i];
			msg.innerHTML = msg.innerHTML.replace(/(redmine\s*#?(\d+))/ig, '<a href="https://redmine.labs.ft.com/issues/$2">$1</a>')
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
