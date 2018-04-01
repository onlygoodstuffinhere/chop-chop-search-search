## Search Web Extension for Firefox

This extension allows users to perform fuzzy search in the address bar on previously visited pages, using bookmarks, browsing history and opened tabs.

#### Usage

Search is performed in the address bar using the keyword ```cc```. You can use additional keywords to restrict results to specific sources :

* ```cc :bkm search terms``` finds results from bookmarked pages
* ```cc :hist``` finds results from browsing history
* ```cc :tab``` finds results from active tabs

It's possible to change what kind of browsing data is used and to customize search keywords in the addon settings page.


#### Build

This pulls dependencies from npm and bundles scritps with webpack.
Run ```npm install``` and ```npm run build``` to build the extension in the dist folder.

