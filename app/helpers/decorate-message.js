import Ember from 'ember';

function escapeHtml (text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function replaceMentions (text) {
    return text.replace(/(@\w+)/g, '<span class="mention">$1</span>');
}

function replaceLinks (text) {
    var link = /((http|https|ftp)\:\/\/|\bw{3}\.)[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z\u00C0-\u017F0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*/gi;
    return text.replace(link, function (str) {
        return '<a href="' + str + '" target="_blank">' + str + '</a>';
    });
}

export default function (path, data) {
    var view = data.contexts.objectAt(0);
    var text = escapeHtml(view.get(path));
    text = replaceMentions(text);
    text = replaceLinks(text);
    return new Ember.Handlebars.SafeString(text);
}
