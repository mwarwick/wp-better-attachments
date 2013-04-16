/**
* Updates Sort Order
*/
function wpbaUpdateSortOrder(elem) {
	var $ = jQuery,
			sortLi = elem.find('li'),
			sortOrder = [],
			ajaxData = { 'action' : 'wpba_update_sort_order'},
			saveElem = $('.wpba-saving')
	;
	sortLi.each(function() {
		var that = $(this);
		sortOrder.push(that.data('id'));
	});

	ajaxData.attids = sortOrder;
	saveElem.removeClass('hide');
	$.post(ajaxurl, ajaxData, function(data) {
		saveElem.addClass('hide');
		return false;
	});
}


/**
* Image Sorting Click Handler
*/
function wpbawpbaUpdateSortOrderClickHandler() {
	var $ = jQuery,
			sortableImageElem = $( "#wpba_image_sortable" )
	;
	sortableImageElem.sortable();
	sortableImageElem.disableSelection();
	sortableImageElem.on( "sortupdate", function( e, ui ) {
		wpbaUpdateSortOrder( sortableImageElem );
	});
}


/**
* Unattachs an attachment
*/
function wpbaUnattachAttachment(that) {
	var $ = jQuery,
			sortableImageElem = $( "#wpba_image_sortable" ),
			linkParent = that.parent('li').parent('ul'),
			attachmentId = linkParent.data('id'),
			ajaxData = {
				'action' : 'wpba_unattach_attachment',
				'attachmentid' : attachmentId
			},
			saveElem = $('.wpba-saving')
	;
	saveElem.removeClass('hide');
	$.post(ajaxurl, ajaxData, function(data) {
		var resp = $.parseJSON(data);
		if (resp) {
			linkParent.parent('li').remove();
			wpbaUpdateSortOrder( sortableImageElem );
		}
	});
}


/**
* Unattach Image Click Handler
*/
function wpbawpbaUnattachAttachmentClickHandler() {
	$ = jQuery;
	$('.wpba-unattach').on('click', function(e){
		wpbaUnattachAttachment($(this));
		e.preventDefault();
		return false;
	});
}


/**
* Unattach Library Click Handler
*/
function wpbawpbaUnattachAttachmentLibraryClickHandler() {
	$ = jQuery;
	$('.wpba-unattach-library').on('click', function(e){
		var that = $(this),
				attachmentId = that.data('id'),
				ajaxData = {
					'action' : 'wpba_unattach_attachment',
					'attachmentid' : attachmentId
				};
		$.post(ajaxurl, ajaxData, function(data) {
			var resp = $.parseJSON(data);
			if (resp) {
				$('#post-'+attachmentId+' .reattach').remove();
				$('#post-'+attachmentId+' .unattach').remove();
				$('#post-'+attachmentId+' .view').empty().append('<a href="http://localhost/~mothership/plugin-dev/?attachment_id='+attachmentId+'" title="View “Hello world!”" rel="permalink">View</a>');
				$('#post-'+attachmentId+' .column-parent').empty().append('(Unattached)<br><a class="hide-if-no-js" onclick="findPosts.open' + "( 'media[]','"+attachmentId+"'"+' ); return false;" href="#the-list">Attach</a>');
			}
		});
		e.preventDefault();
		return false;
	});
}


/**
* Deletes and attachment
*/
function wpbaDeleteAttachment(that) {
	var $ = jQuery,
			makeSure = confirm("Are you sure you want to permanently delete this attachment? This will permanently remove the attachment from the media gallery!!"),
			saveElem = $('.wpba-saving'),
			sortableImageElem = $( "#wpba_image_sortable" )
	;
	if ( makeSure ) {
		var linkParent = that.parent('li').parent('ul'),
				attachmentId = linkParent.data('id'),
				ajaxData = {
					'action' : 'wpba_delete_attachment',
					'attachmentid' : attachmentId
				}
		;

		saveElem.removeClass('hide');
		$.post(ajaxurl, ajaxData, function(data) {
			var resp = $.parseJSON(data);
			if (resp) {
				linkParent.parent('li').remove();
				wpbaUpdateSortOrder( sortableImageElem );
			}
			saveElem.addClass('hide');
		});
	}
}


/**
* Delete Attachment Click Handler
*/
function wpbawpbaDeleteAttachmentClickHandler(){
	$ = jQuery;
	$('.wpba-delete').on('click', function(e){
		wpbaDeleteAttachment($(this));
		e.preventDefault();
		return false;
	});
}


/**
* Refresh attachments
*/
function wpbaRefreshAttachments(id) {
	var $ = jQuery,
			ajaxData = {
				action: 'wpba_refresh_attachments',
				postid: $('.wpba').data('postid')
			},
			sortableImageElem = $( "#wpba_image_sortable" )
	;
	$.getJSON(ajaxurl, ajaxData, function(resp){
		sortableImageElem.empty().append(resp);
		wpbaResetClickHandlers();
	});

	return false;
}


/**
* Edit Modal Click Handler
*/
function wpbaEditModalClickHandler() {
	$ = jQuery;
	if($('#wpba_edit_screen').length > 0 ) {
		// Edit Modal Open
		$('.wpba-edit').on('click',function(e){
			var that = $(this);
			attid = wpbaShowEditScreenModal(that);
			e.preventDefault();
			return false;
		});

		// Edit Modal Close
		$('#wpba_edit_screen_close').on('click', function(e){
			var that = $(this);
			wpbaRefreshAttachments(attid);
			$('#wpba_edit_screen').hide();
			e.preventDefault();
			return false;
		});

	} // editmodal
}


/**
* Show Edit Screen Modal
*/
function wpbaShowEditScreenModal(that) {
	var editScreen = $('#wpba_edit_screen'),
		editScreenIframe = editScreen.find('iframe'),
		attid
	;
	// Add the correct edit link to the iframe
	editScreenIframe.attr('src', that.attr('href'));

	// Once the iframe loads add the required css, add click handler, and show editor
	editScreenIframe.load(function() {
		css = '#adminmenuwrap,' +
					'#adminmenuback,' +
					'#wpadminbar,' +
					'#screen-meta-links,' +
					'#wpfooter,' +
					'.add-new-h2 { display: none; }' +
					'#wpcontent { width: 96%; margin: 0 2%; }';
		editScreenIframe.contents().find("head").append($("<style type='text/css'>"+css+"</style>"));
		attid = editScreenIframe.contents().find("#post_ID").val();

		// This will help with the fouc when updating an attachment
		editScreenIframe.contents().find('#publish').on('click', function(){
			editScreenIframe.hide();
			editScreenIframe.load(function() {
				editScreenIframe.contents().find("head").append($("<style type='text/css'>"+css+"</style>"));
				editScreenIframe.show();
			});
		});

		// Show Screen
		editScreen.show();

		return attid;
	});
}


/**
* Update Post Meta
*/
function wpbaUpdatePostMeta(id, key, value, prev)
{
	var $ = jQuery,
			prev = ( prev != undefined) ? prev : false;
			ajaxData = {
				action: 'wpba_update_post_meta',
				//  'custom_meta_fields': $meta_fields_array
				//  wpba_nonce : '',
				meta_key:	key,
				meta_value:	value,
				prev_value:	prev
			}
	;

	$.post(ajaxurl, ajaxData, function(resp){
		console.log(resp);
	});
}

/**
* Update Post Meta
*/
function wpbaUpdatePostMetaClickHandler()
{
	$('wpba-post-meta').on('change', function(){
		// wpbaUpdatePostMeta();
	});
}


/**
* Reset Click Handlers
*/
function wpbaResetClickHandlers() {
	wpbawpbaUpdateSortOrderClickHandler();
	wpbawpbaUnattachAttachmentClickHandler();
	wpbawpbaUnattachAttachmentLibraryClickHandler();
	wpbawpbaDeleteAttachmentClickHandler();
	wpbaEditModalClickHandler();
	wpbaUpdatePostMetaClickHandler();
}