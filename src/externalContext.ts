import { TransientPageDataSingleton } from "./transientPageData";

/* Functions
 * For getting information about our url parameters
 * For sending and receving messages with our container.
 *       These messages are currently only being exchanged with the Bloom Reader
 *       app that is showing us in the webview; if we are showing in an iframe in
 *       a browser or Bloom Publish preview, there's no one listening and that's fine.
 */

export function getBookParam(paramName: string): string {
    const vars = {}; // deceptive, we don't change the ref, but do change the content
    //  if this runs into edge cases, try an npm library like https://www.npmjs.com/package/qs
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value;
        return "";
    });
    return vars[paramName];
}

// Ask the parent window, if any, to store this key/value pair persistently.
export function storePageDataExternally(key: string, value: string) {
    // If we're in an iframe, window.parent is the parent window, which may (but
    // probably won't) try to store the data. If we're in a WebView, window.parent
    // is the WebView itself (same as plain 'window') but the React Native code
    // receives the message.
    window.parent.postMessage(
        JSON.stringify({ messageType: "storePageData", key, value }),
        "*" // any window may receive
    );
}

export function reportAnalytics(event: string, params: any) {
    // See storePageDataExternally for why we use window.parent here.
    window.parent.postMessage(
        JSON.stringify({ messageType: "sendAnalytics", event, params }),
        "*"
    );
}

export function onBackClicked() {
    window.parent.postMessage(
        JSON.stringify({ messageType: "backButtonClicked" }),
        "*"
    );
}

// When bloom-player starts up inside Bloom Reader (or other interactive parent) it should pass us
// all the stuff that should be in transientPageData, by posting a message with an object containing
// each of the values we stored as key and the corresponding values as values.
// Note: not yet tested, when we implement this in some parent, probably BR, we may need to fine tune it.
document.addEventListener("message", data => {
    if ((data as any).data.messageType === "restorePageData") {
        TransientPageDataSingleton.setData((data as any).data.pageData);
    }
});
